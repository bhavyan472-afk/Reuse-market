-- =============================================================================
-- ReUse Market — initial schema
-- Tables: profiles, listings, listing_images, favorites, conversations,
--         messages, reports
-- Includes: enums, indexes, full-text search, triggers, RPC functions,
--           Row Level Security, realtime publication, storage bucket + policies
-- Run once in the Supabase SQL editor (or `supabase db push`).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type public.listing_status as enum ('available', 'sold');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.listing_condition as enum ('new', 'like_new', 'good', 'fair');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.listing_category as enum (
    'books', 'laptops', 'mobiles', 'bicycles', 'calculators',
    'furniture', 'electronics', 'clothing', 'others'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_reason as enum (
    'spam', 'scam', 'prohibited', 'wrong_category', 'offensive', 'other'
  );
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Great-circle distance in kilometres (Haversine).
create or replace function public.haversine_km(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
)
returns double precision
language sql
immutable
parallel safe
set search_path = ''
as $$
  select 2 * 6371.0088 * asin(least(1.0, sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    power(sin(radians(lng2 - lng1) / 2), 2)
  )));
$$;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  full_name        text not null default '' check (char_length(full_name) <= 80),
  avatar_url       text check (avatar_url is null or char_length(avatar_url) <= 1000),
  phone            text check (phone is null or phone ~ '^\+?[0-9]{8,15}$'),
  college          text check (college is null or char_length(college) <= 120),
  bio              text check (bio is null or char_length(bio) <= 500),
  location_address text check (location_address is null or char_length(location_address) <= 300),
  city             text check (city is null or char_length(city) <= 100),
  lat              double precision check (lat is null or lat between -90 and 90),
  lng              double precision check (lng is null or lng between -180 and 180),
  email_verified   boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email_verified)
  values (
    new.id,
    left(coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ), 80),
    new.raw_user_meta_data ->> 'avatar_url',
    new.email_confirmed_at is not null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep the verified-email badge in sync.
create or replace function public.handle_user_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
     set email_verified = new.email_confirmed_at is not null
   where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function public.handle_user_email_confirmed();

-- -----------------------------------------------------------------------------
-- listings
-- -----------------------------------------------------------------------------
create table if not exists public.listings (
  id              uuid primary key default gen_random_uuid(),
  seller_id       uuid not null references public.profiles (id) on delete cascade,
  title           text not null check (char_length(title) between 3 and 100),
  description     text not null check (char_length(description) between 10 and 3000),
  category        public.listing_category not null,
  price           integer not null check (price between 0 and 10000000),
  condition       public.listing_condition not null,
  status          public.listing_status not null default 'available',
  address         text not null check (char_length(address) between 2 and 300),
  city            text not null check (char_length(city) between 1 and 100),
  lat             double precision not null check (lat between -90 and 90),
  lng             double precision not null check (lng between -180 and 180),
  views           integer not null default 0,
  favorites_count integer not null default 0,
  reports_count   integer not null default 0,
  is_hidden       boolean not null default false,
  sold_at         timestamptz,
  search          tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists listings_category_idx   on public.listings (category);
create index if not exists listings_price_idx      on public.listings (price);
create index if not exists listings_status_idx     on public.listings (status);
create index if not exists listings_lat_lng_idx    on public.listings (lat, lng);
create index if not exists listings_created_at_idx on public.listings (created_at desc);
create index if not exists listings_seller_idx     on public.listings (seller_id);
create index if not exists listings_search_idx     on public.listings using gin (search);

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- Maintain sold_at automatically.
create or replace function public.listings_track_sold()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'sold' and (tg_op = 'INSERT' or old.status is distinct from 'sold') then
    new.sold_at = now();
  elsif new.status = 'available' then
    new.sold_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists listings_track_sold on public.listings;
create trigger listings_track_sold
  before insert or update of status on public.listings
  for each row execute function public.listings_track_sold();

-- Abuse protection: max 15 new listings per user per hour.
create or replace function public.listings_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*) from public.listings
     where seller_id = new.seller_id
       and created_at > now() - interval '1 hour'
  ) >= 15 then
    raise exception 'RATE_LIMITED: You are creating listings too quickly. Please try again later.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists listings_rate_limit on public.listings;
create trigger listings_rate_limit
  before insert on public.listings
  for each row execute function public.listings_rate_limit();

-- -----------------------------------------------------------------------------
-- listing_images
-- -----------------------------------------------------------------------------
create table if not exists public.listing_images (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references public.listings (id) on delete cascade,
  url          text not null check (char_length(url) <= 1000),
  storage_path text check (storage_path is null or char_length(storage_path) <= 500),
  position     smallint not null default 0 check (position between 0 and 5),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists listing_images_listing_idx on public.listing_images (listing_id, position);

drop trigger if exists listing_images_set_updated_at on public.listing_images;
create trigger listing_images_set_updated_at
  before update on public.listing_images
  for each row execute function public.set_updated_at();

-- Abuse protection: at most 6 images per listing.
create or replace function public.listing_images_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.listing_images where listing_id = new.listing_id) >= 6 then
    raise exception 'IMAGE_LIMIT: A listing can have at most 6 images.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists listing_images_limit on public.listing_images;
create trigger listing_images_limit
  before insert on public.listing_images
  for each row execute function public.listing_images_limit();

-- -----------------------------------------------------------------------------
-- favorites
-- -----------------------------------------------------------------------------
create table if not exists public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index if not exists favorites_listing_idx on public.favorites (listing_id);

-- Keep listings.favorites_count accurate (sellers can see how often items are saved
-- without being able to see *who* saved them).
create or replace function public.favorites_count_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.listings set favorites_count = favorites_count + 1 where id = new.listing_id;
  elsif tg_op = 'DELETE' then
    update public.listings set favorites_count = greatest(favorites_count - 1, 0) where id = old.listing_id;
  end if;
  return null;
end;
$$;

drop trigger if exists favorites_count_sync on public.favorites;
create trigger favorites_count_sync
  after insert or delete on public.favorites
  for each row execute function public.favorites_count_sync();

-- -----------------------------------------------------------------------------
-- conversations
-- -----------------------------------------------------------------------------
create table if not exists public.conversations (
  id                   uuid primary key default gen_random_uuid(),
  listing_id           uuid not null references public.listings (id) on delete cascade,
  buyer_id             uuid not null references public.profiles (id) on delete cascade,
  seller_id            uuid not null references public.profiles (id) on delete cascade,
  last_message_at      timestamptz,
  last_message_preview text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (listing_id, buyer_id),
  check (buyer_id <> seller_id)
);

create index if not exists conversations_buyer_idx  on public.conversations (buyer_id, last_message_at desc);
create index if not exists conversations_seller_idx on public.conversations (seller_id, last_message_at desc);

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- messages
-- -----------------------------------------------------------------------------
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  body            text not null check (char_length(btrim(body)) between 1 and 2000),
  read_at         timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
create index if not exists messages_unread_idx on public.messages (conversation_id, sender_id) where read_at is null;

drop trigger if exists messages_set_updated_at on public.messages;
create trigger messages_set_updated_at
  before update on public.messages
  for each row execute function public.set_updated_at();

-- Abuse protection: max 20 messages per sender per minute.
create or replace function public.messages_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*) from public.messages
     where sender_id = new.sender_id
       and created_at > now() - interval '1 minute'
  ) >= 20 then
    raise exception 'RATE_LIMITED: You are sending messages too quickly. Please wait a moment.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists messages_rate_limit on public.messages;
create trigger messages_rate_limit
  before insert on public.messages
  for each row execute function public.messages_rate_limit();

-- Bump the parent conversation on every new message.
create or replace function public.messages_touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
     set last_message_at = new.created_at,
         last_message_preview = left(new.body, 140)
   where id = new.conversation_id;
  return null;
end;
$$;

drop trigger if exists messages_touch_conversation on public.messages;
create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.messages_touch_conversation();

-- -----------------------------------------------------------------------------
-- reports
-- -----------------------------------------------------------------------------
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason      public.report_reason not null,
  details     text check (details is null or char_length(details) <= 1000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (listing_id, reporter_id)
);

create index if not exists reports_listing_idx on public.reports (listing_id);

-- Count reports; auto-hide a listing once 5 different users have reported it.
create or replace function public.reports_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.listings
     set reports_count = reports_count + 1,
         is_hidden = (reports_count + 1) >= 5
   where id = new.listing_id;
  return null;
end;
$$;

drop trigger if exists reports_sync on public.reports;
create trigger reports_sync
  after insert on public.reports
  for each row execute function public.reports_sync();

-- -----------------------------------------------------------------------------
-- RPC functions
-- -----------------------------------------------------------------------------

-- Safely increment a listing's view counter (owners don't inflate their own views).
create or replace function public.increment_listing_views(p_listing_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.listings
     set views = views + 1
   where id = p_listing_id
     and not is_hidden
     and seller_id is distinct from auth.uid();
$$;

-- Keyword + filter + distance search. SECURITY INVOKER so RLS still applies.
create or replace function public.search_listings(
  p_query        text default null,
  p_category     public.listing_category default null,
  p_min_price    integer default null,
  p_max_price    integer default null,
  p_conditions   public.listing_condition[] default null,
  p_include_sold boolean default false,
  p_lat          double precision default null,
  p_lng          double precision default null,
  p_radius_km    double precision default null,
  p_sort         text default 'newest',
  p_limit        integer default 24,
  p_offset       integer default 0,
  p_exclude_id   uuid default null,
  p_seller_id    uuid default null
)
returns table (
  id          uuid,
  seller_id   uuid,
  title       text,
  category    public.listing_category,
  price       integer,
  condition   public.listing_condition,
  status      public.listing_status,
  address     text,
  city        text,
  lat         double precision,
  lng         double precision,
  views       integer,
  created_at  timestamptz,
  cover_url   text,
  distance_km double precision,
  total_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with params as (
    select
      nullif(btrim(coalesce(p_query, '')), '') as q,
      (p_lat is not null and p_lng is not null) as has_point,
      case when p_radius_km is not null and p_radius_km > 0 then p_radius_km end as radius
  ),
  base as (
    select
      l.*,
      case when pr.has_point then public.haversine_km(p_lat, p_lng, l.lat, l.lng) end as dist
    from public.listings l, params pr
    where not l.is_hidden
      and (p_include_sold or l.status = 'available')
      and (p_category is null or l.category = p_category)
      and (p_min_price is null or l.price >= p_min_price)
      and (p_max_price is null or l.price <= p_max_price)
      and (p_conditions is null or cardinality(p_conditions) = 0 or l.condition = any (p_conditions))
      and (p_exclude_id is null or l.id <> p_exclude_id)
      and (p_seller_id is null or l.seller_id = p_seller_id)
      and (
        pr.q is null
        or l.search @@ websearch_to_tsquery('english', pr.q)
        or l.title ilike '%' || replace(replace(replace(pr.q, '\', '\\'), '%', '\%'), '_', '\_') || '%'
      )
      -- cheap bounding-box prefilter (uses the lat/lng index) before the exact Haversine check
      and (
        pr.radius is null or not pr.has_point
        or l.lat between p_lat - (pr.radius / 110.574) and p_lat + (pr.radius / 110.574)
      )
  ),
  filtered as (
    select b.* from base b, params pr
    where pr.radius is null or not pr.has_point or b.dist <= pr.radius
  )
  select
    f.id, f.seller_id, f.title, f.category, f.price, f.condition, f.status,
    f.address, f.city, f.lat, f.lng, f.views, f.created_at,
    (select li.url from public.listing_images li
      where li.listing_id = f.id
      order by li.position, li.created_at
      limit 1) as cover_url,
    f.dist as distance_km,
    count(*) over () as total_count
  from filtered f
  order by
    case when p_sort = 'price_asc'  then f.price end asc,
    case when p_sort = 'price_desc' then f.price end desc,
    case when p_sort = 'nearest'    then f.dist  end asc nulls last,
    f.created_at desc,
    f.id
  limit least(greatest(coalesce(p_limit, 24), 1), 200)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

-- Get (or create) the conversation between the current user and a listing's seller.
create or replace function public.start_conversation(p_listing_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_seller uuid;
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED: Please sign in to message the seller.' using errcode = 'P0001';
  end if;

  select seller_id into v_seller
    from public.listings
   where id = p_listing_id and not is_hidden;

  if v_seller is null then
    raise exception 'NOT_FOUND: This listing is no longer available.' using errcode = 'P0001';
  end if;

  if v_seller = v_uid then
    raise exception 'OWN_LISTING: You cannot message yourself about your own listing.' using errcode = 'P0001';
  end if;

  insert into public.conversations (listing_id, buyer_id, seller_id)
  values (p_listing_id, v_uid, v_seller)
  on conflict (listing_id, buyer_id) do nothing;

  select id into v_id
    from public.conversations
   where listing_id = p_listing_id and buyer_id = v_uid;

  return v_id;
end;
$$;

-- Mark every message the other participant sent in a conversation as read.
create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.conversations c
     where c.id = p_conversation_id
       and auth.uid() in (c.buyer_id, c.seller_id)
  ) then
    return;
  end if;

  update public.messages
     set read_at = now()
   where conversation_id = p_conversation_id
     and sender_id <> auth.uid()
     and read_at is null;
end;
$$;

-- Unread message counts per conversation for the current user.
create or replace function public.get_unread_counts()
returns table (conversation_id uuid, unread bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select m.conversation_id, count(*)::bigint as unread
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
   where auth.uid() in (c.buyer_id, c.seller_id)
     and m.sender_id <> auth.uid()
     and m.read_at is null
   group by m.conversation_id;
$$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles       enable row level security;
alter table public.listings       enable row level security;
alter table public.listing_images enable row level security;
alter table public.favorites      enable row level security;
alter table public.conversations  enable row level security;
alter table public.messages       enable row level security;
alter table public.reports        enable row level security;

-- profiles: public read (name, avatar, member since are shown on listings);
-- users may only insert/update their own row.
drop policy if exists "profiles are viewable by everyone" on public.profiles;
create policy "profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "users can insert their own profile" on public.profiles;
create policy "users can insert their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- listings: anyone can read listings that are not hidden by moderation
-- (available ones, plus sold ones so the SOLD ribbon can be shown);
-- owners can always read, write and delete their own.
drop policy if exists "listings are viewable by everyone" on public.listings;
create policy "listings are viewable by everyone"
  on public.listings for select
  using (not is_hidden or seller_id = (select auth.uid()));

drop policy if exists "owners can insert listings" on public.listings;
create policy "owners can insert listings"
  on public.listings for insert to authenticated
  with check (seller_id = (select auth.uid()));

drop policy if exists "owners can update listings" on public.listings;
create policy "owners can update listings"
  on public.listings for update to authenticated
  using (seller_id = (select auth.uid()))
  with check (seller_id = (select auth.uid()));

drop policy if exists "owners can delete listings" on public.listings;
create policy "owners can delete listings"
  on public.listings for delete to authenticated
  using (seller_id = (select auth.uid()));

-- Counters / moderation flags may only be changed by the SECURITY DEFINER functions above.
revoke insert, update on public.listings from anon, authenticated;
grant insert (seller_id, title, description, category, price, condition, status, address, city, lat, lng)
  on public.listings to authenticated;
grant update (title, description, category, price, condition, status, address, city, lat, lng)
  on public.listings to authenticated;

-- email_verified is maintained by the auth trigger only.
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, full_name, avatar_url, phone, college, bio, location_address, city, lat, lng)
  on public.profiles to authenticated;
grant update (full_name, avatar_url, phone, college, bio, location_address, city, lat, lng)
  on public.profiles to authenticated;

-- listing_images: readable when the parent listing is readable; writable by the listing owner.
drop policy if exists "listing images are viewable with their listing" on public.listing_images;
create policy "listing images are viewable with their listing"
  on public.listing_images for select
  using (exists (select 1 from public.listings l where l.id = listing_id));

drop policy if exists "owners can insert listing images" on public.listing_images;
create policy "owners can insert listing images"
  on public.listing_images for insert to authenticated
  with check (exists (
    select 1 from public.listings l
     where l.id = listing_id and l.seller_id = (select auth.uid())
  ));

drop policy if exists "owners can update listing images" on public.listing_images;
create policy "owners can update listing images"
  on public.listing_images for update to authenticated
  using (exists (
    select 1 from public.listings l
     where l.id = listing_id and l.seller_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.listings l
     where l.id = listing_id and l.seller_id = (select auth.uid())
  ));

drop policy if exists "owners can delete listing images" on public.listing_images;
create policy "owners can delete listing images"
  on public.listing_images for delete to authenticated
  using (exists (
    select 1 from public.listings l
     where l.id = listing_id and l.seller_id = (select auth.uid())
  ));

-- favorites: private to the user.
drop policy if exists "users can view their favorites" on public.favorites;
create policy "users can view their favorites"
  on public.favorites for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "users can add favorites" on public.favorites;
create policy "users can add favorites"
  on public.favorites for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "users can remove favorites" on public.favorites;
create policy "users can remove favorites"
  on public.favorites for delete to authenticated
  using (user_id = (select auth.uid()));

-- conversations: only the two participants can see them.
drop policy if exists "participants can view conversations" on public.conversations;
create policy "participants can view conversations"
  on public.conversations for select to authenticated
  using ((select auth.uid()) in (buyer_id, seller_id));

drop policy if exists "buyers can start conversations" on public.conversations;
create policy "buyers can start conversations"
  on public.conversations for insert to authenticated
  with check (
    buyer_id = (select auth.uid())
    and buyer_id <> seller_id
    and exists (
      select 1 from public.listings l
       where l.id = listing_id and l.seller_id = conversations.seller_id
    )
  );

revoke update on public.conversations from anon, authenticated;

-- messages: only participants can read; senders must be a participant.
drop policy if exists "participants can view messages" on public.messages;
create policy "participants can view messages"
  on public.messages for select to authenticated
  using (exists (
    select 1 from public.conversations c
     where c.id = conversation_id
       and (select auth.uid()) in (c.buyer_id, c.seller_id)
  ));

drop policy if exists "participants can send messages" on public.messages;
create policy "participants can send messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
       where c.id = conversation_id
         and (select auth.uid()) in (c.buyer_id, c.seller_id)
    )
  );

revoke update on public.messages from anon, authenticated;
revoke insert on public.messages from anon, authenticated;
grant insert (conversation_id, sender_id, body) on public.messages to authenticated;

-- reports: users can file reports and see their own.
drop policy if exists "users can file reports" on public.reports;
create policy "users can file reports"
  on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));

drop policy if exists "users can view their own reports" on public.reports;
create policy "users can view their own reports"
  on public.reports for select to authenticated
  using (reporter_id = (select auth.uid()));

-- Function privileges
revoke execute on function public.start_conversation(uuid) from public, anon;
grant execute on function public.start_conversation(uuid) to authenticated;
revoke execute on function public.mark_conversation_read(uuid) from public, anon;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
revoke execute on function public.get_unread_counts() from public, anon;
grant execute on function public.get_unread_counts() to authenticated;
grant execute on function public.increment_listing_views(uuid) to anon, authenticated;
grant execute on function public.search_listings(
  text, public.listing_category, integer, integer, public.listing_condition[], boolean,
  double precision, double precision, double precision, text, integer, integer, uuid, uuid
) to anon, authenticated;
grant execute on function public.haversine_km(double precision, double precision, double precision, double precision)
  to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Realtime (messages + conversations; RLS is enforced for subscribers)
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
    ) then
      alter publication supabase_realtime add table public.messages;
    end if;
    if not exists (
      select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversations'
    ) then
      alter publication supabase_realtime add table public.conversations;
    end if;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Storage: "listing-images" bucket (public read; users write only to <uid>/...)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images', 'listing-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Files are served through the public CDN URL, so no broad SELECT policy is needed
-- (that would let anyone enumerate the bucket). Owners can list/read their own folder,
-- which the API also requires for updates and deletes.
drop policy if exists "listing images: owners can read own folder" on storage.objects;
create policy "listing images: owners can read own folder"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "listing images: users upload to own folder" on storage.objects;
create policy "listing images: users upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "listing images: users update own files" on storage.objects;
create policy "listing images: users update own files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "listing images: users delete own files" on storage.objects;
create policy "listing images: users delete own files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

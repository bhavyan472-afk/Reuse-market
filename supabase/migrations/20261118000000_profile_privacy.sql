-- =============================================================================
-- ReUse Market — P0 #1: stop exposing private profile fields
--
-- Problem: the "profiles are viewable by everyone" policy (using (true)) plus the
-- default table-wide SELECT grant let anyone with the public key read every column
-- of every profile, including phone, location_address, lat and lng.
--
-- Approach: column-level privileges. No table, column or row is created, moved,
-- renamed or deleted — existing data is untouched. We only change *who may read
-- which columns* and add two narrow, read-only functions:
--   * get_my_profile()            → a signed-in user reads their OWN full profile
--   * get_listing_contact(uuid)   → the seller's phone, only for SIGNED-IN users and
--                                   only via one of the seller's visible listings
--                                   (the profile form promises: "Shown on your
--                                   listings so buyers can call or WhatsApp you")
--
-- Safe to re-run (idempotent). Rollback script at the bottom (commented out).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Column-level read access on profiles
-- -----------------------------------------------------------------------------
-- Remove the table-wide SELECT privilege from the two API roles…
revoke select on public.profiles from anon, authenticated;

-- …and give back SELECT on the columns that are already shown publicly in the app
-- (seller card, public profile page, chat headers). Private columns are left out:
--   phone, location_address, lat, lng  → NOT selectable by anon/authenticated.
grant select (id, full_name, avatar_url, college, bio, city, email_verified, created_at, updated_at)
  on public.profiles to anon, authenticated;

-- The RLS policy "profiles are viewable by everyone" stays as-is: it decides which
-- ROWS are visible (all of them); the grants above decide which COLUMNS are.
-- INSERT/UPDATE grants and policies from the initial migration are unchanged, so
-- users can still update their own phone and saved location.

-- -----------------------------------------------------------------------------
-- 2. get_my_profile(): the signed-in user's own full profile row
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER lets it read the private columns; the WHERE clause limits it to
-- the caller's own row (auth.uid()), so it can never return anyone else's data.
-- Returns zero rows for anonymous callers (auth.uid() is null) — and anon cannot
-- execute it anyway (see grants below).
create or replace function public.get_my_profile()
returns setof public.profiles
language sql
stable
security definer
set search_path = ''
as $$
  select p.*
    from public.profiles p
   where p.id = (select auth.uid());
$$;

revoke execute on function public.get_my_profile() from public, anon;
grant execute on function public.get_my_profile() to authenticated;

-- -----------------------------------------------------------------------------
-- 3. get_listing_contact(listing): seller phone for ONE visible listing,
--    signed-in users only
-- -----------------------------------------------------------------------------
-- Returns the seller's phone (or null if they didn't add one) only when:
--   * the caller is signed in (checked here AND enforced by the grants below), and
--   * the listing exists and is not hidden by moderation (the owner can always
--     see their own).
-- Logged-out visitors get nothing; users without listings and sellers of hidden
-- listings are never reachable; phones can't be bulk-downloaded from profiles.
create or replace function public.get_listing_contact(p_listing_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.phone
    from public.listings l
    join public.profiles p on p.id = l.seller_id
   where l.id = p_listing_id
     and (select auth.uid()) is not null
     and (not l.is_hidden or l.seller_id = (select auth.uid()));
$$;

revoke execute on function public.get_listing_contact(uuid) from public, anon;
grant execute on function public.get_listing_contact(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 4. Ask PostgREST (Supabase's API layer) to pick up the new functions now.
-- -----------------------------------------------------------------------------
notify pgrst, 'reload schema';

-- -----------------------------------------------------------------------------
-- ROLLBACK (run only if you need to undo; redeploy the previous app code FIRST,
-- because the new code calls the functions below):
--
--   grant select on public.profiles to anon, authenticated;
--   drop function if exists public.get_listing_contact(uuid);
--   drop function if exists public.get_my_profile();
--   notify pgrst, 'reload schema';
-- -----------------------------------------------------------------------------

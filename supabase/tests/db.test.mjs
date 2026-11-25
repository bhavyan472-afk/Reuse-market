import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Runs the real migration + seed against an in-process Postgres (PGlite) with minimal
// stand-ins for Supabase's `auth` and `storage` schemas, then exercises search, triggers and RLS.
// Usage: npm run test:db
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationPath = join(root, "migrations", "20261117000000_init.sql");
const privacyMigrationPath = join(root, "migrations", "20261118000000_profile_privacy.sql");
const seedPath = join(root, "seed.sql");
const db = new PGlite({ extensions: { pgcrypto } });

const stub = `
create role anon nologin;
create role authenticated nologin;
create schema auth;
create schema storage;
create schema extensions;
create extension pgcrypto with schema extensions;
create table auth.users (instance_id uuid, id uuid primary key, aud text, role text, email text,
  encrypted_password text, email_confirmed_at timestamptz, raw_app_meta_data jsonb, raw_user_meta_data jsonb,
  created_at timestamptz, updated_at timestamptz, confirmation_token text, email_change text,
  email_change_token_new text, recovery_token text);
create table auth.identities (id uuid primary key, user_id uuid, provider_id text, identity_data jsonb, provider text,
  last_sign_in_at timestamptz, created_at timestamptz, updated_at timestamptz, unique (provider_id, provider));
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid default gen_random_uuid() primary key, bucket_id text, name text);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as
  $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
grant usage on schema public, auth, storage, extensions to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;
grant select, insert, update, delete on storage.objects to anon, authenticated;
`;

let failures = 0;
const ok = (name, cond, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`);
  if (!cond) failures++;
};
const asUser = async (uid) => {
  await db.exec(`reset role; set role ${uid ? "authenticated" : "anon"};`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [uid ?? ""]);
};
const q = async (sql, params) => (await db.query(sql, params)).rows;
const expectError = async (name, fn, pattern) => {
  try {
    await fn();
    ok(name, false, "expected an error");
  } catch (e) {
    ok(name, pattern.test(String(e.message)), e.message);
  }
};

await db.exec(stub);
try { await db.exec("create publication supabase_realtime;"); } catch { console.log("(publication not supported in PGlite — skipped)"); }
await db.exec(readFileSync(migrationPath, "utf8"));
await db.exec(readFileSync(privacyMigrationPath, "utf8"));
console.log("migrations applied");
await db.exec(readFileSync(seedPath, "utf8"));
console.log("seed applied");
// re-run all to prove idempotency
await db.exec(readFileSync(migrationPath, "utf8"));
await db.exec(readFileSync(privacyMigrationPath, "utf8"));
await db.exec(readFileSync(seedPath, "utf8"));
console.log("migrations + seed re-applied (idempotent)");

const A = "a1000000-0000-4000-8000-000000000001";
const P = "a1000000-0000-4000-8000-000000000002";
const R = "a1000000-0000-4000-8000-000000000003";
const macbook = "b2000000-0000-4000-8000-000000000004"; // owned by A

// ---- public reads / search (anon)
await asUser(null);
ok("anon sees all 82 listings", (await q("select count(*)::int c from listings"))[0].c === 82);
ok("profiles created by trigger", (await q("select count(*)::int c from profiles where email_verified"))[0].c === 4);
let r = await q("select * from search_listings(p_limit => 100)");
ok("default search excludes sold (80)", r.length === 80 && Number(r[0].total_count) === 80);
r = await q("select * from search_listings(p_include_sold => true, p_limit => 100)");
ok("include sold returns 82", r.length === 82);
r = await q("select title from search_listings(p_query => 'macbook')");
ok("keyword 'macbook' → 4", r.length === 4, r.map((x) => x.title).join(" | "));
r = await q("select title from search_listings(p_query => 'mac')");
ok("partial keyword 'mac' matches titles", r.length >= 2);
r = await q("select title from search_listings(p_query => 'battery')");
ok("full-text hits description ('battery')", r.length >= 3, String(r.length));
r = await q("select category from search_listings(p_category => 'laptops', p_limit => 50)");
ok("category laptops → 15", r.length === 15);
r = await q("select price from search_listings(p_min_price => 1000, p_max_price => 10000)");
ok("price range 1000–10000", r.length > 0 && r.every((x) => x.price >= 1000 && x.price <= 10000), String(r.length));
r = await q("select condition from search_listings(p_conditions => array['like_new']::listing_condition[])");
ok("condition like_new", r.length > 0 && r.every((x) => x.condition === "like_new"), String(r.length));
r = await q("select price from search_listings(p_sort => 'price_asc', p_limit => 50)");
ok("sort price asc", r.every((x, i) => i === 0 || r[i - 1].price <= x.price));
r = await q("select price from search_listings(p_sort => 'price_desc', p_limit => 50)");
ok("sort price desc", r.every((x, i) => i === 0 || r[i - 1].price >= x.price));
// Bengaluru MG Road
r = await q("select city, distance_km from search_listings(p_lat => 12.9716, p_lng => 77.5946, p_radius_km => 10, p_sort => 'nearest')");
ok("within 10 km of Bengaluru → only Bengaluru", r.length > 0 && r.every((x) => x.city === "Bengaluru" && x.distance_km <= 10), r.map((x) => `${x.city}:${x.distance_km.toFixed(1)}`).join(", "));
ok("nearest sort ascending", r.every((x, i) => i === 0 || r[i - 1].distance_km <= x.distance_km));
r = await q("select round(haversine_km(19.0760, 72.8777, 18.5204, 73.8567)::numeric, 0) d");
ok("haversine Mumbai→Pune ≈ 120 km", Math.abs(Number(r[0].d) - 120) <= 3, String(r[0].d));
r = await q("select * from search_listings(p_limit => 5, p_offset => 5)");
ok("pagination offset/limit", r.length === 5 && Number(r[0].total_count) === 80);

await q("select increment_listing_views($1)", [macbook]);
ok("anon view increment", (await q("select views from listings where id = $1", [macbook]))[0].views === 213);
await expectError("anon cannot insert listing", () => q(`insert into listings (seller_id,title,description,category,price,condition,address,city,lat,lng) values ($1,'Test item','A long enough description','others',10,'good','Somewhere','City',1,1)`, [A]), /permission denied|row-level security/);

// ---- ownership (RLS)
await asUser(R);
r = await q("update listings set price = 1 where id = $1 returning id", [macbook]);
ok("other user cannot UPDATE my listing", r.length === 0);
r = await q("delete from listings where id = $1 returning id", [macbook]);
ok("other user cannot DELETE my listing", r.length === 0);
r = await q("delete from listing_images where listing_id = $1 returning id", [macbook]);
ok("other user cannot DELETE my images", r.length === 0);
await expectError("cannot create listing as someone else", () => q(`insert into listings (seller_id,title,description,category,price,condition,address,city,lat,lng) values ($1,'Test item','A long enough description','others',10,'good','Somewhere','City',1,1)`, [A]), /row-level security/);
await expectError("owner cannot tamper with views counter", () => q("update listings set views = 99999 where seller_id = $1", [R]), /permission denied/);
await expectError("user cannot set email_verified", () => q("update profiles set email_verified = true where id = $1", [R]), /permission denied/);
r = await q("update profiles set full_name = 'Hacker' where id = $1 returning id", [A]);
ok("cannot edit another profile", r.length === 0);

// own listing CRUD
r = await q(`insert into listings (seller_id,title,description,category,price,condition,address,city,lat,lng) values ($1,'Casio fx-991EX','Barely used scientific calculator','calculators',900,'like_new','North Campus','Delhi',28.68,77.21) returning id`, [R]);
const mine = r[0].id;
ok("owner can create listing", !!mine);
for (let i = 0; i < 6; i++) await q("insert into listing_images (listing_id, url, position) values ($1, $2, $3)", [mine, `https://x/${i}.webp`, i]);
await expectError("7th image rejected", () => q("insert into listing_images (listing_id, url, position) values ($1, 'https://x/7.webp', 5)", [mine]), /IMAGE_LIMIT/);
r = await q("update listings set status = 'sold' where id = $1 returning sold_at", [mine]);
ok("mark sold sets sold_at", r[0].sold_at !== null);
await asUser(null);
ok("sold listing hidden from default search", !(await q("select id from search_listings(p_query => 'Casio', p_limit => 50)")).some((x) => x.id === mine));
ok("sold listing still readable (ribbon)", (await q("select status from listings where id = $1", [mine]))[0].status === "sold");
await asUser(R);
r = await q("update listings set status = 'available' where id = $1 returning sold_at", [mine]);
ok("mark available clears sold_at", r[0].sold_at === null);
await asUser(null);
ok("available again in search", (await q("select id from search_listings(p_query => 'Casio', p_limit => 50)")).some((x) => x.id === mine));

// ---- favorites (private)
await asUser(R);
await q("insert into favorites (user_id, listing_id) values ($1, $2)", [R, macbook]);
ok("user sees own favorite", (await q("select count(*)::int c from favorites"))[0].c === 1);
await expectError("cannot favorite on behalf of others", () => q("insert into favorites (user_id, listing_id) values ($1, $2)", [P, macbook]), /row-level security/);
await asUser(P);
ok("favorites private to owner", (await q("select count(*)::int c from favorites"))[0].c === 0);
await asUser(A);
ok("favorites_count incremented", (await q("select favorites_count from listings where id = $1", [macbook]))[0].favorites_count === 1);
await asUser(R);
await q("delete from favorites where listing_id = $1", [macbook]);
ok("favorites_count decremented", (await q("select favorites_count from listings where id = $1", [macbook]))[0].favorites_count === 0);

// ---- conversations / messages
await asUser(R);
const conv = (await q("select start_conversation($1) id", [macbook]))[0].id;
ok("buyer starts conversation", !!conv);
ok("start_conversation is idempotent", (await q("select start_conversation($1) id", [macbook]))[0].id === conv);
await q("insert into messages (conversation_id, sender_id, body) values ($1, $2, 'Hi! Is the MacBook still available?')", [conv, R]);
await expectError("cannot send as someone else", () => q("insert into messages (conversation_id, sender_id, body) values ($1, $2, 'spoof')", [conv, A]), /row-level security/);
await asUser(A);
ok("seller sees the message", (await q("select count(*)::int c from messages where conversation_id = $1", [conv]))[0].c === 1);
r = await q("select * from get_unread_counts()");
ok("seller unread count = 1", r.length === 1 && Number(r[0].unread) === 1);
ok("conversation preview updated", (await q("select last_message_preview from conversations where id = $1", [conv]))[0].last_message_preview.startsWith("Hi!"));
await q("select mark_conversation_read($1)", [conv]);
ok("mark read clears unread", (await q("select * from get_unread_counts()")).length === 0);
await asUser(P);
ok("third user cannot read conversation", (await q("select count(*)::int c from conversations where id = $1", [conv]))[0].c === 0);
ok("third user cannot read messages", (await q("select count(*)::int c from messages where conversation_id = $1", [conv]))[0].c === 0);
await expectError("third user cannot post into conversation", () => q("insert into messages (conversation_id, sender_id, body) values ($1, $2, 'intrude')", [conv, P]), /row-level security/);
await asUser(A);
await expectError("cannot message yourself", () => q("select start_conversation($1)", [macbook]), /OWN_LISTING/);
await asUser(null);
await expectError("anon cannot start conversation", () => q("select start_conversation($1)", [macbook]), /permission denied/);
ok("anon cannot read messages", (await q("select count(*)::int c from messages"))[0].c === 0 && (await q("select count(*)::int c from conversations"))[0].c === 0);
await asUser(R);
await expectError("message rate limit (20/min)", async () => {
  for (let i = 0; i < 25; i++) await q("insert into messages (conversation_id, sender_id, body) values ($1, $2, $3)", [conv, R, `msg ${i}`]);
}, /RATE_LIMITED/);
await expectError("message editing blocked", () => q("update messages set body = 'edited' where sender_id = $1", [R]), /permission denied/);

// ---- reports
await asUser(R);
await q("insert into reports (listing_id, reporter_id, reason) values ($1, $2, 'spam')", [macbook, R]);
await expectError("duplicate report rejected", () => q("insert into reports (listing_id, reporter_id, reason) values ($1, $2, 'spam')", [macbook, R]), /duplicate key/);
await asUser(P);
ok("reports private to reporter", (await q("select count(*)::int c from reports"))[0].c === 0);

// ---- storage policies
await asUser(R);
await q("insert into storage.objects (bucket_id, name) values ('listing-images', $1)", [`${R}/listings/a.webp`]);
ok("upload to own folder allowed", true);
await expectError("upload to another user's folder denied", () => q("insert into storage.objects (bucket_id, name) values ('listing-images', $1)", [`${A}/listings/evil.webp`]), /row-level security/);
await asUser(A);
r = await q("delete from storage.objects where name = $1 returning id", [`${R}/listings/a.webp`]);
ok("cannot delete another user's file", r.length === 0);
await asUser(R);
r = await q("delete from storage.objects where name = $1 returning id", [`${R}/listings/a.webp`]);
ok("owner can delete own file", r.length === 1);

// ---- profile privacy (P0 #1)
await db.exec("reset role");
const phoneA = (await q("select phone from profiles where id = $1", [A]))[0].phone;
await asUser(null);
await expectError("anon cannot read phone", () => q("select phone from profiles"), /permission denied/);
await expectError("anon cannot read saved address/lat/lng", () => q("select location_address, lat, lng from profiles"), /permission denied/);
await expectError("anon cannot select * from profiles", () => q("select * from profiles"), /permission denied/);
r = await q("select id, full_name, avatar_url, college, bio, city, email_verified, created_at, updated_at from profiles");
ok("anon still reads public profile columns", r.length >= 4, `${r.length} profiles`);
r = await q("select l.id, p.full_name from listings l join profiles p on p.id = l.seller_id limit 3");
ok("anon can still join listings → seller name", r.length === 3);
await expectError("anon cannot get seller phone (signed-in only)", () => q("select get_listing_contact($1) as phone", [macbook]), /permission denied/);
await expectError("anon cannot call get_my_profile", () => q("select * from get_my_profile()"), /permission denied/);
await asUser(R);
r = await q("select get_listing_contact($1) as phone", [macbook]);
ok("signed-in user gets seller phone via a visible listing", phoneA !== null && r[0].phone === phoneA);
r = await q("select get_listing_contact($1) as phone", ["00000000-0000-4000-8000-000000000000"]);
ok("unknown listing reveals nothing", r[0].phone === null);
await expectError("signed-in user cannot read another user's phone", () => q("select phone from profiles where id = $1", [A]), /permission denied/);
r = await q("select * from get_my_profile()");
ok("get_my_profile returns only the caller's full row", r.length === 1 && r[0].id === R && "lat" in r[0] && "phone" in r[0]);
await q("update profiles set phone = '+919999999999', location_address = 'Test gate', lat = 12.9, lng = 77.6 where id = $1", [R]);
r = await q("select phone, location_address, lat from get_my_profile()");
ok("owner can still update phone + saved location", r[0].phone === "+919999999999" && r[0].location_address === "Test gate" && r[0].lat === 12.9);
r = await q("update profiles set bio = 'x' where id = $1 returning id", [A]);
ok("still cannot update another profile", r.length === 0);
await db.exec("reset role");
await q("update listings set is_hidden = true where id = $1", [macbook]);
await asUser(R);
r = await q("select get_listing_contact($1) as phone", [macbook]);
ok("hidden listing does not reveal the phone", r[0].phone === null);
await asUser(A);
r = await q("select get_listing_contact($1) as phone", [macbook]);
ok("owner still sees own contact on a hidden listing", r[0].phone === phoneA);
await db.exec("reset role");
await q("update listings set is_hidden = false where id = $1", [macbook]);
await asUser(R);

// ---- delete cascade
r = await q("delete from listings where id = $1 returning id", [mine]);
ok("owner can delete listing", r.length === 1);
ok("images cascade-deleted", (await q("select count(*)::int c from listing_images where listing_id = $1", [mine]))[0].c === 0);

await db.exec("reset role");
console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures ? 1 : 0);

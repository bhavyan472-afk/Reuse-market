# ReUse Market

**Give Products a Second Life.** A second-hand marketplace for students and local communities: list pre-owned books, laptops, mobiles, bicycles, calculators, furniture, electronics and clothing, find items near you on a map, and chat with sellers in real time.

Built with Next.js 15 (App Router) + TypeScript, Tailwind CSS v4 + shadcn/ui, Supabase (Auth, Postgres, Storage, Realtime, RLS), and free, open-source maps via Leaflet + React Leaflet with OpenStreetMap data.

---

## Contents

1. [Features](#features)
2. [Project structure](#project-structure)
3. [Setup](#setup)
   1. [Supabase project](#1-create-a-supabase-project)
   2. [Database migration](#2-run-the-sql-migration)
   3. [Seed data](#3-load-the-seed-data-optional-but-recommended)
   4. [Storage bucket](#4-storage-bucket)
   5. [Auth settings](#5-auth-settings)
   6. [Google sign-in (optional)](#6-google-sign-in-optional)
   7. [Maps (OpenStreetMap)](#7-maps-openstreetmap--leaflet)
   8. [Run locally](#8-run-locally)
   9. [Deploy to Vercel](#9-deploy-to-vercel)
4. [Scripts and tests](#scripts-and-tests)
5. [Security model](#security-model)
6. [Troubleshooting](#troubleshooting)

---

## Features

- **Auth.** Email/password sign-up, sign-in, sign-out, forgot/reset password, and optional Google sign-in. Protected routes (`/sell`, `/dashboard`, `/profile`, `/messages`, `/saved`, `/listings/:id/edit`) redirect to `/login?next=…` and return you to the page afterwards.
- **Profiles.** Name, avatar upload, optional phone, college/area, bio and a saved location (map picker). Members get a verified-email badge and a "member since" date.
- **Listings (CRUD).** Title, category, description, price in ₹, condition (New / Like New / Good / Fair), and up to 6 photos. Photos support drag-and-drop, previews, reordering, removal, client-side WebP compression and a 5 MB limit each. The location picker combines Places Autocomplete, a draggable pin and "Use my current location". You can edit, delete (with a confirm dialog that also removes the photos from Storage), and mark a listing Sold or Available.
- **Browse and search.** Full-text keyword search, plus filters for category, price range, condition, "Available only" and distance (5/10/25/50 km, Haversine in SQL). Sort by newest, price low→high, price high→low, or nearest. Every card shows "2.3 km away". Results are paginated, with skeleton loaders and illustrated empty states.
- **Map view.** A list/map split with price pins, marker clustering, and a mini card that links to each listing.
- **Listing page.** Gallery with thumbnails and click-to-zoom lightbox. Map pin with a "Get directions" link. Seller card with avatar, member since, verified badge, active listing count and a public profile link. In-app chat, plus Call and WhatsApp (pre-filled `wa.me` message) when the seller shared a phone. Copy link, Web Share, wishlist, report listing, similar items, JSON-LD, and a per-listing Open Graph image.
- **Seller dashboard.** Total, active, sold, total views and times-saved stats, plus a listings table with edit, delete and mark-sold actions.
- **Messaging.** Inbox grouped by listing, realtime messages (Supabase Realtime), unread badges in the navbar and mobile nav, read receipts, optimistic sending with retry, and rate limiting.
- **Polish.** Light and dark mode, mobile-first layout with a bottom nav, sticky translucent navbar, subtle Framer Motion reveals, a 404 page, error boundaries, toasts, sitemap and robots. If the map fails to load, a graceful fallback (manual city picker) replaces it.

## Project structure

```
supabase/
  migrations/20261117000000_init.sql   # full schema, RLS, RPCs, storage bucket & policies
  migrations/20261118000000_profile_privacy.sql # hides phone + saved location from the public API
  seed.sql                             # 4 demo sellers + 24 listings with real photos
  tests/db.test.mjs                    # runs migration+seed in PGlite and checks search, triggers & RLS
src/
  app/                                 # routes (App Router)
  components/
    auth/ home/ layout/ listings/ maps/ marketplace/ messages/ profile/ providers/ shared/ ui/
  lib/
    actions/                           # server actions (validated with zod, sanitised)
    supabase/                          # browser/server/middleware clients + DB types
    queries.ts search-params.ts validations.ts ...
  middleware.ts                        # session refresh + protected-route redirects
```

---

## Setup

You need **Node.js 20+** (22 or 24 recommended), a free **Supabase** project. Maps need no account or API key.

### 1. Create a Supabase project

1. Go to <https://supabase.com/dashboard> → **New project**. Pick a region close to your users (e.g. Mumbai `ap-south-1`).
2. When it's ready, open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key (or the newer **publishable** key) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> Do **not** copy the `service_role` / secret key anywhere in this app. It is not needed.

### 2. Run the SQL migration

**Option A — SQL editor (simplest):** open **SQL Editor → New query**, paste the whole of `supabase/migrations/20261117000000_init.sql`, and click **Run**. Then do the same with `supabase/migrations/20261118000000_profile_privacy.sql` (run the files in filename order).

**Option B — Supabase CLI:**

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

The migration is idempotent (safe to run twice). It creates:

| Object | Purpose |
| --- | --- |
| `profiles` | public profile, auto-created by a trigger on sign-up |
| `listings` | with `listing_status` enum, `views`, `favorites_count`, full-text `search` column and indexes on category, price, status, (lat, lng) |
| `listing_images` | up to 6 per listing (enforced by trigger) |
| `favorites` | private wishlist |
| `conversations`, `messages` | 1:1 chat per listing + buyer, rate-limited (20 msgs/min) |
| `reports` | one per user per listing; 5 reports auto-hide a listing |
| RPCs | `search_listings`, `increment_listing_views`, `start_conversation`, `mark_conversation_read`, `get_unread_counts`, `haversine_km` |
| Realtime | `messages` and `conversations` added to the `supabase_realtime` publication |
| Storage | `listing-images` bucket (public read, 5 MB, jpeg/png/webp) + owner-folder policies |

### 3. Load the seed data (optional but recommended)

Paste `supabase/seed.sql` into the SQL editor and run it (or `npx supabase db reset` locally). You get 4 demo sellers and 24 listings across every category, spread over Bengaluru, Mumbai, Delhi, Pune, Hyderabad, Chennai, Kolkata, Ahmedabad and Gurugram, with real Unsplash photos.

Demo logins (password for all: **`ReUse@12345`**):

- `aarav.sharma@reusemarket.test`
- `priya.nair@reusemarket.test`
- `rohan.mehta@reusemarket.test`
- `ananya.iyer@reusemarket.test`

> Remove these accounts before launch: **Authentication → Users → delete**. Their listings cascade-delete.

### 4. Storage bucket

The migration creates the **`listing-images`** bucket automatically. Check it under **Storage**: it should be *Public*, with a 5 MB limit and image MIME types. Files are stored as `<user-id>/listings/<uuid>.webp` and `<user-id>/avatars/<uuid>.webp`. Policies only allow a user to write, update or delete inside their own `<user-id>/` folder. Public reads go through the CDN URL, so the bucket can't be listed or enumerated.

### 5. Auth settings

In **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000` during development (change to your production domain later).
- **Redirect URLs:** add `http://localhost:3000/**` and, after deploying, `https://<your-domain>/**` (and `https://*-<your-team>.vercel.app/**` if you want preview deployments to work).

Email confirmation is on by default, so new users must click the email link before signing in. The link goes to `/auth/callback`, which signs them in. For links that also work when opened on a *different* device, edit **Authentication → Email Templates**:

- *Confirm signup:* `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/`
- *Reset password:* `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`

For production, configure a custom SMTP server (**Project Settings → Authentication → SMTP**). Supabase's built-in mailer is heavily rate-limited.

### 6. Google sign-in (optional)

1. In **Google Cloud Console → APIs & Services → OAuth consent screen**, configure an *External* app.
2. Go to **Credentials → Create credentials → OAuth client ID → Web application** and set:
   - **Authorized JavaScript origins:** `http://localhost:3000`, `https://<your-domain>`
   - **Authorized redirect URIs:** `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. In Supabase, open **Authentication → Providers → Google**, enable it, and paste the client ID and secret. The secret lives only in Supabase, never in this app.
4. Set `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true`. The "Continue with Google" button then appears on the login and register pages.

### 7. Maps (OpenStreetMap + Leaflet)

Maps use [Leaflet](https://github.com/Leaflet/Leaflet) and [React Leaflet](https://github.com/PaulLeCam/react-leaflet) with OpenStreetMap data. **No API key or billing is needed** for local development.

- **Tiles:** by default the public OSM tile server (`tile.openstreetmap.org`). Its [tile usage policy](https://operations.osmfoundation.org/policies/tiles/) allows light use with attribution, but it is **not** meant for heavy production traffic and can block you. Before launch, set `NEXT_PUBLIC_MAP_TILE_URL` and `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION` to a provider whose terms cover your traffic (e.g. MapTiler, Stadia Maps, Thunderforest, or your own tile server), and `NEXT_PUBLIC_MAP_TILE_MAX_ZOOM` if it differs from 19.
- **Address search / reverse geocoding:** the public [Nominatim](https://nominatim.org/) API. Its [usage policy](https://operations.osmfoundation.org/policies/nominatim/) allows at most 1 request/second and forbids search-as-you-type, so the app throttles requests, caches results and only searches when the user presses Enter. For production, set `NEXT_PUBLIC_GEOCODER_URL` to a self-hosted or commercial Nominatim-compatible endpoint.
- Attribution ("© OpenStreetMap contributors") is shown on every map, as required by the OSM licence.

The app degrades gracefully: while Leaflet loads you see a loading state, if tiles can't be fetched a "Map tiles couldn't load" notice with a retry button appears, and if the map fails entirely the location picker falls back to a city list plus "Use my current location".

### 8. Run locally

```bash
cp .env.example .env.local   # then fill in the values
npm install
npm run dev                  # http://localhost:3000
```

### 9. Deploy to Vercel

1. Push this folder to GitHub (or GitLab/Bitbucket).
2. In <https://vercel.com/new>, import the repo. The framework preset is detected as **Next.js**.
3. Add every variable from `.env.example` under **Environment Variables**. Set `NEXT_PUBLIC_SITE_URL` to your production URL, e.g. `https://reuse-market.vercel.app`.
4. Click **Deploy**.
5. After the first deploy:
   - In Supabase **Auth → URL Configuration**, set **Site URL** to the production URL and add `https://<your-domain>/**` to Redirect URLs.
   - Switch map tiles/geocoding to a production-grade provider (see section 7). If you use Google sign-in, add your domain to the OAuth client's origins.

Or with the CLI: `npm i -g vercel && vercel` (preview) then `vercel --prod`.

---

## Scripts and tests

| Command | What it does |
| --- | --- |
| `npm run dev` | dev server (Turbopack) |
| `npm run build` | production build |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run typecheck` | `tsc --noEmit` in strict mode |
| `npm run test:e2e [url]` | Playwright end-to-end suite (65 checks) against a running server (default `http://localhost:3000`) and your live Supabase project, using the seed accounts. It covers browsing, filters, auth, creating/editing/deleting a listing with 3 photos, storage, favorites, realtime chat, reports, sold status, profile, RLS in the UI, and responsive light/dark layouts. Everything it creates is titled `E2E TEST …` and is deleted at the end. Run `npx playwright install chromium` once first. |
| `npm run test:db` | runs the real migration and seed inside PGlite (Postgres compiled to WASM) with stand-ins for Supabase's `auth`/`storage` schemas, then checks search, filters, distance, sorting, pagination, triggers, rate limits, storage policies and every RLS rule (61 checks) |

## Security model

- **Row Level Security on every table.** Anyone can read listings that aren't moderation-hidden; sold listings stay readable so their SOLD ribbon can show. Only owners can insert, update or delete their own listings and images. Favorites and reports are private to their author. Conversations and messages are visible only to their two participants.
- **Column-level grants.** Clients cannot write `views`, `favorites_count`, `reports_count`, `is_hidden` or `email_verified`, and messages can't be edited. These are changed only by `SECURITY DEFINER` functions and triggers.
- **Server-side validation.** Every write goes through a server action that re-validates with the same zod schemas as the forms. Text is sanitised (HTML tags, control and bidi characters stripped), phone numbers are normalised, and image paths are checked to belong to the caller's own storage folder.
- **Abuse limits** are enforced in the database:
  - 20 messages/min per user, plus a client-side burst limit
  - 15 new listings/hour per user
  - 6 images per listing
  - a 5 MB file limit, enforced in the client and by the bucket
  - one report per user per listing; listings auto-hide after 5 reports
- **No secrets in the client.** Only the anon key (safe under RLS) is public. Maps need no key.
- **Private profile fields stay private.** Phone numbers and saved home locations can't be read through the public API (column-level grants). Users read their own via `get_my_profile()`; a seller's phone is only released to signed-in users, for one of the seller's visible listings, via `get_listing_contact()`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Yellow "Setup needed" bar | `.env.local` is missing Supabase values. Restart `npm run dev` after editing it. |
| "Map tiles couldn't load" | The tile server is unreachable or is rate-limiting you. Check your connection, or set `NEXT_PUBLIC_MAP_TILE_URL` to another provider. |
| Address search says it's unavailable | Enable **Places API (New)** (not just the legacy Places API) and allow it in the key's API restrictions. |
| Sign-up email link says "expired" | Open it in the same browser you signed up with, or switch the email templates to the `token_hash` links above. |
| Uploads fail with "bucket missing" | The migration didn't finish. Re-run it; it's idempotent. |
| Chat doesn't update live | Check that `messages` is listed under **Database → Publications → supabase_realtime** (the migration adds it). |

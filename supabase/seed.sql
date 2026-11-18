-- =============================================================================
-- ReUse Market — seed data
-- 4 demo sellers + 24 listings across every category, with real Unsplash photos
-- and real Indian city coordinates. Run AFTER the migration (SQL editor or
-- `supabase db reset`). Safe to re-run.
--
-- Demo accounts (password for all: ReUse@12345):
--   aarav.sharma@reusemarket.test  (Aarav Sharma)
--   priya.nair@reusemarket.test  (Priya Nair)
--   rohan.mehta@reusemarket.test  (Rohan Mehta)
--   ananya.iyer@reusemarket.test  (Ananya Iyer)
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- Demo users -----------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000', 'a1000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
  'aarav.sharma@reusemarket.test', extensions.crypt('ReUse@12345', extensions.gen_salt('bf')), now() - interval '420 days',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', 'Aarav Sharma'),
  now() - interval '420 days', now(), '', '', '', ''
) on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001',
  jsonb_build_object('sub', 'a1000000-0000-4000-8000-000000000001', 'email', 'aarav.sharma@reusemarket.test', 'email_verified', true),
  'email', now(), now() - interval '420 days', now()
) on conflict do nothing;

insert into public.profiles (id, full_name, college, bio, location_address, city, lat, lng, phone, email_verified, created_at)
values ('a1000000-0000-4000-8000-000000000001', 'Aarav Sharma', 'Christ University, Bengaluru', 'Final-year BBA student. Clearing out my hostel room before graduation — everything well cared for.', 'Koramangala, Bengaluru, Karnataka', 'Bengaluru', 12.9352, 77.6245, '+919876500001', true, now() - interval '420 days')
on conflict (id) do update set
  full_name = excluded.full_name, college = excluded.college, bio = excluded.bio,
  location_address = excluded.location_address, city = excluded.city,
  lat = excluded.lat, lng = excluded.lng, phone = excluded.phone,
  email_verified = true, created_at = excluded.created_at;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000', 'a1000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
  'priya.nair@reusemarket.test', extensions.crypt('ReUse@12345', extensions.gen_salt('bf')), now() - interval '380 days',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', 'Priya Nair'),
  now() - interval '380 days', now(), '', '', '', ''
) on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  'a1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000002',
  jsonb_build_object('sub', 'a1000000-0000-4000-8000-000000000002', 'email', 'priya.nair@reusemarket.test', 'email_verified', true),
  'email', now(), now() - interval '380 days', now()
) on conflict do nothing;

insert into public.profiles (id, full_name, college, bio, location_address, city, lat, lng, phone, email_verified, created_at)
values ('a1000000-0000-4000-8000-000000000002', 'Priya Nair', 'IIT Bombay, Powai', 'M.Tech student and weekend cyclist. Happy to meet on campus or near Hiranandani.', 'Powai, Mumbai, Maharashtra', 'Mumbai', 19.1176, 72.906, '+919876500002', true, now() - interval '380 days')
on conflict (id) do update set
  full_name = excluded.full_name, college = excluded.college, bio = excluded.bio,
  location_address = excluded.location_address, city = excluded.city,
  lat = excluded.lat, lng = excluded.lng, phone = excluded.phone,
  email_verified = true, created_at = excluded.created_at;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000', 'a1000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated',
  'rohan.mehta@reusemarket.test', extensions.crypt('ReUse@12345', extensions.gen_salt('bf')), now() - interval '300 days',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', 'Rohan Mehta'),
  now() - interval '300 days', now(), '', '', '', ''
) on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  'a1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000003',
  jsonb_build_object('sub', 'a1000000-0000-4000-8000-000000000003', 'email', 'rohan.mehta@reusemarket.test', 'email_verified', true),
  'email', now(), now() - interval '300 days', now()
) on conflict do nothing;

insert into public.profiles (id, full_name, college, bio, location_address, city, lat, lng, phone, email_verified, created_at)
values ('a1000000-0000-4000-8000-000000000003', 'Rohan Mehta', 'Delhi University, North Campus', 'Design enthusiast. I sell things I''ve loved and no longer use.', 'Kamla Nagar, Delhi', 'Delhi', 28.6889, 77.21, null, true, now() - interval '300 days')
on conflict (id) do update set
  full_name = excluded.full_name, college = excluded.college, bio = excluded.bio,
  location_address = excluded.location_address, city = excluded.city,
  lat = excluded.lat, lng = excluded.lng, phone = excluded.phone,
  email_verified = true, created_at = excluded.created_at;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000', 'a1000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated',
  'ananya.iyer@reusemarket.test', extensions.crypt('ReUse@12345', extensions.gen_salt('bf')), now() - interval '250 days',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', 'Ananya Iyer'),
  now() - interval '250 days', now(), '', '', '', ''
) on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  'a1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000004',
  jsonb_build_object('sub', 'a1000000-0000-4000-8000-000000000004', 'email', 'ananya.iyer@reusemarket.test', 'email_verified', true),
  'email', now(), now() - interval '250 days', now()
) on conflict do nothing;

insert into public.profiles (id, full_name, college, bio, location_address, city, lat, lng, phone, email_verified, created_at)
values ('a1000000-0000-4000-8000-000000000004', 'Ananya Iyer', 'Fergusson College, Pune', 'Bookworm, minimalist, moving cities soon.', 'FC Road, Pune, Maharashtra', 'Pune', 18.5236, 73.8478, '+919876500004', true, now() - interval '250 days')
on conflict (id) do update set
  full_name = excluded.full_name, college = excluded.college, bio = excluded.bio,
  location_address = excluded.location_address, city = excluded.city,
  lat = excluded.lat, lng = excluded.lng, phone = excluded.phone,
  email_verified = true, created_at = excluded.created_at;

-- Listings ---------------------------------------------------------------------
insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000004', 'Startup & business book bundle — Zero to One, The Lean Startup + 4 more', 'Six business classics in good reading condition: Zero to One, The Lean Startup, Ego Is the Enemy, The Obstacle Is the Way, Value Proposition Design and The Startup Owner''s Manual. Light pencil underlining in two books, no torn pages. Perfect for an E-cell or MBA prep shelf.', 'books', 900, 'good', 'available', 'FC Road, Shivajinagar, Pune', 'Pune', 18.5236, 73.8478, 64, now() - interval '1 days' - interval '37 minutes', now() - interval '1 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000010000', 'b2000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000010001', 'b2000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000004', 'Classic literature collection — 12 paperbacks', 'Twelve paperbacks including Pride and Prejudice, 1984, Jane Eyre, The Great Gatsby and Crime and Punishment. Spines show gentle wear, pages clean. Selling as a set only.', 'books', 1200, 'good', 'available', 'Kothrud, Pune', 'Pune', 18.5074, 73.8077, 41, now() - interval '4 days' - interval '74 minutes', now() - interval '4 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000020000', 'b2000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000020001', 'b2000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000003', 'Milk and Honey by Rupi Kaur — paperback', 'Read once, kept on a shelf since. No markings, no folded corners. Pick up near Kamla Nagar market or the Arts Faculty gate.', 'books', 180, 'like_new', 'available', 'North Campus, University of Delhi', 'Delhi', 28.6875, 77.209, 27, now() - interval '2 days' - interval '111 minutes', now() - interval '2 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000030000', 'b2000000-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'MacBook Air M1 (2020) — 8GB / 256GB, Space Grey', 'Bought in Jan 2022, battery health 91%, 212 cycles. Always used with a keyboard cover and sleeve — no dents or scratches. Comes with the original charger and box. Bill available.', 'laptops', 52000, 'like_new', 'available', 'Koramangala 5th Block, Bengaluru', 'Bengaluru', 12.9346, 77.6206, 212, now() - interval '0 days' - interval '148 minutes', now() - interval '0 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000040000', 'b2000000-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000040001', 'b2000000-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'Dell Inspiron 14 — i5 11th Gen, 16GB RAM, 512GB SSD', 'Reliable everyday laptop for coding and college work. RAM upgraded to 16GB. Minor scuffs on the lid, screen and keyboard are perfect. Windows 11 activated, freshly reset.', 'laptops', 38500, 'good', 'available', 'Indiranagar, Bengaluru', 'Bengaluru', 12.9719, 77.6412, 98, now() - interval '3 days' - interval '185 minutes', now() - interval '3 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000050000', 'b2000000-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000050001', 'b2000000-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000002', 'MacBook Pro 13-inch (2019) — Touch Bar, 16GB, 512GB', 'Intel i5 quad-core, 16GB RAM, 512GB SSD. Battery replaced at the Apple service centre in 2024. Ideal for design students. Includes 61W USB-C charger.', 'laptops', 58000, 'good', 'available', 'Hiranandani Gardens, Powai, Mumbai', 'Mumbai', 19.1197, 72.9089, 143, now() - interval '6 days' - interval '222 minutes', now() - interval '6 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000060000', 'b2000000-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000060001', 'b2000000-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000002', 'iPhone 12 — 128GB, Blue, battery 86%', 'Single owner, always in a case with a screen guard. Face ID and all cameras work perfectly. Box and cable included. AirPods in the photo are not part of the sale.', 'mobiles', 34000, 'good', 'available', 'IIT Bombay Main Gate, Powai, Mumbai', 'Mumbai', 19.1334, 72.9133, 187, now() - interval '1 days' - interval '259 minutes', now() - interval '1 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000070000', 'b2000000-0000-4000-8000-000000000007', 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000003', 'Samsung Galaxy S21 Ultra 5G — 256GB, Phantom Black', '12GB RAM, 256GB storage, 108MP camera with 10x optical zoom. No scratches — screen protector applied from day one. Original box, cable and case.', 'mobiles', 41000, 'like_new', 'available', 'Hauz Khas Village, New Delhi', 'Delhi', 28.5494, 77.2001, 156, now() - interval '5 days' - interval '296 minutes', now() - interval '5 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000080000', 'b2000000-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000009', 'a1000000-0000-4000-8000-000000000001', 'Redmi Note 10 Pro — 6GB/128GB with box & charger', 'Great backup phone. 108MP camera, AMOLED display, 33W fast charger included. Small scratch on the back panel.', 'mobiles', 9500, 'good', 'sold', 'HSR Layout, Bengaluru', 'Bengaluru', 12.9116, 77.6389, 77, now() - interval '12 days' - interval '333 minutes', now() - interval '12 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000090000', 'b2000000-0000-4000-8000-000000000009', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000010', 'a1000000-0000-4000-8000-000000000004', 'Single-speed fixie — white frame, leather saddle', 'Lightweight single-speed with a flip-flop hub, so you can ride fixed or free. Brown leather saddle and matching grips. Tyres replaced last month.', 'bicycles', 8500, 'good', 'sold', 'Deccan Gymkhana, Pune', 'Pune', 18.5167, 73.8417, 89, now() - interval '15 days' - interval '370 minutes', now() - interval '15 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000100000', 'b2000000-0000-4000-8000-000000000010', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000011', 'a1000000-0000-4000-8000-000000000002', 'Hybrid city bike with orange rims — 7 speed', 'Comfortable upright city bike, perfect for campus commutes. Shimano 7-speed gears recently serviced. Lock and front light included.', 'bicycles', 6000, 'good', 'available', 'Chandivali, Powai, Mumbai', 'Mumbai', 19.1094, 72.8996, 58, now() - interval '2 days' - interval '407 minutes', now() - interval '2 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000110000', 'b2000000-0000-4000-8000-000000000011', 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000012', 'a1000000-0000-4000-8000-000000000002', 'Carbon road bike — Shimano 105, 54cm frame', 'Full carbon frame, Shimano 105 11-speed groupset, ridden about 1,800 km. Professionally fitted for riders between 5 ft 8 in and 5 ft 11 in. Pedals not included.', 'bicycles', 65000, 'like_new', 'available', 'Bandra West, Mumbai', 'Mumbai', 19.0596, 72.8295, 121, now() - interval '7 days' - interval '444 minutes', now() - interval '7 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000120000', 'b2000000-0000-4000-8000-000000000012', 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000120001', 'b2000000-0000-4000-8000-000000000012', 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000013', 'a1000000-0000-4000-8000-000000000003', '12-digit desktop calculator — solar + battery', 'Large-key desktop calculator, great for accounts and commerce students. Dual power (solar + battery), GT and MU functions. Barely used.', 'calculators', 350, 'like_new', 'available', 'Mukherjee Nagar, Delhi', 'Delhi', 28.7041, 77.2025, 19, now() - interval '3 days' - interval '481 minutes', now() - interval '3 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000130000', 'b2000000-0000-4000-8000-000000000013', 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000014', 'a1000000-0000-4000-8000-000000000003', 'Mid-century velvet sofa — emerald green, 3-seater', 'Solid wood legs, deep velvet seat, extremely comfortable. No stains or tears. Buyer arranges pickup; happy to help carry it down to the lift.', 'furniture', 18000, 'good', 'available', 'Cyber City, Gurugram', 'Gurugram', 28.495, 77.089, 203, now() - interval '9 days' - interval '518 minutes', now() - interval '9 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000140000', 'b2000000-0000-4000-8000-000000000014', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000015', 'a1000000-0000-4000-8000-000000000001', 'Tufted white accent armchair', 'Elegant button-tufted chair with carved legs. Perfect reading corner piece. Fabric professionally cleaned last week.', 'furniture', 6500, 'like_new', 'available', 'Jayanagar 4th Block, Bengaluru', 'Bengaluru', 12.925, 77.5938, 67, now() - interval '4 days' - interval '555 minutes', now() - interval '4 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000150000', 'b2000000-0000-4000-8000-000000000015', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000016', 'a1000000-0000-4000-8000-000000000004', 'Light-wood study stool — sturdy, hostel friendly', 'Simple, sturdy wooden stool — fits under any hostel desk. Seat height 65cm. A few paint marks on the footrest.', 'furniture', 700, 'good', 'available', 'Model Colony, Pune', 'Pune', 18.5314, 73.8446, 22, now() - interval '8 days' - interval '592 minutes', now() - interval '8 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000160000', 'b2000000-0000-4000-8000-000000000016', 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000017', 'a1000000-0000-4000-8000-000000000002', 'Pair of black bar stools with wooden legs', 'Two Eames-style bar stools, 75cm seat height. Moulded seats wipe clean, beech legs with metal footrest. Selling as a pair.', 'furniture', 3200, 'good', 'available', 'Andheri East, Mumbai', 'Mumbai', 19.1136, 72.8697, 45, now() - interval '10 days' - interval '29 minutes', now() - interval '10 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000170000', 'b2000000-0000-4000-8000-000000000017', 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000018', 'a1000000-0000-4000-8000-000000000001', 'Sony mirrorless camera with two lenses', 'Mirrorless body with kit zoom and a 50mm prime. Shutter count around 9,000. Includes two batteries, charger, strap and a 64GB card.', 'electronics', 45000, 'good', 'available', 'Gachibowli, Hyderabad', 'Hyderabad', 17.4401, 78.3489, 174, now() - interval '5 days' - interval '66 minutes', now() - interval '5 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000180000', 'b2000000-0000-4000-8000-000000000018', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000019', 'a1000000-0000-4000-8000-000000000001', 'Over-ear wireless headphones — noise cancelling', 'Bluetooth 5.0, around 25 hours of battery, active noise cancellation. Ear cushions replaced recently. Comes with the carry pouch and AUX cable.', 'electronics', 3500, 'good', 'available', 'Salt Lake Sector V, Kolkata', 'Kolkata', 22.5726, 88.4339, 88, now() - interval '2 days' - interval '103 minutes', now() - interval '2 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000190000', 'b2000000-0000-4000-8000-000000000019', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000190001', 'b2000000-0000-4000-8000-000000000019', 'https://images.unsplash.com/photo-1585298723682-7115561c51b7?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000020', 'a1000000-0000-4000-8000-000000000003', 'JBL Flip 5 portable Bluetooth speaker', 'Waterproof (IPX7), punchy bass, about 12 hours of playback. Used for a handful of trips. USB-C cable included.', 'electronics', 4200, 'like_new', 'available', 'Navrangpura, Ahmedabad', 'Ahmedabad', 23.0365, 72.5611, 52, now() - interval '1 days' - interval '140 minutes', now() - interval '1 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000200000', 'b2000000-0000-4000-8000-000000000020', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000021', 'a1000000-0000-4000-8000-000000000004', 'iPad (7th gen) 32GB + Apple Pencil (1st gen)', 'Great for note-taking and sketching. Battery health is good, screen has a matte paper-feel protector. Includes the Pencil, charger and a folio case.', 'electronics', 21000, 'good', 'available', 'Viman Nagar, Pune', 'Pune', 18.5679, 73.9143, 133, now() - interval '3 days' - interval '177 minutes', now() - interval '3 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000210000', 'b2000000-0000-4000-8000-000000000021', 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000210001', 'b2000000-0000-4000-8000-000000000021', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000022', 'a1000000-0000-4000-8000-000000000003', 'Genuine leather biker jacket — size M', 'Heavy cowhide leather, asymmetric zip, quilted lining. Worn one winter. Fits chest 38 to 40 inches.', 'clothing', 3800, 'good', 'available', 'Lajpat Nagar, New Delhi', 'Delhi', 28.5677, 77.2433, 96, now() - interval '6 days' - interval '214 minutes', now() - interval '6 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000220000', 'b2000000-0000-4000-8000-000000000022', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000023', 'a1000000-0000-4000-8000-000000000002', 'Nike Flyknit running shoes — UK 9', 'Worn for under 40 km. Breathable knit upper, responsive foam. Bought the wrong size online — selling well below retail.', 'clothing', 2900, 'like_new', 'available', 'Powai Lake, Mumbai', 'Mumbai', 19.1272, 72.905, 39, now() - interval '0 days' - interval '251 minutes', now() - interval '0 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000230000', 'b2000000-0000-4000-8000-000000000023', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000230001', 'b2000000-0000-4000-8000-000000000023', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000024', 'a1000000-0000-4000-8000-000000000001', 'Ray-Ban Wayfarer sunglasses — classic black', 'Authentic RB2140, polarised lenses, no scratches. Comes with the original case and cleaning cloth.', 'others', 2500, 'good', 'available', 'MG Road, Bengaluru', 'Bengaluru', 12.9756, 77.605, 48, now() - interval '11 days' - interval '288 minutes', now() - interval '11 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000240000', 'b2000000-0000-4000-8000-000000000024', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;


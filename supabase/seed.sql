-- =============================================================================
-- ReUse Market — seed data
-- 4 demo sellers + 82 listings across every category, with real Unsplash photos
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


-- Additional budget listings (student essentials) ------------------------------
insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000025', 'a1000000-0000-4000-8000-000000000003', 'Let Us C — Yashavant Kanetkar (paperback)', 'Standard first-year C book. A few pencil highlights in the pointers and structures chapters, otherwise clean. Cover slightly bent at one corner.', 'books', 180, 'good', 'available', 'Mukherjee Nagar, Delhi', 'Delhi', 28.7041, 77.2025, 31, now() - interval '3 days' - interval '325 minutes', now() - interval '3 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000250000', 'b2000000-0000-4000-8000-000000000025', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000250001', 'b2000000-0000-4000-8000-000000000025', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000026', 'a1000000-0000-4000-8000-000000000004', 'Data Structures Through C — Yashavant Kanetkar', 'Covers linked lists, trees, graphs, sorting and searching with C code. Few highlights inside, all pages intact. Good for 2nd-semester DSA.', 'books', 220, 'good', 'available', 'Kothrud, Pune', 'Pune', 18.5074, 73.8077, 24, now() - interval '7 days' - interval '362 minutes', now() - interval '7 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000260000', 'b2000000-0000-4000-8000-000000000026', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000027', 'a1000000-0000-4000-8000-000000000001', 'Introduction to Algorithms (CLRS) — 3rd Edition', 'The big CLRS. Indian paperback edition, spine is a bit creased from use but no loose pages. Some notes in pencil in the DP and graph chapters.', 'books', 550, 'good', 'available', 'Koramangala 4th Block, Bengaluru', 'Bengaluru', 12.9352, 77.6245, 72, now() - interval '5 days' - interval '399 minutes', now() - interval '5 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000270000', 'b2000000-0000-4000-8000-000000000027', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000270001', 'b2000000-0000-4000-8000-000000000027', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000028', 'a1000000-0000-4000-8000-000000000002', 'Operating System Concepts — Galvin (Silberschatz)', 'Wiley student edition, 9th Ed. Light underlining in the process scheduling and deadlocks chapters. No torn pages.', 'books', 400, 'good', 'available', 'Matunga (near VJTI), Mumbai', 'Mumbai', 19.027, 72.857, 38, now() - interval '9 days' - interval '436 minutes', now() - interval '9 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000280000', 'b2000000-0000-4000-8000-000000000028', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000029', 'a1000000-0000-4000-8000-000000000003', 'Computer Networks — Andrew S. Tanenbaum', '5th Edition, Pearson. Used for one semester. Clean pages, my name written on the first page. Spine intact.', 'books', 380, 'like_new', 'available', 'Hauz Khas (near IIT Delhi), New Delhi', 'Delhi', 28.545, 77.1926, 29, now() - interval '12 days' - interval '473 minutes', now() - interval '12 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000290000', 'b2000000-0000-4000-8000-000000000029', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000030', 'a1000000-0000-4000-8000-000000000001', 'Database System Concepts — Korth (Silberschatz)', '6th Edition. Highlights in the SQL and normalisation chapters, otherwise good. Cover has a coffee ring on the back.', 'books', 420, 'fair', 'available', 'Ameerpet, Hyderabad', 'Hyderabad', 17.4375, 78.4483, 33, now() - interval '4 days' - interval '510 minutes', now() - interval '4 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000300000', 'b2000000-0000-4000-8000-000000000030', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000031', 'a1000000-0000-4000-8000-000000000004', 'Computer Organization and Architecture — William Stallings', 'Pearson Indian edition. Good condition, a handful of margin notes. Useful for COA and GATE prep.', 'books', 350, 'good', 'available', 'Guindy, Chennai', 'Chennai', 13.0067, 80.2206, 18, now() - interval '15 days' - interval '547 minutes', now() - interval '15 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000310000', 'b2000000-0000-4000-8000-000000000031', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000032', 'a1000000-0000-4000-8000-000000000003', 'An Introduction to Formal Languages and Automata — Peter Linz', 'Theory of Computation (TOC) textbook. Few highlights inside, solved a few exercises in pencil — easy to erase.', 'books', 300, 'good', 'available', 'Sector 62, Noida', 'Noida', 28.627, 77.3727, 21, now() - interval '6 days' - interval '584 minutes', now() - interval '6 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000320000', 'b2000000-0000-4000-8000-000000000032', 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000033', 'a1000000-0000-4000-8000-000000000002', 'Head First Java — Kathy Sierra & Bert Bates', '2nd Edition. Fun, visual way to learn Java. Very clean copy, no highlights. Slight yellowing on page edges.', 'books', 320, 'like_new', 'available', 'Andheri West, Mumbai', 'Mumbai', 19.1364, 72.8296, 44, now() - interval '2 days' - interval '21 minutes', now() - interval '2 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000330000', 'b2000000-0000-4000-8000-000000000033', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000330001', 'b2000000-0000-4000-8000-000000000033', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000034', 'a1000000-0000-4000-8000-000000000001', 'Python Crash Course — Eric Matthes (2nd Ed)', 'Hands-on Python book with projects. Read through once, no markings at all. Great for first-years or self-learners.', 'books', 350, 'like_new', 'available', 'BTM Layout 2nd Stage, Bengaluru', 'Bengaluru', 12.9166, 77.6101, 57, now() - interval '1 days' - interval '58 minutes', now() - interval '1 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000340000', 'b2000000-0000-4000-8000-000000000034', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000035', 'a1000000-0000-4000-8000-000000000004', 'Cracking the Coding Interview — Gayle Laakmann McDowell', '6th Edition, 189 questions. Some questions ticked in pen, a few sticky notes left inside. Placement season saviour.', 'books', 450, 'good', 'available', 'Hinjewadi Phase 1, Pune', 'Pune', 18.5913, 73.7389, 81, now() - interval '8 days' - interval '95 minutes', now() - interval '8 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000350000', 'b2000000-0000-4000-8000-000000000035', 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000350001', 'b2000000-0000-4000-8000-000000000035', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000036', 'a1000000-0000-4000-8000-000000000003', 'Software Engineering — Roger S. Pressman', '7th Edition (McGraw Hill). Cover worn and a few dog-eared pages, but all pages present and readable.', 'books', 300, 'fair', 'available', 'Laxmi Nagar, Delhi', 'Delhi', 28.6304, 77.2777, 14, now() - interval '18 days' - interval '132 minutes', now() - interval '18 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000360000', 'b2000000-0000-4000-8000-000000000036', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000037', 'a1000000-0000-4000-8000-000000000001', 'GATE CSE previous years solved papers — Made Easy', 'Topic-wise solved papers. Around 20 pages have answers marked in pencil. Good for practice before GATE.', 'books', 250, 'good', 'available', 'Vijay Nagar, Indore', 'Indore', 22.7533, 75.8937, 26, now() - interval '10 days' - interval '169 minutes', now() - interval '10 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000370000', 'b2000000-0000-4000-8000-000000000037', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000038', 'a1000000-0000-4000-8000-000000000004', 'CSE 2nd-year books set — DSA, OS, DBMS, CN (4 books)', 'Bundle of four core books: Data Structures (Kanetkar), Galvin OS, Korth DBMS and Tanenbaum CN. Highlights and notes in a few chapters. Cheaper than buying separately.', 'books', 1100, 'good', 'available', 'Jadavpur, Kolkata', 'Kolkata', 22.4955, 88.3709, 63, now() - interval '11 days' - interval '206 minutes', now() - interval '11 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000380000', 'b2000000-0000-4000-8000-000000000038', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000380001', 'b2000000-0000-4000-8000-000000000038', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000039', 'a1000000-0000-4000-8000-000000000002', 'Atomic Habits — James Clear (paperback)', 'Paperback, read once. A few lines highlighted in the first two chapters. No tears or folds.', 'books', 200, 'good', 'available', 'Dadar West, Mumbai', 'Mumbai', 19.0178, 72.8478, 49, now() - interval '2 days' - interval '243 minutes', now() - interval '2 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000390000', 'b2000000-0000-4000-8000-000000000039', 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000040', 'a1000000-0000-4000-8000-000000000001', 'Atomic Habits — James Clear (hardcover)', 'Hardcover edition, like new. Kept on a shelf, dust jacket intact, no markings. Gift-worthy.', 'books', 300, 'like_new', 'available', 'Malleshwaram 8th Cross, Bengaluru', 'Bengaluru', 13.0035, 77.5709, 37, now() - interval '5 days' - interval '280 minutes', now() - interval '5 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000400000', 'b2000000-0000-4000-8000-000000000040', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000400001', 'b2000000-0000-4000-8000-000000000040', 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000041', 'a1000000-0000-4000-8000-000000000003', 'Deep Work — Cal Newport', 'Paperback, good condition. Some underlining in pencil. Great read for exam season.', 'books', 180, 'good', 'available', 'Rajouri Garden, New Delhi', 'Delhi', 28.6415, 77.1209, 22, now() - interval '14 days' - interval '317 minutes', now() - interval '14 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000410000', 'b2000000-0000-4000-8000-000000000041', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000042', 'a1000000-0000-4000-8000-000000000004', 'The Psychology of Money — Morgan Housel', 'Paperback, very clean. Read once, no highlights. Small crease on the back cover.', 'books', 170, 'like_new', 'available', 'Mansarovar, Jaipur', 'Jaipur', 26.8505, 75.7628, 41, now() - interval '3 days' - interval '354 minutes', now() - interval '3 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000420000', 'b2000000-0000-4000-8000-000000000042', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000043', 'a1000000-0000-4000-8000-000000000002', 'Rich Dad Poor Dad — Robert Kiyosaki', 'Older paperback, pages slightly yellowed and spine creased. Fully readable.', 'books', 130, 'fair', 'available', 'Vile Parle East, Mumbai', 'Mumbai', 19.099, 72.844, 17, now() - interval '19 days' - interval '391 minutes', now() - interval '19 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000430000', 'b2000000-0000-4000-8000-000000000043', 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000044', 'a1000000-0000-4000-8000-000000000001', 'Ikigai — Héctor García & Francesc Miralles', 'Small hardbound-style paperback. Clean pages, no notes. Light shelf wear on the cover.', 'books', 150, 'good', 'available', 'T. Nagar, Chennai', 'Chennai', 13.0418, 80.2341, 28, now() - interval '7 days' - interval '428 minutes', now() - interval '7 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000440000', 'b2000000-0000-4000-8000-000000000044', 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000045', 'a1000000-0000-4000-8000-000000000003', 'The Power of Your Subconscious Mind — Joseph Murphy', 'Budget paperback edition. A few highlighted lines, cover slightly faded.', 'books', 120, 'fair', 'available', 'Aliganj, Lucknow', 'Lucknow', 26.892, 80.942, 12, now() - interval '16 days' - interval '465 minutes', now() - interval '16 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000450000', 'b2000000-0000-4000-8000-000000000045', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000046', 'a1000000-0000-4000-8000-000000000004', 'Think and Grow Rich — Napoleon Hill', 'Paperback, good condition. Name written inside cover. No missing pages.', 'books', 140, 'good', 'available', 'Palasia, Indore', 'Indore', 22.7244, 75.8839, 15, now() - interval '9 days' - interval '502 minutes', now() - interval '9 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000460000', 'b2000000-0000-4000-8000-000000000046', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000047', 'a1000000-0000-4000-8000-000000000002', 'Self-improvement set — Atomic Habits, Ikigai, Psychology of Money + 2 more', 'Five books: Atomic Habits, Ikigai, The Psychology of Money, Deep Work and Rich Dad Poor Dad. Mixed condition — two have light highlights, rest clean. Selling as a set.', 'books', 650, 'good', 'available', 'Wakad, Pune', 'Pune', 18.5975, 73.77, 52, now() - interval '4 days' - interval '539 minutes', now() - interval '4 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000470000', 'b2000000-0000-4000-8000-000000000047', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000470001', 'b2000000-0000-4000-8000-000000000047', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000048', 'a1000000-0000-4000-8000-000000000001', 'HP 250 G7 — i3 8th Gen, 8GB RAM, 256GB SSD', 'Upgraded to SSD, boots in seconds. Battery backup about 2–2.5 hrs. Original charger included. Small scratches on the lid, keyboard and screen fine.', 'laptops', 14500, 'good', 'available', 'Electronic City Phase 1, Bengaluru', 'Bengaluru', 12.8452, 77.6602, 96, now() - interval '6 days' - interval '576 minutes', now() - interval '6 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000480000', 'b2000000-0000-4000-8000-000000000048', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000049', 'a1000000-0000-4000-8000-000000000003', 'HP Pavilion 15 — i5 10th Gen, 8GB, 512GB SSD', 'Bought in 2021. Battery health ~80%, gives 3.5 hrs on normal use. Charger included. Clean Windows 11, no dents. Bill available.', 'laptops', 24000, 'like_new', 'available', 'Sector 18, Noida', 'Noida', 28.5708, 77.326, 118, now() - interval '3 days' - interval '13 minutes', now() - interval '3 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000490000', 'b2000000-0000-4000-8000-000000000049', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000490001', 'b2000000-0000-4000-8000-000000000049', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000050', 'a1000000-0000-4000-8000-000000000004', 'HP Chromebook 14 — 4GB RAM, 64GB storage', 'Light and simple for browsing, Google Docs and online classes. Battery 5–6 hrs. Charger included. Some wear on palm rest.', 'laptops', 9000, 'fair', 'available', 'Garia, Kolkata', 'Kolkata', 22.4637, 88.3895, 47, now() - interval '13 days' - interval '50 minutes', now() - interval '13 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000500000', 'b2000000-0000-4000-8000-000000000050', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000051', 'a1000000-0000-4000-8000-000000000002', 'Dell Inspiron 3511 — i3 11th Gen, 8GB, 256GB SSD', '15.6" FHD screen. Battery backup about 3 hrs. Original Dell charger included. Under 2 years old, no repairs.', 'laptops', 18500, 'good', 'available', 'Andheri West, Mumbai', 'Mumbai', 19.1364, 72.8296, 89, now() - interval '8 days' - interval '87 minutes', now() - interval '8 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000510000', 'b2000000-0000-4000-8000-000000000051', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000052', 'a1000000-0000-4000-8000-000000000001', 'Dell Latitude 5490 (ex-corporate) — i5 8th Gen, 8GB, 256GB SSD', 'Sturdy business laptop from an office lot. Battery holds ~2 hrs (replaceable). Charger included. Minor scuffs on the body, backlit keyboard works.', 'laptops', 16000, 'good', 'available', 'Whitefield, Bengaluru', 'Bengaluru', 12.9698, 77.75, 74, now() - interval '10 days' - interval '124 minutes', now() - interval '10 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000520000', 'b2000000-0000-4000-8000-000000000052', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000053', 'a1000000-0000-4000-8000-000000000003', 'Dell Vostro 3400 — i5 11th Gen, 8GB, 512GB SSD', '14" thin and light. Battery backup 4 hrs. Charger and original box included. Like-new, used mostly on a desk.', 'laptops', 26000, 'like_new', 'available', 'Malviya Nagar, Jaipur', 'Jaipur', 26.8549, 75.8243, 102, now() - interval '2 days' - interval '161 minutes', now() - interval '2 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000530000', 'b2000000-0000-4000-8000-000000000053', 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000054', 'a1000000-0000-4000-8000-000000000002', 'Apple MacBook Air 2017 — i5, 8GB, 128GB', '13-inch, battery health 78% (about 3–4 hrs). Original MagSafe 2 charger included. Light scratches on the bottom, screen perfect. Runs macOS Monterey.', 'laptops', 22000, 'good', 'available', 'Dadar West, Mumbai', 'Mumbai', 19.0178, 72.8478, 141, now() - interval '5 days' - interval '198 minutes', now() - interval '5 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000540000', 'b2000000-0000-4000-8000-000000000054', 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000540001', 'b2000000-0000-4000-8000-000000000054', 'https://images.unsplash.com/photo-1602080858428-57174f9431cf?auto=format&fit=crop&w=1400&q=80', null, 1) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000055', 'a1000000-0000-4000-8000-000000000004', 'Apple MacBook Pro 2015 13" — i5, 8GB, 256GB', 'Retina display, battery replaced last year (≈5 hrs). MagSafe charger included. Small dent near one corner. Great for coding.', 'laptops', 28000, 'good', 'available', 'Navrangpura, Ahmedabad', 'Ahmedabad', 23.0365, 72.5611, 133, now() - interval '7 days' - interval '235 minutes', now() - interval '7 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000550000', 'b2000000-0000-4000-8000-000000000055', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000056', 'a1000000-0000-4000-8000-000000000001', 'Lenovo ThinkPad T470 (refurbished) — i5 6th Gen, 8GB, 256GB SSD', 'Refurbished with new SSD and fresh Windows 10. Dual battery, total backup about 3 hrs. Charger included. Legendary keyboard.', 'laptops', 13500, 'fair', 'available', 'Kukatpally (near JNTU), Hyderabad', 'Hyderabad', 17.4948, 78.3996, 66, now() - interval '12 days' - interval '272 minutes', now() - interval '12 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000560000', 'b2000000-0000-4000-8000-000000000056', 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000057', 'a1000000-0000-4000-8000-000000000003', 'Lenovo IdeaPad Slim 3 — Ryzen 5, 8GB, 512GB SSD', 'Bought in 2022, battery backup 5 hrs. Charger included. A tiny scratch on the lid, otherwise spotless.', 'laptops', 25000, 'like_new', 'available', 'Gomti Nagar, Lucknow', 'Lucknow', 26.856, 81, 87, now() - interval '1 days' - interval '309 minutes', now() - interval '1 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000570000', 'b2000000-0000-4000-8000-000000000057', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000058', 'a1000000-0000-4000-8000-000000000004', 'Acer Aspire 5 — i5 10th Gen, 8GB, 512GB', 'Battery gives around 3 hrs. Charger included. One rubber foot missing, keyboard backlight works. Good for college projects.', 'laptops', 23000, 'good', 'available', 'Velachery, Chennai', 'Chennai', 12.9815, 80.218, 58, now() - interval '9 days' - interval '346 minutes', now() - interval '9 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000580000', 'b2000000-0000-4000-8000-000000000058', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000059', 'a1000000-0000-4000-8000-000000000002', 'Asus VivoBook 15 — i3 10th Gen, 8GB, 256GB SSD', 'Battery backup about 2.5 hrs. Charger included (third-party, works fine). Some keys are shiny from use.', 'laptops', 17000, 'fair', 'available', 'Katraj, Pune', 'Pune', 18.4575, 73.8677, 43, now() - interval '15 days' - interval '383 minutes', now() - interval '15 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000590000', 'b2000000-0000-4000-8000-000000000059', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000060', 'a1000000-0000-4000-8000-000000000001', 'Redmi Note 10 — 4GB/64GB, Shadow Black', 'Battery lasts a full day. Charger included, no box. Minor scratches on the frame; screen guard applied since day one.', 'mobiles', 6500, 'good', 'available', 'BTM Layout 2nd Stage, Bengaluru', 'Bengaluru', 12.9166, 77.6101, 64, now() - interval '4 days' - interval '420 minutes', now() - interval '4 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000600000', 'b2000000-0000-4000-8000-000000000060', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000061', 'a1000000-0000-4000-8000-000000000003', 'Samsung Galaxy M31 — 6GB/128GB, 6000mAh', 'Huge battery, easily 1.5 days. Charger and box included. Back panel has light scratches.', 'mobiles', 7000, 'good', 'available', 'Dilsukhnagar, Hyderabad', 'Hyderabad', 17.3688, 78.5247, 52, now() - interval '11 days' - interval '457 minutes', now() - interval '11 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000610000', 'b2000000-0000-4000-8000-000000000061', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000062', 'a1000000-0000-4000-8000-000000000002', 'iPhone XR — 64GB, battery health 81%', 'Face ID and cameras work perfectly. Battery health 81%. Cable only, no adapter. Small dent on the side frame.', 'mobiles', 14000, 'fair', 'available', 'Vastrapur, Ahmedabad', 'Ahmedabad', 23.0395, 72.5293, 109, now() - interval '6 days' - interval '494 minutes', now() - interval '6 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000620000', 'b2000000-0000-4000-8000-000000000062', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000063', 'a1000000-0000-4000-8000-000000000004', 'Realme 8 — 6GB/128GB, Cyber Silver', 'Super AMOLED, 30W Dart charger included. Bought in 2022, no repairs. Selling because I upgraded.', 'mobiles', 6000, 'like_new', 'available', 'Salt Lake Sector I, Kolkata', 'Kolkata', 22.5867, 88.417, 38, now() - interval '17 days' - interval '531 minutes', now() - interval '17 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000630000', 'b2000000-0000-4000-8000-000000000063', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000064', 'a1000000-0000-4000-8000-000000000003', 'Casio fx-991ES Plus scientific calculator', 'Allowed in most university exams. All buttons work, cover included. Small scratch on the display window.', 'calculators', 550, 'good', 'available', 'Kamla Nagar, Delhi', 'Delhi', 28.6812, 77.205, 34, now() - interval '2 days' - interval '568 minutes', now() - interval '2 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000640000', 'b2000000-0000-4000-8000-000000000064', 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000065', 'a1000000-0000-4000-8000-000000000001', 'Casio fx-82MS scientific calculator', 'Basic scientific calculator for school and 1st year. Works perfectly, battery replaced recently. Cover slightly loose.', 'calculators', 300, 'fair', 'available', 'Hazratganj, Lucknow', 'Lucknow', 26.85, 80.946, 19, now() - interval '5 days' - interval '5 minutes', now() - interval '5 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000650000', 'b2000000-0000-4000-8000-000000000065', 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000066', 'a1000000-0000-4000-8000-000000000002', 'Logitech wireless mouse with USB receiver', 'Logitech M-series wireless mouse. Smooth scroll, battery included. Light wear on the top shell.', 'electronics', 350, 'good', 'available', 'Matunga (near VJTI), Mumbai', 'Mumbai', 19.027, 72.857, 23, now() - interval '3 days' - interval '42 minutes', now() - interval '3 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000660000', 'b2000000-0000-4000-8000-000000000066', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000067', 'a1000000-0000-4000-8000-000000000001', 'Mechanical keyboard — blue switches, RGB', 'Full-size mechanical keyboard with clicky blue switches. All keys work, one keycap slightly faded. USB cable attached.', 'electronics', 1200, 'good', 'available', 'Koramangala 4th Block, Bengaluru', 'Bengaluru', 12.9352, 77.6245, 45, now() - interval '8 days' - interval '79 minutes', now() - interval '8 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000670000', 'b2000000-0000-4000-8000-000000000067', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000068', 'a1000000-0000-4000-8000-000000000003', 'Dell 22" Full HD monitor (HDMI + VGA)', '1080p IPS panel, no dead pixels. Stand and power cable included, HDMI cable included. Small scratch on the bezel.', 'electronics', 4500, 'good', 'available', 'Sector 125, Noida', 'Noida', 28.544, 77.333, 61, now() - interval '10 days' - interval '116 minutes', now() - interval '10 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000680000', 'b2000000-0000-4000-8000-000000000068', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000069', 'a1000000-0000-4000-8000-000000000004', 'boAt Rockerz wireless headphones', 'Bluetooth headphones, battery about 8 hrs now. Charging cable included. Ear cushions show some peeling.', 'electronics', 700, 'fair', 'available', 'Bhawarkua, Indore', 'Indore', 22.6926, 75.8676, 27, now() - interval '13 days' - interval '153 minutes', now() - interval '13 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000690000', 'b2000000-0000-4000-8000-000000000069', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000070', 'a1000000-0000-4000-8000-000000000002', '1TB external hard disk (USB 3.0)', 'Portable 1TB HDD, formatted and health-checked (no bad sectors). USB cable and pouch included.', 'electronics', 2200, 'like_new', 'available', 'Hinjewadi Phase 1, Pune', 'Pune', 18.5913, 73.7389, 39, now() - interval '6 days' - interval '190 minutes', now() - interval '6 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000700000', 'b2000000-0000-4000-8000-000000000070', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000071', 'a1000000-0000-4000-8000-000000000001', 'Laptop cooling pad — dual fan, USB powered', 'Fits up to 15.6" laptops. Both fans spin fine, slightly noisy at high speed. Adjustable height.', 'electronics', 400, 'good', 'available', 'Maninagar, Ahmedabad', 'Ahmedabad', 22.9962, 72.6029, 11, now() - interval '20 days' - interval '227 minutes', now() - interval '20 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000710000', 'b2000000-0000-4000-8000-000000000071', 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000072', 'a1000000-0000-4000-8000-000000000003', 'Hostel study table — engineered wood with drawer', 'Compact study table, fits a hostel room. One drawer and a shelf. Some marker stains on top. Buyer picks up.', 'furniture', 1500, 'fair', 'available', 'Kukatpally (near JNTU), Hyderabad', 'Hyderabad', 17.4948, 78.3996, 30, now() - interval '7 days' - interval '264 minutes', now() - interval '7 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000720000', 'b2000000-0000-4000-8000-000000000072', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000073', 'a1000000-0000-4000-8000-000000000004', 'Foldable study chair — metal frame', 'Folds flat, easy to carry. Cushioned seat, no wobble. A few paint chips on the legs.', 'furniture', 600, 'good', 'available', 'Tambaram, Chennai', 'Chennai', 12.9249, 80.1, 16, now() - interval '4 days' - interval '301 minutes', now() - interval '4 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000730000', 'b2000000-0000-4000-8000-000000000073', 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000074', 'a1000000-0000-4000-8000-000000000002', '4-tier bookshelf — wooden, free-standing', '4 open shelves, holds a full semester of books. Easy to dismantle for transport. Light scratches.', 'furniture', 1200, 'good', 'available', 'Jadavpur, Kolkata', 'Kolkata', 22.4955, 88.3709, 25, now() - interval '9 days' - interval '338 minutes', now() - interval '9 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000740000', 'b2000000-0000-4000-8000-000000000074', 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000075', 'a1000000-0000-4000-8000-000000000001', 'Single mattress — 6 x 3 ft, 5 inch foam', 'Used for one year in a PG. Clean, no stains, cover washable. Moving out, need it gone this week.', 'furniture', 1800, 'good', 'available', 'Vaishali Nagar, Jaipur', 'Jaipur', 26.9115, 75.7432, 20, now() - interval '3 days' - interval '375 minutes', now() - interval '3 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000750000', 'b2000000-0000-4000-8000-000000000075', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000076', 'a1000000-0000-4000-8000-000000000003', 'Hero Sprint gear cycle — 21 speed', '21-speed Shimano gears, both brakes work well. Tyres have some life left. Rust spots on the stand. Good for campus.', 'bicycles', 3500, 'fair', 'available', 'Laxmi Nagar, Delhi', 'Delhi', 28.6304, 77.2777, 42, now() - interval '14 days' - interval '412 minutes', now() - interval '14 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000760000', 'b2000000-0000-4000-8000-000000000076', 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000077', 'a1000000-0000-4000-8000-000000000004', 'Btwin MyBike — single speed, with basket', 'Decathlon Btwin city bike with front basket and stand. Serviced last month, new chain. Seat slightly torn.', 'bicycles', 2800, 'good', 'available', 'Vijay Nagar, Indore', 'Indore', 22.7533, 75.8937, 33, now() - interval '5 days' - interval '449 minutes', now() - interval '5 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000770000', 'b2000000-0000-4000-8000-000000000077', 'https://images.unsplash.com/photo-1529422643029-d4585747aaf2?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000078', 'a1000000-0000-4000-8000-000000000002', 'College hoodie — size L, navy blue', 'Warm fleece hoodie, washed many times but no holes. Logo print slightly faded.', 'clothing', 350, 'good', 'available', 'Guindy, Chennai', 'Chennai', 13.0067, 80.2206, 18, now() - interval '12 days' - interval '486 minutes', now() - interval '12 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000780000', 'b2000000-0000-4000-8000-000000000078', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000079', 'a1000000-0000-4000-8000-000000000001', 'Formal blazer — size M, charcoal grey', 'Worn twice for placement interviews. Dry-cleaned, no stains. Fits chest 38–40 inches.', 'clothing', 900, 'like_new', 'available', 'Gomti Nagar, Lucknow', 'Lucknow', 26.856, 81, 29, now() - interval '6 days' - interval '523 minutes', now() - interval '6 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000790000', 'b2000000-0000-4000-8000-000000000079', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000080', 'a1000000-0000-4000-8000-000000000003', 'Engineering drafter + drawing kit (mini-drafter, set squares, compass)', 'Everything for 1st-year Engineering Drawing: mini-drafter, set squares, compass set, scale and clips. Drafter works smoothly.', 'others', 400, 'good', 'available', 'Kothrud, Pune', 'Pune', 18.5074, 73.8077, 37, now() - interval '9 days' - interval '560 minutes', now() - interval '9 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000800000', 'b2000000-0000-4000-8000-000000000080', 'https://images.unsplash.com/photo-1503694978374-8a2fa686963a?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000081', 'a1000000-0000-4000-8000-000000000004', 'White lab coat — size M, full sleeves', 'Used for chemistry/physics labs in 1st year. Washed and ironed, a faint stain on one pocket.', 'others', 150, 'fair', 'available', 'Ameerpet, Hyderabad', 'Hyderabad', 17.4375, 78.4483, 13, now() - interval '1 days' - interval '597 minutes', now() - interval '1 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000810000', 'b2000000-0000-4000-8000-000000000081', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

insert into public.listings (id, seller_id, title, description, category, price, condition, status, address, city, lat, lng, views, created_at, updated_at)
values ('b2000000-0000-4000-8000-000000000082', 'a1000000-0000-4000-8000-000000000002', 'Study table lamp — LED, adjustable neck', 'Warm/cool white LED, USB powered. Flexible neck. Works perfectly; small crack on the base, doesn''t affect use.', 'others', 300, 'good', 'available', 'Sector 62, Noida', 'Noida', 28.627, 77.3727, 21, now() - interval '8 days' - interval '34 minutes', now() - interval '8 days')
on conflict (id) do nothing;
insert into public.listing_images (id, listing_id, url, storage_path, position)
values ('c3000000-0000-4000-8000-000000820000', 'b2000000-0000-4000-8000-000000000082', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1400&q=80', null, 0) on conflict (id) do nothing;

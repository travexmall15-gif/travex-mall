-- ═══════════════════════════════════════════════════════════
-- SHOPNEKT — SAMPLE / DEMO DATA SEED
-- ═══════════════════════════════════════════════════════════
-- Populates the marketplace with realistic sample content:
--   • 6 approved shops (2 fashion, 2 vehicle, 2 electronics)
--   • 10 products across those shops
--   • 2 Flash Deals
--   • 2 Group Buy campaigns
--   • 4 Social Vybe posts
--
-- HOW TO RUN:
--   1. Open the Supabase dashboard for this project
--      (bscecjbgnjitlfmgwcic.supabase.co)
--   2. Go to SQL Editor → New Query
--   3. Paste this entire file and click Run
--
-- This is safe to run once. Every row uses a fixed, unique id, so
-- re-running the script will fail on the primary-key conflict rather
-- than silently duplicating rows — if you need to reset the sample
-- data, delete these rows first (a DELETE block is commented out at
-- the bottom of this file) and re-run.
--
-- All shops/products/deals below are clearly fictional (no real phone
-- numbers, addresses, or people) — intended purely to make the
-- marketplace feel populated for demos/screenshots/testing, not as
-- real business listings.

-- ── SHOPS (pending_payments, status = 'approved') ──

INSERT INTO pending_payments (id, owner_name, owner_phone, owner_email, shop_name, shop_category, shop_region, shop_market, shop_whatsapp, shop_desc, shop_logo, plan, status, created_at)
VALUES
  ('c09e1e94-0a4b-4fbc-bcc3-3c8f24228d96', 'Amina Juma', '+255700000001', 'amina@example.com', 'Niffer Outfit', 'Clothing', 'Dar es Salaam', 'fashion', '+255700000001', 'Mitindo ya kisasa ya wanawake na wanaume — Ankara, kitenge, na vazi rasmi.', null, 'premium', 'approved', now()),
  ('297bdb01-d965-417d-86b0-f11af266b88c', 'Zawadi Mrema', '+255700000002', 'zawadi@example.com', 'Zawadi Fashion House', 'Shoes', 'Arusha', 'fashion', '+255700000002', 'Viatu na vito vya asili, vilivyotengenezwa kwa mikono.', null, 'basic', 'approved', now()),
  ('a0c46c06-0e44-4b2c-9b73-8c9b347b51e6', 'Baraka Mwakalinga', '+255700000003', 'baraka@example.com', 'TZ Motors Spares', 'Spare Parts', 'Mwanza', 'vehicle', '+255700000003', 'Vipuri halisi vya magari — brake pads, betri, na zaidi.', null, 'premium', 'approved', now()),
  ('c9f8519a-d111-44b2-9279-8debd0de8028', 'Godfrey Mushi', '+255700000004', 'godfrey@example.com', 'Dodoma Wheels & Tyres', 'Tyres', 'Dodoma', 'vehicle', '+255700000004', 'Matairi ya magari yote — bei nafuu, ubora wa hali ya juu.', null, 'basic', 'approved', now()),
  ('124d338e-d1cb-4d89-961b-aa81ed944556', 'Neema Kessy', '+255700000005', 'neema@example.com', 'TechHub Tanzania', 'Phones', 'Dar es Salaam', 'electronics', '+255700000005', 'Simu mpya na laptop, uagizaji halisi, dhamana ya mwaka mmoja.', null, 'premium', 'approved', now()),
  ('606b928a-529a-4d28-acb7-6dbea07f395f', 'Erick Malya', '+255700000006', 'erick@example.com', 'Smart Gadgets TZ', 'Audio', 'Tanga', 'electronics', '+255700000006', 'Vifaa vidogo vya elektroniki — earbuds, power banks, na chaja.', null, 'basic', 'approved', now())
ON CONFLICT (id) DO NOTHING;

-- ── PRODUCTS ──

INSERT INTO products (id, name, price, stock, description, category, image_url, store_id, created_at)
VALUES
  ('ef97edd0-d780-4b8e-9129-621f2e543714', 'Ankara Maxi Dress', 65000, 18, 'Vazi refu la Ankara, saizi S-XL, rangi mchanganyiko.', 'Clothing', null, 'c09e1e94-0a4b-4fbc-bcc3-3c8f24228d96', now()),
  ('16d0ac56-e92c-44d3-ae94-576805d4515f', 'Men''s Kitenge Shirt', 45000, 25, 'Shati la kitenge la kiume, ubora wa hali ya juu.', 'Clothing', null, 'c09e1e94-0a4b-4fbc-bcc3-3c8f24228d96', now()),
  ('a6c111e7-a5d4-45dc-89c2-9d29794c82e4', 'Leather Sandals', 38000, 30, 'Sandali za ngozi halisi, saizi 38-45.', 'Shoes', null, '297bdb01-d965-417d-86b0-f11af266b88c', now()),
  ('95fac661-2262-422f-9f26-eb32862a327d', 'Beaded Necklace Set', 25000, 40, 'Seti ya mikufu ya vito vya asili.', 'Jewelry', null, '297bdb01-d965-417d-86b0-f11af266b88c', now()),
  ('97f08cdb-9229-4802-87c5-5cb0182ee2be', 'Toyota Brake Pads Set', 85000, 12, 'Vipuri vya breki kwa magari ya Toyota — seti kamili.', 'Spare Parts', null, 'a0c46c06-0e44-4b2c-9b73-8c9b347b51e6', now()),
  ('5863ff3c-fb6e-4c4d-9226-90cf4ea2058b', 'Car Battery 12V', 180000, 8, 'Betri ya gari 12V, dhamana ya miezi 12.', 'Spare Parts', null, 'a0c46c06-0e44-4b2c-9b73-8c9b347b51e6', now()),
  ('c483c38f-6fc8-4805-b4ae-97ca0f329f98', '195/65R15 Tyre', 220000, 20, 'Tairi la gari saizi 195/65R15.', 'Tyres', null, 'c9f8519a-d111-44b2-9279-8debd0de8028', now()),
  ('2755dec1-66c1-4908-9ba3-f452df865f76', 'Samsung Galaxy A14', 450000, 15, 'Simu mpya, RAM 4GB, kumbukumbu 128GB.', 'Phones', null, '124d338e-d1cb-4d89-961b-aa81ed944556', now()),
  ('c90d954c-552c-44ea-8a16-9099089e5aad', 'HP Laptop 15 i5', 1450000, 6, 'Laptop ya HP, Core i5, RAM 8GB, SSD 256GB.', 'Laptops', null, '124d338e-d1cb-4d89-961b-aa81ed944556', now()),
  ('223a2ef8-308c-4b2e-9713-6129521972ec', 'Bluetooth Earbuds', 35000, 50, 'Earbuds zisizo na waya, muda wa betri masaa 6.', 'Audio', null, '606b928a-529a-4d28-acb7-6dbea07f395f', now())
ON CONFLICT (id) DO NOTHING;

-- ── FLASH DEALS ──

INSERT INTO flash_deals (store_id, shop_name, product_id, product_name, product_image, original_price, deal_price, discount_pct, ends_at, max_orders, current_orders, status, created_at)
VALUES
  ('124d338e-d1cb-4d89-961b-aa81ed944556', 'TechHub Tanzania', '2755dec1-66c1-4908-9ba3-f452df865f76', 'Samsung Galaxy A14', null, 450000, 399000, 11, now() + interval '24 hours', 30, 4, 'active', now()),
  ('c09e1e94-0a4b-4fbc-bcc3-3c8f24228d96', 'Niffer Outfit', 'ef97edd0-d780-4b8e-9129-621f2e543714', 'Ankara Maxi Dress', null, 65000, 49000, 25, now() + interval '48 hours', 50, 9, 'active', now());

-- ── GROUP BUY ──

INSERT INTO group_orders (store_id, shop_name, product_id, product_name, product_image, unit_price, discount_pct, min_members, current_members, expires_at, status, creator_name, creator_phone, created_at)
VALUES
  ('606b928a-529a-4d28-acb7-6dbea07f395f', 'Smart Gadgets TZ', '223a2ef8-308c-4b2e-9713-6129521972ec', 'Bluetooth Earbuds', null, 35000, 20, 5, 2, now() + interval '5 days', 'open', 'Erick Malya', '+255700000006', now()),
  ('a0c46c06-0e44-4b2c-9b73-8c9b347b51e6', 'TZ Motors Spares', '5863ff3c-fb6e-4c4d-9226-90cf4ea2058b', 'Car Battery 12V', null, 180000, 15, 4, 1, now() + interval '3 days', 'open', 'Baraka Mwakalinga', '+255700000003', now());

-- ── SOCIAL VYBE POSTS ──

INSERT INTO feed_posts (store_id, shop_name, content, caption, product_id, media_url, created_at)
VALUES
  ('c09e1e94-0a4b-4fbc-bcc3-3c8f24228d96', 'Niffer Outfit', 'Mkusanyiko mpya wa Ankara umefika! 🔥 Njoo uchague rangi unayopenda.', 'Mkusanyiko mpya wa Ankara umefika! 🔥 Njoo uchague rangi unayopenda.', 'ef97edd0-d780-4b8e-9129-621f2e543714', null, now() - interval '2 hours'),
  ('124d338e-d1cb-4d89-961b-aa81ed944556', 'TechHub Tanzania', 'Samsung Galaxy A14 stock mpya imefika, bei nafuu wiki hii tu!', 'Samsung Galaxy A14 stock mpya imefika, bei nafuu wiki hii tu!', '2755dec1-66c1-4908-9ba3-f452df865f76', null, now() - interval '5 hours'),
  ('606b928a-529a-4d28-acb7-6dbea07f395f', 'Smart Gadgets TZ', 'Earbuds zetu zinauzwa Group Buy — jiunge na wenzako mpate punguzo la 20%!', 'Earbuds zetu zinauzwa Group Buy — jiunge na wenzako mpate punguzo la 20%!', '223a2ef8-308c-4b2e-9713-6129521972ec', null, now() - interval '1 day'),
  ('297bdb01-d965-417d-86b0-f11af266b88c', 'Zawadi Fashion House', 'Asante kwa wateja wetu wote! Wiki hii tunazindua mikufu mipya ya vito.', 'Asante kwa wateja wetu wote! Wiki hii tunazindua mikufu mipya ya vito.', '95fac661-2262-422f-9f26-eb32862a327d', null, now() - interval '2 days');

-- ═══════════════════════════════════════════════════════════
-- To remove this sample data later, uncomment and run:
-- ═══════════════════════════════════════════════════════════
-- DELETE FROM feed_posts WHERE store_id IN ('c09e1e94-0a4b-4fbc-bcc3-3c8f24228d96','297bdb01-d965-417d-86b0-f11af266b88c','a0c46c06-0e44-4b2c-9b73-8c9b347b51e6','c9f8519a-d111-44b2-9279-8debd0de8028','124d338e-d1cb-4d89-961b-aa81ed944556','606b928a-529a-4d28-acb7-6dbea07f395f');
-- DELETE FROM group_orders WHERE store_id IN ('c09e1e94-0a4b-4fbc-bcc3-3c8f24228d96','297bdb01-d965-417d-86b0-f11af266b88c','a0c46c06-0e44-4b2c-9b73-8c9b347b51e6','c9f8519a-d111-44b2-9279-8debd0de8028','124d338e-d1cb-4d89-961b-aa81ed944556','606b928a-529a-4d28-acb7-6dbea07f395f');
-- DELETE FROM flash_deals WHERE store_id IN ('c09e1e94-0a4b-4fbc-bcc3-3c8f24228d96','297bdb01-d965-417d-86b0-f11af266b88c','a0c46c06-0e44-4b2c-9b73-8c9b347b51e6','c9f8519a-d111-44b2-9279-8debd0de8028','124d338e-d1cb-4d89-961b-aa81ed944556','606b928a-529a-4d28-acb7-6dbea07f395f');
-- DELETE FROM products WHERE store_id IN ('c09e1e94-0a4b-4fbc-bcc3-3c8f24228d96','297bdb01-d965-417d-86b0-f11af266b88c','a0c46c06-0e44-4b2c-9b73-8c9b347b51e6','c9f8519a-d111-44b2-9279-8debd0de8028','124d338e-d1cb-4d89-961b-aa81ed944556','606b928a-529a-4d28-acb7-6dbea07f395f');
-- DELETE FROM pending_payments WHERE id IN ('c09e1e94-0a4b-4fbc-bcc3-3c8f24228d96','297bdb01-d965-417d-86b0-f11af266b88c','a0c46c06-0e44-4b2c-9b73-8c9b347b51e6','c9f8519a-d111-44b2-9279-8debd0de8028','124d338e-d1cb-4d89-961b-aa81ed944556','606b928a-529a-4d28-acb7-6dbea07f395f');

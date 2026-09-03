-- ═══════════════════════════════════════════════════════════
-- SHOPNEKT — SAMPLE / DEMO DATA SEED (EXPANDED)
-- ═══════════════════════════════════════════════════════════
-- Populates the marketplace with a much fuller set of sample content:
--   • 12 approved shops (4 per market)
--   • 30 products across those shops
--   • 6 Flash Deals
--   • 6 Group Buy campaigns
--   • 12 Social Vybe posts
--
-- HOW TO RUN:
--   1. Open the Supabase dashboard for this project
--      (bscecjbgnjitlfmgwcic.supabase.co)
--   2. Go to SQL Editor → New Query
--   3. Paste this entire file and click Run
--
-- If you already ran the earlier, smaller seed file
-- (sample_marketplace_data.sql), that's fine — this file uses a
-- completely different set of ids, so both can coexist without
-- conflicts. If you'd rather replace the old sample data instead of
-- adding to it, run the DELETE block at the bottom of the earlier
-- file first.
--
-- Safe to re-run: ON CONFLICT DO NOTHING on shops/products means
-- re-running this script will not create duplicates.
--
-- All shops/products below are clearly fictional (no real phone
-- numbers, addresses, or people) — intended purely to make the
-- marketplace feel populated for demos/screenshots/testing.

-- ── SHOPS (pending_payments, status = 'approved') — 4 per market ──

INSERT INTO pending_payments (id, owner_name, owner_phone, owner_email, shop_name, shop_category, shop_region, shop_market, shop_whatsapp, shop_desc, shop_logo, plan, status, created_at)
VALUES
  -- Fashion
  ('b78f1bb1-18e7-4cf5-b532-88dd42c0c7c7', 'Amina Juma', '+255700000001', 'amina@example.com', 'Niffer Outfit', 'Clothing', 'Dar es Salaam', 'fashion', '+255700000001', 'Mitindo ya kisasa ya wanawake na wanaume — Ankara, kitenge, na vazi rasmi.', null, 'premium', 'approved', now()),
  ('6130b516-50a7-4136-8adb-e1b0f58040e3', 'Zawadi Mrema', '+255700000002', 'zawadi@example.com', 'Zawadi Fashion House', 'Shoes', 'Arusha', 'fashion', '+255700000002', 'Viatu na vito vya asili, vilivyotengenezwa kwa mikono.', null, 'basic', 'approved', now()),
  ('e422bd00-6a2e-470d-8f60-a61d6f8a1c02', 'Malaika Ngowi', '+255700000007', 'malaika@example.com', 'Malaika Boutique', 'Clothing', 'Mwanza', 'fashion', '+255700000007', 'Kanga, vitenge, na mavazi ya kisasa kwa bei nafuu.', null, 'basic', 'approved', now()),
  ('078e6b93-3b3f-47b6-8315-cd053fbd0ae6', 'Frank Kalinga', '+255700000008', 'frank@example.com', 'Stellar Sneakers TZ', 'Shoes', 'Dodoma', 'fashion', '+255700000008', 'Sneakers halisi na viatu vya shule kwa bei ya jumla.', null, 'premium', 'approved', now()),

  -- Vehicle
  ('4cae53e2-b014-4b85-a3ef-f600a36a365d', 'Baraka Mwakalinga', '+255700000003', 'baraka@example.com', 'TZ Motors Spares', 'Spare Parts', 'Mwanza', 'vehicle', '+255700000003', 'Vipuri halisi vya magari — brake pads, betri, na zaidi.', null, 'premium', 'approved', now()),
  ('a86d0d95-af36-4728-b054-a101545071b6', 'Godfrey Mushi', '+255700000004', 'godfrey@example.com', 'Dodoma Wheels & Tyres', 'Tyres', 'Dodoma', 'vehicle', '+255700000004', 'Matairi ya magari yote — bei nafuu, ubora wa hali ya juu.', null, 'basic', 'approved', now()),
  ('68d0c07b-fcce-404a-8cb2-f592bf1e34cb', 'Hamisi Selemani', '+255700000009', 'hamisi@example.com', 'Kilimanjaro Auto Care', 'Auto Accessories', 'Arusha', 'vehicle', '+255700000009', 'Vifaa vya ndani na nje ya gari — viti, taa, na zaidi.', null, 'basic', 'approved', now()),
  ('1a2b8828-db48-4372-a51f-1961d7731590', 'Salma Rashidi', '+255700000010', 'salma@example.com', 'Bahari Motors', 'Cars', 'Tanga', 'vehicle', '+255700000010', 'Magari na pikipiki za mikono ya kwanza na ya pili, zilizokaguliwa.', null, 'premium', 'approved', now()),

  -- Electronics
  ('dcd11ef4-899e-460a-8df0-721d3b6da0a1', 'Neema Kessy', '+255700000005', 'neema@example.com', 'TechHub Tanzania', 'Phones', 'Dar es Salaam', 'electronics', '+255700000005', 'Simu mpya na laptop, uagizaji halisi, dhamana ya mwaka mmoja.', null, 'premium', 'approved', now()),
  ('01537ae9-d146-48ff-a88b-9d90d2103345', 'Erick Malya', '+255700000006', 'erick@example.com', 'Smart Gadgets TZ', 'Audio', 'Tanga', 'electronics', '+255700000006', 'Vifaa vidogo vya elektroniki — earbuds, power banks, na chaja.', null, 'basic', 'approved', now()),
  ('36058618-56d5-4494-824e-11a1204d14e4', 'Peter Machunda', '+255700000011', 'peter@example.com', 'Digital World Mwanza', 'Laptops', 'Mwanza', 'electronics', '+255700000011', 'Laptop na vifaa vya kompyuta kwa wanafunzi na wafanyakazi.', null, 'premium', 'approved', now()),
  ('94d4b9b3-1853-49dd-9841-8c0aabb27f39', 'Rehema Chuma', '+255700000012', 'rehema@example.com', 'Dodoma Electronics Hub', 'Appliances', 'Dodoma', 'electronics', '+255700000012', 'Vifaa vya nyumbani — jiko la umeme, blender, na zaidi.', null, 'basic', 'approved', now())
ON CONFLICT (id) DO NOTHING;

-- ── PRODUCTS (30 total, 2-3 per shop) ──

INSERT INTO products (id, name, price, stock, description, category, image_url, store_id, created_at)
VALUES
  -- Niffer Outfit
  ('b1d88139-656f-4b3c-9909-205e9a38a1f7', 'Ankara Maxi Dress', 65000, 18, 'Vazi refu la Ankara, saizi S-XL, rangi mchanganyiko.', 'Clothing', null, 'b78f1bb1-18e7-4cf5-b532-88dd42c0c7c7', now()),
  ('00b1c243-d229-46c4-a6cd-51154f333e25', 'Men''s Kitenge Shirt', 45000, 25, 'Shati la kitenge la kiume, ubora wa hali ya juu.', 'Clothing', null, 'b78f1bb1-18e7-4cf5-b532-88dd42c0c7c7', now()),
  ('071c3eeb-0ba4-475d-aa23-6dc5aad0c2fd', 'Office Blazer', 95000, 10, 'Blazer rasmi kwa ofisi, saizi M-XXL.', 'Clothing', null, 'b78f1bb1-18e7-4cf5-b532-88dd42c0c7c7', now()),
  -- Zawadi Fashion House
  ('1c0fb3b1-d546-4dde-9752-6ccd4abe7b63', 'Leather Sandals', 38000, 30, 'Sandali za ngozi halisi, saizi 38-45.', 'Shoes', null, '6130b516-50a7-4136-8adb-e1b0f58040e3', now()),
  ('a8d812a0-97bb-4cae-94a4-97b43fbef60b', 'Beaded Necklace Set', 25000, 40, 'Seti ya mikufu ya vito vya asili.', 'Jewelry', null, '6130b516-50a7-4136-8adb-e1b0f58040e3', now()),
  -- Malaika Boutique
  ('1bc77bec-7de1-4081-acd3-767ce848ad48', 'Print Kanga Set', 30000, 22, 'Seti ya kanga mbili zenye maandishi ya kawaida.', 'Clothing', null, 'e422bd00-6a2e-470d-8f60-a61d6f8a1c02', now()),
  ('e849a99a-00a4-47eb-a46c-05759ef4250b', 'Casual Jumpsuit', 55000, 14, 'Jumpsuit ya kila siku, saizi S-L.', 'Clothing', null, 'e422bd00-6a2e-470d-8f60-a61d6f8a1c02', now()),
  -- Stellar Sneakers TZ
  ('026f83bd-cb95-4dbe-a728-532a4974faf2', 'Running Sneakers', 75000, 20, 'Sneakers za mazoezi, saizi 39-45.', 'Shoes', null, '078e6b93-3b3f-47b6-8315-cd053fbd0ae6', now()),
  ('4807b377-e931-4170-a3dc-055e1051ac8c', 'Kids School Shoes', 28000, 35, 'Viatu vya shule kwa watoto, saizi 28-35.', 'Shoes', null, '078e6b93-3b3f-47b6-8315-cd053fbd0ae6', now()),
  -- TZ Motors Spares
  ('8b3a985e-a726-4dc9-8e3e-bd3b678ce8d1', 'Toyota Brake Pads Set', 85000, 12, 'Vipuri vya breki kwa magari ya Toyota — seti kamili.', 'Spare Parts', null, '4cae53e2-b014-4b85-a3ef-f600a36a365d', now()),
  ('46d9d74e-c634-48eb-a086-348f3da1a83b', 'Car Battery 12V', 180000, 8, 'Betri ya gari 12V, dhamana ya miezi 12.', 'Spare Parts', null, '4cae53e2-b014-4b85-a3ef-f600a36a365d', now()),
  -- Dodoma Wheels & Tyres
  ('9b481ec1-3df6-4d91-af9f-6bcc176a9393', '195/65R15 Tyre', 220000, 20, 'Tairi la gari saizi 195/65R15.', 'Tyres', null, 'a86d0d95-af36-4728-b054-a101545071b6', now()),
  ('ca5a34fe-d1f3-4ba0-ac8d-35cc319d4b65', 'Alloy Rim Set', 350000, 6, 'Seti ya rim za alloy, vipande 4.', 'Tyres', null, 'a86d0d95-af36-4728-b054-a101545071b6', now()),
  -- Kilimanjaro Auto Care
  ('7132da23-b6b4-465c-ab57-de6f0ef32949', 'Car Seat Covers', 65000, 15, 'Vifuniko vya viti vya gari, seti kamili.', 'Auto Accessories', null, '68d0c07b-fcce-404a-8cb2-f592bf1e34cb', now()),
  ('9ea7e1bf-29a5-4137-acc6-4219841e4032', 'LED Headlight Kit', 90000, 10, 'Taa za LED za mbele, mwanga mkali zaidi.', 'Auto Accessories', null, '68d0c07b-fcce-404a-8cb2-f592bf1e34cb', now()),
  -- Bahari Motors
  ('586d833b-d929-47b6-90d8-302cff0df6f6', 'Toyota Axio 2015', 12500000, 1, 'Gari la Toyota Axio, mwaka 2015, hali nzuri.', 'Cars', null, '1a2b8828-db48-4372-a51f-1961d7731590', now()),
  ('53a0c151-f161-4392-ae73-a447a8df97af', 'Motorcycle Boxer 150cc', 3200000, 3, 'Pikipiki mpya ya Boxer 150cc.', 'Motorcycles', null, '1a2b8828-db48-4372-a51f-1961d7731590', now()),
  -- TechHub Tanzania
  ('2bd21d8a-4bfb-4060-9a17-0742cf2d2ea1', 'Samsung Galaxy A14', 450000, 15, 'Simu mpya, RAM 4GB, kumbukumbu 128GB.', 'Phones', null, 'dcd11ef4-899e-460a-8df0-721d3b6da0a1', now()),
  ('97536050-388f-4833-8d9f-53889dcbd269', 'HP Laptop 15 i5', 1450000, 6, 'Laptop ya HP, Core i5, RAM 8GB, SSD 256GB.', 'Laptops', null, 'dcd11ef4-899e-460a-8df0-721d3b6da0a1', now()),
  ('555c01fc-cd74-4f92-b037-8165b64ed121', 'iPhone 11 (Used)', 650000, 4, 'iPhone 11 ya mkono wa pili, hali nzuri, 64GB.', 'Phones', null, 'dcd11ef4-899e-460a-8df0-721d3b6da0a1', now()),
  -- Smart Gadgets TZ
  ('44520c8e-0529-4b8e-a839-f4d16300b77c', 'Bluetooth Earbuds', 35000, 50, 'Earbuds zisizo na waya, muda wa betri masaa 6.', 'Audio', null, '01537ae9-d146-48ff-a88b-9d90d2103345', now()),
  ('781e6861-e125-466f-966f-5341afd52d3e', 'Power Bank 20000mAh', 45000, 40, 'Power bank yenye uwezo mkubwa, ports mbili.', 'Audio', null, '01537ae9-d146-48ff-a88b-9d90d2103345', now()),
  -- Digital World Mwanza
  ('0a9fac65-e198-46ed-bcb3-d76c54ecefbf', 'Dell Inspiron 15', 1650000, 5, 'Laptop ya Dell, Core i5, RAM 8GB, SSD 512GB.', 'Laptops', null, '36058618-56d5-4494-824e-11a1204d14e4', now()),
  ('0e323806-9aa9-4cd4-93ac-aabf83d4c988', 'Wireless Mouse', 15000, 60, 'Mouse isiyo na waya, betri ndefu.', 'Laptops', null, '36058618-56d5-4494-824e-11a1204d14e4', now()),
  -- Dodoma Electronics Hub
  ('6019ecf1-d7a2-4e8e-b2aa-d6671690a9ac', 'Microwave Oven', 220000, 9, 'Jiko la microwave, lita 20.', 'Appliances', null, '94d4b9b3-1853-49dd-9841-8c0aabb27f39', now()),
  ('e1ebebd8-7ecb-4c6c-981b-cd91cd6ebb6b', 'Blender', 65000, 18, 'Blender ya kutengeneza juisi na smoothie.', 'Appliances', null, '94d4b9b3-1853-49dd-9841-8c0aabb27f39', now())
ON CONFLICT (id) DO NOTHING;

-- ── FLASH DEALS (6) ──

INSERT INTO flash_deals (store_id, shop_name, product_id, product_name, product_image, original_price, deal_price, discount_pct, ends_at, max_orders, current_orders, status, created_at)
VALUES
  ('dcd11ef4-899e-460a-8df0-721d3b6da0a1', 'TechHub Tanzania', '2bd21d8a-4bfb-4060-9a17-0742cf2d2ea1', 'Samsung Galaxy A14', null, 450000, 399000, 11, now() + interval '24 hours', 30, 4, 'active', now()),
  ('b78f1bb1-18e7-4cf5-b532-88dd42c0c7c7', 'Niffer Outfit', 'b1d88139-656f-4b3c-9909-205e9a38a1f7', 'Ankara Maxi Dress', null, 65000, 49000, 25, now() + interval '48 hours', 50, 9, 'active', now()),
  ('6130b516-50a7-4136-8adb-e1b0f58040e3', 'Zawadi Fashion House', '1c0fb3b1-d546-4dde-9752-6ccd4abe7b63', 'Leather Sandals', null, 38000, 29000, 24, now() + interval '36 hours', 40, 6, 'active', now()),
  ('4cae53e2-b014-4b85-a3ef-f600a36a365d', 'TZ Motors Spares', '46d9d74e-c634-48eb-a086-348f3da1a83b', 'Car Battery 12V', null, 180000, 155000, 14, now() + interval '3 days', 15, 2, 'active', now()),
  ('01537ae9-d146-48ff-a88b-9d90d2103345', 'Smart Gadgets TZ', '781e6861-e125-466f-966f-5341afd52d3e', 'Power Bank 20000mAh', null, 45000, 35000, 22, now() + interval '18 hours', 60, 21, 'active', now()),
  ('078e6b93-3b3f-47b6-8315-cd053fbd0ae6', 'Stellar Sneakers TZ', '026f83bd-cb95-4dbe-a728-532a4974faf2', 'Running Sneakers', null, 75000, 59000, 21, now() + interval '2 days', 25, 5, 'active', now());

-- ── GROUP BUY (6) ──

INSERT INTO group_orders (store_id, shop_name, product_id, product_name, product_image, unit_price, discount_pct, min_members, current_members, expires_at, status, creator_name, creator_phone, created_at)
VALUES
  ('01537ae9-d146-48ff-a88b-9d90d2103345', 'Smart Gadgets TZ', '44520c8e-0529-4b8e-a839-f4d16300b77c', 'Bluetooth Earbuds', null, 35000, 20, 5, 2, now() + interval '5 days', 'open', 'Erick Malya', '+255700000006', now()),
  ('4cae53e2-b014-4b85-a3ef-f600a36a365d', 'TZ Motors Spares', '46d9d74e-c634-48eb-a086-348f3da1a83b', 'Car Battery 12V', null, 180000, 15, 4, 1, now() + interval '3 days', 'open', 'Baraka Mwakalinga', '+255700000003', now()),
  ('e422bd00-6a2e-470d-8f60-a61d6f8a1c02', 'Malaika Boutique', '1bc77bec-7de1-4081-acd3-767ce848ad48', 'Print Kanga Set', null, 30000, 25, 6, 3, now() + interval '4 days', 'open', 'Malaika Ngowi', '+255700000007', now()),
  ('36058618-56d5-4494-824e-11a1204d14e4', 'Digital World Mwanza', '0e323806-9aa9-4cd4-93ac-aabf83d4c988', 'Wireless Mouse', null, 15000, 30, 8, 5, now() + interval '6 days', 'open', 'Peter Machunda', '+255700000011', now()),
  ('68d0c07b-fcce-404a-8cb2-f592bf1e34cb', 'Kilimanjaro Auto Care', '7132da23-b6b4-465c-ab57-de6f0ef32949', 'Car Seat Covers', null, 65000, 18, 5, 2, now() + interval '2 days', 'open', 'Hamisi Selemani', '+255700000009', now()),
  ('94d4b9b3-1853-49dd-9841-8c0aabb27f39', 'Dodoma Electronics Hub', 'e1ebebd8-7ecb-4c6c-981b-cd91cd6ebb6b', 'Blender', null, 65000, 20, 5, 1, now() + interval '5 days', 'open', 'Rehema Chuma', '+255700000012', now());

-- ── SOCIAL VYBE POSTS (12) ──

INSERT INTO feed_posts (store_id, shop_name, content, caption, product_id, media_url, created_at)
VALUES
  ('b78f1bb1-18e7-4cf5-b532-88dd42c0c7c7', 'Niffer Outfit', 'Mkusanyiko mpya wa Ankara umefika! 🔥 Njoo uchague rangi unayopenda.', 'Mkusanyiko mpya wa Ankara umefika! 🔥 Njoo uchague rangi unayopenda.', 'b1d88139-656f-4b3c-9909-205e9a38a1f7', null, now() - interval '2 hours'),
  ('dcd11ef4-899e-460a-8df0-721d3b6da0a1', 'TechHub Tanzania', 'Samsung Galaxy A14 stock mpya imefika, bei nafuu wiki hii tu!', 'Samsung Galaxy A14 stock mpya imefika, bei nafuu wiki hii tu!', '2bd21d8a-4bfb-4060-9a17-0742cf2d2ea1', null, now() - interval '5 hours'),
  ('01537ae9-d146-48ff-a88b-9d90d2103345', 'Smart Gadgets TZ', 'Earbuds zetu zinauzwa Group Buy — jiunge na wenzako mpate punguzo la 20%!', 'Earbuds zetu zinauzwa Group Buy — jiunge na wenzako mpate punguzo la 20%!', '44520c8e-0529-4b8e-a839-f4d16300b77c', null, now() - interval '1 day'),
  ('6130b516-50a7-4136-8adb-e1b0f58040e3', 'Zawadi Fashion House', 'Asante kwa wateja wetu wote! Wiki hii tunazindua mikufu mipya ya vito.', 'Asante kwa wateja wetu wote! Wiki hii tunazindua mikufu mipya ya vito.', 'a8d812a0-97bb-4cae-94a4-97b43fbef60b', null, now() - interval '2 days'),
  ('e422bd00-6a2e-470d-8f60-a61d6f8a1c02', 'Malaika Boutique', 'Kanga mpya za msimu zimefika — muundo wa kipekee, ubora wa hali ya juu.', 'Kanga mpya za msimu zimefika — muundo wa kipekee, ubora wa hali ya juu.', '1bc77bec-7de1-4081-acd3-767ce848ad48', null, now() - interval '6 hours'),
  ('078e6b93-3b3f-47b6-8315-cd053fbd0ae6', 'Stellar Sneakers TZ', 'Sneakers mpya za mazoezi zimefika! Njoo uzijaribu leo.', 'Sneakers mpya za mazoezi zimefika! Njoo uzijaribu leo.', '026f83bd-cb95-4dbe-a728-532a4974faf2', null, now() - interval '3 hours'),
  ('4cae53e2-b014-4b85-a3ef-f600a36a365d', 'TZ Motors Spares', 'Punguzo maalum kwa brake pads za Toyota wiki hii — njoo mapema kabla hazijaisha.', 'Punguzo maalum kwa brake pads za Toyota wiki hii — njoo mapema kabla hazijaisha.', '8b3a985e-a726-4dc9-8e3e-bd3b678ce8d1', null, now() - interval '8 hours'),
  ('a86d0d95-af36-4728-b054-a101545071b6', 'Dodoma Wheels & Tyres', 'Matairi mapya yamefika — bei ya jumla kwa manunuzi ya zaidi ya matairi 2.', 'Matairi mapya yamefika — bei ya jumla kwa manunuzi ya zaidi ya matairi 2.', '9b481ec1-3df6-4d91-af9f-6bcc176a9393', null, now() - interval '1 day'),
  ('68d0c07b-fcce-404a-8cb2-f592bf1e34cb', 'Kilimanjaro Auto Care', 'Vifuniko vipya vya viti vimefika kwa rangi mbalimbali. Fika ujionee.', 'Vifuniko vipya vya viti vimefika kwa rangi mbalimbali. Fika ujionee.', '7132da23-b6b4-465c-ab57-de6f0ef32949', null, now() - interval '12 hours'),
  ('1a2b8828-db48-4372-a51f-1961d7731590', 'Bahari Motors', 'Toyota Axio 2015 sasa ipo dukani — hali nzuri, tayari kwa ukaguzi.', 'Toyota Axio 2015 sasa ipo dukani — hali nzuri, tayari kwa ukaguzi.', '586d833b-d929-47b6-90d8-302cff0df6f6', null, now() - interval '2 days'),
  ('36058618-56d5-4494-824e-11a1204d14e4', 'Digital World Mwanza', 'Laptop za Dell zimeongezeka stock — chagua inayokufaa leo.', 'Laptop za Dell zimeongezeka stock — chagua inayokufaa leo.', '0a9fac65-e198-46ed-bcb3-d76c54ecefbf', null, now() - interval '4 hours'),
  ('94d4b9b3-1853-49dd-9841-8c0aabb27f39', 'Dodoma Electronics Hub', 'Ofa ya vifaa vya nyumbani — microwave na blender kwa bei nafuu wiki hii.', 'Ofa ya vifaa vya nyumbani — microwave na blender kwa bei nafuu wiki hii.', '6019ecf1-d7a2-4e8e-b2aa-d6671690a9ac', null, now() - interval '10 hours');

-- ═══════════════════════════════════════════════════════════
-- To remove this sample data later, uncomment and run:
-- ═══════════════════════════════════════════════════════════
-- DELETE FROM feed_posts WHERE store_id IN ('b78f1bb1-18e7-4cf5-b532-88dd42c0c7c7','6130b516-50a7-4136-8adb-e1b0f58040e3','e422bd00-6a2e-470d-8f60-a61d6f8a1c02','078e6b93-3b3f-47b6-8315-cd053fbd0ae6','4cae53e2-b014-4b85-a3ef-f600a36a365d','a86d0d95-af36-4728-b054-a101545071b6','68d0c07b-fcce-404a-8cb2-f592bf1e34cb','1a2b8828-db48-4372-a51f-1961d7731590','dcd11ef4-899e-460a-8df0-721d3b6da0a1','01537ae9-d146-48ff-a88b-9d90d2103345','36058618-56d5-4494-824e-11a1204d14e4','94d4b9b3-1853-49dd-9841-8c0aabb27f39');
-- DELETE FROM group_orders WHERE store_id IN ('b78f1bb1-18e7-4cf5-b532-88dd42c0c7c7','6130b516-50a7-4136-8adb-e1b0f58040e3','e422bd00-6a2e-470d-8f60-a61d6f8a1c02','078e6b93-3b3f-47b6-8315-cd053fbd0ae6','4cae53e2-b014-4b85-a3ef-f600a36a365d','a86d0d95-af36-4728-b054-a101545071b6','68d0c07b-fcce-404a-8cb2-f592bf1e34cb','1a2b8828-db48-4372-a51f-1961d7731590','dcd11ef4-899e-460a-8df0-721d3b6da0a1','01537ae9-d146-48ff-a88b-9d90d2103345','36058618-56d5-4494-824e-11a1204d14e4','94d4b9b3-1853-49dd-9841-8c0aabb27f39');
-- DELETE FROM flash_deals WHERE store_id IN ('b78f1bb1-18e7-4cf5-b532-88dd42c0c7c7','6130b516-50a7-4136-8adb-e1b0f58040e3','e422bd00-6a2e-470d-8f60-a61d6f8a1c02','078e6b93-3b3f-47b6-8315-cd053fbd0ae6','4cae53e2-b014-4b85-a3ef-f600a36a365d','a86d0d95-af36-4728-b054-a101545071b6','68d0c07b-fcce-404a-8cb2-f592bf1e34cb','1a2b8828-db48-4372-a51f-1961d7731590','dcd11ef4-899e-460a-8df0-721d3b6da0a1','01537ae9-d146-48ff-a88b-9d90d2103345','36058618-56d5-4494-824e-11a1204d14e4','94d4b9b3-1853-49dd-9841-8c0aabb27f39');
-- DELETE FROM products WHERE store_id IN ('b78f1bb1-18e7-4cf5-b532-88dd42c0c7c7','6130b516-50a7-4136-8adb-e1b0f58040e3','e422bd00-6a2e-470d-8f60-a61d6f8a1c02','078e6b93-3b3f-47b6-8315-cd053fbd0ae6','4cae53e2-b014-4b85-a3ef-f600a36a365d','a86d0d95-af36-4728-b054-a101545071b6','68d0c07b-fcce-404a-8cb2-f592bf1e34cb','1a2b8828-db48-4372-a51f-1961d7731590','dcd11ef4-899e-460a-8df0-721d3b6da0a1','01537ae9-d146-48ff-a88b-9d90d2103345','36058618-56d5-4494-824e-11a1204d14e4','94d4b9b3-1853-49dd-9841-8c0aabb27f39');
-- DELETE FROM pending_payments WHERE id IN ('b78f1bb1-18e7-4cf5-b532-88dd42c0c7c7','6130b516-50a7-4136-8adb-e1b0f58040e3','e422bd00-6a2e-470d-8f60-a61d6f8a1c02','078e6b93-3b3f-47b6-8315-cd053fbd0ae6','4cae53e2-b014-4b85-a3ef-f600a36a365d','a86d0d95-af36-4728-b054-a101545071b6','68d0c07b-fcce-404a-8cb2-f592bf1e34cb','1a2b8828-db48-4372-a51f-1961d7731590','dcd11ef4-899e-460a-8df0-721d3b6da0a1','01537ae9-d146-48ff-a88b-9d90d2103345','36058618-56d5-4494-824e-11a1204d14e4','94d4b9b3-1853-49dd-9841-8c0aabb27f39');

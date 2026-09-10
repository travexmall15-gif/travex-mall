-- ═══════════════════════════════════════════════════════════
-- SHOPNEKT WEBSTORE BUILDER — Phase 2: 5 templates per marketplace
-- ═══════════════════════════════════════════════════════════
-- Run this AFTER 20260907_webstore_builder_phase1.sql.
-- Adds the 12 new template rows (Phase 1 already seeded one per
-- market — fashion-01, vehicle-01, electronics-01 — bringing each
-- market to 5 total).

insert into public.webstore_templates (id, market, name, description) values
  ('fashion-02', 'fashion', 'Luxury Editorial', 'Full-bleed storytelling — one large product feature at a time, magazine-style.'),
  ('fashion-03', 'fashion', 'Bold Streetwear', 'High-contrast masonry grid with oversized type and sticker-style price tags.'),
  ('fashion-04', 'fashion', 'Minimal Fashion', 'Narrow, restrained single-column layout with thin dividers — no big photography.'),
  ('fashion-05', 'fashion', 'Editorial Grid', 'Two-column magazine-cover hero feeding into a uniform lookbook grid.'),

  ('vehicle-02', 'vehicle', 'Premium Dealership', 'Formal, light-toned brochure layout with large feature cards per vehicle.'),
  ('vehicle-03', 'vehicle', 'Modern Catalog', 'Bright classifieds-style card grid built for comparing many listings fast.'),
  ('vehicle-04', 'vehicle', 'Minimal Listing', 'Text-forward classified-ad rows — small thumbnail, name, and price only.'),
  ('vehicle-05', 'vehicle', 'Bold Automotive', 'One large featured-vehicle spotlight banner above the full inventory grid.'),

  ('electronics-02', 'electronics', 'Modern Technology', 'Vivid gradient launch-page hero banner above a clean product grid.'),
  ('electronics-03', 'electronics', 'Premium Electronics', 'Glossy, spacious dark layout with large individual product showcases.'),
  ('electronics-04', 'electronics', 'Clean Catalog', 'Plain, price-forward comparison rows for fast scanning.'),
  ('electronics-05', 'electronics', 'Product Focus', 'Sticky sidebar profile beside the product grid — a control-panel feel.')
on conflict (id) do nothing;

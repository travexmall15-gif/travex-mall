// ── Travex Mall Data Layer ──

export type University = {
  slug: string
  name: string
  abbr: string
  city: string
  activeShops: number
  totalSlots: number
}

export const universities: University[] = [
  { slug: 'aru',  name: 'Ardhi University',                          abbr: 'ARU',  city: 'Dar es Salaam', activeShops: 42, totalSlots: 60 },
  { slug: 'udsm', name: 'University of Dar es Salaam',               abbr: 'UDSM', city: 'Dar es Salaam', activeShops: 58, totalSlots: 60 },
  { slug: 'udom', name: 'University of Dodoma',                      abbr: 'UDOM', city: 'Dodoma',         activeShops: 31, totalSlots: 60 },
  { slug: 'tia',  name: 'Tanzania Institute of Accountancy',         abbr: 'TIA',  city: 'Dar es Salaam', activeShops: 24, totalSlots: 60 },
  { slug: 'nit',  name: 'Nelson Mandela African Inst. of Science',   abbr: 'NIT',  city: 'Arusha',         activeShops: 12, totalSlots: 60 },
]

export const shopCategories = [
  'Fashion', 'Food', 'Electronics', 'Beauty', 'Books', 'Services',
] as const

// ── TRAVEX BUSINESS MARKET — One unified market ──
export type MarketPlan = 'premium' | 'basic'

export const MARKET_TOTAL_SLOTS   = 500
export const MARKET_BASIC_PRICE   = 25000 // TZS/month — Basic (🥈 Silver)
export const MARKET_PREMIUM_PRICE = 45000 // TZS/month — Premium (🥇 Gold)

export const marketStats = {
  totalSlots:    MARKET_TOTAL_SLOTS,
  activeShops:   127,
  premiumShops:  48,
  basicShops:    79,
  slotsLeft:     MARKET_TOTAL_SLOTS - 127,
}

export const marketCategories = [
  { icon: '👗', name: 'Fashion & Clothing',   count: 28 },
  { icon: '📱', name: 'Electronics',           count: 19 },
  { icon: '🍔', name: 'Food & Groceries',      count: 34 },
  { icon: '💄', name: 'Beauty & Health',       count: 22 },
  { icon: '🔧', name: 'Services',              count: 15 },
  { icon: '🌾', name: 'Agriculture',           count: 9  },
]

export type MarketShop = {
  id: string
  name: string
  category: string
  plan: MarketPlan
  region: string
  description: string
  whatsapp: string
  logoColor: string
  verified: boolean
  rating: number
  badge: string   // 🥇 Gold | 🥈 Silver
}

export const marketShops: MarketShop[] = [
  // PREMIUM
  { id: 'm1',  name: 'Zanzibar Spice House',     category: 'Food & Groceries',    plan: 'premium', region: 'Dar es Salaam', description: 'Authentic Zanzibar spices, dried fruits and local herbs. Delivered nationwide.', whatsapp: '255712100001', logoColor: '#C9A84C', verified: true,  rating: 4.9, badge: '🥇 Gold' },
  { id: 'm2',  name: 'TechZone Tanzania',        category: 'Electronics',          plan: 'premium', region: 'Dar es Salaam', description: 'Latest smartphones, laptops, accessories and repair services.', whatsapp: '255712100002', logoColor: '#1B3A6B', verified: true,  rating: 4.8, badge: '🥇 Gold' },
  { id: 'm3',  name: 'Kitenge Kingdom',          category: 'Fashion & Clothing',   plan: 'premium', region: 'Arusha',        description: 'Premium kitenge, ankara and custom-made African fashion pieces.', whatsapp: '255712100003', logoColor: '#DC2626', verified: true,  rating: 4.8, badge: '🥇 Gold' },
  { id: 'm4',  name: 'Glow Studio TZ',           category: 'Beauty & Health',      plan: 'premium', region: 'Dar es Salaam', description: 'Skincare, cosmetics, hair products and beauty treatments.', whatsapp: '255712100004', logoColor: '#7C3AED', verified: true,  rating: 4.7, badge: '🥇 Gold' },
  { id: 'm5',  name: 'Safari Organics',          category: 'Food & Groceries',    plan: 'premium', region: 'Dodoma',        description: 'Organic fruits, vegetables and farm produce. Fresh daily.', whatsapp: '255712100005', logoColor: '#059669', verified: true,  rating: 4.9, badge: '🥇 Gold' },
  { id: 'm6',  name: 'Digital Pro Services',     category: 'Services',             plan: 'premium', region: 'Dar es Salaam', description: 'Web design, branding, digital marketing and IT solutions.', whatsapp: '255712100006', logoColor: '#0D1B3E', verified: true,  rating: 4.6, badge: '🥇 Gold' },
  // BASIC
  { id: 'm7',  name: 'Mama Pima Fashions',       category: 'Fashion & Clothing',   plan: 'basic',   region: 'Mwanza',        description: 'Affordable ladies wear, school uniforms and accessories.', whatsapp: '255712100007', logoColor: '#F59E0B', verified: true,  rating: 4.4, badge: '🥈 Silver' },
  { id: 'm8',  name: 'Bora Electronics',         category: 'Electronics',          plan: 'basic',   region: 'Arusha',        description: 'Phone accessories, chargers and small electronics.', whatsapp: '255712100008', logoColor: '#3B82F6', verified: false, rating: 4.2, badge: '🥈 Silver' },
  { id: 'm9',  name: 'Fresh Harvest TZ',         category: 'Agriculture',          plan: 'basic',   region: 'Morogoro',      description: 'Fresh maize, rice, beans and seasonal produce from local farms.', whatsapp: '255712100009', logoColor: '#84CC16', verified: true,  rating: 4.5, badge: '🥈 Silver' },
  { id: 'm10', name: 'Salma Beauty World',       category: 'Beauty & Health',      plan: 'basic',   region: 'Dar es Salaam', description: 'Affordable beauty products and hair care.', whatsapp: '255712100010', logoColor: '#EC4899', verified: false, rating: 4.1, badge: '🥈 Silver' },
  { id: 'm11', name: 'Karibu Print Shop',        category: 'Services',             plan: 'basic',   region: 'Dodoma',        description: 'Printing, photocopying and stationery services.', whatsapp: '255712100011', logoColor: '#6366F1', verified: true,  rating: 4.3, badge: '🥈 Silver' },
  { id: 'm12', name: 'Nyumbani Organics',        category: 'Food & Groceries',    plan: 'basic',   region: 'Mbeya',         description: 'Local organic produce and traditional spices.', whatsapp: '255712100012', logoColor: '#10B981', verified: false, rating: 4.0, badge: '🥈 Silver' },
]

// ── CAMPUS SHOPS ──
export type Shop = {
  slug: string
  name: string
  category: string
  university: string
  description: string
  rating: number
  verified: boolean
  whatsapp: string
  logoColor: string
}

export const shops: Shop[] = [
  { slug: 'zawadi-styles',   name: 'Zawadi Styles',           category: 'Fashion',     university: 'udsm', description: 'Trendy campus fashion, kitenge & custom prints delivered to your hostel.', rating: 4.8, verified: true,  whatsapp: '255712000001', logoColor: '#C9A84C' },
  { slug: 'mama-asha',       name: "Mama Asha's Kitchen",     category: 'Food',        university: 'udsm', description: 'Hot home-cooked meals, snacks and fresh juice. Fast campus delivery.',    rating: 4.9, verified: true,  whatsapp: '255712000002', logoColor: '#059669' },
  { slug: 'techhub-tz',      name: 'TechHub TZ',              category: 'Electronics', university: 'aru',  description: 'Phone accessories, chargers, earbuds and gadget repairs.',                 rating: 4.6, verified: true,  whatsapp: '255712000003', logoColor: '#1B3A6B' },
  { slug: 'glow-beauty',     name: 'Glow Beauty Bar',         category: 'Beauty',      university: 'udom', description: 'Skincare, cosmetics and braiding services on campus.',                   rating: 4.7, verified: true,  whatsapp: '255712000004', logoColor: '#F0C96B' },
  { slug: 'page-turner',     name: 'Page Turner Books',       category: 'Books',       university: 'tia',  description: 'Textbooks, stationery and study guides at student prices.',               rating: 4.5, verified: false, whatsapp: '255712000005', logoColor: '#0D1B3E' },
  { slug: 'campus-prints',   name: 'Campus Prints & Design',  category: 'Services',    university: 'aru',  description: 'Printing, binding, CV design and graphic design services.',              rating: 4.8, verified: true,  whatsapp: '255712000006', logoColor: '#C9A84C' },
  { slug: 'sneaker-plug',    name: 'The Sneaker Plug',         category: 'Fashion',     university: 'udsm', description: 'Authentic sneakers and streetwear. Layaway available.',                  rating: 4.4, verified: true,  whatsapp: '255712000007', logoColor: '#111827' },
  { slug: 'fresh-bites',     name: 'Fresh Bites',             category: 'Food',        university: 'udom', description: 'Smoothies, salads and healthy meal preps for busy students.',           rating: 4.6, verified: true,  whatsapp: '255712000008', logoColor: '#059669' },
]

export type Product = {
  id: string; name: string; description: string; price: number; stock: number; category: string
}

export const productsByShop: Record<string, Product[]> = {
  'zawadi-styles': [
    { id: 'p1', name: 'Kitenge Maxi Dress',  description: 'Hand-stitched ankara maxi dress, all sizes.', price: 45000, stock: 12, category: 'Fashion' },
    { id: 'p2', name: 'Custom Print Tee',     description: 'Personalized printed t-shirt, pick your design.', price: 18000, stock: 30, category: 'Fashion' },
    { id: 'p3', name: 'Beaded Sandals',       description: 'Handmade Maasai beaded sandals.', price: 25000, stock: 8,  category: 'Fashion' },
    { id: 'p4', name: 'Ankara Headwrap',      description: 'Matching headwrap, vibrant patterns.', price: 8000,  stock: 40, category: 'Fashion' },
  ],
  default: [
    { id: 'd1', name: 'Featured Product', description: 'A great product from this shop.', price: 20000, stock: 15, category: 'General' },
    { id: 'd2', name: 'Best Seller',      description: 'Our most popular item this month.', price: 35000, stock: 9,  category: 'General' },
    { id: 'd3', name: 'New Arrival',      description: 'Fresh in stock, limited quantity.', price: 12000, stock: 25, category: 'General' },
  ],
}

export type VybePost = {
  id: string; shop: string; shopSlug: string; university: string
  caption: string; price: number; likes: number; image: string; whatsapp: string
}

export const vybePosts: VybePost[] = [
  { id: 'v1', shop: 'Zawadi Styles',       shopSlug: 'zawadi-styles', university: 'UDSM', caption: 'New kitenge drop just landed! Limited pieces 🔥', price: 45000, likes: 248, image: '/social-vybe-ankara-fashion-flatlay.png', whatsapp: '255712000001' },
  { id: 'v2', shop: "Mama Asha's Kitchen", shopSlug: 'mama-asha',     university: 'UDSM', caption: 'Lunch combo: pilau + kachumbari + juice. Delivered hot!', price: 7000, likes: 412, image: '/tanzanian-pilau-rice-meal.png', whatsapp: '255712000002' },
  { id: 'v3', shop: 'The Sneaker Plug',    shopSlug: 'sneaker-plug',  university: 'UDSM', caption: 'Fresh kicks in stock. Layaway available for students.', price: 95000, likes: 189, image: '/clean-white-sneakers-product-shot.png', whatsapp: '255712000007' },
  { id: 'v4', shop: 'Glow Beauty Bar',     shopSlug: 'glow-beauty',   university: 'UDOM', caption: 'Glow up season! Skincare bundles 20% off this week.', price: 30000, likes: 320, image: '/skincare-cosmetics-flatlay-beauty.png', whatsapp: '255712000004' },
  { id: 'v5', shop: 'TechHub TZ',          shopSlug: 'techhub-tz',    university: 'ARU',  caption: 'Wireless earbuds back in stock. Crystal clear sound.', price: 38000, likes: 156, image: '/wireless-earbuds-product-photo.png', whatsapp: '255712000003' },
  { id: 'v6', shop: 'Fresh Bites',         shopSlug: 'fresh-bites',   university: 'UDOM', caption: 'Morning smoothie bowls to fuel your exam grind 🍓', price: 9000, likes: 267, image: '/smoothie-bowl-healthy-breakfast.png', whatsapp: '255712000008' },
]

export function formatTZS(n: number) {
  return 'TZS ' + n.toLocaleString('en-US')
}

export function getUniversity(slug: string) {
  return universities.find(u => u.slug === slug)
}

export function getShop(slug: string) {
  return shops.find(s => s.slug === slug)
}

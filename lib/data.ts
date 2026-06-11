// Mock data layer for Travex Mall

export type University = {
  slug: string
  name: string
  abbr: string
  city: string
  activeShops: number
  totalSlots: number
}

export const universities: University[] = [
  {
    slug: 'aru',
    name: 'Ardhi University',
    abbr: 'ARU',
    city: 'Dar es Salaam',
    activeShops: 42,
    totalSlots: 60,
  },
  {
    slug: 'udsm',
    name: 'University of Dar es Salaam',
    abbr: 'UDSM',
    city: 'Dar es Salaam',
    activeShops: 58,
    totalSlots: 60,
  },
  {
    slug: 'udom',
    name: 'University of Dodoma',
    abbr: 'UDOM',
    city: 'Dodoma',
    activeShops: 31,
    totalSlots: 60,
  },
  {
    slug: 'tia',
    name: 'Tanzania Institute of Accountancy',
    abbr: 'TIA',
    city: 'Dar es Salaam',
    activeShops: 24,
    totalSlots: 60,
  },
]

export const shopCategories = [
  'Fashion',
  'Food',
  'Electronics',
  'Beauty',
  'Books',
  'Services',
] as const

export const businessCategories = [
  'Fashion',
  'Electronics',
  'Food',
  'Beauty',
  'Services',
  'Agriculture',
] as const

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
  {
    slug: 'zawadi-styles',
    name: 'Zawadi Styles',
    category: 'Fashion',
    university: 'udsm',
    description: 'Trendy campus fashion, kitenge & custom prints delivered to your hostel.',
    rating: 4.8,
    verified: true,
    whatsapp: '255712000001',
    logoColor: '#C9A84C',
  },
  {
    slug: 'mama-asha-kitchen',
    name: "Mama Asha's Kitchen",
    category: 'Food',
    university: 'udsm',
    description: 'Hot home-cooked meals, snacks and fresh juice. Fast campus delivery.',
    rating: 4.9,
    verified: true,
    whatsapp: '255712000002',
    logoColor: '#059669',
  },
  {
    slug: 'techhub-tz',
    name: 'TechHub TZ',
    category: 'Electronics',
    university: 'aru',
    description: 'Phone accessories, chargers, earbuds and gadget repairs.',
    rating: 4.6,
    verified: true,
    whatsapp: '255712000003',
    logoColor: '#1B3A6B',
  },
  {
    slug: 'glow-beauty',
    name: 'Glow Beauty Bar',
    category: 'Beauty',
    university: 'udom',
    description: 'Skincare, cosmetics and braiding services on campus.',
    rating: 4.7,
    verified: true,
    whatsapp: '255712000004',
    logoColor: '#F0C96B',
  },
  {
    slug: 'page-turner',
    name: 'Page Turner Books',
    category: 'Books',
    university: 'tia',
    description: 'Textbooks, stationery and study guides at student prices.',
    rating: 4.5,
    verified: false,
    whatsapp: '255712000005',
    logoColor: '#0D1B3E',
  },
  {
    slug: 'campus-prints',
    name: 'Campus Prints & Design',
    category: 'Services',
    university: 'aru',
    description: 'Printing, binding, CV design and graphic design services.',
    rating: 4.8,
    verified: true,
    whatsapp: '255712000006',
    logoColor: '#C9A84C',
  },
  {
    slug: 'sneaker-plug',
    name: 'The Sneaker Plug',
    category: 'Fashion',
    university: 'udsm',
    description: 'Authentic sneakers and streetwear. Layaway available.',
    rating: 4.4,
    verified: true,
    whatsapp: '255712000007',
    logoColor: '#111827',
  },
  {
    slug: 'fresh-bites',
    name: 'Fresh Bites',
    category: 'Food',
    university: 'udom',
    description: 'Smoothies, salads and healthy meal preps for busy students.',
    rating: 4.6,
    verified: true,
    whatsapp: '255712000008',
    logoColor: '#059669',
  },
]

export type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
}

export const productsByShop: Record<string, Product[]> = {
  'zawadi-styles': [
    { id: 'p1', name: 'Kitenge Maxi Dress', description: 'Hand-stitched ankara maxi dress, all sizes.', price: 45000, stock: 12, category: 'Fashion' },
    { id: 'p2', name: 'Custom Print Tee', description: 'Personalized printed t-shirt, pick your design.', price: 18000, stock: 30, category: 'Fashion' },
    { id: 'p3', name: 'Beaded Sandals', description: 'Handmade Maasai beaded sandals.', price: 25000, stock: 8, category: 'Fashion' },
    { id: 'p4', name: 'Ankara Headwrap', description: 'Matching headwrap, vibrant patterns.', price: 8000, stock: 40, category: 'Fashion' },
  ],
  default: [
    { id: 'd1', name: 'Featured Product', description: 'A great product from this shop.', price: 20000, stock: 15, category: 'General' },
    { id: 'd2', name: 'Best Seller', description: 'Our most popular item this month.', price: 35000, stock: 9, category: 'General' },
    { id: 'd3', name: 'New Arrival', description: 'Fresh in stock, limited quantity.', price: 12000, stock: 25, category: 'General' },
  ],
}

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled'

export type Order = {
  id: string
  product: string
  customer: string
  whatsapp: string
  location: string
  quantity: number
  total: number
  status: OrderStatus
  date: string
}

export const sampleOrders: Order[] = [
  { id: 'ORD-1042', product: 'Kitenge Maxi Dress', customer: 'Neema J.', whatsapp: '255713111222', location: 'Mlimani Hostel B', quantity: 1, total: 45000, status: 'pending', date: '2026-06-09' },
  { id: 'ORD-1041', product: 'Custom Print Tee', customer: 'Baraka M.', whatsapp: '255713333444', location: 'Block 7', quantity: 2, total: 36000, status: 'confirmed', date: '2026-06-08' },
  { id: 'ORD-1039', product: 'Beaded Sandals', customer: 'Amina S.', whatsapp: '255713555666', location: 'Hall 4', quantity: 1, total: 25000, status: 'delivered', date: '2026-06-06' },
  { id: 'ORD-1037', product: 'Ankara Headwrap', customer: 'Joseph K.', whatsapp: '255713777888', location: 'Off-campus, Sinza', quantity: 3, total: 24000, status: 'delivered', date: '2026-06-05' },
]

export type VybePost = {
  id: string
  shop: string
  shopSlug: string
  university: string
  caption: string
  price: number
  likes: number
  image: string
  whatsapp: string
}

export const vybePosts: VybePost[] = [
  { id: 'v1', shop: 'Zawadi Styles', shopSlug: 'zawadi-styles', university: 'UDSM', caption: 'New kitenge drop just landed! Limited pieces 🔥 Order before they sell out.', price: 45000, likes: 248, image: '/social-vybe-ankara-fashion-flatlay.png', whatsapp: '255712000001' },
  { id: 'v2', shop: "Mama Asha's Kitchen", shopSlug: 'mama-asha-kitchen', university: 'UDSM', caption: 'Lunch combo of the day: pilau + kachumbari + juice. Delivered hot!', price: 7000, likes: 412, image: '/tanzanian-pilau-rice-meal.png', whatsapp: '255712000002' },
  { id: 'v3', shop: 'The Sneaker Plug', shopSlug: 'sneaker-plug', university: 'UDSM', caption: 'Fresh kicks in stock. Layaway available for students.', price: 95000, likes: 189, image: '/clean-white-sneakers-product-shot.png', whatsapp: '255712000007' },
  { id: 'v4', shop: 'Glow Beauty Bar', shopSlug: 'glow-beauty', university: 'UDOM', caption: 'Glow up season! Skincare bundles 20% off this week only.', price: 30000, likes: 320, image: '/skincare-cosmetics-flatlay-beauty.png', whatsapp: '255712000004' },
  { id: 'v5', shop: 'TechHub TZ', shopSlug: 'techhub-tz', university: 'ARU', caption: 'Wireless earbuds back in stock. Crystal clear sound.', price: 38000, likes: 156, image: '/wireless-earbuds-product-photo.png', whatsapp: '255712000003' },
  { id: 'v6', shop: 'Fresh Bites', shopSlug: 'fresh-bites', university: 'UDOM', caption: 'Morning smoothie bowls to fuel your exam grind 🍓', price: 9000, likes: 267, image: '/smoothie-bowl-healthy-breakfast.png', whatsapp: '255712000008' },
]

export type Application = {
  id: string
  name: string
  email: string
  phone: string
  university: string
  shopName: string
  category: string
  year: string
  status: 'pending' | 'approved' | 'rejected'
  date: string
}

export const applications: Application[] = [
  { id: 'APP-201', name: 'Grace Mwakalinga', email: 'grace.m@udsm.ac.tz', phone: '255714000001', university: 'UDSM', shopName: 'Grace Couture', category: 'Fashion', year: 'Year 3', status: 'pending', date: '2026-06-09' },
  { id: 'APP-200', name: 'Daniel Mushi', email: 'd.mushi@aru.ac.tz', phone: '255714000002', university: 'ARU', shopName: 'Mushi Electronics', category: 'Electronics', year: 'Year 2', status: 'pending', date: '2026-06-08' },
  { id: 'APP-198', name: 'Fatma Ally', email: 'fatma.a@udom.ac.tz', phone: '255714000003', university: 'UDOM', shopName: 'Fatma Beauty', category: 'Beauty', year: 'Year 4', status: 'approved', date: '2026-06-06' },
  { id: 'APP-197', name: 'Emmanuel Kessy', email: 'e.kessy@tia.ac.tz', phone: '255714000004', university: 'TIA', shopName: 'Quick Print Hub', category: 'Services', year: 'Year 1', status: 'rejected', date: '2026-06-05' },
  { id: 'APP-196', name: 'Lucy Temba', email: 'lucy.t@udsm.ac.tz', phone: '255714000005', university: 'UDSM', shopName: 'Sweet Treats', category: 'Food', year: 'Year 2', status: 'approved', date: '2026-06-04' },
]

export const leaderboard = [
  { rank: 1, shop: "Mama Asha's Kitchen", orders: 312, revenue: 2184000 },
  { rank: 2, shop: 'Zawadi Styles', orders: 198, revenue: 8910000 },
  { rank: 3, shop: 'The Sneaker Plug', orders: 142, revenue: 13490000 },
  { rank: 4, shop: 'Campus Prints & Design', orders: 421, revenue: 1684000 },
  { rank: 5, shop: 'Fresh Bites', orders: 256, revenue: 2304000 },
]

export function formatTZS(amount: number) {
  return 'TZS ' + amount.toLocaleString('en-US')
}

export function getUniversity(slug: string) {
  return universities.find((u) => u.slug === slug)
}

export function getShop(slug: string) {
  return shops.find((s) => s.slug === slug)
}

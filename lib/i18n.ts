// ═══════════════════════════════════════════════════════════════
// TRAVEX MALL — Bilingual Translation System
// Kiswahili (sw) + English (en)
// ═══════════════════════════════════════════════════════════════

export type Lang = 'en' | 'sw'

export const translations = {
  // ── NAV ─────────────────────────────────────────────────────
  nav: {
    home:         { en: 'Home',          sw: 'Nyumbani' },
    business:     { en: 'Business',      sw: 'Biashara' },
    campus:       { en: 'Campus',        sw: 'Chuo' },
    vybe:         { en: 'Social Vybe',   sw: 'Social Vybe' },
    flashDeals:   { en: 'Flash Deals',   sw: 'Ofa za Haraka' },
    groupBuy:     { en: 'Group Buy',     sw: 'Nunua Pamoja' },
    move:         { en: 'Move',          sw: 'Hamisha' },
    login:        { en: 'Log In',        sw: 'Ingia' },
    signup:       { en: 'Sign Up',       sw: 'Jiandikishe' },
    openShop:     { en: 'Open Shop',     sw: 'Fungua Duka' },
  },

  // ── HOME PAGE ────────────────────────────────────────────────
  home: {
    badge:        { en: "Africa's #1 AI-Powered Marketplace, Tanzania 2026", sw: 'Soko Bora la AI Afrika, Tanzania 2026' },
    headline1:    { en: "Africa's",      sw: 'Afrika' },
    headline2:    { en: 'Intelligent',   sw: 'Yenye Akili' },
    headline3:    { en: 'Digital Marketplace', sw: 'Soko la Kidijitali' },
    subtext:      { en: 'Create your online store in minutes. Sell across Tanzania. Grow with AI-powered intelligence, built for every African entrepreneur.', sw: 'Fungua duka lako la mtandaoni kwa dakika chache. Uza Tanzania nzima. Kukua na nguvu ya AI, kwa kila mjasiriamali wa Afrika.' },
    enterBtn:     { en: 'Enter Travex Mall', sw: 'Ingia Travex Mall' },
    activeShops:  { en: 'Active Shops',  sw: 'Maduka Yanayofanya Kazi' },
    regions:      { en: 'Regions',       sw: 'Mikoa' },
    smes:         { en: 'Tanzania SMEs', sw: 'Biashara Ndogo Tanzania' },
    ourMarkets:   { en: 'Our Markets',   sw: 'Masoko Yetu' },
    threeMarkets: { en: 'Three Markets, One Platform', sw: 'Masoko Matatu, Jukwaa Moja' },
  },

  // ── BUSINESS MARKET ─────────────────────────────────────────
  market: {
    badge:        { en: 'Business Market',     sw: 'Soko la Biashara' },
    headline:     { en: 'Business Marketplace.', sw: 'Soko la Biashara.' },
    subtext:      { en: 'Verified sellers. All categories. Five regions. Join {n} businesses already selling on Travex Mall.', sw: 'Wauzaji waliohakikishwa. Aina zote. Mikoa mitano. Jiunge na biashara {n} zinazouza Travex Mall.' },
    searchPlaceholder: { en: 'Search shops, products, sellers...', sw: 'Tafuta maduka, bidhaa, wauzaji...' },
    region:       { en: 'Region',         sw: 'Mkoa' },
    category:     { en: 'Category',       sw: 'Aina' },
    shopsFound:   { en: '{n} shops found', sw: 'Maduka {n} yamepatikana' },
    visitShop:    { en: 'Visit Shop',     sw: 'Tembelea Duka' },
    basicPlan:    { en: 'Basic Plan',     sw: 'Mpango wa Msingi' },
    premiumPlan:  { en: 'Premium Plan',   sw: 'Mpango wa Juu' },
    topEstate:    { en: 'Top Estate',     sw: 'Daraja la Juu' },
    perMonth:     { en: '/ month',        sw: '/ mwezi' },
    premiumShops: { en: 'Premium Shops',  sw: 'Maduka ya Juu' },
    basicShops:   { en: 'Basic Shops',    sw: 'Maduka ya Msingi' },
    activeSelrers:{ en: 'Active Sellers', sw: 'Wauzaji Wanaofanya Kazi' },
    totalSlots:   { en: 'Total Slots',    sw: 'Nafasi Zote' },
    registration: { en: 'Registration',   sw: 'Usajili' },
    noShops:      { en: 'No shops found', sw: 'Hakuna maduka yaliyopatikana' },
    tryFilters:   { en: 'Try different filters or search term', sw: 'Jaribu vichujio tofauti au neno la utafutaji' },
  },

  // ── CAMPUS ──────────────────────────────────────────────────
  campus: {
    badge:        { en: 'Campus Market',      sw: 'Soko la Chuo' },
    headline:     { en: 'Campus Marketplace.', sw: 'Soko la Vyuo.' },
    subtext:      { en: 'Buy and sell within your university community.', sw: 'Nunua na uza ndani ya jamii ya chuo chako.' },
    university:   { en: 'University',         sw: 'Chuo Kikuu' },
    category:     { en: 'Category',           sw: 'Aina' },
    activeShops:  { en: 'active shops',       sw: 'maduka yanayofanya kazi' },
    slotsLeft:    { en: 'slots left',         sw: 'nafasi zilizobaki' },
    browse:       { en: 'Browse',             sw: 'Vinjari' },
    full:         { en: 'Full',               sw: 'Imejaa' },
    studentPlan:  { en: 'Student Plan',       sw: 'Mpango wa Mwanafunzi' },
    perMonth:     { en: '/ month',            sw: '/ mwezi' },
  },

  // ── SOCIAL VYBE ─────────────────────────────────────────────
  vybe: {
    headline:     { en: 'Travex Social Vybe',  sw: 'Travex Social Vybe' },
    subtext:      { en: 'Products, offers and updates from verified Tanzania sellers', sw: 'Bidhaa, ofa na habari kutoka wauzaji waliohakikishwa Tanzania' },
    liveFeed:     { en: 'Live Feed',            sw: 'Mpasho wa Moja kwa Moja' },
    allPosts:     { en: 'All Posts',            sw: 'Machapisho Yote' },
    photos:       { en: 'Photos',               sw: 'Picha' },
    reels:        { en: 'Reels',                sw: 'Rili' },
    like:         { en: 'Like',                 sw: 'Penda' },
    visitShop:    { en: 'Visit Shop',           sw: 'Tembelea Duka' },
    noPosts:      { en: 'No posts yet.',        sw: 'Hakuna machapisho bado.' },
  },

  // ── GROUP BUY ────────────────────────────────────────────────
  groupBuy: {
    badge:        { en: 'Group Buy',            sw: 'Nunua Pamoja' },
    headline1:    { en: 'Buy Together,',        sw: 'Nunua Pamoja,' },
    headline2:    { en: 'Save More.',           sw: 'Okoa Zaidi.' },
    subtext:      { en: 'Join a group with other buyers and unlock discounts up to 20%.', sw: 'Jiunge na kikundi na wanunuzi wengine na pata punguzo hadi 20%.' },
    search:       { en: 'Search group deals, products, sellers...', sw: 'Tafuta ofa za kikundi, bidhaa, wauzaji...' },
    activeGroups: { en: 'Active Groups',        sw: 'Vikundi Vinavyofanya Kazi' },
    groupsReady:  { en: 'Groups Ready',         sw: 'Vikundi Vilivyoiva' },
    maxDiscount:  { en: 'Max Discount',         sw: 'Punguzo la Juu' },
    joinGroup:    { en: 'Join Group',           sw: 'Jiunge na Kikundi' },
    expired:      { en: 'Expired',              sw: 'Imekwisha' },
    membersNeeded:{ en: 'more needed',          sw: 'wanaohitajika zaidi' },
    ready:        { en: 'Ready!',               sw: 'Iko Tayari!' },
    save:         { en: 'Save',                 sw: 'Okoa' },
    noGroups:     { en: 'No Active Group Deals', sw: 'Hakuna Ofa za Kikundi Zinazofanya Kazi' },
    browseMarket: { en: 'Browse Market',        sw: 'Vinjari Soko' },
  },

  // ── STORE PAGE ───────────────────────────────────────────────
  store: {
    back:         { en: 'Market',           sw: 'Soko' },
    verified:     { en: 'Verified',         sw: 'Imethibitishwa' },
    products:     { en: 'products',         sw: 'bidhaa' },
    search:       { en: 'Search products...', sw: 'Tafuta bidhaa...' },
    all:          { en: 'All',              sw: 'Zote' },
    order:        { en: 'Order',            sw: 'Agiza' },
    messageSeller:{ en: 'Message Seller',   sw: 'Wasiliana na Muuzaji' },
    visitShop:    { en: 'Visit Shop',       sw: 'Tembelea Duka' },
    noProducts:   { en: 'No products found', sw: 'Hakuna bidhaa zilizopatikana' },
    settingUp:    { en: 'Setting Up Shop',  sw: 'Inaandaa Duka' },
    yourName:     { en: 'Your Name *',      sw: 'Jina Lako *' },
    yourMessage:  { en: 'Your message to the seller...', sw: 'Ujumbe wako kwa muuzaji...' },
    send:         { en: 'Send Message',     sw: 'Tuma Ujumbe' },
    messageSent:  { en: 'Message Sent!',    sw: 'Ujumbe Umetumwa!' },
    browseOwn:    { en: 'Browse on my own', sw: 'Vinjari Mwenyewe' },
    chatAria:     { en: 'Chat with Aria',   sw: 'Zungumza na Aria' },
  },

  // ── ARIA ─────────────────────────────────────────────────────
  aria: {
    welcome:      { en: 'Hi! Welcome to {shop}. I am Aria, your AI shopping assistant.', sw: 'Habari! Karibu {shop}. Mimi ni Aria, msaidizi wako wa ununuzi.' },
    browseOwn:    { en: 'Browse on my own',  sw: 'Vinjari Mwenyewe' },
    chatWith:     { en: 'Chat with Aria',    sw: 'Zungumza na Aria' },
    placeholder:  { en: 'Ask about products, prices or order...', sw: 'Uliza kuhusu bidhaa, bei au agiza...' },
    online:       { en: 'AI Assistant',      sw: 'Msaidizi wa AI' },
  },

  // ── COMMON ───────────────────────────────────────────────────
  common: {
    loading:      { en: 'Loading...',        sw: 'Inapakia...' },
    retry:        { en: 'Try Again',         sw: 'Jaribu Tena' },
    close:        { en: 'Close',             sw: 'Funga' },
    cancel:       { en: 'Cancel',            sw: 'Acha' },
    confirm:      { en: 'Confirm',           sw: 'Thibitisha' },
    save:         { en: 'Save',              sw: 'Hifadhi' },
    edit:         { en: 'Edit',              sw: 'Hariri' },
    delete:       { en: 'Delete',            sw: 'Futa' },
    search:       { en: 'Search',            sw: 'Tafuta' },
    filter:       { en: 'Filter',            sw: 'Chuja' },
    all:          { en: 'All',               sw: 'Zote' },
    yes:          { en: 'Yes',               sw: 'Ndiyo' },
    no:           { en: 'No',               sw: 'Hapana' },
    month:        { en: 'month',             sw: 'mwezi' },
    footer:       { en: 'Travex Move | Travex Stay | Travex Digital', sw: 'Travex Hamisha | Travex Kaa | Travex Digital' },
    openShop:     { en: 'Open Your Shop',    sw: 'Fungua Duka Lako' },
  },

  // ── FLASH DEALS ─────────────────────────────────────────────
  flash: {
    badge:        { en: 'Flash Deals',       sw: 'Ofa za Haraka' },
    headline:     { en: 'Flash. Deals.',     sw: 'Ofa. Za Haraka.' },
    subtext:      { en: 'Limited time offers from verified Tanzania sellers.', sw: 'Ofa za muda mfupi kutoka wauzaji waliohakikishwa Tanzania.' },
    endsIn:       { en: 'Ends in',           sw: 'Inaisha baada ya' },
    shopNow:      { en: 'Shop Now',          sw: 'Nunua Sasa' },
    off:          { en: 'off',               sw: 'punguzo' },
    noDeals:      { en: 'No Active Flash Deals', sw: 'Hakuna Ofa za Haraka Zinazofanya Kazi' },
  },

  // ── FOOTER ───────────────────────────────────────────────────
  footer: {
    move:         { en: 'Travex Move',       sw: 'Travex Hamisha' },
    stay:         { en: 'Travex Stay',       sw: 'Travex Kaa' },
    digital:      { en: 'Travex Digital',    sw: 'Travex Digital' },
  }
}

// ── Helper function ──────────────────────────────────────────
export function t(key: string, lang: Lang, vars?: Record<string, string>): string {
  const parts = key.split('.')
  let obj: any = translations
  for (const p of parts) {
    if (!obj[p]) return key
    obj = obj[p]
  }
  let text = obj[lang] || obj['en'] || key
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v)
    })
  }
  return text
}

// SHOPNEKT — Complete Bilingual System
// Translates EVERY word on EVERY page
;(function(){
const KEY = 'travex_lang'

// ═══════════════════════════════════════════════════════
// COMPLETE TRANSLATION DICTIONARY — EN → SW
// ShopNekt, ShopNekt Move, ShopNekt Stay, QNEX360
// Group stay unchanged in both languages
// ═══════════════════════════════════════════════════════
const DICT = {
  // ── NAVIGATION ──────────────────────────────────────
  'Home': 'Nyumbani',
  'Business': 'Biashara',
  'Campus': 'Vyuo',
  'Flash Deals': 'Ofa za Haraka',
  'Group Buy': 'Nunua Pamoja',
  'Social Vybe': 'Social Vybe',
  'Move': 'Hamisha',
  'Log In': 'Ingia',
  'Sign Up': 'Jiandikishe',
  'Login': 'Ingia',
  'Open Shop': 'Fungua Duka',
  'Open Your Shop': 'Fungua Duka Lako',
  'Back': 'Rudi',
  'Back to Market': 'Rudi Sokoni',
  'Back to Campus Market': 'Rudi Soko la Vyuo',
  // ── HOME PAGE ────────────────────────────────────────
  "Africa's": 'Afrika',
  'Intelligent': 'Yenye Akili',
  'Digital Marketplace': 'Soko la Kidijitali',
  'Create your online store in minutes. Sell across Tanzania. Grow with AI-powered intelligence, built for every African entrepreneur.': 'Fungua duka lako la mtandaoni kwa dakika chache. Uza Tanzania nzima. Kukua na nguvu ya AI, kwa kila mjasiriamali wa Afrika.',
  'Enter ShopNekt': 'Ingia ShopNekt',
  'Active Shops': 'Maduka Yanayofanya Kazi',
  'Regions': 'Mikoa',
  'Tanzania SMEs': 'Biashara Ndogo Tanzania',
  'Three Markets, One Platform': 'Masoko Matatu, Jukwaa Moja',
  "Africa's #1 AI-Powered Marketplace, Tanzania 2026": 'Soko Namba 1 la AI Afrika, Tanzania 2026',
  'Our Markets': 'Masoko Yetu',
  'Business Market': 'Soko la Biashara',
  'Shop across Tanzania verified sellers': 'Nunua kutoka wauzaji waliohakikishwa Tanzania',
  'Campus Market': 'Soko la Vyuo',
  'Buy and sell within your university': 'Nunua na uza ndani ya chuo chako',
  'Social Vybe Feed': 'Mpasho wa Social Vybe',
  'Discover products from verified sellers': 'Gundua bidhaa kutoka wauzaji waliohakikishwa',
  'Flash Deals': 'Ofa za Haraka',
  'Limited time offers from sellers': 'Ofa za muda mfupi kutoka wauzaji',
  'Group Buy': 'Nunua Pamoja',
  'Save more by buying together': 'Okoa zaidi kwa kununua pamoja',
  'Top Rated Shops': 'Maduka Yaliyopigwa Kura za Juu',
  'View All': 'Ona Yote',
  'Loading...': 'Inapakia...',
  'Save together': 'Okoa pamoja',
  '500+ shops': 'Maduka 500+',
  '5 universities': 'Vyuo vikuu 5',
  'Community': 'Jamii',
  'Limited offers': 'Ofa za muda',
  'Logistics': 'Usafirishaji',
  // ── BUSINESS MARKET ──────────────────────────────────
  'Business Marketplace.': 'Soko la Biashara.',
  'Verified sellers. All categories. Five regions.': 'Wauzaji waliohakikishwa. Aina zote. Mikoa mitano.',
  'businesses already selling on ShopNekt.': 'biashara zinazouza ShopNekt.',
  'Join': 'Jiunge',
  'Region': 'Mkoa',
  'Category': 'Aina',
  'All': 'Zote',
  'Search shops, products, sellers...': 'Tafuta maduka, bidhaa, wauzaji...',
  'Search / Tafuta...': 'Tafuta...',
  'shops found': 'maduka yamepatikana',
  'shop found': 'duka limepatikana',
  'No shops found': 'Hakuna maduka yaliyopatikana',
  'Try different filters': 'Jaribu vichujio tofauti',
  'Try different filters or search term': 'Jaribu vichujio tofauti au neno la utafutaji',
  'Visit Shop': 'Tembelea Duka',
  'Basic Plan': 'Mpango wa Msingi',
  'Premium Plan': 'Mpango wa Juu',
  'Top Estate': 'Daraja la Juu',
  '/ month': '/ mwezi',
  'per month': 'kwa mwezi',
  'Premium Shops': 'Maduka ya Juu',
  'Basic Shops': 'Maduka ya Msingi',
  'Active Sellers': 'Wauzaji Wanaofanya Kazi',
  'Total Slots': 'Nafasi Zote',
  'Slots Available': 'Nafasi Zinazopatikana',
  'Slots Remaining': 'Nafasi Zilizobaki',
  'Registration': 'Usajili',
  'OPEN': 'WAZI',
  'PREMIUM': 'PREMIUM',
  'BASIC': 'MSINGI',
  'Flash Deals': 'Ofa za Haraka',
  'Limited Time': 'Muda Mfupi',
  'Save Together': 'Okoa Pamoja',
  'Students Only': 'Wanafunzi Tu',
  'Community Feed': 'Mpasho wa Jamii',
  // ── CAMPUS MARKET ────────────────────────────────────
  'Campus Marketplace.': 'Soko la Vyuo.',
  'Buy and sell within your university community.': 'Nunua na uza ndani ya jamii ya chuo chako.',
  'active shops across': 'maduka yanayofanya kazi katika',
  'universities': 'vyuo vikuu',
  'university': 'chuo kikuu',
  'University': 'Chuo Kikuu',
  'Student Plan': 'Mpango wa Mwanafunzi',
  'TZS 10,000 / month': 'TZS 10,000 / mwezi',
  'Browse': 'Vinjari',
  'Full': 'Imejaa',
  'left': 'zilizobaki',
  'active shops': 'maduka yanayofanya kazi',
  'universities found': 'vyuo vimepatikana',
  'university found': 'chuo kimepatikana',
  'Search universities...': 'Tafuta vyuo vikuu...',
  'slots left': 'nafasi zilizobaki',
  'of': 'kati ya',
  'filled': 'zimejazwa',
  // ── SOCIAL VYBE ──────────────────────────────────────
  'Social Vybe': 'Social Vybe',
  'Products, offers and updates from verified Tanzania sellers': 'Bidhaa, ofa na habari kutoka wauzaji waliohakikishwa Tanzania',
  'Live Feed': 'Mpasho wa Moja kwa Moja',
  'All Posts': 'Machapisho Yote',
  'Photos': 'Picha',
  'Reels': 'Rili',
  'Like': 'Penda',
  'No posts yet.': 'Hakuna machapisho bado.',
  'Loading posts...': 'Inapakia machapisho...',
  'Could not load posts. Please try again.': 'Imeshindwa kupakia machapisho. Jaribu tena.',
  'posts': 'machapisho',
  'Total Likes': 'Jumla ya Kupenda',
  'Feed Status': 'Hali ya Mpasho',
  'Business': 'Biashara',
  'Market Only': 'Soko Tu',
  'LIVE': 'HAI',
  // ── GROUP BUY ────────────────────────────────────────
  'Buy Together,': 'Nunua Pamoja,',
  'Save More.': 'Okoa Zaidi.',
  'Join a group with other buyers and unlock discounts up to 20%.': 'Jiunge na kikundi na wanunuzi wengine na pata punguzo hadi 20%.',
  'The more people join, the bigger the saving.': 'Watu wengi wakijiunga, punguzo linakuwa kubwa zaidi.',
  'Search group deals, products, sellers...': 'Tafuta ofa za kikundi, bidhaa, wauzaji...',
  'Active Groups': 'Vikundi Vinavyofanya Kazi',
  'Groups Ready': 'Vikundi Vilivyoiva',
  'Max Discount': 'Punguzo la Juu',
  'Join Group': 'Jiunge na Kikundi',
  'Expired': 'Imekwisha',
  'Ongoing': 'Inaendelea',
  'more needed': 'wanaohitajika zaidi',
  'Ready!': 'Iko Tayari!',
  'Save': 'Okoa',
  'No Active Group Deals': 'Hakuna Ofa za Kikundi Zinazofanya Kazi',
  'No matching groups': 'Hakuna vikundi vinavyolingana',
  'Try a different search term.': 'Jaribu neno tofauti la utafutaji.',
  'Sellers will post group deals soon. Check back!': 'Wauzaji wataweka ofa za kikundi hivi karibuni.',
  'Browse Market': 'Vinjari Soko',
  'group deals available': 'ofa za kikundi zinapatikana',
  'group deal available': 'ofa ya kikundi inapatikana',
  'Loading group deals...': 'Inapakia ofa za kikundi...',
  'joined': 'wamejiunga',
  'h left': 'masaa yaliyobaki',
  'd left': 'siku zilizobaki',
  'OFF': 'PUNGUZO',
  'ShopNekt Seller': 'Muuzaji wa ShopNekt',
  // ── FLASH DEALS ──────────────────────────────────────
  'Flash. Deals.': 'Ofa. Za Haraka.',
  'Limited time offers from verified Tanzania sellers.': 'Ofa za muda mfupi kutoka wauzaji waliohakikishwa Tanzania.',
  'Ends in': 'Inaisha baada ya',
  'Shop Now': 'Nunua Sasa',
  'No Active Flash Deals': 'Hakuna Ofa za Haraka Zinazofanya Kazi',
  'Check back soon for new deals!': 'Rudi hivi karibuni kupata ofa mpya!',
  'hours': 'masaa',
  'minutes': 'dakika',
  'seconds': 'sekunde',
  'days': 'siku',
  // ── STORE PAGE ───────────────────────────────────────
  'Market': 'Soko',
  'Verified': 'Imethibitishwa',
  'Verified Seller': 'Muuzaji Aliyehakikishwa',
  'products': 'bidhaa',
  'Products': 'Bidhaa',
  'Message Seller': 'Wasiliana na Muuzaji',
  'Chat with Aria': 'Zungumza na Aria',
  'Browse on my own': 'Vinjari Mwenyewe',
  'Start Chatting': 'Anza Kuzungumza',
  'Hi there! Welcome to': 'Habari! Karibu',
  'I am Aria, your AI shopping assistant.': 'Mimi ni Aria, msaidizi wako wa ununuzi wa AI.',
  'I can help you find products, answer questions, and guide you through placing an order. What would you like to do?': 'Ninaweza kukusaidia kupata bidhaa, kujibu maswali, na kukuongoza kufanya agizo. Unataka kufanya nini?',
  'Find a product': 'Tafuta bidhaa',
  'Place an order': 'Fanya agizo',
  'Check prices': 'Angalia bei',
  'Order': 'Agiza',
  'No products found': 'Hakuna bidhaa zilizopatikana',
  'Setting Up Shop': 'Inaandaa Duka',
  'This seller is adding products soon. Check back shortly.': 'Muuzaji huyu anaongeza bidhaa hivi karibuni. Rudi baadaye.',
  'Store Not Found': 'Duka Halipatikani',
  'This store may have been removed or is not yet active.': 'Duka hili linaweza kuwa limeondolewa au bado halijafunguliwa.',
  'Go to Market': 'Nenda Sokoni',
  'Message Seller': 'Wasiliana na Muuzaji',
  'Your Name *': 'Jina Lako *',
  'Your Name / Jina Lako *': 'Jina Lako *',
  'Your message to the seller...': 'Ujumbe wako kwa muuzaji...',
  'Send Message': 'Tuma Ujumbe',
  'Message Sent!': 'Ujumbe Umetumwa!',
  'The seller will respond to you shortly.': 'Muuzaji atajibu hivi karibuni.',
  'Close': 'Funga',
  'Cancel': 'Acha',
  'ShopNekt Customer Care': 'Huduma kwa Wateja wa ShopNekt',
  'AI Assistant': 'Msaidizi wa AI',
  'Aria': 'Aria',
  'Ask about products, prices or order...': 'Uliza kuhusu bidhaa, bei au agizo...',
  'Ask about products, prices...': 'Uliza kuhusu bidhaa, bei...',
  'Uliza kuhusu bidhaa, bei au agizo...': 'Uliza kuhusu bidhaa, bei au agizo...',
  // ── ORDER MODAL ──────────────────────────────────────
  'Order:': 'Agizo:',
  'Quantity': 'Idadi',
  'Your Name': 'Jina Lako',
  'Phone Number': 'Nambari ya Simu',
  'Delivery Location': 'Mahali pa Kupeleka',
  'Notes (optional)': 'Maelezo (si lazima)',
  'Place Order': 'Weka Agizo',
  'Order Placed!': 'Agizo Limewekwa!',
  'Thank you! The seller will contact you via WhatsApp to confirm.': 'Asante! Muuzaji atawasiliana nawe kupitia WhatsApp kuthibitisha.',
  'Processing...': 'Inashughulikia...',
  // ── FOOTER ───────────────────────────────────────────
  // NOTE: ShopNekt, ShopNekt Stay, ShopNekt Move, QNEX360 stay same
  // ── DASHBOARD ────────────────────────────────────────
  'Overview': 'Muhtasari',
  'Orders': 'Maagizo',
  'Accounting': 'Uhasibu',
  'Debts': 'Madeni',
  'Invoice': 'Ankara',
  'Reports': 'Ripoti',
  'Settings': 'Mipangilio',
  'Subscription': 'Usajili wa Malipo',
  'AI Tools': 'Zana za AI',
  'AI Marketing': 'Masoko ya AI',
  'AI Finance': 'Fedha ya AI',
  'Marketing': 'Masoko',
  'Growth': 'Ukuaji',
  'Finance': 'Fedha',
  'Main': 'Kuu',
  'Account': 'Akaunti',
  'Sign Out': 'Toka',
  "Here's how your business is doing today": 'Hapa jinsi biashara yako inavyofanya leo',
  'Revenue Today': 'Mapato ya Leo',
  'Profit Today': 'Faida ya Leo',
  'Orders Today': 'Maagizo ya Leo',
  'Products Listed': 'Bidhaa Zilizoorodheshwa',
  'Revenue this month': 'Mapato mwezi huu',
  'Recent Orders': 'Maagizo ya Hivi Karibuni',
  'Latest customer orders today': 'Maagizo ya hivi karibuni ya wateja leo',
  'View All': 'Ona Yote',
  'Quick Actions': 'Vitendo vya Haraka',
  'Add Product': 'Ongeza Bidhaa',
  'New Invoice': 'Ankara Mpya',
  'Record Sale': 'Rekodi Mauzo',
  'Post to Vybe': 'Chapisha Vybe',
  'Stock Alerts': 'Tahadhari za Hisa',
  'Current Plan': 'Mpango wa Sasa',
  'Add New Product': 'Ongeza Bidhaa Mpya',
  'Product Name': 'Jina la Bidhaa',
  'Price': 'Bei',
  'Stock': 'Hisa',
  'Description': 'Maelezo',
  'Save Product': 'Hifadhi Bidhaa',
  'All Orders': 'Maagizo Yote',
  'Pending': 'Inangoja',
  'Confirmed': 'Imethibitishwa',
  'Delivered': 'Imetolewa',
  'Customer': 'Mteja',
  'Phone': 'Simu',
  'Amount': 'Kiasi',
  'Status': 'Hali',
  'Date': 'Tarehe',
  'Record Transaction': 'Rekodi Muamala',
  'Income': 'Mapato',
  'Expense': 'Gharama',
  'Total Revenue': 'Jumla ya Mapato',
  'Total Expenses': 'Jumla ya Gharama',
  'Net Profit': 'Faida Halisi',
  'Submit': 'Wasilisha',
  'Confirm': 'Thibitisha',
  'Delete': 'Futa',
  'Edit': 'Hariri',
  'Search': 'Tafuta',
  'Filter': 'Chuja',
  'This Week': 'Wiki Hii',
  'This Month': 'Mwezi Huu',
  'Today': 'Leo',
  'No products yet': 'Bado hakuna bidhaa',
  'Add your first product to start selling': 'Ongeza bidhaa yako ya kwanza kuanza kuuza',
  'No orders yet': 'Bado hakuna maagizo',
  'Orders will appear here when customers buy': 'Maagizo yataonekana hapa wateja wanaponunua',
  'Flash Deals': 'Ofa za Haraka',
  'Group Buying': 'Nunua Pamoja',
  'Social Vybe': 'Social Vybe',
  // ── ARIA DASHBOARD ───────────────────────────────────
  'AI Business Assistant': 'Msaidizi wa Biashara wa AI',
  'Habari! Mimi ni Aria': 'Habari! Mimi ni Aria',
  'Briefing': 'Muhtasari',
  'Revenue': 'Mapato',
  'Forecast': 'Utabiri',
  'Tips': 'Vidokezo',
  'Post': 'Chapisha',
  // ── AI MARKETING ─────────────────────────────────────
  'AI Marketing Manager': 'Msimamizi wa Masoko wa AI',
  'Aria generates your marketing content using real store data': 'Aria anaunda maudhui ya masoko yako kwa kutumia data halisi ya duka',
  'Instagram Post': 'Chapisho la Instagram',
  'WhatsApp Status': 'Hali ya WhatsApp',
  'Facebook Post': 'Chapisho la Facebook',
  'Customer Broadcast': 'Ujumbe kwa Wateja Wote',
  'Marketing Ideas': 'Mawazo ya Masoko',
  'AI generates + hashtags': 'AI inaunda + hashtags',
  'Ready to copy-paste': 'Tayari kunakili-kubandika',
  'Engagement optimised': 'Imeboreshwa kwa ushirikiano',
  'Message all customers': 'Tuma ujumbe kwa wateja wote',
  'Tanzania-specific tips': 'Vidokezo maalum vya Tanzania',
  'Custom Post Generator': 'Kitengenezaji cha Chapisho Maalum',
  'Aria writes your post with your product data': 'Aria anaandika chapisho lako na data ya bidhaa yako',
  'Product (optional)': 'Bidhaa (si lazima)',
  'All products / Store promotion': 'Bidhaa zote / Tangazo la duka',
  'Platform': 'Jukwaa',
  'Tone': 'Sauti',
  'Casual & Fun': 'Kawaida na ya Kufurahisha',
  'Professional': 'Kitaaluma',
  'Urgent / FOMO': 'Ya Haraka / FOMO',
  'Special Offer (optional)': 'Ofa Maalum (si lazima)',
  'Generate Post': 'Tengeneza Chapisho',
  'Generated Content': 'Maudhui Yaliyoundwa',
  'Copy and use directly on your platforms': 'Nakili na utumie moja kwa moja kwenye majukwaa yako',
  'Copy': 'Nakili',
  'Post to Vybe': 'Chapisha Vybe',
  'Copy Text': 'Nakili Maandishi',
  'Marketing Calendar': 'Kalenda ya Masoko',
  'Aria plans your week': 'Aria anapanga wiki yako',
  'Generate': 'Tengeneza',
  'Hashtag Strategy': 'Mkakati wa Hashtag',
  'Tanzania-specific hashtags per category': 'Hashtags maalum za Tanzania kwa aina',
  // ── AI FINANCE ───────────────────────────────────────
  'AI Finance & Projections': 'Fedha ya AI na Makadirio',
  'Aria analyzes your financial data and forecasts your future': 'Aria inachambua data yako ya fedha na kutabiri mustakabali wako',
  'This Month Revenue': 'Mapato ya Mwezi Huu',
  'Net Profit': 'Faida Halisi',
  'Profit Margin': 'Asilimia ya Faida',
  'Next Month Forecast': 'Utabiri wa Mwezi Ujao',
  'Revenue Forecast': 'Utabiri wa Mapato',
  'AI projection based on your trend': 'Makadirio ya AI kulingana na mwenendo wako',
  'Break-even Analysis': 'Uchambuzi wa Kuvuka Sifuri',
  'How many sales to reach profit?': 'Mauzo mangapi kufika faida?',
  'Analyze': 'Changanua',
  'Cash Flow Projection': 'Makadirio ya Mzunguko wa Pesa',
  'Money in vs money out — next 4 weeks': 'Pesa inayoingia dhidi ya inayotoka — wiki 4 zijazo',
  'Project': 'Kadiria',
  'Tax Estimate (TRA)': 'Kadirio la Kodi (TRA)',
  'Estimated Tanzania tax obligations': 'Wajibu wa kodi wa Tanzania uliokadiriwa',
  'Estimate': 'Kadiria',
  'Profit & Loss Statement': 'Taarifa ya Faida na Hasara',
  'Auto-generated by Aria from your records': 'Imeundwa kiotomatiki na Aria kutoka rekodi zako',
  'Generate P&L': 'Tengeneza F&H',
}

// ── Reverse dictionary SW→EN for toggle back ────────────────

  // ── OPEN STORE FORM (HTML dashboard) ─────────────────────
  'Open Your ShopNekt Shop': 'Fungua Duka Lako la ShopNekt',
  'Create Your Account': 'Fungua Akaunti Yako',
  'Owner Information': 'Taarifa za Mmiliki',
  'Set Up Your Shop': 'Sanidi Duka Lako',
  'Shop Identity': 'Utambulisho wa Duka',
  'Choose Your Plan': 'Chagua Mpango Wako',
  'Almost Done!': 'Karibu Kumalizia!',
  'Review & Submit': 'Kagua na Wasilisha',
  'Review Application': 'Kagua Ombi',
  'Review': 'Kagua',
  'Submit': 'Wasilisha',
  'Continue': 'Endelea',
  'Shop Name': 'Jina la Duka',
  'Select category...': 'Chagua aina...',
  'Select region...': 'Chagua mkoa...',
  'Business WhatsApp': 'WhatsApp ya Biashara',
  'Shop Description': 'Maelezo ya Duka',
  'Selected Plan': 'Mpango Uliochaguliwa',
  'Monthly Price': 'Bei ya Kila Mwezi',
  'Regular Price': 'Bei ya Kawaida',
  'Free Registration': 'Usajili wa Bure',
  'Free Registration, Hakuna Malipo': 'Usajili wa Bure, Hakuna Malipo',
  'Email': 'Barua Pepe',
  'Application Submitted!': 'Ombi Limewasilishwa!',
  'Amount Paid': 'Kiasi Kilicholipwa',
  'Owner Name': 'Jina la Mmiliki',
  'Review your information carefully before submitting your application.': 'Kagua taarifa zako kwa makini kabla ya kuwasilisha ombi lako.',
  'Tell customers about your shop, name, category and what you sell.': 'Mwambie wateja kuhusu duka lako, jina, aina na unachouza.',
  'Describe what you sell, your target customers, and what makes your shop unique...': 'Elezea unachauza, wateja wanaolengwa, na kinachofanya duka lako kipekee...',
  'Min. 30 characters. Be clear, this appears on your shop page.': 'Herufi 30 au zaidi. Kuwa wazi, hii inaonekana kwenye ukurasa wako wa duka.',
  'Join Tanzania\'s unified business marketplace. Choose Basic or Premium, start selling in minutes.': 'Jiunge na soko la biashara la Tanzania. Chagua Msingi au Premium, anza kuuza kwa dakika chache.',
  'AI Customer Care': 'Huduma ya Wateja ya AI',
  'Basic analytics': 'Uchambuzi wa Msingi',
  'Accounting dashboard': 'Dashibodi ya Akaunti',
  'Marketing AI tools': 'Zana za AI za Masoko',
  'Brand Color': 'Rangi ya Chapa',
  'Choose the primary color for your shop banner and theme.': 'Chagua rangi ya msingi ya bendera na mandhari ya duka lako.',
  'Social Vybe posting': 'Kuchapisha kwenye Social Vybe',
  'Featured on homepage': 'Imeangaziwa kwenye ukurasa mkuu',
  'Priority support': 'Msaada wa Kipaumbele',
  'Unlimited products': 'Bidhaa zisizo na kikomo',
  'Everything in Basic': 'Kila kitu katika Msingi',
  'Electronics': 'Elektroniki',
  'Fashion & Clothing': 'Mitindo na Mavazi',
  'Food & Groceries': 'Chakula na Vifaa',
  'Beauty & Health': 'Urembo na Afya',
  'Books & Stationery': 'Vitabu na Stesheni',
  'Agriculture': 'Kilimo',
  'Services': 'Huduma',
  'Other': 'Nyingine',
  'Dar es Salaam': 'Dar es Salaam',
  'Arusha': 'Arusha',
  'Mwanza': 'Mwanza',
  'Dodoma': 'Dodoma',
  'Mbeya': 'Mbeya',
  'Morogoro': 'Morogoro',

const DICT_BACK = {}
Object.entries(DICT).forEach(([en, sw]) => { if (sw !== en) DICT_BACK[sw] = en })

// ── DOM Text Walker ──────────────────────────────────────────
const SKIP_TAGS = new Set(['SCRIPT','STYLE','TEXTAREA','CODE','PRE','INPUT'])
const SKIP_CLASSES = new Set(['travex-lang-btn','notranslate'])

function shouldSkip(el) {
  if (!el) return true
  if (SKIP_TAGS.has(el.tagName)) return true
  if (el.classList) {
    for (const c of SKIP_CLASSES) if (el.classList.contains(c)) return true
  }
  // Don't translate ShopNekt brand names context
  return false
}

function translateNode(node, dict) {
  const el = node.parentElement
  if (shouldSkip(el)) return

  let text = node.textContent
  if (!text || !text.trim()) return

  // Try longest match first for multi-word phrases
  const keys = Object.keys(dict).sort((a,b) => b.length - a.length)
  let changed = false
  for (const key of keys) {
    if (text.includes(key)) {
      text = text.split(key).join(dict[key])
      changed = true
    }
  }
  if (changed) node.textContent = text
}

function translateAllNodes(dict) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  )
  const nodes = []
  let n
  while ((n = walker.nextNode())) nodes.push(n)
  nodes.forEach(node => translateNode(node, dict))

  // Translate placeholders
  document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
    const ph = el.getAttribute('placeholder')
    if (ph && dict[ph]) el.setAttribute('placeholder', dict[ph])
    else if (ph) {
      // Try word by word
      let newPh = ph
      Object.keys(dict).sort((a,b)=>b.length-a.length).forEach(k => {
        newPh = newPh.split(k).join(dict[k])
      })
      if (newPh !== ph) el.setAttribute('placeholder', newPh)
    }
  })

  // Translate button values
  document.querySelectorAll('button, [type="submit"]').forEach(el => {
    if (shouldSkip(el)) return
  })
}

// ── Language Functions ───────────────────────────────────────
function getLang() { return localStorage.getItem(KEY) || 'en' }

function apply(lang) {
  const dict = lang === 'sw' ? DICT : DICT_BACK
  translateAllNodes(dict)
  // Update toggle buttons
  document.querySelectorAll('.travex-lang-btn').forEach(btn => {
    btn.notranslate = true
    btn.classList.add('notranslate')
    btn.textContent = lang === 'en' ? '🇹🇿 Kiswahili' : '🇬🇧 English'
  })
}

function toggle() {
  const next = getLang() === 'en' ? 'sw' : 'en'
  localStorage.setItem(KEY, next)
  // Fire React event
  window.dispatchEvent(new CustomEvent('travex-lang-change', { detail: next }))
  apply(next)
}

// ── MutationObserver — translate dynamic content ─────────────
let observer
function watchDOM(lang) {
  if (observer) observer.disconnect()
  if (lang !== 'sw') return
  observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          translateNode(node, DICT)
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
          let n
          while ((n = walker.nextNode())) translateNode(n, DICT)
        }
      })
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

// ── Init ─────────────────────────────────────────────────────
window.ShopNektLang = { get: getLang, toggle, apply }

function init() {
  const lang = getLang()
  // Update button text
  document.querySelectorAll('.travex-lang-btn').forEach(btn => {
    btn.classList.add('notranslate')
    btn.textContent = lang === 'en' ? '🇹🇿 Kiswahili' : '🇬🇧 English'
  })

  if (lang === 'sw') {
    // Multiple attempts to catch all dynamic content
    apply('sw')
    setTimeout(() => apply('sw'), 500)
    setTimeout(() => apply('sw'), 1500)
    setTimeout(() => apply('sw'), 3000)
    watchDOM('sw')
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

})()

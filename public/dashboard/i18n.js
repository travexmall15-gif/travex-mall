// ═══════════════════════════════════════════════════════════════
// DASHBOARD i18n — EN · SW · FR · DE · PT · AR
// ═══════════════════════════════════════════════════════════════

const DASHBOARD_I18N = {
  // ── Navigation ──────────────────────────────────────────────
  'Overview':           { sw:'Muhtasari',      fr:'Aperçu',        de:'Übersicht',    pt:'Visão geral',  ar:'نظرة عامة' },
  'Products':           { sw:'Bidhaa',          fr:'Produits',      de:'Produkte',     pt:'Produtos',     ar:'المنتجات' },
  'Orders':             { sw:'Maagizo',         fr:'Commandes',     de:'Bestellungen', pt:'Pedidos',      ar:'الطلبات' },
  'Accounting':         { sw:'Uhasibu',         fr:'Comptabilité',  de:'Buchhaltung',  pt:'Contabilidade',ar:'المحاسبة' },
  'Debts':              { sw:'Madeni',          fr:'Dettes',        de:'Schulden',     pt:'Dívidas',      ar:'الديون' },
  'Invoice':            { sw:'Ankara',          fr:'Facture',       de:'Rechnung',     pt:'Fatura',       ar:'الفاتورة' },
  'Reports':            { sw:'Ripoti',          fr:'Rapports',      de:'Berichte',     pt:'Relatórios',   ar:'التقارير' },
  'Social Vybe':        { sw:'Social Vybe',     fr:'Social Vybe',   de:'Social Vybe',  pt:'Social Vybe',  ar:'Social Vybe' },
  'Flash Deals':        { sw:'Ofa za Haraka',   fr:'Ventes flash',  de:'Flash-Deals',  pt:'Ofertas relâmpago', ar:'عروض خاطفة' },
  'Group Buying':       { sw:'Nunua Pamoja',    fr:'Achat groupé',  de:'Gruppenkauf',  pt:'Compra em grupo', ar:'شراء جماعي' },
  'AI Tools':           { sw:'Zana za AI',      fr:'Outils IA',     de:'KI-Tools',     pt:'Ferramentas IA',ar:'أدوات الذكاء الاصطناعي' },
  'AI Marketing':       { sw:'Masoko ya AI',    fr:'Marketing IA',  de:'KI-Marketing', pt:'Marketing IA', ar:'تسويق ذكي' },
  'AI Finance':         { sw:'Fedha ya AI',     fr:'Finance IA',    de:'KI-Finanzen',  pt:'Finanças IA',  ar:'مالية ذكية' },
  'Marketing':          { sw:'Masoko',          fr:'Marketing',     de:'Marketing',    pt:'Marketing',    ar:'التسويق' },
  'Settings':           { sw:'Mipangilio',      fr:'Paramètres',    de:'Einstellungen',pt:'Configurações', ar:'الإعدادات' },
  'Subscription':       { sw:'Usajili',         fr:'Abonnement',    de:'Abonnement',   pt:'Assinatura',   ar:'الاشتراك' },
  'Sign Out':           { sw:'Toka',            fr:'Se déconnecter',de:'Abmelden',     pt:'Sair',         ar:'تسجيل الخروج' },
  // ── Dashboard Home ───────────────────────────────────────────
  'Good Morning':       { sw:'Habari za Asubuhi',fr:'Bonjour',     de:'Guten Morgen', pt:'Bom dia',      ar:'صباح الخير' },
  'Good Afternoon':     { sw:'Habari za Mchana', fr:'Bon après-midi',de:'Guten Tag',  pt:'Boa tarde',    ar:'مساء الخير' },
  'Good Evening':       { sw:'Habari za Jioni',  fr:'Bonsoir',     de:'Guten Abend',  pt:'Boa noite',    ar:'مساء النور' },
  'Revenue Today':      { sw:'Mapato ya Leo',    fr:'Revenus du jour',de:'Einnahmen heute',pt:'Receita hoje',ar:'الإيرادات اليوم' },
  'Profit Today':       { sw:'Faida ya Leo',     fr:'Bénéfice du jour',de:'Gewinn heute',pt:'Lucro hoje',ar:'الربح اليوم' },
  'Orders Today':       { sw:'Maagizo ya Leo',   fr:'Commandes du jour',de:'Bestellungen heute',pt:'Pedidos hoje',ar:'الطلبات اليوم' },
  'Products Listed':    { sw:'Bidhaa Zilizoorodheshwa',fr:'Produits listés',de:'Produkte gelistet',pt:'Produtos listados',ar:'المنتجات المدرجة' },
  'Recent Orders':      { sw:'Maagizo ya Hivi Karibuni',fr:'Commandes récentes',de:'Letzte Bestellungen',pt:'Pedidos recentes',ar:'الطلبات الأخيرة' },
  'Latest customer orders today':{ sw:'Maagizo ya hivi karibuni ya wateja leo',fr:'Dernières commandes clients aujourd\'hui',de:'Neueste Kundenbestellungen heute',pt:'Últimos pedidos de clientes hoje',ar:'آخر طلبات العملاء اليوم' },
  'View All':           { sw:'Ona Yote',         fr:'Voir tout',     de:'Alle anzeigen',pt:'Ver tudo',     ar:'عرض الكل' },
  'Quick Actions':      { sw:'Vitendo vya Haraka',fr:'Actions rapides',de:'Schnellaktionen',pt:'Ações rápidas',ar:'الإجراءات السريعة' },
  'Add Product':        { sw:'Ongeza Bidhaa',    fr:'Ajouter un produit',de:'Produkt hinzufügen',pt:'Adicionar produto',ar:'إضافة منتج' },
  'New Invoice':        { sw:'Ankara Mpya',      fr:'Nouvelle facture',de:'Neue Rechnung',pt:'Nova fatura',ar:'فاتورة جديدة' },
  'Record Sale':        { sw:'Rekodi Mauzo',     fr:'Enregistrer vente',de:'Verkauf erfassen',pt:'Registrar venda',ar:'تسجيل بيع' },
  'Post to Vybe':       { sw:'Chapisha Vybe',    fr:'Publier sur Vybe',de:'Auf Vybe posten',pt:'Publicar no Vybe',ar:'نشر على Vybe' },
  'Stock Alerts':       { sw:'Tahadhari za Hisa',fr:'Alertes stock', de:'Lagerbenachrichtigungen',pt:'Alertas de estoque',ar:'تنبيهات المخزون' },
  'Current Plan':       { sw:'Mpango wa Sasa',   fr:'Plan actuel',   de:'Aktueller Plan',pt:'Plano atual',  ar:'الخطة الحالية' },
  'Revenue, This Week': { sw:'Mapato, Wiki Hii', fr:'Revenus, Cette semaine',de:'Einnahmen, Diese Woche',pt:'Receita, Esta semana',ar:'الإيرادات هذا الأسبوع' },
  // ── Products ─────────────────────────────────────────────────
  'Add New Product':    { sw:'Ongeza Bidhaa Mpya',fr:'Ajouter nouveau produit',de:'Neues Produkt hinzufügen',pt:'Adicionar novo produto',ar:'إضافة منتج جديد' },
  'Product Name':       { sw:'Jina la Bidhaa',   fr:'Nom du produit', de:'Produktname',  pt:'Nome do produto',ar:'اسم المنتج' },
  'Price':              { sw:'Bei',              fr:'Prix',          de:'Preis',        pt:'Preço',        ar:'السعر' },
  'Stock':              { sw:'Hisa',             fr:'Stock',         de:'Lager',        pt:'Estoque',      ar:'المخزون' },
  'Category':           { sw:'Aina',             fr:'Catégorie',     de:'Kategorie',    pt:'Categoria',    ar:'الفئة' },
  'Description':        { sw:'Maelezo',          fr:'Description',   de:'Beschreibung', pt:'Descrição',    ar:'الوصف' },
  'Save Product':       { sw:'Hifadhi Bidhaa',   fr:'Enregistrer produit',de:'Produkt speichern',pt:'Salvar produto',ar:'حفظ المنتج' },
  'Edit Product':       { sw:'Hariri Bidhaa',    fr:'Modifier produit',de:'Produkt bearbeiten',pt:'Editar produto',ar:'تعديل المنتج' },
  'Image URL':          { sw:'URL ya Picha',     fr:'URL de l\'image',de:'Bild-URL',     pt:'URL da imagem',ar:'رابط الصورة' },
  'Out of Stock':       { sw:'Hisa Imekwisha',   fr:'Rupture de stock',de:'Nicht vorrätig',pt:'Sem estoque', ar:'نفد المخزون' },
  'In Stock':           { sw:'Ipo Hisani',       fr:'En stock',      de:'Vorrätig',     pt:'Em estoque',   ar:'في المخزون' },
  'No products yet':    { sw:'Hakuna bidhaa bado',fr:'Aucun produit encore',de:'Noch keine Produkte',pt:'Nenhum produto ainda',ar:'لا توجد منتجات بعد' },
  // ── Orders ───────────────────────────────────────────────────
  'All Orders':         { sw:'Maagizo Yote',     fr:'Toutes les commandes',de:'Alle Bestellungen',pt:'Todos os pedidos',ar:'جميع الطلبات' },
  'Pending':            { sw:'Inangoja',         fr:'En attente',    de:'Ausstehend',   pt:'Pendente',     ar:'معلّق' },
  'Confirmed':          { sw:'Imethibitishwa',   fr:'Confirmé',      de:'Bestätigt',    pt:'Confirmado',   ar:'مؤكّد' },
  'Delivered':          { sw:'Imetolewa',        fr:'Livré',         de:'Geliefert',    pt:'Entregue',     ar:'تم التسليم' },
  'Cancelled':          { sw:'Imefutwa',         fr:'Annulé',        de:'Storniert',    pt:'Cancelado',    ar:'ملغى' },
  'Customer':           { sw:'Mteja',            fr:'Client',        de:'Kunde',        pt:'Cliente',      ar:'العميل' },
  'Phone':              { sw:'Simu',             fr:'Téléphone',     de:'Telefon',      pt:'Telefone',     ar:'الهاتف' },
  'Amount':             { sw:'Kiasi',            fr:'Montant',       de:'Betrag',       pt:'Valor',        ar:'المبلغ' },
  'Status':             { sw:'Hali',             fr:'Statut',        de:'Status',       pt:'Status',       ar:'الحالة' },
  'Date':               { sw:'Tarehe',           fr:'Date',          de:'Datum',        pt:'Data',         ar:'التاريخ' },
  'No orders yet':      { sw:'Hakuna maagizo bado',fr:'Aucune commande encore',de:'Noch keine Bestellungen',pt:'Nenhum pedido ainda',ar:'لا توجد طلبات بعد' },
  'Mark Delivered':     { sw:'Weka Imetolewa',   fr:'Marquer livré', de:'Als geliefert markieren',pt:'Marcar entregue',ar:'وضع علامة تسليم' },
  'WhatsApp':           { sw:'WhatsApp',         fr:'WhatsApp',      de:'WhatsApp',     pt:'WhatsApp',     ar:'واتساب' },
  // ── Accounting ───────────────────────────────────────────────
  'Record Transaction': { sw:'Rekodi Muamala',   fr:'Enregistrer transaction',de:'Transaktion erfassen',pt:'Registrar transação',ar:'تسجيل معاملة' },
  'Income':             { sw:'Mapato',           fr:'Revenus',       de:'Einnahmen',    pt:'Receita',      ar:'الدخل' },
  'Expense':            { sw:'Gharama',          fr:'Dépense',       de:'Ausgabe',      pt:'Despesa',      ar:'المصروف' },
  'Total Revenue':      { sw:'Jumla ya Mapato',  fr:'Revenus totaux',de:'Gesamteinnahmen',pt:'Receita total',ar:'إجمالي الإيرادات' },
  'Total Expenses':     { sw:'Jumla ya Gharama', fr:'Dépenses totales',de:'Gesamtausgaben',pt:'Despesas totais',ar:'إجمالي المصروفات' },
  'Net Profit':         { sw:'Faida Halisi',     fr:'Bénéfice net',  de:'Nettogewinn',  pt:'Lucro líquido',ar:'صافي الربح' },
  'Balance':            { sw:'Salio',            fr:'Solde',         de:'Saldo',        pt:'Saldo',        ar:'الرصيد' },
  // ── Settings ─────────────────────────────────────────────────
  'Language':           { sw:'Lugha',            fr:'Langue',        de:'Sprache',      pt:'Idioma',       ar:'اللغة' },
  'Profile':            { sw:'Wasifu',           fr:'Profil',        de:'Profil',       pt:'Perfil',       ar:'الملف الشخصي' },
  'Notifications':      { sw:'Arifa',            fr:'Notifications', de:'Benachrichtigungen',pt:'Notificações',ar:'الإشعارات' },
  'Appearance':         { sw:'Muonekano',        fr:'Apparence',     de:'Erscheinungsbild',pt:'Aparência',  ar:'المظهر' },
  'Shop Name':          { sw:'Jina la Duka',     fr:'Nom de la boutique',de:'Shop-Name', pt:'Nome da loja',ar:'اسم المتجر' },
  'Business Type':      { sw:'Aina ya Biashara', fr:'Type de commerce',de:'Geschäftstyp',pt:'Tipo de negócio',ar:'نوع النشاط' },
  'Save Changes':       { sw:'Hifadhi Mabadiliko',fr:'Enregistrer les modifications',de:'Änderungen speichern',pt:'Salvar alterações',ar:'حفظ التغييرات' },
  // ── Common ───────────────────────────────────────────────────
  'Save':               { sw:'Hifadhi',          fr:'Enregistrer',   de:'Speichern',    pt:'Salvar',       ar:'حفظ' },
  'Cancel':             { sw:'Acha',             fr:'Annuler',       de:'Abbrechen',    pt:'Cancelar',     ar:'إلغاء' },
  'Delete':             { sw:'Futa',             fr:'Supprimer',     de:'Löschen',      pt:'Excluir',      ar:'حذف' },
  'Edit':               { sw:'Hariri',           fr:'Modifier',      de:'Bearbeiten',   pt:'Editar',       ar:'تعديل' },
  'Close':              { sw:'Funga',            fr:'Fermer',        de:'Schließen',    pt:'Fechar',       ar:'إغلاق' },
  'Loading...':         { sw:'Inapakia...',      fr:'Chargement...', de:'Laden...',     pt:'Carregando...', ar:'جارٍ التحميل...' },
  'Search':             { sw:'Tafuta',           fr:'Rechercher',    de:'Suchen',       pt:'Pesquisar',    ar:'بحث' },
  'Filter':             { sw:'Chuja',            fr:'Filtrer',       de:'Filtern',      pt:'Filtrar',      ar:'تصفية' },
  'Submit':             { sw:'Wasilisha',        fr:'Soumettre',     de:'Einreichen',   pt:'Enviar',       ar:'إرسال' },
  'Confirm':            { sw:'Thibitisha',       fr:'Confirmer',     de:'Bestätigen',   pt:'Confirmar',    ar:'تأكيد' },
  'Add':                { sw:'Ongeza',           fr:'Ajouter',       de:'Hinzufügen',   pt:'Adicionar',    ar:'إضافة' },
  'Update':             { sw:'Sasisha',          fr:'Mettre à jour', de:'Aktualisieren',pt:'Atualizar',    ar:'تحديث' },
  'Error':              { sw:'Hitilafu',         fr:'Erreur',        de:'Fehler',       pt:'Erro',         ar:'خطأ' },
  'Success':            { sw:'Mafanikio',        fr:'Succès',        de:'Erfolg',       pt:'Sucesso',      ar:'نجاح' },
  'Back':               { sw:'Rudi',             fr:'Retour',        de:'Zurück',       pt:'Voltar',       ar:'رجوع' },
  'Next':               { sw:'Endelea',          fr:'Suivant',       de:'Weiter',       pt:'Próximo',      ar:'التالي' },
  'Total':              { sw:'Jumla',            fr:'Total',         de:'Gesamt',       pt:'Total',        ar:'الإجمالي' },
  'Home':               { sw:'Nyumbani',         fr:'Accueil',       de:'Startseite',   pt:'Início',       ar:'الرئيسية' },
  'Finance':            { sw:'Fedha',            fr:'Finance',       de:'Finanzen',     pt:'Finanças',     ar:'المالية' },
  'More':               { sw:'Zaidi',            fr:'Plus',          de:'Mehr',         pt:'Mais',         ar:'المزيد' },
  'Manage your store products':{ sw:'Simamia bidhaa za duka lako',fr:'Gérez les produits de votre boutique',de:'Verwalten Sie Ihre Shop-Produkte',pt:'Gerencie os produtos da sua loja',ar:'إدارة منتجات متجرك' },
  'Track and manage orders': { sw:'Fuatilia na simamia maagizo',fr:'Suivre et gérer les commandes',de:'Bestellungen verfolgen und verwalten',pt:'Rastrear e gerenciar pedidos',ar:'تتبع وإدارة الطلبات' },
  'here\'s how your business is doing today':{ sw:'hapa jinsi biashara yako inavyofanya leo',fr:'voici comment votre entreprise se porte aujourd\'hui',de:'so läuft Ihr Geschäft heute',pt:'veja como seu negócio está hoje',ar:'إليك أداء عملك اليوم' },
}

// ── Supported languages ──────────────────────────────────────────
const LANG_META = {
  en: { flag: '🇬🇧', label: 'EN', dir: 'ltr', name: 'English' },
  sw: { flag: '🇹🇿', label: 'SW', dir: 'ltr', name: 'Kiswahili' },
  fr: { flag: '🇫🇷', label: 'FR', dir: 'ltr', name: 'Français' },
  de: { flag: '🇩🇪', label: 'DE', dir: 'ltr', name: 'Deutsch' },
  pt: { flag: '🇵🇹', label: 'PT', dir: 'ltr', name: 'Português' },
  ar: { flag: '🇸🇦', label: 'AR', dir: 'rtl', name: 'العربية' },
}

// ── Language engine ───────────────────────────────────────────────
const LANG = {
  current: localStorage.getItem('travex_lang') || 'en',

  get: function(key) {
    if (this.current === 'en') return key
    const entry = DASHBOARD_I18N[key]
    if (entry && entry[this.current]) return entry[this.current]
    return key
  },

  set: function(lang) {
    if (!LANG_META[lang]) return
    this.current = lang
    localStorage.setItem('travex_lang', lang)
    this.apply()
  },

  apply: function() {
    const meta = LANG_META[this.current] || LANG_META.en
    // RTL support
    document.documentElement.dir = meta.dir
    document.documentElement.lang = this.current
    if (meta.dir === 'rtl') {
      document.body.classList.add('rtl')
    } else {
      document.body.classList.remove('rtl')
    }
    // Translate [data-i18n] elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n')
      el.textContent = this.get(key)
    })
    // Update toggle dropdown
    this._updateToggle()
  },

  _updateToggle: function() {
    const meta = LANG_META[this.current] || LANG_META.en
    const btn = document.getElementById('langToggleBtn')
    if (btn) {
      btn.innerHTML = `${meta.flag} ${meta.label} <span style="font-size:9px;opacity:.6">▾</span>`
    }
    const dropdown = document.getElementById('langDropdown')
    if (dropdown) {
      dropdown.querySelectorAll('[data-lang]').forEach(item => {
        item.style.fontWeight = item.dataset.lang === this.current ? '800' : '500'
        item.style.background = item.dataset.lang === this.current ? 'rgba(13,27,62,.06)' : 'transparent'
      })
    }
  },

  init: function() {
    this.apply()
  }
}

// ── Inject 6-language dropdown into header ────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const headerRight = document.querySelector('.header-right')
    if (!headerRight || document.getElementById('langToggleBtn')) return

    const meta = LANG_META[LANG.current] || LANG_META.en

    // Wrapper
    const wrap = document.createElement('div')
    wrap.style.cssText = 'position:relative;display:inline-flex;'

    // Toggle button
    const btn = document.createElement('button')
    btn.id = 'langToggleBtn'
    btn.innerHTML = `${meta.flag} ${meta.label} <span style="font-size:9px;opacity:.6">▾</span>`
    btn.style.cssText = `
      display:inline-flex;align-items:center;gap:5px;
      background:rgba(13,27,62,0.07);border:1px solid rgba(13,27,62,0.15);
      border-radius:999px;padding:5px 12px;font-size:11px;font-weight:700;
      cursor:pointer;color:var(--navy);font-family:inherit;transition:all 0.2s;
      letter-spacing:0.04em;white-space:nowrap;
    `

    // Dropdown
    const dd = document.createElement('div')
    dd.id = 'langDropdown'
    dd.style.cssText = `
      position:absolute;top:calc(100% + 6px);right:0;
      background:#fff;border:1.5px solid #E2E8F0;border-radius:14px;
      padding:6px;box-shadow:0 8px 24px rgba(13,27,62,.14);
      display:none;z-index:9999;min-width:140px;
    `

    Object.entries(LANG_META).forEach(([code, m]) => {
      const item = document.createElement('button')
      item.dataset.lang = code
      item.style.cssText = `
        display:flex;align-items:center;gap:8px;width:100%;padding:8px 10px;
        border:none;border-radius:8px;cursor:pointer;font-family:inherit;
        font-size:12px;font-weight:${code === LANG.current ? '800' : '500'};
        background:${code === LANG.current ? 'rgba(13,27,62,.06)' : 'transparent'};
        color:var(--navy);text-align:left;
      `
      item.innerHTML = `<span>${m.flag}</span><span>${m.name}</span>`
      item.onclick = (e) => { e.stopPropagation(); LANG.set(code); dd.style.display = 'none' }
      dd.appendChild(item)
    })

    btn.onclick = (e) => {
      e.stopPropagation()
      dd.style.display = dd.style.display === 'none' ? 'flex' : 'none'
      if (dd.style.display === 'flex') dd.style.flexDirection = 'column'
    }

    document.addEventListener('click', () => { dd.style.display = 'none' })

    wrap.appendChild(btn)
    wrap.appendChild(dd)
    headerRight.prepend(wrap)

    LANG.init()
  }, 400)
})

window.LANG = LANG

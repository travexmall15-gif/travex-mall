import type { LocalizedText } from '../schemas/language'
import type { RefusalReason } from '../safety/rules'

// ═══════════════════════════════════════════════════════════
// RESPONSE / FALLBACK RULES
// ═══════════════════════════════════════════════════════════
// Every user-facing fallback/refusal message the AI can produce, fully
// localized across all 6 ShopNekt languages, so a language gap can
// never force the AI into replying in the wrong language or mixing
// languages mid-response. AI Core selects one of these by
// RefusalReason; it must not compose its own ad-hoc fallback text.

export const REFUSAL_MESSAGES: Record<RefusalReason, LocalizedText> = {
  unauthenticated: {
    en: 'Please sign in to do that.',
    sw: 'Tafadhali ingia kwenye akaunti yako kufanya hivyo.',
    fr: 'Veuillez vous connecter pour faire cela.',
    de: 'Bitte melde dich an, um das zu tun.',
    pt: 'Faça login para fazer isso.',
    ar: 'يرجى تسجيل الدخول للقيام بذلك.',
  },
  notOwner: {
    en: 'You can only manage your own shop\'s information.',
    sw: 'Unaweza kusimamia taarifa za duka lako pekee.',
    fr: 'Vous ne pouvez gérer que les informations de votre propre boutique.',
    de: 'Du kannst nur die Informationen deines eigenen Shops verwalten.',
    pt: 'Você só pode gerenciar as informações da sua própria loja.',
    ar: 'يمكنك فقط إدارة معلومات متجرك الخاص.',
  },
  crossUserData: {
    en: 'I can\'t share another user\'s private information.',
    sw: 'Siwezi kushiriki taarifa binafsi za mtumiaji mwingine.',
    fr: 'Je ne peux pas partager les informations privées d\'un autre utilisateur.',
    de: 'Ich kann die privaten Informationen eines anderen Nutzers nicht teilen.',
    pt: 'Não posso compartilhar informações privadas de outro usuário.',
    ar: 'لا يمكنني مشاركة المعلومات الخاصة لمستخدم آخر.',
  },
  noData: {
    en: 'I don\'t have that information right now.',
    sw: 'Sina taarifa hiyo kwa sasa.',
    fr: 'Je n\'ai pas cette information pour le moment.',
    de: 'Ich habe diese Information gerade nicht.',
    pt: 'Não tenho essa informação no momento.',
    ar: 'ليس لدي هذه المعلومة الآن.',
  },
  consequentialUnconfirmed: {
    en: 'I\'ll need your confirmation before I do that.',
    sw: 'Nitahitaji uthibitisho wako kabla ya kufanya hivyo.',
    fr: 'J\'aurai besoin de votre confirmation avant de faire cela.',
    de: 'Ich brauche deine Bestätigung, bevor ich das tue.',
    pt: 'Vou precisar da sua confirmação antes de fazer isso.',
    ar: 'سأحتاج إلى تأكيدك قبل القيام بذلك.',
  },
  toolUnavailable: {
    en: 'I\'m having trouble reaching ShopNekt right now — please try again shortly.',
    sw: 'Nina shida kufikia ShopNekt kwa sasa — tafadhali jaribu tena baada ya muda mfupi.',
    fr: 'J\'ai du mal à joindre ShopNekt en ce moment — veuillez réessayer bientôt.',
    de: 'Ich habe gerade Probleme, ShopNekt zu erreichen — bitte versuche es in Kürze erneut.',
    pt: 'Estou com dificuldades para acessar a ShopNekt agora — tente novamente em breve.',
    ar: 'أواجه صعوبة في الوصول إلى ShopNekt الآن — يرجى المحاولة مرة أخرى قريبًا.',
  },
  outOfScope: {
    en: 'I can only help with things related to ShopNekt shopping and selling.',
    sw: 'Ninaweza kusaidia na mambo yanayohusiana na ununuzi na uuzaji kwenye ShopNekt tu.',
    fr: 'Je ne peux aider qu\'avec des sujets liés aux achats et ventes sur ShopNekt.',
    de: 'Ich kann nur bei Themen rund um Einkaufen und Verkaufen auf ShopNekt helfen.',
    pt: 'Só posso ajudar com assuntos relacionados a compras e vendas na ShopNekt.',
    ar: 'يمكنني المساعدة فقط في الأمور المتعلقة بالتسوق والبيع على ShopNekt.',
  },
}

/**
 * Tone/behavior rules the response layer must follow. Encoded as data
 * so it can be checked/tested, not just described in a prompt.
 */
export const RESPONSE_BEHAVIOR_RULES = {
  /** The AI must never claim to have performed an action it did not actually execute via a real tool. */
  neverClaimUnexecutedAction: true,
  /** Internal reasoning/chain-of-thought must never be shown to the user (Part 13/16) — only user-facing status like "Searching ShopNekt...". */
  noInternalReasoningExposure: true,
  /** The AI must respond in the application's configured language, even if the user typed in a different language (Part 7). */
  respondInApplicationLanguage: true,
  /** ShopNekt and QNEX360 must never be translated/transliterated in any language's response. */
  neverTranslateBrandNames: ['ShopNekt', 'QNEX360'] as const,
} as const

/** Honest, non-committal status messages shown DURING tool execution — never fake/simulated reasoning. */
export const STATUS_MESSAGES: Record<string, LocalizedText> = {
  searching: {
    en: 'Searching ShopNekt...', sw: 'Inatafuta kwenye ShopNekt...',
    fr: 'Recherche sur ShopNekt...', de: 'Durchsuche ShopNekt...',
    pt: 'Pesquisando na ShopNekt...', ar: 'جارٍ البحث في ShopNekt...',
  },
  checkingProducts: {
    en: 'Checking products...', sw: 'Inaangalia bidhaa...',
    fr: 'Vérification des produits...', de: 'Produkte werden geprüft...',
    pt: 'Verificando produtos...', ar: 'جارٍ التحقق من المنتجات...',
  },
  checkingShops: {
    en: 'Checking shops...', sw: 'Inaangalia maduka...',
    fr: 'Vérification des boutiques...', de: 'Shops werden geprüft...',
    pt: 'Verificando lojas...', ar: 'جارٍ التحقق من المتاجر...',
  },
  checkingDeals: {
    en: 'Checking active deals...', sw: 'Inaangalia ofa zinazoendelea...',
    fr: 'Vérification des offres actives...', de: 'Aktuelle Angebote werden geprüft...',
    pt: 'Verificando ofertas ativas...', ar: 'جارٍ التحقق من العروض النشطة...',
  },
  preparingResults: {
    en: 'Preparing results...', sw: 'Inaandaa matokeo...',
    fr: 'Préparation des résultats...', de: 'Ergebnisse werden vorbereitet...',
    pt: 'Preparando resultados...', ar: 'جارٍ تحضير النتائج...',
  },
}

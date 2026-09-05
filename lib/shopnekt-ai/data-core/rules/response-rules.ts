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
/**
 * Per-entity-type clarifying questions — used when the reasoning
 * engine knows exactly WHICH piece of information is still missing
 * (see core/reasoning/plan.ts's askClarification decision). Real,
 * deterministic, localized text — not model-generated, since the
 * question to ask is fully determined by which slot is empty.
 * Only entity types that realistically appear as a missing slot in a
 * guided flow need an entry here; anything else falls back to a
 * generic "tell me more" in core/response/format.ts.
 */
export const CLARIFICATION_QUESTIONS: Partial<Record<string, LocalizedText>> = {
  category: {
    en: 'What would you like to buy? For example: clothes, shoes, or a phone.',
    sw: 'Unataka kununua nini? Kwa mfano: nguo, viatu, au simu.',
    fr: 'Que souhaitez-vous acheter ? Par exemple : vêtements, chaussures ou téléphone.',
    de: 'Was möchtest du kaufen? Zum Beispiel: Kleidung, Schuhe oder ein Handy.',
    pt: 'O que você gostaria de comprar? Por exemplo: roupas, sapatos ou um telefone.',
    ar: 'ماذا تريد أن تشتري؟ على سبيل المثال: ملابس، أحذية، أو هاتف.',
  },
  brand: {
    en: 'Do you have a brand in mind, or should I show you all options?',
    sw: 'Unapendelea brand gani, au nikuonyeshe zote zilizopo?',
    fr: 'Avez-vous une marque en tête, ou dois-je vous montrer toutes les options ?',
    de: 'Hast du eine Marke im Sinn, oder soll ich dir alle Optionen zeigen?',
    pt: 'Você tem uma marca em mente, ou devo mostrar todas as opções?',
    ar: 'هل لديك علامة تجارية معينة في ذهنك، أم أعرض لك كل الخيارات؟',
  },
  price: {
    en: 'What\'s your budget?',
    sw: 'Bei iwe kiasi gani?',
    fr: 'Quel est votre budget ?',
    de: 'Wie hoch ist dein Budget?',
    pt: 'Qual é o seu orçamento?',
    ar: 'ما هي ميزانيتك؟',
  },
  location: {
    en: 'Which area or region?',
    sw: 'Eneo gani au mkoa upi?',
    fr: 'Quelle zone ou région ?',
    de: 'Welche Region?',
    pt: 'Qual região?',
    ar: 'أي منطقة؟',
  },
}

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

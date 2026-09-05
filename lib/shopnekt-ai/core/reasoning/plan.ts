import { getIntentById, getToolByName, type ActiveTask, type ExtractedEntities } from '../../data-core'

// ═══════════════════════════════════════════════════════════
// REASONING ENGINE
// ═══════════════════════════════════════════════════════════
// HONESTY NOTE: this is a deterministic decision tree, not a model
// performing free-form reasoning. Given "what does the user want"
// (intent) and "what do we know" (entity slots), it answers the
// specific questions master spec Part 13 lists — but through fixed
// rules mapping intents to tools and checking slot completeness, not
// through open-ended inference. That's an explicit, disclosed
// simplification appropriate for Batch 2; free-form reasoning over
// ambiguous cases is Batch 3's job once a real model is integrated.

export type ReasoningDecision =
  | { action: 'askClarification'; missingEntityType: string; intentId: string }
  | { action: 'executeTool'; toolName: string; intentId: string; requiresConfirmation: boolean }
  | { action: 'answerFromKnowledge'; intentId: string }
  | { action: 'refuse'; reason: 'outOfScope' | 'toolUnavailable' }
  | { action: 'unknown' }

/** Maps an intent to the single tool it primarily fulfills, where a direct 1:1 mapping exists. */
const INTENT_TOOL_MAP: Record<string, string> = {
  PRODUCT_SEARCH: 'searchProducts',
  SHOP_SEARCH: 'searchShops',
  PREFERRED_SHOPS_VIEW: 'getPreferredShops',
  FLASH_DEAL_SEARCH: 'getFlashDeals',
  GROUP_BUY_SEARCH: 'getGroupBuys',
  ORDER_STATUS: 'getOrderStatus',
  ORDER_CREATE: 'createOrder',
  CREATE_PRODUCT: 'createProductDraft',
  EDIT_PRODUCT: 'updateProduct',
  INVENTORY_CHECK: 'getInventory',
  SELLER_ORDER_VIEW: 'getSellerOrders',
  CREATE_FLASH_DEAL: 'createFlashDeal',
  CREATE_GROUP_BUY: 'createGroupBuy',
  CREATE_SOCIAL_POST: 'createSocialPost',
  SHOP_ANALYTICS: 'getAnalytics',
}

/** Intents that are answered from static Data Core knowledge (workflows/concepts), not a live tool call. */
const KNOWLEDGE_ONLY_INTENTS = new Set(['GENERAL_SHOPNEKT_HELP', 'SELLER_DASHBOARD_HELP'])

export function decideNextAction(
  intentId: string | null,
  intentConfidence: number,
  activeTask: ActiveTask | null
): ReasoningDecision {
  // A reply with no (or very weak) new intent signal — e.g. "ndiyo",
  // "yes", "confirm" — should fall back to whatever active task is
  // already in progress, rather than being treated as "unknown".
  // This is what lets a bare confirmation reply actually complete a
  // pending consequential action instead of derailing it.
  // Which intent are we ACTUALLY pursuing this turn? If there's an
  // active, unfinished task, context/engine.ts's advanceContext has
  // already decided (via its own, deliberately different threshold
  // logic) whether this message continues it or not — by the time we
  // get here, activeTask.intentId IS that decision. Re-deriving "the"
  // intent from the freshly classified intentId instead would let the
  // two functions disagree: a short follow-up like "nguo" can score a
  // different intent (e.g. SHOP_SEARCH) marginally higher than the
  // in-progress one (e.g. PRODUCT_SEARCH) purely due to scoring noise,
  // even though advanceContext correctly chose to continue the
  // original task. Trusting activeTask.intentId here — whenever one
  // exists and isn't ready yet — is what keeps a guided flow from
  // being silently hijacked mid-conversation by a noisier classification.
  const effectiveIntentId = (activeTask && !activeTask.readyToExecute ? activeTask.intentId : null) ?? intentId ?? activeTask?.intentId ?? null

  if (!effectiveIntentId) {
    return { action: 'unknown' }
  }

  const intent = getIntentById(effectiveIntentId)
  if (!intent) {return { action: 'unknown' }}

  if (KNOWLEDGE_ONLY_INTENTS.has(effectiveIntentId)) {
    return { action: 'answerFromKnowledge', intentId: effectiveIntentId }
  }

  // If this intent expects entities and we have an active task tracking
  // them, check readiness before touching any tool.
  if (activeTask && activeTask.intentId === effectiveIntentId && intent.expectedEntities.length > 0) {
    if (!activeTask.readyToExecute) {
      const firstMissing = activeTask.slots.find(s => !s.filled)
      if (firstMissing) {
        return { action: 'askClarification', missingEntityType: firstMissing.entityType, intentId: effectiveIntentId }
      }
    }
  }

  const toolName = INTENT_TOOL_MAP[effectiveIntentId]
  if (!toolName) {
    // No 1:1 tool mapping and not a knowledge-only intent (e.g.
    // PRODUCT_COMPARE, ORDER_HELP, CUSTOMER_ASSISTANCE) — these need
    // genuine language generation to fulfill well, which is honestly
    // Batch 3 territory. Surface as "answerFromKnowledge" so the
    // response layer can at least explain what it CAN currently help
    // with, rather than silently failing.
    return { action: 'answerFromKnowledge', intentId: effectiveIntentId }
  }

  const tool = getToolByName(toolName)
  if (!tool) {return { action: 'refuse', reason: 'toolUnavailable' }}

  return { action: 'executeTool', toolName, intentId: effectiveIntentId, requiresConfirmation: tool.isConsequential }
}

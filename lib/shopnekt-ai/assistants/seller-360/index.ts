import { getIntentsForRole, getToolsForRole, type SupportedLanguage, type ConversationContext } from '../../data-core'
import type { AIRequestContext } from '../../core/security/authorize'
import { processMessage, type ProcessMessageResult } from '../../core/orchestrator'
import { createConversationContext } from '../../core/context/engine'

// ═══════════════════════════════════════════════════════════
// SELLER 360 AI
// ═══════════════════════════════════════════════════════════
// The seller-facing specialization of the shared AI Core.
//
// CRITICAL SECURITY NOTE: ShopNekt's seller "login" is a PIN checked
// against pending_payments.login_password (there is no server-
// verifiable session token in the existing app today — this was
// documented as a known architectural gap in the app's own security
// audit). Because of that, THIS FUNCTION DOES NOT VERIFY OWNERSHIP
// ITSELF — it requires the caller to have ALREADY verified the PIN
// server-side (the same pattern already used by app/api/dashboard-stats
// and app/api/ai-tools's sensitive-tool gate) and pass in the resulting
// verified shopId. This keeps the AI Core decoupled from the exact
// verification mechanism while never weakening it — createSellerRequestContext
// simply refuses to produce a context at all without an explicit,
// already-verified shopId, so there is no code path that lets an
// unverified caller obtain seller-scoped AI access.

export function createSellerRequestContext(
  sessionId: string,
  verifiedShopId: string,
  applicationLanguage: SupportedLanguage
): AIRequestContext {
  if (!verifiedShopId) {
    throw new Error('createSellerRequestContext requires an already-verified shopId — never call this before verifying seller ownership (PIN check) server-side.')
  }
  return { sessionId, userId: verifiedShopId, role: 'seller', shopId: verifiedShopId, applicationLanguage }
}

export function startSellerConversation(conversationId: string, requestContext: AIRequestContext): ConversationContext {
  return createConversationContext(conversationId, requestContext)
}

export async function sendSellerMessage(
  text: string,
  context: ConversationContext,
  requestContext: AIRequestContext,
  turn: number,
  confirmingPreviousAction = false
): Promise<ProcessMessageResult> {
  if (requestContext.role !== 'seller') {
    throw new Error('sendSellerMessage called with a non-seller AIRequestContext.')
  }
  if (!requestContext.shopId) {
    throw new Error('Seller AIRequestContext is missing shopId — refusing to proceed rather than allow an unscoped seller session.')
  }
  return processMessage({ text, context, requestContext, turn, confirmingPreviousAction })
}

export function getSellerCapabilities() {
  return { intents: getIntentsForRole('seller'), tools: getToolsForRole('seller') }
}

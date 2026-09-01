import { getCurrentBuyerId } from '@/lib/shop-likes'
import { getIntentsForRole, getToolsForRole, type SupportedLanguage, type ConversationContext } from '../../data-core'
import type { AIRequestContext } from '../../core/security/authorize'
import { processMessage, type ProcessMessageResult } from '../../core/orchestrator'
import { createConversationContext } from '../../core/context/engine'

// ═══════════════════════════════════════════════════════════
// BUYER 360 AI
// ═══════════════════════════════════════════════════════════
// The buyer-facing specialization of the shared AI Core. This module
// is intentionally thin — it does NOT reimplement the pipeline; it
// builds a real, verified AIRequestContext (never trusting a
// client-claimed identity) and calls the SAME orchestrator Seller 360
// AI calls, scoped to role='buyer'.

/**
 * Builds the buyer's identity context from a REAL resolved session —
 * getCurrentBuyerId() checks a live Supabase Auth session first, then
 * falls back to the OTP-based customer session, exactly the same way
 * the rest of the buyer app resolves identity (see lib/shop-likes.ts,
 * already used throughout the storefront/market/search features).
 * Returns userId: null for a fully anonymous visitor — Buyer 360 AI
 * still works for public tools (search) in that case, per
 * ToolPermission.public.
 */
export async function createBuyerRequestContext(
  sessionId: string,
  applicationLanguage: SupportedLanguage
): Promise<AIRequestContext> {
  const userId = await getCurrentBuyerId()
  return { sessionId, userId, role: 'buyer', shopId: null, applicationLanguage }
}

export function startBuyerConversation(conversationId: string, requestContext: AIRequestContext): ConversationContext {
  return createConversationContext(conversationId, requestContext)
}

export async function sendBuyerMessage(
  text: string,
  context: ConversationContext,
  requestContext: AIRequestContext,
  turn: number,
  confirmingPreviousAction = false
): Promise<ProcessMessageResult> {
  if (requestContext.role !== 'buyer') {
    throw new Error('sendBuyerMessage called with a non-buyer AIRequestContext.')
  }
  return processMessage({ text, context, requestContext, turn, confirmingPreviousAction })
}

/** What Buyer 360 AI can currently do — useful for a UI to render suggested actions (Part 2's "Find Products / Compare Products / Find a Shop / Track My Order" shortcuts) from the real registry instead of a hardcoded list. */
export function getBuyerCapabilities() {
  return { intents: getIntentsForRole('buyer'), tools: getToolsForRole('buyer') }
}

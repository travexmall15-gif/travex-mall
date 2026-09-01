import { z } from 'zod'
import { SupportedLanguageSchema, type ToolDefinition, type RefusalReason } from '../../data-core'

// ═══════════════════════════════════════════════════════════
// SECURITY / AUTHORIZATION
// ═══════════════════════════════════════════════════════════
// Implements Data Core's AUTHORIZATION_BOUNDARIES as real, executable
// checks. The single most important rule in this file:
//
//   AIRequestContext must NEVER be constructed from data the client
//   sent in the AI request body. It must be constructed from an
//   already-authenticated session, exactly the same way the rest of
//   ShopNekt's API routes do it (see the app's own security-hardening
//   work: app/api/dashboard-stats verifies shop ownership server-side
//   via a PIN check; app/messages/[id] verifies conversation
//   participancy — this module generalizes that same discipline for
//   AI tool calls specifically).
//
// Nothing in this file calls Supabase directly — it receives an
// already-verified identity and reasons about permissions from there.
// The actual "verify this session" step happens in the Buyer 360 /
// Seller 360 assistant facades (assistants/*/index.ts), which DO
// import the app's real auth helpers (getCurrentBuyerId, etc.) — kept
// separate so this file stays pure and unit-testable without mocking
// Supabase.

export const AIRequestContextSchema = z.object({
  /** Opaque session identifier, for audit/observability only — never used for authorization decisions by itself. */
  sessionId: z.string(),
  /** The authenticated user's real id (Supabase Auth uid or OTP customer id) — null only for a fully anonymous browsing session. */
  userId: z.string().nullable(),
  role: z.enum(['buyer', 'seller']),
  /** Populated ONLY for an authenticated seller, and only after real ownership has been verified upstream (see assistants/seller-360). */
  shopId: z.string().nullable(),
  /** The application's currently configured UI language — AI responses use this (Part 27's response-language rule), regardless of input language. */
  applicationLanguage: SupportedLanguageSchema,
})
export type AIRequestContext = z.infer<typeof AIRequestContextSchema>

export type AuthorizationResult =
  | { authorized: true }
  | { authorized: false; reason: RefusalReason }

/**
 * The single authorization gate every tool call must pass through
 * before execution. Pure function — given a context, a tool
 * definition, and (for ownResourceOnly tools) the resource id being
 * targeted, decides yes/no and WHY.
 */
export function authorizeToolCall(
  context: AIRequestContext,
  tool: ToolDefinition,
  targetResourceOwnerId?: string | null
): AuthorizationResult {
  // Role scoping: a buyer can never invoke a seller-only tool and vice
  // versa, regardless of what the request claims about intent.
  if (tool.role !== 'shared' && tool.role !== context.role) {
    return { authorized: false, reason: 'notOwner' }
  }

  switch (tool.permission) {
    case 'public':
      return { authorized: true }

    case 'authenticatedBuyer':
      if (context.role !== 'buyer' || !context.userId) {
        return { authorized: false, reason: 'unauthenticated' }
      }
      return { authorized: true }

    case 'authenticatedSeller':
      if (context.role !== 'seller' || !context.userId || !context.shopId) {
        return { authorized: false, reason: 'unauthenticated' }
      }
      return { authorized: true }

    case 'ownResourceOnly': {
      if (!context.userId) {return { authorized: false, reason: 'unauthenticated' }}

      // For seller tools, "own resource" means the target belongs to
      // context.shopId. For buyer tools (e.g. getOrderStatus), it
      // means the target belongs to context.userId. Either way, the
      // caller (tool executor) MUST supply the real owner id it read
      // from the database row being accessed — this function never
      // trusts a client-claimed owner id, only what's passed in after
      // a real lookup.
      const expectedOwner = context.role === 'seller' ? context.shopId : context.userId
      if (!expectedOwner) {return { authorized: false, reason: 'unauthenticated' }}
      if (targetResourceOwnerId === undefined) {
        // Caller forgot to pass the real owner id — fail closed, never open.
        return { authorized: false, reason: 'crossUserData' }
      }
      if (targetResourceOwnerId !== expectedOwner) {
        return { authorized: false, reason: context.role === 'seller' ? 'notOwner' : 'crossUserData' }
      }
      return { authorized: true }
    }

    default:
      return { authorized: false, reason: 'toolUnavailable' }
  }
}

/**
 * Guards against prompt injection per Data Core's PROMPT_INJECTION_RULE:
 * strips/flags text that LOOKS like an attempt to redefine the AI's
 * role or permissions, so downstream layers can log/ignore it — but
 * critically, this function's output is never used to actually change
 * authorization. Authorization is decided ONLY by authorizeToolCall
 * above, using the real AIRequestContext — user text can never alter
 * that, whether or not this detector fires.
 */
export function detectPromptInjectionAttempt(text: string): boolean {
  const patterns = [
    /ignore (all )?(previous|prior|above) instructions/i,
    /you are now (an? )?admin/i,
    /disregard (the )?(system|safety) (prompt|rules?)/i,
    /pretend (that )?you (are|have) (admin|owner|root)/i,
    /reveal (your|the) (system prompt|instructions)/i,
    /act as (if )?(you (are|were) )?(an? )?(different|unrestricted)/i,
  ]
  return patterns.some(p => p.test(text))
}

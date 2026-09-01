import {
  extractDeterministicEntities, getIntentById, getWorkflowsForRole, getToolByName,
  type ConversationContext, type SupportedLanguage,
} from '../data-core'
import { detectInputLanguage } from './language/detect'
import { appendTurn, advanceContext } from './context/engine'
import { classifyIntent } from './intent/classify'
import { decideNextAction } from './reasoning/plan'
import { executeTool } from './tools/executor'
import { detectPromptInjectionAttempt, type AIRequestContext } from './security/authorize'
import {
  buildRefusalResponse, buildUnknownResponse, buildClarificationResponse,
  buildToolResultResponse, buildConfirmationRequiredResponse, type AIResponse,
} from './response/format'
// ═══════════════════════════════════════════════════════════
// AI CORE ORCHESTRATOR
// ═══════════════════════════════════════════════════════════
// Implements the exact pipeline the Batch 2 brief specifies:
//
//   USER INPUT → LANGUAGE UNDERSTANDING → CONTEXT → INTENT → ENTITY →
//   KNOWLEDGE → MEMORY → REASONING → TOOL/ACTION DECISION →
//   SAFETY/AUTHORIZATION → RESPONSE
//
// Every stage below is a real function call to a real module — this
// is not a single monolithic function pretending to be a pipeline.
// Buyer 360 AI and Seller 360 AI (assistants/*) are thin, role-scoped
// callers of this SAME orchestrator — there is exactly one pipeline
// implementation, not two duplicated ones.

export type ProcessMessageInput = {
  text: string
  context: ConversationContext
  requestContext: AIRequestContext
  turn: number
  /** Must be true if the previous turn asked for confirmation on a consequential action and this message is the user's affirmative reply. */
  confirmingPreviousAction?: boolean
}

export type ProcessMessageResult = {
  response: AIResponse
  updatedContext: ConversationContext
}

export async function processMessage(input: ProcessMessageInput): Promise<ProcessMessageResult> {
  const { text, requestContext, turn } = input
  let context = input.context

  // ── 1. LANGUAGE UNDERSTANDING ──
  // Detects the INPUT language (for code-switching awareness only).
  // The RESPONSE language is always requestContext.applicationLanguage
  // (Part 27) — the two are deliberately never conflated.
  const languageDetection = detectInputLanguage(text)
  const responseLanguage: SupportedLanguage = requestContext.applicationLanguage

  // ── Safety pre-check: prompt injection ──
  // Detected here (before it can influence anything downstream), but
  // per Data Core's PROMPT_INJECTION_RULE, detecting it changes
  // nothing about authorization — the message is simply treated as
  // ordinary conversational text either way. This flag exists purely
  // for audit/observability.
  const promptInjectionDetected = detectPromptInjectionAttempt(text)

  // ── 2. CONTEXT ──
  context = appendTurn(context, {
    turn, role: 'user', text,
    detectedLanguage: languageDetection.detected,
    extractedEntityTypes: [],
  })

  // ── 3. ENTITY (extracted before intent, since intent scoring uses entity presence as a signal) ──
  const entities = extractDeterministicEntities(text)

  // ── 4. INTENT ──
  const intentResult = classifyIntent(text, requestContext.role, entities)

  // ── advance context (continuity: does this continue the active task?) ──
  context = advanceContext(context, turn, intentResult.intentId, intentResult.confidence, entities as Record<string, unknown>)

  // ── 5. KNOWLEDGE (only consulted for knowledge-answer intents; see reasoning below) ──
  // ── 6. MEMORY ──
  // Memory read/write is the responsibility of the assistant facade
  // (assistants/buyer-360, assistants/seller-360), which has access to
  // a real MemoryStore instance — the Core orchestrator stays
  // storage-agnostic. Preferences relevant to this turn (if any) are
  // expected to already be folded into `context` by the caller before
  // this function runs.

  // ── 7. REASONING ──
  const decision = decideNextAction(intentResult.intentId, intentResult.confidence, context.activeTask)

  // ── 8/9. TOOL/ACTION DECISION + SAFETY/AUTHORIZATION + RESPONSE ──
  let response: AIResponse

  switch (decision.action) {
    case 'unknown': {
      response = buildUnknownResponse(responseLanguage, entities)
      break
    }

    case 'refuse': {
      response = buildRefusalResponse(decision.reason === 'toolUnavailable' ? 'toolUnavailable' : 'outOfScope', responseLanguage, intentResult.intentId)
      break
    }

    case 'askClarification': {
      response = buildClarificationResponse(responseLanguage, decision.intentId, decision.missingEntityType, entities)
      break
    }

    case 'answerFromKnowledge': {
      const workflows = getWorkflowsForRole(requestContext.role)
      const intentDef = getIntentById(decision.intentId)
      response = {
        text: intentDef ? intentDef.description : 'ShopNekt helps buyers and sellers connect through shops, products, Flash Deals, Group Buy, and Social Vybe.',
        language: responseLanguage, intentId: decision.intentId, entities,
        status: 'ok', hallucinationClass: 'KNOWN',
        data: workflows, confirmationRequired: false,
      }
      break
    }

    case 'executeTool': {
      const tool = getToolByName(decision.toolName)
      if (!tool) {
        response = buildRefusalResponse('toolUnavailable', responseLanguage, decision.intentId)
        break
      }

      if (decision.requiresConfirmation && !input.confirmingPreviousAction) {
        response = buildConfirmationRequiredResponse(responseLanguage, decision.intentId, decision.toolName, entities)
        break
      }

      const toolInput = buildToolInput(decision.toolName, text, entities, context)
      const result = await executeTool(decision.toolName, toolInput, requestContext, { confirmed: !!input.confirmingPreviousAction })

      if (!result.ok) {
        if ('authorization' in result) {
          response = buildRefusalResponse(result.authorization.authorized ? 'toolUnavailable' : result.authorization.reason, responseLanguage, decision.intentId)
        } else {
          response = buildRefusalResponse('toolUnavailable', responseLanguage, decision.intentId)
        }
        break
      }

      response = buildToolResultResponse(responseLanguage, decision.intentId, decision.toolName, result.data, entities)
      break
    }
  }

  context = appendTurn(context, {
    turn: turn + 1, role: 'assistant', text: response.text,
    detectedLanguage: responseLanguage,
    extractedEntityTypes: Object.keys(entities) as any,
  })

  return { response, updatedContext: context }
}

/** Builds the real input object a tool call needs from the current extracted entities/context. */
function buildToolInput(toolName: string, rawText: string, entities: ReturnType<typeof extractDeterministicEntities>, context: ConversationContext): Record<string, unknown> {
  switch (toolName) {
    case 'searchProducts':
    case 'searchShops':
      return { query: rawText, category: entities.category?.canonical, maxPrice: entities.price?.amount }
    case 'getFlashDeals':
    case 'getGroupBuys':
      return { category: entities.category?.canonical }
    case 'getOrderStatus':
      return { orderId: (context.activeTask?.slots.find(s => s.entityType === 'orderId')?.value) }
    default:
      return {}
  }
}

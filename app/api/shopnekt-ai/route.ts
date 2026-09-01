import { NextRequest } from 'next/server'
import { createBuyerRequestContext, startBuyerConversation, sendBuyerMessage } from '@/lib/shopnekt-ai/assistants/buyer-360'
import { streamGroundedResponse } from '@/lib/shopnekt-ai/runtime/respond'
import type { ConversationContext, SupportedLanguage } from '@/lib/shopnekt-ai/data-core'

// ═══════════════════════════════════════════════════════════
// /api/shopnekt-ai — Buyer 360 AI endpoint for /aiv
// ═══════════════════════════════════════════════════════════
// Stateless per request, same pattern already used elsewhere in this
// app: the client sends the conversation context it was last given
// back, the server advances it one turn, and returns the updated
// context for the client to hold and resend next turn. No new
// database table is introduced for this (kept in-scope for Batch 3 —
// see the final report's "known limitations" for durable server-side
// conversation history as a follow-up).
//
// SECURITY: buyer identity is resolved server-side from the real
// session (createBuyerRequestContext -> getCurrentBuyerId()) — never
// taken from the request body. The client can send whatever role/
// userId it wants in the body; it is simply ignored.

export const runtime = 'nodejs'

type RequestBody = {
  text: string
  context: ConversationContext | null
  applicationLanguage: SupportedLanguage
  turn: number
  confirmingPreviousAction?: boolean
}

export async function POST(req: NextRequest) {
  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid request body.', { status: 400 })
  }

  if (!body.text || typeof body.text !== 'string' || body.text.length > 2000) {
    return new Response('Invalid message.', { status: 400 })
  }

  const requestContext = await createBuyerRequestContext(crypto.randomUUID(), body.applicationLanguage || 'en')
  const context = body.context ?? startBuyerConversation(crypto.randomUUID(), requestContext)

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      try {
        const { response, updatedContext } = await sendBuyerMessage(
          body.text, context, requestContext, body.turn, body.confirmingPreviousAction
        )

        // Non-tool-result responses (clarification/refusal/unknown/
        // knowledge answers) have no token-by-token generation behind
        // them — sending the complete text as one chunk is the honest
        // representation of that, not "fake streaming" (spec section
        // 13 explicitly allows falling back to normal generation when
        // there's nothing to stream).
        if (!response.pendingPhrase) {
          send({ type: 'delta', text: response.text })
        } else {
          for await (const chunk of streamGroundedResponse(response.pendingPhrase.toolName, response.pendingPhrase.data, requestContext.applicationLanguage)) {
            if (chunk.type === 'delta') {send({ type: 'delta', text: chunk.text })}
            if (chunk.type === 'error') {send({ type: 'delta', text: response.text })} // safe template fallback, never silence
          }
        }

        send({ type: 'done', response: { ...response, pendingPhrase: undefined }, context: updatedContext })
      } catch (err) {
        send({ type: 'error', message: 'AI model runtime unavailable.' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  })
}

import { getToolByName, type ToolDefinition } from '../../data-core'
import { authorizeToolCall, type AIRequestContext, type AuthorizationResult } from '../security/authorize'
import * as buyerTools from './buyer-tools'
import * as sellerTools from './seller-tools'

// ═══════════════════════════════════════════════════════════
// TOOL EXECUTOR
// ═══════════════════════════════════════════════════════════
// The ONLY place in the AI Core where a tool contract (Data Core) is
// connected to a real implementation (buyer-tools.ts / seller-tools.ts)
// AND authorization is enforced. The reasoning engine decides WHICH
// tool to call; this module is the sole gate that decides whether that
// call is actually allowed to run, and is the only place real
// database side effects happen for AI-initiated actions.

export type ToolExecutionResult =
  | { ok: true; toolName: string; data: unknown }
  | { ok: false; toolName: string; authorization: AuthorizationResult }
  | { ok: false; toolName: string; error: string }

/**
 * Executes a named tool with the given input, under the given
 * authenticated context. `confirmed` must be true for any
 * isConsequential tool — the caller (orchestrator) is responsible for
 * having actually obtained that confirmation from the user first;
 * this function just refuses to proceed without it as a hard backstop.
 */
export async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  context: AIRequestContext,
  options: { confirmed?: boolean } = {}
): Promise<ToolExecutionResult> {
  const tool = getToolByName(toolName)
  if (!tool) {
    return { ok: false, toolName, error: 'Unknown tool.' }
  }

  if (tool.isConsequential && !options.confirmed) {
    return {
      ok: false, toolName,
      authorization: { authorized: false, reason: 'consequentialUnconfirmed' },
    }
  }

  // ── Resolve the real resource owner (for ownResourceOnly tools) ──
  // before authorizing, so authorizeToolCall never has to trust a
  // caller-supplied owner id.
  let targetResourceOwnerId: string | null | undefined = undefined

  if (tool.permission === 'ownResourceOnly') {
    targetResourceOwnerId = await resolveOwnerForTool(tool, input, context)
  }

  const auth = authorizeToolCall(context, tool, targetResourceOwnerId)
  if (!auth.authorized) {
    return { ok: false, toolName, authorization: auth }
  }

  try {
    const data = await dispatch(tool, input, context)
    return { ok: true, toolName, data }
  } catch (err) {
    return { ok: false, toolName, error: 'The tool failed to execute.' }
  }
}

/**
 * For ownResourceOnly tools, fetches (read-only, no side effects) the
 * real owner id of the targeted resource so authorizeToolCall can
 * compare it against the authenticated context. Returns null if the
 * resource doesn't exist (authorization will then correctly fail
 * rather than silently succeed).
 */
async function resolveOwnerForTool(
  tool: ToolDefinition,
  input: Record<string, unknown>,
  context: AIRequestContext
): Promise<string | null> {
  switch (tool.name) {
    case 'getOrderStatus': {
      const { ownerBuyerId } = await buyerTools.toolGetOrderRaw(String(input.orderId))
      return ownerBuyerId
    }
    case 'getPreferredShops':
      // The resource IS the authenticated user's own list — owner is always the caller.
      return context.userId
    case 'getInventory':
    case 'getSellerOrders':
    case 'getAnalytics':
    case 'createProductDraft':
    case 'updateProduct':
    case 'createFlashDeal':
    case 'createGroupBuy':
    case 'createSocialPost':
      // Seller tools are always scoped to the seller's OWN shop —
      // the target owner is that shop id, taken from the input the
      // orchestrator built from context.shopId (never client-typed
      // free text), so the "owner" check is really confirming the
      // context's own shopId matches itself — the real protection is
      // that the orchestrator NEVER passes a shopId that didn't come
      // from context.shopId to begin with (see assistants/seller-360).
      return context.shopId
    default:
      return null
  }
}

async function dispatch(tool: ToolDefinition, input: Record<string, unknown>, context: AIRequestContext): Promise<unknown> {
  switch (tool.name) {
    // Buyer — public
    case 'searchProducts': return buyerTools.toolSearchProducts(input as any)
    case 'searchShops': return buyerTools.toolSearchShops(input as any)
    case 'getProduct': return buyerTools.toolGetProduct(input as any)
    case 'getShop': return buyerTools.toolGetShop(input as any)
    case 'getFlashDeals': return buyerTools.toolGetFlashDeals(input as any)
    case 'getGroupBuys': return buyerTools.toolGetGroupBuys(input as any)
    case 'getStorePosts': return buyerTools.toolGetStorePosts(input as any)

    // Buyer — authenticated
    case 'getPreferredShops': return buyerTools.toolGetPreferredShops(context.userId!)
    case 'getOrderStatus': {
      const { order } = await buyerTools.toolGetOrderRaw(String(input.orderId))
      return order
    }
    case 'createOrder': return buyerTools.toolCreateOrder(input as any)

    // Seller
    case 'getInventory': return sellerTools.toolGetInventory(context.shopId!)
    case 'getSellerOrders': return sellerTools.toolGetSellerOrders(context.shopId!, input.status as string | undefined)
    case 'getAnalytics': return sellerTools.toolGetAnalytics(context.shopId!)
    case 'createProductDraft': return sellerTools.toolCreateProductDraft({ ...(input as any), shopId: context.shopId! })
    case 'updateProduct': return sellerTools.toolUpdateProduct({ ...(input as any), shopId: context.shopId! })
    case 'createFlashDeal': return sellerTools.toolCreateFlashDeal({ ...(input as any), shopId: context.shopId! })
    case 'createGroupBuy': return sellerTools.toolCreateGroupBuy({ ...(input as any), shopId: context.shopId! })
    case 'createSocialPost': return sellerTools.toolCreateSocialPost({ ...(input as any), shopId: context.shopId! })

    default:
      throw new Error(`No dispatch implemented for tool "${tool.name}"`)
  }
}

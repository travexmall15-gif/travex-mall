import { z } from 'zod'
import { AssistantRoleSchema } from '../intents'

// ═══════════════════════════════════════════════════════════
// TOOL / ACTION REGISTRY
// ═══════════════════════════════════════════════════════════
// A tool CONTRACT (name, input schema, output schema, permission
// requirements) — NOT an implementation. The Data Core defines what
// tools exist and what they promise to do; AI Core (Batch 2) is
// responsible for actually calling Supabase/real APIs to fulfill
// them. This separation is what lets the AI ground every claim in a
// real, auditable action instead of inventing results (Part 18).
//
// Every tool that reads or writes real ShopNekt data is scoped to
// exactly one assistant role, and consequential tools (writes) are
// flagged so the Safety layer knows to require confirmation.

export const ToolPermissionSchema = z.enum([
  'public',          // no auth required (e.g. searching public product listings)
  'authenticatedBuyer',
  'authenticatedSeller',
  'ownResourceOnly',  // caller must own the specific resource being accessed (e.g. their own shop/order)
])
export type ToolPermission = z.infer<typeof ToolPermissionSchema>

export const ToolDefinitionSchema = z.object({
  name: z.string(),
  role: AssistantRoleSchema,
  description: z.string(),
  permission: ToolPermissionSchema,
  /** True if calling this tool changes ShopNekt data — safety layer requires user confirmation before execution. */
  isConsequential: z.boolean(),
  /** Names of the input fields this tool expects — actual Zod input schemas live alongside each tool's real implementation in AI Core, not duplicated here. */
  inputFields: z.array(z.string()),
  /** What kind of real ShopNekt data this tool returns — for grounding/documentation, not the literal TS type. */
  returns: z.string(),
})
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>

export const TOOLS: ToolDefinition[] = [
  // ═══ BUYER TOOLS (read-only, low risk) ═══
  {
    name: 'searchProducts', role: 'buyer', permission: 'public', isConsequential: false,
    description: 'Search real ShopNekt product listings by category, price range, and free text.',
    inputFields: ['query', 'category', 'maxPrice', 'minPrice'],
    returns: 'ProductConcept[]',
  },
  {
    name: 'searchShops', role: 'buyer', permission: 'public', isConsequential: false,
    description: 'Search real approved ShopNekt shops by category, region, or name.',
    inputFields: ['query', 'category', 'region'],
    returns: 'ShopConcept[]',
  },
  {
    name: 'getProduct', role: 'buyer', permission: 'public', isConsequential: false,
    description: 'Fetch full details for one specific real product by id.',
    inputFields: ['productId'],
    returns: 'ProductConcept | null',
  },
  {
    name: 'getShop', role: 'buyer', permission: 'public', isConsequential: false,
    description: 'Fetch full details for one specific real shop by id.',
    inputFields: ['shopId'],
    returns: 'ShopConcept | null',
  },
  {
    name: 'getFlashDeals', role: 'buyer', permission: 'public', isConsequential: false,
    description: 'List currently active real Flash Deals.',
    inputFields: ['category'],
    returns: 'FlashDealConcept[]',
  },
  {
    name: 'getGroupBuys', role: 'buyer', permission: 'public', isConsequential: false,
    description: 'List currently active real Group Buy campaigns.',
    inputFields: ['category'],
    returns: 'GroupBuyConcept[]',
  },
  {
    name: 'getStorePosts', role: 'buyer', permission: 'public', isConsequential: false,
    description: 'List a specific shop\'s real Social Vybe posts.',
    inputFields: ['shopId'],
    returns: 'VybePostConcept[]',
  },
  {
    name: 'getPreferredShops', role: 'buyer', permission: 'authenticatedBuyer', isConsequential: false,
    description: 'List the current buyer\'s own liked shops (Preferred Shops).',
    inputFields: [],
    returns: 'PreferredShopConcept[]',
  },
  {
    name: 'getOrderStatus', role: 'buyer', permission: 'ownResourceOnly', isConsequential: false,
    description: 'Fetch the status of one of the current buyer\'s own orders.',
    inputFields: ['orderId'],
    returns: 'OrderConcept | null',
  },

  // ═══ BUYER TOOLS (consequential — require confirmation) ═══
  {
    name: 'createOrder', role: 'buyer', permission: 'authenticatedBuyer', isConsequential: true,
    description: 'Place a real order for a specific product. Must be confirmed by the buyer before execution.',
    inputFields: ['productId', 'quantity', 'deliveryLocation'],
    returns: 'OrderConcept',
  },

  // ═══ SELLER TOOLS (read-only) ═══
  {
    name: 'getInventory', role: 'seller', permission: 'ownResourceOnly', isConsequential: false,
    description: 'Fetch the authenticated seller\'s own product stock levels.',
    inputFields: [],
    returns: 'ProductConcept[]',
  },
  {
    name: 'getSellerOrders', role: 'seller', permission: 'ownResourceOnly', isConsequential: false,
    description: 'Fetch the authenticated seller\'s own incoming orders.',
    inputFields: ['status'],
    returns: 'OrderConcept[]',
  },
  {
    name: 'getAnalytics', role: 'seller', permission: 'ownResourceOnly', isConsequential: false,
    description: 'Fetch the authenticated seller\'s own real sales analytics for a date range.',
    inputFields: ['dateRange'],
    returns: 'structured sales summary (revenue, order count, top products) — real data only, never estimated',
  },

  // ═══ SELLER TOOLS (consequential — require confirmation) ═══
  {
    name: 'createProductDraft', role: 'seller', permission: 'ownResourceOnly', isConsequential: true,
    description: 'Create a new product listing draft in the authenticated seller\'s own shop.',
    inputFields: ['name', 'price', 'category', 'description', 'stock'],
    returns: 'ProductConcept',
  },
  {
    name: 'updateProduct', role: 'seller', permission: 'ownResourceOnly', isConsequential: true,
    description: 'Modify an existing product the authenticated seller owns.',
    inputFields: ['productId', 'fields'],
    returns: 'ProductConcept',
  },
  {
    name: 'createFlashDeal', role: 'seller', permission: 'ownResourceOnly', isConsequential: true,
    description: 'Create a Flash Deal campaign for one of the authenticated seller\'s own products.',
    inputFields: ['productId', 'dealPrice', 'durationHours'],
    returns: 'FlashDealConcept',
  },
  {
    name: 'createGroupBuy', role: 'seller', permission: 'ownResourceOnly', isConsequential: true,
    description: 'Create a Group Buy campaign for one of the authenticated seller\'s own products.',
    inputFields: ['productId', 'groupPrice', 'minMembers', 'durationHours'],
    returns: 'GroupBuyConcept',
  },
  {
    name: 'createSocialPost', role: 'seller', permission: 'ownResourceOnly', isConsequential: true,
    description: 'Publish a Social Vybe post from the authenticated seller\'s own shop.',
    inputFields: ['content', 'mediaUrl', 'productId'],
    returns: 'VybePostConcept',
  },
]

export function getToolsForRole(role: 'buyer' | 'seller'): ToolDefinition[] {
  return TOOLS.filter(t => t.role === role)
}

export function getToolByName(name: string): ToolDefinition | undefined {
  return TOOLS.find(t => t.name === name)
}

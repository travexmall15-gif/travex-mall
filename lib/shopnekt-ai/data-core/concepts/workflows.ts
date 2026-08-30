import { z } from 'zod'
import { AssistantRoleSchema } from '../intents'

// ═══════════════════════════════════════════════════════════
// KNOWLEDGE LAYER — WORKFLOWS
// ═══════════════════════════════════════════════════════════
// Static domain knowledge about how ShopNekt concepts relate to each
// other in real user journeys (master spec section 10). This is
// reference knowledge the AI can draw on to explain "how ShopNekt
// works" or to sequence multi-step guidance — it is NOT a script the
// AI must follow verbatim, and it never embeds live data.

export const WorkflowStepSchema = z.object({
  step: z.number().int().positive(),
  description: z.string(),
  /** Which concept (concepts/index.ts) or tool (tools/index.ts) this step involves, if any. */
  relatesTo: z.string().optional(),
})

export const WorkflowSchema = z.object({
  id: z.string(),
  role: AssistantRoleSchema,
  title: z.string(),
  steps: z.array(WorkflowStepSchema),
})
export type Workflow = z.infer<typeof WorkflowSchema>

export const WORKFLOWS: Workflow[] = [
  {
    id: 'BUYER_LIKE_SHOP_TO_PREFERRED',
    role: 'buyer',
    title: 'How liking a shop works',
    steps: [
      { step: 1, description: 'Buyer taps Like Shop on a storefront or search result.', relatesTo: 'shop' },
      { step: 2, description: 'The shop is added to the buyer\'s Preferred Shops — there is no separate "Follow" system in ShopNekt.', relatesTo: 'preferredShop' },
      { step: 3, description: 'The shop\'s public like count increases by one, visible to all visitors.', relatesTo: 'shop' },
    ],
  },
  {
    id: 'BUYER_DISCOVER_TO_ORDER',
    role: 'buyer',
    title: 'How a buyer goes from discovery to a placed order',
    steps: [
      { step: 1, description: 'Buyer searches or browses Market/Vybe/Flash Deals/Group Buy.', relatesTo: 'searchProducts' },
      { step: 2, description: 'Buyer opens a product and reviews real price/stock/seller information.', relatesTo: 'product' },
      { step: 3, description: 'Buyer requests to order — this is a consequential action requiring explicit confirmation before it is created.', relatesTo: 'createOrder' },
      { step: 4, description: 'Order status moves through pending → confirmed/rejected → (if rejected) payment_pending → delivered.', relatesTo: 'order' },
    ],
  },
  {
    id: 'SELLER_POST_TO_STORE_POSTS',
    role: 'seller',
    title: 'How a Social Vybe post appears in a seller\'s Store → Posts',
    steps: [
      { step: 1, description: 'Seller creates a post on Social Vybe, optionally attaching one real product.', relatesTo: 'createSocialPost' },
      { step: 2, description: 'The same post automatically appears under that seller\'s Store → Posts tab — sellers never upload it twice.', relatesTo: 'vybePost' },
    ],
  },
  {
    id: 'SELLER_PRODUCT_TO_CAMPAIGN',
    role: 'seller',
    title: 'How Flash Deals and Group Buy relate to a product',
    steps: [
      { step: 1, description: 'A Flash Deal or Group Buy campaign always references one existing product — it never duplicates the product record.', relatesTo: 'product' },
      { step: 2, description: 'When the campaign\'s time expires (or, for Group Buy, if the member target isn\'t reached in time), the campaign ends.', relatesTo: 'flashDeal' },
      { step: 3, description: 'The underlying product always remains available in the seller\'s store — only the promotional campaign expires, never the product.', relatesTo: 'product' },
    ],
  },
]

export function getWorkflowsForRole(role: 'buyer' | 'seller'): Workflow[] {
  return WORKFLOWS.filter(w => w.role === role)
}

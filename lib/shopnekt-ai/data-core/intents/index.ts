import { z } from 'zod'

// ═══════════════════════════════════════════════════════════
// INTENT REGISTRY
// ═══════════════════════════════════════════════════════════
// A structured catalogue of what a user COULD be asking for. This is
// not a classifier implementation — it's the reference taxonomy that
// a future Intent Engine (Batch 2) matches against. Each intent
// carries example utterances in both primary languages so the
// taxonomy itself can double as evaluation/training data (per master
// spec section 26/27), and a `requiresAuth`/`role` scope so AI Core
// knows which assistant (Buyer 360 / Seller 360) an intent belongs to.

export const AssistantRoleSchema = z.enum(['buyer', 'seller', 'shared'])
export type AssistantRole = z.infer<typeof AssistantRoleSchema>

export const IntentDefinitionSchema = z.object({
  id: z.string(),
  role: AssistantRoleSchema,
  description: z.string(),
  /** Which entity types this intent typically expects (see entities/). */
  expectedEntities: z.array(z.string()).default([]),
  /** Whether fulfilling this intent requires a signed-in user. */
  requiresAuth: z.boolean().default(false),
  /** Whether fulfilling this intent changes data (see safety rules — consequential actions need confirmation). */
  isConsequential: z.boolean().default(false),
  examples: z.object({ sw: z.array(z.string()), en: z.array(z.string()) }),
})
export type IntentDefinition = z.infer<typeof IntentDefinitionSchema>

export const INTENTS: IntentDefinition[] = [
  // ═══ BUYER INTENTS ═══
  {
    id: 'PRODUCT_SEARCH', role: 'buyer',
    description: 'Buyer wants to find products matching criteria (category, price, brand, feature).',
    expectedEntities: ['category', 'price'],
    requiresAuth: false, isConsequential: false,
    examples: {
      sw: ['Natafuta simu ya laki tano', 'nionyeshe shoes chini ya 100k', 'nataka nguo za kiume', 'Nataka kununua', 'nataka kununua kitu'],
      en: ['Show me phones under 500k', 'I need men\'s sneakers under TZS 150,000', 'looking for a laptop', 'I want to buy something', 'I want to buy'],
    },
  },
  {
    id: 'SHOP_SEARCH', role: 'buyer',
    description: 'Buyer wants to find shops (by category, region, or name).',
    expectedEntities: ['category'],
    requiresAuth: false, isConsequential: false,
    examples: {
      sw: ['nionyeshe maduka ya electronics Arusha', 'nataka duka la nguo karibu'],
      en: ['show me electronics shops in Arusha', 'find a fashion shop near me'],
    },
  },
  {
    id: 'PRODUCT_DETAILS', role: 'buyer',
    description: 'Buyer wants more information about a specific, already-identified product.',
    expectedEntities: ['product'],
    requiresAuth: false, isConsequential: false,
    examples: { sw: ['bei ya hii ni ngapi?', 'ina rangi gani?'], en: ['how much is this?', 'what colors does it come in?'] },
  },
  {
    id: 'PRODUCT_COMPARE', role: 'buyer',
    description: 'Buyer wants to compare two or more products.',
    expectedEntities: ['product'],
    requiresAuth: false, isConsequential: false,
    examples: { sw: ['linganisha hizi simu mbili'], en: ['compare these two phones'] },
  },
  {
    id: 'VIEW_SHOP', role: 'buyer',
    description: 'Buyer wants to open a specific shop\'s storefront.',
    expectedEntities: ['shopName'],
    requiresAuth: false, isConsequential: false,
    examples: { sw: ['nifungulie duka la Niffer Outfit'], en: ['open Niffer Outfit\'s shop'] },
  },
  {
    id: 'PREFERRED_SHOPS_VIEW', role: 'buyer',
    description: 'Buyer wants to see the shops they have liked (Preferred Shops — NOT a Follow list).',
    expectedEntities: [],
    requiresAuth: true, isConsequential: false,
    examples: { sw: ['nionyeshe maduka niliyopenda'], en: ['show my preferred shops'] },
  },
  {
    id: 'FLASH_DEAL_SEARCH', role: 'buyer',
    description: 'Buyer wants to see active Flash Deals.',
    expectedEntities: [],
    requiresAuth: false, isConsequential: false,
    examples: { sw: ['kuna flash deals leo?'], en: ['any flash deals right now?'] },
  },
  {
    id: 'GROUP_BUY_SEARCH', role: 'buyer',
    description: 'Buyer wants to see active Group Buy campaigns.',
    expectedEntities: [],
    requiresAuth: false, isConsequential: false,
    examples: { sw: ['kuna group buy ya simu?'], en: ['any group buys for phones?'] },
  },
  {
    id: 'ORDER_STATUS', role: 'buyer',
    description: 'Buyer wants to check the status of an existing order.',
    expectedEntities: ['orderId'],
    requiresAuth: true, isConsequential: false,
    examples: { sw: ['oda yangu iko wapi?'], en: ['where is my order?', 'track my order'] },
  },
  {
    id: 'ORDER_HELP', role: 'buyer',
    description: 'Buyer needs help with an order problem.',
    expectedEntities: ['orderId'],
    requiresAuth: true, isConsequential: false,
    examples: { sw: ['oda yangu ina tatizo'], en: ['there\'s a problem with my order'] },
  },
  {
    id: 'ORDER_CREATE', role: 'buyer',
    description: 'Buyer wants to place an order for a specific product. Consequential — requires confirmation before executing.',
    expectedEntities: ['product', 'quantity'],
    requiresAuth: false, isConsequential: true,
    examples: { sw: ['nataka kuagiza hii'], en: ['I want to order this'] },
  },

  // ═══ SELLER INTENTS ═══
  {
    id: 'CREATE_PRODUCT', role: 'seller',
    description: 'Seller wants to add a new product to their shop. Consequential.',
    expectedEntities: ['productName', 'price', 'category'],
    requiresAuth: true, isConsequential: true,
    examples: { sw: ['nataka kuongeza bidhaa mpya'], en: ['I want to add a new product'] },
  },
  {
    id: 'EDIT_PRODUCT', role: 'seller',
    description: 'Seller wants to modify an existing product (price, stock, description). Consequential.',
    expectedEntities: ['product', 'price', 'stock'],
    requiresAuth: true, isConsequential: true,
    examples: { sw: ['badilisha bei ya bidhaa hii'], en: ['change the price of this product'] },
  },
  {
    id: 'PRODUCT_DESCRIPTION_HELP', role: 'seller',
    description: 'Seller wants AI assistance writing/improving a product description or title.',
    expectedEntities: ['productName', 'category'],
    requiresAuth: true, isConsequential: false,
    examples: { sw: ['nisaidie kuandika maelezo ya bidhaa'], en: ['help me write a product description'] },
  },
  {
    id: 'INVENTORY_CHECK', role: 'seller',
    description: 'Seller wants to check stock levels.',
    expectedEntities: ['product'],
    requiresAuth: true, isConsequential: false,
    examples: { sw: ['stock yangu iko vipi?'], en: ['what\'s my current stock?'] },
  },
  {
    id: 'SELLER_ORDER_VIEW', role: 'seller',
    description: 'Seller wants to see their incoming orders.',
    expectedEntities: [],
    requiresAuth: true, isConsequential: false,
    examples: { sw: ['nionyeshe oda zangu'], en: ['show my orders'] },
  },
  {
    id: 'CUSTOMER_ASSISTANCE', role: 'seller',
    description: 'Seller wants help drafting a reply to a buyer message.',
    expectedEntities: [],
    requiresAuth: true, isConsequential: false,
    examples: { sw: ['nisaidie kujibu mteja'], en: ['help me reply to this customer'] },
  },
  {
    id: 'CREATE_FLASH_DEAL', role: 'seller',
    description: 'Seller wants to create a Flash Deal campaign. Consequential.',
    expectedEntities: ['product', 'price', 'duration'],
    requiresAuth: true, isConsequential: true,
    examples: { sw: ['nataka kutengeneza flash deal'], en: ['I want to create a flash deal'] },
  },
  {
    id: 'CREATE_GROUP_BUY', role: 'seller',
    description: 'Seller wants to create a Group Buy campaign. Consequential.',
    expectedEntities: ['product', 'price', 'minMembers', 'duration'],
    requiresAuth: true, isConsequential: true,
    examples: { sw: ['nataka kuanzisha group buy'], en: ['I want to start a group buy'] },
  },
  {
    id: 'CREATE_SOCIAL_POST', role: 'seller',
    description: 'Seller wants to create a Social Vybe post. Consequential.',
    expectedEntities: ['product'],
    requiresAuth: true, isConsequential: true,
    examples: { sw: ['nataka kutuma post kwenye Vybe'], en: ['I want to post on Vybe'] },
  },
  {
    id: 'SHOP_ANALYTICS', role: 'seller',
    description: 'Seller wants to understand their shop\'s sales performance.',
    expectedEntities: ['dateRange'],
    requiresAuth: true, isConsequential: false,
    examples: { sw: ['mauzo yangu yakoje mwezi huu?'], en: ['how are my sales this month?'] },
  },
  {
    id: 'SELLER_DASHBOARD_HELP', role: 'seller',
    description: 'Seller needs help understanding a seller-dashboard feature.',
    expectedEntities: [],
    requiresAuth: true, isConsequential: false,
    examples: { sw: ['nifanyeje kuweka duka langu live?'], en: ['how do I get my shop live?'] },
  },

  // ═══ SHARED ═══
  {
    id: 'GENERAL_SHOPNEKT_HELP', role: 'shared',
    description: 'General question about how ShopNekt works.',
    expectedEntities: [],
    requiresAuth: false, isConsequential: false,
    examples: { sw: ['ShopNekt inafanya kazije?'], en: ['how does ShopNekt work?'] },
  },
]

export function getIntentsForRole(role: AssistantRole): IntentDefinition[] {
  return INTENTS.filter(i => i.role === role || i.role === 'shared')
}

export function getIntentById(id: string): IntentDefinition | undefined {
  return INTENTS.find(i => i.id === id)
}

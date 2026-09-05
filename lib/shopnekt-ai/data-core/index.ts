// ═══════════════════════════════════════════════════════════
// SHOPNEKT 360 AI — DATA CORE — PUBLIC API
// ═══════════════════════════════════════════════════════════
// This is the ONLY file AI Core (Batch 2) should need to import from
// to use the Data Core. Everything exported here is pure data,
// schemas, and deterministic pure functions — there is no I/O, no
// network calls, no database access, and no dependency on any AI
// provider anywhere in this package.
//
// LAYER BOUNDARY (read this before adding anything to this package):
//   ✅ belongs here:  typed knowledge, schemas, terminology, static
//      workflow descriptions, deterministic text parsing (e.g. price
//      expressions), validation logic.
//   ❌ does NOT belong here: calling Supabase, calling any LLM/AI
//      API, model inference of any kind, session/auth handling,
//      React/UI code. Those belong to AI Core (Batch 2) and the AI
//      Engine / model runtime (Batch 3) respectively.

export { DATA_CORE_VERSION, DATA_CORE_SCHEMA_VERSION, DATA_CORE_CHANGELOG } from './version'

// Language
export {
  SupportedLanguageSchema, SUPPORTED_LANGUAGES, AI_PRIMARY_LANGUAGES,
  LocalizedTextSchema, localize,
} from './schemas/language'
export type { SupportedLanguage, LocalizedText } from './schemas/language'

// Concepts (ShopNekt domain shapes)
export {
  MarketSchema, PlanSchema, RegionSchema, ShopStatusSchema, OrderStatusSchema,
  ShopConceptSchema, ProductConceptSchema, OrderConceptSchema,
  FlashDealConceptSchema, GroupBuyConceptSchema, VybePostConceptSchema,
  PreferredShopConceptSchema, CONCEPT_REGISTRY,
} from './concepts'
export type {
  Market, Plan, Region, ShopStatus, OrderStatus,
  ShopConcept, ProductConcept, OrderConcept, FlashDealConcept,
  GroupBuyConcept, VybePostConcept, PreferredShopConcept, ConceptName,
} from './concepts'

export { WORKFLOWS, WorkflowSchema, getWorkflowsForRole } from './concepts/workflows'
export type { Workflow } from './concepts/workflows'

// Terminology / language intelligence (deterministic, real logic)
export { parsePriceExpression, formatTZS } from './terminology/price-expressions'
export type { ParsedPriceExpression, PriceComparator } from './terminology/price-expressions'
export {
  CATEGORY_TERMS, MARKET_TERMS, matchCategory, matchMarket, matchRegion, categoriesForMarket,
} from './terminology/categories'
export type { CategoryTerm } from './terminology/categories'

// Intents
export { INTENTS, AssistantRoleSchema, IntentDefinitionSchema, getIntentsForRole, getIntentById } from './intents'
export type { IntentDefinition, AssistantRole } from './intents'

// Entities
export {
  EntityTypeSchema, ENTITY_TYPE_DESCRIPTIONS, extractDeterministicEntities,
} from './entities'
export type { EntityType, ExtractedEntities } from './entities'

// Conversation / context rules
export {
  EntitySlotSchema, ActiveTaskSchema, ConversationTurnSchema, ConversationContextSchema,
  mergeEntitiesIntoActiveTask,
} from './rules/context-rules'
export type { EntitySlot, ActiveTask, ConversationTurn, ConversationContext } from './rules/context-rules'

// Response / fallback rules
export { REFUSAL_MESSAGES, RESPONSE_BEHAVIOR_RULES, STATUS_MESSAGES, CLARIFICATION_QUESTIONS } from './rules/response-rules'

// Memory
export { MemoryScopeSchema, MEMORY_SCOPE_POLICY, UserPreferenceSchema, MEMORY_RULES } from './memory'
export type { MemoryScope, UserPreference } from './memory'

// Tools / actions (contracts only — implementations live in AI Core, Batch 2)
export { ToolPermissionSchema, ToolDefinitionSchema, TOOLS, getToolsForRole, getToolByName } from './tools'
export type { ToolPermission, ToolDefinition } from './tools'

// Safety
export {
  HallucinationClassSchema, HALLUCINATION_CONTROL_RULE, RefusalReasonSchema,
  AUTHORIZATION_BOUNDARIES, PROMPT_INJECTION_RULE, CONSEQUENTIAL_ACTION_POLICY, NEVER_LOG,
} from './safety/rules'
export type { HallucinationClass, RefusalReason } from './safety/rules'

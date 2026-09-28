# ShopNekt AI Core - Architecture Documentation

## Overview

ShopNekt AI Core is the internal AI foundation for the ShopNekt e-commerce platform. It provides language understanding, intent detection, entity extraction, context management, and controlled tool execution—all designed to eventually operate with a locally-hosted model on private infrastructure.

**Important:** The ModelRuntime interface is NOT itself an AI model. It is an abstraction layer that allows the AI Core to communicate with various model backends (local or otherwise) without being tightly coupled to any specific implementation.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SHOPNEKT APPLICATION                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  SHOPNEKT AI ADAPTER                         │
│  • Authenticated user context                                │
│  • Application-specific data access                          │
│  • Authorized ShopNekt tools                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   SHOPNEKT AI CORE                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              LANGUAGE ENGINE                          │   │
│  │  • Language detection (Swahili, English, mixed)       │   │
│  │  • Normalization                                      │   │
│  │  • Tokenization                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              CONTEXT ENGINE                           │   │
│  │  • Conversation state                                 │   │
│  │  • Turn tracking                                      │   │
│  │  • Active entities                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               INTENT ENGINE                           │   │
│  │  • Intent classification                              │   │
│  │  • Confidence scoring                                 │   │
│  │  • Intent registry                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              ENTITY ENGINE                            │   │
│  │  • Entity extraction                                  │   │
│  │  • Pattern matching                                   │   │
│  │  • Entity validation                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            KNOWLEDGE ENGINE                           │   │
│  │  • Static knowledge retrieval                         │   │
│  │  • Domain definitions                                 │   │
│  │  • ShopNekt terminology                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MEMORY ENGINE                            │   │
│  │  • User preferences                                   │   │
│  │  • Session memory                                     │   │
│  │  • Privacy controls                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            REASONING ENGINE                           │   │
│  │  • Safety rules                                       │   │
│  │  • Authorization checks                               │   │
│  │  • Tool validation                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │             RESPONSE ENGINE                           │   │
│  │  • Response generation                                │   │
│  │  • Policy enforcement                                 │   │
│  │  • Language consistency                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               MODEL RUNTIME INTERFACE                        │
│  • generate()                                                │
│  • stream()                                                  │
│  • embed()                                                   │
│  • healthCheck()                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              LOCAL MODEL RUNTIME                             │
│  • llama.cpp / vLLM / Ollama / Custom                        │
│  • Context building                                          │
│  • Structured output validation                              │
│  • Streaming support                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                SELF-HOSTED MODEL                             │
│  • Running on ShopNekt-controlled infrastructure             │
│  • No external API dependencies                              │
│  • Full data privacy                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Module Responsibilities

### Core Engines

| Engine | Responsibility | Input | Output |
|--------|---------------|-------|--------|
| **LanguageEngine** | Detect and normalize user input | Raw text | Normalized text, language code |
| **ContextEngine** | Maintain conversation state | Current context, new message | Updated context |
| **IntentEngine** | Classify user intent | Normalized text, context | Intent ID, confidence |
| **EntityEngine** | Extract structured entities | Text, intent | Entity list |
| **KnowledgeEngine** | Retrieve relevant knowledge | Query, domains | Knowledge entries |
| **MemoryEngine** | Manage user memory | User ID, operation | Memory data |
| **ReasoningEngine** | Apply safety & authorization | Request, context | Validation result |
| **ResponseEngine** | Generate final response | Intent, entities, context | AIResponse |

### Runtime Components

| Component | Responsibility |
|-----------|---------------|
| **ModelRuntime** | Abstract interface for model communication |
| **LocalModelRuntime** | Base class for local inference engines |
| **MockLocalModelRuntime** | Development/testing mock implementation |
| **ContextBuilder** | Assemble optimal context for model input |
| **RuntimeManager** | Manage multiple runtime instances (future) |

---

## Data Flow

### Complete Request Flow

```
1. USER MESSAGE
   ↓
2. LANGUAGE DETECTION (LanguageEngine)
   ↓
3. NORMALIZATION (LanguageEngine)
   ↓
4. CONTEXT RETRIEVAL (ContextEngine)
   ↓
5. INTENT CLASSIFICATION (IntentEngine)
   ↓
6. ENTITY EXTRACTION (EntityEngine)
   ↓
7. KNOWLEDGE RETRIEVAL (KnowledgeEngine)
   ↓
8. MEMORY RETRIEVAL (MemoryEngine)
   ↓
9. CAPABILITY DECISION (ReasoningEngine)
   ↓
10. TOOL SELECTION (if needed)
    ↓
11. CONTEXT BUILDING (ContextBuilder)
    ↓
12. MODEL INFERENCE (LocalModelRuntime)
    ↓
13. STRUCTURED OUTPUT VALIDATION
    ↓
14. TOOL EXECUTION (if required)
    ↓
15. FINAL RESPONSE GENERATION (ResponseEngine)
    ↓
16. MEMORY UPDATE (if appropriate)
    ↓
17. USER
```

---

## Language Architecture

### Supported Languages

- **Swahili (sw)**: Primary market language
- **English (en)**: Secondary language
- **French (fr)**, **German (de)**, **Portuguese (pt)**, **Arabic (ar)**: Future expansion

### Language Features

- **Detection**: Automatic language identification from user input
- **Normalization**: Convert informal text to standard form
- **Mixed Language**: Handle Swahili-English code-switching
- **Abbreviations**: Understand common abbreviations ("k" = 1000, "laki" = 100,000)
- **Spelling Variation**: Tolerate common spelling mistakes

### Example Processing

```
Input: "Natafuta simu ya 500k"
↓
Language: sw (Swahili)
↓
Normalized: "Natafuta simu ya 500000"
↓
Intent: PRODUCT_SEARCH
↓
Entities: { category: "phone", maxPrice: 500000 }
```

---

## Context Architecture

### Context Model

```typescript
interface ConversationContext {
  sessionId: string
  currentIntent: IntentId | null
  previousIntents: IntentId[]
  activeEntities: Record<string, ExtractedEntity>
  unresolvedEntities: string[]
  conversationTopic: string | null
  currentShop: string | null
  currentProduct: string | null
  currentOrder: string | null
  language: SupportedLanguage
  timestamp: number
  turnCount: number
}
```

### Context Updates

Each user message:
1. Retrieves existing context by session ID
2. Processes new intent and entities
3. Updates active entities
4. Increments turn count
5. Stores updated context

### Context Expiration

- Sessions expire after configurable timeout (default: 30 minutes)
- Expired contexts are cleared automatically
- Users can explicitly clear their context

---

## Memory Architecture

### Memory Classifications

| Classification | Purpose | Retention | Example |
|---------------|---------|-----------|---------|
| **TEMPORARY** | Current conversation | Session only | Current search query |
| **SESSION** | Session-specific data | Session duration | Browsing history |
| **PREFERENCE** | User preferences | Long-term | Preferred categories |
| **LONG_TERM** | Persistent patterns | Indefinite | Purchase patterns |

### Privacy Controls

- Memory is scoped to authenticated user ID
- User A cannot access User B's memory
- PII (Personally Identifiable Information) is minimized
- Users can request memory deletion

### Memory Operations

```typescript
// Store preference
memoryEngine.storeMemory({
  userId: 'user_123',
  classification: 'PREFERENCE',
  category: 'preferred_brands',
  data: { brands: ['Nike', 'Adidas'] },
  isPrivate: true
})

// Retrieve preferences
const prefs = await memoryEngine.getMemory('user_123', 'PREFERENCE')
```

---

## Intent System

### Registered Intents

| Intent ID | Description | Requires Auth |
|-----------|-------------|---------------|
| PRODUCT_SEARCH | Search for products | No |
| SHOP_SEARCH | Search for shops | No |
| PRODUCT_DETAILS | Get product details | No |
| SHOP_DETAILS | Get shop details | No |
| PRICE_QUERY | Query product prices | No |
| PRODUCT_COMPARISON | Compare products | No |
| RECOMMENDATION | Get recommendations | No |
| ORDER_STATUS | Check order status | Yes |
| ORDER_HELP | Order assistance | Yes |
| SELLER_HELP | Seller assistance | Yes (seller) |
| FLASH_DEAL_SEARCH | Find flash deals | No |
| GROUP_BUY_SEARCH | Find group buys | No |
| VYBE_DISCOVERY | Discover Vybe content | No |
| PREFERRED_SHOP | Access preferred shops | Yes |
| CART_HELP | Cart assistance | Yes |
| ACCOUNT_HELP | Account assistance | Yes |
| GENERAL_SHOPNEKT_HELP | General platform help | No |

### Intent Detection

- Keyword matching with confidence scoring
- Context-aware disambiguation
- Fallback to UNKNOWN for low confidence
- Clarification requests for ambiguous intents

---

## Tool System

### Tool Definition Structure

```typescript
interface ToolDefinition {
  name: string              // Unique identifier
  description: string       // Human-readable description
  inputSchema: object       // JSON Schema for input
  outputSchema: object      // JSON Schema for output
  requiresAuth: boolean     // Authentication required
  requiresAuthorization: boolean  // Authorization check
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  handler: string           // Handler function reference
}
```

### Available Tools (Planned)

| Tool | Risk Level | Auth Required | Description |
|------|------------|---------------|-------------|
| searchProducts | Low | No | Search product catalog |
| getProduct | Low | No | Get product details |
| searchShops | Low | No | Search shops |
| getShop | Low | No | Get shop details |
| getOrder | Medium | Yes | Get order details |
| getUserPreferences | Medium | Yes | Get user preferences |
| updatePreferences | Medium | Yes | Update preferences |
| createOrder | High | Yes | Create new order |
| manageInventory | High | Yes (seller) | Update inventory |

### Tool Execution Security

```
MODEL REQUEST
    ↓
VALIDATE against schema
    ↓
CHECK authentication
    ↓
CHECK authorization
    ↓
EXECUTE tool
    ↓
VALIDATE output
    ↓
RETURN to model/response engine
```

---

## Model Abstraction

### ModelRuntime Interface

```typescript
interface ModelRuntime {
  generate(request: ModelGenerateRequest): Promise<ModelGenerateResponse>
  stream(request: ModelGenerateRequest): AsyncIterableIterator<string>
  embed(request: ModelEmbedRequest): Promise<ModelEmbedResponse>
  healthCheck(): Promise<ModelHealthStatus>
  getModelId(): string
  supportsStreaming(): boolean
  supportsEmbeddings(): boolean
}
```

### Implementation Options

| Runtime Type | Use Case | Status |
|-------------|----------|--------|
| **MockLocalModelRuntime** | Development/testing | ✅ Implemented |
| **LlamaCppRuntime** | CPU/GPU inference | 📋 Planned |
| **VLLMRuntime** | High-throughput GPU | 📋 Planned |
| **OllamaRuntime** | Simple local deployment | 📋 Planned |
| **CustomRuntime** | Custom HTTP endpoint | 📋 Planned |

### Why This Abstraction Matters

1. **Provider Independence**: AI Core doesn't know which model is running
2. **Future-Proof**: New runtimes can be added without changing Core
3. **Testing**: Mock runtime enables testing without actual model
4. **Migration**: Easy to switch between runtimes

---

## Training Architecture

### Dataset Structure

```typescript
interface TrainingExample {
  id: string
  input: string
  language: SupportedLanguage
  intent: IntentId
  entities: Record<string, string | number | boolean>
  expectedBehavior: string
  context?: Record<string, unknown>
  approved: boolean
  createdAt: number
}
```

### Correction Pipeline

```
USER INTERACTION
    ↓
AI OUTPUT
    ↓
FEEDBACK / CORRECTION
    ↓
REVIEW (human or automated)
    ↓
APPROVED EXAMPLE
    ↓
TRAINING DATASET
    ↓
EVALUATION
    ↓
MODEL IMPROVEMENT
```

### Important Principles

- **No automatic training**: User interactions are NOT automatically used for training
- **Approval required**: Only reviewed/approved examples enter training datasets
- **Privacy-first**: PII is removed before consideration for training
- **Quality over quantity**: Curated high-quality examples preferred

---

## Evaluation Architecture

### Test Categories

| Category | Tests | Purpose |
|----------|-------|---------|
| **Language** | Detection, normalization | Verify language handling |
| **Intent** | Classification accuracy | Measure intent detection |
| **Entity** | Extraction F1 score | Measure entity recognition |
| **Context** | Multi-turn conversations | Verify context retention |
| **Tool** | Tool selection accuracy | Verify tool usage |
| **Response** | Quality, appropriateness | Verify response quality |

### Evaluation Metrics

- **Accuracy**: Percentage of correct predictions
- **Precision**: True positives / (True positives + False positives)
- **Recall**: True positives / (True positives + False negatives)
- **F1 Score**: Harmonic mean of precision and recall
- **Confidence Calibration**: How well confidence scores match accuracy

### Benchmark Suite

Located in `/evaluation/model-benchmarks/`:
- Language understanding tests
- Intent classification tests
- Entity extraction tests
- Context retention tests
- ShopNekt domain tests

---

## Security Model

### Security Principles

1. **Minimum Data Access**: AI receives only necessary data
2. **No Direct Database Access**: All data through authorized tools
3. **User Isolation**: Users cannot access other users' data
4. **No Credential Storage**: Secrets managed externally
5. **Audit Logging**: All operations logged for review

### Safety Rules

| Category | Rule | Action |
|----------|------|--------|
| **Privacy** | Never reveal other users' data | Block |
| **Authorization** | Verify user permissions before tool execution | Block |
| **Hallucination** | Never invent prices, orders, or products | Warn |
| **Financial** | Don't provide financial advice | Redirect |
| **Account** | Require authentication for account operations | Block |
| **Admin** | Never expose admin functionality to regular users | Block |

### Integration Security Contract

```typescript
// Application must provide authenticated context
interface AIAdapterContext {
  // From application auth system - NEVER from browser
  userId: string
  userRole: 'buyer' | 'seller' | 'admin'
  permissions: string[]
  
  // Session information
  sessionId: string
  isAuthenticated: boolean
}

// AI Core validates all operations against this context
```

---

## Integration Architecture

### Adapter Pattern

```
┌─────────────────────────────────────┐
│     ShopNekt Application            │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│     ShopNekt AI Adapter             │
│  • Translate app → AI Core format   │
│  • Inject authenticated context     │
│  • Execute authorized tools         │
│  • Return safe responses            │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│     ShopNekt AI Core                │
│  • Process request                  │
│  • Apply reasoning rules            │
│  • Generate response                │
└─────────────────────────────────────┘
```

### Integration Steps

1. **Create adapter** in ShopNekt application
2. **Configure authentication** flow
3. **Register tools** with handlers
4. **Test with mock runtime** first
5. **Gradual rollout** to production

---

## Future Local Model Architecture

### Deployment Levels

| Level | Hardware | Use Case |
|-------|----------|----------|
| **Level 1** | Standard workstation | Development |
| **Level 2** | GPU workstation | Small-scale testing |
| **Level 3** | Dedicated AI server | Production |
| **Level 4** | Multi-node cluster | High concurrency |

See `/deployment/requirements.md` for detailed specifications.

### Model Selection Criteria

- **Swahili Performance**: Must handle Swahili fluently
- **English Performance**: Strong English capability
- **Mixed Language**: Code-switching support
- **Context Window**: Minimum 8K tokens
- **Licensing**: Commercial-friendly
- **Efficiency**: Reasonable hardware requirements

### Fine-Tuning Strategy (Future)

```
RAW SHOPNEKT DATA
    ↓
CLEANING & ANONYMIZATION
    ↓
QUALITY FILTERING
    ↓
ANNOTATION (intent, entities)
    ↓
SUPERVISED FINETUNING (LoRA/PEFT)
    ↓
EVALUATION
    ↓
SAFETY TESTING
    ↓
DEPLOYMENT
```

---

## Versioning

### Version Scheme

```
AI_CORE_VERSION.MODEL_VERSION.RUNTIME_VERSION
```

Example: `1.0.0.shopnekt-local-0.1.0.1.0`

### Current Versions

- **AI Core**: 1.0.0
- **Model Runtime Interface**: 0.1.0
- **Mock Runtime**: 0.1.0

---

## File Structure

```
shopnekt-ai-core/
├── README.md                 # Project overview
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
│
├── core/                     # Core engines
│   ├── ai-types.ts          # Type definitions
│   ├── engine.ts            # Main orchestrator
│   ├── language-engine.ts   # Language processing
│   ├── context-engine.ts    # Context management
│   ├── intent-engine.ts     # Intent detection
│   ├── entity-engine.ts     # Entity extraction
│   ├── knowledge-engine.ts  # Knowledge retrieval
│   ├── memory-engine.ts     # User memory
│   ├── reasoning-engine.ts  # Safety & rules
│   └── response-engine.ts   # Response generation
│
├── language/                 # Language resources
│   ├── language-registry.json
│   ├── sw/                  # Swahili resources
│   ├── en/                  # English resources
│   ├── shared/              # Shared utilities
│   └── normalization/       # Normalization rules
│
├── knowledge/                # Static knowledge
│   ├── shopnekt.json        # Platform concepts
│   ├── markets.json         # Market definitions
│   ├── shops.json           # Shop concepts
│   ├── products.json        # Product taxonomy
│   ├── orders.json          # Order workflows
│   ├── vybe.json            # Vybe feature
│   ├── flash-deals.json     # Flash Deal rules
│   ├── group-buy.json       # Group Buy rules
│   └── policies.json        # Platform policies
│
├── intent/                   # Intent definitions
│   ├── registry.json        # All intents
│   ├── product-search.json  # Search intent
│   ├── shop-search.json     # Shop intent
│   ├── order-help.json      # Order support
│   └── ...
│
├── entities/                 # Entity definitions
│   ├── product.json         # Product entities
│   ├── shop.json            # Shop entities
│   ├── price.json           # Price entities
│   └── location.json        # Location entities
│
├── capabilities/             # Capability registry
│   ├── registry.json        # All capabilities
│   └── definitions/         # Detailed definitions
│
├── tools/                    # Tool definitions
│   ├── registry.ts          # Tool registry
│   ├── tool-types.ts        # Tool types
│   └── definitions/         # Tool implementations
│
├── memory/                   # Memory system
│   ├── schemas/             # Memory schemas
│   ├── memory-types.ts      # Memory types
│   └── memory-engine.ts     # Memory operations
│
├── training/                 # Training data
│   ├── README.md            # Training guide
│   ├── examples/            # Training examples
│   ├── datasets/            # Compiled datasets
│   ├── corrections/         # Correction records
│   └── approved/            # Approved examples
│
├── evaluation/               # Evaluation system
│   ├── test-cases/          # Test cases
│   ├── language-tests/      # Language tests
│   ├── intent-tests/        # Intent tests
│   ├── entity-tests/        # Entity tests
│   ├── model-benchmarks/    # Model benchmarks
│   └── evaluation-engine.ts # Evaluation runner
│
├── model/                    # Model runtime
│   ├── model-runtime.ts     # Base runtime
│   ├── model-types.ts       # Runtime types
│   ├── model-config.ts      # Configuration
│   ├── local/               # Local runtimes
│   │   └── local-model-runtime.ts
│   └── adapters/            # Runtime adapters
│
├── runtime/                  # Runtime utilities
│   ├── context-builder.ts   # Context assembly
│   └── runtime-types.ts     # Runtime types
│
├── config/                   # Configuration
│   ├── ai-config.json       # AI settings
│   ├── safety-rules.json    # Safety configuration
│   └── response-rules.json  # Response policies
│
├── api/                      # API interfaces
│   ├── ai-request.ts        # Request types
│   └── ai-response.ts       # Response types
│
└── deployment/               # Deployment docs
    ├── architecture.md      # This file
    └── requirements.md      # Hardware requirements
```

---

## Getting Started

### Development Setup

```bash
cd shopnekt-ai-core
npm install
npm run build    # Type check
npm run lint     # Lint check
npm test         # Run tests
```

### Using Mock Runtime

```typescript
import { createLocalModelRuntime } from './model/local/local-model-runtime.js'

const runtime = createLocalModelRuntime({
  runtimeType: 'mock',
  modelId: 'test-model',
})

await runtime.load()
const response = await runtime.generate({
  prompt: 'Hello, how can you help me?',
  options: { maxTokens: 100 },
})
```

### Integration Example

```typescript
import { ShopNektAIEngine } from './core/engine.js'
import { createLocalModelRuntime } from './model/local/local-model-runtime.js'

async function initializeAI() {
  const engine = new ShopNektAIEngine()
  
  // Set up mock runtime for development
  const runtime = createLocalModelRuntime({ runtimeType: 'mock' })
  engine.setModelRuntime(runtime)
  
  await engine.initialize({
    defaultLanguage: 'sw',
    sessionTimeout: 1800000, // 30 minutes
    enableMemory: true,
    enableContext: true,
    logLevel: 'info',
  })
  
  return engine
}
```

---

## Next Steps

1. **Complete runtime implementations** for llama.cpp, vLLM, Ollama
2. **Benchmark candidate models** using ShopNekt dataset
3. **Select production model** based on performance/cost
4. **Deploy pilot** on test infrastructure
5. **Fine-tune model** with ShopNekt-specific data
6. **Production rollout** with monitoring

---

## Support

For questions or issues:
- Review documentation in `/deployment/`
- Check evaluation results in `/evaluation/`
- Examine type definitions in `/core/ai-types.ts`

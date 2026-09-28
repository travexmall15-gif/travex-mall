# ShopNekt AI Core

## Internal AI Foundation for ShopNekt Platform

**Version:** 1.0.0  
**Status:** Foundation Implementation

---

## Overview

ShopNekt AI Core is the foundational AI system for the ShopNekt marketplace platform. It provides:

- **Language Intelligence**: Understanding Swahili, English, and other supported languages
- **Intent Detection**: Identifying what users want to accomplish
- **Entity Extraction**: Pulling structured data from natural language
- **Context Management**: Maintaining conversation state across turns
- **User Memory**: Privacy-conscious preference and behavior storage
- **Knowledge Base**: Static information about ShopNekt platform
- **Safety & Reasoning**: Rules to prevent harmful actions
- **Tool Execution**: Controlled access to platform capabilities
- **Model Abstraction**: Provider-independent model runtime interface

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SHOPNEKT APPLICATION                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI GATEWAY / API                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  SHOPNEKT AI CORE                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Main Engine (orchestrator)               │   │
│  └──────────────────────────────────────────────────────┘   │
│         │         │         │         │         │            │
│         ▼         ▼         ▼         ▼         ▼            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │Language │ │ Intent  │ │ Entity  │ │ Context │ │ Memory │ │
│  │ Engine  │ │ Engine  │ │ Engine  │ │ Engine  │ │ Engine │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └────────┘ │
│         │         │         │         │                      │
│         ▼         ▼         ▼         ▼                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────────────────┐ │
│  │Knowledge│ │Reasoning│ │Response │ │  Tool Registry     │ │
│  │ Engine  │ │ Engine  │ │ Engine  │ │  Capability Reg.   │ │
│  └─────────┘ └─────────┘ └─────────┘ └────────────────────┘ │
│                            │                                 │
│                            ▼                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Model Runtime Interface                    │ │
│  │         (abstract - implementation provided              │ │
│  │          by local/private infrastructure)                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           PRIVATE/LOCAL MODEL INFRASTRUCTURE                 │
│           (to be implemented separately)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
shopnekt-ai-core/
├── core/                    # Core engine implementations
│   ├── ai-types.ts         # Type definitions
│   ├── engine.ts           # Main orchestrator
│   ├── language-engine.ts  # Language detection & normalization
│   ├── context-engine.ts   # Conversation context management
│   ├── intent-engine.ts    # Intent detection
│   ├── entity-engine.ts    # Entity extraction
│   ├── knowledge-engine.ts # Static knowledge base
│   ├── memory-engine.ts    # User memory management
│   ├── reasoning-engine.ts # Safety & reasoning rules
│   └── response-engine.ts  # Response generation
│
├── language/                # Language-specific resources
│   ├── normalization/      # Text normalization rules
│   ├── sw/                 # Swahili language resources
│   ├── en/                 # English language resources
│   └── shared/             # Shared language utilities
│
├── knowledge/               # Static knowledge definitions
│   ├── shopnekt.json       # Platform concepts
│   ├── markets.json        # Market types
│   ├── shops.json          # Shop schemas
│   ├── products.json       # Product schemas
│   ├── orders.json         # Order workflows
│   ├── vybe.json           # Vybe social commerce
│   ├── flash-deals.json    # Flash deal concepts
│   ├── group-buy.json      # Group buy concepts
│   └── policies.json       # Platform policies
│
├── intent/                  # Intent definitions
│   ├── registry.json       # All registered intents
│   ├── product-search.json # Product search intent
│   ├── shop-search.json    # Shop search intent
│   └── ...
│
├── entities/                # Entity type definitions
│   ├── product.json
│   ├── shop.json
│   ├── category.json
│   ├── location.json
│   ├── price.json
│   └── order.json
│
├── capabilities/            # What AI can do
│   ├── registry.json
│   └── definitions/
│
├── tools/                   # Tool definitions
│   ├── registry.ts
│   ├── tool-types.ts
│   └── definitions/
│
├── memory/                  # Memory schemas
│   ├── schemas/
│   └── memory-types.ts
│
├── training/                # Training data architecture
│   ├── README.md
│   ├── examples/
│   ├── datasets/
│   ├── corrections/
│   └── approved/
│
├── evaluation/              # Testing & evaluation
│   ├── test-cases/
│   ├── language-tests/
│   ├── intent-tests/
│   └── evaluation-engine.ts
│
├── model/                   # Model runtime layer
│   ├── model-runtime.ts    # Runtime implementations
│   ├── model-types.ts      # Model-specific types
│   └── adapters/           # Future provider adapters
│
├── config/                  # Configuration files
│   ├── ai-config.json
│   ├── safety-rules.json
│   └── response-rules.json
│
├── api/                     # API interfaces
│   ├── ai-request.ts
│   └── ai-response.ts
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## Key Concepts

### Language Intelligence

The AI Core supports all ShopNekt languages:
- **Swahili (sw)** - Primary language
- **English (en)** - Secondary language
- **French (fr)**, **German (de)**, **Portuguese (pt)**, **Arabic (ar)**

Features:
- Automatic language detection
- Informal language understanding
- Spelling mistake tolerance
- Abbreviation expansion (e.g., "laki tano" → 500000)
- Mixed language handling (Swahili-English code-switching)

Example:
```
Input: "Natafuta simu ya 500k"
→ Language: sw
→ Intent: PRODUCT_SEARCH
→ Entities: { category: 'phone', maxPrice: 500000 }
```

### Intent System

Predefined intents include:
- `PRODUCT_SEARCH` - Find products
- `SHOP_SEARCH` - Find shops
- `ORDER_STATUS` - Check order status
- `SELLER_HELP` - Seller assistance
- `FLASH_DEAL_SEARCH` - Find flash deals
- `GROUP_BUY_SEARCH` - Find group buys
- `VYBE_DISCOVERY` - Explore Vybe content
- And more...

Intents are extensible without modifying core engine code.

### Entity Extraction

Extracts structured data from natural language:
- Products, categories, brands
- Prices (including Swahili expressions like "laki tano")
- Locations (Tanzanian regions)
- Order IDs, quantities, dates

### Context Management

Maintains conversation state:
- Current and previous intents
- Active entities
- Unresolved questions
- Session information
- Turn count

Example:
```
User: "Natafuta iPhone."
AI: "Unataka budget gani?"
User: "Milioni moja."
→ Interpreted as: budget = 1000000 (using context)
```

### User Memory

Privacy-conscious memory with classifications:
- **TEMPORARY** - 5 minutes
- **SESSION** - 30 minutes
- **PREFERENCE** - 90 days
- **LONG_TERM** - 1 year

Memory categories:
- Preferred categories, brands, shops
- Price range preferences
- Location preferences
- Behavioral signals (viewed products)

**Critical**: Users can ONLY access their own memory.

### Knowledge vs Live Data

**Static Knowledge** (in AI Core):
- Platform concepts and schemas
- Workflows and relationships
- Terminology and rules

**Live Data** (via Tools):
- Actual product listings
- Real-time prices
- Current order status
- User-specific information

The AI NEVER hallucinates live data.

### Safety & Security

Built-in safety rules:
- Privacy protection (no cross-user data access)
- Authentication requirements
- No hallucination of prices/products
- Financial data protection
- Account access control
- Admin action restrictions

### Model Runtime Abstraction

The AI Core operates independently of any specific AI model provider. The `ModelRuntime` interface defines:

```typescript
interface ModelRuntime {
  generate(request): Promise<Response>
  stream(request): AsyncIterableIterator<string>
  embed(request): Promise<Embeddings>
  healthCheck(): Promise<HealthStatus>
  getModelId(): string
}
```

Future implementations can provide:
- Local model runtime
- Private infrastructure runtime
- Cloud-based runtime (if needed)

---

## Usage

### Basic Initialization

```typescript
import { getAIEngine } from '@shopnekt/ai-core'

const engine = getAIEngine()

await engine.initialize({
  defaultLanguage: 'sw',
  sessionTimeout: 30 * 60 * 1000,
  enableMemory: true,
  enableContext: true,
  enableEvaluation: false,
  logLevel: 'info',
})

// Set model runtime (when available)
// engine.setModelRuntime(myModelRuntime)
```

### Processing Requests

```typescript
const response = await engine.processRequest({
  message: 'Natafuta simu ya laki tano',
  language: 'sw',
  sessionId: 'session-123',
  userId: 'user-456',
})

console.log(response)
// {
//   message: 'Nimekupata bidhaa several zinazolingana...',
//   intent: 'PRODUCT_SEARCH',
//   entities: { category: {...}, price: {...} },
//   actions: [{ type: 'search_products', tool: 'searchProducts', ... }],
//   confidence: 0.85,
//   requiresToolExecution: true
// }
```

### Running Evaluations

```typescript
const report = await engine.runEvaluation([
  {
    id: 'test-1',
    name: 'Swahili product search',
    category: 'intent',
    input: {
      message: 'Natafuta simu',
      language: 'sw',
      sessionId: 'test-session',
    },
    expectedIntent: 'PRODUCT_SEARCH',
    minConfidence: 0.7,
    tags: ['swahili', 'product-search'],
  },
])

console.log(`${report.passedTests}/${report.totalTests} passed`)
```

---

## Integration with ShopNekt

The AI Core is designed for gradual integration:

1. **Phase 1**: Use engines individually (language detection, intent classification)
2. **Phase 2**: Integrate full request/response pipeline
3. **Phase 3**: Connect to tool execution layer
4. **Phase 4**: Deploy with local/private model

### Adapter Pattern

Create an adapter in the main application:

```typescript
// app/ai/adapter.ts
import { getAIEngine } from '@/shopnekt-ai-core/core/engine'

export async function handleAIMessage(
  message: string,
  sessionId: string,
  userId?: string,
  language?: string
) {
  const engine = getAIEngine()
  
  const response = await engine.processRequest({
    message,
    language: language as SupportedLanguage || 'sw',
    sessionId,
    userId,
  })
  
  // Execute tools if required
  if (response.requiresToolExecution) {
    // Call appropriate ShopNekt APIs
  }
  
  return response
}
```

---

## Training Data Pipeline

```
User Interaction
       ↓
   AI Output
       ↓
  Feedback/Correction
       ↓
      Review
       ↓
  Approved Example
       ↓
  Training Dataset
       ↓
   Evaluation
       ↓
  Model Improvement
```

**Important**: Only APPROVED examples enter training datasets. Not every user interaction is used for training.

---

## Security Principles

1. **No External AI APIs**: The core does not connect to OpenAI, Anthropic, Google, or any external AI service.

2. **No Secrets in Code**: API keys, database credentials, and secrets are stored outside the repository.

3. **User Isolation**: Users cannot access other users' data or memory.

4. **Minimal Data Access**: AI receives only the minimum data required for each task.

5. **Controlled Tool Execution**: Tools have explicit authentication and authorization requirements.

---

## Future Development

### Phase 2 Priorities
1. Complete tool registry with actual ShopNekt API integrations
2. Populate knowledge JSON files with complete platform documentation
3. Expand language support with more Swahili patterns
4. Add evaluation test cases for all intents

### Phase 3 Priorities
1. Implement local model runtime
2. Add embedding support for semantic search
3. Build training dataset collection UI
4. Create evaluation dashboard

### Long-term Goals
1. Full local model deployment
2. Continuous improvement pipeline
3. Multi-modal capabilities
4. Advanced personalization

---

## License

Proprietary - ShopNekt/QNEX360

---

## Contact

ShopNekt Development Team

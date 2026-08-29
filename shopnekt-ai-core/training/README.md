# Training Data Architecture

## Purpose

This directory contains the architecture for training data that will be used to improve the ShopNekt AI model.

## Directory Structure

```
training/
├── README.md           # This file
├── examples/           # Raw training examples
├── datasets/           # Curated training datasets
├── corrections/        # User corrections and feedback
└── approved/           # Approved examples ready for training
```

## Data Flow

1. **examples/** - Raw examples collected from:
   - User interactions (with consent)
   - Manual curation by team
   - Synthetic generation

2. **corrections/** - User feedback and corrections:
   - When AI makes mistakes
   - User-provided better responses
   - Flagged inappropriate outputs

3. **datasets/** - Organized datasets by category:
   - Language understanding
   - Intent detection
   - Entity extraction
   - Contextual conversations
   - ShopNekt terminology

4. **approved/** - Validated examples ready for training:
   - Reviewed by team
   - Quality-checked
   - Formatted for model training

## Example Format

```json
{
  "id": "example-001",
  "input": "Natafuta simu ya laki tano",
  "language": "sw",
  "intent": "PRODUCT_SEARCH",
  "entities": {
    "category": "phone",
    "maxPrice": 500000
  },
  "expectedBehavior": "search_products",
  "approved": true,
  "createdAt": 1704067200000
}
```

## Important Notes

- NOT every user interaction is used for training
- Only APPROVED examples enter training datasets
- PII (Personally Identifiable Information) must be removed
- User consent is required for data usage

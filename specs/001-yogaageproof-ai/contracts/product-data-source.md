# Product Data Source Specification

## Primary Dataset

**Source**: Open Beauty Facts (https://world.openbeautyfacts.org/)
**License**: Open Database License (ODbL) - allows commercial use with attribution
**Format**: CSV/JSON export via API or bulk download

## Data Schema Mapping

| Open Beauty Facts Field | Our Schema Field | Transformation |
|------------------------|------------------|----------------|
| product_name | name | Direct copy |
| brands | brand | Extract first brand if multiple |
| categories_tags | category | Map to our categories (cleanser, serum, etc.) |
| ingredients_text | ingredients | Direct copy, validate non-empty |
| image_url | image_url | Direct copy, validate HTTPS |
| url | external_url | Use as purchase link |
| unique_scans_n | popularity_score | Use for relevance sorting |

## Category Mapping

Map Open Beauty Facts categories to our routine steps:

- `en:face-cleansers` → cleanser
- `en:face-toners` → toner
- `en:face-serums` → serum
- `en:face-moisturizers` → moisturizer
- `en:sun-protection` → sunscreen
- `en:face-masks` → mask
- `en:eye-care` → eye_cream

## Skin Type Tagging

Use ingredient analysis (manual or Claude API) to tag products with suitable skin types:
- Look for keywords: "dry", "oily", "sensitive", "combination", "normal"
- Analyze ingredients: hyaluronic acid (dry), salicylic acid (oily), fragrance-free (sensitive)

## Initial Seed Requirements

- Minimum 50 products per category (7 categories = 350 products)
- Target 100-150 per category for variety (700-1000 total)
- Filter: Only products with ingredients listed and valid image URLs
- Prioritize: Products with >1000 scans (popularity)

## Update Frequency

- **Quarterly** manual imports (January, April, July, October)
- Download fresh export, merge with existing (preserve user selections)
- Flag discontinued products (no longer in export)
- Add new products with high scan counts

## Data Quality Validation

Before import, validate each product:
1. Required fields: name, brand, category, image_url, ingredients
2. Image URL must be accessible (HTTP 200)
3. Ingredients text must be >10 characters
4. Category must map to one of our 7 categories

## Attribution

Display on Product Tool screen footer:
"Product data sourced from Open Beauty Facts, a collaborative database licensed under ODbL."

# Automated Product Labels Module (v2.0) - Technical Research

## Objective
Enable users to generate compliant food product labels (EU Regulation 1169/2011 & UK equivalents) based on the data captured in the HACCP Builder.

## 1. Regulatory Requirements (EU 1169/2011)
To be compliant, a label must typically display:
1.  **Product Name:** Descriptive or legal name.
2.  **Ingredient List:** In descending order of weight.
3.  **Allergens:** Must be emphasized (bold, caps, or different color) in the ingredient list.
4.  **Net Quantity:** Weight/Volume (g, kg, ml, L).
5.  **Shelf Life:** "Use By" (high risk) or "Best Before" (quality).
6.  **Storage/Use Instructions:** e.g., "Keep refrigerated below 5°C".
7.  **Business Name & Address:** Responsible operator.
8.  **Country of Origin:** Mandatory for certain meats, honey, etc.
9.  **Nutrition Declaration:** Per 100g/ml (Energy, Fat, Saturates, Carbs, Sugars, Protein, Salt).
    *   *Note: Certain small businesses are exempt from mandatory nutrition declarations if supplying small quantities directly to consumers.*

## 2. Current Data vs. Required Data
| Field | Status in HACCP Builder | Required for Labels |
| :--- | :--- | :--- |
| Product Name | Partial (`product_name`) | **Essential** |
| Ingredients | Collected (List) | **Essential (Needs ordering/quantities)** |
| Allergens | Collected (Checkboxes) | **Essential (Used for bolding)** |
| Business Name | Collected | **Essential** |
| Business Address | **Missing** | **Essential** |
| Net Quantity | **Missing** | **Essential** |
| Nutrition Data | **Missing** | Optional (for small biz) / **Essential** (for retail) |
| Storage Instructions | Partial (`storage_type`) | **Essential** |
| Shelf Life | Partial (`shelf_life`) | **Essential (needs specific format)** |

## 3. Implementation Strategy
### Phase A: Data Enrichment (Wizard Update)
Add an optional "Labeling Module" step at the end of the HACCP builder for users who want labels.
*   **Step 11 (Label Info):** Ask for Business Address, Net Quantity, and exact Ingredient weights/percentages.
*   **Step 12 (Nutrition - Optional):** Simple table for manual input or AI-estimated values (with disclaimer).

### Phase B: Design & Generation
*   **Engine:** Extend the current PDF generator (`react-pdf`) or use a dedicated SVG/HTML template.
*   **Styles:** Professional layouts (Horizontal, Vertical, Wrap-around).
*   **Allergen Bolding Logic:** A regex helper to find allergens in the ingredient list and wrap them in `<strong>`.

### Phase C: Monetization
*   **Free Tier:** Basic label preview with watermark.
*   **Starter Tier:** Download 1 high-res Label PDF.
*   **Pro Tier:** UNLIMITED labels for all products in the facility.

## 4. Next Steps
1.  [ ] Draft the UI components for the "Labeling Step" in `HACCPBuilder.tsx`.
2.  [ ] Create a `LabelPreview` component.
3.  [ ] Research AI-based nutrition estimation (via Groq/OpenAI) using the ingredient list.

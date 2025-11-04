# Export functionality missing (PDF/CSV)

**Labels:** enhancement, high-priority, feature, print
**Priority:** P1 - High
**Milestone:** Core Features

## Description

Project specifications mention PDF and CSV export for meal plans and shopping lists, but this functionality is not implemented. Users need to export their plans for printing, sharing, and shopping.

## Current Behavior

- No export buttons visible in the UI
- No way to download meal plans
- No way to print meal plans nicely
- No CSV export for shopping lists
- Users must manually copy/paste or screenshot

## Expected Behavior

### PDF Export - Meal Plan
- Button: "Export as PDF" or "Print Meal Plan"
- Formatted document includes:
  - Meal plan title and date range
  - Daily meal breakdown with recipe names
  - Recipe instructions (condensed)
  - Ingredient lists per recipe
  - Cooking times and servings
  - Dietary badges (vegetarian, dairy-free)
  - Optional: Recipe images
- Print-optimized layout
- Downloadable as PDF file

### CSV Export - Shopping List
- Button: "Export Shopping List" or "Download as CSV"
- CSV format with columns:
  - Item name
  - Quantity
  - Unit
  - Category
  - Checked status (optional)
- Compatible with Excel, Google Sheets
- Can import into budgeting apps

### Printable View
- Print-friendly page layout
- Remove navigation and UI chrome
- Optimize for paper (A4/Letter)
- Page breaks between days
- Clear typography for kitchen reading

## Specification Reference

From `specs/002-project-mealmind-ai/spec.md`:

> Export buttons: PDF (plan + recipes condensed) and CSV (shopping list).

## User Stories

**As a** user planning my week
**I want to** print my meal plan
**So that** I can reference it in the kitchen without my phone/laptop

**As a** user grocery shopping
**I want to** export my shopping list as CSV
**So that** I can import it into my budgeting spreadsheet

**As a** user sharing with family
**I want to** email a PDF of the meal plan
**So that** everyone knows what's for dinner this week

**As a** user meal prepping
**I want to** print condensed recipes
**So that** I can follow them hands-free while cooking

## Technical Approach

### PDF Generation
**Option 1: Browser-based with react-pdf**
```typescript
import { Document, Page, Text, View, PDFDownloadLink } from '@react-pdf/renderer';
```
- Pros: No server-side processing, lightweight
- Cons: Limited styling, client-side generation

**Option 2: Server-side with Puppeteer**
- Render page server-side
- Generate PDF with Puppeteer/Playwright
- Pros: Full CSS support, precise control
- Cons: Heavier server load, more complex

**Recommended:** Start with react-pdf, migrate to server-side if needed

### CSV Generation
```typescript
import { stringify } from 'csv-stringify/sync';

function generateShoppingListCSV(items: ShoppingListItem[]) {
  return stringify(items, {
    header: true,
    columns: ['name', 'quantity', 'unit', 'category']
  });
}
```

### Implementation Steps

1. **Add export buttons to UI**
   - Meal plan view: "Export as PDF"
   - Shopping list: "Export as CSV"
   - Both: "Print" option

2. **Create PDF template component**
   - Layout meal plan data
   - Style for print
   - Test with various plan sizes

3. **Implement CSV generation**
   - Format shopping list data
   - Add download trigger
   - Set proper MIME types and filename

4. **Add print-specific CSS**
   - `@media print` styles
   - Hide navigation/buttons
   - Optimize page breaks

5. **Create API endpoints (if server-side)**
   - `POST /api/export/plan-pdf`
   - `GET /api/export/shopping-csv/:planId`

## File Structure

```
apps/web/src/
├── app/_components/
│   ├── ExportButtons.tsx
│   ├── MealPlanPDF.tsx
│   └── PrintView.tsx
├── lib/
│   ├── pdf-generator.ts
│   └── csv-generator.ts
└── server/api/routers/
    └── export.ts
```

## Acceptance Criteria

### PDF Export
- [ ] Export button visible on meal plan page
- [ ] PDF includes all meals and recipes
- [ ] PDF formatted for printing (readable, proper sizing)
- [ ] Recipe instructions included but condensed
- [ ] Ingredient lists included
- [ ] Date range and plan details shown
- [ ] File downloads with meaningful name (e.g., "meal-plan-nov-4-2025.pdf")
- [ ] Works on mobile and desktop
- [ ] Loading state during generation
- [ ] Error handling if generation fails

### CSV Export
- [ ] Export button visible on shopping list
- [ ] CSV includes all unchecked items (or all items with status)
- [ ] Proper CSV format with headers
- [ ] Quantity, unit, and category included
- [ ] File downloads with meaningful name (e.g., "shopping-list-nov-4-2025.csv")
- [ ] Compatible with Excel and Google Sheets
- [ ] Special characters properly escaped

### Print View
- [ ] Print button opens print dialog
- [ ] Page optimized for paper layout
- [ ] No broken elements or overlaps
- [ ] UI chrome hidden in print view
- [ ] Proper page breaks
- [ ] Headers/footers optional

## Testing Requirements

- [ ] Unit tests for CSV generation
- [ ] Unit tests for PDF data formatting
- [ ] Integration tests for export endpoints (if server-side)
- [ ] E2E tests for download flow
- [ ] Visual regression tests for PDF output
- [ ] Test with empty shopping lists
- [ ] Test with large meal plans (7 days × 3 meals)
- [ ] Test CSV with special characters
- [ ] Test print view in multiple browsers

## Dependencies

**NPM Packages:**
- `@react-pdf/renderer` or `puppeteer` (for PDF)
- `csv-stringify` (for CSV)

**Infrastructure:**
- None for client-side generation
- Puppeteer requires Chrome/Chromium in Docker image

## User Impact

⭐ **High User Value**
- Mentioned in specification as core feature
- Common use case for meal planning apps
- Enables offline usage
- Facilitates sharing and collaboration
- Professional appearance

## Design Considerations

### PDF Layout
- Keep recipes condensed (title, time, ingredients, brief steps)
- Use 2-column layout for shopping list
- Include page numbers
- Add app branding (logo, footer)
- Consider color vs black & white printing

### CSV Format
- Standard headers: `Item,Quantity,Unit,Category`
- Optional: `Checked,Aisle,Notes`
- Use UTF-8 encoding for special characters
- Quote fields with commas

## Future Enhancements

- [ ] Export multiple weeks as single PDF
- [ ] Customizable PDF template (choose what to include)
- [ ] Export to other formats (JSON, Markdown)
- [ ] Email PDF directly from app
- [ ] Save export preferences
- [ ] Add recipe photos to PDF (premium feature?)
- [ ] Shopping list with prices (use price baseline data)
- [ ] Integration with note-taking apps (Notion, Evernote)

## Related Issues

- #9 Shopping list cost estimation (could be included in CSV export)
- #10 Nutrition information (could be included in PDF export)

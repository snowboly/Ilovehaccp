# Export Pipeline Architecture

> Last updated: 2026-02-01
> Author: Engineering Team

## Overview

The HACCP export system generates professional documents from plan data. This document explains the architectural decision to make **DOCX the canonical format** with PDF derived from it.

## Pipeline Architecture

```
Plan Data → buildTemplateData() → TemplateData
                                       ↓
                    ┌──────────────────┴──────────────────┐
                    ↓                                      ↓
        generateMinneapolisDocument()            (future templates)
                    ↓
               DOCX Buffer ─────────────────────→ Word Download
                    ↓
        convertDocxToPdf() (LibreOffice)
                    ↓
              Clean PDF
                    ↓
       ┌───────────┴───────────┐
       ↓                       ↓
  (paid users)           applyWatermark()
       ↓                       ↓
   clean.pdf              preview.pdf
```

## Why DOCX is Canonical

### 1. Single Source of Truth

By generating DOCX first and deriving PDF from it, we ensure:
- Identical content in both formats
- No drift between Word and PDF exports
- Easier maintenance (one template engine)

### 2. Superior Table Handling

The `docx` library provides robust table primitives:
- `cantSplit: true` prevents row splitting across pages
- `repeatHeaderRow: true` repeats headers on new pages
- Fixed column widths via percentage allocation
- Native support for zebra striping and borders

React-PDF lacks equivalent table pagination controls.

### 3. Professional Typography

DOCX uses system fonts (Calibri) that:
- Render consistently across platforms
- Support full Unicode character set
- Don't require embedded font files

### 4. Editable by Users

Food safety officers often need to:
- Add handwritten notes
- Update specific sections
- Print and file for audits

DOCX supports this workflow; PDF does not.

## Cache Key Strategy

Cache keys differ by artifact type to prevent serving wrong content:

| Artifact | Hash Components |
|----------|-----------------|
| `plan.docx` | payload + templateVersion |
| `clean.pdf` | payload + templateVersion + `docx-v1` |
| `preview.pdf` | payload + templateVersion + `docx-v1:wm-v1` |

This ensures:
- Paid users never receive watermarked PDFs
- Free users never receive clean PDFs
- Template version changes invalidate cache

## Legacy Pipeline (FROZEN)

The legacy React-PDF pipeline is **frozen** and deprecated:

```typescript
// ❌ DO NOT USE
const LEGACY_FALLBACK_ENABLED = process.env.PDF_USE_LEGACY_EXPORTER === 'true';
const PDF_PIPELINE = process.env.EXPORT_PDF_PIPELINE; // 'legacy'
```

It remains in the codebase for:
- Emergency rollback (if LibreOffice service fails)
- Gradual migration path

**Deprecation notices are logged when legacy pipeline is invoked.**

Scheduled for removal in a future cleanup PR.

## Key Files

| File | Purpose |
|------|---------|
| `lib/export/template/buildTemplateData.ts` | Plan → TemplateData mapper |
| `lib/export/template/generateMinneapolisTemplate.ts` | TemplateData → DOCX |
| `lib/export/docx/generateDocx.ts` | DOCX generation + media validation |
| `lib/export/pdf/convertDocxToPdf/` | LibreOffice conversion |
| `lib/export/pdf/watermark/applyWatermark.ts` | Watermark overlay |
| `lib/export/cache/exportCache.ts` | Cache key computation |
| `app/api/export/pdf/route.ts` | PDF export endpoint |
| `app/api/export/docx/route.ts` | DOCX export endpoint |

## Validation

Run the CI validation script to verify export integrity:

```bash
npm run ci:validate-export
```

This checks:
- Golden plan fixture data integrity
- DOCX structure (required parts, valid media)
- PRP table boolean handling
- Hazard analysis completeness

## Design Decisions Log

### 2026-02-01: Legacy Pipeline Freeze
- Added deprecation logging for any legacy pipeline usage
- Legacy remains as emergency fallback only
- No new features will be added to legacy pipeline

### 2025-XX-XX: Section 6 Split
- Hazard Analysis split into Table 6A (identification) and 6B (risk & controls)
- Improves readability for long hazard lists
- Control measure descriptions conditionally shown (≤2 as notes, >2 as Table 6.1)

### 2025-XX-XX: DOCX-First Architecture
- Migrated from dual-render (React-PDF + docx) to DOCX-first
- PDF derived via LibreOffice conversion
- Eliminated content drift between formats

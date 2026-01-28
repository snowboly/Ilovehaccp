# DOCX export verification

## Paid gating (server + UI)
1. Sign in as an unpaid user and navigate to a plan.
2. Confirm the “Download Word” action is hidden/disabled in the UI.
3. Attempt to access `/api/download-word?planId=<planId>&lang=en` directly with the unpaid user session token.
4. Verify the response is `403 Forbidden` with `Payment required`.

## Paid export quality
1. Sign in as a paid user and download a Word export.
2. Confirm tables use fixed column widths (no AutoFit resizing).
3. Confirm the logo keeps its aspect ratio (no stretching).
4. Confirm header shows the document title (left) and generated date (right).
5. Confirm footer shows “Version: vX” (left) and “Page X of Y” (right).

## PDF regression
1. Download a PDF export for the same plan.
2. Confirm PDF layout matches previous output (no DOCX-specific changes).

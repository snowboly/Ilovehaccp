import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import type { FontSource } from "@react-pdf/font";
import { renderSectionHeader } from "./renderSectionHeader";
import { renderTable } from "./renderTable";
import { PdfHeader } from "../components/PdfHeader";
import { PdfFooter } from "../components/PdfFooter";
import { HACCP_THEME as T } from "../theme";
import { ExportBlock, ExportDoc, ExportDocLabels, resolveExportText } from "../exportDoc";
import fs from "fs";
import path from "path";

// REGISTER LOCAL FONTS
// We use absolute paths for Node.js environment stability (Vercel/Next.js API routes)
const fontsDir = path.join(process.cwd(), "public/fonts");
const robotoFonts: FontSource[] = [
  { src: path.join(fontsDir, "Roboto-Regular.ttf"), fontWeight: "normal", fontStyle: "normal" },
  { src: path.join(fontsDir, "Roboto-Bold.ttf"), fontWeight: "bold", fontStyle: "normal" },
  { src: path.join(fontsDir, "Roboto-Italic.ttf"), fontWeight: "normal", fontStyle: "italic" },
  { src: path.join(fontsDir, "Roboto-BoldItalic.ttf"), fontWeight: "bold", fontStyle: "italic" },
];
const hasAllRobotoFonts = robotoFonts.every((font) => fs.existsSync(font.src));
let baseFontFamily: "Roboto" | "Helvetica" = "Helvetica";

if (hasAllRobotoFonts) {
  try {
    Font.register({
      family: "Roboto",
      fonts: robotoFonts,
    });
    baseFontFamily = "Roboto";
  } catch (error) {
    console.error("[pdf] Font register failed, falling back to Helvetica:", error);
  }
}

/* =========================================================
   PDF TEXT SANITIZATION & CONTENT PARSING UTILITIES
   ========================================================= */

// Zero-width and invisible characters to remove
const INVISIBLE_CHARS_REGEX = /[\u200B\u200C\u200D\u00AD\uFEFF\u2060\u180E]/g;

/**
 * Sanitize text for PDF rendering:
 * - Remove zero-width spaces, soft hyphens, and other invisible chars
 * - Collapse repeated whitespace
 * - Insert normal spaces in very long unbroken tokens (>36 chars) for wrapping
 */
function sanitizePdfText(text: string): string {
  if (!text) return "";

  let result = text;

  // 1. Remove invisible characters
  result = result.replace(INVISIBLE_CHARS_REGEX, "");

  // 2. Collapse repeated whitespace (but preserve single newlines for structure)
  result = result.replace(/[ \t]+/g, " ");
  result = result.replace(/\n{3,}/g, "\n\n");

  // 3. Insert spaces in long unbroken tokens for wrapping
  // Only apply to contiguous non-whitespace runs longer than 36 chars
  result = result.replace(/(\S{36,})/g, (match) => {
    // Insert a space every 24 characters
    const parts: string[] = [];
    for (let i = 0; i < match.length; i += 24) {
      parts.push(match.slice(i, i + 24));
    }
    return parts.join(" ");
  });

  return result.trim();
}

/**
 * Detect if text contains a markdown table (pipes with separator row)
 */
function containsMarkdownTable(text: string): boolean {
  // Look for pattern: line with pipes, followed by separator row (|---|---|)
  return /\|[^|]+\|[^|]*\n\|[-:\s|]+\|/.test(text);
}

/**
 * Parse a markdown table string into headers and rows
 */
function parseMarkdownTable(text: string): { headers: string[]; rows: string[][] } | null {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

  // Find table lines (lines containing pipes)
  const tableLines = lines.filter(line => line.includes("|"));
  if (tableLines.length < 2) return null;

  // Parse a table row (split by pipe, trim cells)
  const parseRow = (line: string): string[] => {
    return line
      .split("|")
      .map(cell => cell.trim())
      .filter((cell, idx, arr) => {
        // Remove empty first/last cells from leading/trailing pipes
        if (idx === 0 && cell === "") return false;
        if (idx === arr.length - 1 && cell === "") return false;
        return true;
      });
  };

  // First row is headers
  const headers = parseRow(tableLines[0]);
  if (headers.length === 0) return null;

  // Skip separator row (contains --- patterns)
  const rows: string[][] = [];
  for (let i = 1; i < tableLines.length; i++) {
    const line = tableLines[i];
    // Skip separator rows
    if (/^[|\s:-]+$/.test(line)) continue;
    const row = parseRow(line);
    if (row.length > 0) {
      rows.push(row);
    }
  }

  return { headers, rows };
}

/**
 * Detect if text looks like JSON or a labeled JSON blob (e.g., "Benchmarking { ... }")
 */
function detectJsonContent(text: string): { label: string | null; json: any } | null {
  if (!text) return null;

  const trimmed = text.trim();

  // Pattern 1: Direct JSON object
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const json = JSON.parse(trimmed);
      return { label: null, json };
    } catch {
      return null;
    }
  }

  // Pattern 2: "Label { ... }" format
  const labeledMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_\s]*?)\s*(\{[\s\S]*\})$/);
  if (labeledMatch) {
    try {
      const json = JSON.parse(labeledMatch[2]);
      return { label: labeledMatch[1].trim(), json };
    } catch {
      return null;
    }
  }

  // Pattern 3: Direct JSON array
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const json = JSON.parse(trimmed);
      return { label: null, json };
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Convert a parsed JSON object into table rows for rendering
 * Returns { headers, rows } suitable for renderTable
 */
function jsonToTableData(json: any, label?: string | null): { headers: string[]; rows: string[][] } {
  const headers = ["Field", "Value"];
  const rows: string[][] = [];

  if (label) {
    rows.push(["Category", label]);
  }

  if (Array.isArray(json)) {
    // For arrays, render each item
    json.forEach((item, idx) => {
      if (typeof item === "object" && item !== null) {
        // If item has title/name/label, use it
        const itemLabel = item.title || item.name || item.label || `Item ${idx + 1}`;
        const itemValue = item.description || item.details || item.impact ||
                          Object.entries(item)
                            .filter(([k]) => !["title", "name", "label"].includes(k))
                            .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
                            .join("; ");
        rows.push([sanitizePdfText(String(itemLabel)), sanitizePdfText(String(itemValue))]);
      } else {
        rows.push([`Item ${idx + 1}`, sanitizePdfText(String(item))]);
      }
    });
  } else if (typeof json === "object" && json !== null) {
    // For objects, render key-value pairs
    for (const [key, value] of Object.entries(json)) {
      const displayKey = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      let displayValue: string;

      if (Array.isArray(value)) {
        // For nested arrays (like recommendations), format as list
        displayValue = value.map((item, idx) => {
          if (typeof item === "object" && item !== null) {
            const parts = Object.entries(item)
              .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
              .join(", ");
            return `${idx + 1}. ${parts}`;
          }
          return `${idx + 1}. ${item}`;
        }).join("\n");
      } else if (typeof value === "object" && value !== null) {
        displayValue = JSON.stringify(value, null, 2);
      } else {
        displayValue = String(value ?? "-");
      }

      rows.push([sanitizePdfText(displayKey), sanitizePdfText(displayValue)]);
    }
  } else {
    rows.push(["Value", sanitizePdfText(String(json))]);
  }

  return { headers, rows };
}

const Watermark = ({ isPaid }: { isPaid: boolean }) => {
  if (isPaid) return null;

  const styles = StyleSheet.create({
    watermark: {
      position: 'absolute',
      top: 300,
      left: 100,
      width: 400,
      height: 400,
      transform: 'rotate(-45deg)',
      opacity: 0.1,
      zIndex: -1
    },
    text: {
      fontSize: 60,
      color: '#000000',
      fontWeight: 'bold',
      textAlign: 'center'
    }
  });

  return (
    <View style={styles.watermark} fixed>
      <Text style={styles.text}>iLoveHACCP</Text>
      <Text style={styles.text}>Free Edition</Text>
    </View>
  );
};

const renderBlock = (block: ExportBlock) => {
  switch (block.type) {
    case "section":
      return renderSectionHeader(sanitizePdfText(resolveExportText(block.title, "pdf")));
    case "paragraph": {
      const rawText = resolveExportText(block.text, "pdf");

      // Check for markdown table content
      if (containsMarkdownTable(rawText)) {
        const parsed = parseMarkdownTable(rawText);
        if (parsed && parsed.headers.length > 0 && parsed.rows.length > 0) {
          const colWidths = parsed.headers.map(() => `${Math.floor(100 / parsed.headers.length)}%`);
          return renderTable(
            parsed.headers.map(h => sanitizePdfText(h)),
            parsed.rows.map(row => row.map(cell => sanitizePdfText(cell))),
            colWidths,
            { spacing: { sectionBottom: T.spacing.gapMd } }
          );
        }
      }

      // Check for JSON content
      const jsonContent = detectJsonContent(rawText);
      if (jsonContent) {
        const { headers, rows } = jsonToTableData(jsonContent.json, jsonContent.label);
        return renderTable(
          headers,
          rows,
          ["30%", "70%"],
          { spacing: { sectionBottom: T.spacing.gapMd } }
        );
      }

      // Default: render as sanitized text
      return (
        <Text
          style={{
            marginBottom: T.spacing.gapMd,
            fontSize: T.font.body,
            color: block.muted ? T.colors.muted : T.colors.text,
            fontStyle: block.italic ? "italic" : "normal",
          }}
        >
          {sanitizePdfText(rawText)}
        </Text>
      );
    }
    case "table":
      return renderTable(
        block.headers.map((header) => sanitizePdfText(resolveExportText(header, "pdf"))),
        block.rows.map((row) => row.map((cell) => sanitizePdfText(resolveExportText(cell, "pdf")))),
        block.colWidths.map((width) => `${width}%`),
        { spacing: { sectionBottom: T.spacing.gapMd } }
      );
    case "subheading":
      return (
        <Text style={{ fontWeight: "bold", marginBottom: 5, color: T.colors.primary }}>
          {sanitizePdfText(resolveExportText(block.text, "pdf"))}
        </Text>
      );
    case "signature":
      return (
        <View style={styles.signatureRow}>
          <View style={styles.signatureLine}>
            <Text>{sanitizePdfText(resolveExportText(block.left, "pdf"))}: ________________</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text>{sanitizePdfText(resolveExportText(block.right, "pdf"))}: ________________</Text>
          </View>
        </View>
      );
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 80, // Header space
    paddingBottom: 60, // Footer space
    paddingHorizontal: T.spacing.pagePadding,
    fontFamily: baseFontFamily,
    fontSize: T.font.body,
    color: T.colors.text,
  },
  coverPage: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: T.spacing.pagePadding,
    fontFamily: baseFontFamily,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: T.colors.primary,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    color: T.colors.text,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
    borderBottomWidth: T.borders.width,
    borderBottomColor: T.colors.border,
    paddingBottom: 2,
  },
  label: { fontWeight: "bold" },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    objectFit: "contain",
  },
  body: {
    marginTop: 40,
    paddingBottom: 40,
  },
  signatureRow: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureLine: {
    width: "45%",
    borderTopWidth: 1,
    borderTopColor: T.colors.text,
    paddingTop: 5,
  },
});

/* =========================================================
   DOCAPESCA-CLASSIC TEMPLATE COMPONENTS
   ========================================================= */

const DC = T.docapesca;
const DC_HEADER_HEIGHT = 36;
const DC_FOOTER_HEIGHT = 24;

const dcStyles = StyleSheet.create({
  /* Cover page */
  coverPage: {
    fontFamily: baseFontFamily,
    position: "relative",
  },
  ribbonDark: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DC.ribbonWidth,
    backgroundColor: DC.navyDark,
  },
  ribbonAccent: {
    position: "absolute",
    left: DC.ribbonWidth,
    top: 0,
    bottom: 0,
    width: DC.accentLineWidth,
    backgroundColor: DC.accentBlue,
  },
  coverLogo: {
    position: "absolute",
    top: 40,
    right: 40,
    width: 120,
    height: 60,
    objectFit: "contain" as any,
  },
  coverCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: DC.ribbonWidth + DC.accentLineWidth + 30,
    paddingRight: 40,
  },
  coverTitle: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: DC.navyDark,
    letterSpacing: 1.5,
  },
  coverSubtitle: {
    fontSize: 14,
    textAlign: "center",
    color: T.colors.text,
    marginTop: 10,
  },
  coverMeta: {
    position: "absolute",
    bottom: 80,
    left: DC.ribbonWidth + DC.accentLineWidth + 30,
    right: 40,
  },
  coverMetaRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  coverMetaLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: DC.navyDark,
    width: 120,
  },
  coverMetaValue: {
    fontSize: 10,
    color: T.colors.text,
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: T.colors.border,
    paddingBottom: 2,
  },
  /* Content pages */
  contentPage: {
    paddingTop: 20 + DC_HEADER_HEIGHT + 14,
    paddingBottom: 20 + DC_FOOTER_HEIGHT + 10,
    paddingHorizontal: T.spacing.pagePadding,
    fontFamily: baseFontFamily,
    fontSize: T.font.body,
    color: T.colors.text,
  },
  /* Header */
  headerWrap: {
    position: "absolute",
    top: 16,
    left: T.spacing.pagePadding,
    right: T.spacing.pagePadding,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: DC.navyDark,
  },
  headerDate: {
    fontSize: 8,
    color: T.colors.muted,
  },
  headerRule: {
    height: 1.5,
    backgroundColor: DC.accentBlue,
  },
  /* Footer */
  footerWrap: {
    position: "absolute",
    bottom: 16,
    left: T.spacing.pagePadding,
    right: T.spacing.pagePadding,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: T.colors.muted,
  },
});

const DocapescaCoverPage = ({ doc }: { doc: ExportDoc }) => {
  const { labels } = doc.meta;
  return (
    <Page size="A4" style={dcStyles.coverPage}>
      <Watermark isPaid={doc.meta.isPaid} />
      {/* Left ribbon */}
      <View style={dcStyles.ribbonDark} />
      <View style={dcStyles.ribbonAccent} />

      {/* Top-right logo */}
      {doc.meta.logoDataUri && (
        <Image src={doc.meta.logoDataUri} style={dcStyles.coverLogo} />
      )}

      {/* Centered title */}
      <View style={dcStyles.coverCenter}>
        <Text style={dcStyles.coverTitle}>
          {labels.documentTitle.toUpperCase()}
        </Text>
        <Text style={dcStyles.coverSubtitle}>
          {doc.cover.pdf.subtitle || labels.subtitle}
        </Text>
      </View>

      {/* Bottom metadata */}
      <View style={dcStyles.coverMeta}>
        <View style={dcStyles.coverMetaRow}>
          <Text style={dcStyles.coverMetaLabel}>{labels.createdBy}:</Text>
          <Text style={dcStyles.coverMetaValue}>{"________________________________________"}</Text>
        </View>
        <View style={dcStyles.coverMetaRow}>
          <Text style={dcStyles.coverMetaLabel}>{labels.approvedBy}:</Text>
          <Text style={dcStyles.coverMetaValue}>{"________________________________________"}</Text>
        </View>
        <View style={dcStyles.coverMetaRow}>
          <Text style={dcStyles.coverMetaLabel}>{labels.date}:</Text>
          <Text style={dcStyles.coverMetaValue}>{doc.meta.generatedDate}</Text>
        </View>
        <View style={dcStyles.coverMetaRow}>
          <Text style={dcStyles.coverMetaLabel}>{labels.version}:</Text>
          <Text style={dcStyles.coverMetaValue}>{doc.meta.versionId}</Text>
        </View>
      </View>
    </Page>
  );
};

const DocapescaHeader = ({ doc }: { doc: ExportDoc }) => {
  const { labels } = doc.meta;
  return (
    <View fixed style={dcStyles.headerWrap}>
      <View style={dcStyles.headerRow}>
        <Text style={dcStyles.headerTitle}>{labels.documentTitle}</Text>
        <Text style={dcStyles.headerDate}>{doc.meta.generatedDate}</Text>
      </View>
      <View style={dcStyles.headerRule} />
    </View>
  );
};

const DocapescaFooter = ({ doc }: { doc: ExportDoc }) => {
  const { labels } = doc.meta;
  return (
    <View fixed style={dcStyles.footerWrap}>
      <Text style={dcStyles.footerText}>
        {labels.version}: {doc.meta.versionId}
      </Text>
      <Text
        style={dcStyles.footerText}
        render={({ pageNumber, totalPages }) =>
          `${labels.page} ${pageNumber} ${labels.of} ${totalPages}`
        }
      />
    </View>
  );
};

/* =========================================================
   MAIN EXPORT COMPONENT
   ========================================================= */

export const HACCPDocumentModular = ({ doc }: { doc: ExportDoc }) => {
  const isDocapesca = doc.meta.template === "docapesca-classic";

  if (isDocapesca) {
    return (
      <Document>
        {/* DOCAPESCA COVER PAGE */}
        <DocapescaCoverPage doc={doc} />

        {/* DOCAPESCA CONTENT PAGES */}
        <Page size="A4" style={dcStyles.contentPage}>
          <Watermark isPaid={doc.meta.isPaid} />
          <DocapescaHeader doc={doc} />

          <View>
            {doc.content.map((block, index) => (
              <View key={index}>{renderBlock(block)}</View>
            ))}
          </View>

          <DocapescaFooter doc={doc} />
        </Page>
      </Document>
    );
  }

  /* DEFAULT template (unchanged) */
  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="A4" style={styles.coverPage}>
        <Watermark isPaid={doc.meta.isPaid} />
        {doc.meta.logoDataUri && <Image src={doc.meta.logoDataUri} style={styles.logo} />}
        <Text style={styles.title}>{doc.cover.pdf.title}</Text>
        <Text style={styles.subtitle}>{doc.cover.pdf.subtitle}</Text>

        <View style={{ width: "100%", marginTop: 20 }}>
            {doc.cover.pdf.metaRows.map((m, i) => (
                <View key={i} style={styles.metaRow}>
                    <Text style={styles.label}>{m.label}:</Text>
                    <Text>{m.value}</Text>
                </View>
            ))}
        </View>
      </Page>

      {/* CONTENT PAGES */}
      <Page size="A4" style={styles.page}>
        <Watermark isPaid={doc.meta.isPaid} />

        {/* HEADER: Fixed & Absolute to ensure repetition */}
        <View fixed style={{ position: 'absolute', top: 20, left: 0, right: 0, paddingHorizontal: T.spacing.pagePadding }}>
            <PdfHeader
              logoDataUri={doc.meta.logoDataUri ?? undefined}
              versionId={doc.meta.versionId}
              generatedDate={doc.meta.generatedDate}
            />
        </View>

        <View style={styles.body}>
          {doc.content.map((block, index) => (
            <View key={index}>{renderBlock(block)}</View>
          ))}
        </View>

        {/* FOOTER: Fixed & Absolute */}
        <View fixed style={{ position: 'absolute', bottom: 20, left: 0, right: 0, paddingHorizontal: T.spacing.pagePadding }}>
            <PdfFooter />
        </View>
      </Page>
    </Document>
  );
};

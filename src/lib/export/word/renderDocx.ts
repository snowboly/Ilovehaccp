import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  ImageRun,
  ShadingType,
  TableLayoutType,
  VerticalAlign,
} from "docx";
import { HACCP_THEME as T } from "../theme";
import { ExportBlock, ExportDoc, ExportDocLabels, resolveExportText } from "../exportDoc";
import { makeFixedTable, renderWordTable } from "./renderTable";
import { getImageDimensions, scaleToFit, resolveDocxImageType } from "./image";
import { sanitizeDocxText } from "./text";

const toTwips = (points: number) => Math.round(points * 20);
const DOCX_FONT = "Calibri";

type StructuredContent =
  | { type: "table"; headers: string[]; rows: string[][]; columnWidths: number[] }
  | { type: "list"; items: string[] };

const splitMarkdownRow = (line: string) => {
  const cells = line.split("|").map((cell) => cell.trim());
  if (cells[0] === "") cells.shift();
  if (cells[cells.length - 1] === "") cells.pop();
  return cells;
};

const isMarkdownSeparator = (line: string) => {
  const trimmed = line.trim();
  return trimmed.includes("-") && /^[|:\-\s]+$/.test(trimmed);
};

const parseMarkdownTable = (text: string) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;
  if (!lines[0].includes("|") || !isMarkdownSeparator(lines[1])) return null;
  const headers = splitMarkdownRow(lines[0]);
  if (headers.length < 2) return null;
  const bodyRows: string[] = [];
  let remainderStart = lines.length;
  for (let i = 2; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.includes("|")) {
      remainderStart = i;
      break;
    }
    bodyRows.push(line);
  }
  if (bodyRows.length === 0) return null;
  const rows = bodyRows.map((line) => {
    const cells = splitMarkdownRow(line);
    const padded = [...cells];
    while (padded.length < headers.length) padded.push("-");
    return padded.slice(0, headers.length);
  });
  const remainder = lines.slice(remainderStart).filter(Boolean);
  return { headers, rows, remainder: remainder.length ? remainder : null };
};

const stringifyDocxValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value.map((item) => stringifyDocxValue(item)).filter(Boolean).join("; ");
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => `${key}: ${stringifyDocxValue(val)}`)
      .filter((entry) => entry.trim() !== ":")
      .join("; ");
  }
  return String(value);
};

const parseDelimitedKeyValue = (text: string) => {
  const hasDelimiter = /[;\n]/.test(text);
  const segments = text
    .split(/[;\n]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  const pairs = segments
    .map((segment) => {
      const divider = segment.indexOf(":");
      if (divider === -1) return null;
      const key = segment.slice(0, divider).trim();
      const value = segment.slice(divider + 1).trim();
      if (!key || !value) return null;
      return { key, value };
    })
    .filter((pair): pair is { key: string; value: string } => Boolean(pair));
  if (pairs.length === 0) return null;
  if (pairs.length > 1 || hasDelimiter) return pairs;
  return null;
};

const extractTitleImpact = (entry: Record<string, unknown>) => {
  const title = entry.title ?? entry.name ?? entry.step ?? entry.hazard ?? entry.control;
  const impact = entry.impact ?? entry.details ?? entry.description ?? entry.control_measure;
  if (!title || !impact) return null;
  return `${title}: ${impact}`;
};

const parseStructuredContent = (text: string): StructuredContent | null => {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const bulletItems = parsed
          .map((item) => {
            if (item && typeof item === "object") {
              const titleImpact = extractTitleImpact(item as Record<string, unknown>);
              if (titleImpact) return titleImpact;
            }
            return stringifyDocxValue(item);
          })
          .filter((item) => item.trim().length > 0);
        return bulletItems.length ? { type: "list", items: bulletItems } : null;
      }
      if (parsed && typeof parsed === "object") {
        const rows = Object.entries(parsed as Record<string, unknown>).map(([key, value]) => [
          key,
          stringifyDocxValue(value),
        ]);
        return { type: "table", headers: ["Field", "Value"], rows, columnWidths: [30, 70] };
      }
    } catch {
      const stripped = trimmed.replace(/^[{[]|[}\]]$/g, "").replace(/,/g, ";");
      const fallbackPairs = parseDelimitedKeyValue(stripped);
      if (fallbackPairs) {
        const rows = fallbackPairs.map((pair) => [pair.key, pair.value]);
        return { type: "table", headers: ["Field", "Value"], rows, columnWidths: [30, 70] };
      }
      const fallbackItems = stripped
        .split(/[;\n]+/)
        .map((item) => item.replace(/^\"|\"$/g, "").trim())
        .filter((item) => item.length > 0);
      if (fallbackItems.length) {
        return { type: "list", items: fallbackItems };
      }
      const fallbackContent = stripped.trim();
      return { type: "list", items: [fallbackContent || "-"] };
    }
  }

  const kvPairs = parseDelimitedKeyValue(trimmed);
  if (kvPairs) {
    const rows = kvPairs.map((pair) => [pair.key, pair.value]);
    return { type: "table", headers: ["Field", "Value"], rows, columnWidths: [30, 70] };
  }

  return null;
};

const renderBulletList = (items: string[]) =>
  items.map(
    (item) =>
      new Paragraph({
        bullet: { level: 0 },
        children: [
          new TextRun({
            text: sanitizeDocxText(item),
            font: DOCX_FONT,
            size: T.font.body * 2,
          }),
        ],
        spacing: { after: toTwips(4) },
      })
  );

const renderSectionBand = (title: string) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: T.colors.lightBg.replace("#", "") },
            borders: {
              top: { color: T.colors.border.replace("#", ""), style: BorderStyle.SINGLE, size: 6 },
              bottom: { color: T.colors.border.replace("#", ""), style: BorderStyle.SINGLE, size: 6 },
              left: { color: T.colors.border.replace("#", ""), style: BorderStyle.SINGLE, size: 6 },
              right: { color: T.colors.border.replace("#", ""), style: BorderStyle.SINGLE, size: 6 },
            },
            margins: {
              top: toTwips(6),
              bottom: toTwips(6),
              left: toTwips(8),
              right: toTwips(8),
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: sanitizeDocxText(title),
                    font: DOCX_FONT,
                    size: T.font.h2 * 2,
                    bold: true,
                    color: T.colors.primary.replace("#", ""),
                  }),
                ],
                spacing: { before: 0, after: 0 },
              }),
            ],
            verticalAlign: VerticalAlign.TOP,
          }),
        ],
      }),
    ],
  });

const createHeaderTable = (labels: ExportDocLabels, generatedDate: string) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, color: "FFFFFF" }, left: { style: BorderStyle.NONE, color: "FFFFFF" }, right: { style: BorderStyle.NONE, color: "FFFFFF" } },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: sanitizeDocxText(labels.documentTitle),
                    font: "Calibri",
                    size: T.font.body * 2,
                    bold: true,
                    color: T.colors.text.replace("#", ""),
                  }),
                ],
                spacing: { before: 0, after: 0 },
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, color: "FFFFFF" }, left: { style: BorderStyle.NONE, color: "FFFFFF" }, right: { style: BorderStyle.NONE, color: "FFFFFF" } },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: sanitizeDocxText(generatedDate),
                    font: "Calibri",
                    size: T.font.small * 2,
                    color: T.colors.muted.replace("#", ""),
                  }),
                ],
                spacing: { before: 0, after: 0 },
              }),
            ],
          }),
        ],
      }),
    ],
  });

const buildPageFooterTable = (labels: ExportDocLabels, versionId: string) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { color: T.colors.border.replace("#", ""), style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.NONE, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, color: "FFFFFF" },
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${sanitizeDocxText(labels.version)}: ${sanitizeDocxText(versionId)}`,
                    font: "Calibri",
                    size: T.font.small * 2,
                    color: T.colors.muted.replace("#", ""),
                  }),
                ],
                spacing: { before: 0, after: 0 },
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { color: T.colors.border.replace("#", ""), style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.NONE, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, color: "FFFFFF" },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${sanitizeDocxText(labels.page)} `,
                    font: DOCX_FONT,
                    size: T.font.small * 2,
                    color: T.colors.muted.replace("#", ""),
                  }),
                  new TextRun({ children: [PageNumber.CURRENT], font: DOCX_FONT, size: T.font.small * 2 }),
                  new TextRun({
                    text: ` ${sanitizeDocxText(labels.of)} `,
                    font: DOCX_FONT,
                    size: T.font.small * 2,
                    color: T.colors.muted.replace("#", ""),
                  }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: DOCX_FONT, size: T.font.small * 2 }),
                ],
                spacing: { before: 0, after: 0 },
              }),
            ],
          }),
        ],
      }),
    ],
  });

const getLogoTransformation = (logoBuffer: ArrayBuffer | Buffer, maxWidth: number, maxHeight: number) => {
  const dimensions = getImageDimensions(logoBuffer);
  if (!dimensions) {
    return { width: maxWidth, height: maxHeight };
  }
  return scaleToFit(dimensions, maxWidth, maxHeight);
};

const resolveDocxColumnWidths = (columnCount: number, colWidths: number[] = []) => {
  if (columnCount === 2) return [30, 70];
  if (columnCount === 3) return [10, 30, 60];
  if (columnCount === 6) return [18, 28, 10, 10, 10, 24];
  if (colWidths.length === columnCount) return colWidths;
  return Array.from({ length: columnCount }, () => Math.floor(100 / columnCount));
};

const renderDocxBlock = (block: ExportBlock): (Paragraph | Table)[] => {
  switch (block.type) {
    case "section":
      return [renderSectionBand(resolveExportText(block.title, "docx"))];
    case "paragraph":
      const paragraphText = resolveExportText(block.text, "docx");
      const markdownTable = parseMarkdownTable(paragraphText);
      if (markdownTable) {
        const table = makeFixedTable({
          columnWidths: resolveDocxColumnWidths(markdownTable.headers.length),
          headerRow: markdownTable.headers,
          rows: markdownTable.rows,
        });
        if (markdownTable.remainder?.length) {
          const trailingParagraphs = markdownTable.remainder.map(
            (line) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: sanitizeDocxText(line),
                    font: DOCX_FONT,
                    size: T.font.body * 2,
                    italics: block.italic,
                    color: (block.muted ? T.colors.muted : T.colors.text).replace("#", ""),
                  }),
                ],
                spacing: { after: toTwips(T.spacing.gapMd) },
              })
          );
          return [table, ...trailingParagraphs];
        }
        return [table];
      }
      const structuredContent = parseStructuredContent(paragraphText);
      if (structuredContent?.type === "table") {
        return [
          makeFixedTable({
            columnWidths: structuredContent.columnWidths,
            headerRow: structuredContent.headers,
            rows: structuredContent.rows,
          }),
        ];
      }
      if (structuredContent?.type === "list") {
        return renderBulletList(structuredContent.items);
      }
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: sanitizeDocxText(paragraphText),
              font: DOCX_FONT,
              size: T.font.body * 2,
              italics: block.italic,
              color: (block.muted ? T.colors.muted : T.colors.text).replace("#", ""),
            }),
          ],
          spacing: { after: toTwips(T.spacing.gapMd) },
        }),
      ];
    case "table":
      const headers = block.headers.map((header) => resolveExportText(header, "docx"));
      const rows = block.rows.map((row) => row.map((cell) => resolveExportText(cell, "docx")));
      return [
        renderWordTable(headers, rows, resolveDocxColumnWidths(headers.length, block.colWidths)),
      ];
    case "subheading":
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: sanitizeDocxText(resolveExportText(block.text, "docx")),
              font: DOCX_FONT,
              size: T.font.body * 2,
              bold: true,
              color: T.colors.primary.replace("#", ""),
            }),
          ],
          spacing: { before: toTwips(4), after: toTwips(4) },
        }),
      ];
    case "signature":
      return [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { color: T.colors.text.replace("#", ""), style: BorderStyle.SINGLE, size: 2 },
                    bottom: { style: BorderStyle.NONE, color: "FFFFFF" },
                    left: { style: BorderStyle.NONE, color: "FFFFFF" },
                    right: { style: BorderStyle.NONE, color: "FFFFFF" },
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${sanitizeDocxText(resolveExportText(block.left, "docx"))}: ________________`,
                          font: "Calibri",
                          size: T.font.body * 2,
                        }),
                      ],
                      spacing: { before: 0, after: 0 },
                    }),
                  ],
                  verticalAlign: VerticalAlign.TOP,
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { color: T.colors.text.replace("#", ""), style: BorderStyle.SINGLE, size: 2 },
                    bottom: { style: BorderStyle.NONE, color: "FFFFFF" },
                    left: { style: BorderStyle.NONE, color: "FFFFFF" },
                    right: { style: BorderStyle.NONE, color: "FFFFFF" },
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${sanitizeDocxText(resolveExportText(block.right, "docx"))}: ________________`,
                          font: "Calibri",
                          size: T.font.body * 2,
                        }),
                      ],
                      spacing: { before: 0, after: 0 },
                    }),
                  ],
                  verticalAlign: VerticalAlign.TOP,
                }),
              ],
            }),
          ],
        }),
      ];
    default:
      return [];
  }
};

/* =========================================================
   DOCAPESCA-CLASSIC WORD HELPERS
   ========================================================= */

const DC = T.docapesca;
const noBorder = { style: BorderStyle.NONE, color: "FFFFFF", size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function buildDocapescaHeader(labels: ExportDocLabels, generatedDate: string): Header {
  return new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                borders: {
                  ...noBorders,
                  bottom: { color: DC.accentBlue.replace("#", ""), style: BorderStyle.SINGLE, size: 6 },
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: sanitizeDocxText(labels.documentTitle),
                        font: "Calibri",
                        size: T.font.body * 2,
                        bold: true,
                        color: DC.navyDark.replace("#", ""),
                      }),
                    ],
                    spacing: { before: 0, after: 0 },
                  }),
                ],
              }),
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                borders: {
                  ...noBorders,
                  bottom: { color: DC.accentBlue.replace("#", ""), style: BorderStyle.SINGLE, size: 6 },
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: sanitizeDocxText(generatedDate),
                        font: "Calibri",
                        size: T.font.small * 2,
                        color: T.colors.muted.replace("#", ""),
                      }),
                    ],
                    spacing: { before: 0, after: 0 },
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function buildDocapescaFooter(labels: ExportDocLabels, versionId: string): Footer {
  return new Footer({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: noBorders,
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${sanitizeDocxText(labels.version)}: ${sanitizeDocxText(versionId)}`,
                        font: "Calibri",
                        size: T.font.small * 2,
                        color: T.colors.muted.replace("#", ""),
                      }),
                    ],
                    spacing: { before: 0, after: 0 },
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: noBorders,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: `${sanitizeDocxText(labels.page)} `,
                        font: DOCX_FONT,
                        size: T.font.small * 2,
                        color: T.colors.muted.replace("#", ""),
                      }),
                      new TextRun({ children: [PageNumber.CURRENT], font: DOCX_FONT, size: T.font.small * 2 }),
                      new TextRun({
                        text: ` ${sanitizeDocxText(labels.of)} `,
                        font: DOCX_FONT,
                        size: T.font.small * 2,
                        color: T.colors.muted.replace("#", ""),
                      }),
                      new TextRun({ children: [PageNumber.TOTAL_PAGES], font: DOCX_FONT, size: T.font.small * 2 }),
                    ],
                    spacing: { before: 0, after: 0 },
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function buildDocapescaCoverBlocks(doc: ExportDoc): (Paragraph | Table)[] {
  const { labels } = doc.meta;
  const blocks: (Paragraph | Table)[] = [];

  // Logo top-right (rendered as right-aligned paragraph)
  if (doc.meta.logoBuffer) {
    const logoType = resolveDocxImageType(doc.meta.logoBuffer);
    if (!logoType) {
      throw new Error("Unsupported logo format for DOCX export. Use PNG or JPEG.");
    }
    const logoTransform = getLogoTransformation(doc.meta.logoBuffer, 140, 140);
    blocks.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: doc.meta.logoBuffer,
            transformation: logoTransform,
            type: logoType,
          } as any),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 400, after: 200 },
      })
    );
  }

  // Left border band via a single-cell table with thick left border
  blocks.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                left: { color: DC.navyDark.replace("#", ""), style: BorderStyle.SINGLE, size: 48 },
                top: noBorder,
                bottom: noBorder,
                right: noBorder,
              },
              margins: {
                top: toTwips(80),
                bottom: toTwips(80),
                left: toTwips(24),
                right: toTwips(24),
              },
              children: [
                // Title
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 300 },
                  children: [
                    new TextRun({
                      text: sanitizeDocxText(labels.documentTitle).toUpperCase(),
                      font: "Calibri",
                      size: 52,
                      bold: true,
                      color: DC.navyDark.replace("#", ""),
                    }),
                  ],
                }),
                // Subtitle (business name or system subtitle)
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 200 },
                  children: [
                    new TextRun({
                      text: sanitizeDocxText(doc.cover.docx.subtitle || labels.subtitle),
                      font: "Calibri",
                      size: 28,
                      color: T.colors.text.replace("#", ""),
                    }),
                  ],
                }),
                // Business name
                ...(doc.cover.docx.businessName
                  ? [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                        children: [
                          new TextRun({
                            text: sanitizeDocxText(doc.cover.docx.businessName),
                            font: "Calibri",
                            size: 24,
                            bold: true,
                            color: T.colors.text.replace("#", ""),
                          }),
                        ],
                      }),
                    ]
                  : []),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // Metadata lines
  const metaLines: { label: string; value: string }[] = [
    { label: labels.createdBy, value: "________________________________________" },
    { label: labels.approvedBy, value: "________________________________________" },
    { label: labels.date, value: doc.meta.generatedDate },
    { label: labels.version, value: doc.meta.versionId },
  ];

  blocks.push(
    new Paragraph({ text: "", spacing: { before: 600 } }),
    ...metaLines.map(
      (m) =>
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `${sanitizeDocxText(m.label)}: `,
              font: "Calibri",
              size: T.font.body * 2,
              bold: true,
              color: DC.navyDark.replace("#", ""),
            }),
            new TextRun({
              text: sanitizeDocxText(m.value),
              font: "Calibri",
              size: T.font.body * 2,
              color: T.colors.text.replace("#", ""),
            }),
          ],
        })
    ),
    new Paragraph({ text: "", pageBreakBefore: true })
  );

  return blocks;
}

/* =========================================================
   MAIN EXPORT FUNCTION
   ========================================================= */

export async function generateModularWordDocument(doc: ExportDoc): Promise<Document> {
  const isDocapesca = doc.meta.template === "docapesca-classic";

  if (isDocapesca) {
    const dcHeader = buildDocapescaHeader(doc.meta.labels, doc.meta.generatedDate);
    const dcFooter = buildDocapescaFooter(doc.meta.labels, doc.meta.versionId);
    const dcCover = buildDocapescaCoverBlocks(doc);
    const contentBlocks = doc.content.flatMap((block) => renderDocxBlock(block));

    return new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: toTwips(T.spacing.pagePadding),
                right: toTwips(T.spacing.pagePadding),
                bottom: toTwips(T.spacing.pagePadding),
                left: toTwips(T.spacing.pagePadding),
              },
            },
          },
          headers: { default: dcHeader },
          footers: { default: dcFooter },
          children: [...dcCover, ...contentBlocks],
        },
      ],
    });
  }

  /* DEFAULT template (unchanged) */
  const header = new Header({
    children: [
      createHeaderTable(doc.meta.labels, doc.meta.generatedDate),
    ],
  });

  const footer = new Footer({
    children: [
      buildPageFooterTable(doc.meta.labels, doc.meta.versionId),
    ],
  });

  const coverBlocks: (Paragraph | Table)[] = [];

  if (doc.meta.logoBuffer) {
    const logoType = resolveDocxImageType(doc.meta.logoBuffer);
    if (!logoType) {
      throw new Error("Unsupported logo format for DOCX export. Use PNG or JPEG.");
    }
    const logoTransform = getLogoTransformation(doc.meta.logoBuffer, 140, 140);
    coverBlocks.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: doc.meta.logoBuffer,
            transformation: logoTransform,
            type: logoType,
          } as any),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 1000, after: 600 },
      })
    );
  }

  coverBlocks.push(
    new Paragraph({
      children: [
        new TextRun({
          text: sanitizeDocxText(doc.cover.docx.title),
          font: "Calibri",
          size: 32,
          bold: true,
          color: T.colors.primary.replace("#", ""),
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: doc.meta.logoBuffer ? 0 : 2000, after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: sanitizeDocxText(doc.cover.docx.subtitle),
          font: "Calibri",
          size: 24,
          color: T.colors.text.replace("#", ""),
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: sanitizeDocxText(doc.cover.docx.businessName),
          font: "Calibri",
          size: 28,
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    }),
    ...doc.cover.docx.metaRows.map(
      (m) =>
        new Paragraph({
          children: [
            new TextRun({
              text: `${sanitizeDocxText(m.label)}: ${sanitizeDocxText(m.value)}`,
              font: "Calibri",
              size: T.font.body * 2,
            }),
          ],
          alignment: AlignmentType.CENTER,
        })
    ),
    new Paragraph({ text: "", pageBreakBefore: true })
  );

  const contentBlocks = doc.content.flatMap((block) => renderDocxBlock(block));

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: toTwips(T.spacing.pagePadding),
              right: toTwips(T.spacing.pagePadding),
              bottom: toTwips(T.spacing.pagePadding),
              left: toTwips(T.spacing.pagePadding),
            },
          },
        },
        headers: { default: header },
        footers: { default: footer },
        children: [...coverBlocks, ...contentBlocks],
      },
    ],
  });
}

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
import { renderWordTable } from "./renderTable";
import { getImageDimensions, scaleToFit } from "./image";
import { sanitizeDocxText } from "./text";

const toTwips = (points: number) => Math.round(points * 20);

const renderSectionBand = (title: string) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
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
                    font: T.font.wordFont,
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
                    font: T.font.wordFont,
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
                    font: T.font.wordFont,
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
                    font: T.font.wordFont,
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
                    font: T.font.wordFont,
                    size: T.font.small * 2,
                    color: T.colors.muted.replace("#", ""),
                  }),
                  new TextRun({ children: [PageNumber.CURRENT], size: T.font.small * 2 }),
                  new TextRun({
                    text: ` ${sanitizeDocxText(labels.of)} `,
                    font: T.font.wordFont,
                    size: T.font.small * 2,
                    color: T.colors.muted.replace("#", ""),
                  }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: T.font.small * 2 }),
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

const resolveDocxColumnWidths = (headers: string[], colWidths: number[]) => {
  if (headers.length === 2) return [30, 70];
  if (headers.length === 3) return [10, 30, 60];
  if (headers.length === 6) return [18, 28, 10, 10, 10, 24];
  if (colWidths.length === headers.length) return colWidths;
  return headers.map(() => Math.floor(100 / headers.length));
};

const renderDocxBlock = (block: ExportBlock): (Paragraph | Table)[] => {
  switch (block.type) {
    case "section":
      return [renderSectionBand(resolveExportText(block.title, "docx"))];
    case "paragraph":
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: sanitizeDocxText(resolveExportText(block.text, "docx")),
              font: T.font.wordFont,
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
        renderWordTable(headers, rows, resolveDocxColumnWidths(headers, block.colWidths)),
      ];
    case "subheading":
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: sanitizeDocxText(resolveExportText(block.text, "docx")),
              font: T.font.wordFont,
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
                          font: T.font.wordFont,
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
                          font: T.font.wordFont,
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
                        font: T.font.wordFont,
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
                        font: T.font.wordFont,
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
                        font: T.font.wordFont,
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
                        font: T.font.wordFont,
                        size: T.font.small * 2,
                        color: T.colors.muted.replace("#", ""),
                      }),
                      new TextRun({ children: [PageNumber.CURRENT], size: T.font.small * 2 }),
                      new TextRun({
                        text: ` ${sanitizeDocxText(labels.of)} `,
                        font: T.font.wordFont,
                        size: T.font.small * 2,
                        color: T.colors.muted.replace("#", ""),
                      }),
                      new TextRun({ children: [PageNumber.TOTAL_PAGES], size: T.font.small * 2 }),
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
    const logoTransform = getLogoTransformation(doc.meta.logoBuffer, 140, 70);
    blocks.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: doc.meta.logoBuffer,
            transformation: logoTransform,
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
      rows: [
        new TableRow({
          children: [
            new TableCell({
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
                      font: T.font.wordFont,
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
                      font: T.font.wordFont,
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
                            font: T.font.wordFont,
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
              font: T.font.wordFont,
              size: T.font.body * 2,
              bold: true,
              color: DC.navyDark.replace("#", ""),
            }),
            new TextRun({
              text: sanitizeDocxText(m.value),
              font: T.font.wordFont,
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
    const logoTransform = getLogoTransformation(doc.meta.logoBuffer, 140, 140);
    coverBlocks.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: doc.meta.logoBuffer,
            transformation: logoTransform,
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
          font: T.font.wordFont,
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
          font: T.font.wordFont,
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
          font: T.font.wordFont,
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
              font: T.font.wordFont,
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

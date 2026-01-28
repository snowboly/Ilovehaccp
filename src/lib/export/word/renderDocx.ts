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
} from "docx";
import { HACCP_THEME as T } from "../theme";
import { ExportBlock, ExportDoc, ExportDocLabels, resolveExportText } from "../exportDoc";
import { renderWordTable } from "./renderTable";
import { wrapIdForPdf } from "../wrap";

const toTwips = (points: number) => Math.round(points * 20);

const renderSectionBand = (title: string) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
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
                    text: title,
                    font: "Calibri",
                    size: T.font.h2 * 2,
                    bold: true,
                    color: T.colors.primary.replace("#", ""),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

const createHeaderTable = (logoBuffer: ArrayBuffer | Buffer | null | undefined, versionId: string, generatedDate: string) => {
  const versionTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Version",
                    font: "Calibri",
                    size: T.font.small * 2,
                    color: T.colors.muted.replace("#", ""),
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: wrapIdForPdf(versionId),
                    font: "Calibri",
                    size: T.font.small * 2,
                    color: T.colors.text.replace("#", ""),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Generated",
                    font: "Calibri",
                    size: T.font.small * 2,
                    color: T.colors.muted.replace("#", ""),
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: generatedDate,
                    font: "Calibri",
                    size: T.font.small * 2,
                    color: T.colors.text.replace("#", ""),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "HACCP PLAN – DRAFT",
                    font: "Calibri",
                    size: T.font.h1 * 2,
                    bold: true,
                    color: T.colors.text.replace("#", ""),
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Generated HACCP Documentation",
                    font: "Calibri",
                    size: T.font.small * 2,
                    color: T.colors.muted.replace("#", ""),
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: logoBuffer
                  ? [
                      new ImageRun({
                        data: logoBuffer,
                        transformation: { width: 80, height: 28 },
                      } as any),
                    ]
                  : [],
              }),
            ],
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [versionTable],
          }),
        ],
      }),
    ],
  });
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
              text: resolveExportText(block.text, "docx"),
              font: "Calibri",
              size: T.font.body * 2,
              italics: block.italic,
              color: (block.muted ? T.colors.muted : T.colors.text).replace("#", ""),
            }),
          ],
          spacing: { after: toTwips(T.spacing.gapMd) },
        }),
      ];
    case "table":
      return [
        renderWordTable(
          block.headers.map((header) => resolveExportText(header, "docx")),
          block.rows.map((row) => row.map((cell) => resolveExportText(cell, "docx"))),
          block.colWidths
        ),
      ];
    case "subheading":
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: resolveExportText(block.text, "docx"),
              font: "Calibri",
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
                          text: `${resolveExportText(block.left, "docx")}: ________________`,
                          font: "Calibri",
                          size: T.font.body * 2,
                        }),
                      ],
                    }),
                  ],
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
                          text: `${resolveExportText(block.right, "docx")}: ________________`,
                          font: "Calibri",
                          size: T.font.body * 2,
                        }),
                      ],
                    }),
                  ],
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
                        text: labels.documentTitle,
                        font: "Calibri",
                        size: T.font.body * 2,
                        bold: true,
                        color: DC.navyDark.replace("#", ""),
                      }),
                    ],
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
                        text: generatedDate,
                        font: "Calibri",
                        size: T.font.small * 2,
                        color: T.colors.muted.replace("#", ""),
                      }),
                    ],
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
                        text: `${labels.version}: ${versionId}`,
                        font: "Calibri",
                        size: T.font.small * 2,
                        color: T.colors.muted.replace("#", ""),
                      }),
                    ],
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
                        text: `${labels.page} `,
                        font: "Calibri",
                        size: T.font.small * 2,
                        color: T.colors.muted.replace("#", ""),
                      }),
                      new TextRun({ children: [PageNumber.CURRENT], size: T.font.small * 2 }),
                      new TextRun({
                        text: ` ${labels.of} `,
                        font: "Calibri",
                        size: T.font.small * 2,
                        color: T.colors.muted.replace("#", ""),
                      }),
                      new TextRun({ children: [PageNumber.TOTAL_PAGES], size: T.font.small * 2 }),
                    ],
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
    blocks.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: doc.meta.logoBuffer,
            transformation: { width: 120, height: 60 },
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
                      text: labels.documentTitle.toUpperCase(),
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
                      text: doc.cover.docx.subtitle || labels.subtitle,
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
                            text: doc.cover.docx.businessName,
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
              text: `${m.label}: `,
              font: "Calibri",
              size: T.font.body * 2,
              bold: true,
              color: DC.navyDark.replace("#", ""),
            }),
            new TextRun({
              text: m.value,
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
      createHeaderTable(doc.meta.logoBuffer ?? null, doc.meta.versionId, doc.meta.generatedDate),
    ],
  });

  const footer = new Footer({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Generated by iLoveHACCP — Draft document for review purposes only",
                        font: "Calibri",
                        size: T.font.small * 2,
                        color: T.colors.muted.replace("#", ""),
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { color: T.colors.border.replace("#", ""), style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.NONE, color: "FFFFFF" },
                  left: { style: BorderStyle.NONE, color: "FFFFFF" },
                  right: { style: BorderStyle.NONE, color: "FFFFFF" },
                },
              }),
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: "Page ",
                        font: "Calibri",
                        size: T.font.small * 2,
                        color: T.colors.muted.replace("#", ""),
                      }),
                      new TextRun({ children: [PageNumber.CURRENT], size: T.font.small * 2 }),
                      new TextRun({ text: " of ", size: T.font.small * 2 }),
                      new TextRun({ children: [PageNumber.TOTAL_PAGES], size: T.font.small * 2 }),
                    ],
                  }),
                ],
                borders: {
                  top: { color: T.colors.border.replace("#", ""), style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.NONE, color: "FFFFFF" },
                  left: { style: BorderStyle.NONE, color: "FFFFFF" },
                  right: { style: BorderStyle.NONE, color: "FFFFFF" },
                },
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const coverBlocks: (Paragraph | Table)[] = [];

  if (doc.meta.logoBuffer) {
    coverBlocks.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: doc.meta.logoBuffer,
            transformation: { width: 100, height: 100 },
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
          text: doc.cover.docx.title,
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
          text: doc.cover.docx.subtitle,
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
          text: doc.cover.docx.businessName,
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
              text: `${m.label}: ${m.value}`,
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

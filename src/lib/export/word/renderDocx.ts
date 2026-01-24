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
import { ExportBlock, ExportDoc, resolveExportText } from "../exportDoc";
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
  const border = { color: T.colors.border.replace("#", ""), style: BorderStyle.SINGLE, size: 1 };
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

export async function generateModularWordDocument(doc: ExportDoc): Promise<Document> {
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

import {
  Table,
  TableRow,
  TableCell,
  Paragraph,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from "docx";
import { HACCP_THEME as T } from "../theme";
import { wrapIdForPdf } from "../wrap";

const toTwips = (points: number) => Math.round(points * 20);

export const renderWordTable = (headers: string[], rows: string[][], colWidths: number[]) => {
  const padding = toTwips(6);
  const border = { color: T.colors.border.replace("#", ""), style: BorderStyle.SINGLE, size: 1 };
  const headerFill = T.colors.tableHeaderBg.replace("#", "");
  const zebraFill = "FAFBFD";

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) =>
          new TableCell({
            width: { size: colWidths[i], type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: headerFill },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: h,
                    font: "Calibri",
                    size: T.font.h2 * 2,
                    bold: true,
                    color: T.colors.text.replace("#", ""),
                  }),
                ],
              }),
            ],
            verticalAlign: AlignmentType.CENTER,
            margins: { top: padding, bottom: padding, left: padding, right: padding },
            borders: { top: border, bottom: border, left: border, right: border },
          })
        ),
      }),
      ...rows.map((row, rowIndex) => {
        const fill = rowIndex % 2 === 1 ? zebraFill : T.colors.white.replace("#", "");
        return new TableRow({
          children: row.map((cell, j) =>
            new TableCell({
              width: { size: colWidths[j], type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: wrapIdForPdf(String(cell || "-")),
                      font: "Calibri",
                      size: T.font.body * 2,
                    }),
                  ],
                }),
              ],
              verticalAlign: AlignmentType.CENTER,
              margins: { top: padding, bottom: padding, left: padding, right: padding },
              borders: { top: border, bottom: border, left: border, right: border },
            })
          ),
        });
      }),
    ],
  });
};

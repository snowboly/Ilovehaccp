import {
  Table,
  TableRow,
  TableCell,
  Paragraph,
  TextRun,
  WidthType,
  BorderStyle,
  ShadingType,
  TableLayoutType,
  VerticalAlign,
} from "docx";
import { HACCP_THEME as T } from "../theme";
import { sanitizeDocxText } from "./text";

const toTwips = (points: number) => Math.round(points * 20);

type FixedTableOptions = {
  columnWidths: number[];
  headerShading?: string;
  cellPadding?: number;
};

export const makeFixedTable = (
  headers: string[],
  rows: string[][],
  { columnWidths, headerShading, cellPadding }: FixedTableOptions
) => {
  const padding = toTwips(6);
  const border = { color: T.colors.border.replace("#", ""), style: BorderStyle.SINGLE, size: 1 };
  const headerFill = headerShading ?? T.colors.tableHeaderBg.replace("#", "");
  const zebraFill = "FAFBFD";
  const resolvedPadding = cellPadding ?? padding;

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) =>
          new TableCell({
            width: { size: columnWidths[i], type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: headerFill },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: sanitizeDocxText(h),
                    font: T.font.wordFont,
                    size: T.font.h2 * 2,
                    bold: true,
                    color: T.colors.text.replace("#", ""),
                  }),
                ],
                spacing: { before: 0, after: 0 },
              }),
            ],
            verticalAlign: VerticalAlign.TOP,
            margins: { top: resolvedPadding, bottom: resolvedPadding, left: resolvedPadding, right: resolvedPadding },
            borders: { top: border, bottom: border, left: border, right: border },
          })
        ),
      }),
      ...rows.map((row, rowIndex) => {
        const fill = rowIndex % 2 === 1 ? zebraFill : T.colors.white.replace("#", "");
        return new TableRow({
          children: row.map((cell, j) =>
            new TableCell({
              width: { size: columnWidths[j], type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: sanitizeDocxText(String(cell || "-")),
                      font: T.font.wordFont,
                      size: T.font.body * 2,
                    }),
                  ],
                  spacing: { before: 0, after: 0 },
                }),
              ],
              verticalAlign: VerticalAlign.TOP,
              margins: { top: resolvedPadding, bottom: resolvedPadding, left: resolvedPadding, right: resolvedPadding },
              borders: { top: border, bottom: border, left: border, right: border },
            })
          ),
        });
      }),
    ],
  });
};

export const renderWordTable = (headers: string[], rows: string[][], columnWidths: number[]) =>
  makeFixedTable(headers, rows, { columnWidths });

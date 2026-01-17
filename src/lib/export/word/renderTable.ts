import { Table, TableRow, TableCell, Paragraph, TextRun, WidthType, AlignmentType, BorderStyle } from "docx";

export const renderWordTable = (headers: string[], rows: any[][], colWidths: number[], theme: any) => {
  const padding = (theme.spacing.tablePadding || 6) * 20;
  const isModern = theme.id === 'professional-modern';
  
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => new TableCell({
          width: { size: colWidths[i], type: WidthType.PERCENTAGE },
          shading: { fill: theme.colors.tableHeaderBg.replace('#', '') },
          children: [new Paragraph({ children: [new TextRun({ text: h, font: theme.fonts.wordFont, size: theme.fonts.tableHeader * 2, bold: true, color: isModern ? theme.colors.primary.replace('#', '') : undefined })] })],
          verticalAlign: AlignmentType.CENTER,
          margins: { top: padding, bottom: padding, left: padding, right: padding },
          borders: {
              top: { color: theme.colors.border.replace('#', ''), style: BorderStyle.SINGLE, size: 1 },
              bottom: { color: theme.colors.border.replace('#', ''), style: BorderStyle.SINGLE, size: 1 },
              left: { color: theme.colors.border.replace('#', ''), style: BorderStyle.SINGLE, size: 1 },
              right: { color: theme.colors.border.replace('#', ''), style: BorderStyle.SINGLE, size: 1 },
          }
        }))
      }),
      // Rows
      ...rows.map(row => new TableRow({
        children: row.map((cell, j) => new TableCell({
          width: { size: colWidths[j], type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: String(cell || "-"), font: theme.fonts.wordFont, size: theme.fonts.tableBody * 2 })] })],
          verticalAlign: AlignmentType.CENTER,
          margins: { top: padding, bottom: padding, left: padding, right: padding },
          borders: {
            top: { color: theme.colors.border.replace('#', ''), style: BorderStyle.SINGLE, size: 1 },
            bottom: { color: theme.colors.border.replace('#', ''), style: BorderStyle.SINGLE, size: 1 },
            left: { color: theme.colors.border.replace('#', ''), style: BorderStyle.SINGLE, size: 1 },
            right: { color: theme.colors.border.replace('#', ''), style: BorderStyle.SINGLE, size: 1 },
          }
        }))
      }))
    ]
  });
};

import { BorderStyle, ShadingType, AlignmentType } from "docx";

export const getWordStyles = (theme: any) => ({
  paragraph: {
    spacing: { line: Math.round(theme.spacing.lineHeight * 240), before: 0, after: 0 },
    run: { font: theme.fonts.wordFont, size: theme.fonts.body * 2 },
  },
  heading1: {
    run: { 
        font: theme.fonts.wordFont, 
        size: theme.fonts.section * 2, 
        bold: true, 
        allCaps: true,
        color: theme.id === 'professional-modern' ? theme.colors.primary.replace('#', '') : undefined 
    },
    spacing: { before: theme.spacing.sectionTop * 20, after: theme.spacing.sectionBottom * 20 },
    shading: { 
        type: ShadingType.CLEAR, 
        fill: theme.colors.sectionBg.replace('#', '') 
    }
  },
  heading2: {
    run: { font: theme.fonts.wordFont, size: theme.fonts.subsection * 2, bold: true },
    spacing: { before: 240, after: 120 },
  },
  tableHeader: {
    run: { font: theme.fonts.wordFont, size: theme.fonts.tableHeader * 2, bold: true },
    shading: { fill: theme.colors.tableHeaderBg.replace('#', '') }
  },
  tableBody: {
    run: { font: theme.fonts.wordFont, size: theme.fonts.tableBody * 2 },
  }
});

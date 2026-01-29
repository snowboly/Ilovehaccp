/**
 * Minneapolis-style HACCP Template Generator
 * Creates a professional DOCX document matching the Minneapolis Health Department format
 * using the docx library, then uses docxtemplater patterns for dynamic content
 */

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
  HeadingLevel,
  PageBreak,
  Packer,
} from 'docx';
import type { TemplateData, ProcessStep, HazardAnalysisRow, CCPRow, PRPProgram } from './buildTemplateData';

// Theme colors matching Minneapolis style
const THEME = {
  navy: '1F3864',
  blue: '2F5496',
  lightBlue: 'D9E2F3',
  gray: '808080',
  lightGray: 'F2F2F2',
  black: '000000',
  white: 'FFFFFF',
};

const toTwips = (points: number) => Math.round(points * 20);

const sanitizeText = (text: string | undefined | null): string => {
  if (!text) return '-';
  return String(text)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim() || '-';
};

// Border styles
const standardBorder = { style: BorderStyle.SINGLE, size: 4, color: THEME.gray };
const noBorder = { style: BorderStyle.NONE, size: 0, color: THEME.white };

function createCoverPage(data: TemplateData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // Logo if present
  if (data.logo && data.has_logo) {
    try {
      elements.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: data.logo,
              transformation: { width: 150, height: 75 },
            } as any),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 400 },
        })
      );
    } catch {
      // Skip logo if it fails
    }
  }

  // Business name - large centered title
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: sanitizeText(data.business_name),
          font: 'Calibri',
          size: 48,
          bold: true,
          color: THEME.navy,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: data.has_logo ? 200 : 1200, after: 200 },
    })
  );

  // HACCP Plan title
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'HACCP Plan',
          font: 'Calibri',
          size: 36,
          bold: true,
          color: THEME.blue,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  // Subtitle - Food Safety Management System
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Food Safety Management System',
          font: 'Calibri',
          size: 24,
          color: THEME.gray,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    })
  );

  // Date
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: sanitizeText(data.date),
          font: 'Calibri',
          size: 24,
          color: THEME.black,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    })
  );

  // Signature lines
  const signatureTable = new Table({
    width: { size: 80, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            margins: { top: toTwips(20), bottom: toTwips(10) },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Created by: ', font: 'Calibri', size: 22, bold: true }),
                  new TextRun({ text: '____________________', font: 'Calibri', size: 22 }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            margins: { top: toTwips(20), bottom: toTwips(10) },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Date: ', font: 'Calibri', size: 22, bold: true }),
                  new TextRun({ text: '____________________', font: 'Calibri', size: 22 }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            margins: { top: toTwips(20), bottom: toTwips(10) },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Approved by: ', font: 'Calibri', size: 22, bold: true }),
                  new TextRun({ text: '____________________', font: 'Calibri', size: 22 }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            margins: { top: toTwips(20), bottom: toTwips(10) },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Date: ', font: 'Calibri', size: 22, bold: true }),
                  new TextRun({ text: '____________________', font: 'Calibri', size: 22 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  elements.push(signatureTable);

  // Version info
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Version: ${sanitizeText(data.version)}`,
          font: 'Calibri',
          size: 20,
          color: THEME.gray,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
    })
  );

  // Page break after cover
  elements.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  return elements;
}

function createSectionHeader(title: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: sanitizeText(title),
        font: 'Calibri',
        size: 28,
        bold: true,
        color: THEME.navy,
      }),
    ],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: toTwips(16), after: toTwips(8) },
    shading: { type: ShadingType.CLEAR, fill: THEME.lightBlue },
    border: {
      bottom: { color: THEME.blue, style: BorderStyle.SINGLE, size: 6 },
    },
  });
}

function createSubsectionHeader(title: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: sanitizeText(title),
        font: 'Calibri',
        size: 24,
        bold: true,
        color: THEME.blue,
      }),
    ],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: toTwips(12), after: toTwips(6) },
  });
}

function createParagraph(text: string, italic: boolean = false): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: sanitizeText(text),
        font: 'Calibri',
        size: 22,
        italics: italic,
        color: italic ? THEME.gray : THEME.black,
      }),
    ],
    spacing: { after: toTwips(8) },
  });
}

function createDataTable(headers: string[], rows: string[][], colWidths: number[]): Table {
  const headerCells = headers.map((header, i) =>
    new TableCell({
      width: { size: colWidths[i], type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.CLEAR, fill: THEME.navy },
      borders: {
        top: standardBorder,
        bottom: standardBorder,
        left: standardBorder,
        right: standardBorder,
      },
      margins: { top: toTwips(4), bottom: toTwips(4), left: toTwips(4), right: toTwips(4) },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: sanitizeText(header),
              font: 'Calibri',
              size: 20,
              bold: true,
              color: THEME.white,
            }),
          ],
        }),
      ],
    })
  );

  const dataRows = rows.map((row) =>
    new TableRow({
      children: row.map((cell, i) =>
        new TableCell({
          width: { size: colWidths[i], type: WidthType.PERCENTAGE },
          borders: {
            top: standardBorder,
            bottom: standardBorder,
            left: standardBorder,
            right: standardBorder,
          },
          margins: { top: toTwips(3), bottom: toTwips(3), left: toTwips(4), right: toTwips(4) },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: sanitizeText(cell),
                  font: 'Calibri',
                  size: 20,
                }),
              ],
            }),
          ],
        })
      ),
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: headerCells }), ...dataRows],
  });
}

function createProductSection(data: TemplateData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(createSectionHeader('SECTION 2 - PRODUCT DESCRIPTION'));

  const productTable = createDataTable(
    ['Field', 'Description'],
    [
      ['Product Name', data.product_name],
      ['Product Category', data.product_category],
      ['Key Ingredients', data.ingredients],
      ['Allergens', data.allergens],
      ['Packaging', data.packaging],
      ['Shelf Life', data.shelf_life],
      ['Storage Conditions', data.storage_conditions],
      ['Intended Use', data.intended_use],
      ['Intended Consumer', data.intended_consumer],
    ],
    [35, 65]
  );

  elements.push(productTable);

  return elements;
}

function createProcessSection(data: TemplateData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(createSectionHeader('SECTION 4 - PROCESS FLOW'));

  if (data.has_process_steps && data.process_steps.length > 0) {
    const processTable = createDataTable(
      ['Step No.', 'Step Name', 'Description'],
      data.process_steps.map((step) => [
        String(step.step_number),
        step.step_name,
        step.step_description,
      ]),
      [12, 28, 60]
    );
    elements.push(processTable);
  } else {
    elements.push(createParagraph('Process flow to be documented.', true));
  }

  if (data.process_description && data.process_description !== '-') {
    elements.push(createSubsectionHeader('Process Description'));
    elements.push(createParagraph(data.process_description));
  }

  elements.push(
    createParagraph(
      'Note: A visual process flow diagram should be maintained on-site and used by the HACCP team.',
      true
    )
  );

  return elements;
}

function createPRPSection(data: TemplateData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(createSectionHeader('SECTION 5 - PREREQUISITE PROGRAMS (PRPs)'));

  if (data.has_prp_programs && data.prp_programs.length > 0) {
    const prpTable = createDataTable(
      ['Program', 'In Place', 'Documented', 'Reference'],
      data.prp_programs.map((prp) => [prp.program, prp.exists, prp.documented, prp.reference]),
      [30, 15, 15, 40]
    );
    elements.push(prpTable);
  } else {
    elements.push(createParagraph('Prerequisite programs to be documented.', true));
  }

  return elements;
}

function createHazardAnalysisSection(data: TemplateData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(createSectionHeader('SECTION 6 - HAZARD ANALYSIS'));

  if (data.has_hazard_analysis && data.hazard_analysis.length > 0) {
    const hazardTable = createDataTable(
      ['Step', 'Hazard', 'Type', 'Sev.', 'Lik.', 'Sig?', 'Control Measure'],
      data.hazard_analysis.map((h) => [
        h.step,
        h.hazard,
        h.hazard_type,
        h.severity,
        h.likelihood,
        h.significant,
        h.control_measure,
      ]),
      [15, 20, 10, 8, 8, 8, 31]
    );
    elements.push(hazardTable);
  } else {
    elements.push(createParagraph('Hazard analysis to be completed.', true));
  }

  return elements;
}

function createCCPSection(data: TemplateData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(createSectionHeader('SECTION 8 - CCP MANAGEMENT'));

  if (data.has_ccps && data.ccps.length > 0) {
    elements.push(createSubsectionHeader('CCP Summary'));

    const ccpSummaryTable = createDataTable(
      ['CCP ID', 'Step', 'Hazard', 'Critical Limit'],
      data.ccps.map((c) => [c.ccp_id, c.step, c.hazard, c.critical_limit]),
      [15, 25, 25, 35]
    );
    elements.push(ccpSummaryTable);

    elements.push(createSubsectionHeader('Monitoring & Corrective Actions'));

    const ccpMonitoringTable = createDataTable(
      ['CCP ID', 'Monitoring', 'Frequency', 'Corrective Action'],
      data.ccps.map((c) => [c.ccp_id, c.monitoring, c.frequency, c.corrective_action]),
      [12, 30, 18, 40]
    );
    elements.push(ccpMonitoringTable);
  } else {
    elements.push(
      createParagraph(
        'No Critical Control Points (CCPs) identified. Hazards are controlled via Prerequisite Programs.',
        false
      )
    );
  }

  return elements;
}

function createVerificationSection(data: TemplateData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(createSectionHeader('SECTION 9 - VERIFICATION & VALIDATION'));
  elements.push(createParagraph(data.verification_procedures));

  elements.push(createSectionHeader('SECTION 10 - RECORDS & DOCUMENTATION'));
  elements.push(createParagraph(data.record_keeping));

  return elements;
}

function createHeader(businessName: string, date: string): Header {
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
                  top: noBorder,
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: THEME.blue },
                  left: noBorder,
                  right: noBorder,
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `HACCP Plan - ${sanitizeText(businessName)}`,
                        font: 'Calibri',
                        size: 18,
                        color: THEME.navy,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                borders: {
                  top: noBorder,
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: THEME.blue },
                  left: noBorder,
                  right: noBorder,
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: sanitizeText(date),
                        font: 'Calibri',
                        size: 18,
                        color: THEME.gray,
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

function createFooter(version: string): Footer {
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
                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Version: ${sanitizeText(version)}`,
                        font: 'Calibri',
                        size: 16,
                        color: THEME.gray,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({ text: 'Page ', font: 'Calibri', size: 16, color: THEME.gray }),
                      new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 16 }),
                      new TextRun({ text: ' of ', font: 'Calibri', size: 16, color: THEME.gray }),
                      new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Calibri', size: 16 }),
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

/**
 * Generate a Minneapolis-style HACCP document from template data
 */
export async function generateMinneapolisDocument(data: TemplateData): Promise<Buffer> {
  const allContent: (Paragraph | Table)[] = [
    // Cover page
    ...createCoverPage(data),

    // Section 1 - Team & Scope
    createSectionHeader('SECTION 1 - HACCP TEAM & SCOPE'),
    createParagraph(data.team_scope_summary),

    // Section 2 - Product Description
    ...createProductSection(data),

    // Section 3 - Intended Use
    createSectionHeader('SECTION 3 - INTENDED USE'),
    createParagraph(data.intended_use_narrative || data.intended_use),

    // Section 4 - Process Flow
    ...createProcessSection(data),

    // Section 5 - PRPs
    ...createPRPSection(data),

    // Section 6 - Hazard Analysis
    ...createHazardAnalysisSection(data),

    // Section 7 - CCP Determination (brief)
    createSectionHeader('SECTION 7 - CCP DETERMINATION'),
    createParagraph('CCPs determined using Codex Alimentarius Decision Tree methodology.'),

    // Section 8 - CCP Management
    ...createCCPSection(data),

    // Sections 9 & 10 - Verification and Records
    ...createVerificationSection(data),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: toTwips(50),
              right: toTwips(50),
              bottom: toTwips(50),
              left: toTwips(50),
            },
          },
        },
        headers: { default: createHeader(data.business_name, data.date) },
        footers: { default: createFooter(data.version) },
        children: allContent,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

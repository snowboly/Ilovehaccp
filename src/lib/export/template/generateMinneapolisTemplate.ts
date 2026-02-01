/**
 * Minneapolis-style HACCP Template Generator
 * ===========================================
 * Creates a professional DOCX document using the design system primitives.
 *
 * Document Structure:
 * - Cover Page with signatures
 * - Section 1: HACCP Team & Scope
 * - Section 2: Product Description
 * - Section 3: Intended Use
 * - Section 4: Prerequisite Programs (PRPs)
 * - Section 5: Process Flow (5.1 Diagram, 5.2 Steps Table)
 * - Section 6: Hazard Analysis & CCP Determination
 * - Section 7: CCP Management
 * - Section 8: Verification & Validation
 * - Section 9: Records & Documentation
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
  Packer,
} from 'docx';
import type { TemplateData, ProcessStep } from './buildTemplateData';
import { resolveDocxImageType } from '../word/image';

// Import design system and primitives
import {
  Colors,
  Fonts,
  FontSizes,
  Spacing,
  BorderWidths,
  PageConfig,
  toTwips,
  toHalfPoints,
} from '../docx/designSystem';

import {
  sanitizeText,
  sectionHeading,
  subsectionHeading,
  introParagraph,
  bodyParagraph,
  captionParagraph,
  sectionLeadParagraph,
  tableCaptionParagraph,
  dataTable,
  tableIntroLine,
  keyValueTable,
  flowStep,
  flowArrow,
  processFlowDiagram,
  spacerParagraph,
  noBorders,
  thinBorders,
} from '../docx/primitives';

// ============================================================================
// PLACEHOLDERS - Human-readable defaults
// ============================================================================

const PLACEHOLDERS = {
  toBeDefinedByBusiness: 'To be defined by the food business.',
  notProvidedInDraft: 'Not provided in the current draft.',
  completeInReview: 'Complete during HACCP team review.',
  prpToBeDocumented: 'Prerequisite programs to be documented during HACCP implementation.',
  processToBeDocumented: 'Process flow to be documented during HACCP team review.',
  hazardToBeCompleted: 'Hazard analysis to be completed by the HACCP team.',
  descriptionToComplete: 'Description to be completed by the food business.',
};

// ============================================================================
// COVER PAGE
// ============================================================================

function createCoverPage(data: TemplateData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // Logo if present
  if (data.logo && data.has_logo) {
    try {
      const logoType = resolveDocxImageType(data.logo);
      if (!logoType) {
        throw new Error('Unsupported logo format for DOCX export. Use PNG or JPEG.');
      }
      elements.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: data.logo,
              transformation: { width: 150, height: 75 },
              type: logoType,
            } as any),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: toTwips(10), after: toTwips(20) },
        })
      );
    } catch (error) {
      console.error('Failed to render logo in DOCX export.', error);
      throw error;
    }
  }

  // Business name - large centered title
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: sanitizeText(data.business_name),
          font: Fonts.primary,
          size: toHalfPoints(FontSizes.display),
          bold: true,
          color: Colors.primary,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: data.has_logo ? toTwips(10) : toTwips(60), after: toTwips(10) },
    })
  );

  // HACCP Plan title
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'HACCP Plan',
          font: Fonts.primary,
          size: toHalfPoints(FontSizes.displaySub),
          bold: true,
          color: Colors.primaryLight,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: toTwips(5) },
    })
  );

  // Subtitle - Food Safety Management System
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Food Safety Management System',
          font: Fonts.primary,
          size: toHalfPoints(FontSizes.h2),
          color: Colors.muted,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: toTwips(30) },
    })
  );

  // Date
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: sanitizeText(data.date),
          font: Fonts.primary,
          size: toHalfPoints(FontSizes.h2),
          color: Colors.text,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: toTwips(40) },
    })
  );

  // Signature lines using a table
  const signatureTable = new Table({
    width: { size: 80, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
    rows: [
      createSignatureRow('Created by:', 'Date:'),
      createSignatureRow('Approved by:', 'Date:'),
    ],
  });

  elements.push(signatureTable);

  // Version info
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Version: ${sanitizeText(data.version)}`,
          font: Fonts.primary,
          size: toHalfPoints(FontSizes.body),
          color: Colors.muted,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: toTwips(20) },
    })
  );

  // Page break after cover
  elements.push(
    new Paragraph({
      pageBreakBefore: true,
      children: [],
    })
  );

  return elements;
}

function createSignatureRow(leftLabel: string, rightLabel: string): TableRow {
  const cellPadding = toTwips(Spacing.gapMd);

  return new TableRow({
    children: [
      new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        borders: noBorders,
        margins: { top: cellPadding, bottom: toTwips(5) },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: leftLabel + ' ',
                font: Fonts.primary,
                size: toHalfPoints(FontSizes.body),
                bold: true,
              }),
              new TextRun({
                text: '____________________',
                font: Fonts.primary,
                size: toHalfPoints(FontSizes.body),
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        borders: noBorders,
        margins: { top: cellPadding, bottom: toTwips(5) },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: rightLabel + ' ',
                font: Fonts.primary,
                size: toHalfPoints(FontSizes.body),
                bold: true,
              }),
              new TextRun({
                text: '____________________',
                font: Fonts.primary,
                size: toHalfPoints(FontSizes.body),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ============================================================================
// SECTION 2 - PRODUCT DESCRIPTION
// ============================================================================

function createProductSection(data: TemplateData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(sectionHeading({ text: 'PRODUCT DESCRIPTION', number: 'SECTION 2 -' }));
  elements.push(tableCaptionParagraph('Table 2', 'Product Description'));

  elements.push(
    ...dataTable({
      headers: ['Field', 'Description'],
      rows: [
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
      columnWidths: [35, 65],
      zebraStripe: true,
      introText: 'The product details are summarised below.',
    })
  );

  const allergenRows = [
    { key: 'Allergens Present', value: data.allergens_present },
    { key: 'Cross-contact Risks', value: data.allergen_cross_contact_risks },
    { key: 'Controls', value: data.allergen_controls },
    { key: 'Control Notes', value: data.allergen_controls_notes },
  ].filter((row) => row.value && row.value !== '-' && row.value !== 'Not provided');

  if (allergenRows.length > 0) {
    elements.push(tableCaptionParagraph('Table 2A', 'Allergen Controls'));
    elements.push(...keyValueTable(allergenRows, 35));
  }

  return elements;
}

// ============================================================================
// SECTION 4 - PREREQUISITE PROGRAMS (PRPs)
// ============================================================================

function createPRPSection(data: TemplateData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(sectionHeading({ text: 'PREREQUISITE PROGRAMS (PRPs)', number: 'SECTION 4 -' }));

  if (data.has_prp_programs && data.prp_programs.length > 0) {
    elements.push(tableCaptionParagraph('Table 4', 'Prerequisite Programs'));
    elements.push(
      ...dataTable({
        headers: ['Program', 'In Place', 'Documented', 'Reference'],
        rows: data.prp_programs.map((prp) => [prp.program, prp.exists, prp.documented, prp.reference]),
        columnWidths: [30, 15, 15, 40],
        zebraStripe: true,
        introText: 'The following prerequisite programs support food safety operations.',
      })
    );
  } else {
    elements.push(introParagraph({ text: PLACEHOLDERS.prpToBeDocumented, italic: true, muted: true }));
  }

  return elements;
}

// ============================================================================
// SECTION 5 - PROCESS FLOW
// ============================================================================

function createProcessSection(data: TemplateData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(sectionHeading({ text: 'PROCESS FLOW', number: 'SECTION 5 -' }));

  // 5.1 Process Flow Diagram
  elements.push(subsectionHeading({ text: 'Process Flow Diagram', number: '5.1' }));

  if (data.has_process_steps && data.process_steps.length > 0) {
    // Identify CCPs from hazard analysis for marking in flow diagram
    const ccpSteps = new Set<string>();
    if (data.has_hazard_analysis) {
      data.hazard_analysis
        .filter((h) => h.significant === 'Yes')
        .forEach((h) => ccpSteps.add(h.step.toLowerCase()));
    }

    // Build flow step options
    const flowSteps = data.process_steps.map((step) => ({
      stepNumber: step.step_number,
      title: step.step_name,
      isCCP: ccpSteps.has(step.step_name.toLowerCase()),
    }));

    elements.push(
      ...processFlowDiagram({
        steps: flowSteps,
        intro: 'The following diagram illustrates the production process.',
      })
    );

    elements.push(
      captionParagraph(
        'Note: A visual process flow diagram should be maintained on-site and reviewed by the HACCP team during each plan revision.'
      )
    );
  } else {
    elements.push(introParagraph({ text: PLACEHOLDERS.processToBeDocumented, italic: true, muted: true }));
  }

  // 5.2 Process Steps Description Table
  elements.push(subsectionHeading({ text: 'Process Steps Description', number: '5.2' }));

  if (data.has_process_steps && data.process_steps.length > 0) {
    elements.push(tableCaptionParagraph('Table 5.2', 'Process Steps'));
    elements.push(
      ...dataTable({
        headers: ['Step No.', 'Step Name', 'Description'],
        rows: data.process_steps.map((step) => [
          String(step.step_number),
          step.step_name,
          step.step_description || PLACEHOLDERS.descriptionToComplete,
        ]),
        columnWidths: [12, 28, 60],
        zebraStripe: true,
        introText: 'Each process step is described in the table below.',
        headerRepeat: true,
        cantSplitRows: true,
      })
    );
  } else {
    elements.push(introParagraph({ text: 'Process steps to be documented.', italic: true, muted: true }));
  }

  // Process Narrative (if available)
  if (data.process_description && data.process_description !== '-') {
    elements.push(subsectionHeading({ text: 'Process Narrative', number: '5.3' }));
    elements.push(bodyParagraph({ text: data.process_description }));
  }

  return elements;
}

// ============================================================================
// SECTION 6 - HAZARD ANALYSIS & CCP DETERMINATION
// ============================================================================

function createHazardAnalysisSection(data: TemplateData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(sectionHeading({ text: 'HAZARD ANALYSIS & CCP DETERMINATION', number: 'SECTION 6 -' }));

  if (data.has_hazard_analysis && data.hazard_analysis.length > 0) {
    // Collect descriptions that need to be shown
    const descriptionsToShow = data.hazard_analysis.filter(
      (h) => h.control_measure_description && h.control_measure_description !== '-'
    );

    const hazardRows = data.hazard_analysis.map((h) => ({
      step: h.step,
      hazard: h.hazard,
      type: h.hazard_type,
      severity: h.severity,
      likelihood: h.likelihood,
      significant: h.significant,
      control: h.control_measure,
    }));

    elements.push(tableCaptionParagraph('Table 6A', 'Hazard Identification'));
    elements.push(
      ...dataTable({
        headers: ['Step', 'Hazard', 'Type'],
        rows: hazardRows.map((h) => [h.step, h.hazard, h.type]),
        columnWidths: [20, 55, 25],
        zebraStripe: false,
        introText: 'Identified hazards are summarized by process step.',
      })
    );

    elements.push(tableCaptionParagraph('Table 6B', 'Risk & Controls'));
    elements.push(
      ...dataTable({
        headers: ['Step', 'Sev.', 'Lik.', 'Sig?', 'Control Measure'],
        rows: hazardRows.map((h) => [h.step, h.severity, h.likelihood, h.significant, h.control]),
        columnWidths: [20, 10, 10, 12, 48],
        zebraStripe: false,
        introText: 'Risk ratings and declared controls are shown per step.',
      })
    );

    // Control Measure Descriptions - conditional display based on count
    // ≤2 descriptions: append as notes under the main table (reduces fragmentation)
    // >2 descriptions: separate 6.1 subsection with its own table
    if (descriptionsToShow.length > 0) {
      if (descriptionsToShow.length <= 2) {
        // Append as compact notes under the hazard table
        elements.push(spacerParagraph(Spacing.gapSm));
        elements.push(sectionLeadParagraph('Control Measure Notes:'));
        descriptionsToShow.forEach((h) => {
          elements.push(
            bodyParagraph({
              text: `${h.step} — ${h.control_measure}: ${h.control_measure_description}`,
              spacingAfter: Spacing.gapSm,
            })
          );
        });
      } else {
        // Separate subsection for better organization
        elements.push(subsectionHeading({ text: 'Control Measure Descriptions', number: '6.1' }));
        elements.push(tableCaptionParagraph('Table 6.1', 'Control Measure Details'));
        elements.push(
          ...dataTable({
            headers: ['Step', 'Control Measure', 'Description'],
            rows: descriptionsToShow.map((h) => [h.step, h.control_measure, h.control_measure_description]),
            columnWidths: [15, 25, 60],
            zebraStripe: true,
            introText: 'Detailed descriptions of control measures are provided below.',
          })
        );
      }
    }
  } else {
    elements.push(introParagraph({ text: PLACEHOLDERS.hazardToBeCompleted, italic: true, muted: true }));
  }

  // CCP Determination methodology note (merged from former standalone section)
  elements.push(spacerParagraph(Spacing.gapMd));
  elements.push(
    captionParagraph('CCP determination was performed using Codex Alimentarius decision tree methodology.')
  );

  return elements;
}

// ============================================================================
// SECTION 7 - CCP MANAGEMENT
// ============================================================================

function createCCPSection(data: TemplateData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(sectionHeading({ text: 'CCP MANAGEMENT', number: 'SECTION 7 -' }));

  if (data.has_ccps && data.ccps.length > 0) {
    elements.push(subsectionHeading({ text: 'CCP Summary', number: '7.1' }));
    elements.push(tableCaptionParagraph('Table 7.1', 'Critical Control Points'));

    elements.push(
      ...dataTable({
        headers: ['CCP ID', 'Step', 'Hazard', 'Critical Limit'],
        rows: data.ccps.map((c) => [c.ccp_id, c.step, c.hazard, c.critical_limit]),
        columnWidths: [15, 25, 25, 35],
        zebraStripe: false,
        introText: 'The following Critical Control Points have been identified.',
      })
    );

    elements.push(subsectionHeading({ text: 'Monitoring & Corrective Actions', number: '7.2' }));
    elements.push(tableCaptionParagraph('Table 7.2', 'CCP Monitoring'));

    elements.push(
      ...dataTable({
        headers: ['CCP ID', 'Monitoring', 'Frequency', 'Corrective Action'],
        rows: data.ccps.map((c) => [c.ccp_id, c.monitoring, c.frequency, c.corrective_action]),
        columnWidths: [12, 30, 18, 40],
        zebraStripe: true,
        introText: 'Monitoring procedures and corrective actions for each CCP are detailed below.',
      })
    );
  } else {
    elements.push(
      bodyParagraph({
        text: 'No Critical Control Points (CCPs) identified. Hazards are controlled via Prerequisite Programs.',
      })
    );
  }

  return elements;
}

// ============================================================================
// SECTIONS 8 & 9 - VERIFICATION AND RECORDS
// ============================================================================

function createVerificationSection(data: TemplateData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(sectionHeading({ text: 'VERIFICATION & VALIDATION', number: 'SECTION 8 -' }));
  elements.push(bodyParagraph({ text: data.verification_procedures }));

  elements.push(sectionHeading({ text: 'RECORDS & DOCUMENTATION', number: 'SECTION 9 -' }));
  elements.push(bodyParagraph({ text: data.record_keeping }));

  return elements;
}

// ============================================================================
// HEADER AND FOOTER
// ============================================================================

function createHeader(productName: string, businessName: string): Header {
  return new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 60, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: Colors.white },
                  bottom: { style: BorderStyle.SINGLE, size: BorderWidths.medium, color: Colors.primary },
                  left: { style: BorderStyle.NONE, size: 0, color: Colors.white },
                  right: { style: BorderStyle.NONE, size: 0, color: Colors.white },
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `HACCP Plan — ${sanitizeText(productName)}`,
                        font: Fonts.primary,
                        size: toHalfPoints(FontSizes.small),
                        color: Colors.primary,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: Colors.white },
                  bottom: { style: BorderStyle.SINGLE, size: BorderWidths.medium, color: Colors.primary },
                  left: { style: BorderStyle.NONE, size: 0, color: Colors.white },
                  right: { style: BorderStyle.NONE, size: 0, color: Colors.white },
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: sanitizeText(businessName),
                        font: Fonts.primary,
                        size: toHalfPoints(FontSizes.small),
                        color: Colors.muted,
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
                borders: noBorders,
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Version: ${sanitizeText(version)}`,
                        font: Fonts.primary,
                        size: toHalfPoints(FontSizes.tiny),
                        color: Colors.muted,
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
                        text: 'Page ',
                        font: Fonts.primary,
                        size: toHalfPoints(FontSizes.tiny),
                        color: Colors.muted,
                      }),
                      new TextRun({
                        children: [PageNumber.CURRENT],
                        font: Fonts.primary,
                        size: toHalfPoints(FontSizes.tiny),
                      }),
                      new TextRun({
                        text: ' of ',
                        font: Fonts.primary,
                        size: toHalfPoints(FontSizes.tiny),
                        color: Colors.muted,
                      }),
                      new TextRun({
                        children: [PageNumber.TOTAL_PAGES],
                        font: Fonts.primary,
                        size: toHalfPoints(FontSizes.tiny),
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

// ============================================================================
// MAIN DOCUMENT GENERATOR
// ============================================================================

/**
 * Generate a Minneapolis-style HACCP document from template data.
 * Uses design system primitives for all layout and styling.
 */
export async function generateMinneapolisDocument(data: TemplateData): Promise<Buffer> {
  const allContent: (Paragraph | Table)[] = [
    // Cover page
    ...createCoverPage(data),

    // Section 1 - Team & Scope
    sectionHeading({ text: 'HACCP TEAM & SCOPE', number: 'SECTION 1 -' }),
    bodyParagraph({ text: data.team_scope_summary }),

    // Section 2 - Product Description
    ...createProductSection(data),

    // Section 3 - Intended Use
    sectionHeading({ text: 'INTENDED USE', number: 'SECTION 3 -' }),
    ...(data.is_rte
      ? []
      : [
          bodyParagraph({
            text: `Further Preparation/Handling: ${data.consumer_handling}`,
          }),
        ]),

    // Section 4 - PRPs
    ...createPRPSection(data),

    // Section 5 - Process Flow (with 5.1 Diagram and 5.2 Steps Table)
    ...createProcessSection(data),

    // Section 6 - Hazard Analysis & CCP Determination (merged)
    ...createHazardAnalysisSection(data),

    // Section 7 - CCP Management
    ...createCCPSection(data),

    // Sections 8 & 9 - Verification and Records
    ...createVerificationSection(data),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: PageConfig.width,
              height: PageConfig.height,
            },
            margin: {
              top: PageConfig.marginTop,
              right: PageConfig.marginRight,
              bottom: PageConfig.marginBottom,
              left: PageConfig.marginLeft,
              header: PageConfig.headerDistance,
              footer: PageConfig.footerDistance,
            },
          },
        },
        headers: { default: createHeader(data.product_name, data.business_name) },
        footers: { default: createFooter(data.version) },
        children: allContent,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

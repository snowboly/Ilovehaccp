/**
 * Minneapolis-style HACCP Template Generator
 * ===========================================
 * Creates a professional DOCX document using the design system primitives.
 *
 * Document Structure:
 * - Cover Page with signatures
 * - Section 1: HACCP Team & Scope
 * - Section 2: Product Description
 * - Section 3: Prerequisite Programs (PRPs)
 * - Section 4: Process Flow (4.1 Diagram, 4.2 Steps Table)
 * - Section 5: Hazard Analysis & CCP Determination
 * - Section 6: CCP Management
 * - Section 7: Verification & Validation
 * - Section 8: Records & Documentation
 * - Section 9: Traceability & Recall (EC 178/2002)
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
  HeightRule,
  Packer,
} from 'docx';
import type { TemplateData, ProcessStep } from './buildTemplateData';
import { resolveDocxImageType, getImageDimensions, scaleToFit } from '../word/image';

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
// TABLE COUNTER — sequential numbering across entire document
// ============================================================================
type TableCounter = { n: number };
const nextTable = (c: TableCounter, caption: string) =>
  tableCaptionParagraph(`Table ${++c.n}`, caption);

// ============================================================================
// COVER PAGE
// ============================================================================

type AlignmentTypeValue = (typeof AlignmentType)[keyof typeof AlignmentType];

const withPlaceholder = (value: string, placeholder = '____________________') =>
  value && value.trim().length > 0 ? value : placeholder;

const buildLogoParagraph = (data: TemplateData, alignment: AlignmentTypeValue) => {
  if (!data.logo || !data.has_logo) return null;
  const logoType = resolveDocxImageType(data.logo);
  if (!logoType) {
    throw new Error('Unsupported logo format for DOCX export. Use PNG or JPEG.');
  }
  // Calculate aspect-ratio-preserving dimensions (max 140x140)
  const maxWidth = 140;
  const maxHeight = 140;
  const dimensions = getImageDimensions(data.logo);
  const transformation = dimensions
    ? scaleToFit(dimensions, maxWidth, maxHeight)
    : { width: maxWidth, height: maxHeight };
  return new Paragraph({
    children: [
      new ImageRun({
        data: data.logo,
        transformation,
        type: logoType,
      } as any),
    ],
    alignment,
    spacing: { before: toTwips(6), after: toTwips(12) },
  });
};

const buildCoverMetaTable = (rows: { label: string; value: string }[]) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: rows.map(
      (row) =>
        new TableRow({
          children: [
            new TableCell({
              borders: noBorders,
              width: { size: 35, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: row.label,
                      font: Fonts.primary,
                      size: toHalfPoints(FontSizes.h3),
                      bold: true,
                      color: Colors.textSecondary,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: noBorders,
              width: { size: 65, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: row.value,
                      font: Fonts.primary,
                      size: toHalfPoints(FontSizes.h3),
                      color: Colors.text,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
    ),
  });

const buildCoverRows = (data: TemplateData) => {
  const preparedBy = sanitizeText(data.created_by || 'ilovehaccp.com');
  return [
    { label: 'Prepared for', value: sanitizeText(data.business_name) },
    { label: 'Prepared by', value: withPlaceholder(preparedBy) },
    { label: 'Date', value: sanitizeText(data.date) },
    { label: 'Version', value: sanitizeText(data.version) },
    { label: 'Approved by', value: withPlaceholder(sanitizeText(data.approved_by)) },
  ];
};

const createCoverPage = (data: TemplateData): (Paragraph | Table)[] => {
  const elements: (Paragraph | Table)[] = [];
  const topBand = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        height: { value: toTwips(10), rule: HeightRule.EXACT },
        children: [
          new TableCell({
            borders: noBorders,
            shading: { type: ShadingType.CLEAR, color: Colors.sectionBg, fill: Colors.sectionBg },
            children: [new Paragraph({})],
          }),
        ],
      }),
      new TableRow({
        height: { value: toTwips(4), rule: HeightRule.EXACT },
        children: [
          new TableCell({
            borders: noBorders,
            shading: { type: ShadingType.CLEAR, color: Colors.sectionBg, fill: Colors.sectionBg },
            children: [new Paragraph({})],
          }),
        ],
      }),
    ],
  });
  elements.push(topBand);

  const logo = buildLogoParagraph(data, AlignmentType.LEFT);
  if (logo) elements.push(logo);

  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'HACCP PLAN',
          font: Fonts.primary,
          size: toHalfPoints(FontSizes.display),
          bold: true,
          color: Colors.text,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: toTwips(20), after: toTwips(12) },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: sanitizeText(data.business_name),
          font: Fonts.primary,
          size: toHalfPoints(FontSizes.displaySub),
          color: Colors.textSecondary,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: toTwips(20) },
    })
  );

  elements.push(buildCoverMetaTable(buildCoverRows(data)));
  elements.push(spacerParagraph(40));

  // Page break after cover
  elements.push(
    new Paragraph({
      pageBreakBefore: true,
      children: [],
    })
  );

  return elements;
}

// ============================================================================
// SECTION 2 - PRODUCT DESCRIPTION
// ============================================================================

function createProductSection(data: TemplateData, tc: TableCounter): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(sectionHeading({ text: 'PRODUCT DESCRIPTION', number: 'SECTION 2 -' }));
  elements.push(nextTable(tc, 'Product Description'));

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
  ].filter((row) => row.value && row.value !== '-' && row.value !== 'Not provided');

  if (allergenRows.length > 0) {
    elements.push(nextTable(tc, 'Allergen Controls'));
    elements.push(...keyValueTable(allergenRows, 35, ['Allergen', 'Details']));
  }

  return elements;
}

// ============================================================================
// SECTION 3 - PREREQUISITE PROGRAMS (PRPs)
// ============================================================================

function createPRPSection(data: TemplateData, tc: TableCounter): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(sectionHeading({ text: 'PREREQUISITE PROGRAMS (PRPs)', number: 'SECTION 3 -' }));

  if (data.has_prp_programs && data.prp_programs.length > 0) {
    elements.push(nextTable(tc, 'Prerequisite Programs'));
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
// SECTION 4 - PROCESS FLOW
// ============================================================================

function createProcessSection(data: TemplateData, tc: TableCounter): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(sectionHeading({ text: 'PROCESS FLOW', number: 'SECTION 4 -' }));

  // 4.1 Process Flow Diagram
  elements.push(subsectionHeading({ text: 'Process Flow Diagram', number: '4.1' }));

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

  // 4.2 Process Steps Description Table
  elements.push(subsectionHeading({ text: 'Process Steps Description', number: '4.2' }));

  if (data.has_process_steps && data.process_steps.length > 0) {
    elements.push(nextTable(tc, 'Process Steps'));
    elements.push(
      ...dataTable({
        headers: ['Step No.', 'Step Name', 'Description'],
        rows: data.process_steps.map((step) => [
          String(step.step_number),
          step.step_name,
          step.step_description || PLACEHOLDERS.descriptionToComplete,
        ]),
        columnWidths: [8, 20, 72],
        columnAlignments: [AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.LEFT],
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
    elements.push(subsectionHeading({ text: 'Process Narrative', number: '4.3' }));
    elements.push(bodyParagraph({ text: data.process_description }));
  }

  return elements;
}

// ============================================================================
// SECTION 5 - HAZARD ANALYSIS & CCP DETERMINATION
// ============================================================================

function createHazardAnalysisSection(data: TemplateData, tc: TableCounter): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(sectionHeading({ text: 'HAZARD ANALYSIS & CCP DETERMINATION', number: 'SECTION 5 -' }));

  if (data.has_hazard_analysis && data.hazard_analysis.length > 0) {
    // --- Table 5A: Hazard Identification ---
    elements.push(subsectionHeading({ text: 'Hazard Identification', number: '5.1' }));
    elements.push(nextTable(tc, 'Hazard Identification'));
    elements.push(
      ...dataTable({
        headers: ['Step', 'Type of Hazard', 'Description'],
        rows: data.hazard_analysis.map((h) => [h.step, h.hazard_type, h.hazard]),
        columnWidths: [20, 20, 60],
        zebraStripe: false,
        introText: 'Identified hazards are summarized by process step.',
        headerRepeat: true,
        cantSplitRows: true,
      })
    );

    // --- Table 5B: Risk & Controls ---
    elements.push(subsectionHeading({ text: 'Risk Assessment & Controls', number: '5.2' }));
    elements.push(nextTable(tc, 'Risk Assessment & Controls'));
    elements.push(
      ...dataTable({
        headers: ['Step', 'Type of Hazard', 'Likelihood', 'Control Measures'],
        rows: data.hazard_analysis.map((h) => [
          h.step,
          h.hazard_type,
          h.likelihood,
          h.control_measure_detail,
        ]),
        columnWidths: [18, 16, 14, 52],
        zebraStripe: false,
        introText: 'Risk ratings and declared controls are shown per hazard.',
        headerRepeat: true,
        cantSplitRows: true,
      })
    );
  } else {
    elements.push(introParagraph({ text: PLACEHOLDERS.hazardToBeCompleted, italic: true, muted: true }));
  }

  return elements;
}

// ============================================================================
// SECTION 6 - CCP MANAGEMENT
// ============================================================================

function createCCPSection(data: TemplateData, tc: TableCounter): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(sectionHeading({ text: 'CCP MANAGEMENT', number: 'SECTION 6 -' }));

  if (data.has_ccps && data.ccps.length > 0) {
    elements.push(subsectionHeading({ text: 'CCP Summary', number: '6.1' }));
    elements.push(nextTable(tc, 'Critical Control Points'));

    elements.push(
      ...dataTable({
        headers: ['CCP ID', 'Step', 'Hazard', 'Critical Limit'],
        rows: data.ccps.map((c) => [c.ccp_id, c.step, c.hazard, c.critical_limit]),
        columnWidths: [15, 25, 25, 35],
        zebraStripe: false,
        introText: 'The following Critical Control Points have been identified.',
      })
    );

    elements.push(subsectionHeading({ text: 'Monitoring & Corrective Actions', number: '6.2' }));
    elements.push(nextTable(tc, 'CCP Monitoring'));

    elements.push(
      ...dataTable({
        headers: ['CCP ID', 'Monitoring', 'Frequency', 'Corrective Action'],
        rows: data.ccps.map((c) => [c.ccp_id, c.monitoring, c.frequency, c.corrective_action]),
        columnWidths: [12, 30, 18, 40],
        zebraStripe: true,
        introText: 'Monitoring procedures and corrective actions for each CCP are detailed below.',
      })
    );

    // Monitoring equipment table — only if any instrument data was provided
    const hasEquipmentData = data.ccps.some((c) => c.monitoring_instrument !== '-' || c.calibration_frequency !== '-');
    if (hasEquipmentData) {
      elements.push(subsectionHeading({ text: 'Monitoring Equipment & Calibration', number: '6.3' }));
      elements.push(nextTable(tc, 'Equipment Validation'));
      elements.push(
        ...dataTable({
          headers: ['CCP ID', 'Instrument / Equipment', 'Calibration Frequency'],
          rows: data.ccps
            .filter((c) => c.monitoring_instrument !== '-' || c.calibration_frequency !== '-')
            .map((c) => [c.ccp_id, c.monitoring_instrument, c.calibration_frequency]),
          columnWidths: [15, 50, 35],
          zebraStripe: true,
          introText: 'Monitoring instruments and calibration schedules per EC 852/2004 Annex II Ch. IX.',
        })
      );
    }
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
// SECTIONS 7 & 8 - VERIFICATION AND RECORDS
// ============================================================================

function createVerificationSection(data: TemplateData, tc: TableCounter): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // --- Section 7: Verification & Validation ---
  elements.push(sectionHeading({ text: 'VERIFICATION & VALIDATION', number: 'SECTION 7 -' }));

  if (data.has_verification_data) {
    elements.push(nextTable(tc, 'Verification & Validation'));
    elements.push(
      ...keyValueTable([
        { key: 'HACCP Plan Validated', value: data.verification_data.is_validated },
        ...(data.verification_data.validation_date !== 'Not recorded'
          ? [{ key: 'Validation Date', value: data.verification_data.validation_date }]
          : []),
        ...(data.verification_data.validated_by !== 'Not recorded'
          ? [{ key: 'Validated By', value: data.verification_data.validated_by }]
          : []),
        { key: 'Verification Activities', value: data.verification_data.verification_activities },
        { key: 'Verification Frequency', value: data.verification_data.verification_frequency },
        { key: 'Verification Responsibility', value: data.verification_data.verification_responsibility },
        { key: 'HACCP Review Frequency', value: data.verification_data.review_frequency },
        { key: 'Review Triggers', value: data.verification_data.review_triggers },
      ])
    );
  }

  // Include AI-generated narrative as supplementary text
  if (data.verification_procedures && data.verification_procedures !== '-') {
    elements.push(bodyParagraph({ text: data.verification_procedures }));
  }

  // --- Section 8: Records & Documentation ---
  elements.push(sectionHeading({ text: 'RECORDS & DOCUMENTATION', number: 'SECTION 8 -' }));

  if (data.has_records_data) {
    elements.push(nextTable(tc, 'Records & Documentation'));
    elements.push(
      ...keyValueTable([
        { key: 'Record Storage Location', value: data.records_data.record_storage_location },
        { key: 'Retention Period', value: data.records_data.record_retention_period },
        { key: 'Document Control Method', value: data.records_data.document_control_method },
      ])
    );
  }

  // Include AI-generated narrative as supplementary text
  if (data.record_keeping && data.record_keeping !== '-') {
    elements.push(bodyParagraph({ text: data.record_keeping }));
  }

  // --- Section 9: Traceability & Recall ---
  elements.push(sectionHeading({ text: 'TRACEABILITY & RECALL', number: 'SECTION 9 -' }));

  if (data.has_traceability) {
    elements.push(
      introParagraph({
        text: data.traceability_intro,
      })
    );

    elements.push(subsectionHeading({ text: 'Batch Coding & Lot Identification', number: '9.1' }));
    elements.push(nextTable(tc, 'Batch Coding'));
    elements.push(
      ...keyValueTable([
        { key: 'Batch coding method', value: data.traceability.batch_coding_method },
        { key: 'Example batch code', value: data.traceability.batch_code_example },
      ])
    );

    elements.push(subsectionHeading({ text: 'Supply Chain Traceability', number: '9.2' }));
    elements.push(nextTable(tc, 'Traceability Capabilities'));
    elements.push(
      ...keyValueTable([
        { key: 'Supplier traceability (one step back)', value: data.traceability.supplier_traceability },
        ...(data.traceability.supplier_traceability_method !== '-'
          ? [{ key: 'Supplier traceability method', value: data.traceability.supplier_traceability_method }]
          : []),
        { key: 'Customer traceability (one step forward)', value: data.traceability.customer_traceability },
        ...(data.traceability.customer_traceability_method !== '-'
          ? [{ key: 'Customer traceability method', value: data.traceability.customer_traceability_method }]
          : []),
      ])
    );

    elements.push(subsectionHeading({ text: 'Recall & Withdrawal', number: '9.3' }));
    elements.push(nextTable(tc, 'Recall Procedures'));
    elements.push(
      ...keyValueTable([
        { key: 'Recall procedure documented', value: data.traceability.recall_procedure_documented },
        { key: 'Last mock recall', value: data.traceability.recall_last_tested },
        { key: 'Recall coordinator', value: data.traceability.recall_coordinator },
      ])
    );
  } else {
    elements.push(
      bodyParagraph({
        text: 'Traceability and recall procedures to be documented during HACCP implementation. EC Regulation 178/2002 Articles 18–19 require one-step-back and one-step-forward traceability and documented recall/withdrawal procedures.',
      })
    );
  }

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
  const tc: TableCounter = { n: 0 };

  const allContent: (Paragraph | Table)[] = [
    // Cover page
    ...createCoverPage(data),

    // Section 1 - Team & Scope
    sectionHeading({ text: 'HACCP TEAM & SCOPE', number: 'SECTION 1 -' }),
    ...(data.has_haccp_team
      ? [
          nextTable(tc, 'HACCP Team'),
          ...dataTable({
            headers: ['Name', 'Role / Job Title', 'Competence / Qualifications'],
            rows: data.haccp_team.map((m) => [m.member_name, m.member_role, m.member_competence]),
            columnWidths: [30, 35, 35],
            zebraStripe: true,
            introText: 'The HACCP team responsible for this plan comprises the following members.',
          }),
        ]
      : []),
    bodyParagraph({ text: data.team_scope_summary }),

    // Section 2 - Product Description
    ...createProductSection(data, tc),

    // Section 3 - PRPs
    ...createPRPSection(data, tc),

    // Section 4 - Process Flow (with 4.1 Diagram and 4.2 Steps Table)
    ...createProcessSection(data, tc),

    // Section 5 - Hazard Analysis & CCP Determination
    ...createHazardAnalysisSection(data, tc),

    // Section 6 - CCP Management
    ...createCCPSection(data, tc),

    // Sections 7, 8 & 9 - Verification, Records, Traceability
    ...createVerificationSection(data, tc),
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

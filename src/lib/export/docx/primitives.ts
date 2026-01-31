/**
 * DOCX Layout Primitives
 * =======================
 * Reusable layout components for HACCP document generation.
 *
 * These primitives provide consistent, well-structured building blocks
 * for document composition. Each primitive handles:
 * - Orphan/widow prevention (keepWithNext, keepLines)
 * - Proper spacing and hierarchy
 * - Accessibility and readability
 *
 * Usage Guidelines:
 * - Use `introText` option on tables to provide context and anchor them to headings
 * - Use section headings for major document divisions
 * - Use subsection headings for content within sections
 * - For hazard tables, disable zebra striping with `zebraStripe: false`
 * - Tables should never immediately follow headings without an intro line
 */

import {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  TableLayoutType,
  VerticalAlign,
  HeadingLevel,
  IRunOptions,
  IParagraphOptions,
  ITableCellOptions,
} from "docx";

import { sanitizeDocxText } from "../word/text";

import {
  Colors,
  Fonts,
  FontSizes,
  Spacing,
  BorderWidths,
  toTwips,
  toHalfPoints,
  toLineSpacing,
  LineHeights,
} from "./designSystem";

// ============================================================================
// TEXT SANITIZATION
// ============================================================================

/**
 * Sanitize text for DOCX XML compatibility.
 * Removes invalid XML chars and splits long tokens to avoid DOCX corruption.
 */
export const sanitizeText = (input: string | undefined | null): string => {
  const value = input?.toString() ?? "";
  return sanitizeDocxText(value);
};

// ============================================================================
// BORDER HELPERS
// ============================================================================

/**
 * No border configuration for cells requiring invisible borders.
 */
export const noBorder = {
  style: BorderStyle.NONE,
  color: Colors.white,
  size: 0,
} as const;

/**
 * Standard thin border for tables and boxes.
 */
export const thinBorder = {
  style: BorderStyle.SINGLE,
  color: Colors.border,
  size: BorderWidths.thin,
} as const;

/**
 * Accent border for emphasis.
 */
export const accentBorder = {
  style: BorderStyle.SINGLE,
  color: Colors.borderAccent,
  size: BorderWidths.medium,
} as const;

/**
 * All sides no border configuration.
 */
export const noBorders = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder,
} as const;

/**
 * All sides thin border configuration.
 */
export const thinBorders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder,
} as const;

// ============================================================================
// SPACER PRIMITIVES
// ============================================================================

/**
 * Create a spacer paragraph to separate elements.
 * CRITICAL: Use this between headings and tables to prevent layout issues.
 *
 * @param heightPt - Height in points (default: 4pt minimal spacer)
 */
export const spacerParagraph = (heightPt: number = 4): Paragraph => {
  return new Paragraph({
    children: [],
    spacing: {
      before: toTwips(heightPt / 2),
      after: toTwips(heightPt / 2),
    },
  });
};

/**
 * Create a page break paragraph.
 */
export const pageBreak = (): Paragraph => {
  return new Paragraph({
    pageBreakBefore: true,
    children: [],
  });
};

// ============================================================================
// HEADING PRIMITIVES
// ============================================================================

/**
 * Options for section heading creation.
 */
export interface SectionHeadingOptions {
  /** Heading text */
  text: string;
  /** Optional heading number prefix (e.g., "1.", "2.1") */
  number?: string;
  /** Use all caps styling */
  allCaps?: boolean;
  /** Include top border accent line */
  withTopBorder?: boolean;
  /** Custom background color (hex without #) */
  backgroundColor?: string;
}

/**
 * Create a section heading (H1 level).
 * Implements orphan prevention with keepWithNext and keepLines.
 *
 * Section headings are major document divisions with prominent styling.
 *
 * @example
 * sectionHeading({ text: "Hazard Analysis", number: "3." })
 */
export const sectionHeading = (options: SectionHeadingOptions): Paragraph => {
  const {
    text,
    number,
    allCaps = true,
    withTopBorder = false,
    backgroundColor = Colors.sectionBg,
  } = options;

  const displayText = number ? `${number} ${text}` : text;

  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    // CRITICAL: Prevent orphaned headings - keep with following content
    keepNext: true,
    keepLines: true,
    shading: {
      type: ShadingType.CLEAR,
      fill: backgroundColor,
    },
    border: withTopBorder
      ? {
          top: {
            style: BorderStyle.SINGLE,
            color: Colors.primary,
            size: BorderWidths.medium,
            space: 1,
          },
        }
      : undefined,
    spacing: {
      before: toTwips(Spacing.headingBefore),
      after: toTwips(Spacing.headingAfter),
      line: toLineSpacing(LineHeights.tight),
    },
    children: [
      new TextRun({
        text: sanitizeText(allCaps ? displayText.toUpperCase() : displayText),
        font: Fonts.primary,
        size: toHalfPoints(FontSizes.h1),
        bold: true,
        color: Colors.primary,
      }),
    ],
  });
};

/**
 * Options for subsection heading creation.
 */
export interface SubsectionHeadingOptions {
  /** Heading text */
  text: string;
  /** Optional heading number prefix */
  number?: string;
  /** Use primary color for text */
  colored?: boolean;
}

/**
 * Create a subsection heading (H2 level).
 * Implements orphan prevention with keepWithNext and keepLines.
 *
 * Subsection headings divide content within major sections.
 *
 * @example
 * subsectionHeading({ text: "Biological Hazards", number: "3.1" })
 */
export const subsectionHeading = (options: SubsectionHeadingOptions): Paragraph => {
  const { text, number, colored = true } = options;

  const displayText = number ? `${number} ${text}` : text;

  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    // CRITICAL: Prevent orphaned headings
    keepNext: true,
    keepLines: true,
    spacing: {
      before: toTwips(Spacing.subheadingBefore),
      after: toTwips(Spacing.subheadingAfter),
      line: toLineSpacing(LineHeights.tight),
    },
    children: [
      new TextRun({
        text: sanitizeText(displayText),
        font: Fonts.primary,
        size: toHalfPoints(FontSizes.h2),
        bold: true,
        color: colored ? Colors.primary : Colors.text,
      }),
    ],
  });
};

/**
 * Options for minor heading creation.
 */
export interface MinorHeadingOptions {
  /** Heading text */
  text: string;
  /** Make text bold */
  bold?: boolean;
}

/**
 * Create a minor heading (H3 level).
 * Used for small content divisions within subsections.
 */
export const minorHeading = (options: MinorHeadingOptions): Paragraph => {
  const { text, bold = true } = options;

  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    keepNext: true,
    keepLines: true,
    spacing: {
      before: toTwips(Spacing.gapMd),
      after: toTwips(Spacing.gapSm),
    },
    children: [
      new TextRun({
        text: sanitizeText(text),
        font: Fonts.primary,
        size: toHalfPoints(FontSizes.h3),
        bold,
        color: Colors.text,
      }),
    ],
  });
};

// ============================================================================
// PARAGRAPH PRIMITIVES
// ============================================================================

/**
 * Options for intro paragraph creation.
 */
export interface IntroParagraphOptions {
  /** Paragraph text content */
  text: string;
  /** Use italic styling */
  italic?: boolean;
  /** Use muted (gray) color */
  muted?: boolean;
  /** Text alignment */
  alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
}

/**
 * Create an introductory paragraph.
 * Typically used at the start of sections to provide context.
 *
 * @example
 * introParagraph({
 *   text: "This section identifies potential hazards in the production process.",
 *   italic: true
 * })
 */
export const introParagraph = (options: IntroParagraphOptions): Paragraph => {
  const { text, italic = false, muted = false, alignment = AlignmentType.LEFT } = options;

  return new Paragraph({
    alignment,
    // Keep with next element to act as anchor for following content
    keepNext: true,
    keepLines: true,
    spacing: {
      before: toTwips(Spacing.gapSm),
      after: toTwips(Spacing.paragraphAfter),
      line: toLineSpacing(LineHeights.normal),
    },
    children: [
      new TextRun({
        text: sanitizeText(text),
        font: Fonts.primary,
        size: toHalfPoints(FontSizes.body),
        italics: italic,
        color: muted ? Colors.muted : Colors.text,
      }),
    ],
  });
};

/**
 * Options for body paragraph creation.
 */
export interface BodyParagraphOptions {
  /** Paragraph text content */
  text: string;
  /** Use bold styling */
  bold?: boolean;
  /** Use italic styling */
  italic?: boolean;
  /** Custom spacing after (points) */
  spacingAfter?: number;
}

/**
 * Create a standard body paragraph.
 */
export const bodyParagraph = (options: BodyParagraphOptions): Paragraph => {
  const { text, bold = false, italic = false, spacingAfter = Spacing.paragraphAfter } = options;

  return new Paragraph({
    spacing: {
      after: toTwips(spacingAfter),
      line: toLineSpacing(LineHeights.normal),
    },
    children: [
      new TextRun({
        text: sanitizeText(text),
        font: Fonts.primary,
        size: toHalfPoints(FontSizes.body),
        bold,
        italics: italic,
        color: Colors.text,
      }),
    ],
  });
};

/**
 * Create a caption/note paragraph.
 * Smaller, muted text for annotations and notes.
 */
export const captionParagraph = (text: string, italic: boolean = true): Paragraph => {
  return new Paragraph({
    spacing: {
      before: toTwips(Spacing.gapXs),
      after: toTwips(Spacing.gapSm),
    },
    children: [
      new TextRun({
        text: sanitizeText(text),
        font: Fonts.primary,
        size: toHalfPoints(FontSizes.small),
        italics: italic,
        color: Colors.muted,
      }),
    ],
  });
};

/**
 * Create a section lead paragraph.
 * Visually distinct intro text with smaller font and lighter color.
 * Used as the primary anchor between headings and tables.
 *
 * @example
 * sectionLeadParagraph("The following table summarises the identified hazards.")
 */
export const sectionLeadParagraph = (text: string): Paragraph => {
  return new Paragraph({
    // Critical: keeps heading + lead + table together
    keepNext: true,
    keepLines: true,
    spacing: {
      before: toTwips(Spacing.gapXs),
      after: toTwips(Spacing.gapSm),
      line: toLineSpacing(LineHeights.tight),
    },
    children: [
      new TextRun({
        text: sanitizeText(text),
        font: Fonts.primary,
        size: toHalfPoints(FontSizes.small), // 9pt - slightly smaller
        // Modern style: use color + weight instead of italics
        color: Colors.textSecondary, // #4B5563 - lighter than body
      }),
    ],
  });
};

/**
 * Create a table caption paragraph.
 * Used for labelling tables like "Table 5.2 — Process Steps".
 * Has keepWithNext to ensure caption sticks with intro line and table.
 *
 * @example
 * tableCaptionParagraph("Table 6", "Hazard Analysis")
 */
export const tableCaptionParagraph = (
  tableNumber: string,
  title: string
): Paragraph => {
  return new Paragraph({
    // Keep caption with the intro line and table
    keepNext: true,
    keepLines: true,
    spacing: {
      before: toTwips(Spacing.gapMd),
      after: toTwips(Spacing.gapXs),
    },
    children: [
      new TextRun({
        text: `${sanitizeText(tableNumber)} — ${sanitizeText(title)}`,
        font: Fonts.primary,
        size: toHalfPoints(FontSizes.small),
        bold: true,
        color: Colors.textSecondary,
      }),
    ],
  });
};

// ============================================================================
// TABLE PRIMITIVES
// ============================================================================

/**
 * Default intro text for tables when none is provided.
 */
const DEFAULT_TABLE_INTRO = "Details are provided in the table below.";

/**
 * Create a table introduction line.
 * Acts as an "anchor" paragraph that keeps the heading connected to the table.
 * Using text (not a blank spacer) ensures proper widow/orphan control.
 *
 * @example
 * tableIntroLine("The following hazards were identified during the analysis.")
 */
export const tableIntroLine = (
  text: string = DEFAULT_TABLE_INTRO,
  options: { italic?: boolean; muted?: boolean } = {}
): Paragraph => {
  const { italic = true, muted = true } = options;

  return new Paragraph({
    // Critical: keeps heading + intro + table together
    keepNext: true,
    keepLines: true,
    spacing: {
      before: toTwips(Spacing.gapSm),
      after: toTwips(Spacing.gapSm),
      line: toLineSpacing(LineHeights.normal),
    },
    children: [
      new TextRun({
        text: sanitizeText(text),
        font: Fonts.primary,
        size: toHalfPoints(FontSizes.small), // Use smaller font for lead-in
        italics: italic,
        color: muted ? Colors.textSecondary : Colors.text, // Use textSecondary for muted
      }),
    ],
  });
};

/**
 * Options for data table creation.
 */
export interface DataTableOptions {
  /** Column headers */
  headers: string[];
  /** Table rows (array of cell values) */
  rows: string[][];
  /** Column width percentages (must sum to 100) */
  columnWidths: number[];
  /** Use zebra striping for rows (default true; disable for hazard tables) */
  zebraStripe?: boolean;
  /** Header background color (hex without #) */
  headerBackground?: string;
  /**
   * Intro text to display before the table.
   * - true: use default intro ("Details are provided in the table below.")
   * - string: use custom intro text
   * - false/undefined: no intro line
   */
  introText?: string | boolean;
}

/**
 * Create a data table with consistent styling.
 * Tables automatically include header row formatting and optional zebra striping.
 *
 * Best practice: Use `introText` to provide context and anchor the table to headings.
 *
 * @example
 * // With custom intro text
 * dataTable({
 *   headers: ["Hazard", "Risk Level", "Control Measure"],
 *   rows: [["Salmonella", "High", "Cook to 75C"]],
 *   columnWidths: [30, 20, 50],
 *   introText: "The following biological hazards were identified."
 * })
 *
 * // With default intro
 * dataTable({
 *   headers: ["Step", "Description"],
 *   rows: [["1", "Receiving"]],
 *   columnWidths: [20, 80],
 *   introText: true
 * })
 *
 * // Without striping (for hazard tables)
 * dataTable({
 *   headers: ["CCP", "Hazard", "Critical Limit"],
 *   rows: [...],
 *   columnWidths: [15, 35, 50],
 *   zebraStripe: false
 * })
 */
export const dataTable = (options: DataTableOptions): (Paragraph | Table)[] => {
  const {
    headers,
    rows,
    columnWidths,
    zebraStripe = true,
    headerBackground = Colors.tableHeaderBg,
    introText,
  } = options;

  const cellPadding = toTwips(Spacing.tableCellPadding);
  const elements: (Paragraph | Table)[] = [];

  // Add intro line to anchor table to preceding heading
  if (introText) {
    const text = typeof introText === "string" ? introText : DEFAULT_TABLE_INTRO;
    elements.push(tableIntroLine(text));
  }

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      // Header row
      new TableRow({
        tableHeader: true,
        children: headers.map((header, index) =>
          new TableCell({
            width: { size: columnWidths[index], type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: headerBackground },
            borders: thinBorders,
            margins: {
              top: cellPadding,
              bottom: cellPadding,
              left: cellPadding,
              right: cellPadding,
            },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: sanitizeText(header),
                    font: Fonts.primary,
                    size: toHalfPoints(FontSizes.tableHeader),
                    bold: true,
                    color: Colors.text,
                  }),
                ],
              }),
            ],
          })
        ),
      }),
      // Body rows
      ...rows.map((row, rowIndex) => {
        const fillColor = zebraStripe && rowIndex % 2 === 1 ? Colors.tableZebraBg : Colors.white;

        return new TableRow({
          children: row.map((cell, cellIndex) =>
            new TableCell({
              width: { size: columnWidths[cellIndex], type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: fillColor },
              borders: thinBorders,
              margins: {
                top: cellPadding,
                bottom: cellPadding,
                left: cellPadding,
                right: cellPadding,
              },
              verticalAlign: VerticalAlign.TOP,
              children: [
                new Paragraph({
                  spacing: { before: 0, after: 0 },
                  children: [
                    new TextRun({
                      text: sanitizeText(cell || "-"),
                      font: Fonts.primary,
                      size: toHalfPoints(FontSizes.tableBody),
                      color: Colors.text,
                    }),
                  ],
                }),
              ],
            })
          ),
        });
      }),
    ],
  });

  elements.push(table);

  return elements;
};

/**
 * Create a simple key-value table (two columns).
 * Useful for metadata, properties, or attribute listings.
 */
export const keyValueTable = (
  pairs: Array<{ key: string; value: string }>,
  keyWidth: number = 30
): (Paragraph | Table)[] => {
  return dataTable({
    headers: ["Field", "Value"],
    rows: pairs.map((p) => [p.key, p.value]),
    columnWidths: [keyWidth, 100 - keyWidth],
    zebraStripe: true,
  });
};

// ============================================================================
// BOXED CONTENT PRIMITIVES
// ============================================================================

/**
 * Options for boxed content creation.
 */
export interface BoxedContentOptions {
  /** Box title (optional) */
  title?: string;
  /** Content paragraphs */
  content: string[];
  /** Background color (hex without #) */
  backgroundColor?: string;
  /** Border color (hex without #) */
  borderColor?: string;
  /** Use accent left border */
  accentLeftBorder?: boolean;
}

/**
 * Create a boxed content block.
 * Useful for callouts, notes, or emphasized content.
 *
 * @example
 * boxedContent({
 *   title: "Important Note",
 *   content: ["Ensure all staff are trained on these procedures."],
 *   accentLeftBorder: true
 * })
 */
export const boxedContent = (options: BoxedContentOptions): Table => {
  const {
    title,
    content,
    backgroundColor = Colors.boxBg,
    borderColor = Colors.border,
    accentLeftBorder = false,
  } = options;

  const boxPadding = toTwips(Spacing.boxPadding);
  const standardBorder = {
    style: BorderStyle.SINGLE,
    color: borderColor,
    size: BorderWidths.thin,
  };

  const leftBorder = accentLeftBorder
    ? {
        style: BorderStyle.SINGLE,
        color: Colors.primary,
        size: BorderWidths.heavy,
      }
    : standardBorder;

  const children: Paragraph[] = [];

  // Add title if provided
  if (title) {
    children.push(
      new Paragraph({
        spacing: { before: 0, after: toTwips(Spacing.gapSm) },
        children: [
          new TextRun({
            text: sanitizeText(title),
            font: Fonts.primary,
            size: toHalfPoints(FontSizes.boxTitle),
            bold: true,
            color: Colors.primary,
          }),
        ],
      })
    );
  }

  // Add content paragraphs
  content.forEach((text, index) => {
    children.push(
      new Paragraph({
        spacing: {
          before: 0,
          after: index < content.length - 1 ? toTwips(Spacing.gapSm) : 0,
        },
        children: [
          new TextRun({
            text: sanitizeText(text),
            font: Fonts.primary,
            size: toHalfPoints(FontSizes.body),
            color: Colors.text,
          }),
        ],
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: backgroundColor },
            borders: {
              top: standardBorder,
              bottom: standardBorder,
              left: leftBorder,
              right: standardBorder,
            },
            margins: {
              top: boxPadding,
              bottom: boxPadding,
              left: boxPadding,
              right: boxPadding,
            },
            children,
          }),
        ],
      }),
    ],
  });
};

// ============================================================================
// PROCESS FLOW PRIMITIVES
// ============================================================================

/**
 * Options for a single flow step.
 */
export interface FlowStepOptions {
  /** Step number (e.g., 1, 2, 3) */
  stepNumber: number;
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Optional CCP indicator */
  isCCP?: boolean;
}

/**
 * Create a boxed process flow step.
 * Used for visualizing sequential process steps in HACCP flow diagrams.
 *
 * @example
 * flowStep({
 *   stepNumber: 1,
 *   title: "Receiving",
 *   description: "Check temperature and quality of incoming goods",
 *   isCCP: true
 * })
 */
export const flowStep = (options: FlowStepOptions): Table => {
  const { stepNumber, title, description, isCCP = false } = options;

  // Increased padding for better visual presence
  const stepPadding = toTwips(Spacing.flowStepPadding + 2);
  const backgroundColor = isCCP ? "FEF3C7" : Colors.flowStepBg; // Amber tint for CCP
  const borderColor = isCCP ? Colors.warning : Colors.borderAccent;

  const children: Paragraph[] = [
    // Step number and title line
    new Paragraph({
      spacing: { before: 0, after: isCCP || description ? toTwips(Spacing.gapXs) : 0 },
      children: [
        new TextRun({
          text: `Step ${stepNumber}: `,
          font: Fonts.primary,
          size: toHalfPoints(FontSizes.flowStep),
          bold: true,
          color: Colors.textSecondary,
        }),
        new TextRun({
          text: sanitizeText(title),
          font: Fonts.primary,
          size: toHalfPoints(FontSizes.flowStep),
          bold: true,
          color: Colors.text,
        }),
      ],
    }),
  ];

  // CCP indicator on separate line for better visibility (badge-like)
  if (isCCP) {
    children.push(
      new Paragraph({
        spacing: { before: 0, after: description ? toTwips(Spacing.gapXs) : 0 },
        children: [
          new TextRun({
            text: "• Critical Control Point (CCP)",
            font: Fonts.primary,
            size: toHalfPoints(FontSizes.small),
            bold: true,
            color: Colors.warning,
          }),
        ],
      })
    );
  }

  // Add description if provided
  if (description) {
    children.push(
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({
            text: sanitizeText(description),
            font: Fonts.primary,
            size: toHalfPoints(FontSizes.small),
            color: Colors.textSecondary,
          }),
        ],
      })
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: backgroundColor },
            borders: {
              top: { style: BorderStyle.SINGLE, color: borderColor, size: BorderWidths.normal },
              bottom: { style: BorderStyle.SINGLE, color: borderColor, size: BorderWidths.normal },
              left: { style: BorderStyle.SINGLE, color: borderColor, size: BorderWidths.thick },
              right: { style: BorderStyle.SINGLE, color: borderColor, size: BorderWidths.normal },
            },
            margins: {
              top: stepPadding,
              bottom: stepPadding,
              left: stepPadding,
              right: stepPadding,
            },
            children,
          }),
        ],
      }),
    ],
  });
};

/**
 * Create a flow arrow indicator between process steps.
 * Renders a downward arrow symbol with surrounding spacing.
 *
 * @example
 * // Between two flow steps:
 * flowStep({ stepNumber: 1, title: "Receiving" }),
 * flowArrow(),
 * flowStep({ stepNumber: 2, title: "Storage" })
 */
export const flowArrow = (): Paragraph => {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: {
      // Reduced spacing for tighter visual grouping
      before: toTwips(Spacing.gapXs),
      after: toTwips(Spacing.gapXs),
    },
    children: [
      new TextRun({
        text: "\u2193", // Unicode down arrow
        font: Fonts.primary,
        size: toHalfPoints(16), // Slightly smaller for compactness
        bold: true,
        color: Colors.primary,
      }),
    ],
  });
};

/**
 * Create a horizontal flow arrow (for side-by-side layouts).
 */
export const flowArrowHorizontal = (): Paragraph => {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: {
      before: toTwips(Spacing.gapSm),
      after: toTwips(Spacing.gapSm),
    },
    children: [
      new TextRun({
        text: "\u2192", // Unicode right arrow
        font: Fonts.primary,
        size: toHalfPoints(18),
        bold: true,
        color: Colors.primary,
      }),
    ],
  });
};

/**
 * Create a decision point arrow (for branching flows).
 */
export const flowArrowBranch = (direction: "left" | "right" | "both"): Paragraph => {
  const arrowMap = {
    left: "\u2190",  // Left arrow
    right: "\u2192", // Right arrow
    both: "\u2194",  // Bidirectional arrow
  };

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: {
      before: toTwips(Spacing.gapSm),
      after: toTwips(Spacing.gapSm),
    },
    children: [
      new TextRun({
        text: arrowMap[direction],
        font: Fonts.primary,
        size: toHalfPoints(16),
        bold: true,
        color: Colors.textSecondary,
      }),
    ],
  });
};

// ============================================================================
// PROCESS FLOW BUILDER
// ============================================================================

/**
 * Options for building a complete process flow diagram.
 */
export interface ProcessFlowOptions {
  /** Array of flow steps */
  steps: FlowStepOptions[];
  /** Include section heading */
  title?: string;
  /** Include intro paragraph */
  intro?: string;
}

/**
 * Build a complete process flow diagram with steps and arrows.
 * Automatically handles spacing and arrow insertion between steps.
 *
 * @example
 * processFlowDiagram({
 *   title: "Production Process Flow",
 *   intro: "The following diagram shows the key process steps.",
 *   steps: [
 *     { stepNumber: 1, title: "Receiving", description: "Incoming goods check" },
 *     { stepNumber: 2, title: "Storage", description: "Temperature-controlled" },
 *     { stepNumber: 3, title: "Cooking", description: "Heat to 75C core", isCCP: true },
 *   ]
 * })
 */
export const processFlowDiagram = (options: ProcessFlowOptions): (Paragraph | Table)[] => {
  const { steps, title, intro } = options;
  const elements: (Paragraph | Table)[] = [];

  // Add title if provided
  if (title) {
    elements.push(subsectionHeading({ text: title }));
  }

  // Add intro if provided
  if (intro) {
    elements.push(introParagraph({ text: intro, italic: true }));
  }

  // Add spacer before flow content
  elements.push(spacerParagraph(Spacing.gapMd));

  // Build flow with arrows between steps
  steps.forEach((step, index) => {
    elements.push(flowStep(step));

    // Add arrow between steps (not after last step)
    if (index < steps.length - 1) {
      elements.push(flowArrow());
    }
  });

  // Add spacer after flow content
  elements.push(spacerParagraph(Spacing.gapMd));

  return elements;
};

// ============================================================================
// SIGNATURE LINE PRIMITIVES
// ============================================================================

/**
 * Options for signature line creation.
 */
export interface SignatureLineOptions {
  /** Left label (e.g., "Prepared by") */
  leftLabel: string;
  /** Right label (e.g., "Approved by") */
  rightLabel: string;
  /** Line width percentage for each signature area */
  lineWidth?: number;
}

/**
 * Create a dual signature line block.
 * Used for document sign-off areas.
 */
export const signatureLines = (options: SignatureLineOptions): Table => {
  const { leftLabel, rightLabel, lineWidth = 50 } = options;
  const cellPadding = toTwips(Spacing.gapMd);

  const createSignatureCell = (label: string, width: number): TableCell => {
    return new TableCell({
      width: { size: width, type: WidthType.PERCENTAGE },
      borders: noBorders,
      margins: { top: cellPadding, bottom: cellPadding, left: 0, right: cellPadding },
      children: [
        new Paragraph({
          spacing: { before: toTwips(20), after: 0 },
          border: {
            top: {
              style: BorderStyle.SINGLE,
              color: Colors.text,
              size: BorderWidths.thin,
              space: 1,
            },
          },
          children: [
            new TextRun({
              text: sanitizeText(label),
              font: Fonts.primary,
              size: toHalfPoints(FontSizes.body),
              color: Colors.text,
            }),
          ],
        }),
      ],
    });
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          createSignatureCell(leftLabel, lineWidth),
          createSignatureCell(rightLabel, 100 - lineWidth),
        ],
      }),
    ],
  });
};

// ============================================================================
// LIST PRIMITIVES
// ============================================================================

/**
 * Create a bullet list from items.
 */
export const bulletList = (items: string[]): Paragraph[] => {
  return items.map(
    (item) =>
      new Paragraph({
        bullet: { level: 0 },
        spacing: { after: toTwips(Spacing.gapXs) },
        children: [
          new TextRun({
            text: sanitizeText(item),
            font: Fonts.primary,
            size: toHalfPoints(FontSizes.body),
            color: Colors.text,
          }),
        ],
      })
  );
};

/**
 * Create a numbered list from items.
 */
export const numberedList = (items: string[]): Paragraph[] => {
  return items.map(
    (item, index) =>
      new Paragraph({
        spacing: { after: toTwips(Spacing.gapXs) },
        children: [
          new TextRun({
            text: `${index + 1}. `,
            font: Fonts.primary,
            size: toHalfPoints(FontSizes.body),
            bold: true,
            color: Colors.textSecondary,
          }),
          new TextRun({
            text: sanitizeText(item),
            font: Fonts.primary,
            size: toHalfPoints(FontSizes.body),
            color: Colors.text,
          }),
        ],
      })
  );
};

// ============================================================================
// COMPOSITE SECTION BUILDER
// ============================================================================

/**
 * Options for building a complete document section.
 */
export interface SectionBuilderOptions {
  /** Section title */
  title: string;
  /** Section number prefix */
  number?: string;
  /** Optional intro paragraph */
  intro?: string;
  /** Content elements to include */
  content: (Paragraph | Table)[];
}

/**
 * Build a complete document section with proper spacing and structure.
 * Automatically handles heading-to-content spacing.
 *
 * @example
 * buildSection({
 *   title: "Critical Control Points",
 *   number: "4.",
 *   intro: "The following CCPs have been identified.",
 *   content: [
 *     ...dataTable({ headers: [...], rows: [...], columnWidths: [...] }),
 *   ]
 * })
 */
export const buildSection = (options: SectionBuilderOptions): (Paragraph | Table)[] => {
  const { title, number, intro, content } = options;
  const elements: (Paragraph | Table)[] = [];

  // Add section heading
  elements.push(sectionHeading({ text: title, number }));

  // Add intro if provided - this acts as the anchor to keep heading with content
  // If no intro, tables in content should use their own introText option
  if (intro) {
    elements.push(introParagraph({ text: intro }));
  }

  // Add content
  elements.push(...content);

  return elements;
};

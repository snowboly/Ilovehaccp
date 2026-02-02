/**
 * DOCX Design System
 * ===================
 * Centralized design tokens for HACCP document generation.
 *
 * This file contains all visual constants: colors, typography, spacing,
 * and borders. Use these tokens exclusively to ensure consistent styling
 * across all DOCX exports.
 *
 * Design Philosophy:
 * - Minimal-modern aesthetic suitable for regulatory documents
 * - High readability with clear visual hierarchy
 * - Professional appearance that inspires confidence in auditors
 * - System fonts only (Calibri) for universal compatibility
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

/**
 * Core color palette for HACCP documents.
 * Designed for professional regulatory document aesthetics.
 */
export const Colors = {
  // Primary brand colors
  primary: "1F4FD8",        // Deep blue - headings, accents
  primaryLight: "3B82F6",   // Lighter blue - secondary accents

  // Background colors
  white: "FFFFFF",
  lightBg: "F8FAFC",        // Subtle background for sections
  sectionBg: "EEF2FF",      // Section header background
  tableHeaderBg: "F1F5F9",  // Table header background
  tableZebraBg: "FAFCFE",   // Alternating row background (very subtle)
  boxBg: "F9FAFB",          // Boxed content background
  flowStepBg: "EFF6FF",     // Process flow step background

  // Border colors
  border: "E2E8F0",         // Standard border
  borderLight: "F1F5F9",    // Light border for subtle separation
  borderAccent: "3B82F6",   // Accent border for emphasis

  // Text colors
  text: "1F2937",           // Primary text
  textSecondary: "4B5563",  // Secondary text
  muted: "6B7280",          // Muted/caption text
  textInverse: "FFFFFF",    // Text on dark backgrounds

  // Semantic colors
  success: "059669",        // Green - passed, complete
  warning: "D97706",        // Amber - caution, attention
  danger: "DC2626",         // Red - critical, error
  info: "0284C7",           // Blue - informational
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

/**
 * Font family configuration.
 * Uses system fonts only for maximum compatibility.
 */
export const Fonts = {
  // Primary font family - Calibri is universally available in Word
  primary: "Calibri",

  // Fallback font family (if Calibri unavailable)
  fallback: "Arial",

  // Monospace for code/technical content
  mono: "Consolas",
} as const;

/**
 * Font sizes in half-points (DOCX standard).
 * Multiply by 2 when using with docx library TextRun size property.
 *
 * Example: FontSizes.body (10) becomes 20 half-points in docx.
 */
export const FontSizes = {
  // Display sizes (cover page)
  display: 28,              // 56 half-points - main document title
  displaySub: 18,           // 36 half-points - subtitle

  // Heading sizes
  h1: 16,                   // 32 half-points - section titles
  h2: 13,                   // 26 half-points - subsection titles
  h3: 11,                   // 22 half-points - minor headings

  // Body text sizes
  body: 10,                 // 20 half-points - standard body text
  small: 9,                 // 18 half-points - captions, footnotes
  tiny: 8,                  // 16 half-points - footer, metadata

  // Table sizes
  tableHeader: 10,          // 20 half-points - table header cells
  tableBody: 9,             // 18 half-points - table body cells

  // Special sizes
  flowStep: 10,             // Process flow step text
  boxTitle: 11,             // Boxed content title
} as const;

/**
 * Line heights as Word line spacing values.
 * Word uses 240 twips = single line spacing.
 *
 * These are multipliers for the 240 base value.
 */
export const LineHeights = {
  tight: 1.0,               // 240 twips - compact
  normal: 1.15,             // 276 twips - standard
  relaxed: 1.35,            // 324 twips - comfortable reading
  loose: 1.5,               // 360 twips - spacious
} as const;

// ============================================================================
// SPACING
// ============================================================================

/**
 * Spacing values in points.
 * Convert to twips by multiplying by 20 (1 point = 20 twips).
 */
export const Spacing = {
  // Page margins
  pageMargin: 56,           // 1120 twips - standard page margin
  pageMarginNarrow: 40,     // 800 twips - narrow margin variant

  // Section spacing
  sectionGap: 24,           // Space between major sections
  subsectionGap: 16,        // Space between subsections

  // Paragraph spacing
  paragraphAfter: 10,       // Standard after-paragraph spacing
  paragraphBefore: 6,       // Standard before-paragraph spacing

  // Heading spacing
  headingBefore: 18,        // Space before headings
  headingAfter: 8,          // Space after headings
  subheadingBefore: 14,     // Space before subheadings
  subheadingAfter: 6,       // Space after subheadings

  // Table spacing
  tableMarginTop: 8,        // Space before tables
  tableMarginBottom: 12,    // Space after tables
  tableCellPadding: 6,      // Internal cell padding
  tableCellPaddingTight: 4, // Compact cell padding

  // Content gaps
  gapXs: 4,                 // Extra small gap
  gapSm: 6,                 // Small gap
  gapMd: 10,                // Medium gap
  gapLg: 14,                // Large gap
  gapXl: 20,                // Extra large gap

  // Box/flow content
  boxPadding: 12,           // Boxed content internal padding
  flowStepPadding: 5,       // Process flow step padding (compact)
  flowArrowGap: 4,          // Gap around flow arrows
} as const;

// ============================================================================
// BORDERS
// ============================================================================

/**
 * Border widths in eighths of a point (DOCX standard).
 * 8 = 1 point, 4 = 0.5 point, etc.
 */
export const BorderWidths = {
  none: 0,
  hairline: 2,              // 0.25pt - very subtle
  thin: 4,                  // 0.5pt - standard light border
  normal: 8,                // 1pt - standard border
  medium: 12,               // 1.5pt - medium emphasis
  thick: 16,                // 2pt - strong emphasis
  heavy: 24,                // 3pt - maximum emphasis
} as const;

// ============================================================================
// DOCUMENT STRUCTURE
// ============================================================================

/**
 * Page configuration for A4 documents.
 * All values in twips (1 inch = 1440 twips).
 */
export const PageConfig = {
  // A4 dimensions
  width: 11906,             // 210mm in twips
  height: 16838,            // 297mm in twips

  // Default margins (1 inch = 1440 twips)
  marginTop: 1120,          // ~0.78 inch
  marginBottom: 1120,
  marginLeft: 1120,
  marginRight: 1120,

  // Header/footer distances
  headerDistance: 720,      // 0.5 inch from edge
  footerDistance: 720,
} as const;

// ============================================================================
// UTILITY CONVERTERS
// ============================================================================

/**
 * Convert points to twips.
 * Word uses twips internally (1 point = 20 twips).
 */
export const toTwips = (points: number): number => Math.round(points * 20);

/**
 * Convert inches to twips.
 * 1 inch = 1440 twips.
 */
export const inchesToTwips = (inches: number): number => Math.round(inches * 1440);

/**
 * Convert millimeters to twips.
 * 1mm = 56.69 twips (approximately).
 */
export const mmToTwips = (mm: number): number => Math.round(mm * 56.69);

/**
 * Convert font size to half-points (docx TextRun size format).
 * Font sizes in docx are measured in half-points.
 */
export const toHalfPoints = (points: number): number => points * 2;

/**
 * Calculate line spacing value for Word.
 * Word uses 240 twips as the base for single line spacing.
 */
export const toLineSpacing = (multiplier: number): number => Math.round(240 * multiplier);

// ============================================================================
// THEME PRESETS
// ============================================================================

/**
 * Modern Professional theme preset.
 * Clean, minimal design suitable for regulatory documents.
 */
export const ModernProfessionalTheme = {
  name: "modern-professional",

  colors: {
    primary: Colors.primary,
    accent: Colors.primaryLight,
    background: Colors.white,
    sectionBackground: Colors.sectionBg,
    text: Colors.text,
    muted: Colors.muted,
    border: Colors.border,
    tableHeader: Colors.tableHeaderBg,
  },

  typography: {
    fontFamily: Fonts.primary,
    headingSize: FontSizes.h1,
    subheadingSize: FontSizes.h2,
    bodySize: FontSizes.body,
    lineHeight: LineHeights.normal,
  },

  spacing: {
    sectionGap: Spacing.sectionGap,
    paragraphGap: Spacing.paragraphAfter,
    tablePadding: Spacing.tableCellPadding,
  },

  borders: {
    standard: BorderWidths.thin,
    emphasis: BorderWidths.medium,
  },
} as const;

/**
 * Audit Classic theme preset.
 * Traditional, formal design for official audit documents.
 */
export const AuditClassicTheme = {
  name: "audit-classic",

  colors: {
    primary: "1B2A4A",       // Navy dark
    accent: "2E6DB4",        // Classic blue
    background: Colors.white,
    sectionBackground: "F5F7FA",
    text: Colors.text,
    muted: Colors.muted,
    border: "D1D5DB",
    tableHeader: "E5E7EB",
  },

  typography: {
    fontFamily: Fonts.primary,
    headingSize: FontSizes.h1,
    subheadingSize: FontSizes.h2,
    bodySize: FontSizes.body,
    lineHeight: LineHeights.normal,
  },

  spacing: {
    sectionGap: Spacing.sectionGap,
    paragraphGap: Spacing.paragraphAfter,
    tablePadding: Spacing.tableCellPadding,
  },

  borders: {
    standard: BorderWidths.thin,
    emphasis: BorderWidths.normal,
  },
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ThemeColors = typeof ModernProfessionalTheme.colors;
export type ThemeTypography = typeof ModernProfessionalTheme.typography;
export type ThemeSpacing = typeof ModernProfessionalTheme.spacing;
export type ThemeBorders = typeof ModernProfessionalTheme.borders;

export type DocxTheme = {
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borders: ThemeBorders;
};

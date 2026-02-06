/**
 * Minneapolis-style PDF Renderer
 * Matches the DOCX template structure exactly (Sections 1-8)
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';
import type { FontSource } from '@react-pdf/font';
import fs from 'fs';
import path from 'path';
import { TemplateData, ProcessStep, PRPProgram, HazardAnalysisRow, CCPRow, CCPDecisionRow } from './buildTemplateData';

// Register fonts
const fontsDir = path.join(process.cwd(), 'public/fonts');
const robotoFonts: FontSource[] = [
  { src: path.join(fontsDir, 'Roboto-Regular.ttf'), fontWeight: 'normal', fontStyle: 'normal' },
  { src: path.join(fontsDir, 'Roboto-Bold.ttf'), fontWeight: 'bold', fontStyle: 'normal' },
  { src: path.join(fontsDir, 'Roboto-Italic.ttf'), fontWeight: 'normal', fontStyle: 'italic' },
];
const hasAllRobotoFonts = robotoFonts.every((font) => fs.existsSync(font.src));
let baseFontFamily: 'Roboto' | 'Helvetica' = 'Helvetica';

if (hasAllRobotoFonts) {
  try {
    Font.register({ family: 'Roboto', fonts: robotoFonts });
    baseFontFamily = 'Roboto';
  } catch {
    // Fallback to Helvetica
  }
}

// Minneapolis Theme Colors
const THEME = {
  navy: '#1B365D',
  blue: '#2E6DB4',
  lightBlue: '#E8F4FC',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  text: '#1F2937',
  white: '#FFFFFF',
  red: '#CC0000',
};

// Sanitize text for PDF
function sanitizeText(text: string | undefined | null): string {
  if (!text) return '-';
  return String(text)
    .replace(/[\u200B\u200C\u200D\u00AD\uFEFF\u2060\u180E]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim() || '-';
}

// Styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 70,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontFamily: baseFontFamily,
    fontSize: 10,
    color: THEME.text,
  },
  coverPage: {
    padding: 40,
    fontFamily: baseFontFamily,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: THEME.blue,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 9,
    color: THEME.navy,
    fontWeight: 'bold',
  },
  headerDate: {
    fontSize: 9,
    color: THEME.gray,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: THEME.gray,
  },

  // Cover elements
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.navy,
    textAlign: 'center',
    marginBottom: 10,
  },
  coverSubtitle: {
    fontSize: 14,
    color: THEME.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  coverMeta: {
    width: '80%',
    marginTop: 30,
  },
  coverLogo: {
    width: 140,
    height: 140,
    marginBottom: 16,
    objectFit: 'contain',
  },
  coverMetaRow: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.gray,
    paddingBottom: 4,
  },
  coverMetaLabel: {
    width: '35%',
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.navy,
  },
  coverMetaValue: {
    width: '65%',
    fontSize: 10,
    color: THEME.text,
  },

  // Section header
  sectionHeader: {
    backgroundColor: THEME.navy,
    padding: 8,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.white,
    textTransform: 'uppercase',
  },

  // Subsection header
  subsectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.blue,
    marginTop: 12,
    marginBottom: 6,
  },

  // Paragraph
  paragraph: {
    fontSize: 10,
    marginBottom: 8,
    lineHeight: 1.4,
    color: THEME.text,
  },
  paragraphItalic: {
    fontSize: 10,
    marginBottom: 8,
    lineHeight: 1.4,
    fontStyle: 'italic',
    color: THEME.gray,
  },

  // Table styles
  table: {
    marginBottom: 12,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: THEME.lightBlue,
    borderBottomWidth: 1,
    borderBottomColor: THEME.blue,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.lightGray,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: THEME.lightGray,
    backgroundColor: '#FAFAFA',
  },
  tableCell: {
    padding: 6,
    fontSize: 9,
  },
  tableCellHeader: {
    padding: 6,
    fontSize: 9,
    fontWeight: 'bold',
    color: THEME.navy,
  },

  // Process flow diagram (box style)
  flowBox: {
    backgroundColor: THEME.lightBlue,
    borderWidth: 1,
    borderColor: THEME.blue,
    padding: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  flowBoxText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.navy,
    textAlign: 'center',
  },
  flowArrow: {
    fontSize: 16,
    color: THEME.blue,
    textAlign: 'center',
    marginVertical: 2,
  },

  // Watermark
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  watermarkInner: {
    transform: 'rotate(-45deg)',
    opacity: 0.15,
  },
  watermarkText: {
    fontSize: 72,
    color: THEME.red,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
  },
  watermarkTextSmall: {
    fontSize: 32,
    color: THEME.red,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
});

// Watermark Component
const Watermark = ({ isPaid }: { isPaid: boolean }) => {
  if (isPaid) return null;

  return (
    <View style={styles.watermarkContainer} fixed>
      <View style={styles.watermarkInner}>
        <Text style={styles.watermarkText}>DRAFT</Text>
        <Text style={styles.watermarkTextSmall}>iLoveHACCP Free Edition</Text>
      </View>
    </View>
  );
};

// Header Component
const Header = ({ businessName, date }: { businessName: string; date: string }) => (
  <View style={styles.header} fixed>
    <Text style={styles.headerTitle}>HACCP Plan - {sanitizeText(businessName)}</Text>
    <Text style={styles.headerDate}>{sanitizeText(date)}</Text>
  </View>
);

// Footer Component
const Footer = ({ version }: { version: string }) => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>Version: {sanitizeText(version)}</Text>
    <Text
      style={styles.footerText}
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
    />
  </View>
);

// Section Header Component
const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{sanitizeText(title)}</Text>
  </View>
);

// Subsection Header Component
const SubsectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.subsectionHeader}>{sanitizeText(title)}</Text>
);

// Table Component
interface TableProps {
  headers: string[];
  rows: string[][];
  colWidths: number[];
  colAlignments?: Array<'left' | 'center' | 'right'>;
}

const Table = ({ headers, rows, colWidths, colAlignments = [] }: TableProps) => (
  <View style={styles.table}>
    <View style={styles.tableHeaderRow}>
      {headers.map((header, i) => (
        <Text
          key={i}
          style={[
            styles.tableCellHeader,
            { width: `${colWidths[i]}%`, textAlign: colAlignments[i] || 'left' },
          ]}
        >
          {sanitizeText(header)}
        </Text>
      ))}
    </View>
    {rows.map((row, rowIndex) => (
      <View
        key={rowIndex}
        style={rowIndex % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
      >
        {row.map((cell, cellIndex) => (
          <Text
            key={cellIndex}
            style={[
              styles.tableCell,
              {
                width: `${colWidths[cellIndex] || 20}%`,
                textAlign: colAlignments[cellIndex] || 'left',
              },
            ]}
          >
            {sanitizeText(cell)}
          </Text>
        ))}
      </View>
    ))}
  </View>
);

// Process Flow Diagram Component
const ProcessFlowDiagram = ({ steps }: { steps: ProcessStep[] }) => {
  if (steps.length === 0) {
    return <Text style={styles.paragraphItalic}>Process flow diagram to be documented.</Text>;
  }

  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      {steps.map((step, index) => (
        <React.Fragment key={step.step_number}>
          <View style={[styles.flowBox, { width: '60%' }]}>
            <Text style={styles.flowBoxText}>
              {step.step_number}. {sanitizeText(step.step_name)}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <Text style={styles.flowArrow}>↓</Text>
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

// Cover Page Component
const CoverPage = ({ data }: { data: TemplateData }) => (
  <Page size="A4" style={styles.coverPage}>
    <Watermark isPaid={data.is_paid} />

    {data.has_logo && data.logo && (
      <Image style={styles.coverLogo} src={data.logo as any} />
    )}

    <Text style={styles.coverTitle}>HACCP PLAN</Text>
    <Text style={styles.coverSubtitle}>{sanitizeText(data.business_name)}</Text>

    <View style={styles.coverMeta}>
      <View style={styles.coverMetaRow}>
        <Text style={styles.coverMetaLabel}>Product:</Text>
        <Text style={styles.coverMetaValue}>{sanitizeText(data.product_name)}</Text>
      </View>
      <View style={styles.coverMetaRow}>
        <Text style={styles.coverMetaLabel}>Date:</Text>
        <Text style={styles.coverMetaValue}>{sanitizeText(data.date)}</Text>
      </View>
      <View style={styles.coverMetaRow}>
        <Text style={styles.coverMetaLabel}>Version:</Text>
        <Text style={styles.coverMetaValue}>{sanitizeText(data.version)}</Text>
      </View>
      <View style={styles.coverMetaRow}>
        <Text style={styles.coverMetaLabel}>Created By:</Text>
        <Text style={styles.coverMetaValue}>________________________</Text>
      </View>
      <View style={styles.coverMetaRow}>
        <Text style={styles.coverMetaLabel}>Approved By:</Text>
        <Text style={styles.coverMetaValue}>________________________</Text>
      </View>
    </View>
  </Page>
);

// Content Pages Component
const ContentPages = ({ data }: { data: TemplateData }) => (
  <Page size="A4" style={styles.page} wrap>
    <Watermark isPaid={data.is_paid} />
    <Header businessName={data.business_name} date={data.date} />

    {/* SECTION 1 - HACCP TEAM & SCOPE */}
    <SectionHeader title="SECTION 1 - HACCP TEAM & SCOPE" />
    {data.has_haccp_team && (
      <Table
        headers={['Name', 'Role / Job Title', 'Competence / Qualifications']}
        rows={data.haccp_team.map((m) => [m.member_name, m.member_role, m.member_competence])}
        colWidths={[30, 35, 35]}
      />
    )}
    <Text style={styles.paragraph}>{sanitizeText(data.team_scope_summary)}</Text>

    {/* SECTION 2 - PRODUCT DESCRIPTION */}
    <SectionHeader title="SECTION 2 - PRODUCT DESCRIPTION" />
    <Table
      headers={['Field', 'Details']}
      rows={[
        ['Product Name', data.product_name],
        ['Category', data.product_category],
        ['Key Ingredients', data.ingredients],
        ['Allergens', data.allergens],
        ['Packaging', data.packaging],
        ['Shelf Life', data.shelf_life],
        ['Storage Conditions', data.storage_conditions],
        ['Intended Use', data.intended_use],
        ['Intended Consumer', data.intended_consumer],
      ]}
      colWidths={[30, 70]}
    />

    {data.allergens_present !== '-' && (
      <Table
        headers={['Field', 'Details']}
        rows={[
          ['Allergens Present', data.allergens_present],
        ]}
        colWidths={[30, 70]}
      />
    )}

    {/* SECTION 3 - PREREQUISITE PROGRAMS (PRPs) */}
    <SectionHeader title="SECTION 3 - PREREQUISITE PROGRAMS (PRPs)" />
    {data.has_prp_programs ? (
      <Table
        headers={['Program', 'In Place', 'Documented', 'Reference']}
        rows={data.prp_programs.map((prp: PRPProgram) => [
          prp.program,
          prp.exists,
          prp.documented,
          prp.reference,
        ])}
        colWidths={[35, 15, 15, 35]}
      />
    ) : (
      <Text style={styles.paragraphItalic}>Prerequisite programs to be documented.</Text>
    )}

    {/* SECTION 4 - PROCESS FLOW */}
    <SectionHeader title="SECTION 4 - PROCESS FLOW" />

    <SubsectionHeader title="4.1 Process Flow Diagram" />
    <ProcessFlowDiagram steps={data.process_steps} />
    <Text style={styles.paragraphItalic}>
      Note: A visual process flow diagram should be maintained on-site and reviewed by the HACCP team during each plan revision.
    </Text>

    <SubsectionHeader title="4.2 Process Steps Description" />
    {data.has_process_steps ? (
      <Table
        headers={['Step No.', 'Step Name', 'Description']}
        rows={data.process_steps.map((step: ProcessStep) => [
          String(step.step_number),
          step.step_name,
          step.step_description || 'Description to be completed by the food business.',
        ])}
        colWidths={[8, 20, 72]}
        colAlignments={['center', 'center', 'left']}
      />
    ) : (
      <Text style={styles.paragraphItalic}>Process steps to be documented.</Text>
    )}

    {data.process_description && data.process_description !== '-' && (
      <>
        <SubsectionHeader title="Process Narrative" />
        <Text style={styles.paragraph}>{sanitizeText(data.process_description)}</Text>
      </>
    )}

    {/* SECTION 5 - HAZARD ANALYSIS & CCP DETERMINATION */}
    <SectionHeader title="SECTION 5 - HAZARD ANALYSIS & CCP DETERMINATION" />
    {data.has_hazard_analysis ? (
      <>
        <SubsectionHeader title="Table 5A — Hazard Identification" />
        <Table
          headers={['Step', 'Hazard', 'Type']}
          rows={data.hazard_analysis.map((h: HazardAnalysisRow) => [
            h.step,
            h.hazard,
            h.hazard_type,
          ])}
          colWidths={[20, 55, 25]}
        />

        <SubsectionHeader title="Table 5B — Risk & Controls" />
        <Table
          headers={['Step', 'Sev.', 'Lik.', 'Sig?', 'Control Measure']}
          rows={data.hazard_analysis.map((h: HazardAnalysisRow) => [
            h.step,
            h.severity,
            h.likelihood,
            h.significant,
            h.control_measure,
          ])}
          colWidths={[20, 10, 10, 12, 48]}
        />

        {/* Control Measure Descriptions */}
        {data.hazard_analysis.some((h: HazardAnalysisRow) => h.control_measure_description && h.control_measure_description !== '-') && (
          <>
            <SubsectionHeader title="Control Measure Descriptions" />
            <Table
              headers={['Step', 'Control Measure Description']}
              rows={data.hazard_analysis
                .filter((h: HazardAnalysisRow) => h.control_measure_description && h.control_measure_description !== '-')
                .map((h: HazardAnalysisRow) => [h.step, h.control_measure_description])}
              colWidths={[25, 75]}
            />
          </>
        )}
      </>
    ) : (
      <Text style={styles.paragraphItalic}>Hazard analysis to be completed.</Text>
    )}
    {/* CCP Determination — Decision Tree */}
    <SubsectionHeader title="5.3 CCP Determination — Codex Decision Tree" />
    {data.has_ccp_decisions ? (
      <>
        <Text style={styles.paragraphItalic}>
          Q1: Control measure exists? Q2: Step designed to eliminate? Q3: Contamination could increase? Q4: Subsequent step eliminates?
        </Text>
        <Table
          headers={['Step', 'Hazard', 'Q1', 'Q2', 'Q3', 'Q4', 'Outcome']}
          rows={data.ccp_decisions.map((d: CCPDecisionRow) => [
            d.step, d.hazard, d.q1, d.q2, d.q3, d.q4, d.outcome,
          ])}
          colWidths={[18, 22, 8, 8, 8, 8, 12]}
        />
        {data.ccp_decisions.some(
          (d: CCPDecisionRow) =>
            (d.q1_justification && d.q1_justification !== '-') ||
            (d.q2_justification && d.q2_justification !== '-') ||
            (d.q3_justification && d.q3_justification !== '-') ||
            (d.q4_justification && d.q4_justification !== '-')
        ) && (
          <>
            <Text style={styles.subsectionHeader}>Decision Tree Justifications</Text>
            <Table
              headers={['Step', 'Hazard', 'Q', 'Justification']}
              rows={data.ccp_decisions.flatMap((d: CCPDecisionRow) => {
                const rows: string[][] = [];
                if (d.q1_justification !== '-') rows.push([d.step, d.hazard, 'Q1', d.q1_justification]);
                if (d.q2_justification !== '-') rows.push([d.step, d.hazard, 'Q2', d.q2_justification]);
                if (d.q3_justification !== '-') rows.push([d.step, d.hazard, 'Q3', d.q3_justification]);
                if (d.q4_justification !== '-') rows.push([d.step, d.hazard, 'Q4', d.q4_justification]);
                return rows;
              })}
              colWidths={[16, 20, 8, 56]}
            />
          </>
        )}
      </>
    ) : (
      <Text style={styles.paragraphItalic}>
        CCP determination was performed using Codex Alimentarius decision tree methodology.
      </Text>
    )}

    {/* SECTION 6 - CCP MANAGEMENT */}
    <SectionHeader title="SECTION 6 - CCP MANAGEMENT" />
    {data.has_ccps ? (
      <>
        <SubsectionHeader title="CCP Summary" />
        <Table
          headers={['CCP', 'Step', 'Hazard', 'Critical Limit', 'Monitoring', 'Corrective Action']}
          rows={data.ccps.map((ccp: CCPRow) => [
            ccp.ccp_id,
            ccp.step,
            ccp.hazard,
            ccp.critical_limit,
            ccp.monitoring,
            ccp.corrective_action,
          ])}
          colWidths={[8, 14, 18, 20, 20, 20]}
        />
        {data.ccps.some((ccp: CCPRow) => ccp.monitoring_instrument !== '-' || ccp.calibration_frequency !== '-') && (
          <>
            <SubsectionHeader title="Monitoring Equipment & Calibration" />
            <Table
              headers={['CCP', 'Instrument / Equipment', 'Calibration Frequency']}
              rows={data.ccps
                .filter((ccp: CCPRow) => ccp.monitoring_instrument !== '-' || ccp.calibration_frequency !== '-')
                .map((ccp: CCPRow) => [ccp.ccp_id, ccp.monitoring_instrument, ccp.calibration_frequency])}
              colWidths={[15, 50, 35]}
            />
          </>
        )}
      </>
    ) : (
      <Text style={styles.paragraphItalic}>No CCPs identified or CCP management to be documented.</Text>
    )}

    {/* SECTION 7 - VERIFICATION & VALIDATION */}
    <SectionHeader title="SECTION 7 - VERIFICATION & VALIDATION" />
    <Text style={styles.paragraph}>{sanitizeText(data.verification_procedures)}</Text>

    {/* SECTION 8 - RECORDS & DOCUMENTATION */}
    <SectionHeader title="SECTION 8 - RECORDS & DOCUMENTATION" />
    <Text style={styles.paragraph}>{sanitizeText(data.record_keeping)}</Text>

    {/* SECTION 9 - TRACEABILITY & RECALL */}
    <SectionHeader title="SECTION 9 - TRACEABILITY & RECALL" />
    {data.has_traceability ? (
      <>
        <Text style={styles.paragraphItalic}>
          {data.traceability_intro}
        </Text>
        <SubsectionHeader title="9.1 Batch Coding & Lot Identification" />
        <Table
          headers={['Field', 'Value']}
          rows={[
            ['Batch coding method', data.traceability.batch_coding_method],
            ['Example batch code', data.traceability.batch_code_example],
          ]}
          colWidths={[40, 60]}
        />
        <SubsectionHeader title="9.2 Supply Chain Traceability" />
        <Table
          headers={['Field', 'Value']}
          rows={[
            ['Supplier traceability (one step back)', data.traceability.supplier_traceability],
            ...(data.traceability.supplier_traceability_method !== '-'
              ? [['Supplier traceability method', data.traceability.supplier_traceability_method]]
              : []),
            ['Customer traceability (one step forward)', data.traceability.customer_traceability],
            ...(data.traceability.customer_traceability_method !== '-'
              ? [['Customer traceability method', data.traceability.customer_traceability_method]]
              : []),
          ]}
          colWidths={[40, 60]}
        />
        <SubsectionHeader title="9.3 Recall & Withdrawal" />
        <Table
          headers={['Field', 'Value']}
          rows={[
            ['Recall procedure documented', data.traceability.recall_procedure_documented],
            ['Last mock recall', data.traceability.recall_last_tested],
            ['Recall coordinator', data.traceability.recall_coordinator],
          ]}
          colWidths={[40, 60]}
        />
      </>
    ) : (
      <Text style={styles.paragraphItalic}>
        Traceability and recall procedures to be documented during HACCP implementation.
        EC Regulation 178/2002 Articles 18–19 require one-step-back and one-step-forward
        traceability and documented recall/withdrawal procedures.
      </Text>
    )}

    <Footer version={data.version} />
  </Page>
);

// Main Export Component
export const MinneapolisPdfDocument = ({ data }: { data: TemplateData }) => (
  <Document>
    <CoverPage data={data} />
    <ContentPages data={data} />
  </Document>
);

export default MinneapolisPdfDocument;

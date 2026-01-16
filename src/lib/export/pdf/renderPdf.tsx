import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { renderSectionHeader } from './renderSectionHeader';
import { renderTable } from './renderTable';
import { renderFooter } from './renderFooter';

const Watermark = ({ isPaid }: { isPaid: boolean }) => {
  if (isPaid) return null;
  
  const styles = StyleSheet.create({
    watermark: {
      position: 'absolute',
      top: 300,
      left: 100,
      width: 400,
      height: 400,
      transform: 'rotate(-45deg)',
      opacity: 0.1,
      zIndex: -1
    },
    text: {
      fontSize: 60,
      color: '#000000',
      fontWeight: 'bold',
      textAlign: 'center'
    }
  });

  return (
    <View style={styles.watermark} fixed>
      <Text style={styles.text}>iLoveHACCP</Text>
      <Text style={styles.text}>Free Edition</Text>
    </View>
  );
};

export const HACCPDocumentModular = ({ data, dict, logo, theme }: any) => {
  const { fullPlan, planVersion = 1, isPaid = false } = data;
  const today = new Date().toLocaleDateString();
  const processSteps = fullPlan?._original_inputs?.process?.process_steps || [];
  const analysis = fullPlan?.hazard_analysis || [];
  const ccps = fullPlan?.ccp_summary || [];

  const styles = StyleSheet.create({
    page: {
      padding: `${theme.spacing.margin}mm`,
      fontFamily: theme.fonts.primaryFont,
      fontSize: theme.fonts.body,
      color: theme.colors.text,
    },
    coverPage: {
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      padding: `${theme.spacing.margin}mm`,
    },
    title: {
      fontSize: theme.fonts.title,
      fontWeight: 'bold',
      marginBottom: 10,
      color: theme.colors.primary,
    },
    subtitle: {
      fontSize: 16,
      marginBottom: 40,
      color: theme.colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: 2,
    },
    label: { fontWeight: 'bold' },
    text: { marginBottom: 10 }
  });

  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="A4" style={styles.coverPage}>
        <Watermark isPaid={isPaid} />
        {logo && <Image src={logo} style={{ width: 100, height: 100, marginBottom: 20 }} />}
        <Text style={styles.title}>HACCP PLAN</Text>
        <Text style={styles.subtitle}>{data.businessName}</Text>
        
        <View style={{ width: '100%', marginTop: 20 }}>
            {[
                { l: "Framework", v: "HACCP_CODEX v1.0.0" },
                { l: "Date Generated", v: today },
                { l: "Plan Version", v: `v${planVersion}` },
                { l: "Prepared by", v: "____________________" },
                { l: "Reviewed by (if applicable)", v: "____________________" },
            ].map((m, i) => (
                <View key={i} style={styles.metaRow}>
                    <Text style={styles.label}>{m.l}:</Text>
                    <Text>{m.v}</Text>
                </View>
            ))}
        </View>
      </Page>

      {/* CONTENT PAGE */}
      <Page size="A4" style={styles.page}>
        <Watermark isPaid={isPaid} />
        {renderSectionHeader("SECTION 1 — HACCP TEAM & SCOPE", theme)}
        <Text style={styles.text}>{fullPlan?.team_scope || fullPlan?.executive_summary || "Defined by operator."}</Text>

        {renderSectionHeader("SECTION 2 — PRODUCT DESCRIPTION", theme)}
        {renderTable(
            ["Field", "Description"],
            [
                ["Product Name", data.productName],
                ["Description", data.productDescription],
                ["Ingredients", data.mainIngredients || "Standard"],
                ["Storage", data.storageType],
                ["Shelf Life", data.shelfLife || "As per label"]
            ],
            ["35%", "65%"],
            theme
        )}
        
        {(fullPlan?._original_inputs?.product?.plan_scope === "A Product Family / Category" || 
          fullPlan?._original_inputs?.product?.plan_scope === "A Process Line / Technology") && (
            <Text style={{ fontSize: 9, fontStyle: 'italic', marginTop: 5, color: theme.colors.muted || '#444444' }}>
                Note: This HACCP plan applies to multiple products with similar formulations. Detailed recipes are managed under separate formulation control.
            </Text>
        )}

        {renderSectionHeader("SECTION 3 — INTENDED USE", theme)}
        <Text style={styles.text}>{fullPlan?.intended_use || data.intendedUse || "General public."}</Text>

        {renderSectionHeader("SECTION 4 — PROCESS FLOW DIAGRAM", theme)}
        {processSteps.length > 0 ? renderTable(
            ["No.", "Step Name", "Description"],
            processSteps.map((s: any, i: number) => [`${i+1}`, s.step_name, s.step_description || "-"]),
            ["10%", "30%", "60%"],
            theme
        ) : <Text>Process follows standard flow.</Text>}

        <Text style={{ fontSize: 9, fontStyle: 'italic', marginTop: 5, color: theme.colors.muted || '#444444' }}>
            Note: A visual process flow diagram, including inputs (e.g. water, packaging) and waste streams, is maintained on-site and used by the HACCP team to verify this table.
        </Text>

        {renderSectionHeader("SECTION 5 — PREREQUISITE PROGRAMS (PRPS)", theme)}
        {renderTable(
            ["Program", "Control Details"],
            (fullPlan?.prerequisite_programs || []).map((p: any) => [p.program, p.details]),
            ["30%", "70%"],
            theme
        )}

        {renderSectionHeader("SECTION 6 — HAZARD ANALYSIS", theme)}
        {renderTable(
            ["Step", "Hazard", "Sev", "Lik", "Sig?", "Control"],
            analysis.map((hazard: any) => [
                hazard.step_name, 
                hazard.hazards, 
                hazard.severity, 
                hazard.likelihood, 
                hazard.is_ccp ? "Yes" : "No", 
                hazard.control_measure
            ]),
            ["20%", "30%", "10%", "10%", "10%", "20%"],
            theme
        )}

        {renderSectionHeader("SECTION 7 — CCP DETERMINATION", theme)}
        <Text style={styles.text}>CCPs determined using Codex Decision Tree.</Text>

        {renderSectionHeader("SECTION 8 — CCP MANAGEMENT", theme)}
        {ccps.length > 0 ? (
            <>
                <Text style={{ fontWeight: 'bold', marginBottom: 5, color: theme.colors.primary }}>CCP Summary</Text>
                {renderTable(
                    ["ID", "Step", "Hazard", "Critical Limit"],
                    ccps.map((c: any, i: number) => [`CCP ${i+1}`, c.ccp_step, c.hazard, c.critical_limit]),
                    ["10%", "25%", "25%", "40%"],
                    theme
                )}

                <Text style={{ fontWeight: 'bold', marginBottom: 5, marginTop: 10, color: theme.colors.primary }}>Monitoring & Corrective Actions</Text>
                {renderTable(
                    ["ID", "Monitoring", "Freq", "Corrective Action"],
                    ccps.map((c: any, i: number) => [`CCP ${i+1}`, c.monitoring, c.frequency || "Per Batch", c.corrective_action]),
                    ["10%", "30%", "15%", "45%"],
                    theme
                )}
            </>
        ) : (
            <Text style={styles.text}>No Critical Control Points (CCPs) identified for this process scope. Hazards are controlled via Prerequisite Programs (PRPs).</Text>
        )}

        {renderSectionHeader("SECTION 9 — VERIFICATION & VALIDATION", theme)}
        <Text style={styles.text}>{fullPlan?.verification_validation || "Procedures established."}</Text>

        {renderSectionHeader("SECTION 10 — RECORDS & REVIEW", theme)}
        <Text style={styles.text}>{fullPlan?.record_keeping || "Records maintained."}</Text>

        <View style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '45%', borderTopWidth: 1, borderTopColor: theme.colors.text, paddingTop: 5 }}><Text>Prepared by: ________________</Text></View>
            <View style={{ width: '45%', borderTopWidth: 1, borderTopColor: theme.colors.text, paddingTop: 5 }}><Text>Reviewed by (if applicable): ________________</Text></View>
        </View>

        {renderFooter(theme, planVersion)}
      </Page>
    </Document>
  );
};
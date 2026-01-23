import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { renderSectionHeader } from './renderSectionHeader';
import { renderTable } from './renderTable';
import { renderFooter } from './renderFooter';
import { getQuestions } from '@/data/haccp/loader';

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
  const { fullPlan, planVersion = 1, isPaid = false, lang = 'en' } = data;
  const today = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : lang);
  const processSteps = Array.isArray(fullPlan?._original_inputs?.process?.process_steps)
    ? fullPlan._original_inputs.process.process_steps
    : [];
  const analysis = Array.isArray(fullPlan?.hazard_analysis) ? fullPlan.hazard_analysis : [];
  const ccps = Array.isArray(fullPlan?.ccp_summary) ? fullPlan.ccp_summary : [];
  const prerequisitePrograms = Array.isArray(fullPlan?.prerequisite_programs)
    ? fullPlan.prerequisite_programs
    : [];
  const originalInputs = fullPlan?._original_inputs || {};
  const productInputs = originalInputs.product || {};
  const processInputs = originalInputs.process || {};
  const prpInputs = originalInputs.prp || {};
  const hazardInputs = originalInputs.hazards || {};
  const ccpDeterminationInputs = originalInputs.ccp_determination || {};
  const ccpManagementInputs = originalInputs.ccp_management || {};
  const validationInputs = originalInputs.review_validation || originalInputs.validation || {};

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return 'Not provided';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'Not provided';
      return value
        .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
        .join('; ');
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getAnswerValue = (answers: Record<string, any>, questionId: string, parentId?: string) => {
    if (!answers) return undefined;
    if (answers[questionId] !== undefined) return answers[questionId];
    if (parentId) {
      const compoundKey = `${parentId}_${questionId}`;
      if (answers[compoundKey] !== undefined) return answers[compoundKey];
    }
    return undefined;
  };

  const buildQuestionRows = (questions: any[], answers: Record<string, any>, parentId?: string) => {
    const rows: string[][] = [];
    const repeatableTables: { title: string; headers: string[]; rows: string[][] }[] = [];
    const hazardKeysDefault = ['bio', 'chem', 'phys', 'allergen'];

    questions.forEach((q) => {
      if (q.type === 'repeatable_list' && q.item_schema?.fields) {
        const headers = q.item_schema.fields.map((f: any) => f.text || f.id);
        const items = Array.isArray(answers?.[q.id]) ? answers[q.id] : [];
        const tableRows =
          items.length > 0
            ? items.map((item: any) =>
                q.item_schema.fields.map((f: any) => formatValue(item?.[f.id]))
              )
            : [headers.map((_: any, i: number) => (i === 0 ? 'No items provided' : ''))];
        repeatableTables.push({ title: q.text, headers, rows: tableRows });
        return;
      }

      if (q.type === 'prp_group' && Array.isArray(q.fields)) {
        const groupAnswers = answers?.[q.id] || {};
        q.fields.forEach((field: any) => {
          rows.push([`${q.text} — ${field.text}`, formatValue(groupAnswers?.[field.id])]);
        });
        return;
      }

      if (q.type === 'group' && Array.isArray(q.questions)) {
        const groupAnswers = answers?.[q.id] || {};
        const nested = buildQuestionRows(q.questions, groupAnswers, q.id);
        rows.push(...nested.rows);
        repeatableTables.push(...nested.repeatableTables);
        return;
      }

      if (q.type === 'group_per_hazard' && Array.isArray(q.questions)) {
        const hazardAnswers = answers?.[q.id] || {};
        const hazardKeys = Object.keys(hazardAnswers);
        const keys = hazardKeys.length > 0 ? hazardKeys : hazardKeysDefault;

        keys.forEach((hazardKey) => {
          q.questions.forEach((subQ: any) => {
            rows.push([
              `${q.text} (${hazardKey}) — ${subQ.text}`,
              formatValue(hazardAnswers?.[hazardKey]?.[subQ.id]),
            ]);
          });
        });
        return;
      }

      rows.push([q.text, formatValue(getAnswerValue(answers, q.id, parentId))]);

      if (Array.isArray(q.conditional_questions)) {
        q.conditional_questions.forEach((subQ: any) => {
          rows.push([
            `${q.text} — ${subQ.text}`,
            formatValue(getAnswerValue(answers, subQ.id, q.id)),
          ]);
        });
      }
    });

    return { rows, repeatableTables };
  };

  const renderInputSection = (title: string, questions: any, answers: Record<string, any>) => {
    const questionList = Array.isArray(questions?.questions) ? questions.questions : [];
    const { rows, repeatableTables } = buildQuestionRows(questionList, answers);

    return (
      <>
        {renderSectionHeader(title, theme)}
        {renderTable(
          ['Question', 'Answer'],
          rows.length > 0 ? rows : [['', 'No inputs provided']],
          ['45%', '55%'],
          theme
        )}
        {repeatableTables.map((table, index) => (
          <View key={`${title}-${index}`} style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4, color: theme.colors.primary }}>
              {table.title}
            </Text>
            {renderTable(table.headers, table.rows, table.headers.map(() => `${100 / table.headers.length}%`), theme)}
          </View>
        ))}
      </>
    );
  };

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
    text: { marginBottom: 10 },
    logo: {
      width: 100,
      height: 100,
      marginBottom: 20,
      objectFit: 'contain'
    }
  });

  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="A4" style={styles.coverPage}>
        <Watermark isPaid={isPaid} />
        {logo && <Image src={logo} style={styles.logo} />}
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
            prerequisitePrograms.map((p: any) => [p.program, p.details]),
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
            <View style={{ width: '45%', borderTopWidth: 1, borderTopColor: theme.colors.text, paddingTop: 5 }}><Text>{dict.sign_prepared}: ________________</Text></View>
            <View style={{ width: '45%', borderTopWidth: 1, borderTopColor: theme.colors.text, paddingTop: 5 }}><Text>{dict.sign_approved}: ________________</Text></View>
        </View>

        {renderSectionHeader("APPENDIX — USER INPUTS", theme)}
        <Text style={styles.text}>
            The following tables list every question and response captured in the builder.
        </Text>

        {renderInputSection(
          'Product Inputs',
          getQuestions('product', lang),
          productInputs
        )}

        {renderInputSection(
          'Process Inputs',
          getQuestions('process', lang),
          processInputs
        )}

        {renderInputSection(
          'PRP Inputs',
          getQuestions('prp', lang),
          prpInputs
        )}

        {renderInputSection(
          'Hazard Analysis Inputs',
          getQuestions('hazards', lang),
          hazardInputs
        )}

        {renderInputSection(
          'CCP Determination Inputs',
          getQuestions('ccp_determination', lang),
          ccpDeterminationInputs
        )}

        {renderInputSection(
          'CCP Management Inputs',
          getQuestions('ccp_management', lang),
          ccpManagementInputs
        )}

        {renderInputSection(
          'Verification, Validation & Records Inputs',
          getQuestions('validation', lang),
          validationInputs
        )}

        {renderSectionHeader("APPENDIX — GENERATED SUMMARIES", theme)}
        {renderTable(
          ["Field", "Value"],
          [
            ["Team & Scope Summary", formatValue(fullPlan?.team_scope)],
            ["Product Description Summary", formatValue(fullPlan?.product_description)],
            ["Process Flow Narrative", formatValue(fullPlan?.process_flow_narrative)],
            ["Assumptions & Limitations", formatValue(fullPlan?.assumptions_limitations)],
            ["Next Steps", formatValue(fullPlan?.next_steps)],
            ["Auditor Review", formatValue(fullPlan?.auditor_review)],
            ["Final Disclaimer", formatValue(fullPlan?.final_disclaimer)],
            ["Benchmarking", formatValue(fullPlan?.benchmarking)],
          ],
          ["30%", "70%"],
          theme
        )}

        {renderFooter(theme, planVersion, lang)}
      </Page>
    </Document>
  );
};

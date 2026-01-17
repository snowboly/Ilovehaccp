import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType, Header, Footer, PageNumber } from "docx";
import { getWordStyles } from "./styles";
import { renderWordTable } from "./renderTable";
import { getDictionary } from "@/lib/locales";

export async function generateModularWordDocument(data: any, theme: any, lang: string = 'en'): Promise<Document> {
  const { businessName, full_plan, planVersion = 1 } = data;
  const analysis = full_plan.hazard_analysis || [];
  const ccps = full_plan.ccp_summary || [];
  const originalInputs = full_plan._original_inputs || {};
  const processSteps = originalInputs.process?.process_steps || [];
  
  const styles = getWordStyles(theme);
  const dict = getDictionary(lang as any).pdf;

  const createSectionHeader = (text: string) => new Paragraph({
      children: [new TextRun({ text, ...styles.heading1.run })],
      spacing: styles.heading1.spacing,
      shading: styles.heading1.shading,
      border: { bottom: { color: theme.colors.border.replace('#', ''), style: BorderStyle.SINGLE, size: 6 } }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
            page: {
                margin: { top: 1417, right: 1417, bottom: 1417, left: 1417 }
            }
        },
        footers: {
            default: new Footer({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: `HACCP_CODEX v1.0.0 | Plan v${planVersion} | Page `, size: theme.fonts.footer * 2 }),
                            new TextRun({ children: [PageNumber.CURRENT], size: theme.fonts.footer * 2 }),
                            new TextRun({ children: [" of ", PageNumber.TOTAL_PAGES], size: theme.fonts.footer * 2 }),
                            new TextRun({ text: ` | Lang: ${lang.toUpperCase()}`, size: theme.fonts.footer * 2 })
                        ],
                    })
                ]
            })
        },
        children: [
          // COVER
          new Paragraph({
            children: [new TextRun({ text: dict.title, font: theme.fonts.wordFont, size: theme.fonts.title * 2, bold: true, color: theme.colors.primary.replace('#', '') })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 2000, after: 600 }
          }),
          new Paragraph({
            children: [new TextRun({ text: dict.subtitle, font: theme.fonts.wordFont, size: theme.fonts.subtitle * 2 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 }
          }),
          new Paragraph({
            children: [new TextRun({ text: businessName, font: theme.fonts.wordFont, size: 28, bold: true })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 1200 }
          }),
          
          ...[
            { l: dict.standard, v: "HACCP_CODEX v1.0.0" },
            { l: dict.date_issue, v: new Date().toLocaleDateString(lang === 'en' ? 'en-US' : lang) },
            { l: "Plan Version", v: `v${planVersion}` },
          ].map(m => new Paragraph({ 
              children: [new TextRun({ text: `${m.l}: ${m.v}`, font: theme.fonts.wordFont, size: theme.fonts.body * 2 })],
              alignment: AlignmentType.CENTER 
          })),
          
          new Paragraph({ text: "", pageBreakBefore: true }),

          // SECTIONS
          createSectionHeader(dict.s1_title),
          new Paragraph({ children: [new TextRun({ text: full_plan.team_scope || full_plan.executive_summary || "Defined by operator.", ...styles.paragraph.run })] }),

          createSectionHeader(dict.s2_title),
          renderWordTable(
              ["Field", "Description"],
              [
                  [dict.lbl_product_name, data.productName],
                  [dict.lbl_description, data.productDescription],
                  [dict.lbl_ingredients, data.mainIngredients || "Standard"],
                  [dict.lbl_storage, data.storageType],
                  [dict.lbl_shelf_life, data.shelfLife || "As per label"]
              ],
              [35, 65],
              theme
          ),

          (originalInputs.product?.plan_scope === "A Product Family / Category" || 
           originalInputs.product?.plan_scope === "A Process Line / Technology") && 
          new Paragraph({
              children: [
                  new TextRun({ 
                      text: "Note: This HACCP plan applies to multiple products with similar formulations. Detailed recipes are managed under separate formulation control.",
                      italics: true,
                      size: 18, // 9pt
                      color: "444444"
                  })
              ],
              spacing: { before: 120, after: 200 }
          }) || new Paragraph({ text: "" }), // Fallback to avoid null

          createSectionHeader(dict.s3_title),
          new Paragraph({ children: [new TextRun({ text: full_plan.intended_use || data.intendedUse || "General public.", ...styles.paragraph.run })] }),

          createSectionHeader(dict.s4_title),
          processSteps.length > 0 ? renderWordTable(
              ["No.", dict.col_step, dict.lbl_description],
              processSteps.map((s: any, i: number) => [`${i+1}`, s.step_name, s.step_description || "-"]),
              [10, 30, 60],
              theme
          ) : new Paragraph({ text: "Standard flow.", ...styles.paragraph.run }),

          new Paragraph({
              children: [
                  new TextRun({ 
                      text: "Note: A visual process flow diagram, including inputs (e.g. water, packaging) and waste streams, is maintained on-site and used by the HACCP team to verify this table.",
                      italics: true,
                      size: 18, // 9pt
                      color: "444444"
                  })
              ],
              spacing: { before: 120, after: 200 }
          }),

          createSectionHeader(dict.s5_title),
          renderWordTable(
              [dict.col_program, dict.col_details],
              (full_plan.prerequisite_programs || []).map((p: any) => [p.program, p.details]),
              [30, 70],
              theme
          ),

          createSectionHeader(dict.s6_title),
          renderWordTable(
              [dict.col_step, dict.lbl_hazard, "Sev", "Lik", "Sig?", dict.col_control],
              analysis.map((hazard: any) => [
                  hazard.step_name, 
                  hazard.hazards, 
                  hazard.severity, 
                  hazard.likelihood, 
                  hazard.is_ccp ? "Yes" : "No", 
                  hazard.control_measure
              ]),
              [20, 30, 10, 10, 10, 20],
              theme
          ),

          createSectionHeader(dict.s7_title),
          new Paragraph({ children: [new TextRun({ text: dict.s7_desc, ...styles.paragraph.run })] }),

          createSectionHeader(dict.s8_title),
          ...(ccps.length > 0 ? [
              new Paragraph({ children: [new TextRun({ text: "CCP Summary", bold: true, size: theme.fonts.subsection * 2, color: theme.colors.primary.replace('#', '') })] }),
              renderWordTable(
                  ["ID", dict.col_step, dict.col_hazards, dict.lbl_critical_limit],
                  ccps.map((c: any, i: number) => [`CCP ${i+1}`, c.ccp_step, c.hazard, c.critical_limit]),
                  [10, 25, 25, 40],
                  theme
              ),
              new Paragraph({ children: [new TextRun({ text: `${dict.lbl_monitoring} & ${dict.lbl_corrective}`, bold: true, size: theme.fonts.subsection * 2, color: theme.colors.primary.replace('#', '') })], spacing: { before: 200 } }),
              renderWordTable(
                  ["ID", dict.lbl_monitoring, "Freq", dict.lbl_corrective],
                  ccps.map((c: any, i: number) => [`CCP ${i+1}`, c.monitoring, c.frequency || "Per Batch", c.corrective_action]),
                  [10, 30, 15, 45],
                  theme
              )
          ] : [
              new Paragraph({ children: [new TextRun({ text: dict.msg_no_ccps, ...styles.paragraph.run })] })
          ]),

          createSectionHeader(dict.s9_title),
          new Paragraph({ children: [new TextRun({ text: full_plan.verification_validation || "Procedures established.", ...styles.paragraph.run })] }),

          createSectionHeader(dict.s10_title),
          new Paragraph({ children: [new TextRun({ text: full_plan.record_keeping || "Records maintained.", ...styles.paragraph.run })] }),

          new Paragraph({ text: "", pageBreakBefore: true }),
          new Paragraph({ children: [new TextRun({ text: `${dict.sign_prepared}: ____________________ Date: _______`, ...styles.paragraph.run })], spacing: { before: 400, after: 400 } }),
          new Paragraph({ children: [new TextRun({ text: `${dict.sign_approved}: ____________________ Date: _______`, ...styles.paragraph.run })] }),
        ],
      },
    ],
  });

  return doc;
}
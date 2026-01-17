import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType, Header, Footer, PageNumber } from "docx";
import { getWordStyles } from "./styles";
import { renderWordTable } from "./renderTable";

export async function generateModularWordDocument(data: any, theme: any): Promise<Document> {
  const { businessName, full_plan, planVersion = 1 } = data;
  const analysis = full_plan.hazard_analysis || [];
  const ccps = full_plan.ccp_summary || [];
  const originalInputs = full_plan._original_inputs || {};
  const processSteps = originalInputs.process?.process_steps || [];
  
  const styles = getWordStyles(theme);

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
                            new TextRun({ children: [" of ", PageNumber.TOTAL_PAGES], size: theme.fonts.footer * 2 })
                        ],
                    })
                ]
            })
        },
        children: [
          // COVER
          new Paragraph({
            children: [new TextRun({ text: "HACCP PLAN", font: theme.fonts.wordFont, size: theme.fonts.title * 2, bold: true, color: theme.colors.primary.replace('#', '') })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 2000, after: 600 }
          }),
          new Paragraph({
            children: [new TextRun({ text: businessName, font: theme.fonts.wordFont, size: 28, bold: true })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 1200 }
          }),
          
          ...[
            { l: "Framework", v: "HACCP_CODEX v1.0.0" },
            { l: "Date Generated", v: new Date().toLocaleDateString() },
            { l: "Plan Version", v: `v${planVersion}` },
          ].map(m => new Paragraph({ 
              children: [new TextRun({ text: `${m.l}: ${m.v}`, font: theme.fonts.wordFont, size: theme.fonts.body * 2 })],
              alignment: AlignmentType.CENTER 
          })),
          
          new Paragraph({ text: "", pageBreakBefore: true }),

          // SECTIONS
          createSectionHeader("SECTION 1 — HACCP TEAM & SCOPE"),
          new Paragraph({ children: [new TextRun({ text: full_plan.team_scope || full_plan.executive_summary || "Defined by operator.", ...styles.paragraph.run })] }),

          createSectionHeader("SECTION 2 — PRODUCT DESCRIPTION"),
          renderWordTable(
              ["Field", "Description"],
              [
                  ["Product Name", data.productName],
                  ["Description", data.productDescription],
                  ["Ingredients", data.mainIngredients || "Standard"],
                  ["Storage", data.storageType],
                  ["Shelf Life", data.shelfLife || "As per label"]
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

          createSectionHeader("SECTION 3 — INTENDED USE"),
          new Paragraph({ children: [new TextRun({ text: full_plan.intended_use || data.intendedUse || "General public.", ...styles.paragraph.run })] }),

          createSectionHeader("SECTION 4 — PROCESS FLOW DIAGRAM"),
          processSteps.length > 0 ? renderWordTable(
              ["No.", "Step Name", "Description"],
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

          createSectionHeader("SECTION 5 — PREREQUISITE PROGRAMS (PRPS)"),
          renderWordTable(
              ["Program", "Control Details"],
              (full_plan.prerequisite_programs || []).map((p: any) => [p.program, p.details]),
              [30, 70],
              theme
          ),

          createSectionHeader("SECTION 6 — HAZARD ANALYSIS"),
          renderWordTable(
              ["Step", "Hazard", "Sev", "Lik", "Sig?", "Control"],
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

          createSectionHeader("SECTION 7 — CCP DETERMINATION"),
          new Paragraph({ children: [new TextRun({ text: "Determined using Codex Decision Tree.", ...styles.paragraph.run })] }),

          createSectionHeader("SECTION 8 — CCP MANAGEMENT"),
          ...(ccps.length > 0 ? [
              new Paragraph({ children: [new TextRun({ text: "CCP Summary", bold: true, size: theme.fonts.subsection * 2, color: theme.colors.primary.replace('#', '') })] }),
              renderWordTable(
                  ["ID", "Step", "Hazard", "Critical Limit"],
                  ccps.map((c: any, i: number) => [`CCP ${i+1}`, c.ccp_step, c.hazard, c.critical_limit]),
                  [10, 25, 25, 40],
                  theme
              ),
              new Paragraph({ children: [new TextRun({ text: "Monitoring & Corrective Actions", bold: true, size: theme.fonts.subsection * 2, color: theme.colors.primary.replace('#', '') })], spacing: { before: 200 } }),
              renderWordTable(
                  ["ID", "Monitoring", "Freq", "Corrective Action"],
                  ccps.map((c: any, i: number) => [`CCP ${i+1}`, c.monitoring, c.frequency || "Per Batch", c.corrective_action]),
                  [10, 30, 15, 45],
                  theme
              )
          ] : [
              new Paragraph({ children: [new TextRun({ text: "No Critical Control Points (CCPs) identified for this process scope. Hazards are controlled via Prerequisite Programs (PRPs).", ...styles.paragraph.run })] })
          ]),

          createSectionHeader("SECTION 9 — VERIFICATION & VALIDATION"),
          new Paragraph({ children: [new TextRun({ text: full_plan.verification_validation || "Procedures established.", ...styles.paragraph.run })] }),

          createSectionHeader("SECTION 10 — RECORDS & REVIEW"),
          new Paragraph({ children: [new TextRun({ text: full_plan.record_keeping || "Records maintained.", ...styles.paragraph.run })] }),

          new Paragraph({ text: "", pageBreakBefore: true }),
          new Paragraph({ children: [new TextRun({ text: "Prepared by: ____________________ Date: _______", ...styles.paragraph.run })], spacing: { before: 400, after: 400 } }),
          new Paragraph({ children: [new TextRun({ text: "Reviewed by (if applicable): ____________________ Date: _______", ...styles.paragraph.run })] }),
        ],
      },
    ],
  });

  return doc;
}
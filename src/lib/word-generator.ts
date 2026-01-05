import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } from "docx";

export async function generateWordDocument(data: any): Promise<Buffer> {
  const { businessName, full_plan } = data;
  const analysis = full_plan.hazard_analysis || [];
  const ccps = full_plan.ccp_summary || [];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title Page
          new Paragraph({
            text: "HACCP PLAN",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          }),
          new Paragraph({
            text: `Prepared for: ${businessName}`,
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: `Date: ${new Date().toLocaleDateString()}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 }
          }),

          // Executive Summary
          new Paragraph({
            text: "1. Executive Summary",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: full_plan.executive_summary || "No summary provided.",
            spacing: { after: 400 }
          }),

          // Prerequisite Programs
          new Paragraph({
            text: "2. Prerequisite Programs",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Program", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Details", bold: true })] })] }),
                ],
              }),
              ...(full_plan.prerequisite_programs || []).map((p: any) => 
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(p.program)] }),
                    new TableCell({ children: [new Paragraph(p.details)] }),
                  ],
                })
              )
            ],
          }),

          // Hazard Analysis
          new Paragraph({
            text: "3. Hazard Analysis",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Step", bold: true })] })] }),
                  new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Hazards", bold: true })] })] }),
                  new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Control", bold: true })] })] }),
                  new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "CCP?", bold: true })] })] }),
                ],
              }),
              ...analysis.map((item: any) => 
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.step_name, bold: true })] })] }),
                    new TableCell({ children: [new Paragraph(item.hazards)] }),
                    new TableCell({ children: [new Paragraph(item.control_measure)] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.is_ccp ? "YES (CCP)" : "No (PRP)", color: item.is_ccp ? "FF0000" : "000000" })] })] }),
                  ],
                })
              )
            ],
          }),

          // CCP Summary
          new Paragraph({
            text: "4. CCP Summary Plan",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...ccps.map((ccp: any, index: number) => [
            new Paragraph({
              text: `CCP #${index + 1}: ${ccp.ccp_step}`,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Hazard: ", bold: true }),
                    new TextRun(ccp.hazard)
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Critical Limit: ", bold: true }),
                    new TextRun(ccp.critical_limit)
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Monitoring: ", bold: true }),
                    new TextRun(ccp.monitoring)
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Corrective Action: ", bold: true }),
                    new TextRun(ccp.corrective_action)
                ],
                spacing: { after: 200 }
            })
          ]).flat(),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
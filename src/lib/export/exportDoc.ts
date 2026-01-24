import { getQuestions } from "@/data/haccp/loader";

export type ExportTarget = "pdf" | "docx";
export type ExportText = string | { pdf: string; docx: string };

export type ExportBlock =
  | { type: "section"; title: ExportText }
  | { type: "paragraph"; text: ExportText; italic?: boolean; muted?: boolean }
  | { type: "table"; headers: ExportText[]; rows: ExportText[][]; colWidths: number[] }
  | { type: "subheading"; text: ExportText }
  | { type: "signature"; left: ExportText; right: ExportText };

export interface ExportDoc {
  meta: {
    versionId: string;
    generatedDate: string;
    isPaid: boolean;
    logoDataUri?: string | null;
    logoBuffer?: ArrayBuffer | Buffer | null;
  };
  cover: {
    pdf: {
      title: string;
      subtitle: string;
      metaRows: { label: string; value: string }[];
    };
    docx: {
      title: string;
      subtitle: string;
      businessName: string;
      metaRows: { label: string; value: string }[];
    };
  };
  content: ExportBlock[];
}

export function resolveExportText(text: ExportText, target: ExportTarget): string {
  return typeof text === "string" ? text : text[target];
}

const t = (pdf: string, docx: string = pdf): ExportText => ({ pdf, docx });

const formatValue = (value: any) => {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (Array.isArray(value)) {
    if (value.length === 0) return "Not provided";
    return value
      .map((item) => (typeof item === "object" ? JSON.stringify(item) : String(item)))
      .join("; ");
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
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
  const rows: ExportText[][] = [];
  const repeatableTables: { title: string; headers: string[]; rows: ExportText[][] }[] = [];
  const hazardKeysDefault = ["bio", "chem", "phys", "allergen"];

  questions.forEach((q) => {
    if (q.type === "repeatable_list" && q.item_schema?.fields) {
      const headers = q.item_schema.fields.map((f: any) => f.text || f.id);
      const items = Array.isArray(answers?.[q.id]) ? answers[q.id] : [];
      const tableRows =
        items.length > 0
          ? items.map((item: any) =>
              q.item_schema.fields.map((f: any) => formatValue(item?.[f.id]))
            )
          : [headers.map((_: any, i: number) => (i === 0 ? "No items provided" : ""))];
      repeatableTables.push({ title: q.text, headers, rows: tableRows });
      return;
    }

    if (q.type === "prp_group" && Array.isArray(q.fields)) {
      const groupAnswers = answers?.[q.id] || {};
      q.fields.forEach((field: any) => {
        rows.push([`${q.text} — ${field.text}`, formatValue(groupAnswers?.[field.id])]);
      });
      return;
    }

    if (q.type === "group" && Array.isArray(q.questions)) {
      const groupAnswers = answers?.[q.id] || {};
      const nested = buildQuestionRows(q.questions, groupAnswers, q.id);
      rows.push(...nested.rows);
      repeatableTables.push(...nested.repeatableTables);
      return;
    }

    if (q.type === "group_per_hazard" && Array.isArray(q.questions)) {
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
        rows.push([`${q.text} — ${subQ.text}`, formatValue(getAnswerValue(answers, subQ.id, q.id))]);
      });
    }
  });

  return { rows, repeatableTables };
};

export function buildExportDoc({
  data,
  dict,
  lang,
  logoDataUri,
}: {
  data: any;
  dict: any;
  lang: string;
  logoDataUri?: string | null;
}): ExportDoc {
  const fullPlan = data.fullPlan ?? data.full_plan ?? {};
  const businessName = data.businessName || fullPlan.businessName || "";
  const planVersion = data.planVersion ?? fullPlan.planVersion ?? 1;
  const isPaid = data.isPaid ?? false;
  const today = new Date().toLocaleDateString(lang === "en" ? "en-US" : lang);

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

  const buildInputSection = (
    title: ExportText,
    questions: any,
    answers: Record<string, any>
  ): ExportBlock[] => {
    const questionList = Array.isArray(questions?.questions) ? questions.questions : [];
    const { rows, repeatableTables } = buildQuestionRows(questionList, answers);
    const blocks: ExportBlock[] = [
      { type: "section", title },
      {
        type: "table",
        headers: [t("Question"), t("Answer")],
        rows: rows.length > 0 ? rows : [["", "No inputs provided"]],
        colWidths: [45, 55],
      },
    ];

    repeatableTables.forEach((table) => {
      blocks.push({ type: "subheading", text: table.title });
      blocks.push({
        type: "table",
        headers: table.headers,
        rows: table.rows,
        colWidths: table.headers.map(() => Math.floor(100 / table.headers.length)),
      });
    });

    return blocks;
  };

  const content: ExportBlock[] = [
    { type: "section", title: t("SECTION 1 — HACCP TEAM & SCOPE", dict.s1_title) },
    {
      type: "paragraph",
      text: fullPlan?.team_scope || fullPlan?.executive_summary || "Defined by operator.",
    },
    { type: "section", title: t("SECTION 2 — PRODUCT DESCRIPTION", dict.s2_title) },
    {
      type: "table",
      headers: [t("Field"), t("Description")],
      rows: [
        [t("Product Name", dict.lbl_product_name), data.productName],
        [t("Description", dict.lbl_description), data.productDescription],
        [t("Ingredients", dict.lbl_ingredients), data.mainIngredients || "Standard"],
        [t("Storage", dict.lbl_storage), data.storageType],
        [t("Shelf Life", dict.lbl_shelf_life), data.shelfLife || "As per label"],
      ],
      colWidths: [35, 65],
    },
  ];

  if (
    fullPlan?._original_inputs?.product?.plan_scope === "A Product Family / Category" ||
    fullPlan?._original_inputs?.product?.plan_scope === "A Process Line / Technology"
  ) {
    content.push({
      type: "paragraph",
      text:
        "Note: This HACCP plan applies to multiple products with similar formulations. Detailed recipes are managed under separate formulation control.",
      italic: true,
      muted: true,
    });
  }

  content.push(
    { type: "section", title: t("SECTION 3 — INTENDED USE", dict.s3_title) },
    {
      type: "paragraph",
      text: fullPlan?.intended_use || data.intendedUse || "General public.",
    },
    { type: "section", title: t("SECTION 4 — PROCESS FLOW DIAGRAM", dict.s4_title) },
    processSteps.length > 0
      ? {
          type: "table",
          headers: [t("No."), t("Step Name", dict.col_step), t("Description", dict.lbl_description)],
          rows: processSteps.map((s: any, i: number) => [
            `${i + 1}`,
            s.step_name,
            s.step_description || "-",
          ]),
          colWidths: [10, 30, 60],
        }
      : { type: "paragraph", text: t("Process follows standard flow.", "Standard flow.") },
    {
      type: "paragraph",
      text:
        "Note: A visual process flow diagram, including inputs (e.g. water, packaging) and waste streams, is maintained on-site and used by the HACCP team to verify this table.",
      italic: true,
      muted: true,
    },
    { type: "section", title: t("SECTION 5 — PREREQUISITE PROGRAMS (PRPS)", dict.s5_title) },
    {
      type: "table",
      headers: [t("Program", dict.col_program), t("Control Details", dict.col_details)],
      rows: prerequisitePrograms.map((p: any) => [p.program, p.details]),
      colWidths: [30, 70],
    },
    { type: "section", title: t("SECTION 6 — HAZARD ANALYSIS", dict.s6_title) },
    {
      type: "table",
      headers: [
        t("Step", dict.col_step),
        t("Hazard", dict.lbl_hazard),
        t("Sev"),
        t("Lik"),
        t("Sig?", dict.col_ccp),
        t("Control", dict.col_control),
      ],
      rows: analysis.map((hazard: any) => [
        hazard.step_name,
        hazard.hazards,
        hazard.severity,
        hazard.likelihood,
        hazard.is_ccp ? "Yes" : "No",
        hazard.control_measure,
      ]),
      colWidths: [20, 30, 10, 10, 10, 20],
    },
    { type: "section", title: t("SECTION 7 — CCP DETERMINATION", dict.s7_title) },
    {
      type: "paragraph",
      text: t("CCPs determined using Codex Decision Tree.", dict.s7_desc),
    },
    { type: "section", title: t("SECTION 8 — CCP MANAGEMENT", dict.s8_title) }
  );

  if (ccps.length > 0) {
    content.push(
      { type: "subheading", text: t("CCP Summary") },
      {
        type: "table",
        headers: [t("ID"), t("Step", dict.col_step), t("Hazard", dict.col_hazards), t("Critical Limit", dict.lbl_critical_limit)],
        rows: ccps.map((c: any, i: number) => [`CCP ${i + 1}`, c.ccp_step, c.hazard, c.critical_limit]),
        colWidths: [10, 25, 25, 40],
      },
      {
        type: "subheading",
        text: t("Monitoring & Corrective Actions", `${dict.lbl_monitoring} & ${dict.lbl_corrective}`),
      },
      {
        type: "table",
        headers: [
          t("ID"),
          t("Monitoring", dict.lbl_monitoring),
          t("Freq"),
          t("Corrective Action", dict.lbl_corrective),
        ],
        rows: ccps.map((c: any, i: number) => [
          `CCP ${i + 1}`,
          c.monitoring,
          c.frequency || "Per Batch",
          c.corrective_action,
        ]),
        colWidths: [10, 30, 15, 45],
      }
    );
  } else {
    content.push({
      type: "paragraph",
      text: t(
        "No Critical Control Points (CCPs) identified for this process scope. Hazards are controlled via Prerequisite Programs (PRPs).",
        dict.msg_no_ccps
      ),
    });
  }

  content.push(
    { type: "section", title: t("SECTION 9 — VERIFICATION & VALIDATION", dict.s9_title) },
    { type: "paragraph", text: fullPlan?.verification_validation || "Procedures established." },
    { type: "section", title: t("SECTION 10 — RECORDS & REVIEW", dict.s10_title) },
    { type: "paragraph", text: fullPlan?.record_keeping || "Records maintained." },
    {
      type: "signature",
      left: t(dict.sign_prepared),
      right: t(dict.sign_approved),
    },
    { type: "section", title: t("APPENDIX — USER INPUTS") },
    {
      type: "paragraph",
      text: "The following tables list every question and response captured in the builder.",
    },
    ...buildInputSection(t("Product Inputs"), getQuestions("product", lang), productInputs),
    ...buildInputSection(t("Process Inputs"), getQuestions("process", lang), processInputs),
    ...buildInputSection(t("PRP Inputs"), getQuestions("prp", lang), prpInputs),
    ...buildInputSection(t("Hazard Analysis Inputs"), getQuestions("hazards", lang), hazardInputs),
    ...buildInputSection(
      t("CCP Determination Inputs"),
      getQuestions("ccp_determination", lang),
      ccpDeterminationInputs
    ),
    ...buildInputSection(
      t("CCP Management Inputs"),
      getQuestions("ccp_management", lang),
      ccpManagementInputs
    ),
    ...buildInputSection(
      t("Verification, Validation & Records Inputs"),
      getQuestions("validation", lang),
      validationInputs
    ),
    { type: "section", title: t("APPENDIX — GENERATED SUMMARIES") },
    {
      type: "table",
      headers: [t("Field"), t("Value")],
      rows: [
        [t("Team & Scope Summary"), formatValue(fullPlan?.team_scope)],
        [t("Product Description Summary"), formatValue(fullPlan?.product_description)],
        [t("Process Flow Narrative"), formatValue(fullPlan?.process_flow_narrative)],
        [t("Assumptions & Limitations"), formatValue(fullPlan?.assumptions_limitations)],
        [t("Next Steps"), formatValue(fullPlan?.next_steps)],
        [t("Auditor Review"), formatValue(fullPlan?.auditor_review)],
        [t("Final Disclaimer"), formatValue(fullPlan?.final_disclaimer)],
        [t("Benchmarking"), formatValue(fullPlan?.benchmarking)],
      ],
      colWidths: [30, 70],
    }
  );

  return {
    meta: {
      versionId: `v${planVersion}`,
      generatedDate: today,
      isPaid,
      logoDataUri: logoDataUri ?? null,
      logoBuffer: data.logoBuffer ?? null,
    },
    cover: {
      pdf: {
        title: "HACCP PLAN",
        subtitle: businessName,
        metaRows: [
          { label: "Framework", value: "HACCP_CODEX v1.0.0" },
          { label: "Date Generated", value: today },
          { label: "Plan Version", value: `v${planVersion}` },
          { label: "Prepared by", value: "____________________" },
          { label: "Reviewed by (if applicable)", value: "____________________" },
        ],
      },
      docx: {
        title: dict.title,
        subtitle: dict.subtitle,
        businessName,
        metaRows: [
          { label: dict.standard, value: "HACCP_CODEX v1.0.0" },
          { label: dict.date_issue, value: today },
          { label: "Plan Version", value: `v${planVersion}` },
        ],
      },
    },
    content,
  };
}

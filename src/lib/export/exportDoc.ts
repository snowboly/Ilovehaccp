import { getQuestions } from "@/data/haccp/loader";
import { isSignificant } from "@/lib/haccp/significanceMatrix";

export type ExportTarget = "pdf" | "docx";
export type ExportText = string | { pdf: string; docx: string };

export type ExportBlock =
  | { type: "section"; title: ExportText }
  | { type: "paragraph"; text: ExportText; italic?: boolean; muted?: boolean }
  | { type: "table"; headers: ExportText[]; rows: ExportText[][]; colWidths: number[] }
  | { type: "subheading"; text: ExportText }
  | { type: "signature"; left: ExportText; right: ExportText };

export interface ExportDocLabels {
  documentTitle: string;
  createdBy: string;
  approvedBy: string;
  date: string;
  version: string;
  page: string;
  of: string;
  subtitle: string;
}

export interface ExportDoc {
  meta: {
    versionId: string;
    generatedDate: string;
    isPaid: boolean;
    logoDataUri?: string | null;
    logoBuffer?: ArrayBuffer | Buffer | null;
    template?: string;
    labels: ExportDocLabels;
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
  if (text === null || text === undefined) return "";
  if (typeof text === "string") return text;
  return text[target] ?? text.pdf ?? text.docx ?? "";
}

const t = (pdf: string, docx: string = pdf): ExportText => ({ pdf, docx });

const resolveHazardSignificance = (hazard: any): boolean => {
  if (hazard?.is_significant !== undefined && hazard?.is_significant !== null) {
    return Boolean(hazard.is_significant);
  }
  return isSignificant(hazard?.severity, hazard?.likelihood);
};

const formatAllergenList = (value: any): string => {
  if (!value) return "";
  if (Array.isArray(value)) return value.join("; ");
  return String(value);
};

const appendAllergenContext = (hazard: any, allergensPresent: string): string => {
  if (!allergensPresent) return hazard?.hazards || "-";
  const type = String(hazard?.hazard_type || "").toLowerCase();
  const hazardText = String(hazard?.hazards || "").toLowerCase();
  if (type.includes("allergen") || hazardText.includes("allergen")) {
    return `${hazard?.hazards || "-"} (Allergens: ${allergensPresent})`;
  }
  return hazard?.hazards || "-";
};

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

const buildCcpKey = (step?: string, hazard?: string) =>
  `ccp_${step || ""}_${hazard || ""}`.replace(/[^a-zA-Z0-9]/g, "_");

const normalizeCcpManagementInputs = (inputs: any) => {
  if (!inputs) return { list: [], byKey: {} as Record<string, any> };
  const byKey: Record<string, any> = {};
  const list = Array.isArray(inputs) ? inputs : Object.values(inputs);
  list.forEach((entry: any) => {
    const derivedKey = buildCcpKey(
      entry?.step_name || entry?.step || entry?.ccp_step,
      entry?.hazard
    );
    if (entry?.ccp_id) {
      byKey[entry.ccp_id] = entry;
    }
    if (derivedKey) {
      byKey[derivedKey] = entry;
    }
  });
  return { list, byKey };
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
  template,
}: {
  data: any;
  dict: any;
  lang: string;
  logoDataUri?: string | null;
  template?: string;
}): ExportDoc {
  // Defensive: if fullPlan is the API response wrapper { analysis, full_plan },
  // unwrap to the actual plan object so table arrays are at the top level.
  const rawFullPlan = data.fullPlan ?? data.full_plan ?? {};
  const fullPlan =
    rawFullPlan?.full_plan && typeof rawFullPlan.full_plan === 'object' && !Array.isArray(rawFullPlan.full_plan)
      ? rawFullPlan.full_plan
      : rawFullPlan;
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
  const intendedUse = productInputs.intended_use || data.intendedUse || "";
  const allergensPresent = formatAllergenList(productInputs.allergens_present || productInputs.allergens);

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

  const buildCcpManagementSection = (): ExportBlock[] => {
    const questions = getQuestions("ccp_management", lang);
    const questionList = Array.isArray(questions?.questions) ? questions.questions : [];
    const normalized = normalizeCcpManagementInputs(ccpManagementInputs);

    if (normalized.list.length === 0) {
      return buildInputSection(t("CCP Management Inputs"), questions, ccpManagementInputs);
    }

    const blocks: ExportBlock[] = [{ type: "section", title: t("CCP Management Inputs") }];
    const orderedEntries =
      ccps.length > 0
        ? ccps
            .map((ccp: any) => {
              const key = buildCcpKey(ccp.ccp_step || ccp.step, ccp.hazard);
              return normalized.byKey[key] || null;
            })
            .filter(Boolean)
        : normalized.list;

    orderedEntries.forEach((entry: any, index: number) => {
      const step = entry?.step_name || entry?.step || entry?.ccp_step || "-";
      const hazard = entry?.hazard || "-";
      const label = `CCP ${index + 1} — ${step} (${hazard})`;
      const { rows, repeatableTables } = buildQuestionRows(questionList, entry || {});
      blocks.push({ type: "subheading", text: label });
      blocks.push({
        type: "table",
        headers: [t("Question"), t("Answer")],
        rows: rows.length > 0 ? rows : [["", "No inputs provided"]],
        colWidths: [45, 55],
      });

      repeatableTables.forEach((table) => {
        blocks.push({ type: "subheading", text: table.title });
        blocks.push({
          type: "table",
          headers: table.headers,
          rows: table.rows,
          colWidths: table.headers.map(() => Math.floor(100 / table.headers.length)),
        });
      });
    });

    return blocks;
  };

  const haccpTeam = Array.isArray(productInputs.haccp_team) ? productInputs.haccp_team : [];

  const content: ExportBlock[] = [
    { type: "section", title: t("SECTION 1 — HACCP TEAM & SCOPE", dict.s1_title) },
  ];

  if (haccpTeam.length > 0) {
    content.push({
      type: "table",
      headers: [t("Name"), t("Role / Job Title"), t("Competence / Qualifications")],
      rows: haccpTeam.map((m: any) => [
        m.member_name || "-",
        m.member_role || "-",
        m.member_competence || "-",
      ]),
      colWidths: [30, 35, 35],
    });
  }

  content.push(
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
        [t("Intended Use", dict.lbl_intended_use), formatValue(intendedUse)],
      ],
      colWidths: [35, 65],
    },
  );

  if (allergensPresent) {
    content.push({ type: "subheading", text: t("Allergen Controls") });
    content.push({
      type: "table",
      headers: [t("Field"), t("Details")],
      rows: [[t("Allergens Present"), allergensPresent]],
      colWidths: [35, 65],
    });
  }

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
    { type: "section", title: t("SECTION 3 — PROCESS FLOW DIAGRAM", dict.s3_title) },
    processSteps.length > 0
      ? {
          type: "table",
          headers: [t("No."), t("Step Name", dict.col_step), t("Description", dict.lbl_description)],
          rows: processSteps.map((s: any, i: number) => [
            `${i + 1}`,
            s.step_name,
            s.step_description || "-",
          ]),
          colWidths: [10, 20, 70],
        }
      : { type: "paragraph", text: t("Process follows standard flow.", "Standard flow.") },
    {
      type: "paragraph",
      text:
        "Note: A visual process flow diagram, including inputs (e.g. water, packaging) and waste streams, is maintained on-site and used by the HACCP team to verify this table.",
      italic: true,
      muted: true,
    },
    { type: "section", title: t("SECTION 4 — PREREQUISITE PROGRAMS (PRPS)", dict.s4_title) },
    prerequisitePrograms.length > 0
      ? {
          type: "table",
          headers: [t("Program", dict.col_program), t("Control Details", dict.col_details)],
          rows: prerequisitePrograms.map((p: any) => {
            const name = p.program || "-";
            const lower = name.toLowerCase();
            const label = (lower.includes('traceab') || lower.includes('recall')) ? `${name} (see Section 10)` : name;
            return [label, p.details || "-"];
          }),
          colWidths: [30, 70],
        }
      : { type: "paragraph", text: t("Prerequisite programs to be documented.", "PRPs pending.") },
    { type: "section", title: t("SECTION 5 — HAZARD ANALYSIS", dict.s5_title) },
    analysis.length > 0
      ? {
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
            hazard.step_name || "-",
            appendAllergenContext(hazard, allergensPresent),
            hazard.severity || "-",
            hazard.likelihood || "-",
            resolveHazardSignificance(hazard) ? "Yes" : "No",
            hazard.control_measure || "-",
          ]),
          colWidths: [20, 30, 10, 10, 10, 20],
        }
      : { type: "paragraph", text: t("Hazard analysis pending completion.", "Hazard analysis pending.") },
    { type: "section", title: t("SECTION 6 — CCP DETERMINATION", dict.s6_title) }
  );

  // CCP Decision Tree table
  const ccpDecisions = Array.isArray(originalInputs.ccp_decisions) ? originalInputs.ccp_decisions : [];
  const ynDash = (v: any): string => (v === true ? "Yes" : v === false ? "No" : "-");

  if (ccpDecisions.length > 0) {
    content.push({
      type: "paragraph",
      text: t(
        "CCP determination performed using Codex Alimentarius decision tree. " +
        "Q1: Control measure exists? Q2: Step designed to eliminate? Q3: Contamination could increase? Q4: Subsequent step eliminates?",
        dict.s7_desc
      ),
    });
    content.push({
      type: "table",
      headers: [t("Step"), t("Hazard"), "Q1", "Q2", "Q3", "Q4", t("Outcome")],
      rows: ccpDecisions.map((d: any) => {
        const a = d.answers || {};
        return [
          d.step_name || "-",
          d.hazard || "-",
          ynDash(a.q1_control_measure),
          ynDash(a.q2_step_designed_to_eliminate),
          ynDash(a.q3_contamination_possible),
          ynDash(a.q4_subsequent_step),
          d.control_classification || "-",
        ];
      }),
      colWidths: [16, 20, 8, 8, 8, 8, 12],
    });

    // Justification table if any provided
    const justRows: string[][] = [];
    for (const d of ccpDecisions) {
      const a = d.answers || {};
      if (a.q1_control_measure_justification) justRows.push([d.step_name || "-", d.hazard || "-", "Q1", a.q1_control_measure_justification]);
      if (a.q2_step_designed_to_eliminate_justification) justRows.push([d.step_name || "-", d.hazard || "-", "Q2", a.q2_step_designed_to_eliminate_justification]);
      if (a.q3_contamination_possible_justification) justRows.push([d.step_name || "-", d.hazard || "-", "Q3", a.q3_contamination_possible_justification]);
      if (a.q4_subsequent_step_justification) justRows.push([d.step_name || "-", d.hazard || "-", "Q4", a.q4_subsequent_step_justification]);
    }
    if (justRows.length > 0) {
      content.push(
        { type: "subheading", text: t("Decision Tree Justifications") },
        {
          type: "table",
          headers: [t("Step"), t("Hazard"), "Q", t("Justification")],
          rows: justRows,
          colWidths: [16, 20, 8, 56],
        }
      );
    }
  } else {
    content.push({
      type: "paragraph",
      text: t("CCPs determined using Codex Decision Tree.", dict.s7_desc),
    });
  }

  content.push(
    { type: "section", title: t("SECTION 7 — CCP MANAGEMENT", dict.s7_title) }
  );

  const ccpMgmtRaw = originalInputs.ccp_management || {};
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

    // Equipment & calibration table — only if user provided instrument data
    const equipRows: string[][] = [];
    ccps.forEach((c: any, i: number) => {
      const entry = Object.values(ccpMgmtRaw).find((m: any) =>
        (m.step_name === c.ccp_step || m.step_name === c.step) && m.hazard === c.hazard
      ) as any || {};
      const mon = entry.monitoring || {};
      if (mon.monitoring_instrument || mon.calibration_frequency) {
        equipRows.push([`CCP ${i + 1}`, mon.monitoring_instrument || "-", mon.calibration_frequency || "-"]);
      }
    });
    if (equipRows.length > 0) {
      content.push(
        { type: "subheading", text: t("Monitoring Equipment & Calibration") },
        {
          type: "table",
          headers: [t("ID"), t("Instrument / Equipment"), t("Calibration Frequency")],
          rows: equipRows,
          colWidths: [15, 50, 35],
        }
      );
    }
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
    { type: "section", title: t("SECTION 8 — VERIFICATION & VALIDATION", dict.s8_title) },
    { type: "paragraph", text: fullPlan?.verification_validation || "Procedures established." },
    { type: "section", title: t("SECTION 9 — RECORDS & REVIEW", dict.s9_title) },
    { type: "paragraph", text: fullPlan?.record_keeping || "Records maintained." },
    { type: "section", title: t("SECTION 10 — TRACEABILITY & RECALL") }
  );

  // Traceability & Recall (Regulation 178/2002)
  const traceGroup = (originalInputs.review_validation || originalInputs.validation || {}).traceability_group || {};
  const hasTrace = traceGroup.batch_coding_method !== undefined || traceGroup.supplier_traceability !== undefined || traceGroup.recall_procedure_documented !== undefined;
  const ynTrace = (v: any): string => (v === true ? "Yes" : v === false ? "No" : "TBD");

  if (hasTrace) {
    content.push(
      {
        type: "paragraph",
        text: t("Traceability procedures established per EC Regulation 178/2002 Articles 18–19."),
      },
      { type: "subheading", text: t("Batch Coding & Lot Identification") },
      {
        type: "table",
        headers: [t("Field"), t("Value")],
        rows: [
          [t("Batch coding method"), traceGroup.batch_coding_method || "Not specified"],
          [t("Example batch code"), traceGroup.batch_code_example || "-"],
        ],
        colWidths: [40, 60],
      },
      { type: "subheading", text: t("Supply Chain Traceability") },
      {
        type: "table",
        headers: [t("Field"), t("Value")],
        rows: [
          [t("Supplier traceability (one step back)"), ynTrace(traceGroup.supplier_traceability)],
          ...(traceGroup.supplier_traceability_method ? [[t("Supplier traceability method"), traceGroup.supplier_traceability_method]] : []),
          [t("Customer traceability (one step forward)"), ynTrace(traceGroup.customer_traceability)],
          ...(traceGroup.customer_traceability_method ? [[t("Customer traceability method"), traceGroup.customer_traceability_method]] : []),
        ],
        colWidths: [40, 60],
      },
      { type: "subheading", text: t("Recall & Withdrawal") },
      {
        type: "table",
        headers: [t("Field"), t("Value")],
        rows: [
          [t("Recall procedure documented"), ynTrace(traceGroup.recall_procedure_documented)],
          [t("Last mock recall"), traceGroup.recall_last_tested || "Not tested / Not recorded"],
          [t("Recall coordinator"), traceGroup.recall_coordinator || "Not specified"],
        ],
        colWidths: [40, 60],
      }
    );
  } else {
    content.push({
      type: "paragraph",
      text: t("Traceability and recall procedures to be documented during HACCP implementation. EC Regulation 178/2002 Articles 18–19 require one-step-back and one-step-forward traceability and documented recall/withdrawal procedures."),
    });
  }

  content.push(
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
    ...buildCcpManagementSection(),
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
      template,
      labels: {
        documentTitle: dict.title || "HACCP Plan",
        createdBy: dict.cover_created_by || "Created by",
        approvedBy: dict.cover_approved_by || "Approved by",
        date: dict.cover_date || "Date",
        version: dict.cover_version || "Version",
        page: dict.lbl_page || "Page",
        of: dict.lbl_of || "of",
        subtitle: dict.subtitle || "Food Safety Management System",
      },
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

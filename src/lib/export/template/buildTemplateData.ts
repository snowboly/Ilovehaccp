/**
 * Template Data Builder for docxtemplater-based Word exports
 * Maps HACCP plan data to template placeholders
 */

import { getQuestions } from '@/data/haccp/loader';
import { isSignificant } from '@/lib/haccp/significanceMatrix';

export interface ProcessStep {
  step_number: number;
  step_name: string;
  step_description: string;
}

export interface PRPProgram {
  program: string;
  exists: string;
  documented: string;
  reference: string;
}

export interface HazardAnalysisRow {
  step: string;
  hazard: string;
  hazard_type: string;
  severity: string;
  likelihood: string;
  significant: string;
  control_measure: string;
  control_measure_description: string;
}

export interface CCPRow {
  ccp_id: string;
  step: string;
  hazard: string;
  critical_limit: string;
  monitoring: string;
  frequency: string;
  corrective_action: string;
  verification: string;
  records: string;
}

export interface HACCPTeamMember {
  member_name: string;
  member_role: string;
  member_competence: string;
}

export interface CCPDecisionRow {
  step: string;
  hazard: string;
  q1: string;
  q1_justification: string;
  q2: string;
  q2_justification: string;
  q3: string;
  q3_justification: string;
  q4: string;
  q4_justification: string;
  outcome: string;
}

export interface TraceabilityData {
  batch_coding_method: string;
  batch_code_example: string;
  supplier_traceability: string;
  supplier_traceability_method: string;
  customer_traceability: string;
  customer_traceability_method: string;
  recall_procedure_documented: string;
  recall_last_tested: string;
  recall_coordinator: string;
}

export interface TemplateData {
  // Cover
  business_name: string;
  date: string;
  version: string;
  created_by: string;
  approved_by: string;

  // HACCP Team
  haccp_team: HACCPTeamMember[];
  has_haccp_team: boolean;

  // Product
  product_name: string;
  product_category: string;
  ingredients: string;
  allergens: string;
  allergens_present: string;
  packaging: string;
  shelf_life: string;
  storage_conditions: string;
  intended_use: string;
  intended_consumer: string;
  is_rte: boolean;

  // Process
  process_steps: ProcessStep[];
  has_process_steps: boolean;

  // PRPs
  prp_programs: PRPProgram[];
  has_prp_programs: boolean;

  // Hazard Analysis
  hazard_analysis: HazardAnalysisRow[];
  has_hazard_analysis: boolean;

  // CCP Decision Tree
  ccp_decisions: CCPDecisionRow[];
  has_ccp_decisions: boolean;

  // CCPs
  ccps: CCPRow[];
  has_ccps: boolean;

  // Traceability & Recall
  traceability: TraceabilityData;
  has_traceability: boolean;

  // Generated content sections
  team_scope_summary: string;
  process_description: string;
  verification_procedures: string;
  record_keeping: string;
  traceability_narrative: string;
  executive_summary: string;
  intended_use_narrative: string;

  // Logo (if provided)
  logo?: Buffer;
  has_logo: boolean;

  // Meta
  is_paid: boolean;
}

const formatValue = (value: any, defaultValue: string = '-'): string => {
  if (value === null || value === undefined || value === '') return defaultValue;
  if (Array.isArray(value)) {
    if (value.length === 0) return defaultValue;
    return value
      .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
      .join('; ');
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const RTE_MATCHERS = [
  'ready-to-eat',
  'pronto a comer',
  'listo para comer',
  'prêt à consommer',
  'pret a consommer',
  'prêt-à-consommer',
  'pret-a-consommer',
];

const isReadyToEat = (value: string | undefined | null): boolean => {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return RTE_MATCHERS.some((matcher) => normalized.includes(matcher));
};

const extractProcessSteps = (fullPlan: any): ProcessStep[] => {
  const steps = fullPlan?._original_inputs?.process?.process_steps;
  if (!Array.isArray(steps) || steps.length === 0) return [];

  return steps.map((step: any, index: number) => ({
    step_number: index + 1,
    step_name: formatValue(step.step_name),
    step_description: formatValue(step.step_description),
  }));
};

const yn = (value: any): string => {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return 'TBD';
};

const normalizeLabel = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const extractPRPPrograms = (fullPlan: any): PRPProgram[] => {
  const prps = fullPlan?.prerequisite_programs;
  const prpInputs = fullPlan?._original_inputs?.prp || {};
  const prpQuestions = getQuestions('prp', 'en');
  const questionList = Array.isArray(prpQuestions?.questions) ? prpQuestions.questions : [];

  const idToLabel = new Map<string, string>();
  const labelToInput = new Map<string, any>();

  questionList.forEach((q: any) => {
    if (!q?.id || !q?.text) return;
    idToLabel.set(q.id, q.text);
  });

  Object.entries(prpInputs).forEach(([key, value]) => {
    const label = idToLabel.get(key) || key;
    labelToInput.set(normalizeLabel(label), value);
  });

  if (Array.isArray(prps) && prps.length > 0) {
    return prps.map((prp: any) => {
      const match = prp?.program ? labelToInput.get(normalizeLabel(prp.program)) : undefined;
      const existsValue = prp?.exists ?? match?.exists ?? match?.inPlace ?? match?.in_place;
      const documentedValue = prp?.documented ?? match?.documented ?? match?.is_documented;
      const referenceValue = prp?.details || prp?.reference || match?.reference;

      return {
        program: formatValue(prp.program),
        exists: yn(existsValue),
        documented: yn(documentedValue),
        reference: formatValue(referenceValue),
      };
    });
  }

  if (Object.keys(prpInputs).length === 0) return [];

  return Object.entries(prpInputs).map(([key, value]: [string, any]) => {
    const label = idToLabel.get(key) || key;
    return {
      program: formatValue(label),
      exists: yn(value?.exists ?? value?.inPlace ?? value?.in_place),
      documented: yn(value?.documented ?? value?.is_documented),
      reference: formatValue(value?.reference),
    };
  });
};

const PROCESS_CONTROL_DEFAULT_DESCRIPTION =
  'Process controls are applied at this step; specify the control(s) used (time/temperature, segregation, handling, sanitation, etc.).';

const PROCESS_CONTROL_LABELS = [
  'Process control',
  'Control de proceso',
  'Contrôle de processus',
  'Controle de processo',
];

const normalizeProcessControlLabel = (label: string): string =>
  label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const processControlLabelMatchers = PROCESS_CONTROL_LABELS.map(normalizeProcessControlLabel);

const matchesProcessControlLabel = (label: string): boolean => {
  const normalized = normalizeProcessControlLabel(label);
  return processControlLabelMatchers.some((match) => normalized.includes(match));
};

const isProcessControlSelected = (controlMeasure: any): boolean => {
  if (!controlMeasure) return false;
  if (Array.isArray(controlMeasure)) {
    return controlMeasure.some((control) =>
      typeof control === 'string' ? matchesProcessControlLabel(control) : false
    );
  }
  if (typeof controlMeasure === 'string') {
    return matchesProcessControlLabel(controlMeasure);
  }
  return false;
};

const extractHazardAnalysis = (fullPlan: any): HazardAnalysisRow[] => {
  const analysis = fullPlan?.hazard_analysis;
  if (!Array.isArray(analysis) || analysis.length === 0) return [];

  return analysis.map((hazard: any) => {
    const controlMeasure = hazard.control_measure;
    const hasProcessControl = isProcessControlSelected(controlMeasure);

    // Get description from various possible sources
    let description = hazard.control_measure_description ||
                      hazard.process_control_description ||
                      '';

    // Apply default if Process control is selected but description is empty
    if (hasProcessControl && !description) {
      description = PROCESS_CONTROL_DEFAULT_DESCRIPTION;
    }

    const significant = hazard.is_significant !== undefined && hazard.is_significant !== null
      ? Boolean(hazard.is_significant)
      : isSignificant(hazard.severity, hazard.likelihood);

    return {
      step: formatValue(hazard.step_name || hazard.step),
      hazard: formatValue(hazard.hazards || hazard.hazard),
      hazard_type: formatValue(hazard.hazard_type || hazard.type),
      severity: formatValue(hazard.severity),
      likelihood: formatValue(hazard.likelihood),
      significant: significant ? 'Yes' : 'No',
      control_measure: formatValue(controlMeasure),
      control_measure_description: description || '-',
    };
  });
};

const extractCCPs = (fullPlan: any): CCPRow[] => {
  const ccps = fullPlan?.ccp_summary;
  if (!Array.isArray(ccps) || ccps.length === 0) return [];

  return ccps.map((ccp: any, index: number) => ({
    ccp_id: `CCP ${index + 1}`,
    step: formatValue(ccp.ccp_step || ccp.step),
    hazard: formatValue(ccp.hazard),
    critical_limit: formatValue(ccp.critical_limit),
    monitoring: formatValue(ccp.monitoring),
    frequency: formatValue(ccp.frequency, 'Per Batch'),
    corrective_action: formatValue(ccp.corrective_action),
    verification: formatValue(ccp.verification),
    records: formatValue(ccp.records),
  }));
};

const ynDash = (v: any): string => {
  if (v === true) return 'Yes';
  if (v === false) return 'No';
  return '-';
};

const extractCCPDecisions = (fullPlan: any): CCPDecisionRow[] => {
  const decisions = fullPlan?._original_inputs?.ccp_decisions;
  if (!Array.isArray(decisions) || decisions.length === 0) return [];

  return decisions.map((d: any) => {
    const a = d.answers || {};
    return {
      step: formatValue(d.step_name),
      hazard: formatValue(d.hazard),
      q1: ynDash(a.q1_control_measure),
      q1_justification: formatValue(a.q1_control_measure_justification, '-'),
      q2: ynDash(a.q2_step_designed_to_eliminate),
      q2_justification: formatValue(a.q2_step_designed_to_eliminate_justification, '-'),
      q3: ynDash(a.q3_contamination_possible),
      q3_justification: formatValue(a.q3_contamination_possible_justification, '-'),
      q4: ynDash(a.q4_subsequent_step),
      q4_justification: formatValue(a.q4_subsequent_step_justification, '-'),
      outcome: formatValue(d.control_classification, '-'),
    };
  });
};

export function buildTemplateData(
  data: any,
  isPaid: boolean,
  logoBuffer?: Buffer | null
): TemplateData {
  const fullPlan = data.fullPlan ?? data.full_plan ?? {};
  const originalInputs = fullPlan._original_inputs || {};
  const productInputs = originalInputs.product || {};
  const processInputs = originalInputs.process || {};

  const businessName = data.businessName || fullPlan.businessName || '';
  const planVersion = data.planVersion ?? fullPlan.planVersion ?? 1;
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const processSteps = extractProcessSteps(fullPlan);
  const prpProgramsRaw = extractPRPPrograms(fullPlan);
  // Annotate the traceability PRP row with a cross-reference to Section 9
  const prpPrograms = prpProgramsRaw.map((prp) => {
    const lower = prp.program.toLowerCase();
    if (lower.includes('traceab') || lower.includes('recall')) {
      return { ...prp, program: `${prp.program} (see Section 9)` };
    }
    return prp;
  });
  const allergensPresent = formatValue(productInputs.allergens_present || productInputs.allergens, 'None');
  const hazardAnalysisBase = extractHazardAnalysis(fullPlan);
  const hazardAnalysis = hazardAnalysisBase.map((row) => {
    if (!allergensPresent || ['none', '-', 'not provided'].includes(allergensPresent.toLowerCase())) {
      return row;
    }
    const type = (row.hazard_type || '').toLowerCase();
    const hazardText = (row.hazard || '').toLowerCase();
    if (type.includes('allergen') || hazardText.includes('allergen')) {
      return { ...row, hazard: `${row.hazard} (Allergens: ${allergensPresent})` };
    }
    return row;
  });
  const ccps = extractCCPs(fullPlan);
  const ccpDecisions = extractCCPDecisions(fullPlan);
  const intendedUseRaw = productInputs.intended_use || data.intendedUse || '';
  const productCategory = productInputs.product_category || data.productDescription || '';
  const isRte = isReadyToEat(productCategory) || isReadyToEat(intendedUseRaw);

  const rawTeam = Array.isArray(productInputs.haccp_team) ? productInputs.haccp_team : [];
  const haccpTeam: HACCPTeamMember[] = rawTeam.map((m: any) => ({
    member_name: formatValue(m.member_name, '-'),
    member_role: formatValue(m.member_role, '-'),
    member_competence: formatValue(m.member_competence, '-'),
  }));

  // Traceability — lives under review_validation.traceability_group
  const validationInputs = originalInputs.review_validation || originalInputs.validation || {};
  const tg = validationInputs.traceability_group || {};
  const traceability: TraceabilityData = {
    batch_coding_method: formatValue(tg.batch_coding_method, 'Not specified'),
    batch_code_example: formatValue(tg.batch_code_example, '-'),
    supplier_traceability: yn(tg.supplier_traceability),
    supplier_traceability_method: formatValue(tg.supplier_traceability_method, '-'),
    customer_traceability: yn(tg.customer_traceability),
    customer_traceability_method: formatValue(tg.customer_traceability_method, '-'),
    recall_procedure_documented: yn(tg.recall_procedure_documented),
    recall_last_tested: formatValue(tg.recall_last_tested, 'Not tested / Not recorded'),
    recall_coordinator: formatValue(tg.recall_coordinator, 'Not specified'),
  };
  const hasTraceability = tg.batch_coding_method !== undefined || tg.supplier_traceability !== undefined || tg.recall_procedure_documented !== undefined;

  return {
    // Cover
    business_name: businessName || 'Food Business',
    date: today,
    version: `v${planVersion}`,
    created_by: '', // Blank for signature
    approved_by: '', // Blank for signature

    // HACCP Team
    haccp_team: haccpTeam,
    has_haccp_team: haccpTeam.length > 0,

    // Product
    product_name: formatValue(productInputs.product_name || data.productName, 'Product'),
    product_category: formatValue(productInputs.product_category || data.productDescription),
    ingredients: formatValue(productInputs.key_ingredients || data.mainIngredients, 'As per recipe'),
    allergens: allergensPresent,
    allergens_present: allergensPresent,
    packaging: formatValue(productInputs.packaging_type || productInputs.packaging),
    shelf_life: formatValue(productInputs.shelf_life || data.shelfLife, 'As per label'),
    storage_conditions: formatValue(productInputs.storage_conditions || data.storageType, 'As per label'),
    intended_use: formatValue(productInputs.intended_use || data.intendedUse, 'General consumption'),
    intended_consumer: formatValue(productInputs.intended_consumer || productInputs.target_consumer, 'General public'),
    is_rte: isRte,

    // Process
    process_steps: processSteps,
    has_process_steps: processSteps.length > 0,

    // PRPs
    prp_programs: prpPrograms,
    has_prp_programs: prpPrograms.length > 0,

    // Hazard Analysis
    hazard_analysis: hazardAnalysis,
    has_hazard_analysis: hazardAnalysis.length > 0,

    // CCP Decision Tree
    ccp_decisions: ccpDecisions,
    has_ccp_decisions: ccpDecisions.length > 0,

    // CCPs
    ccps: ccps,
    has_ccps: ccps.length > 0,

    // Traceability & Recall
    traceability,
    has_traceability: hasTraceability,

    // Generated content
    team_scope_summary: formatValue(
      fullPlan.team_scope || fullPlan.executive_summary,
      'HACCP team and scope defined by operator.'
    ),
    process_description: formatValue(
      fullPlan.process_flow_narrative || processInputs.process_description,
      'Process follows standard food safety procedures.'
    ),
    verification_procedures: formatValue(
      fullPlan.verification_validation,
      'Verification procedures established per HACCP principles.'
    ),
    record_keeping: formatValue(
      fullPlan.record_keeping,
      'Records maintained as per food safety requirements.'
    ),
    traceability_narrative: formatValue(
      fullPlan.traceability_recall,
      ''
    ),
    executive_summary: formatValue(
      fullPlan.executive_summary,
      ''
    ),
    intended_use_narrative: formatValue(
      fullPlan.intended_use,
      'Product intended for general public consumption.'
    ),

    // Logo
    logo: logoBuffer || undefined,
    has_logo: !!logoBuffer,

    // Meta
    is_paid: isPaid,
  };
}

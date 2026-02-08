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
  /** Combined "PRP — description" or "Process control — description" for display */
  control_measure_detail: string;
}

export interface CCPRow {
  ccp_id: string;
  step: string;
  hazard: string;
  critical_limit: string;
  monitoring: string;
  monitoring_instrument: string;
  calibration_frequency: string;
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

export interface VerificationValidationData {
  is_validated: string;
  validation_date: string;
  validated_by: string;
  verification_activities: string;
  verification_frequency: string;
  verification_responsibility: string;
  review_frequency: string;
  review_triggers: string;
}

export interface RecordsData {
  record_storage_location: string;
  record_retention_period: string;
  document_control_method: string;
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

  // CCPs
  ccps: CCPRow[];
  has_ccps: boolean;

  // Verification & Validation (user answers)
  verification_data: VerificationValidationData;
  has_verification_data: boolean;

  // Records (user answers)
  records_data: RecordsData;
  has_records_data: boolean;

  // Traceability & Recall
  traceability: TraceabilityData;
  has_traceability: boolean;
  traceability_intro: string;

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

    // Build combined control measure detail: "PRP — description" or "Process control — description"
    const controlLabel = formatValue(controlMeasure);
    let controlDetail = controlLabel;
    if (description && description !== '-') {
      controlDetail = `${controlLabel} — ${description}`;
    }

    return {
      step: formatValue(hazard.step_name || hazard.step),
      hazard: formatValue(hazard.hazards || hazard.hazard),
      hazard_type: formatValue(hazard.hazard_type || hazard.type),
      severity: formatValue(hazard.severity),
      likelihood: formatValue(hazard.likelihood),
      significant: significant ? 'Yes' : 'No',
      control_measure: formatValue(controlMeasure),
      control_measure_description: description || '-',
      control_measure_detail: controlDetail,
    };
  });
};

const extractCCPs = (fullPlan: any): CCPRow[] => {
  const ccps = fullPlan?.ccp_summary;
  if (!Array.isArray(ccps) || ccps.length === 0) return [];

  // Raw user CCP management inputs keyed by CCP ID
  const mgmt = fullPlan?._original_inputs?.ccp_management || {};

  return ccps.map((ccp: any, index: number) => {
    // Try to match raw management entry by step+hazard or ccp_id
    const mgmtEntry = Object.values(mgmt).find((m: any) =>
      (m.step_name === ccp.ccp_step || m.step_name === ccp.step) && m.hazard === ccp.hazard
    ) as any || {};
    const mon = mgmtEntry.monitoring || {};

    return {
      ccp_id: `CCP ${index + 1}`,
      step: formatValue(ccp.ccp_step || ccp.step),
      hazard: formatValue(ccp.hazard),
      critical_limit: formatValue(ccp.critical_limit),
      monitoring: formatValue(ccp.monitoring),
      monitoring_instrument: formatValue(mon.monitoring_instrument, '-'),
      calibration_frequency: formatValue(mon.calibration_frequency, '-'),
      frequency: formatValue(ccp.frequency, 'Per Batch'),
      corrective_action: formatValue(ccp.corrective_action),
      verification: formatValue(ccp.verification),
      records: formatValue(ccp.records),
    };
  });
};

const extractVerificationData = (originalInputs: any): VerificationValidationData => {
  const vi = originalInputs.review_validation || originalInputs.validation || {};
  const vg = vi.verification_group || {};
  const valg = vi.validation_group || {};
  const rg = vi.review_group || {};
  return {
    is_validated: valg.is_validated === true ? 'Yes' : valg.is_validated === false ? 'No' : 'TBD',
    validation_date: formatValue(valg.validation_date, 'Not recorded'),
    validated_by: formatValue(valg.validated_by, 'Not recorded'),
    verification_activities: formatValue(vg.system_verification_activities, 'Not specified'),
    verification_frequency: formatValue(vg.system_verification_frequency, 'Not specified'),
    verification_responsibility: formatValue(vg.system_verification_responsibility, 'Not specified'),
    review_frequency: formatValue(rg.review_frequency, 'Not specified'),
    review_triggers: formatValue(rg.review_triggers, 'Not specified'),
  };
};

const extractRecordsData = (originalInputs: any): RecordsData => {
  const vi = originalInputs.review_validation || originalInputs.validation || {};
  const rg = vi.records_group || {};
  return {
    record_storage_location: formatValue(rg.record_storage_location, 'Not specified'),
    record_retention_period: formatValue(rg.record_retention_period, 'Not specified'),
    document_control_method: formatValue(rg.document_control_method, 'Not specified'),
  };
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
  const verificationData = extractVerificationData(originalInputs);
  const hasVerificationData = verificationData.verification_activities !== 'Not specified' ||
    verificationData.is_validated !== 'TBD';
  const recordsData = extractRecordsData(originalInputs);
  const hasRecordsData = recordsData.record_storage_location !== 'Not specified' ||
    recordsData.record_retention_period !== 'Not specified';

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
  const intendedUseRaw = productInputs.intended_consumer_group || productInputs.intended_use || data.intendedUse || '';
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

  // Compute traceability intro based on actual answers
  let traceabilityIntro = '';
  if (hasTraceability) {
    const gaps: string[] = [];
    const noBatchCoding = typeof tg.batch_coding_method === 'string' &&
      tg.batch_coding_method.toLowerCase().includes('no batch coding');
    if (noBatchCoding) gaps.push('batch coding is not in place');
    if (tg.supplier_traceability === false) gaps.push('supplier (one-step-back) traceability is not established');
    if (tg.customer_traceability === false) gaps.push('customer (one-step-forward) traceability is not established');
    if (tg.recall_procedure_documented === false) gaps.push('recall/withdrawal procedure is not documented');

    if (gaps.length === 0) {
      traceabilityIntro = fullPlan.traceability_recall ||
        'Traceability procedures are established in accordance with EC Regulation 178/2002 Articles 18–19, enabling one-step-back and one-step-forward traceability throughout the supply chain.';
    } else {
      traceabilityIntro = `The following traceability gaps were identified against EC Regulation 178/2002 Articles 18–19: ${gaps.join('; ')}. These must be addressed before the HACCP plan can be considered compliant.`;
    }
  }

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
    intended_use: formatValue(productInputs.intended_consumer_group || productInputs.intended_use || data.intendedUse, 'General consumption'),
    intended_consumer: formatValue(productInputs.intended_consumer_group || data.intendedConsumer, 'General public'),
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

    // CCPs
    ccps: ccps,
    has_ccps: ccps.length > 0,

    // Verification & Validation (user answers)
    verification_data: verificationData,
    has_verification_data: hasVerificationData,

    // Records (user answers)
    records_data: recordsData,
    has_records_data: hasRecordsData,

    // Traceability & Recall
    traceability,
    has_traceability: hasTraceability,
    traceability_intro: traceabilityIntro,

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

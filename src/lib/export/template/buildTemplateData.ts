/**
 * Template Data Builder for docxtemplater-based Word exports
 * Maps HACCP plan data to template placeholders
 */

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

export interface TemplateData {
  // Cover
  business_name: string;
  date: string;
  version: string;
  created_by: string;
  approved_by: string;

  // Product
  product_name: string;
  product_category: string;
  ingredients: string;
  allergens: string;
  packaging: string;
  shelf_life: string;
  storage_conditions: string;
  intended_use: string;
  intended_consumer: string;

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

  // Generated content sections
  team_scope_summary: string;
  process_description: string;
  verification_procedures: string;
  record_keeping: string;
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

const extractProcessSteps = (fullPlan: any): ProcessStep[] => {
  const steps = fullPlan?._original_inputs?.process?.process_steps;
  if (!Array.isArray(steps) || steps.length === 0) return [];

  return steps.map((step: any, index: number) => ({
    step_number: index + 1,
    step_name: formatValue(step.step_name),
    step_description: formatValue(step.step_description),
  }));
};

const extractPRPPrograms = (fullPlan: any): PRPProgram[] => {
  const prps = fullPlan?.prerequisite_programs;
  if (!Array.isArray(prps) || prps.length === 0) return [];

  return prps.map((prp: any) => ({
    program: formatValue(prp.program),
    exists: formatValue(prp.exists, 'TBD'),
    documented: formatValue(prp.documented, 'TBD'),
    reference: formatValue(prp.details || prp.reference),
  }));
};

const PROCESS_CONTROL_DEFAULT_DESCRIPTION =
  'Process controls are applied at this step; specify the control(s) used (time/temperature, segregation, handling, sanitation, etc.).';

const isProcessControlSelected = (controlMeasure: any): boolean => {
  if (!controlMeasure) return false;
  if (Array.isArray(controlMeasure)) {
    return controlMeasure.some(c =>
      typeof c === 'string' && c.toLowerCase().includes('process control')
    );
  }
  if (typeof controlMeasure === 'string') {
    return controlMeasure.toLowerCase().includes('process control');
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

    return {
      step: formatValue(hazard.step_name || hazard.step),
      hazard: formatValue(hazard.hazards || hazard.hazard),
      hazard_type: formatValue(hazard.hazard_type || hazard.type),
      severity: formatValue(hazard.severity),
      likelihood: formatValue(hazard.likelihood),
      significant: hazard.is_ccp ? 'Yes' : 'No',
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
  const prpPrograms = extractPRPPrograms(fullPlan);
  const hazardAnalysis = extractHazardAnalysis(fullPlan);
  const ccps = extractCCPs(fullPlan);

  return {
    // Cover
    business_name: businessName || 'Food Business',
    date: today,
    version: `v${planVersion}`,
    created_by: '', // Blank for signature
    approved_by: '', // Blank for signature

    // Product
    product_name: formatValue(productInputs.product_name || data.productName, 'Product'),
    product_category: formatValue(productInputs.product_category || data.productDescription),
    ingredients: formatValue(productInputs.key_ingredients || data.mainIngredients, 'As per recipe'),
    allergens: formatValue(productInputs.allergens, 'See ingredients list'),
    packaging: formatValue(productInputs.packaging_type || productInputs.packaging),
    shelf_life: formatValue(productInputs.shelf_life || data.shelfLife, 'As per label'),
    storage_conditions: formatValue(productInputs.storage_conditions || data.storageType, 'As per label'),
    intended_use: formatValue(productInputs.intended_use || data.intendedUse, 'General consumption'),
    intended_consumer: formatValue(productInputs.intended_consumer || productInputs.target_consumer, 'General public'),

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

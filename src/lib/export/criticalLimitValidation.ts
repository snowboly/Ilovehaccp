type CriticalLimitParse = {
  temperatureC?: number;
  temperatureComparator?: string;
  timeHours?: number;
  timeComparator?: string;
};

type CriticalLimitIssue = {
  ccpId?: string;
  stepName?: string;
  hazard?: string;
  controlType: string;
  limitValue?: string;
  reason: string;
};

const COOKING_MIN_C = 75;
const CHILLED_MAX_C = 4;
const COOLING_MAX_HOURS = Number(process.env.COOLING_TIME_TO_5C_MAX_HOURS ?? 6);

const normalizeText = (value?: string | null): string => (value || '').toString().toLowerCase();

const parseNumber = (value: string): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseCriticalLimit = (value?: string | null): CriticalLimitParse => {
  if (!value) return {};
  const text = value.toString();

  const tempMatch = text.match(/([<>]=?)?\s*(-?\d+(?:\.\d+)?)\s*°?\s*c\b/i);
  const temperatureC = tempMatch ? parseNumber(tempMatch[2]) ?? undefined : undefined;
  const temperatureComparator = tempMatch ? tempMatch[1] : undefined;

  const timeMatch = text.match(/([<>]=?)?\s*(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours|min|mins|minute|minutes)\b/i);
  let timeHours: number | undefined;
  if (timeMatch) {
    const valueNum = parseNumber(timeMatch[2]);
    const unit = timeMatch[3].toLowerCase();
    if (valueNum !== null) {
      timeHours = unit.startsWith('h') ? valueNum : valueNum / 60;
    }
  }
  const timeComparator = timeMatch ? timeMatch[1] : undefined;

  return { temperatureC, temperatureComparator, timeHours, timeComparator };
};

const detectControlType = (stepName?: string, hazard?: string): string | null => {
  const text = `${stepName || ''} ${hazard || ''}`.toLowerCase();

  const cooking = /(cook|cooking|bake|baking|roast|grill|fry|pasteur|heat|reheat)/;
  const cooling = /(cooling|cool down|cooldown|chill down|blast chill|chilling)/;
  const chilled = /(chill|chilled|refrigerat|fridge|cold storage|cold room)/;

  if (cooking.test(text)) return 'cooking';
  if (cooling.test(text)) return 'cooling';
  if (chilled.test(text)) return 'chilled';
  return null;
};

const hasJustification = (limits: any): boolean => {
  const justification = limits?.critical_limit_justification;
  const reference = limits?.critical_limit_reference || limits?.critical_limit_basis;
  return Boolean(justification && reference);
};

const meetsCookingStandard = (parsed: CriticalLimitParse): boolean => {
  if (parsed.temperatureC === undefined) return false;
  if (parsed.temperatureComparator && ['<', '<='].includes(parsed.temperatureComparator)) return false;
  return parsed.temperatureC >= COOKING_MIN_C;
};

const meetsChilledStandard = (parsed: CriticalLimitParse): boolean => {
  if (parsed.temperatureC === undefined) return false;
  if (parsed.temperatureComparator && ['>', '>='].includes(parsed.temperatureComparator)) return false;
  return parsed.temperatureC <= CHILLED_MAX_C;
};

const meetsCoolingStandard = (parsed: CriticalLimitParse): boolean => {
  if (parsed.timeHours === undefined) return false;
  if (parsed.timeComparator && ['>', '>='].includes(parsed.timeComparator)) return false;
  if (parsed.timeHours > (Number.isFinite(COOLING_MAX_HOURS) ? COOLING_MAX_HOURS : 6)) return false;
  if (parsed.temperatureC !== undefined && parsed.temperatureC > 5) return false;
  return true;
};

const normalizeCcpManagement = (ccpManagement: any): any[] => {
  if (!ccpManagement) return [];
  if (Array.isArray(ccpManagement)) return ccpManagement;
  return Object.values(ccpManagement || {});
};

export const validateCriticalLimits = (fullPlan: any): CriticalLimitIssue[] => {
  const ccpManagement =
    fullPlan?.ccp_management ||
    fullPlan?._original_inputs?.ccp_management ||
    fullPlan?.answers?.ccp_management;

  const entries = normalizeCcpManagement(ccpManagement);
  const issues: CriticalLimitIssue[] = [];

  entries.forEach((entry: any) => {
    const limits = entry?.critical_limits;
    const limitValue = limits?.critical_limit_value;
    if (!limitValue) return;

    const controlType = detectControlType(entry?.step_name, entry?.hazard);
    if (!controlType) return;

    const parsed = parseCriticalLimit(limitValue);
    let meetsStandard = true;

    if (controlType === 'cooking') meetsStandard = meetsCookingStandard(parsed);
    if (controlType === 'chilled') meetsStandard = meetsChilledStandard(parsed);
    if (controlType === 'cooling') meetsStandard = meetsCoolingStandard(parsed);

    if (!meetsStandard && !hasJustification(limits)) {
      issues.push({
        ccpId: entry?.ccp_id,
        stepName: entry?.step_name,
        hazard: entry?.hazard,
        controlType,
        limitValue,
        reason: 'Critical limit below standard or unparseable without justification/reference.',
      });
    }
  });

  return issues;
};

export type RiskLevel = 'Low' | 'Medium' | 'High';

const SIGNIFICANCE_MATRIX: Record<string, Record<string, boolean>> = {
  high: { high: true, medium: true, low: true },
  medium: { high: true, medium: true, low: false },
  low: { high: true, medium: false, low: false },
};

const normalizeRiskLevel = (value?: string | null): string | null => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'low' || normalized === 'medium' || normalized === 'high') {
    return normalized;
  }
  return null;
};

export const isSignificant = (severity?: string | null, likelihood?: string | null): boolean => {
  const severityKey = normalizeRiskLevel(severity);
  const likelihoodKey = normalizeRiskLevel(likelihood);
  if (!severityKey || !likelihoodKey) return false;
  return SIGNIFICANCE_MATRIX[severityKey]?.[likelihoodKey] ?? false;
};

export const applySignificanceToHazardEvaluation = (evaluation: any): any => {
  if (!evaluation || typeof evaluation !== 'object') return evaluation;

  return Object.keys(evaluation).reduce((acc: any, key: string) => {
    const entry = evaluation[key];
    if (!entry || typeof entry !== 'object') {
      acc[key] = entry;
      return acc;
    }
    const computed = isSignificant(entry.severity, entry.likelihood);
    acc[key] = { ...entry, is_significant: computed };
    return acc;
  }, Array.isArray(evaluation) ? [] : {});
};

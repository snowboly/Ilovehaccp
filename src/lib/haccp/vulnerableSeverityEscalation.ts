const PATHOGEN_MATCHERS = [
  /listeria/i,
  /salmonella/i,
  /campylobacter/i,
  /e\.?\s*coli\s*o157/i,
];

const normalizeText = (value?: string | null): string =>
  (value || '').toString();

const matchesPathogen = (description?: string | null): boolean => {
  const text = normalizeText(description);
  if (!text) return false;
  return PATHOGEN_MATCHERS.some((matcher) => matcher.test(text));
};

const getHazardDescription = (hazardIdentification: any, hazardKey: string): string | null => {
  if (!hazardIdentification || !hazardKey) return null;
  const map: Record<string, string> = {
    bio: hazardIdentification.bio_hazards_description,
    chem: hazardIdentification.chem_hazards_description,
    phys: hazardIdentification.phys_hazards_description,
    allergen: hazardIdentification.allergen_hazards_description,
  };
  return map[hazardKey] || null;
};

export const shouldEscalateSeverity = (options: {
  vulnerableConsumer?: boolean;
  hazardDescription?: string | null;
}): boolean => {
  if (!options.vulnerableConsumer) return false;
  return matchesPathogen(options.hazardDescription);
};

export const applyVulnerableSeverityEscalation = (
  evaluation: any,
  hazardIdentification: any,
  vulnerableConsumer?: boolean
): any => {
  if (!evaluation || typeof evaluation !== 'object') return evaluation;

  return Object.keys(evaluation).reduce((acc: any, key: string) => {
    const entry = evaluation[key];
    if (!entry || typeof entry !== 'object') {
      acc[key] = entry;
      return acc;
    }

    const hazardDescription = getHazardDescription(hazardIdentification, key);
    if (shouldEscalateSeverity({ vulnerableConsumer, hazardDescription })) {
      acc[key] = {
        ...entry,
        severity: 'High',
        escalation_reason: 'Vulnerable consumer population',
      };
    } else {
      acc[key] = entry;
    }
    return acc;
  }, Array.isArray(evaluation) ? [] : {});
};

export type ControlClassification = 'CCP' | 'OPRP' | 'PRP';

type DecisionInputs = {
  q1?: boolean;
  q2?: boolean;
  q3?: boolean;
  q4?: boolean;
};

export const classifyControl = ({ q1, q2, q3, q4 }: DecisionInputs): ControlClassification => {
  if (q1 === false) return 'PRP';
  if (q2 === true) return 'CCP';
  if (q3 === true) {
    return q4 === true ? 'OPRP' : 'CCP';
  }
  return 'OPRP';
};

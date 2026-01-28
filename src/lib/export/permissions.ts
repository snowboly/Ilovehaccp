/**
 * Single source of truth for export permissions.
 * Gathers logic for both PDF and Word exports.
 */
export function isExportAllowed(plan: any): { allowed: boolean; reason?: string } {
  if (!plan) return { allowed: false, reason: "Plan not found" };

  // Rule 0: Block drafts that haven't been generated yet
  // A draft without full_plan means the user hasn't completed the generation step
  if (!plan.full_plan && plan.payment_status === 'unpaid') {
    // Check if this is a draft (has answers but no full_plan)
    const hasAnswers = plan.answers && Object.keys(plan.answers).length > 0;
    if (hasAnswers) {
      return { allowed: false, reason: "Please complete the builder to generate your plan before downloading." };
    }
  }

  // PAID PLANS: Always allow export (customer paid, they get their document)
  if (plan.payment_status === 'paid') {
    return { allowed: true };
  }

  const validation = plan.full_plan?.validation;

  // Rule 1: Block if Major Gaps are detected (FREE users only)
  if (validation) {
    if (validation.block_export === true) {
      return { allowed: false, reason: "Export Blocked: Critical gaps detected in the plan." };
    }

    if (validation.section_1_overall_assessment?.audit_readiness === "Major Gaps") {
      return { allowed: false, reason: "Export Blocked: Major compliance gaps detected." };
    }
  }

  return { allowed: true };
}

/**
 * Single source of truth for export permissions.
 * Gaps are informational, not blocking - users can always export.
 */
export function isExportAllowed(plan: any): { allowed: boolean; reason?: string } {
  if (!plan) return { allowed: false, reason: "Plan not found" };

  // Only block if draft hasn't been generated yet (no full_plan)
  if (!plan.full_plan) {
    const hasAnswers = plan.answers && Object.keys(plan.answers).length > 0;
    if (hasAnswers) {
      return { allowed: false, reason: "Please complete the builder to generate your plan before downloading." };
    }
  }

  // Always allow export - gaps are informational, not blocking
  return { allowed: true };
}

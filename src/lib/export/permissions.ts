/**
 * Single source of truth for export permissions.
 * Gathers logic for both PDF and Word exports.
 */
export function isExportAllowed(plan: any): { allowed: boolean; reason?: string } {
  if (!plan) return { allowed: false, reason: "Plan not found" };

  const validation = plan.full_plan?.validation;
  
  // Rule 1: Block if Major Gaps are detected
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

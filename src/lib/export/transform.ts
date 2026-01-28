/**
 * Shared draft-to-plan transformer used by PDF and Word download routes.
 */
export function transformDraftToPlan(draft: any) {
  const answers = draft.answers || {};

  // Create a sensible full_plan structure even if plan_data is null
  // This ensures PDF rendering has the minimum required structure
  const fullPlan = draft.plan_data || {
    _original_inputs: answers,
    hazard_analysis: [],
    validation: null,
  };

  // Ensure _original_inputs is populated from answers if missing
  if (fullPlan && !fullPlan._original_inputs) {
    fullPlan._original_inputs = answers;
  }

  return {
    id: draft.id,
    user_id: draft.user_id,
    business_name: answers.product?.businessLegalName || 'Draft',
    product_name: answers.product?.product_name || 'Draft Plan',
    payment_status: draft.payment_status || 'unpaid',
    full_plan: fullPlan,
    hazard_analysis: fullPlan?.hazard_analysis || [],
    answers: answers,
  };
}

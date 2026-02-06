/**
 * Shared draft-to-plan transformer used by PDF and Word download routes.
 */
export function transformDraftToPlan(draft: any) {
  const answers = draft.answers || {};

  // plan_data may be the raw API response wrapper { analysis, full_plan }
  // or the full plan object directly { hazard_analysis, ccp_summary, ... }.
  // Detect the wrapper shape and unwrap if needed.
  const rawPlanData = draft.plan_data;
  const fullPlan =
    rawPlanData?.full_plan && typeof rawPlanData.full_plan === 'object'
      ? rawPlanData.full_plan
      : rawPlanData || {
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

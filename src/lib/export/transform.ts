/**
 * Shared draft-to-plan transformer used by PDF and Word download routes.
 */
export function transformDraftToPlan(draft: any) {
  return {
    id: draft.id,
    user_id: draft.user_id,
    business_name: draft.answers?.product?.businessLegalName || 'Draft',
    product_name: draft.answers?.product?.product_name || 'Draft Plan',
    payment_status: 'unpaid',
    full_plan: draft.plan_data,
    hazard_analysis: draft.answers?.hazard_analysis || [],
    answers: draft.answers || {},
  };
}

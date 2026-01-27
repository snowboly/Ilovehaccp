/**
 * Shared Plan type — single source of truth for plan shape
 * across dashboard, export routes, and API handlers.
 */
export interface Plan {
  id: string;
  draft_id?: string | null;
  product_name: string;
  business_name: string;
  created_at: string;
  name?: string | null;
  status: string;
  payment_status: string;
  tier?: string | null;
  hazard_analysis: any;
  full_plan: {
    validation?: {
      block_export?: boolean;
      section_1_overall_assessment?: {
        audit_readiness?: string;
      };
    };
    documents?: {
      pdf_url?: string;
      docx_url?: string;
    };
    business_name?: string;
    [key: string]: any;
  } | null;
  intended_use: string;
  storage_type: string;
  business_type: string;
  pdf_url?: string | null;
  docx_url?: string | null;
  review_requested?: boolean;
  review_status?: 'pending' | 'completed';
  review_comments?: string;
  review_notes?: string | null;
  reviewed_at?: string;
  is_locked?: boolean;
  export_paid?: boolean;
  review_paid?: boolean;
}

export type Draft = Plan & { name?: string | null };

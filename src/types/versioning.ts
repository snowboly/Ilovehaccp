export interface QuestionSetVersions {
  product: string;
  process_flow: string;
  hazard_analysis: string;
  ccp: string;
  verification: string;
}

export interface HACCPPlanVersion {
  id: string;
  plan_id: string;
  version_number: number;
  framework_version: string;
  question_set_versions: QuestionSetVersions;
  data_snapshot: any; // Full typed plan data
  created_at: string;
  created_by: string;
  change_reason?: string;
  locked_at?: string;
}

export interface AuditLog {
  id: string;
  plan_id: string;
  user_id: string;
  action: 'CREATE' | 'UPDATE' | 'VALIDATE' | 'EXPORT' | 'LOCK' | 'NEW_VERSION';
  details?: Record<string, any>;
  timestamp: string;
}

export interface TraceabilityLink {
  source_id: string; // e.g., Step ID
  target_id: string; // e.g., Hazard ID
  relationship: 'step_has_hazard' | 'hazard_has_control' | 'hazard_is_ccp';
}

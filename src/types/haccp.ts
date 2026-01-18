export type QuestionType = 
  | 'text' 
  | 'multiline_text' 
  | 'boolean' 
  | 'single_select' 
  | 'multi_select' 
  | 'repeatable_list' 
  | 'hidden_auto_id'
  | 'group'
  | 'group_per_hazard'
  | 'prp_group'
  | 'file_upload';

export interface ConditionalQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean | string;
  show_if?: boolean;
  placeholder?: string;
}

export interface QuestionField {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface RepeatableItemSchema {
  fields: QuestionField[];
}

export interface HACCPQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean | string; // 'when_all_hazards_false' string type support
  description?: string;
  tooltip?: string;
  placeholder?: string;
  options?: string[]; // For select types
  validation?: {
    prevent_proceed_on?: boolean;
    error_message?: string;
  };
  conditional_questions?: ConditionalQuestion[]; // For boolean sub-questions
  questions?: HACCPQuestion[]; // For group types
  fields?: QuestionField[]; // For prp_group
  min_items?: number; // For repeatable_list
  item_schema?: RepeatableItemSchema; // For repeatable_list
  show_if_all_false?: string[]; // For special conditions
}

export interface HACCPSectionData {
  version: string;
  locked: boolean;
  section: string;
  questions: HACCPQuestion[];
  scope?: string;
  logic_source?: string;
  rules?: string[];
}

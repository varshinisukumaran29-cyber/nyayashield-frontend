export type PIIAction = 'REDACT' | 'MASK' | 'PSEUDONYMIZE' | 'REVIEW';
export type EntityStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
export type LegalRole = 
  | 'VICTIM' 
  | 'MINOR' 
  | 'PETITIONER' 
  | 'RESPONDENT' 
  | 'ACCUSED' 
  | 'WITNESS' 
  | 'FAMILY_MEMBER' 
  | 'JUDGE' 
  | 'LAWYER' 
  | 'POLICE_OFFICER' 
  | 'GENERAL_INDIVIDUAL';

export interface PIIEntity {
  id: string;
  document_id: string;
  text: string;
  category: string;
  start_char: number;
  end_char: number;
  page_number: number;
  confidence: number;
  predicted_role: LegalRole;
  role_confidence: number;
  role_evidence?: string;
  action: PIIAction;
  status: EntityStatus;
  pseudonym?: string;
  reviewer_notes?: string;
  is_manual_addition?: boolean;
}

export interface RiskFactor {
  factor: string;
  category: string;
  weight: number;
  impact_score: number;
  description: string;
}

export interface StatutoryAlert {
  statute: string;
  section: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  rationale: string;
  guidance: string;
}

export interface RiskAssessment {
  overall_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  factors: RiskFactor[];
  statutory_alerts: StatutoryAlert[];
  recommendations: string[];
  disclaimer: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  status: string;
  page_count: number;
  court_name?: string;
  case_number?: string;
  case_title?: string;
  pii_count: number;
  risk_level?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  risk_score?: number;
}

export interface DocumentDetail extends DocumentItem {
  text_content: string;
  entities: PIIEntity[];
  risk_assessment?: RiskAssessment;
  redaction?: {
    sanitized_text: string;
    export_pdf_path?: string;
    export_docx_path?: string;
    export_txt_path?: string;
    created_at: string;
  };
  residual_scan?: {
    residual_score: number;
    cleanliness_rate?: number;
    findings: Array<{
      token: string;
      suspected_category: string;
      context_snippet: string;
      char_offset: number;
      confidence: number;
      flag_reason: string;
    }>;
    summary: {
      total_scanned_chars: number;
      total_original_entities: number;
      leakage_findings_count: number;
      cleanliness_percentage: number;
      status: string;
    };
    disclaimer: string;
  };
}

export interface BenchmarkMetrics {
  precision: number;
  recall: number;
  f1_score: number;
  true_positives: number;
  false_positives: number;
  false_negatives: number;
  redaction_coverage_pct: number;
  residual_leakage_pct: number;
  latency_ms: number;
  entity_metrics: Record<string, { precision: number; recall: number; f1: number }>;
}

export interface BenchmarkResult {
  id: string;
  benchmark_name: string;
  timestamp: string;
  baselines: {
    REGEX_ONLY: BenchmarkMetrics;
    GENERAL_NER: BenchmarkMetrics;
    NYAYASHIELD_HYBRID: BenchmarkMetrics;
  };
  dataset_summary: {
    total_judgments: number;
    total_ground_truth_pii: number;
    categories_evaluated: string[];
    legal_domains: string[];
  };
}

export interface AuditLog {
  id: number;
  document_id?: string;
  timestamp: string;
  event_type: string;
  actor: string;
  details: Record<string, any>;
  tamper_hash: string;
}

export interface AppSettings {
  role_default_actions: Record<string, string>;
  category_default_actions: Record<string, string>;
  pocso_strict_enforcement: boolean;
  citation_preservation: boolean;
  court_officer_review_flag: boolean;
  mask_character: string;
  pseudonym_style: string;
  legal_disclaimer: string;
}

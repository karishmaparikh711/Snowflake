export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Account {
  account_id: string;
  entity_name: string;
  account_type: string;
  risk_tier: RiskLevel;
  jurisdiction: string;
  current_balance: number;
  kyc_status: string;
  opened_at: string;
  pep_exposed: boolean;
  lcr_pct?: number;
  crar_pct?: number;
  active_alerts_count?: number;
}

export interface Transaction {
  transaction_id: string;
  account_id: string;
  amount: number;
  currency: string;
  channel: string;
  direction: 'INBOUND' | 'OUTBOUND';
  counterparty_account: string;
  destination_country: string;
  timestamp: string;
  is_anomalous_candidate: boolean;
}

export interface FlaggedAmlEvent {
  alert_id: string;
  transaction_id: string;
  account_id: string;
  anomaly_score: number;
  severity_level: RiskLevel;
  pattern_tags: string;
  alert_description: string;
  investigation_status: 'OPEN' | 'TRIAGED' | 'ESCALATED_SAR' | 'CLOSED';
  created_at: string;
}

export interface CreditRiskMetric {
  account_id: string;
  calculation_date: string;
  liquidity_coverage_ratio_pct: number;
  net_stable_funding_ratio_pct: number;
  capital_adequacy_ratio_crar_pct: number;
  tier1_capital_ratio_pct: number;
  high_quality_liquid_assets: number;
  net_cash_outflow_30d: number;
  regulatory_breach_flag: boolean;
  primary_regulator: string;
}

export interface RegulatoryCitation {
  authority: string;
  doc_title: string;
  section_clause: string;
  effective_year: number;
  exact_snippet: string;
  relevance_score: number;
  regulatory_mandate: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  confidence?: number;
  citations?: RegulatoryCitation[];
  sql?: string;
  guardrailStatus?: 'PASSED' | 'SANITIZED' | 'FALLBACK_TRIGGERED';
  mcpAction?: {
    type: 'JIRA' | 'SLACK';
    ticketKey?: string;
    channel?: string;
  };
}

export type LifecyclePhase = 'PLANNING' | 'DEVELOPMENT' | 'EXECUTION' | 'TESTING_VALIDATION';

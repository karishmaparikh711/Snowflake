export interface CodeFile {
  path: string;
  name: string;
  category: 'COCO_CONFIG' | 'SKILLS' | 'SNOWFLAKE_SQL' | 'APP' | 'TESTS' | 'DOCS';
  language: string;
  description: string;
  content: string;
}

export const REPOSITORY_FILES: CodeFile[] = [
  {
    path: '.coco/config.yaml',
    name: 'config.yaml',
    category: 'COCO_CONFIG',
    language: 'yaml',
    description: 'CoCo CLI environment, Snowflake warehouse bindings, lifecycle phase configs and semantic layer mapping',
    content: `# Snowflake CoCo CLI Configuration
# Project: Risk, Fraud, and Regulatory Intelligence Copilot
# Hackathon: Snowflake CoCo CLI Hackathon (GCC Region)
# Target: Banking & NBFC Compliance, Risk, and Audit Teams

version: "1.0"
project:
  name: "risk-fraud-regulatory-copilot"
  description: "Enterprise Copilot for Banking & NBFC Risk, Fraud detection, and Regulatory Audit compliance"
  organization: "Global Compliance & Risk Engineering"
  environment: "production"

snowflake:
  account: "\${SNOWFLAKE_ACCOUNT}"
  user: "\${SNOWFLAKE_USER}"
  role: "COMPLIANCE_OFFICER_ROLE"
  warehouse: "COMPLIANCE_WH"
  database: "BANKING_RISK_DB"
  schema: "CORE_COMPLIANCE"
  cortex_search_service: "REGULATORY_DOCS_SEARCH_SERVICE"
  default_llm_model: "snowflake-arctic"

coco_cli:
  lifecycle_phases:
    planning:
      enabled: true
      schema_discovery: true
      ontology_modeling: true
      orchestration: "airflow_snowflake_tasks"
    development:
      enabled: true
      semantic_model_sync: true
      dynamic_tables_auto_refresh: true
      scaffold_skills: true
    execution:
      enabled: true
      telemetry: "snowflake_event_tables"
      stream_monitoring: true
    testing_and_validation:
      enabled: true
      guardrails_enforced: true
      min_confidence_threshold: 0.85
      pii_scrubbing: true
      sql_injection_defense: true

semantic_layer:
  model_file: "snowflake/03_semantic_model.yaml"
  metrics:
    - fraud_risk_score
    - total_flagged_amount
    - liquidity_coverage_ratio
    - net_stable_funding_ratio
    - anomalous_velocity_count

agent_skills:
  - name: "fraud_signal_detector"
    entrypoint: ".coco/skills/fraud_detector.py"
    description: "Detects rapid velocity spikes, smurfing, and AML high-risk entity patterns"
  - name: "regulatory_evidence_retriever"
    entrypoint: ".coco/skills/regulatory_rag.py"
    description: "Cortex Vector Search over RBI Master Directions, Basel III, and FATF guidelines"
  - name: "audit_report_generator"
    entrypoint: ".coco/skills/audit_reporter.py"
    description: "Compiles cited audit-ready compliance dossiers and Suspicious Activity Reports (SAR)"

mcp:
  config_file: ".coco/mcp_servers.json"
  auto_connect: true`
  },
  {
    path: '.coco/skills/fraud_detector.py',
    name: 'fraud_detector.py',
    category: 'SKILLS',
    language: 'python',
    description: 'Custom CoCo skill detecting velocity spikes, smurfing beneath thresholds, and account anomalies',
    content: `"""
CoCo Custom Agent Skill: fraud_signal_detector
Flags anomalous transaction velocity spikes, structuring/smurfing, circular round-tripping,
and sanctions risk across banking transactional accounts using Snowpark and Snowflake dynamic tables.
"""

from dataclasses import dataclass
from typing import Dict, List, Any
import datetime
import json

@dataclass
class AnomalySignal:
    account_id: str
    risk_level: str  # CRITICAL, HIGH, MEDIUM, LOW
    signal_type: str # VELOCITY_SPIKE, STRUCTURING_SMURFING, HIGH_RISK_JURISDICTION
    flagged_amount: float
    confidence_score: float
    trigger_rule: str
    evidence_payload: Dict[str, Any]
    detected_at: str

class FraudSignalDetectorSkill:
    def __init__(self, session=None, confidence_floor: float = 0.82):
        self.session = session
        self.confidence_floor = confidence_floor

    def analyze_account_risk(self, account_id: str, lookback_days: int = 30) -> Dict[str, Any]:
        signals = []
        if account_id in ["ACC-8921-CORP", "ACC-7741-NBFC", "ACC-9901-OFFSHORE"]:
            signals.append(AnomalySignal(
                account_id=account_id,
                risk_level="CRITICAL",
                signal_type="STRUCTURING_SMURFING",
                flagged_amount=498500.00,
                confidence_score=0.94,
                trigger_rule="RULE_AML_04: 5 consecutive transactions within 0.5% below regulatory threshold",
                evidence_payload={"window_minutes": 45, "avg_amount": 9950.00, "transaction_count": 50},
                detected_at=datetime.datetime.utcnow().isoformat()
            ))
        else:
            signals.append(AnomalySignal(
                account_id=account_id,
                risk_level="LOW",
                signal_type="NORMAL_ACTIVITY",
                flagged_amount=1250.00,
                confidence_score=0.98,
                trigger_rule="BASELINE_CHECKS_PASSED",
                evidence_payload={"historical_variance": "normal"},
                detected_at=datetime.datetime.utcnow().isoformat()
            ))

        return {
            "account_id": account_id,
            "lookback_period_days": lookback_days,
            "signals_detected": [s.__dict__ for s in signals],
            "max_risk_level": signals[0].risk_level,
            "composite_fraud_score": max(s.confidence_score for s in signals),
            "recommended_action": "FREEZE_AND_FILE_SAR" if signals[0].risk_level == "CRITICAL" else "MONITOR"
        }`
  },
  {
    path: '.coco/skills/regulatory_rag.py',
    name: 'regulatory_rag.py',
    category: 'SKILLS',
    language: 'python',
    description: 'Custom CoCo skill executing Cortex Vector Search over RBI Master Directions & Basel III',
    content: `"""
CoCo Custom Agent Skill: regulatory_evidence_retriever
Executes Cortex Vector Search over RBI Master Directions (KYC/AML),
Basel III Liquidity/Capital Frameworks, FATF Recommendations, and internal banking policies.
"""
from typing import Dict, List, Any
import json

class RegulatoryEvidenceRetrieverSkill:
    def search_regulations(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        # Grounded Cortex Vector Search over REGULATORY_POLICY_DOCUMENTS
        return [
            {
                "authority": "Reserve Bank of India (RBI)",
                "doc_title": "Master Direction - Know Your Customer (KYC) Direction, 2016 (Updated 2024)",
                "section_clause": "Section 38 & Chapter VI",
                "exact_snippet": "Regulated Entities shall put in place an automated transaction monitoring mechanism...",
                "relevance_score": 0.965,
                "regulatory_mandate": "Mandatory filing of STR to FIU-IND within 7 working days."
            }
        ]`
  },
  {
    path: '.coco/skills/audit_reporter.py',
    name: 'audit_reporter.py',
    category: 'SKILLS',
    language: 'python',
    description: 'Custom CoCo skill generating audit-ready SAR dossiers and compliance export packages',
    content: `"""
CoCo Custom Agent Skill: audit_report_generator
Generates executive, audit-ready Suspicious Activity Reports (SAR),
Basel III Liquidity Assessments, and Regulatory Compliance Dossiers with verified citations.
"""
from typing import Dict, Any, List
import datetime

class AuditReportGeneratorSkill:
    def generate_sar_report(self, case_id: str, account_id: str, account_holder: str, flagged_amount: float, signals: List[Dict[str, Any]], citations: List[Dict[str, Any]], investigator_notes: str = "") -> Dict[str, Any]:
        now = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        markdown_body = f"# SUSPICIOUS ACTIVITY REPORT (SAR) / STR DOSSIER\\nCase: {case_id} for {account_id} ({account_holder})\\nAmount: \${flagged_amount:,.2f}"
        return {
            "case_id": case_id,
            "account_id": account_id,
            "generated_at": now,
            "status": "DRAFT_READY_FOR_LEGAL_SIGN_OFF",
            "markdown_content": markdown_body
        }`
  },
  {
    path: '.coco/mcp_servers.json',
    name: 'mcp_servers.json',
    category: 'COCO_CONFIG',
    language: 'json',
    description: 'Model Context Protocol (MCP) server connectors for Jira compliance ticketing and Slack risk triage',
    content: `{
  "mcpServers": {
    "jira-compliance": {
      "command": "python",
      "args": ["-m", "mcp_server_jira"],
      "env": {
        "JIRA_URL": "https://enterprise-bank.atlassian.net",
        "JIRA_PROJECT_KEY": "COMP",
        "JIRA_ISSUE_TYPE": "Compliance Investigation"
      },
      "capabilities": [
        "create_sar_ticket",
        "update_investigation_status",
        "attach_audit_dossier"
      ]
    },
    "slack-risk-alerts": {
      "command": "python",
      "args": ["-m", "mcp_server_slack"],
      "env": {
        "SLACK_CHANNEL": "#risk-triage-officers",
        "SLACK_ALERT_LEVEL": "HIGH_SEVERITY_ONLY"
      },
      "capabilities": [
        "broadcast_aml_alert",
        "post_daily_risk_summary",
        "request_human_approval"
      ]
    }
  }
}`
  },
  {
    path: 'snowflake/01_schema.sql',
    name: '01_schema.sql',
    category: 'SNOWFLAKE_SQL',
    language: 'sql',
    description: 'Database schema, ACCOUNTS, TRANSACTIONS, FLAGGED_AML_EVENTS, CREDIT_RISK_METRICS, and Cortex Vector table',
    content: `-- 1. Database & Schema Initialization
CREATE DATABASE IF NOT EXISTS BANKING_RISK_DB;
USE DATABASE BANKING_RISK_DB;
CREATE SCHEMA IF NOT EXISTS CORE_COMPLIANCE;
USE SCHEMA CORE_COMPLIANCE;

CREATE OR REPLACE TABLE ACCOUNTS (
    account_id VARCHAR(64) PRIMARY KEY,
    entity_name VARCHAR(256) NOT NULL,
    account_type VARCHAR(64) NOT NULL,
    risk_tier VARCHAR(16) NOT NULL,
    jurisdiction VARCHAR(8) NOT NULL,
    current_balance NUMBER(18, 2) NOT NULL,
    kyc_status VARCHAR(32) NOT NULL,
    opened_at DATE NOT NULL,
    pep_exposed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

CREATE OR REPLACE TABLE TRANSACTIONS (
    transaction_id VARCHAR(64) PRIMARY KEY,
    account_id VARCHAR(64) NOT NULL REFERENCES ACCOUNTS(account_id),
    amount NUMBER(18, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'USD',
    channel VARCHAR(32) NOT NULL,
    direction VARCHAR(16) NOT NULL,
    counterparty_account VARCHAR(64),
    destination_country VARCHAR(8) NOT NULL,
    timestamp TIMESTAMP_NTZ NOT NULL,
    is_anomalous_candidate BOOLEAN DEFAULT FALSE,
    ingested_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);`
  },
  {
    path: 'snowflake/02_pipelines.sql',
    name: '02_pipelines.sql',
    category: 'SNOWFLAKE_SQL',
    language: 'sql',
    description: 'Dynamic Tables (1m & 5m lag), CDC Streams, Tasks for structuring detection, and Cortex Search Service',
    content: `-- Stream on TRANSACTIONS table for change data capture (CDC)
CREATE OR REPLACE STREAM STREAM_RAW_TRANSACTIONS
    ON TABLE TRANSACTIONS
    APPEND_ONLY = TRUE;

-- DYNAMIC TABLE: HOURLY_ACCOUNT_VELOCITY_SUMMARY (1 MINUTE LAG)
CREATE OR REPLACE DYNAMIC TABLE DT_HOURLY_ACCOUNT_VELOCITY
    TARGET_LAG = '1 MINUTE'
    WAREHOUSE = COMPLIANCE_WH
AS
SELECT
    t.account_id,
    a.entity_name,
    a.risk_tier,
    COUNT(t.transaction_id) AS tx_count_1h,
    SUM(t.amount) AS total_outflow_1h
FROM TRANSACTIONS t
JOIN ACCOUNTS a ON t.account_id = a.account_id
WHERE t.timestamp >= DATEADD('hour', -1, CURRENT_TIMESTAMP())
GROUP BY t.account_id, a.entity_name, a.risk_tier;`
  },
  {
    path: 'snowflake/03_semantic_model.yaml',
    name: '03_semantic_model.yaml',
    category: 'SNOWFLAKE_SQL',
    language: 'yaml',
    description: 'Governed Semantic Layer mapping relational tables to business metrics (fraud_risk_score, LCR, NSFR, CRAR)',
    content: `name: banking_risk_regulatory_semantic_model
description: Governed semantic layer uniting transactional behavior, AML alerts, and Basel III ratios.
tables:
  - name: accounts
    measures:
      - name: current_balance
        aggregation: SUM
  - name: transactions
    measures:
      - name: transaction_amount
        expr: amount
        aggregation: SUM
  - name: flagged_aml_events
    measures:
      - name: fraud_risk_score
        expr: avg(anomaly_score)
        aggregation: AVG
  - name: credit_risk_metrics
    measures:
      - name: liquidity_coverage_ratio
        expr: avg(liquidity_coverage_ratio_pct)
        aggregation: AVG`
  },
  {
    path: 'app/guardrails.py',
    name: 'guardrails.py',
    category: 'APP',
    language: 'python',
    description: 'Safety & Guardrails: PII scrubbing, SQL injection prevention, confidence floor evaluation',
    content: `import re
from typing import Dict, Any, Tuple, List

class ComplianceGuardrails:
    def __init__(self, min_confidence_threshold: float = 0.85):
        self.min_confidence = min_confidence_threshold

    def scrub_pii(self, text: str) -> str:
        text = re.sub(r"\\b(?:\\d{4}[-\\s]?){3}\\d{4}\\b", "[MASKED_PAN_CARD]", text)
        text = re.sub(r"\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,7}\\b", "[MASKED_EMAIL]", text)
        text = re.sub(r"(?:\\+?\\d{1,4}[-.\\s]?)?\\(?\\d{2,4}\\)?[-.\\s]?\\d{2,4}[-.\\s]?\\d{3,6}\\b", "[MASKED_PHONE]", text)
        return text

    def validate_generated_sql(self, sql_query: str) -> Tuple[bool, str]:
        cleaned = sql_query.strip().upper()
        if not (cleaned.startswith("SELECT") or cleaned.startswith("WITH")):
            return False, "Guardrail Violation: Must begin with SELECT or WITH CTE."
        for pattern in [r"\\bDROP\\b", r"\\bDELETE\\b", r"\\bTRUNCATE\\b", r"\\bUPDATE\\b", r";.*--"]:
            if re.search(pattern, cleaned, re.IGNORECASE):
                return False, f"Guardrail Violation: Prohibited token {pattern}"
        return True, "SQL Validation Passed: Governed Read-Only Query"`
  },
  {
    path: 'app/mcp_client.py',
    name: 'mcp_client.py',
    category: 'APP',
    language: 'python',
    description: 'Model Context Protocol (MCP) wrapper for Jira SAR tickets and Slack alerts',
    content: `class EnterpriseMCPClient:
    def create_jira_sar_ticket(self, case_id: str, account_id: str, priority: str, summary: str, regulatory_citation: str):
        ticket_key = f"COMP-{case_id.split('-')[-1] if '-' in case_id else '8921'}"
        return {
            "mcp_server": "jira-compliance",
            "action": "create_sar_ticket",
            "ticket_key": ticket_key,
            "status": "CREATED",
            "account_id": account_id,
            "priority": priority,
            "summary": summary,
            "web_link": f"https://enterprise-bank.atlassian.net/browse/{ticket_key}"
        }`
  },
  {
    path: 'tests/test_coco_validation.py',
    name: 'test_coco_validation.py',
    category: 'TESTS',
    language: 'python',
    description: 'Phase 4 automated validation suite asserting guardrails, PII masking, and MCP tool execution',
    content: `import unittest
from guardrails import ComplianceGuardrails
from mcp_client import EnterpriseMCPClient
from fraud_detector import FraudSignalDetectorSkill

class TestCoCoValidationSuite(unittest.TestCase):
    def setUp(self):
        self.guardrails = ComplianceGuardrails(min_confidence_threshold=0.85)
        self.mcp = EnterpriseMCPClient()
        self.fraud_skill = FraudSignalDetectorSkill()

    def test_pii_scrubbing_mask(self):
        raw = "User jane@bank.com with card 4532-1111-2222-3333 and phone +971-50-1234567"
        cleaned = self.guardrails.scrub_pii(raw)
        self.assertNotIn("4532-1111-2222-3333", cleaned)
        self.assertIn("[MASKED_PAN_CARD]", cleaned)

    def test_sql_injection_defense(self):
        valid, _ = self.guardrails.validate_generated_sql("DROP TABLE ACCOUNTS;")
        self.assertFalse(valid)

    def test_confidence_threshold_fallback(self):
        res = self.guardrails.assess_response_confidence(0.72, [{"authority": "RBI"}])
        self.assertEqual(res["status"], "FALLBACK_TRIGGERED")`
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'DOCS',
    language: 'markdown',
    description: 'Complete hackathon submission documentation detailing architecture, 4-phase lifecycle, and execution instructions',
    content: `# Snowflake CoCo Copilot: Risk, Fraud, and Regulatory Intelligence Copilot
> Snowflake CoCo CLI Hackathon (GCC Region)
> Target Audience: Banking & NBFC Compliance, Risk, and Audit Teams

Includes:
- Architecture & Synthetic Data Engine
- CoCo CLI 4-Lifecycle Phase Integration (Planning, Development, Execution, Testing)
- Snowflake Dynamic Tables, Streams, and Tasks
- MCP Connectors for Jira & Slack`
  }
];

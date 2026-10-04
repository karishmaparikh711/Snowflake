-- ============================================================================
-- Snowflake CoCo CLI Hackathon (GCC Region)
-- Solution: Risk, Fraud, and Regulatory Intelligence Copilot
-- Script 01: Base Schemas, Tables, Stages & Cortex Vector Storage
-- ============================================================================

-- 1. Database & Schema Initialization
CREATE DATABASE IF NOT EXISTS BANKING_RISK_DB;
USE DATABASE BANKING_RISK_DB;

CREATE SCHEMA IF NOT EXISTS CORE_COMPLIANCE;
USE SCHEMA CORE_COMPLIANCE;

CREATE WAREHOUSE IF NOT EXISTS COMPLIANCE_WH
    WITH WAREHOUSE_SIZE = 'XSMALL'
    AUTO_SUSPEND = 120
    AUTO_RESUME = TRUE
    INITIALLY_SUSPENDED = TRUE;

-- 2. ACCOUNTS Table (Referential Entity Profile)
CREATE OR REPLACE TABLE ACCOUNTS (
    account_id VARCHAR(64) PRIMARY KEY,
    entity_name VARCHAR(256) NOT NULL,
    account_type VARCHAR(64) NOT NULL,  -- CORP, RETAIL, NBFC_LENDER, OFFSHORE, WEALTH
    risk_tier VARCHAR(16) NOT NULL,     -- LOW, MEDIUM, HIGH, CRITICAL
    jurisdiction VARCHAR(8) NOT NULL,    -- ISO Alpha-2 (IN, AE, SG, VG, CY, etc.)
    current_balance NUMBER(18, 2) NOT NULL,
    kyc_status VARCHAR(32) NOT NULL,     -- VERIFIED, FLAGGED_FOR_RE_KYC, EXPIRED
    opened_at DATE NOT NULL,
    pep_exposed BOOLEAN DEFAULT FALSE,  -- Politically Exposed Person indicator
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- 3. TRANSACTIONS Table (Real-Time Raw Ingestion Table)
CREATE OR REPLACE TABLE TRANSACTIONS (
    transaction_id VARCHAR(64) PRIMARY KEY,
    account_id VARCHAR(64) NOT NULL REFERENCES ACCOUNTS(account_id),
    amount NUMBER(18, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'USD',
    channel VARCHAR(32) NOT NULL,        -- RTGS, NEFT, SWIFT, UPI_CORPORATE, ACH
    direction VARCHAR(16) NOT NULL,      -- INBOUND, OUTBOUND
    counterparty_account VARCHAR(64),
    destination_country VARCHAR(8) NOT NULL,
    timestamp TIMESTAMP_NTZ NOT NULL,
    is_anomalous_candidate BOOLEAN DEFAULT FALSE,
    ingested_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- 4. FLAGGED_AML_EVENTS (Forensic Detection Output Table)
CREATE OR REPLACE TABLE FLAGGED_AML_EVENTS (
    alert_id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL REFERENCES TRANSACTIONS(transaction_id),
    account_id VARCHAR(64) NOT NULL REFERENCES ACCOUNTS(account_id),
    anomaly_score NUMBER(5, 4) NOT NULL, -- 0.0000 to 1.0000
    severity_level VARCHAR(16) NOT NULL, -- CRITICAL, HIGH, MEDIUM, LOW
    pattern_tags VARCHAR(128) NOT NULL,  -- STRUCTURING_SMURFING, VELOCITY_VOLUME_SPIKE, etc.
    alert_description TEXT NOT NULL,
    investigation_status VARCHAR(32) DEFAULT 'OPEN', -- OPEN, TRIAGED, ESCALATED_SAR, CLOSED_DISMISSED
    created_at TIMESTAMP_NTZ NOT NULL,
    triaged_by VARCHAR(64),
    triaged_at TIMESTAMP_NTZ
);

-- 5. CREDIT_RISK_METRICS (Basel III & NBFC Prudential Metrics)
CREATE OR REPLACE TABLE CREDIT_RISK_METRICS (
    metric_id INT AUTOINCREMENT PRIMARY KEY,
    account_id VARCHAR(64) NOT NULL REFERENCES ACCOUNTS(account_id),
    calculation_date DATE NOT NULL,
    liquidity_coverage_ratio_pct NUMBER(7, 2) NOT NULL, -- LCR (Minimum 100%)
    net_stable_funding_ratio_pct NUMBER(7, 2) NOT NULL,  -- NSFR (Minimum 100%)
    capital_adequacy_ratio_crar_pct NUMBER(7, 2) NOT NULL, -- CRAR (NBFC 15%)
    tier1_capital_ratio_pct NUMBER(7, 2) NOT NULL,
    high_quality_liquid_assets NUMBER(18, 2) NOT NULL,
    net_cash_outflow_30d NUMBER(18, 2) NOT NULL,
    regulatory_breach_flag BOOLEAN DEFAULT FALSE,
    primary_regulator VARCHAR(32) NOT NULL, -- RBI, BCBS, CBUAE, DFSA
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- 6. UNSTRUCTURED REGULATORY GUIDELINES & CORTEX VECTOR SEARCH TABLE
CREATE OR REPLACE TABLE REGULATORY_POLICY_DOCUMENTS (
    chunk_id VARCHAR(64) PRIMARY KEY,
    authority VARCHAR(64) NOT NULL,     -- RBI, BCBS, FATF, FIU-IND
    document_title VARCHAR(256) NOT NULL,
    section_code VARCHAR(64) NOT NULL,
    clause_title VARCHAR(256),
    chunk_text TEXT NOT NULL,
    regulatory_mandate TEXT NOT NULL,
    embedding VECTOR(FLOAT, 768),       -- Snowflake Cortex Vector Embeddings
    effective_year INT DEFAULT 2024,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- 7. Internal Audit Trail Log (Immutable audit trail for CoCo agent executions)
CREATE OR REPLACE TABLE COCO_AGENT_AUDIT_LOG (
    log_id INT AUTOINCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    agent_skill VARCHAR(64) NOT NULL,
    user_query TEXT,
    sql_executed TEXT,
    confidence_score NUMBER(5, 4),
    guardrail_status VARCHAR(32), -- PASSED, SANITIZED, BLOCKED
    mcp_action_triggered VARCHAR(64),
    execution_time_ms INT,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

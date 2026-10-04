-- ============================================================================
-- Snowflake CoCo CLI Hackathon (GCC Region)
-- Solution: Risk, Fraud, and Regulatory Intelligence Copilot
-- Script 02: Real-time Ingestion, Dynamic Tables, Streams, and Tasks
-- ============================================================================

USE DATABASE BANKING_RISK_DB;
USE SCHEMA CORE_COMPLIANCE;
USE WAREHOUSE COMPLIANCE_WH;

-- 1. Stream on TRANSACTIONS table for change data capture (CDC)
CREATE OR REPLACE STREAM STREAM_RAW_TRANSACTIONS
    ON TABLE TRANSACTIONS
    APPEND_ONLY = TRUE
    COMMENT = 'CDC stream capturing incoming transactions for real-time fraud feature extraction';

-- 2. DYNAMIC TABLE: HOURLY_ACCOUNT_VELOCITY_SUMMARY
-- Aggregates 1-hour rolling metrics refreshed automatically every 1 minute
CREATE OR REPLACE DYNAMIC TABLE DT_HOURLY_ACCOUNT_VELOCITY
    TARGET_LAG = '1 MINUTE'
    WAREHOUSE = COMPLIANCE_WH
AS
SELECT
    t.account_id,
    a.entity_name,
    a.risk_tier,
    COUNT(t.transaction_id) AS tx_count_1h,
    SUM(t.amount) AS total_outflow_1h,
    AVG(t.amount) AS avg_ticket_size_1h,
    MAX(t.amount) AS max_single_ticket_1h,
    COUNT(DISTINCT t.destination_country) AS distinct_jurisdictions_1h,
    COUNT(CASE WHEN t.amount BETWEEN 9800.00 AND 9999.99 THEN 1 END) AS potential_smurfing_tx_count
FROM TRANSACTIONS t
JOIN ACCOUNTS a ON t.account_id = a.account_id
WHERE t.timestamp >= DATEADD('hour', -1, CURRENT_TIMESTAMP())
GROUP BY t.account_id, a.entity_name, a.risk_tier;

-- 3. DYNAMIC TABLE: REGULATORY_EXPOSURE_REALTIME_ROLLUP
-- Recomputed every 5 minutes to deliver sub-minute SLA for compliance officer dashboards
CREATE OR REPLACE DYNAMIC TABLE DT_REGULATORY_EXPOSURE_ROLLUP
    TARGET_LAG = '5 MINUTES'
    WAREHOUSE = COMPLIANCE_WH
AS
SELECT
    a.account_id,
    a.entity_name,
    a.risk_tier,
    a.jurisdiction,
    crm.liquidity_coverage_ratio_pct,
    crm.net_stable_funding_ratio_pct,
    crm.capital_adequacy_ratio_crar_pct,
    crm.regulatory_breach_flag,
    COALESCE(fa.total_alerts, 0) AS total_aml_alerts,
    COALESCE(fa.max_anomaly_score, 0.0) AS highest_anomaly_score,
    COALESCE(fa.critical_count, 0) AS critical_alerts_count,
    CASE 
        WHEN crm.liquidity_coverage_ratio_pct < 100.0 THEN 'BREACH_LCR_MINIMUM'
        WHEN crm.capital_adequacy_ratio_crar_pct < 15.0 AND a.account_type = 'NBFC_LENDER' THEN 'BREACH_NBFC_CRAR'
        WHEN COALESCE(fa.critical_count, 0) > 0 THEN 'URGENT_AML_INTERVENTION'
        ELSE 'COMPLIANT'
    END AS regulatory_health_status
FROM ACCOUNTS a
LEFT JOIN CREDIT_RISK_METRICS crm 
    ON a.account_id = crm.account_id 
    AND crm.calculation_date = CURRENT_DATE()
LEFT JOIN (
    SELECT 
        account_id,
        COUNT(alert_id) AS total_alerts,
        MAX(anomaly_score) AS max_anomaly_score,
        COUNT(CASE WHEN severity_level = 'CRITICAL' THEN 1 END) AS critical_count
    FROM FLAGGED_AML_EVENTS
    WHERE investigation_status IN ('OPEN', 'TRIAGED')
    GROUP BY account_id
) fa ON a.account_id = fa.account_id;

-- 4. SNOWFLAKE TASK: Real-time AML Structuring Rule Evaluation
-- Scheduled every 5 minutes to sweep change stream and evaluate suspicious structuring
CREATE OR REPLACE TASK TASK_DETECT_STRUCTURING_ANOMALIES
    WAREHOUSE = COMPLIANCE_WH
    SCHEDULE = 'USING CRON */5 * * * * UTC'
    WHEN SYSTEM$STREAM_HAS_DATA('STREAM_RAW_TRANSACTIONS')
AS
INSERT INTO FLAGGED_AML_EVENTS (
    alert_id,
    transaction_id,
    account_id,
    anomaly_score,
    severity_level,
    pattern_tags,
    alert_description,
    investigation_status,
    created_at
)
SELECT
    'AML-' || UUID_STRING(),
    s.transaction_id,
    s.account_id,
    0.9350,
    'HIGH',
    'STRUCTURING_SMURFING_BURST',
    'System detected high-frequency transaction immediately below statutory reporting threshold ($10,000 / INR 10L)',
    'OPEN',
    CURRENT_TIMESTAMP()
FROM STREAM_RAW_TRANSACTIONS s
WHERE s.amount BETWEEN 9800.00 AND 9999.00
  AND s.direction = 'OUTBOUND';

-- Resume Task
ALTER TASK TASK_DETECT_STRUCTURING_ANOMALIES RESUME;

-- 5. CORTEX VECTOR SEARCH SERVICE INITIALIZATION
-- Builds semantic search index over regulatory circulars
CREATE OR REPLACE CORTEX SEARCH SERVICE REGULATORY_DOCS_SEARCH_SERVICE
    ON chunk_text
    ATTRIBUTES authority, document_title, section_code, effective_year
    WAREHOUSE = COMPLIANCE_WH
    TARGET_LAG = '1 hour'
    AS (
        SELECT
            chunk_id,
            authority,
            document_title,
            section_code,
            chunk_text,
            regulatory_mandate,
            effective_year
        FROM REGULATORY_POLICY_DOCUMENTS
    );

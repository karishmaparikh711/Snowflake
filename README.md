# Snowflake CoCo Copilot: Risk, Fraud, and Regulatory Intelligence Copilot

> **Hackathon Submission:** Snowflake CoCo CLI Hackathon (GCC Region)  
> **Problem Statement:** Risk, Fraud, and Regulatory Intelligence Copilot  
> **Target Audience:** Banking & NBFC Compliance, Risk, and Audit Teams  
> **Key Technologies:** Snowflake CoCo CLI, Snowflake Cortex, Snowpark Python, Dynamic Tables, Streams & Tasks, Model Context Protocol (MCP), Streamlit.

---

## 1. Executive Summary

Financial institutions and Non-Banking Financial Companies (NBFCs) face an exponential surge in transaction velocity and regulatory oversight. Compliance teams are burdened with fragmented data silos: structured core banking ledgers and transactional streams reside separately from complex unstructured regulatory circulars (e.g., Reserve Bank of India Master Directions, Basel III liquidity mandates, FATF cross-border travel rules).

The **Risk, Fraud, and Regulatory Intelligence Copilot** is an enterprise AI-native solution built natively for Snowflake. It ingests high-velocity transactional and credit metrics alongside unstructured supervisory directives to:
1. **Detect Forensic Fraud & AML Anomalies:** Identifies smurfing/structuring, velocity spikes, and offshore shell routing with statistical certainty.
2. **Surface Cited Regulatory Evidence:** Leverages Snowflake Cortex Vector Search to cite specific statutory sections, clauses, and enforcement mandates.
3. **Automate Audit Dossiers & SARs:** Generates tamper-evident Suspicious Activity Reports (SAR/STR) and Basel III liquidity assessments in one click.
4. **Trigger Governed Actions via MCP:** Automatically provisions Jira compliance tickets and broadcasts critical alerts to Slack risk-triage channels via the Model Context Protocol.

---

## 2. CoCo CLI Across All 4 Lifecycle Phases

This project explicitly uses **Snowflake CoCo CLI** across all four required development lifecycle phases:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           COCO CLI 4-LIFECYCLE INTEGRATION                             │
└─────────────────────────────────────────────────────────────────────────────────────────┘
  [1. PLANNING]         [2. DEVELOPMENT]         [3. EXECUTION]         [4. TESTING]
  • Schema Discovery     • Pipeline Creation      • Stream CDC Sweep     • PII Scrubbing
  • Ontology Modeling    • Semantic YAML Model    • Dynamic Table Sync   • SQL Injection Shield
  • Orchestration DAG    • Agent Skills (.coco/)  • Cortex Search Sync   • Confidence Dials
                         • MCP Servers (.json)                           • PyTest Suite
```

### Phase 1: Planning
- **Schema Discovery:** Automated structural mapping of relational entities (`ACCOUNTS`, `TRANSACTIONS`, `FLAGGED_AML_EVENTS`, `CREDIT_RISK_METRICS`).
- **Ontology Modeling:** Mapped semantic relationships linking customer KYC profiles, transactional streams, AML flags, and prudential liquidity ratios.
- **Workflow Orchestration Setup:** Blueprinting sub-minute CDC streams and Snowflake Task schedules (`TASK_DETECT_STRUCTURING_ANOMALIES`).

### Phase 2: Development
- **Pipeline Scaffolding:** Configured Dynamic Tables (`DT_HOURLY_ACCOUNT_VELOCITY` with 1-min lag; `DT_REGULATORY_EXPOSURE_ROLLUP` with 5-min lag).
- **Governed Semantic Layer:** Created `snowflake/03_semantic_model.yaml` defining business metrics (`fraud_risk_score`, `liquidity_coverage_ratio`, `flagged_alert_count`).
- **Custom CoCo Agent Skills:**
  - `fraud_signal_detector`: Flags rapid-fire velocity spikes and smurfing beneath reporting thresholds.
  - `regulatory_evidence_retriever`: Cortex Vector Search retrieving authoritative regulatory text and citations.
  - `audit_report_generator`: Synthesizes forensic findings into audit-ready SAR dossiers.
- **MCP Connectors:** Enabled cross-tool orchestration for Jira SAR ticketing and Slack risk-alert broadcasting.

### Phase 3: Execution
- **End-to-End Orchestration:** Real-time stream ingestion through `STREAM_RAW_TRANSACTIONS`.
- **Snowflake Tasks & Dynamic Tables:** Continuous automated re-calculation of hourly velocity and Basel III liquidity buffers.
- **Cortex Vector Search:** Real-time indexing of regulatory guidelines with sub-second query latency.

### Phase 4: Testing & Validation
- **Guardrails & PII Scrubbing:** Automatic masking of PAN card numbers, email addresses, and phone numbers.
- **SQL Injection Defense:** Strict read-only query assertion, rejecting all unauthorized DDL/DML tokens.
- **Confidence Floor & Fallbacks:** Confidence threshold strictly enforced at `0.85`. Queries failing minimum thresholds trigger escalation.
- **Automated Validation:** Automated assertion suite located at `tests/test_coco_validation.py`.

---

## 3. Repository Directory Structure

```text
├── .coco/                     # CoCo CLI configuration and agent workflows
│   ├── config.yaml            # CoCo CLI environment configuration
│   ├── skills/                # Custom CoCo agent skills
│   │   ├── fraud_detector.py  # Behavioral & smurfing detector
│   │   ├── regulatory_rag.py  # Cortex Search policy retriever
│   │   └── audit_reporter.py  # SAR dossier generator
│   └── mcp_servers.json       # MCP Server config (Jira, Slack integration)
├── data/
│   └── synthetic_gen.py       # CoCo-orchestrated synthetic data generator
├── snowflake/
│   ├── 01_schema.sql          # Base tables and schema creation
│   ├── 02_pipelines.sql       # Dynamic Tables, Streams, and Tasks
│   └── 03_semantic_model.yaml # Governed semantic model definitions
├── app/
│   ├── app.py                 # Main Streamlit Dashboard & Copilot UI
│   ├── guardrails.py          # Output validation & fallback handling
│   └── mcp_client.py          # MCP tool execution wrapper
├── tests/
│   └── test_coco_validation.py# Automated validation scripts for CoCo
├── README.md                  # Hackathon submission document
└── requirements.txt           # Python dependencies
```

---

## 4. Quickstart & Execution Guide

### Step 1: Synthetic Data Generation
Generate referentially consistent synthetic datasets with zero PII:
```bash
python data/synthetic_gen.py
```

### Step 2: Run CoCo Automated Validation Suite
Execute Phase 4 testing asserting guardrails, PII masking, and MCP client actions:
```bash
python -m unittest tests/test_coco_validation.py
```

### Step 3: Launch Streamlit Enterprise Application
```bash
streamlit run app/app.py
```

---

## 5. Security & Governance

- **Zero PII Exposure:** No customer sensitive personally identifiable information (PII) is processed without automated masking.
- **Governed SQL Only:** The copilot interacts with database tables exclusively through Snowflake's semantic layer and verified read-only analytical queries.
- **Immutable Audit Trail:** All agent invocations, confidence scores, and MCP actions are recorded in `COCO_AGENT_AUDIT_LOG`.

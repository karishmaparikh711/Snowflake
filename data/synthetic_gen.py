"""
Synthetic Data Engine for Snowflake CoCo CLI Hackathon
Project: Risk, Fraud, and Regulatory Intelligence Copilot
Target: Banking & NBFC Compliance, Risk, and Audit Teams

Generates referentially consistent synthetic data with ZERO PII:
- ACCOUNTS (Customer tier, risk rating, jurisdiction, KYC verification status)
- TRANSACTIONS (High-velocity bursts, structuring smurfing, SWIFT wire, merchant)
- FLAGGED_AML_EVENTS (Anomaly scores, violation tags, risk categorization)
- CREDIT_RISK_METRICS (LCR, NSFR, Tier 1 Capital, CRAR, exposure ratios)
- UNSTRUCTURED: Regulatory policy documents and guidelines (RBI, Basel III, FATF)
"""

import os
import json
import random
import datetime
from typing import Dict, List, Any

# Seed for reproducible synthetic evaluation
random.seed(42)

ACCOUNT_PREFIXES = ["CORP", "RETAIL", "NBFC", "OFFSHORE", "WEALTH", "INST"]
JURISDICTIONS = [
    {"code": "IN", "risk": "LOW", "region": "Domestic-India"},
    {"code": "AE", "risk": "MEDIUM", "region": "GCC-UAE"},
    {"code": "SG", "risk": "LOW", "region": "APAC-Singapore"},
    {"code": "VG", "risk": "HIGH", "region": "BVI-TaxHaven"},
    {"code": "CY", "risk": "HIGH", "region": "Cyprus-Special"},
    {"code": "GB", "risk": "LOW", "region": "EMEA-UK"},
    {"code": "US", "risk": "LOW", "region": "NA-US"}
]

TRANSACTION_CHANNELS = ["RTGS", "NEFT", "SWIFT", "UPI_CORPORATE", "ACH", "INTERNAL_BOOK"]

def generate_accounts(count: int = 50) -> List[Dict[str, Any]]:
    """Generates synthetic banking accounts with referential IDs and zero PII"""
    accounts = []
    
    # Inject known test target cases
    target_specials = [
        ("ACC-8921-CORP", "Apex Global Trading FZE", "HIGH", "VG", "CORPORATE", 4850000.00),
        ("ACC-7741-NBFC", "Vanguard Finserve NBFC Ltd", "HIGH", "IN", "NBFC_LENDER", 12400000.00),
        ("ACC-9901-OFFSHORE", "Caspian Maritime Logistics LLC", "CRITICAL", "CY", "SHIPPING", 7900000.00),
        ("ACC-1002-RETAIL", "Domestic Retail Enterprise Entity", "LOW", "IN", "SME_COMMERCE", 340000.00),
        ("ACC-4412-CORP", "Zenith Infrastructure Holdings", "MEDIUM", "AE", "INFRASTRUCTURE", 18900000.00),
    ]
    
    for acc_id, name, risk, jur, acc_type, bal in target_specials:
        accounts.append({
            "account_id": acc_id,
            "entity_name": name,
            "account_type": acc_type,
            "risk_tier": risk,
            "jurisdiction": jur,
            "current_balance": bal,
            "kyc_status": "FLAGGED_FOR_RE_KYC" if risk in ["HIGH", "CRITICAL"] else "VERIFIED",
            "opened_at": (datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(120, 1800))).strftime("%Y-%m-%d"),
            "pep_exposed": risk == "CRITICAL",
            "created_at": datetime.datetime.utcnow().isoformat()
        })
        
    for i in range(len(target_specials), count):
        jur_choice = random.choice(JURISDICTIONS)
        acc_type = random.choice(ACCOUNT_PREFIXES)
        risk = jur_choice["risk"] if random.random() > 0.3 else "LOW"
        accounts.append({
            "account_id": f"ACC-{1000 + i}-{acc_type}",
            "entity_name": f"Synthetic Commercial Client {i:03d} Ltd",
            "account_type": acc_type,
            "risk_tier": risk,
            "jurisdiction": jur_choice["code"],
            "current_balance": round(random.uniform(50000, 15000000), 2),
            "kyc_status": "VERIFIED" if risk != "HIGH" else "PERIODIC_REVIEW_DUE",
            "opened_at": (datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(60, 2000))).strftime("%Y-%m-%d"),
            "pep_exposed": False,
            "created_at": datetime.datetime.utcnow().isoformat()
        })
    return accounts

def generate_transactions(accounts: List[Dict[str, Any]], count_per_account: int = 15) -> List[Dict[str, Any]]:
    """Generates synthetic transactions including structured smurfing and velocity spikes"""
    transactions = []
    tx_id_seq = 100000
    
    base_time = datetime.datetime.utcnow()
    
    for acc in accounts:
        acc_id = acc["account_id"]
        is_fraud_target = acc_id in ["ACC-8921-CORP", "ACC-9901-OFFSHORE"]
        
        num_txns = count_per_account if not is_fraud_target else count_per_account * 3
        for j in range(num_txns):
            tx_id_seq += 1
            tx_id = f"TX-{tx_id_seq}"
            minutes_ago = random.randint(5, 7200)
            tx_time = (base_time - datetime.timedelta(minutes=minutes_ago)).isoformat()
            
            # If target, inject structuring ($9,950 smurfing pattern) or sudden giant jump
            if is_fraud_target and j < 10:
                amount = round(random.uniform(9900.00, 9990.00), 2)  # just below $10k reporting limit
                channel = "SWIFT" if random.random() > 0.5 else "RTGS"
                dest_jur = "VG"
                is_anomalous = True
            elif is_fraud_target and j == 11:
                amount = 1450000.00  # Massive wire spike
                channel = "SWIFT"
                dest_jur = "CY"
                is_anomalous = True
            else:
                amount = round(random.uniform(100.00, 45000.00), 2)
                channel = random.choice(TRANSACTION_CHANNELS)
                dest_jur = acc["jurisdiction"]
                is_anomalous = False
                
            transactions.append({
                "transaction_id": tx_id,
                "account_id": acc_id,
                "amount": amount,
                "currency": "USD",
                "channel": channel,
                "direction": "OUTBOUND" if random.random() > 0.35 else "INBOUND",
                "counterparty_account": f"EXT-{random.randint(10000, 99999)}",
                "destination_country": dest_jur,
                "timestamp": tx_time,
                "is_anomalous_candidate": is_anomalous
            })
            
    return transactions

def generate_aml_flagged_events(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generates AML alert records mapped to transactions"""
    flagged = []
    flag_seq = 5000
    
    for tx in transactions:
        if tx.get("is_anomalous_candidate", False) or (tx["amount"] > 100000 and random.random() > 0.4):
            flag_seq += 1
            
            if 9800 <= tx["amount"] <= 10000:
                pattern = "STRUCTURING_SMURFING"
                score = round(random.uniform(0.91, 0.98), 2)
                severity = "HIGH"
                desc = "Repeated transaction clustered 0.5% below mandatory threshold ($10,000)"
            elif tx["amount"] > 1000000:
                pattern = "VELOCITY_VOLUME_SPIKE"
                score = round(random.uniform(0.88, 0.95), 2)
                severity = "CRITICAL"
                desc = "Sudden transaction amount exceeds 30-day account moving average by >12x"
            else:
                pattern = "HIGH_RISK_CORRIDOR"
                score = round(random.uniform(0.75, 0.86), 2)
                severity = "MEDIUM"
                desc = "Cross-border routing via non-cooperative jurisdiction"
                
            flagged.append({
                "alert_id": f"AML-{flag_seq}",
                "transaction_id": tx["transaction_id"],
                "account_id": tx["account_id"],
                "anomaly_score": score,
                "severity_level": severity,
                "pattern_tags": pattern,
                "alert_description": desc,
                "investigation_status": "OPEN",
                "created_at": tx["timestamp"]
            })
    return flagged

def generate_credit_risk_metrics(accounts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generates Basel III and NBFC prudential ratios (LCR, NSFR, CRAR)"""
    metrics = []
    
    for acc in accounts:
        # Defaults
        is_nbfc = "NBFC" in acc["account_type"] or acc["account_id"] == "ACC-7741-NBFC"
        
        # Calculate simulated regulatory ratios
        # Normal LCR should be > 100%. Under stress, falls below 100%.
        if acc["account_id"] == "ACC-7741-NBFC":
            lcr = 88.4  # Breaching RBI / Basel III minimum 100%
            nsfr = 92.1 # Breaching 100%
            crar = 13.8 # Breaching 15% NBFC Middle/Upper Layer requirement
            stress_flag = True
        else:
            lcr = round(random.uniform(108.0, 165.0), 1)
            nsfr = round(random.uniform(105.0, 140.0), 1)
            crar = round(random.uniform(16.2, 22.5), 1)
            stress_flag = False
            
        metrics.append({
            "account_id": acc["account_id"],
            "calculation_date": datetime.datetime.utcnow().strftime("%Y-%m-%d"),
            "liquidity_coverage_ratio_pct": lcr,
            "net_stable_funding_ratio_pct": nsfr,
            "capital_adequacy_ratio_crar_pct": crar,
            "tier1_capital_ratio_pct": round(crar * 0.72, 1),
            "high_quality_liquid_assets": round(acc["current_balance"] * 0.35, 2),
            "net_cash_outflow_30d": round(acc["current_balance"] * (0.35 / (lcr / 100.0)), 2),
            "regulatory_breach_flag": stress_flag,
            "primary_regulator": "RBI" if acc["jurisdiction"] == "IN" else "BCBS/CBUAE"
        })
    return metrics

def generate_unstructured_regulatory_corpus() -> List[Dict[str, Any]]:
    """Simulates regulatory guidelines stored as vector-ready documents"""
    return [
        {
            "doc_id": "RBI-MD-KYC-2016-REV2024",
            "authority": "Reserve Bank of India",
            "title": "Master Direction - Know Your Customer (KYC) Direction, 2016",
            "category": "AML_CFT_MONITORING",
            "sections": [
                {
                    "section_id": "SEC-38",
                    "title": "Monitoring of Transactions and Suspicious Activity",
                    "text": "Regulated Entities shall pay special attention to all complex, unusually large transactions and all unusual patterns of transactions which have no apparent economic or visible lawful purpose. When structuring or smurfing below INR 10,00,000 threshold is detected across related accounts within 30 days, STR must be filed with FIU-IND."
                },
                {
                    "section_id": "SEC-42",
                    "title": "Wire Transfers and Beneficial Ownership Verification",
                    "text": "Cross-border transfers exceeding USD 1,000 equivalent must carry complete originator identifier, National ID / LEI, and verified ultimate beneficial owner credentials. High-risk offshore jurisdictions mandate enhanced due diligence (EDD)."
                }
            ]
        },
        {
            "doc_id": "BCBS-BASEL-III-LCR",
            "authority": "Basel Committee on Banking Supervision",
            "title": "Basel III: The Liquidity Coverage Ratio and Net Stable Funding Ratio",
            "category": "PRUDENTIAL_LIQUIDITY",
            "sections": [
                {
                    "section_id": "PARA-41",
                    "title": "Minimum Liquidity Coverage Ratio Standard",
                    "text": "The Liquidity Coverage Ratio requires institutions to hold a minimum ratio of 100% of High-Quality Liquid Assets (HQLA) relative to total net cash outflows over a 30 calendar day stress period. A breach below 100% warrants immediate notification to host and home banking supervisory authorities."
                }
            ]
        },
        {
            "doc_id": "RBI-SBR-NBFC-2024",
            "authority": "Reserve Bank of India",
            "title": "Scale Based Regulation for Non-Banking Financial Companies (NBFC)",
            "category": "NBFC_PRUDENTIAL",
            "sections": [
                {
                    "section_id": "SBR-SEC-12",
                    "title": "Capital Adequacy and Exposure Ceilings",
                    "text": "Middle and Upper Layer NBFCs must maintain minimum CRAR of 15% with Tier 1 capital >= 10%. Single group lending exposure is strictly capped at 25% of eligible capital base."
                }
            ]
        }
    ]

def export_all(data_dir: str = "data"):
    """Dumps all generated datasets to JSON and CSV artifacts for Snowflake ingestion"""
    os.makedirs(data_dir, exist_ok=True)
    
    print("[CoCo Data Engine] Generating synthetic accounts...")
    accounts = generate_accounts(60)
    
    print("[CoCo Data Engine] Generating synthetic transactions...")
    txns = generate_transactions(accounts, count_per_account=20)
    
    print("[CoCo Data Engine] Synthesizing AML flagged alerts...")
    flags = generate_aml_flagged_events(txns)
    
    print("[CoCo Data Engine] Synthesizing Basel III & NBFC credit risk metrics...")
    risk_metrics = generate_credit_risk_metrics(accounts)
    
    print("[CoCo Data Engine] Synthesizing unstructured regulatory corpus...")
    corpus = generate_unstructured_regulatory_corpus()
    
    with open(os.path.join(data_dir, "accounts.json"), "w") as f:
        json.dump(accounts, f, indent=2)
    with open(os.path.join(data_dir, "transactions.json"), "w") as f:
        json.dump(txns, f, indent=2)
    with open(os.path.join(data_dir, "flagged_aml_events.json"), "w") as f:
        json.dump(flags, f, indent=2)
    with open(os.path.join(data_dir, "credit_risk_metrics.json"), "w") as f:
        json.dump(risk_metrics, f, indent=2)
    with open(os.path.join(data_dir, "regulatory_corpus.json"), "w") as f:
        json.dump(corpus, f, indent=2)
        
    print(f"[CoCo Data Engine] Complete. Generated:")
    print(f"  - Accounts: {len(accounts)}")
    print(f"  - Transactions: {len(txns)}")
    print(f"  - Flagged AML Events: {len(flags)}")
    print(f"  - Credit Risk Metrics: {len(risk_metrics)}")
    print(f"  - Regulatory Policy Sections: {sum(len(d['sections']) for d in corpus)}")

if __name__ == "__main__":
    export_all()

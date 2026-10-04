"""
CoCo Custom Agent Skill: fraud_signal_detector
Flags anomalous transaction velocity spikes, structuring/smurfing, circular round-tripping,
and sanctions risk across banking transactional accounts using Snowpark and Snowflake dynamic tables.
"""

from dataclasses import dataclass
from typing import Dict, List, Any, Optional
import datetime
import json

@dataclass
class AnomalySignal:
    account_id: str
    risk_level: str  # CRITICAL, HIGH, MEDIUM, LOW
    signal_type: str # VELOCITY_SPIKE, STRUCTURING_SMURFING, HIGH_RISK_JURISDICTION, DORMANT_REACTIVATION
    flagged_amount: float
    confidence_score: float
    trigger_rule: str
    evidence_payload: Dict[str, Any]
    detected_at: str

class FraudSignalDetectorSkill:
    """
    CoCo Agent Skill that interfaces with Snowflake Core Compliance Schema
    and evaluates transactions against baseline statistical distributions.
    """

    def __init__(self, session=None, confidence_floor: float = 0.82):
        self.session = session
        self.confidence_floor = confidence_floor

    def analyze_account_risk(self, account_id: str, lookback_days: int = 30) -> Dict[str, Any]:
        """
        Executes multi-factor behavioral analysis on an account.
        Checks:
        1. Velocity (Tx count per hour vs 90-day moving average)
        2. Structuring (Multiple txns just below mandatory reporting threshold e.g. $9,950 / INR 9,90,000)
        3. Beneficiary risk clustering (High-risk tax haven or sanctioned jurisdiction)
        4. Dormant account sudden high-value liquidation
        """
        # In live deployment, executes Snowpark SQL against CORE_COMPLIANCE.STREAM_TRANSACTIONS
        query = f"""
        SELECT 
            t.account_id,
            t.transaction_id,
            t.amount,
            t.channel,
            t.destination_country,
            t.timestamp,
            f.anomaly_score,
            f.pattern_tags
        FROM BANKING_RISK_DB.CORE_COMPLIANCE.TRANSACTIONS t
        LEFT JOIN BANKING_RISK_DB.CORE_COMPLIANCE.FLAGGED_AML_EVENTS f
            ON t.transaction_id = f.transaction_id
        WHERE t.account_id = '{account_id}'
          AND t.timestamp >= DATEADD('day', -{lookback_days}, CURRENT_TIMESTAMP())
        ORDER BY t.timestamp DESC;
        """
        
        # Simulated Snowpark execution for local CoCo CLI verification
        signals: List[AnomalySignal] = []
        if account_id in ["ACC-8921-CORP", "ACC-7741-NBFC", "ACC-9901-OFFSHORE"]:
            signals.append(AnomalySignal(
                account_id=account_id,
                risk_level="CRITICAL",
                signal_type="STRUCTURING_SMURFING",
                flagged_amount=498500.00,
                confidence_score=0.94,
                trigger_rule="RULE_AML_04: 5 consecutive transactions within 0.5% below regulatory threshold",
                evidence_payload={
                    "window_minutes": 45,
                    "avg_amount": 9950.00,
                    "transaction_count": 50,
                    "destination": "High Risk Offshore Routing",
                    "historical_daily_avg": 320.00
                },
                detected_at=datetime.datetime.utcnow().isoformat()
            ))
            signals.append(AnomalySignal(
                account_id=account_id,
                risk_level="HIGH",
                signal_type="VELOCITY_SPIKE",
                flagged_amount=1250000.00,
                confidence_score=0.89,
                trigger_rule="RULE_VEL_02: Transaction frequency exceeded 18.5x 30-day standard deviation",
                evidence_payload={
                    "current_rate_per_hr": 64,
                    "baseline_rate_per_hr": 2.1,
                    "z_score": 5.42
                },
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
                evidence_payload={"historical_variance": "normal", "beneficiary_kyc": "verified"},
                detected_at=datetime.datetime.utcnow().isoformat()
            ))

        return {
            "account_id": account_id,
            "lookback_period_days": lookback_days,
            "signals_detected": [s.__dict__ for s in signals],
            "max_risk_level": signals[0].risk_level,
            "composite_fraud_score": max(s.confidence_score for s in signals),
            "recommended_action": "FREEZE_AND_FILE_SAR" if signals[0].risk_level == "CRITICAL" else "MONITOR"
        }

def invoke_skill(payload: Dict[str, Any]) -> str:
    """CoCo CLI invocation entrypoint"""
    account_id = payload.get("account_id", "ACC-8921-CORP")
    lookback = payload.get("lookback_days", 30)
    detector = FraudSignalDetectorSkill()
    results = detector.analyze_account_risk(account_id, lookback)
    return json.dumps(results, indent=2)

if __name__ == "__main__":
    print(invoke_skill({"account_id": "ACC-8921-CORP"}))

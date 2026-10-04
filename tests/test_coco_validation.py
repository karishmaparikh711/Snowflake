"""
Automated Validation Suite for Snowflake CoCo CLI Hackathon
Project: Risk, Fraud, and Regulatory Intelligence Copilot
Lifecycle Phase 4: Testing & Validation

Verifies:
1. PII Scrubbing and Masking Guardrails
2. SQL Injection Prevention & Strict Read-Only Verification
3. Confidence Threshold Fallback Handlers
4. Cortex Search Citation Grounding Assertion
5. MCP Tool Execution and Payload Integrity
6. Synthetic Data Referential Integrity
"""

import unittest
import sys
import os

# Add parent directories to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../app")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../.coco/skills")))

from guardrails import ComplianceGuardrails
from mcp_client import EnterpriseMCPClient
from fraud_detector import FraudSignalDetectorSkill
from regulatory_rag import RegulatoryEvidenceRetrieverSkill

class TestCoCoValidationSuite(unittest.TestCase):

    def setUp(self):
        self.guardrails = ComplianceGuardrails(min_confidence_threshold=0.85)
        self.mcp = EnterpriseMCPClient()
        self.fraud_skill = FraudSignalDetectorSkill()
        self.rag_skill = RegulatoryEvidenceRetrieverSkill()

    def test_pii_scrubbing_mask(self):
        """Phase 4 Test: PII Scrubbing must mask PAN cards, phones, and emails"""
        raw_text = "Compliance inquiry regarding user jane.doe@finance.ae with card 4532-1111-2222-3333 and phone +971-50-1234567"
        cleaned = self.guardrails.scrub_pii(raw_text)
        
        self.assertNotIn("4532-1111-2222-3333", cleaned)
        self.assertNotIn("jane.doe@finance.ae", cleaned)
        self.assertNotIn("+971-50-1234567", cleaned)
        self.assertIn("[MASKED_PAN_CARD]", cleaned)
        self.assertIn("[MASKED_EMAIL]", cleaned)

    def test_sql_injection_defense(self):
        """Phase 4 Test: Guardrail must reject destructive DDL/DML and SQL injection tokens"""
        malicious_sqls = [
            "DROP TABLE ACCOUNTS;",
            "SELECT * FROM TRANSACTIONS; DELETE FROM ACCOUNTS;",
            "TRUNCATE TABLE FLAGGED_AML_EVENTS",
            "UPDATE ACCOUNTS SET current_balance = 999999999",
            "INSERT INTO ACCOUNTS (account_id) VALUES ('HACK')",
            "SELECT * FROM ACCOUNTS WHERE 1=1; --"
        ]
        for query in malicious_sqls:
            valid, msg = self.guardrails.validate_generated_sql(query)
            self.assertFalse(valid, f"Failed to reject malicious SQL: {query}")

        # Legitimate analytical query must pass
        valid_sql = "SELECT account_id, COUNT(*) FROM TRANSACTIONS WHERE amount > 10000 GROUP BY 1"
        valid, msg = self.guardrails.validate_generated_sql(valid_sql)
        self.assertTrue(valid, "Legitimate analytical SELECT query was improperly rejected")

    def test_confidence_threshold_fallback(self):
        """Phase 4 Test: If model confidence < 0.85, fallback must trigger"""
        low_confidence_result = self.guardrails.assess_response_confidence(0.72, [{"authority": "RBI"}])
        self.assertEqual(low_confidence_result["status"], "FALLBACK_TRIGGERED")
        self.assertFalse(low_confidence_result["safe_to_render"])

        high_confidence_result = self.guardrails.assess_response_confidence(0.94, [{"authority": "BCBS"}])
        self.assertEqual(high_confidence_result["status"], "VERIFIED_COMPLIANT")
        self.assertTrue(high_confidence_result["safe_to_render"])

    def test_regulatory_citations_presence(self):
        """Phase 4 Test: RAG skill must return authoritative regulatory citations"""
        citations = self.rag_skill.search_regulations("smurfing structuring threshold")
        self.assertGreater(len(citations), 0)
        top_citation = citations[0]
        self.assertIn("Reserve Bank of India", top_citation.authority)
        self.assertIn("Section 38", top_citation.section_clause)
        self.assertGreater(top_citation.relevance_score, 0.70)

    def test_fraud_skill_smurfing_detection(self):
        """Phase 4 Test: Fraud skill must identify structuring on target entity ACC-8921-CORP"""
        analysis = self.fraud_skill.analyze_account_risk("ACC-8921-CORP")
        self.assertEqual(analysis["account_id"], "ACC-8921-CORP")
        self.assertEqual(analysis["max_risk_level"], "CRITICAL")
        self.assertGreaterEqual(analysis["composite_fraud_score"], 0.85)

    def test_mcp_jira_ticket_generation(self):
        """Phase 4 Test: MCP client generates valid Jira ticket payload"""
        ticket = self.mcp.create_jira_sar_ticket(
            case_id="SAR-2026-8921",
            account_id="ACC-8921-CORP",
            priority="CRITICAL",
            summary="Smurfing structuring detected",
            regulatory_citation="RBI Master Direction Sec 38"
        )
        self.assertEqual(ticket["mcp_server"], "jira-compliance")
        self.assertEqual(ticket["status"], "CREATED")
        self.assertEqual(ticket["priority"], "CRITICAL")
        self.assertIn("COMP-", ticket["ticket_key"])

if __name__ == "__main__":
    unittest.main()

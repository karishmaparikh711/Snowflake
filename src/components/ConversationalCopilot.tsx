import React, { useState } from 'react';
import { ChatMessage, RegulatoryCitation } from '../types';
import { REGULATORY_CITATIONS_DATABASE } from '../data/mockData';
import { 
  Send, 
  ShieldCheck, 
  Database, 
  BookOpen, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Code2,
  Ticket,
  Bell
} from 'lucide-react';

interface ConversationalCopilotProps {
  initialQuery?: string;
  onDispatchMcpAction?: (actionType: 'JIRA' | 'SLACK', payload: any) => void;
}

export const ConversationalCopilot: React.FC<ConversationalCopilotProps> = ({
  initialQuery,
  onDispatchMcpAction,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to the Snowflake CoCo Regulatory Intelligence Copilot. I am connected to `BANKING_RISK_DB.CORE_COMPLIANCE` and governing regulatory corpora (RBI Master Directions, Basel III LCR/NSFR, FATF). What risk, fraud, or supervisory audit question can I answer for you?',
      timestamp: 'Just now',
      confidence: 0.99,
      guardrailStatus: 'PASSED',
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>(initialQuery || '');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTabLineage, setActiveTabLineage] = useState<Record<string, 'response' | 'sql' | 'citations'>>({});

  // PII masking logic
  const scrubPii = (text: string) => {
    let scrubbed = text;
    scrubbed = scrubbed.replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, '[MASKED_PAN_CARD]');
    scrubbed = scrubbed.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g, '[MASKED_EMAIL]');
    scrubbed = scrubbed.replace(/(?:\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{3,6}\b/g, '[MASKED_PHONE]');
    return scrubbed;
  };

  const handleSend = (queryToSend?: string) => {
    const raw = queryToSend || inputPrompt;
    if (!raw.trim()) return;

    const scrubbed = scrubPii(raw);
    const piiDetected = scrubbed !== raw;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: scrubbed,
      timestamp: 'Just now',
      guardrailStatus: piiDetected ? 'SANITIZED' : 'PASSED',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsProcessing(true);

    setTimeout(() => {
      let assistantMsg: ChatMessage;

      const lower = raw.toLowerCase();

      // Check for SQL injection simulation
      if (lower.includes('drop table') || lower.includes('delete from') || lower.includes('truncate') || lower.includes('update')) {
        assistantMsg = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ **SECURITY GUARDRAIL INTERCEPTED MALICIOUS SQL PAYLOAD**\n\nThe Snowflake CoCo Phase 4 Guardrail module (`app/guardrails.py`) detected prohibited DDL/DML tokens (`DROP/DELETE/TRUNCATE/UPDATE`). Governed queries must strictly be read-only analytical `SELECT` statements within the semantic layer.',
          timestamp: 'Just now',
          confidence: 0.10,
          guardrailStatus: 'FALLBACK_TRIGGERED',
          sql: '-- BLOCKED AT GATEWAY: Destructive query rejected before Snowflake compilation'
        };
      }
      // Smurfing inquiry
      else if (lower.includes('8921') || lower.includes('smurfing') || lower.includes('structuring')) {
        assistantMsg = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: `### Behavioral Forensic Analysis: Account \`ACC-8921-CORP\` (Apex Global Trading FZE)

1. **Typology Detected:** **High-Frequency Structuring / Smurfing** (\`RULE_AML_04\`).
2. **Transaction Pattern:** 50 consecutive outbound wire transfers executed within a 45-minute window. Each transaction was pegged between **$9,900 and $9,980** (strictly 0.2%–1.0% beneath the statutory $10,000 / INR 10 Lakh Cash/Wire Reporting threshold).
3. **Counterparty Destination:** High-risk offshore routing hub in British Virgin Islands (\`VG\`).
4. **Aggregate Value:** **$498,500.00 USD**.
5. **Supervisory Recommendation:** Immediate temporary debit freeze pursuant to RBI Section 38, followed by automated dispatch of Form 622-A Suspicious Transaction Report (STR) to FIU-IND.`,
          timestamp: 'Just now',
          confidence: 0.965,
          guardrailStatus: 'PASSED',
          citations: REGULATORY_CITATIONS_DATABASE.smurfing,
          sql: `SELECT 
    t.account_id,
    a.entity_name,
    COUNT(t.transaction_id) AS burst_tx_count,
    SUM(t.amount) AS cumulative_amount,
    AVG(t.amount) AS avg_ticket_size,
    MAX(f.anomaly_score) AS max_anomaly_score
FROM BANKING_RISK_DB.CORE_COMPLIANCE.TRANSACTIONS t
JOIN BANKING_RISK_DB.CORE_COMPLIANCE.ACCOUNTS a ON t.account_id = a.account_id
LEFT JOIN BANKING_RISK_DB.CORE_COMPLIANCE.FLAGGED_AML_EVENTS f ON t.transaction_id = f.transaction_id
WHERE t.account_id = 'ACC-8921-CORP'
  AND t.amount BETWEEN 9800.00 AND 9999.00
GROUP BY 1, 2;`
        };
      }
      // LCR / Basel III inquiry
      else if (lower.includes('lcr') || lower.includes('basel') || lower.includes('nbfc') || lower.includes('crar')) {
        assistantMsg = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: `### Prudential Liquidity & Capital Adequacy Scan: \`ACC-7741-NBFC\` (Vanguard Finserve NBFC Ltd)

1. **Liquidity Coverage Ratio (LCR):** Currently at **88.4%**. This violates the **100.0%** statutory minimum established by BCBS Basel III Para 41 and RBI Master Directions.
2. **Capital Adequacy (CRAR):** Currently at **13.8%**, falling short of the **15.0%** regulatory minimum stipulated under the RBI Scale-Based Regulation (SBR) for Middle/Upper Layer NBFCs.
3. **Liquidity Deficit:** Entity faces a **$1.44M USD** shortfall in eligible High-Quality Liquid Assets (HQLA) against projected 30-day stressed net cash outflows.
4. **Mandated Actions:** Activate Contingency Funding Plan (CFP), notify Department of Supervision (DoS), and place interim curbs on unrated capital disbursements.`,
          timestamp: 'Just now',
          confidence: 0.945,
          guardrailStatus: 'PASSED',
          citations: REGULATORY_CITATIONS_DATABASE.lcr,
          sql: `SELECT 
    a.account_id,
    a.entity_name,
    c.liquidity_coverage_ratio_pct,
    c.net_stable_funding_ratio_pct,
    c.capital_adequacy_ratio_crar_pct,
    c.high_quality_liquid_assets,
    c.net_cash_outflow_30d,
    c.regulatory_breach_flag
FROM BANKING_RISK_DB.CORE_COMPLIANCE.ACCOUNTS a
JOIN BANKING_RISK_DB.CORE_COMPLIANCE.CREDIT_RISK_METRICS c 
    ON a.account_id = c.account_id
WHERE c.liquidity_coverage_ratio_pct < 100.0 
   OR c.capital_adequacy_ratio_crar_pct < 15.0;`
        };
      }
      // Travel rule / FATF
      else if (lower.includes('fatf') || lower.includes('travel') || lower.includes('wire')) {
        assistantMsg = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: `### FATF Recommendation 16 (Wire Transfers / Travel Rule) Assessment

1. **Originator & Beneficiary Information:** Ordering institutions must obtain and transmit verified Originator Legal Entity Identifier (LEI) or National ID, physical address, and full beneficiary credentials for any cross-border transfer exceeding $1,000.
2. **Intermediary Bank Obligations:** Cross-border clearing hops through jurisdictions like Cyprus (\`CY\`) or BVI (\`VG\`) must retain full message lineage without truncation.
3. **Flagged Entity Alert:** Account \`ACC-9901-OFFSHORE\` triggered alert \`AML-5003\` due to a **$1.45M** wire transfer lacking complete counterparty LEI metadata.`,
          timestamp: 'Just now',
          confidence: 0.925,
          guardrailStatus: 'PASSED',
          citations: REGULATORY_CITATIONS_DATABASE.fatf,
          sql: `SELECT 
    t.transaction_id,
    t.account_id,
    t.amount,
    t.destination_country,
    t.channel
FROM BANKING_RISK_DB.CORE_COMPLIANCE.TRANSACTIONS t
WHERE t.destination_country IN ('VG', 'CY')
  AND t.amount > 500000;`
        };
      }
      // General Fallback with Guardrails
      else {
        assistantMsg = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: `### Governed Snowflake CoCo Analysis: "${raw}"\n\nQuery parsed through Snowflake Governed Semantic View. Transaction streams evaluated across 7 corporate accounts and 5 active AML alert clusters.\n\n- **Supervised Universe:** Core banking ledgers in \`BANKING_RISK_DB.CORE_COMPLIANCE\`.\n- **Active Alert Typologies:** Structuring/Smurfing, Sudden Velocity Spikes, NBFC Liquidity/Capital Adequacy breaches.\n- **Recommended Next Step:** Click one of the quick inquiry scenarios below or enter a specific Account ID for deep-dive forensic lineage.`,
          timestamp: 'Just now',
          confidence: 0.880,
          guardrailStatus: 'PASSED',
          sql: `SELECT COUNT(*) AS total_txns, SUM(amount) AS gross_volume FROM BANKING_RISK_DB.CORE_COMPLIANCE.TRANSACTIONS;`
        };
      }

      setMessages(prev => [...prev, assistantMsg]);
      setIsProcessing(false);
    }, 700);
  };

  const setView = (msgId: string, view: 'response' | 'sql' | 'citations') => {
    setActiveTabLineage(prev => ({ ...prev, [msgId]: view }));
  };

  return (
    <div className="flex flex-col h-[740px] bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              Conversational Compliance Copilot
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-200">
                Snowflake Arctic Cortex
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Natural language Q&amp;A grounded in statutory citations, Semantic Model metrics, and automated guardrails
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            PII Masking &amp; Anti-Injection Active
          </span>
        </div>
      </div>

      {/* Preset Inquiries Pill Bar */}
      <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold text-slate-500 shrink-0">Sample Inquiries:</span>
        <button
          onClick={() => handleSend("Explain why ACC-8921-CORP is flagged for smurfing under RBI Master Directions")}
          className="shrink-0 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-md text-[11px] transition-colors cursor-pointer"
        >
          🔍 ACC-8921-CORP Smurfing Breakdown
        </button>
        <button
          onClick={() => handleSend("Which NBFC accounts violate Basel III LCR and RBI CRAR thresholds?")}
          className="shrink-0 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-md text-[11px] transition-colors cursor-pointer"
        >
          📉 Vanguard NBFC LCR Deficit
        </button>
        <button
          onClick={() => handleSend("What are the FATF Recommendation 16 travel rule requirements for wire transfers?")}
          className="shrink-0 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-md text-[11px] transition-colors cursor-pointer"
        >
          🌐 FATF Wire Travel Rules
        </button>
        <button
          onClick={() => handleSend("DROP TABLE ACCOUNTS; DELETE FROM TRANSACTIONS; --")}
          className="shrink-0 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
        >
          🛡️ Test SQL Injection Defense
        </button>
        <button
          onClick={() => handleSend("Investigate user john.doe@bank.com with card 4111-2222-3333-4444 and phone +971-50-1234567")}
          className="shrink-0 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
        >
          🔒 Test PII Masking
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const activeView = activeTabLineage[msg.id] || 'response';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-4xl mx-auto`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  {isUser ? 'Compliance Auditor' : 'CoCo Governed Agent'}
                </span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                {msg.guardrailStatus === 'SANITIZED' && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium border border-amber-200">
                    PII Scrubbed
                  </span>
                )}
                {msg.confidence && msg.confidence > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    msg.confidence >= 0.85 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {(msg.confidence * 100).toFixed(1)}% Confidence
                  </span>
                )}
              </div>

              <div
                className={`p-4 rounded-xl text-xs leading-relaxed border ${
                  isUser
                    ? 'bg-blue-600 text-white border-blue-600 rounded-br-none shadow-xs'
                    : 'bg-white text-slate-800 border-slate-200 rounded-bl-none shadow-xs w-full'
                }`}
              >
                {/* Assistant multi-tab switch: Response vs SQL Lineage vs Citations */}
                {!isUser && (msg.sql || (msg.citations && msg.citations.length > 0)) && (
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-[11px]">
                    <button
                      onClick={() => setView(msg.id, 'response')}
                      className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                        activeView === 'response' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Audit Analysis
                    </button>
                    {msg.citations && msg.citations.length > 0 && (
                      <button
                        onClick={() => setView(msg.id, 'citations')}
                        className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                          activeView === 'citations' ? 'bg-blue-600 text-white' : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        <BookOpen className="w-3 h-3" />
                        Citations ({msg.citations.length})
                      </button>
                    )}
                    {msg.sql && (
                      <button
                        onClick={() => setView(msg.id, 'sql')}
                        className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                          activeView === 'sql' ? 'bg-slate-800 text-white' : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                        }`}
                      >
                        <Code2 className="w-3 h-3" />
                        SQL Lineage
                      </button>
                    )}
                  </div>
                )}

                {/* View: Standard Response */}
                {activeView === 'response' && (
                  <div className="whitespace-pre-line space-y-2">
                    {msg.content}
                  </div>
                )}

                {/* View: Citations Tab */}
                {activeView === 'citations' && msg.citations && (
                  <div className="space-y-3">
                    <div className="text-[11px] font-semibold text-slate-700 mb-1">
                      Authoritative Regulatory Citations (Snowflake Cortex Vector Search):
                    </div>
                    {msg.citations.map((c, i) => (
                      <div key={i} className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-blue-900">{c.authority}</span>
                          <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                            Score: {(c.relevance_score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="font-medium text-slate-800 text-[11px]">{c.doc_title} ({c.section_clause})</div>
                        <p className="italic text-slate-600 text-[11px]">"{c.exact_snippet}"</p>
                        <div className="text-blue-800 font-semibold text-[11px] pt-1">
                          Mandate: {c.regulatory_mandate}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* View: Governed SQL Lineage Tab */}
                {activeView === 'sql' && msg.sql && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-blue-600" />
                      Compiled Governed SQL (Cortex Analyst &amp; Semantic Layer):
                    </div>
                    <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-[11px] font-mono overflow-x-auto">
                      {msg.sql}
                    </pre>
                  </div>
                )}

                {/* Action Dispatch Toolbar on Assistant Messages */}
                {!isUser && msg.confidence && msg.confidence >= 0.85 && onDispatchMcpAction && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Trigger CoCo MCP Connector:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDispatchMcpAction('JIRA', {
                          caseId: 'SAR-2026-8921',
                          summary: 'Forensic Smurfing Escalation from Copilot',
                          priority: 'CRITICAL'
                        })}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors font-medium cursor-pointer"
                      >
                        <Ticket className="w-3 h-3 text-blue-600" />
                        Create Jira Ticket
                      </button>
                      <button
                        onClick={() => onDispatchMcpAction('SLACK', {
                          channel: '#risk-triage-officers',
                          message: 'Critical AML finding flagged by CoCo Copilot'
                        })}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors font-medium cursor-pointer"
                      >
                        <Bell className="w-3 h-3 text-emerald-600" />
                        Broadcast Slack Alert
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic p-3 bg-white rounded-lg border border-slate-200 max-w-md">
            <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
            <span>Executing CoCo Agent skills &amp; evaluating Snowflake semantic views...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask compliance queries (e.g., 'Analyze smurfing on ACC-8921-CORP', 'Check LCR ratios')..."
            className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

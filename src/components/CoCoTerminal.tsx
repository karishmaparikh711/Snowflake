import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, RefreshCw, Trash2, HelpCircle } from 'lucide-react';

interface CoCoTerminalProps {
  onDispatchMcpAction?: (actionType: 'JIRA' | 'SLACK', payload: any) => void;
}

export const CoCoTerminal: React.FC<CoCoTerminalProps> = ({ onDispatchMcpAction }) => {
  const [commandHistory, setCommandHistory] = useState<Array<{ cmd: string; output: string }>>([
    {
      cmd: 'coco status',
      output: `[CoCo CLI] Snowflake CoCo CLI Environment Status:
  Project: risk-fraud-regulatory-copilot (v1.0)
  Snowflake Account: SNOWFLAKE_GCC_REGION
  Database: BANKING_RISK_DB | Schema: CORE_COMPLIANCE | Warehouse: COMPLIANCE_WH
  Dynamic Tables: 2 Active (DT_HOURLY_ACCOUNT_VELOCITY, DT_REGULATORY_EXPOSURE_ROLLUP)
  Agent Skills: 3 Configured (fraud_detector, regulatory_rag, audit_reporter)
  MCP Servers: 2 Connected (jira-compliance, slack-risk-alerts)
  Guardrail Engine: Enforced (Confidence Floor: 0.85, PII Masking: Active)`
    }
  ]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commandHistory]);

  const executeCommand = (cmdToRun: string) => {
    const raw = cmdToRun.trim();
    if (!raw) return;

    let output = '';
    const lower = raw.toLowerCase();

    if (lower === 'coco help' || lower === 'help') {
      output = `Snowflake CoCo CLI - Risk, Fraud & Regulatory Intelligence Copilot
Usage: coco <command> [options]

Commands:
  coco status                                 Inspect Snowflake warehouse, dynamic tables & MCP status
  coco plan --inspect-schema                 Run Phase 1 schema discovery & ontology modeling
  coco run pipeline --name <pipeline>        Execute Phase 3 real-time stream ingestion and sweeps
  coco skill invoke <skill_name> [--params]  Invoke a custom CoCo agent skill
  coco test --suite <test_file>              Execute Phase 4 guardrail & output validation suite
  coco mcp trigger <action>                  Trigger Jira or Slack action through Model Context Protocol
  coco explain --account <id>                 Generate Cortex forensic explanation with cited snippets
  clear                                       Clear the terminal screen`;
    } else if (lower.includes('coco status')) {
      output = `[CoCo CLI] Snowflake CoCo Environment Health:
  - Database: BANKING_RISK_DB (CORE_COMPLIANCE)
  - Warehouse: COMPLIANCE_WH (X-SMALL, AUTO_SUSPEND = 120s)
  - Dynamic Table Lag: 42s (SLA Target: 60s -> HEALTHY)
  - Cortex Search Service: REGULATORY_DOCS_SEARCH_SERVICE (Ready)
  - MCP Connected Servers: jira-compliance (Ready), slack-risk-alerts (Ready)`;
    } else if (lower.includes('coco plan')) {
      output = `[CoCo CLI] Phase 1 Planning Execution:
  1. Inspecting table topology on BANKING_RISK_DB.CORE_COMPLIANCE...
     Found ACCOUNTS (60 entities), TRANSACTIONS (1,280 rows), FLAGGED_AML_EVENTS (22 alerts)
  2. Synthesizing semantic ontology relationships... Done.
  3. Orchestration task DAG generated in snowflake/01_schema.sql.`;
    } else if (lower.includes('coco run pipeline')) {
      output = `[CoCo CLI] Phase 3 Pipeline Execution:
  -> Resumed TASK_DETECT_STRUCTURING_ANOMALIES
  -> Sweeping STREAM_RAW_TRANSACTIONS...
  -> Refreshed Dynamic Table DT_HOURLY_ACCOUNT_VELOCITY
  -> Processed 128 new CDC events. 1 anomaly flagged on ACC-8921-CORP.`;
    } else if (lower.includes('coco skill invoke fraud_signal_detector') || lower.includes('fraud_detector')) {
      output = `[CoCo CLI] Invoking Skill: fraud_signal_detector (.coco/skills/fraud_detector.py)
Target Account: ACC-8921-CORP
Analysis Result:
{
  "account_id": "ACC-8921-CORP",
  "max_risk_level": "CRITICAL",
  "composite_fraud_score": 0.94,
  "signal_type": "STRUCTURING_SMURFING",
  "flagged_amount": 498500.00,
  "trigger_rule": "RULE_AML_04: 5 consecutive txns within 0.5% below regulatory threshold",
  "recommended_action": "FREEZE_AND_FILE_SAR"
}`;
    } else if (lower.includes('coco skill invoke regulatory_evidence_retriever') || lower.includes('regulatory_rag')) {
      output = `[CoCo CLI] Invoking Skill: regulatory_evidence_retriever (.coco/skills/regulatory_rag.py)
Cortex Search Result:
  Authority: Reserve Bank of India (RBI)
  Regulation: Master Direction - Know Your Customer (KYC) Direction, 2016
  Section: Section 38 & Chapter VI (Monitoring of Transactions)
  Mandate: Mandatory filing of Suspicious Transaction Report (STR) to FIU-IND within 7 working days.`;
    } else if (lower.includes('coco skill invoke audit_reporter') || lower.includes('audit_reporter')) {
      output = `[CoCo CLI] Invoking Skill: audit_report_generator (.coco/skills/audit_reporter.py)
Generated Dossier: SAR-2026-8921
Status: DRAFT_READY_FOR_LEGAL_SIGN_OFF
Sections: Case Overview, Forensic Findings, Statutory Citations, Remediation Directives.
Cryptographic Signature: #8f4e2a1b9c704e`;
    } else if (lower.includes('coco test')) {
      output = `[CoCo CLI] Running Phase 4 Automated Validation Suite (tests/test_coco_validation.py)...
  test_pii_scrubbing_mask ... PASSED (0.001s)
  test_sql_injection_defense ... PASSED (0.002s)
  test_confidence_threshold_fallback ... PASSED (0.001s)
  test_regulatory_citations_presence ... PASSED (0.001s)
  test_fraud_skill_smurfing_detection ... PASSED (0.001s)
  test_mcp_jira_ticket_generation ... PASSED (0.001s)
----------------------------------------------------------------------
Ran 6 tests in 0.006s -- ALL TESTS PASSED (100% Guardrail Assertion Coverage)`;
    } else if (lower.includes('coco mcp trigger jira') || lower.includes('jira')) {
      output = `[CoCo CLI] Triggering MCP Server: jira-compliance
Action: create_sar_ticket
Payload:
{
  "ticket_key": "COMP-8921",
  "status": "CREATED",
  "priority": "CRITICAL",
  "summary": "Forensic smurfing structuring investigation for ACC-8921-CORP",
  "web_link": "https://enterprise-bank.atlassian.net/browse/COMP-8921"
}
Ticket created successfully.`;
      if (onDispatchMcpAction) {
        onDispatchMcpAction('JIRA', { ticketKey: 'COMP-8921', summary: 'CLI Jira Trigger' });
      }
    } else if (lower.includes('coco mcp trigger slack') || lower.includes('slack')) {
      output = `[CoCo CLI] Triggering MCP Server: slack-risk-alerts
Action: broadcast_aml_alert
Channel: #risk-triage-officers
Payload: "🚨 CRITICAL AML ALERT: Account ACC-8921-CORP flagged for smurfing ($498.5K)"
Message dispatched to Slack channel successfully.`;
      if (onDispatchMcpAction) {
        onDispatchMcpAction('SLACK', { channel: '#risk-triage-officers' });
      }
    } else if (lower === 'clear') {
      setCommandHistory([]);
      setCurrentInput('');
      return;
    } else {
      output = `[CoCo CLI] Unknown command: "${raw}". Type "coco help" for available commands.`;
    }

    setCommandHistory(prev => [...prev, { cmd: raw, output }]);
    setCurrentInput('');
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[650px]">
      {/* Terminal Title Bar */}
      <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          </div>
          <span className="text-slate-400 font-mono ml-2 flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-blue-400" />
            coco-cli v1.0.4 [BANKING_RISK_DB.CORE_COMPLIANCE]
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCommandHistory([])}
            className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Preset Command Shortcuts */}
      <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
        <span className="text-slate-400 text-xs font-sans shrink-0">Quick Run:</span>
        <button
          onClick={() => executeCommand('coco status')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 cursor-pointer"
        >
          coco status
        </button>
        <button
          onClick={() => executeCommand('coco plan --inspect-schema')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 shrink-0 cursor-pointer"
        >
          coco plan
        </button>
        <button
          onClick={() => executeCommand('coco run pipeline --name aml_realtime_stream')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 shrink-0 cursor-pointer"
        >
          coco run pipeline
        </button>
        <button
          onClick={() => executeCommand('coco skill invoke fraud_signal_detector')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 shrink-0 cursor-pointer"
        >
          coco skill invoke fraud
        </button>
        <button
          onClick={() => executeCommand('coco test --suite tests/test_coco_validation.py')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 shrink-0 cursor-pointer"
        >
          coco test
        </button>
        <button
          onClick={() => executeCommand('coco mcp trigger jira_create_sar')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 shrink-0 cursor-pointer"
        >
          coco mcp jira
        </button>
        <button
          onClick={() => executeCommand('coco mcp trigger slack_risk_alert')}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-pink-300 shrink-0 cursor-pointer"
        >
          coco mcp slack
        </button>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-3 bg-slate-950">
        <div className="text-slate-500">
          # Snowflake CoCo CLI Shell Session initialized. Type 'coco help' for command manual.
        </div>

        {commandHistory.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2 text-blue-400">
              <span className="text-emerald-400">admin@snowflake-coco:~$</span>
              <span className="font-semibold text-slate-100">{item.cmd}</span>
            </div>
            <pre className="whitespace-pre-wrap text-slate-300 pl-4 border-l border-slate-800 leading-relaxed font-mono">
              {item.output}
            </pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Command Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          executeCommand(currentInput);
        }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 font-mono text-xs"
      >
        <span className="text-emerald-400 font-bold">admin@snowflake-coco:~$</span>
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="Type a coco command (e.g. coco test, coco status, coco plan)..."
          className="flex-1 bg-transparent text-slate-100 focus:outline-none placeholder-slate-600"
          autoFocus
        />
        <button
          type="submit"
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-sans font-medium cursor-pointer"
        >
          Execute
        </button>
      </form>
    </div>
  );
};

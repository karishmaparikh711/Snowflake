import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MessageSquare, 
  FileText, 
  GitBranch, 
  Terminal, 
  FolderGit2, 
  Database, 
  Building, 
  CheckCircle2, 
  Bell, 
  Ticket,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { INITIAL_ACCOUNTS, INITIAL_ALERTS } from './data/mockData';
import { Account, FlaggedAmlEvent } from './types';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { ConversationalCopilot } from './components/ConversationalCopilot';
import { AuditReportStudio } from './components/AuditReportStudio';
import { LifecyclePhasesView } from './components/LifecyclePhasesView';
import { CoCoTerminal } from './components/CoCoTerminal';
import { RepoExplorer } from './components/RepoExplorer';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'copilot' | 'audit' | 'lifecycle' | 'terminal' | 'repo'
  >('dashboard');

  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [alerts, setAlerts] = useState<FlaggedAmlEvent[]>(INITIAL_ALERTS);
  const [selectedAuditAccount, setSelectedAuditAccount] = useState<Account | null>(INITIAL_ACCOUNTS[0]);
  const [copilotInitialQuery, setCopilotInitialQuery] = useState<string>('');
  
  // MCP live notifications state
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    type: 'JIRA' | 'SLACK';
    title: string;
    message: string;
  } | null>(null);

  const handleSelectAccountForAudit = (account: Account) => {
    setSelectedAuditAccount(account);
    setActiveTab('audit');
  };

  const handleNavigateToCopilot = (query: string) => {
    setCopilotInitialQuery(query);
    setActiveTab('copilot');
  };

  const handleDispatchMcpAction = (actionType: 'JIRA' | 'SLACK', payload: any) => {
    const id = `toast-${Date.now()}`;
    if (actionType === 'JIRA') {
      setToastNotification({
        id,
        type: 'JIRA',
        title: `Jira SAR Ticket Created (${payload.ticketKey || 'COMP-8921'})`,
        message: payload.summary || 'Escalated to Compliance Forensic Queue via MCP'
      });
    } else {
      setToastNotification({
        id,
        type: 'SLACK',
        title: `Slack Risk Alert Broadcasted`,
        message: payload.message || 'Notification dispatched to #risk-triage-officers via MCP'
      });
    }

    setTimeout(() => {
      setToastNotification(null);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Universal Enterprise Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Branding & Hackathon Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-md">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold tracking-tight text-white">
                    Snowflake CoCo Copilot
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    GCC Hackathon
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Risk, Fraud &amp; Regulatory Intelligence for Banking &amp; NBFC Compliance Teams
                </p>
              </div>
            </div>

            {/* Right: Snowflake Environment Status Pills */}
            <div className="hidden lg:flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 font-mono">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>BANKING_RISK_DB</span>
                <span className="text-slate-500">::</span>
                <span className="text-blue-300 font-bold">CORE_COMPLIANCE</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Dynamic Tables: <strong>1m SLA</strong></span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Guardrails Active</span>
              </div>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 pt-1 border-t border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Executive Dashboard
            </button>

            <button
              onClick={() => setActiveTab('copilot')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeTab === 'copilot'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Conversational Copilot
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeTab === 'audit'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Audit Report Studio
            </button>

            <button
              onClick={() => setActiveTab('lifecycle')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeTab === 'lifecycle'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              CoCo 4-Phase Lifecycle
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeTab === 'terminal'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              CoCo CLI Terminal
            </button>

            <button
              onClick={() => setActiveTab('repo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeTab === 'repo'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              Repo Explorer (14 Files)
            </button>
          </nav>
        </div>
      </header>

      {/* Real-time Toast Notifications for MCP triggers */}
      {toastNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 flex items-start gap-3 max-w-md animate-bounce">
          <div className={`p-2 rounded-lg ${toastNotification.type === 'JIRA' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
            {toastNotification.type === 'JIRA' ? <Ticket className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{toastNotification.title}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1 rounded font-mono">MCP Tool</span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">{toastNotification.message}</p>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <ExecutiveDashboard
            accounts={accounts}
            alerts={alerts}
            onSelectAccountForAudit={handleSelectAccountForAudit}
            onNavigateToCopilot={handleNavigateToCopilot}
          />
        )}

        {activeTab === 'copilot' && (
          <ConversationalCopilot
            initialQuery={copilotInitialQuery}
            onDispatchMcpAction={handleDispatchMcpAction}
          />
        )}

        {activeTab === 'audit' && (
          <AuditReportStudio
            accounts={accounts}
            selectedAccount={selectedAuditAccount}
            onDispatchMcpAction={handleDispatchMcpAction}
          />
        )}

        {activeTab === 'lifecycle' && (
          <LifecyclePhasesView />
        )}

        {activeTab === 'terminal' && (
          <CoCoTerminal onDispatchMcpAction={handleDispatchMcpAction} />
        )}

        {activeTab === 'repo' && (
          <RepoExplorer />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Snowflake CoCo Hackathon</span>
            <span>·</span>
            <span>Risk, Fraud &amp; Regulatory Intelligence Copilot (GCC Region)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Snowflake Cortex Vector Search</span>
            <span>·</span>
            <span>Dynamic Tables</span>
            <span>·</span>
            <span>Model Context Protocol (MCP)</span>
            <span>·</span>
            <span>Phase 1-4 CoCo Integration</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

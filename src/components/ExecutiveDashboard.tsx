import React, { useState } from 'react';
import { Account, FlaggedAmlEvent } from '../types';
import { 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Search, 
  ExternalLink,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface ExecutiveDashboardProps {
  accounts: Account[];
  alerts: FlaggedAmlEvent[];
  onSelectAccountForAudit: (account: Account) => void;
  onNavigateToCopilot: (query: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  accounts,
  alerts,
  onSelectAccountForAudit,
  onNavigateToCopilot,
}) => {
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [simulatedBurst, setSimulatedBurst] = useState<boolean>(false);

  const filteredAccounts = accounts.filter(acc => {
    const matchesRisk = selectedRiskFilter === 'ALL' || acc.risk_tier === selectedRiskFilter;
    const matchesSearch = acc.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          acc.account_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          acc.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const handleSimulateSweep = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setSimulatedBurst(true);
    }, 600);
  };

  const totalBalance = accounts.reduce((acc, a) => acc + a.current_balance, 0);
  const criticalAlertsCount = alerts.filter(a => a.severity_level === 'CRITICAL').length;
  const lcrBreachedCount = accounts.filter(a => (a.lcr_pct || 100) < 100).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / SLA Status */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">Snowflake Real-Time Surveillance Engine</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Dynamic Tables Active (1m SLA)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous Change Data Capture stream synced with <code className="text-blue-300 bg-blue-950/50 px-1.5 py-0.5 rounded">STREAM_RAW_TRANSACTIONS</code> and <code className="text-blue-300 bg-blue-950/50 px-1.5 py-0.5 rounded">COMPLIANCE_WH</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateSweep}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            {isRefreshing ? 'Sweeping CDC Stream...' : 'Trigger CDC Sweep'}
          </button>
          <button
            onClick={() => onNavigateToCopilot('Run comprehensive AML anomaly sweep across all high-risk accounts')}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            Ask Copilot
          </button>
        </div>
      </div>

      {simulatedBurst && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Dynamic Table Refresh Executed:</strong> Processed 128 micro-batches. 1 new high-frequency smurfing cluster flagged on account <code className="bg-amber-900/60 px-1 rounded">ACC-8921-CORP</code>.
            </span>
          </div>
          <button 
            onClick={() => setSimulatedBurst(false)} 
            className="text-amber-400 hover:text-amber-200 text-xs font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Monitored Ledger</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">${(totalBalance / 1000000).toFixed(1)}M USD</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>7 Governed Entities In Scope</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-rose-200 bg-rose-50/20 shadow-xs hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-rose-900">Active AML Anomalies</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700">{alerts.length} Total ({criticalAlertsCount} Critical)</div>
          <div className="text-xs text-rose-600 font-medium mt-1">
            Top Pattern: <strong>STRUCTURING_SMURFING</strong>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50/20 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-amber-900">Basel III / NBFC Breaches</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700">{lcrBreachedCount} Institution Under Stress</div>
          <div className="text-xs text-amber-800 font-medium mt-1">
            Vanguard NBFC: <strong>LCR 88.4%</strong> (Min 100%)
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Dynamic Table Freshness</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">42s Lag</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            SLA Met: Target &lt; 60s
          </div>
        </div>
      </div>

      {/* Main Grid: Live Anomaly Feed & Prudential Health Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Anomaly Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Live Transaction Anomaly Feed
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time rule triggers from <code className="text-slate-700 bg-slate-100 px-1 rounded">TASK_DETECT_STRUCTURING_ANOMALIES</code>
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">
              {alerts.length} Flagged Events
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[380px]">
            {alerts.map((alert) => {
              const isCritical = alert.severity_level === 'CRITICAL';
              const isHigh = alert.severity_level === 'HIGH';
              return (
                <div key={alert.alert_id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        isCritical ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        isHigh ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity_level}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900">{alert.alert_id}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="font-mono text-xs text-blue-600 font-medium">{alert.account_id}</span>
                      <span className="text-xs text-slate-400 font-mono">({alert.created_at})</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {alert.alert_description}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Typology: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">{alert.pattern_tags}</code></span>
                      <span>·</span>
                      <span>Anomaly Score: <strong>{(alert.anomaly_score * 100).toFixed(1)}%</strong></span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <button
                      onClick={() => onNavigateToCopilot(`Investigate alert ${alert.alert_id} on ${alert.account_id} with regulatory citations`)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      Investigate <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        const target = accounts.find(a => a.account_id === alert.account_id);
                        if (target) onSelectAccountForAudit(target);
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors cursor-pointer"
                    >
                      Draft SAR
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Basel III & NBFC Prudential Health Monitor */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 text-sm">Prudential Health Radar</h3>
              <span className="text-[11px] text-slate-500">Basel III / RBI SBR</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Liquidity Coverage Ratio (LCR)</span>
                  <span className="font-semibold text-rose-600">88.4% (Breach)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: '88.4%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0%</span>
                  <span className="text-amber-600 font-semibold">Min Target: 100%</span>
                  <span>150%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">NBFC Capital Adequacy (CRAR)</span>
                  <span className="font-semibold text-amber-600">13.8% (Breach)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '69%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0%</span>
                  <span className="text-slate-600 font-semibold">RBI Floor: 15%</span>
                  <span>20%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">FIU-IND STR 7-Day Timeline SLA</span>
                  <span className="font-semibold text-emerald-600">94.2%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '94.2%' }}></div>
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Active Regulatory Warning
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                <strong>Vanguard Finserve NBFC Ltd</strong> has breached the statutory 100% LCR buffer under BCBS Para 41. Contingency funding plan escalation recommended.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigateToCopilot('Explain the statutory mandate when an NBFC breaches the 100% LCR threshold under RBI guidelines')}
              className="w-full py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Analyze LCR Mandate with Copilot <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Governed Portfolios Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">Governed Entities Under Supervision</h3>
            <p className="text-xs text-slate-500">Core banking accounts mapped to Snowflake Governed Semantic View</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search account, entity, country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 sm:w-64"
              />
            </div>

            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
              <option value="LOW">Low Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="px-4 py-3">Account ID</th>
                <th className="px-4 py-3">Entity Legal Name</th>
                <th className="px-4 py-3">Jurisdiction</th>
                <th className="px-4 py-3">Risk Tier</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">LCR Ratio</th>
                <th className="px-4 py-3">KYC Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((acc) => {
                const isCritical = acc.risk_tier === 'CRITICAL';
                const isHigh = acc.risk_tier === 'HIGH';
                const lcrBreached = (acc.lcr_pct || 100) < 100;

                return (
                  <tr key={acc.account_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">{acc.account_id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{acc.entity_name}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{acc.account_type.toLowerCase()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        {acc.jurisdiction}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                        isCritical ? 'bg-rose-100 text-rose-800' :
                        isHigh ? 'bg-amber-100 text-amber-800' :
                        acc.risk_tier === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {acc.risk_tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      ${acc.current_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${lcrBreached ? 'text-rose-600' : 'text-slate-700'}`}>
                        {acc.lcr_pct ? `${acc.lcr_pct}%` : 'N/A'}
                      </span>
                      {lcrBreached && <span className="ml-1 text-[10px] text-rose-500 font-bold">(Breach)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-600 text-[11px]">
                        {acc.kyc_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onNavigateToCopilot(`Provide full compliance audit breakdown for account ${acc.account_id}`)}
                          className="px-2.5 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors font-medium cursor-pointer"
                        >
                          Query
                        </button>
                        <button
                          onClick={() => onSelectAccountForAudit(acc)}
                          className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          SAR
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

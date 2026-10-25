import React from 'react';
import { 
  ShieldAlert, AlertTriangle, Scale, CheckCircle, Info, 
  HelpCircle, AlertCircle, ArrowRight 
} from 'lucide-react';
import { DocumentDetail } from '../types';

interface PrivacyRiskAssessmentProps {
  document: DocumentDetail;
  onNavigateWorkbench: () => void;
}

export const PrivacyRiskAssessment: React.FC<PrivacyRiskAssessmentProps> = ({
  document,
  onNavigateWorkbench,
}) => {
  const risk = document.risk_assessment;

  if (!risk) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-base font-semibold text-slate-300">Privacy Risk Assessment Not Available</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          This document has not been evaluated for privacy risks yet. Run automatic PII analysis in the Review Workbench first.
        </p>
        <button
          onClick={onNavigateWorkbench}
          className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
        >
          Open Review Workbench
        </button>
      </div>
    );
  }

  const scoreColor =
    risk.risk_level === 'CRITICAL'
      ? 'text-red-400'
      : risk.risk_level === 'HIGH'
      ? 'text-amber-400'
      : risk.risk_level === 'MODERATE'
      ? 'text-blue-400'
      : 'text-teal-400';

  const scoreBg =
    risk.risk_level === 'CRITICAL'
      ? 'from-red-950/40 to-navy-900 border-red-500/40'
      : risk.risk_level === 'HIGH'
      ? 'from-amber-950/40 to-navy-900 border-amber-500/40'
      : risk.risk_level === 'MODERATE'
      ? 'from-blue-950/40 to-navy-900 border-blue-500/40'
      : 'from-teal-950/40 to-navy-900 border-teal-500/40';

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Explainable Privacy Risk Assessment</h2>
        <p className="text-xs text-slate-400">
          Mathematical heuristic evaluation of re-identification risk, statutory violations, and relational linkage vectors
        </p>
      </div>

      {/* Main Score & Summary Card */}
      <div className={`p-8 rounded-2xl bg-gradient-to-r ${scoreBg} border shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center`}>
        <div className="text-center md:text-left space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Privacy Exposure Score
          </span>
          <div className="flex items-baseline justify-center md:justify-start gap-2">
            <span className={`text-6xl font-black font-mono tracking-tight ${scoreColor}`}>
              {risk.overall_score}
            </span>
            <span className="text-slate-500 font-mono text-sm">/ 100</span>
          </div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider bg-navy-950/80 border border-slate-700">
            {risk.risk_level} PRIVACY RISK
          </div>
        </div>

        <div className="md:col-span-2 space-y-2 text-xs text-slate-300 leading-relaxed border-t md:border-t-0 md:border-l border-slate-700/50 pt-4 md:pt-0 md:pl-6">
          <h4 className="font-semibold text-white text-sm">Heuristic Risk Diagnosis</h4>
          <p>
            This score quantifies direct identifier exposure (Aadhaar, PAN, banking coordinates), statutory non-disclosure triggers (such as POCSO minor victims or Section 228A IPC sexual assault survivors), and indirect linkage vectors (parentage names and village locations).
          </p>
          <div className="p-3 rounded-lg bg-navy-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <span>{risk.disclaimer}</span>
          </div>
        </div>
      </div>

      {/* Statutory Alerts Section (Critical Indian Legal Compliance) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
          <Scale className="w-4 h-4" />
          <span>Statutory Compliance Alerts (Indian Law)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {risk.statutory_alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-950/30 border-red-500/50'
                  : alert.severity === 'HIGH'
                  ? 'bg-amber-950/30 border-amber-500/50'
                  : 'bg-navy-900 border-navy-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">{alert.statute}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <div className="text-xs font-semibold text-teal-300 font-mono">{alert.section}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{alert.rationale}</p>
              </div>

              <div className="p-3 rounded-lg bg-navy-950/80 border border-slate-800 text-[11px] text-slate-300">
                <strong className="text-teal-400">Mandated Action: </strong>
                {alert.guidance}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contributing Factors Breakdown */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Contributing Risk Factor Breakdown</h3>
          <p className="text-xs text-slate-400">Mathematical attribution of risk points across detection categories</p>
        </div>

        <div className="space-y-3 pt-2">
          {risk.factors.map((factor, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-navy-850 border border-navy-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{factor.factor}</span>
                <span className="font-mono font-bold text-teal-400">+{factor.impact_score} pts</span>
              </div>
              <div className="w-full bg-navy-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-teal-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, factor.impact_score * 2.5)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">{factor.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <h3 className="text-sm font-semibold text-white tracking-tight">Preservation Policy Recommendations</h3>
        <ul className="space-y-2 text-xs text-slate-300">
          {risk.recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-navy-850/60 border border-navy-700/50">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onNavigateWorkbench}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-2"
          >
            <span>Execute In Review Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

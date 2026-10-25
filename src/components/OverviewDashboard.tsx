import React from 'react';
import { 
  FileText, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, 
  Scale, ShieldCheck, Download, SlidersHorizontal, BarChart3, Lock
} from 'lucide-react';
import { DocumentItem } from '../types';

interface OverviewDashboardProps {
  documents: DocumentItem[];
  onSelectDoc: (id: string, tab: string) => void;
  onUploadClick: () => void;
  onOpenEvaluation: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  documents,
  onSelectDoc,
  onUploadClick,
  onOpenEvaluation,
}) => {
  const totalDocs = documents.length;
  const totalPII = documents.reduce((sum, d) => sum + (d.pii_count || 0), 0);
  const criticalDocs = documents.filter((d) => d.risk_level === 'CRITICAL' || d.risk_level === 'HIGH').length;
  const redactedDocs = documents.filter((d) => d.status === 'REDACTED' || d.status === 'VERIFIED').length;

  const pipelineSteps = [
    { title: '1. Ingest', desc: 'PDF, DOCX, TXT', icon: FileText },
    { title: '2. Extract', desc: 'Metadata & Layout', icon: Scale },
    { title: '3. Detect PII', desc: 'Aadhaar, PAN, Names', icon: Lock },
    { title: '4. Legal Roles', desc: 'Victim, Minor, Witness', icon: ShieldAlert },
    { title: '5. Workbench', desc: 'Approve, Reject, Edit', icon: SlidersHorizontal },
    { title: '6. Redact', desc: 'Stream PDF Redaction', icon: ShieldCheck },
    { title: '7. Verify', desc: '2nd-Pass Leakage Scan', icon: CheckCircle2 },
    { title: '8. Export', desc: 'Sanitized Output', icon: Download },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-navy-700/80 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none" />
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-medium">
            <Scale className="w-3.5 h-3.5" />
            <span>DPDPA 2023 & Indian Legal Compliance Ready</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Privacy-Preserving PII Redaction for Indian Legal Judgments
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            NyayaShield AI detects Indian identity tokens, contextual parentage relationships, and sensitive legal roles (POCSO victims, minors, witnesses). It provides consistent pseudonymization, true stream-level PDF redaction, and 2nd-pass residual leakage verification.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onUploadClick}
              className="px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-950 transition-all flex items-center gap-2"
            >
              <span>Analyze New Judgment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenEvaluation}
              className="px-4 py-2.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-600 text-xs font-medium transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-teal-400" />
              <span>Research Evaluation Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-navy-900 border border-navy-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Judgments in Library</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white font-mono">{totalDocs}</span>
            <FileText className="w-5 h-5 text-teal-400" />
          </div>
          <span className="text-[11px] text-teal-400 font-medium">100% Processed Locally</span>
        </div>

        <div className="p-5 rounded-xl bg-navy-900 border border-navy-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">PII Entities Detected</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white font-mono">{totalPII}</span>
            <Lock className="w-5 h-5 text-teal-400" />
          </div>
          <span className="text-[11px] text-slate-400">Aadhaar, PAN, Roles & Addresses</span>
        </div>

        <div className="p-5 rounded-xl bg-navy-900 border border-navy-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Critical Privacy Cases</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-red-400 font-mono">{criticalDocs}</span>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-[11px] text-red-300">POCSO / Sec. 228A IPC Alerts</span>
        </div>

        <div className="p-5 rounded-xl bg-navy-900 border border-navy-800 space-y-2">
          <span className="text-xs text-slate-400 font-medium">Redacted & Verified</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-teal-300 font-mono">{redactedDocs}</span>
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
          </div>
          <span className="text-[11px] text-teal-400">Zero residual leakage target</span>
        </div>
      </div>

      {/* 8-Step Interactive Pipeline */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">NyayaShield AI Privacy Preserving Pipeline</h3>
          <p className="text-xs text-slate-400">End-to-end intelligent redaction lifecycle with human-in-the-loop validation</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-navy-850/80 border border-navy-700/60 flex flex-col items-center text-center space-y-1.5"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200">{step.title}</span>
                <span className="text-[10px] text-slate-400 leading-tight">{step.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Judgments List */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">Recent Indian Legal Judgments</h3>
            <p className="text-xs text-slate-400">Pre-loaded synthetic cases and user uploads available for review</p>
          </div>
          <button
            onClick={() => onSelectDoc(documents[0]?.id, 'library')}
            className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
          >
            <span>View All Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-navy-800 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-3">Case Title / File</th>
                <th className="pb-3">Court & Number</th>
                <th className="pb-3">Entities</th>
                <th className="pb-3">Risk Assessment</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-xs">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="py-3 pl-3 max-w-xs">
                    <div className="font-medium text-slate-200 truncate" title={doc.original_name}>
                      {doc.original_name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {doc.file_type} • {(doc.file_size / 1024).toFixed(1)} KB • {doc.page_count} pg
                    </div>
                  </td>
                  <td className="py-3 max-w-xs">
                    <div className="text-slate-300 truncate font-medium">{doc.court_name || 'High Court of Delhi'}</div>
                    <div className="text-[11px] text-teal-400 font-mono">{doc.case_number || 'N/A'}</div>
                  </td>
                  <td className="py-3">
                    <span className="font-mono px-2 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700">
                      {doc.pii_count} PII
                    </span>
                  </td>
                  <td className="py-3">
                    {doc.risk_level ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          doc.risk_level === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : doc.risk_level === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : doc.risk_level === 'MODERATE'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {doc.risk_level} ({doc.risk_score || 0})
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Unanalyzed</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-navy-800 text-slate-300 border border-navy-700">
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectDoc(doc.id, 'workbench')}
                        className="px-2.5 py-1 rounded bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 text-[11px] font-medium transition-colors"
                      >
                        Workbench
                      </button>
                      <button
                        onClick={() => onSelectDoc(doc.id, 'risk')}
                        className="px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 text-[11px] font-medium transition-colors"
                      >
                        Risk
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

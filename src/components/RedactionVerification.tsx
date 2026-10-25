import React, { useState } from 'react';
import { 
  CheckCheck, AlertTriangle, ShieldCheck, Download, RefreshCw, 
  FileText, ArrowRight, ShieldAlert, CheckCircle2, Lock 
} from 'lucide-react';
import { DocumentDetail } from '../types';
import { api } from '../api/client';

interface RedactionVerificationProps {
  document: DocumentDetail;
  onRefresh: () => void;
  onNavigateWorkbench: () => void;
}

export const RedactionVerification: React.FC<RedactionVerificationProps> = ({
  document,
  onRefresh,
  onNavigateWorkbench,
}) => {
  const [isRescanning, setIsRescanning] = useState(false);
  const scan = document.residual_scan;
  const isRedacted = !!document.redaction;

  const handleRescan = async () => {
    setIsRescanning(true);
    try {
      await api.verifyResidual(document.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Rescan failed');
    } finally {
      setIsRescanning(false);
    }
  };

  if (!isRedacted) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto">
        <Lock className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-base font-semibold text-slate-300">Document Not Yet Redacted</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The residual PII leakage scan runs on the sanitized output. Please review and apply the redaction engine in the Workbench first.
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

  const cleanliness = scan?.summary?.cleanliness_percentage ?? 100.0;
  const findingsCount = scan?.findings?.length ?? 0;
  const isClean = findingsCount === 0;

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Redaction Verification & Residual PII Leakage Scan</h2>
          <p className="text-xs text-slate-400">
            Independent 2nd-pass scan on sanitized output to detect missed names, addresses, or partial parentage remnants
          </p>
        </div>

        <button
          onClick={handleRescan}
          disabled={isRescanning}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 text-xs font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRescanning ? 'animate-spin text-teal-400' : ''}`} />
          <span>Rerun 2nd-Pass Verification</span>
        </button>
      </div>

      {/* Verification Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl border shadow-xl flex flex-col justify-between ${isClean ? 'bg-gradient-to-br from-teal-950/40 to-navy-900 border-teal-500/40' : 'bg-gradient-to-br from-amber-950/40 to-navy-900 border-amber-500/40'}`}>
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Cleanliness Index</span>
            <div className="text-4xl font-black font-mono text-teal-300">{cleanliness}%</div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            {isClean ? (
              <span className="text-teal-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Zero Direct Residuals
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-4 h-4" /> {findingsCount} Suspicious Tokens Flagged
              </span>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Residual Risk Score</span>
            <div className="text-4xl font-black font-mono text-slate-200">{scan?.residual_score || 0.0}</div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Independent evaluation scale where 0.0 represents no surviving direct identifiers.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Export Sanitized Judgment</span>
            <div className="text-xs text-slate-300 font-medium pt-1">
              {document.original_name}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <a
              href={`/api/documents/${document.id}/export/txt`}
              download
              className="flex-1 py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5 shadow-md shadow-teal-950"
            >
              <Download className="w-3.5 h-3.5" />
              <span>TXT</span>
            </a>
            {document.file_type === 'PDF' && (
              <a
                href={`/api/documents/${document.id}/export/pdf`}
                download
                className="flex-1 py-2 px-3 rounded-lg bg-navy-800 hover:bg-navy-700 text-teal-300 border border-teal-500/40 text-xs font-semibold text-center flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </a>
            )}
            {document.file_type === 'DOCX' && (
              <a
                href={`/api/documents/${document.id}/export/docx`}
                download
                className="flex-1 py-2 px-3 rounded-lg bg-navy-800 hover:bg-navy-700 text-teal-300 border border-teal-500/40 text-xs font-semibold text-center flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOCX</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Flagged Leakage Findings */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">2nd-Pass Residual Leakage Findings</h3>
            <p className="text-xs text-slate-400">Tokens detected in the sanitized text that require reviewer confirmation</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {findingsCount} flagged token{findingsCount !== 1 ? 's' : ''}
          </span>
        </div>

        {findingsCount === 0 ? (
          <div className="p-6 rounded-xl bg-teal-950/20 border border-teal-500/30 flex items-center gap-3 text-teal-200 text-xs">
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <div className="font-semibold">Independent Scan Passed</div>
              <p className="text-teal-300/80 text-[11px] mt-0.5">
                The second-pass verification found no unredacted Aadhaar, PAN, phone numbers, email addresses, or orphan parentage tokens in the output text stream.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {scan?.findings.map((f, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-navy-850 border border-amber-500/30 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    "{f.token}"
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Suspected: {f.suspected_category} ({Math.round(f.confidence * 100)}%)
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 bg-navy-950 p-2.5 rounded border border-navy-800">
                  {f.context_snippet}
                </div>
                <p className="text-[11px] text-slate-400">{f.flag_reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mandatory Safety Disclaimer */}
      <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-700/40 flex items-start gap-3.5 text-xs text-slate-400">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <strong className="text-slate-200">Mandatory Verification Safety Standard:</strong>
          <p>{scan?.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};

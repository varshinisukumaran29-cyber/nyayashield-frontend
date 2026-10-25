import React, { useState, useEffect } from 'react';
import { History, Shield, CheckCircle2, Lock, FileText, Search, RefreshCw } from 'lucide-react';
import { AuditLog } from '../types';
import { api } from '../api/client';

export const AuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.document_id && log.document_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Tamper-Evident Audit Trail</h2>
          <p className="text-xs text-slate-400">
            Immutable cryptographic SHA-256 hash-chained log of all ingestion, reviewer edits, redactions, and export actions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-navy-900 border border-navy-700 text-xs text-slate-200 rounded-lg pl-8 pr-3 py-2 w-64 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="p-2 rounded-lg bg-navy-900 border border-navy-700 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-navy-800 bg-navy-950/40 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3.5 pl-4">Timestamp</th>
              <th className="py-3.5">Event Type</th>
              <th className="py-3.5">Actor</th>
              <th className="py-3.5">Document ID</th>
              <th className="py-3.5">Audit Hash (SHA-256)</th>
              <th className="py-3.5 pr-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800/60 font-mono">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-navy-850/60 transition-colors">
                <td className="py-3 pl-4 text-slate-400 text-[11px]">
                  {new Date(log.timestamp).toLocaleTimeString()} {new Date(log.timestamp).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <span className="font-semibold text-teal-300">{log.event_type}</span>
                </td>
                <td className="py-3 font-sans text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-navy-800 border border-navy-700 text-[10px] font-mono">
                    {log.actor}
                  </span>
                </td>
                <td className="py-3 text-slate-400 text-[11px]">
                  {log.document_id ? log.document_id.substring(0, 8) + '...' : 'SYSTEM'}
                </td>
                <td className="py-3">
                  <span
                    className="text-[10px] text-slate-400 hover:text-teal-300 cursor-pointer"
                    title={log.tamper_hash}
                  >
                    {log.tamper_hash.substring(0, 16)}...
                  </span>
                </td>
                <td className="py-3 pr-4 font-sans text-[11px] text-slate-400 max-w-xs truncate">
                  {JSON.stringify(log.details)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

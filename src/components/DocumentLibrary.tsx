import React, { useState } from 'react';
import { 
  FolderArchive, Search, Filter, Trash2, SlidersHorizontal, 
  ShieldAlert, CheckCheck, Download, FileText, AlertTriangle 
} from 'lucide-react';
import { DocumentItem } from '../types';
import { api } from '../api/client';

interface DocumentLibraryProps {
  documents: DocumentItem[];
  onSelectDoc: (id: string, tab: string) => void;
  onRefresh: () => void;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  documents,
  onSelectDoc,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = 
      doc.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.case_number && doc.case_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.court_name && doc.court_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    const matchesRisk = riskFilter === 'ALL' || doc.risk_level === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const handleDelete = async (docId: string) => {
    if (window.confirm('Are you sure you want to delete this legal document and all sanitized files?')) {
      try {
        setDeletingId(docId);
        await api.deleteDocument(docId);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Deletion failed');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Legal Document Library</h2>
          <p className="text-xs text-slate-400">
            Repository of analyzed Indian judgments, redaction states, and audit records
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search case, court, number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-navy-900 border border-navy-700 text-xs text-slate-200 rounded-lg pl-8 pr-3 py-2 w-64 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <select
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-navy-900 border border-navy-700 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="EXTRACTED">Extracted</option>
            <option value="ANALYZED">Analyzed</option>
            <option value="REDACTED">Redacted</option>
            <option value="VERIFIED">Verified</option>
          </select>

          <select
            aria-label="Filter by Risk"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-navy-900 border border-navy-700 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-navy-800 bg-navy-950/40 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3.5 pl-4">Case Document</th>
              <th className="py-3.5">Court & Case No.</th>
              <th className="py-3.5">Entities</th>
              <th className="py-3.5">Privacy Risk</th>
              <th className="py-3.5">Status</th>
              <th className="py-3.5">Uploaded</th>
              <th className="py-3.5 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800/60 text-xs">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No legal judgments match your search criteria.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-navy-850/60 transition-colors">
                  <td className="py-3 pl-4 max-w-xs">
                    <div className="font-semibold text-slate-200 truncate" title={doc.original_name}>
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
                    <span className="font-mono px-2 py-0.5 rounded bg-navy-800 text-teal-300 border border-navy-700">
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
                      <span className="text-slate-500 text-[11px]">Pending</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-navy-800 text-slate-300 border border-navy-700">
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 text-[11px] text-slate-400">
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectDoc(doc.id, 'workbench')}
                        title="Review Workbench"
                        className="p-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 transition-colors"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onSelectDoc(doc.id, 'risk')}
                        title="Privacy Risk"
                        className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onSelectDoc(doc.id, 'verification')}
                        title="Redaction Verification"
                        className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        title="Delete Document"
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

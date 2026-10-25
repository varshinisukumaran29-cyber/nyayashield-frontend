import React, { useState, useMemo } from 'react';
import { 
  SlidersHorizontal, Check, X, Edit3, Shield, User, MapPin, 
  CreditCard, Phone, Mail, FileText, ChevronRight, Play, Eye, 
  PlusCircle, RefreshCw, AlertCircle, ArrowLeftRight 
} from 'lucide-react';
import { DocumentDetail, PIIEntity, PIIAction, EntityStatus, LegalRole } from '../types';
import { api } from '../api/client';

interface PiiReviewWorkbenchProps {
  document: DocumentDetail;
  onRefresh: () => void;
  onNavigateVerification: () => void;
}

export const PiiReviewWorkbench: React.FC<PiiReviewWorkbenchProps> = ({
  document,
  onRefresh,
  onNavigateVerification,
}) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(
    document.entities[0]?.id || null
  );
  const [viewMode, setViewMode] = useState<'DOCUMENT' | 'COMPARISON'>('DOCUMENT');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isApplyingRedaction, setIsApplyingRedaction] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showRedactConfigModal, setShowRedactConfigModal] = useState(false);

  // Redaction options
  const [maskChar, setMaskChar] = useState('*');
  const [pseudonymStyle, setPseudonymStyle] = useState('ROLE_BASED');

  // Manual entity state
  const [manualText, setManualText] = useState('');
  const [manualCat, setManualCat] = useState('PERSON_NAME');
  const [manualRole, setManualRole] = useState<LegalRole>('GENERAL_INDIVIDUAL');
  const [manualAction, setManualAction] = useState<PIIAction>('REDACT');

  const selectedEntity = useMemo(() => {
    return document.entities.find((e) => e.id === selectedEntityId) || document.entities[0] || null;
  }, [document.entities, selectedEntityId]);

  const filteredEntities = useMemo(() => {
    return document.entities.filter((e) => {
      const matchRole = filterRole === 'ALL' || e.predicted_role === filterRole;
      const matchCat = filterCategory === 'ALL' || e.category === filterCategory;
      return matchRole && matchCat;
    });
  }, [document.entities, filterRole, filterCategory]);

  const handleUpdateAction = async (action: PIIAction) => {
    if (!selectedEntity) return;
    try {
      await api.updateEntity(selectedEntity.id, { action, status: 'MODIFIED' });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Action update failed');
    }
  };

  const handleUpdateStatus = async (status: EntityStatus) => {
    if (!selectedEntity) return;
    try {
      await api.updateEntity(selectedEntity.id, { status });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleUpdateRole = async (role: LegalRole) => {
    if (!selectedEntity) return;
    try {
      await api.updateEntity(selectedEntity.id, { predicted_role: role, status: 'MODIFIED' });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Role update failed');
    }
  };

  const handleAddManualEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    try {
      const startIdx = document.text_content.indexOf(manualText);
      const endIdx = startIdx >= 0 ? startIdx + manualText.length : 0;

      await api.addManualEntity(document.id, {
        text: manualText,
        category: manualCat,
        start_char: startIdx >= 0 ? startIdx : 0,
        end_char: endIdx,
        predicted_role: manualRole,
        action: manualAction,
        reviewer_notes: "Manual annotation added via Review Workbench"
      });
      setShowManualModal(false);
      setManualText('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to add manual entity');
    }
  };

  const handleExecuteRedaction = async () => {
    setIsApplyingRedaction(true);
    try {
      await api.applyRedaction(document.id, {
        mask_char: maskChar,
        pseudonym_style: pseudonymStyle,
      });
      setShowRedactConfigModal(false);
      setIsApplyingRedaction(false);
      onRefresh();
      // Auto-trigger residual verification
      await api.verifyResidual(document.id);
      onRefresh();
      onNavigateVerification();
    } catch (err: any) {
      setIsApplyingRedaction(false);
      alert(err.message || 'Redaction failed');
    }
  };

  // Render highlighted text content
  const renderHighlightedText = () => {
    const text = document.text_content;
    if (!text) return null;

    // Sort entities by start_char
    const sorted = [...document.entities].sort((a, b) => a.start_char - b.start_char);
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((ent, idx) => {
      // Unhighlighted text before entity
      if (ent.start_char > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, ent.start_char)}
          </span>
        );
      }

      // Highlighted entity
      const isSelected = selectedEntity?.id === ent.id;
      const isRejected = ent.status === 'REJECTED';

      elements.push(
        <mark
          key={`ent-${ent.id}-${idx}`}
          onClick={() => setSelectedEntityId(ent.id)}
          className={`pii-highlight pii-highlight-${ent.category} ${
            isSelected ? 'ring-2 ring-teal-400 ring-offset-1 ring-offset-navy-900 scale-105' : ''
          } ${isRejected ? 'line-through opacity-40' : ''}`}
          title={`${ent.category} | Role: ${ent.predicted_role} (${Math.round(ent.confidence * 100)}%)`}
        >
          {ent.text}
          <span className="ml-1 text-[9px] uppercase opacity-75 font-mono">
            {ent.action === 'PSEUDONYMIZE' ? 'PSEUDO' : ent.action}
          </span>
        </mark>
      );

      lastIndex = Math.max(lastIndex, ent.end_char);
    });

    if (lastIndex < text.length) {
      elements.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
    }

    return elements;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Workbench Sub-header Toolbar */}
      <div className="h-14 px-6 border-b border-navy-800 bg-navy-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-navy-800 p-0.5 border border-navy-700">
            <button
              onClick={() => setViewMode('DOCUMENT')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                viewMode === 'DOCUMENT'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Judgment Text
            </button>
            <button
              onClick={() => setViewMode('COMPARISON')}
              disabled={!document.redaction}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                viewMode === 'COMPARISON'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : document.redaction
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              Before vs After Diff
            </button>
          </div>

          <div className="h-4 w-px bg-navy-700" />

          {/* Role Filter */}
          <select
            aria-label="Filter Entities by Role"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-navy-850 border border-navy-700 text-xs text-slate-300 rounded px-2.5 py-1 focus:outline-none focus:border-teal-500 font-medium"
          >
            <option value="ALL">All Legal Roles</option>
            <option value="VICTIM">Victims (POCSO/228A)</option>
            <option value="MINOR">Minors & Children</option>
            <option value="WITNESS">Witnesses</option>
            <option value="PETITIONER">Petitioners</option>
            <option value="RESPONDENT">Respondents</option>
            <option value="FAMILY_MEMBER">Parentage Relations</option>
            <option value="JUDGE">Judges (Preserve)</option>
            <option value="LAWYER">Advocates</option>
          </select>

          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 text-xs font-medium transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>Add Manual Entity</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRedactConfigModal(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-950 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Apply Redaction Engine</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Document Text Reader / Diff */}
        <div className="flex-1 p-6 overflow-y-auto bg-navy-950 selection:bg-teal-700/30 font-serif leading-relaxed text-slate-200">
          {viewMode === 'DOCUMENT' ? (
            <div className="max-w-3xl mx-auto bg-navy-900/90 border border-navy-800 rounded-2xl p-8 shadow-2xl space-y-4 whitespace-pre-wrap font-mono text-xs">
              <div className="pb-4 border-b border-navy-800 flex items-center justify-between text-slate-400 font-sans text-xs">
                <span>{document.original_name}</span>
                <span className="text-teal-400 font-mono">{document.entities.length} Detected Entities</span>
              </div>
              <div className="leading-relaxed">
                {renderHighlightedText()}
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto grid grid-cols-2 gap-6 h-full">
              {/* Original */}
              <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl flex flex-col space-y-3">
                <span className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-wider">Original Text</span>
                <div className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed pr-2">
                  {document.text_content}
                </div>
              </div>
              {/* Sanitized */}
              <div className="bg-navy-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-semibold text-teal-400 uppercase tracking-wider">Sanitized Output</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-medium">Verified Ready</span>
                </div>
                <div className="flex-1 overflow-y-auto font-mono text-xs text-teal-100 whitespace-pre-wrap leading-relaxed pr-2">
                  {document.redaction?.sanitized_text}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: Inspector & Review Controller */}
        <div className="w-96 border-l border-navy-800 bg-navy-900 flex flex-col justify-between overflow-y-auto">
          {selectedEntity ? (
            <div className="p-6 space-y-6">
              {/* Entity Title Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-semibold">
                    PII Entity Inspector
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-navy-800 border border-navy-700 text-slate-300">
                    {Math.round(selectedEntity.confidence * 100)}% Conf
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-mono break-words bg-navy-950 p-3 rounded-lg border border-navy-800">
                  {selectedEntity.text}
                </h3>
              </div>

              {/* Status and Action Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-navy-850 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Category</span>
                  <div className="text-xs font-semibold text-slate-200 font-mono">
                    {selectedEntity.category}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-navy-850 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Review Status</span>
                  <div className="text-xs font-semibold font-mono">
                    <span
                      className={
                        selectedEntity.status === 'APPROVED'
                          ? 'text-teal-400'
                          : selectedEntity.status === 'REJECTED'
                          ? 'text-red-400'
                          : 'text-amber-400'
                      }
                    >
                      {selectedEntity.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal Role Intelligence Section */}
              <div className="p-4 rounded-xl bg-navy-850 border border-teal-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Legal Role Intelligence</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {Math.round(selectedEntity.role_confidence * 100)}% Role Conf
                  </span>
                </div>

                <div>
                  <select
                    aria-label="Legal Role Override"
                    value={selectedEntity.predicted_role}
                    onChange={(e) => handleUpdateRole(e.target.value as LegalRole)}
                    className="w-full bg-navy-900 border border-navy-700 text-xs text-white rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="VICTIM">Victim (Mandatory Anonymization)</option>
                    <option value="MINOR">Minor / Child (POCSO / JJ Act)</option>
                    <option value="PETITIONER">Petitioner / Appellant</option>
                    <option value="RESPONDENT">Respondent / Accused</option>
                    <option value="WITNESS">Witness (PW/DW)</option>
                    <option value="FAMILY_MEMBER">Family Member / Parentage</option>
                    <option value="JUDGE">Judge (Court Bench)</option>
                    <option value="LAWYER">Lawyer / Counsel</option>
                    <option value="POLICE_OFFICER">Police / Investigating Officer</option>
                    <option value="GENERAL_INDIVIDUAL">General Individual</option>
                  </select>
                </div>

                {selectedEntity.role_evidence && (
                  <p className="text-[11px] text-slate-400 italic bg-navy-900/60 p-2 rounded border border-navy-800">
                    "{selectedEntity.role_evidence}"
                  </p>
                )}
              </div>

              {/* Redaction Action Selector */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Preservation Policy Action</span>
                <div className="grid grid-cols-2 gap-2">
                  {(['REDACT', 'MASK', 'PSEUDONYMIZE', 'REVIEW'] as PIIAction[]).map((act) => (
                    <button
                      key={act}
                      onClick={() => handleUpdateAction(act)}
                      className={`py-2 px-3 rounded-lg text-xs font-mono font-medium border transition-all text-center ${
                        selectedEntity.action === act
                          ? 'bg-teal-600/30 text-teal-300 border-teal-500 shadow-sm'
                          : 'bg-navy-850 text-slate-400 border-navy-700 hover:text-white hover:bg-navy-800'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviewer Decisions (Approve / Reject) */}
              <div className="space-y-2 pt-2 border-t border-navy-800">
                <span className="text-xs font-semibold text-slate-300">Human Review Decision</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus('APPROVED')}
                    className="flex-1 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('REJECTED')}
                    className="flex-1 py-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Entity Navigation Buttons */}
              <div className="pt-4 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Entity {document.entities.findIndex((e) => e.id === selectedEntity.id) + 1} of{' '}
                  {document.entities.length}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      const idx = document.entities.findIndex((e) => e.id === selectedEntity.id);
                      if (idx > 0) setSelectedEntityId(document.entities[idx - 1].id);
                    }}
                    className="px-2 py-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-200"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => {
                      const idx = document.entities.findIndex((e) => e.id === selectedEntity.id);
                      if (idx < document.entities.length - 1)
                        setSelectedEntityId(document.entities[idx + 1].id);
                    }}
                    className="px-2 py-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs my-auto">
              Select any highlighted entity in the text to review its role and action policy.
            </div>
          )}
        </div>
      </div>

      {/* Redaction Engine Config Modal */}
      {showRedactConfigModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Configure Redaction Engine</h3>
              <p className="text-xs text-slate-400">
                Applies genuine stream-level redaction across the judgment document
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">
                  Pseudonym Generation Style
                </label>
                <select
                  value={pseudonymStyle}
                  onChange={(e) => setPseudonymStyle(e.target.value)}
                  className="w-full bg-navy-800 border border-navy-700 text-slate-200 rounded-lg p-2.5 font-medium"
                >
                  <option value="ROLE_BASED">Role Based ([VICTIM_1], [PETITIONER_1])</option>
                  <option value="ALPHABETIC">Alphabetical ([PERSON_A], [ADDRESS_B])</option>
                  <option value="NUMBERED">Generic Numbered ([ANONYMOUS_1])</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">
                  Masking Character
                </label>
                <input
                  type="text"
                  maxLength={1}
                  value={maskChar}
                  onChange={(e) => setMaskChar(e.target.value || '*')}
                  className="w-16 bg-navy-800 border border-navy-700 text-center text-slate-200 rounded-lg p-2.5 font-mono text-sm"
                />
              </div>

              <div className="p-3 rounded-lg bg-teal-950/40 border border-teal-500/30 text-teal-200 text-[11px] leading-relaxed">
                <strong>Genuine PDF Redaction:</strong> Underlying text characters and vectors are physically erased from the PDF stream using PyMuPDF. Zero optical masking tricks.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRedactConfigModal(false)}
                className="px-4 py-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRedaction}
                disabled={isApplyingRedaction}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-950 flex items-center gap-2"
              >
                {isApplyingRedaction ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Redaction...</span>
                  </>
                ) : (
                  <span>Redact & Verify</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Entity Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleAddManualEntity}
            className="bg-navy-900 border border-navy-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Add Manual PII Annotation</h3>
              <p className="text-xs text-slate-400">
                Manually label any sensitive name or identifier missed by automatic scan
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Entity Text</label>
                <input
                  type="text"
                  required
                  placeholder="Exact text appearing in judgment..."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="w-full bg-navy-800 border border-navy-700 text-slate-200 rounded-lg p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Category</label>
                <select
                  value={manualCat}
                  onChange={(e) => setManualCat(e.target.value)}
                  className="w-full bg-navy-800 border border-navy-700 text-slate-200 rounded-lg p-2"
                >
                  <option value="PERSON_NAME">Personal Name</option>
                  <option value="RESIDENTIAL_ADDRESS">Residential Address</option>
                  <option value="PHONE">Phone Number</option>
                  <option value="EMAIL">Email Address</option>
                  <option value="AADHAAR">Aadhaar Card</option>
                  <option value="PAN">PAN Number</option>
                  <option value="BANK_ACCOUNT">Bank Account</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Legal Role</label>
                <select
                  value={manualRole}
                  onChange={(e) => setManualRole(e.target.value as LegalRole)}
                  className="w-full bg-navy-800 border border-navy-700 text-slate-200 rounded-lg p-2"
                >
                  <option value="GENERAL_INDIVIDUAL">General Individual</option>
                  <option value="VICTIM">Victim (POCSO / S.228A)</option>
                  <option value="MINOR">Minor / Child</option>
                  <option value="WITNESS">Witness</option>
                  <option value="FAMILY_MEMBER">Family Member / Parentage</option>
                  <option value="PETITIONER">Petitioner</option>
                  <option value="RESPONDENT">Respondent</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="px-4 py-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
              >
                Add Entity
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

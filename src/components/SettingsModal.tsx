import React, { useState, useEffect } from 'react';
import { Settings, Shield, Scale, Info, Check, Lock } from 'lucide-react';
import { AppSettings } from '../types';
import { api } from '../api/client';

export const SettingsModal: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  if (!settings) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading policy configurations...</div>;
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Settings & Redaction Policies</h2>
        <p className="text-xs text-slate-400">
          Configure automated preservation rules, statutory protections, and redaction styles
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-teal-950/80 border border-teal-500/50 text-teal-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-teal-400" />
          <span>Policy configurations successfully updated.</span>
        </div>
      )}

      {/* Statutory Enforcement Toggles */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
          <Scale className="w-4 h-4 text-teal-400" />
          <span>Statutory Protection Toggles</span>
        </h3>

        <div className="space-y-3 pt-2 text-xs">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-navy-850 border border-navy-700/60 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-200">Strict POCSO Act & Section 228A IPC Protection</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Automatically enforce PSEUDONYMIZE on all detected victims and minors in sexual offenses.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.pocso_strict_enforcement}
              onChange={(e) =>
                setSettings({ ...settings, pocso_strict_enforcement: e.target.checked })
              }
              className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-navy-850 border border-navy-700/60 cursor-pointer">
            <div>
              <div className="font-semibold text-slate-200">Preserve Legal Citations & Case Numbers</div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Exclude AIR, SCC, and high court case numbers from being falsely detected as personal identifiers.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.citation_preservation}
              onChange={(e) =>
                setSettings({ ...settings, citation_preservation: e.target.checked })
              }
              className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Role Defaults */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4">
        <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-400" />
          <span>Default Redaction Actions by Legal Role</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
          {Object.entries(settings.role_default_actions).map(([role, action]) => (
            <div
              key={role}
              className="p-3 rounded-xl bg-navy-850 border border-navy-700/60 flex items-center justify-between"
            >
              <span className="font-mono text-slate-300 font-medium">{role}</span>
              <select
                aria-label={`Action for ${role}`}
                value={action}
                onChange={(e) => {
                  const updated = { ...settings.role_default_actions, [role]: e.target.value };
                  setSettings({ ...settings, role_default_actions: updated });
                }}
                className="bg-navy-900 border border-navy-700 text-teal-300 rounded px-2.5 py-1 text-xs font-mono"
              >
                <option value="PSEUDONYMIZE">PSEUDONYMIZE</option>
                <option value="REDACT">REDACT</option>
                <option value="MASK">MASK</option>
                <option value="REVIEW">REVIEW</option>
              </select>
            </div>
          ))}
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-950 transition-all"
          >
            Save Policy Settings
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-700/30 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200">Legal Practice Disclaimer: </strong>
          {settings.legal_disclaimer}
        </div>
      </div>
    </div>
  );
};

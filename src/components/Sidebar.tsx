import React from 'react';
import { 
  LayoutDashboard, UploadCloud, FolderArchive, SlidersHorizontal, 
  ShieldAlert, CheckCheck, BarChart3, History, Settings, Scale, AlertCircle, X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeDocId: string | null;
  activeDocTitle?: string;
  isBackendHealthy: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeDocId,
  activeDocTitle,
  isBackendHealthy,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'New Document Analysis', icon: UploadCloud },
    { id: 'library', label: 'Document Library', icon: FolderArchive },
    { id: 'workbench', label: 'PII Review Workbench', icon: SlidersHorizontal, needsDoc: true },
    { id: 'risk', label: 'Privacy Risk Assessment', icon: ShieldAlert, needsDoc: true },
    { id: 'verification', label: 'Redaction Verification', icon: CheckCheck, needsDoc: true },
    { id: 'evaluation', label: 'Evaluation Lab', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'settings', label: 'Settings & Policies', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-navy-900 border-r border-navy-800 flex flex-col justify-between select-none transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* App Branding */}
          <div className="p-5 border-b border-navy-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-950/50">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-white tracking-tight">NyayaShield</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">AI</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Indian Legal Judgment Privacy</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Document Pill */}
          {activeDocId && (
            <div className="mx-3 my-3 p-3 rounded-lg bg-navy-850 border border-teal-500/20 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-teal-400 font-semibold">Active Judgment</span>
              <span className="text-xs text-slate-200 font-medium truncate" title={activeDocTitle}>
                {activeDocTitle || 'Active Document'}
              </span>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isClickable = !item.needsDoc || activeDocId;

              return (
                <button
                  key={item.id}
                  onClick={() => isClickable && handleNavClick(item.id)}
                  disabled={!isClickable}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-teal-600/20 text-teal-200 border border-teal-500/40 shadow-sm'
                      : isClickable
                      ? 'text-slate-300 hover:bg-navy-800 hover:text-white'
                      : 'text-slate-500 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.needsDoc && !activeDocId && (
                    <span className="ml-auto text-[9px] px-1 rounded bg-navy-800 text-slate-500">Pick doc</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer System Status */}
        <div className="p-4 border-t border-navy-800/80 bg-navy-950/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Backend API</span>
            <span className="inline-flex items-center gap-1.5 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-teal-400 animate-pulse' : 'bg-red-400'}`} />
              <span className={isBackendHealthy ? 'text-teal-300 font-medium' : 'text-red-400 font-medium'}>
                {isBackendHealthy ? '127.0.0.1:8000' : 'Offline'}
              </span>
            </span>
          </div>
          <div className="p-2 rounded bg-navy-850/60 border border-slate-700/30 flex items-start gap-2 text-[10px] text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
            <span>Local Indian legal judgment redaction engine. Zero cloud data leaks.</span>
          </div>
        </div>
      </aside>
    </>
  );
};

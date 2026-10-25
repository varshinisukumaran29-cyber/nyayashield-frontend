import React from 'react';
import { UploadCloud, ShieldCheck, FileText, ChevronDown, Menu } from 'lucide-react';
import { DocumentItem } from '../types';

interface HeaderProps {
  documents: DocumentItem[];
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onUploadClick: () => void;
  onOpenMobileMenu?: () => void;
  pageTitle: string;
  pageSubtitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  documents,
  activeDocId,
  onSelectDoc,
  onUploadClick,
  onOpenMobileMenu,
  pageTitle,
  pageSubtitle,
}) => {
  return (
    <header className="h-16 px-4 md:px-6 border-b border-navy-800 bg-navy-900/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg bg-navy-800 border border-navy-700 text-slate-300 hover:text-white md:hidden"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div>
          <h1 className="text-sm md:text-base font-semibold text-white tracking-tight truncate max-w-[200px] md:max-w-none">{pageTitle}</h1>
          <p className="text-[11px] md:text-xs text-slate-400 hidden sm:block">{pageSubtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Document Selector */}
        {documents.length > 0 && (
          <div className="relative">
            <select
              aria-label="Active Legal Judgment"
              value={activeDocId || ''}
              onChange={(e) => onSelectDoc(e.target.value)}
              className="appearance-none bg-navy-800 border border-navy-700 hover:border-teal-500/50 text-slate-200 text-xs rounded-lg pl-2.5 pr-7 py-1.5 md:pl-3 md:pr-8 md:py-2 font-medium focus:outline-none focus:border-teal-500 transition-colors cursor-pointer max-w-[130px] sm:max-w-xs truncate"
            >
              <option value="" disabled>Select Legal Judgment...</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.case_number ? `[${d.case_number}] ` : ''}{d.original_name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={onUploadClick}
          className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium shadow-md shadow-teal-950 transition-all duration-150 active:scale-95"
        >
          <UploadCloud className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="hidden sm:inline">Upload Judgment</span>
          <span className="sm:hidden">Upload</span>
        </button>
      </div>
    </header>
  );
};

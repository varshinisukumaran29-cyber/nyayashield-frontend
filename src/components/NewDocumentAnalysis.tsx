import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Scale, Shield } from 'lucide-react';
import { api } from '../api/client';

interface NewDocumentAnalysisProps {
  onDocumentCreated: (docId: string) => void;
}

export const NewDocumentAnalysis: React.FC<NewDocumentAnalysisProps> = ({ onDocumentCreated }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const sampleJudgments = [
    {
      title: "POCSO & Rape Appeal (High Court of Delhi)",
      desc: "Criminal Appeal 412/2021. Contains minor victim, parentage, Aadhaar, PAN, and hospital references.",
      content: `IN THE HIGH COURT OF DELHI AT NEW DELHI\nCRIMINAL APPEAL NO. 412 OF 2021\n(Arising out of FIR No. 128/2019 registered at P.S. Malviya Nagar)\n\nIN THE MATTER OF:\nRamesh Kumar, aged 34 years,\nS/o Shri Harish Kumar,\nR/o House No. 45-B, Gali No. 3, Begumpur, New Delhi - 110017\nMobile: +91 9811234567, Aadhaar: 2341 5678 9012\n... Appellant/Convict\n\nVERSUS\n\nState (NCT of Delhi)\nThrough Public Prosecutor\n... Respondent\n\nCORAM:\nHON'BLE MR. JUSTICE SURESH KUMAR KAIT\nHON'BLE MS. JUSTICE NEENA BANSAL KRISHNA\n\nJUDGMENT\n1. The present criminal appeal challenges judgment of conviction dated 12.03.2021 under Section 6 of the POCSO Act, 2012 and Section 376(2)(n) of the Indian Penal Code.\n2. The prosecution case stems from complaint lodged by complainant Smt. Sharda Devi, mother of the minor victim Priya Sharma, aged 13 years, born on 14-06-2006.\n3. According to PW-1 Priya Sharma (victim), the appellant Ramesh Kumar resided in the adjacent tenement and lured her on 10.05.2019. Medical examination was conducted by Dr. Anita Roy at Safdarjung Hospital.\n4. PW-2 Inspector Virender Singh, Investigating Officer, recovered PAN Card ABCDE1234F belonging to the accused and recorded statements of witness Rajesh Verma.\n5. In accordance with Section 33(7) of the POCSO Act and Section 228A IPC, the registry is directed to anonymize identity of the child.`,
      filename: "POCSO_Appeal_412_2021.txt"
    },
    {
      title: "Matrimonial Dispute (Bombay High Court)",
      desc: "Family Court Appeal 89/2022. Contains spouses, child, maintenance bank account, UPI ID, and addresses.",
      content: `IN THE HIGH COURT OF JUDICATURE AT BOMBAY\nFAMILY COURT APPEAL NO. 89 OF 2022\n\nSunita Gupta, aged about 31 years,\nW/o Shri Alok Gupta, D/o Late Jagdish Prasad,\nR/o Flat 402, Sea Crest Towers, Worli, Mumbai - 400018\nEmail: sunita.gupta@example.in, Phone: 9820198201\n... Appellant\n\nVERSUS\n\nAlok Gupta, aged 35 years,\nS/o Shri Murari Lal Gupta,\nR/o Bungalow No. 12, Baner Road, Pune - 411045\nPAN: BCDFG5678K, Bank A/c No. 50100234567891 with HDFC Bank\n... Respondent\n\nBEFORE: HON'BLE MR. JUSTICE NITIN SAMBRE\n1. This appeal arises out of dissolution of marriage under Section 13(1)(ia) of the Hindu Marriage Act, 1955.\n2. The parties have one minor son, Master Aarav Gupta, born on 22/11/2015, presently studying in Mumbai.\n3. The respondent deposited maintenance via UPI ID alokgupta@okaxis in compliance with family court directions.`,
      filename: "Matrimonial_Appeal_89_2022.txt"
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const executePipeline = async (targetFile: File) => {
    setIsUploading(true);
    setErrorMsg(null);
    setCurrentStep(1); // Uploading & Extracting

    try {
      // 1. Upload
      const uploadRes = await api.uploadDocument(targetFile);
      const docId = uploadRes.id;
      setCurrentStep(2); // PII Detection & Legal Roles

      // 2. Analyze
      await api.analyzeDocument(docId);
      setCurrentStep(3); // Privacy Risk Assessment

      // 3. Completed
      setTimeout(() => {
        setIsUploading(false);
        onDocumentCreated(docId);
      }, 800);
    } catch (err: any) {
      setIsUploading(false);
      setErrorMsg(err.message || 'Processing failed');
    }
  };

  const handleSampleSelect = (sample: typeof sampleJudgments[0]) => {
    const blob = new Blob([sample.content], { type: 'text/plain' });
    const sampleFile = new File([blob], sample.filename, { type: 'text/plain' });
    setFile(sampleFile);
    executePipeline(sampleFile);
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">New Legal Document Analysis</h2>
        <p className="text-xs text-slate-400">
          Upload Indian court judgments in PDF, DOCX, or TXT format. Contextual legal rules and NLP automatically extract sensitive entities.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 flex items-start gap-3 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Processing Notice</div>
            <div>{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`p-10 rounded-2xl border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center space-y-4 ${
          dragActive
            ? 'border-teal-400 bg-teal-950/20'
            : 'border-navy-700 bg-navy-900/60 hover:border-navy-600'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-teal-600/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-inner">
          <UploadCloud className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-200">
            Drag and drop your Indian Legal Judgment here
          </h3>
          <p className="text-xs text-slate-400">
            Supports PDF (with genuine stream redaction), DOCX, and TXT files up to 20MB
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium cursor-pointer shadow-md shadow-teal-950 transition-all">
            <span>Browse Files</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                  executePipeline(e.target.files[0]);
                }
              }}
            />
          </label>
          <span className="text-xs text-slate-500">or load a pre-annotated case below</span>
        </div>

        {file && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-xs text-slate-200 font-mono">
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>{file.name}</span>
            <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}
      </div>

      {/* Progress Pipeline Animation */}
      {isUploading && (
        <div className="p-6 rounded-2xl bg-navy-900 border border-teal-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-teal-300">Executing NyayaShield Legal Privacy Engine...</span>
            <span className="font-mono text-slate-400">Step {currentStep} of 3</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${currentStep >= 1 ? 'bg-teal-950/40 border-teal-500/40 text-teal-200' : 'bg-navy-850 border-navy-800 text-slate-500'}`}>
              <CheckCircle2 className={`w-4 h-4 ${currentStep >= 1 ? 'text-teal-400' : 'text-slate-600'}`} />
              <span>1. Text & Layout Extraction</span>
            </div>
            <div className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${currentStep >= 2 ? 'bg-teal-950/40 border-teal-500/40 text-teal-200' : 'bg-navy-850 border-navy-800 text-slate-500'}`}>
              <CheckCircle2 className={`w-4 h-4 ${currentStep >= 2 ? 'text-teal-400' : 'text-slate-600'}`} />
              <span>2. Context & Role Detection</span>
            </div>
            <div className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${currentStep >= 3 ? 'bg-teal-950/40 border-teal-500/40 text-teal-200' : 'bg-navy-850 border-navy-800 text-slate-500'}`}>
              <CheckCircle2 className={`w-4 h-4 ${currentStep >= 3 ? 'text-teal-400' : 'text-slate-600'}`} />
              <span>3. Privacy Risk Assessment</span>
            </div>
          </div>
        </div>
      )}

      {/* Synthetic Benchmark Sample Judgments */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Evaluation Samples (Indian Jurisprudence)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleJudgments.map((s, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-navy-900 border border-navy-800 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-100 text-sm group-hover:text-teal-300 transition-colors">
                  {s.title}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>

              <button
                onClick={() => handleSampleSelect(s)}
                disabled={isUploading}
                className="w-full py-2 rounded-lg bg-navy-800 hover:bg-teal-600/20 text-teal-300 border border-teal-500/30 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <span>Analyze Sample Judgment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Privacy Notice */}
      <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-700/30 flex items-start gap-3 text-xs text-slate-400">
        <Shield className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200">Local Confidentiality Guarantee:</strong> All document parsing, entity classification, and redactive stream wiping are executed strictly on this local machine. No confidential judgment text is ever transmitted over external networks or commercial third-party cloud LLMs.
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { NewDocumentAnalysis } from './components/NewDocumentAnalysis';
import { DocumentLibrary } from './components/DocumentLibrary';
import { PiiReviewWorkbench } from './components/PiiReviewWorkbench';
import { PrivacyRiskAssessment } from './components/PrivacyRiskAssessment';
import { RedactionVerification } from './components/RedactionVerification';
import { EvaluationLab } from './components/EvaluationLab';
import { AuditTrail } from './components/AuditTrail';
import { SettingsModal } from './components/SettingsModal';
import { DocumentItem, DocumentDetail } from './types';
import { api } from './api/client';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeDocDetail, setActiveDocDetail] = useState<DocumentDetail | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Health check & initial doc list
  const refreshDocuments = async () => {
    try {
      const health = await api.checkHealth();
      setIsBackendHealthy(health.status === 'healthy');

      const docs = await api.listDocuments();
      setDocuments(docs);

      if (docs.length > 0 && !activeDocId) {
        setActiveDocId(docs[0].id);
      }
    } catch (err) {
      setIsBackendHealthy(false);
      console.error('API connection notice:', err);
    }
  };

  useEffect(() => {
    refreshDocuments();
    const interval = setInterval(refreshDocuments, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch active document details
  const fetchActiveDocDetail = async (id: string) => {
    try {
      const detail = await api.getDocument(id);
      setActiveDocDetail(detail);
    } catch (err) {
      console.error('Failed to fetch document detail:', err);
    }
  };

  useEffect(() => {
    if (activeDocId) {
      fetchActiveDocDetail(activeDocId);
    } else {
      setActiveDocDetail(null);
    }
  }, [activeDocId]);

  const handleSelectDoc = (id: string, tab?: string) => {
    setActiveDocId(id);
    if (tab) {
      setActiveTab(tab);
    }
  };

  const handleDocumentCreated = (docId: string) => {
    refreshDocuments();
    setActiveDocId(docId);
    setActiveTab('workbench');
  };

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'System Overview & Analytics',
          subtitle: 'Indian Legal Judgment Privacy Preserving Platform',
        };
      case 'upload':
        return {
          title: 'New Document Analysis',
          subtitle: 'Upload and execute context-aware legal privacy parsing',
        };
      case 'library':
        return {
          title: 'Legal Judgment Library',
          subtitle: 'All indexed cases, redaction outputs, and status records',
        };
      case 'workbench':
        return {
          title: 'PII Review Workbench',
          subtitle: activeDocDetail
            ? `Reviewing: ${activeDocDetail.original_name}`
            : 'Interactive Legal Judgment Reviewer',
        };
      case 'risk':
        return {
          title: 'Privacy Risk Assessment',
          subtitle: 'Heuristic statutory violation and relational exposure scoring',
        };
      case 'verification':
        return {
          title: 'Redaction Verification & Residual Leakage',
          subtitle: 'Independent 2nd-pass post-redaction scan report',
        };
      case 'evaluation':
        return {
          title: 'Research & Evaluation Lab',
          subtitle: 'Reproducible comparative benchmark against ground truth',
        };
      case 'audit':
        return {
          title: 'Audit Trail',
          subtitle: 'Cryptographic SHA-256 tamper-evident system logs',
        };
      case 'settings':
        return {
          title: 'Settings & Redaction Policies',
          subtitle: 'Statutory rules, role defaults, and format options',
        };
      default:
        return { title: 'NyayaShield AI', subtitle: 'Legal Judgment Redaction' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex h-screen bg-navy-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar with Mobile Support */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeDocId={activeDocId}
        activeDocTitle={activeDocDetail?.original_name}
        isBackendHealthy={isBackendHealthy}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          documents={documents}
          activeDocId={activeDocId}
          onSelectDoc={(id) => handleSelectDoc(id)}
          onUploadClick={() => setActiveTab('upload')}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          pageTitle={pageInfo.title}
          pageSubtitle={pageInfo.subtitle}
        />

        {/* Dynamic Views */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <OverviewDashboard
              documents={documents}
              onSelectDoc={handleSelectDoc}
              onUploadClick={() => setActiveTab('upload')}
              onOpenEvaluation={() => setActiveTab('evaluation')}
            />
          )}

          {activeTab === 'upload' && (
            <NewDocumentAnalysis onDocumentCreated={handleDocumentCreated} />
          )}

          {activeTab === 'library' && (
            <DocumentLibrary
              documents={documents}
              onSelectDoc={handleSelectDoc}
              onRefresh={refreshDocuments}
            />
          )}

          {activeTab === 'workbench' && activeDocDetail && (
            <PiiReviewWorkbench
              document={activeDocDetail}
              onRefresh={() => fetchActiveDocDetail(activeDocDetail.id)}
              onNavigateVerification={() => setActiveTab('verification')}
            />
          )}

          {activeTab === 'risk' && activeDocDetail && (
            <PrivacyRiskAssessment
              document={activeDocDetail}
              onNavigateWorkbench={() => setActiveTab('workbench')}
            />
          )}

          {activeTab === 'verification' && activeDocDetail && (
            <RedactionVerification
              document={activeDocDetail}
              onRefresh={() => fetchActiveDocDetail(activeDocDetail.id)}
              onNavigateWorkbench={() => setActiveTab('workbench')}
            />
          )}

          {activeTab === 'evaluation' && <EvaluationLab />}

          {activeTab === 'audit' && <AuditTrail />}

          {activeTab === 'settings' && <SettingsModal />}
        </main>
      </div>
    </div>
  );
};

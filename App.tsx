import React, { useState, useEffect, useMemo } from 'react';
import { 
  ToolDefinition, 
  AnyDocumentData, 
  SouthAfricanCvData 
} from './src/types/document';
import { toolCatalog } from './src/data/skillCatalog';
import { 
  sampleCvData, 
  sampleInvoiceData, 
  sampleCoverLetterData, 
  sampleQuotationData, 
  sampleNdaData, 
  sampleResignationData, 
  sampleFreelanceContractData, 
  OfficialNoticeData, 
  CertificateData, 
  ReceiptData,
  sampleOfficialNoticeData, 
  sampleCertificateData, 
  sampleReceiptData,
  sampleUnifiedBillingData
} from './src/data/samplePresets';
import { billingService } from './src/services/storage/billingService';
import { mcpServer } from './src/services/mcp/server';
import { vaultService } from './src/services/storage/vaultService';
import { VaultDocument } from './src/types/vault';
import { exportDocumentToPdf, triggerPrintMode } from './src/services/export/pdfExporter';
import { exportDocumentToPng } from './src/services/export/imageExporter';
import { encodeDocumentToShareUrl, decodeDocumentFromUrl } from './src/services/export/urlShare';
import { polishProfessionalSummary, quantifyImpactBullets, generateTailoredSummary } from './src/services/ai/textPolisher';

// Components
import { Navbar } from './src/components/common/Navbar';
import { CommandPalette } from './src/components/common/CommandPalette';
import { Toast, ToastMessage } from './src/components/common/Toast';
import { triggerCelebration } from './src/components/common/Confetti';
import { Hero } from './src/components/dashboard/Hero';
import { ToolGrid } from './src/components/dashboard/ToolGrid';
import { VaultSummary } from './src/components/dashboard/VaultSummary';
import { McpBanner } from './src/components/dashboard/McpBanner';
import { WorkspaceHeader } from './src/components/workspace/WorkspaceHeader';
import { WorkspaceEditor } from './src/components/workspace/WorkspaceEditor';
import { DocumentCanvas } from './src/components/workspace/DocumentCanvas';
import { AtsScoreGauge } from './src/components/workspace/AtsScoreGauge';
import { McpInspectorModal } from './src/components/workspace/McpInspectorModal';
import { AiCopilotDrawer } from './src/components/workspace/AiCopilotDrawer';
import { VaultModal } from './src/components/workspace/VaultModal';
import { JsonImportExportModal } from './src/components/workspace/JsonImportExportModal';

// PDF Extraction and Heuristic Parsing Helper
const parsePdfText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error("Failed to read file as ArrayBuffer"));
          return;
        }

        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          reject(new Error("PDF.js library is not loaded. Please verify your internet connection."));
          return;
        }

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const textItems = textContent.items.map((item: any) => item.str);
          fullText += textItems.join(" ") + "\n";
        }

        resolve(fullText);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("File reading error"));
    reader.readAsArrayBuffer(file);
  });
};

export const App: React.FC = () => {
  // App Navigation State
  const [isWorkspaceActive, setIsWorkspaceActive] = useState<boolean>(false);
  const [activeToolId, setActiveToolId] = useState<string>('1');
  const [documentTitle, setDocumentTitle] = useState<string>('Senior Cloud Engineer Resume');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('modern-tech');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [editorMode, setEditorMode] = useState<'wizard' | 'pro'>('pro');

  // Document Data State
  const [docData, setDocData] = useState<AnyDocumentData>(sampleCvData);
  const [activeDocId, setActiveDocId] = useState<string | undefined>(undefined);

  // Modals & Drawers
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isMcpInspectorOpen, setIsMcpInspectorOpen] = useState<boolean>(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState<boolean>(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState<boolean>(false);
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState<boolean>(false);

  // Notifications & Stats
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [mcpCallCount, setMcpCallCount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>(() => vaultService.getAllDocuments());

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const activeTool = useMemo(() => {
    return toolCatalog.find(t => t.id === activeToolId) || toolCatalog[0];
  }, [activeToolId]);

  // Available templates per tool
  const availableTemplates = useMemo(() => {
    if (activeToolId === '1') {
      return [
        { id: 'modern-tech', name: 'Modern Tech (Dual-Col)', description: 'Dual-accent sleek silicon layout' },
        { id: 'minimal-ats', name: 'Minimal ATS (Single-Col)', description: 'Ultra-clean single column parser' },
        { id: 'executive-sa', name: 'Executive South Africa', description: 'Formal serif typography with full EE compliance' },
        { id: 'creative-bold', name: 'Creative Bold Portfolio', description: 'Editorial high-contrast design for designers & tech leads' }
      ];
    }
    if (activeToolId === '2' || activeToolId === '4' || activeToolId === '10') {
      return [
        { id: 'classic-zoho', name: 'Classic Zoho Commercial', description: 'Emerald accent, professional VAT breakdown & itemized ledger' },
        { id: 'modern-ledger', name: 'Modern Ledger (Agency)', description: 'Dark high-contrast slate borders with prominent total block' },
        { id: 'minimal-swiss', name: 'Minimal Swiss Grid', description: 'Understated monochrome typography with clean horizontal rules' },
        { id: 'executive-crest', name: 'Executive Crest & Seal', description: 'Gold & sapphire luxury styling with legal remittance footer' }
      ];
    }
    return [
      { id: 'corporate-modern', name: 'Corporate Modern', description: 'Verified executive aesthetic' }
    ];
  }, [activeToolId]);

  // Initial Load: URL link decoding
  useEffect(() => {
    const shared = decodeDocumentFromUrl();
    if (shared) {
      setActiveToolId(shared.toolId);
      setDocData(shared.data);
      if (shared.templateId) setSelectedTemplateId(shared.templateId);
      setIsWorkspaceActive(true);
      showToast("Document loaded from shared link!", "success");

      // Clean query param
      const url = new URL(window.location.href);
      url.searchParams.delete('docShare');
      url.searchParams.delete('cvData');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  // Listen for MCP Server Tool Execution events
  useEffect(() => {
    const unsubscribe = mcpServer.onToolExecuted((toolName, params, result) => {
      setMcpCallCount(prev => prev + 1);
      if (result && result.toolId && result.data) {
        setActiveToolId(result.toolId);
        setDocData(result.data);
        setIsWorkspaceActive(true);
      }
    });
    return unsubscribe;
  }, []);

  // Auto-Save to Local Vault with debounce
  useEffect(() => {
    if (!isWorkspaceActive) return;
    const timer = setTimeout(() => {
      setIsSaving(true);
      const savedDoc = vaultService.saveDocument(
        activeToolId,
        documentTitle,
        docData,
        selectedTemplateId,
        activeDocId
      );
      if (!activeDocId) setActiveDocId(savedDoc.id);
      setVaultDocs(vaultService.getAllDocuments());
      setIsSaving(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [docData, documentTitle, selectedTemplateId, activeToolId, isWorkspaceActive]);

  // Tool Selection Handlers
  const handleSelectTool = (tool: ToolDefinition) => {
    setActiveToolId(tool.id);
    setActiveDocId(undefined);
    setDocumentTitle(tool.title);
    
    // Load appropriate sample data for tool
    if (tool.id === '1') {
      setDocData(sampleCvData);
      setSelectedTemplateId('modern-tech');
    } else if (tool.id === '2' || tool.id === '4' || tool.id === '10') {
      const initialDoc = billingService.getAllBillingDocuments()[0] || billingService.createInitialBillingDocument('invoice');
      setDocData(initialDoc);
      setSelectedTemplateId('classic-zoho');
    } else if (tool.id === '3') {
      setDocData(sampleCoverLetterData);
      setSelectedTemplateId('modern-letterhead');
    } else if (tool.id === '5') {
      setDocData(sampleNdaData);
      setSelectedTemplateId('standard-legal');
    } else if (tool.id === '6') {
      setDocData(sampleResignationData);
    } else if (tool.id === '7') {
      setDocData(sampleFreelanceContractData);
    } else if (tool.id === '8') {
      setDocData(sampleOfficialNoticeData);
    } else if (tool.id === '9') {
      setDocData(sampleCertificateData);
    }

    setIsWorkspaceActive(true);
  };

  const handleOpenVaultDoc = (doc: VaultDocument) => {
    const targetToolId = (doc.toolId === '4' || doc.toolId === '10') ? '2' : doc.toolId;
    setActiveToolId(targetToolId);
    setActiveDocId(doc.id);
    setDocumentTitle(doc.title);
    setSelectedTemplateId(doc.templateId || (targetToolId === '2' ? 'classic-zoho' : 'default'));
    setDocData(doc.data);
    setIsWorkspaceActive(true);
    showToast(`Loaded "${doc.title}" from vault`, 'info');
  };

  // PDF Upload Parser
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast("Extracting document data from PDF...", "info");
      const text = await parsePdfText(file);

      // Heuristic CV extraction
      const extractedCv: SouthAfricanCvData = {
        ...sampleCvData,
        fullName: file.name.replace(/_CV|\.pdf/gi, '').replace(/_/g, ' ') || "Imported Candidate"
      };

      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) extractedCv.emailAddress = emailMatch[0];

      const phoneMatch = text.match(/(?:\+27|0)\s*\d{2}\s*\d{3}\s*\d{4}/);
      if (phoneMatch) extractedCv.cellNumber = phoneMatch[0];

      const idMatch = text.match(/(\d{13})/);
      if (idMatch) extractedCv.idNumber = idMatch[1];

      setActiveToolId('1');
      setDocData(extractedCv);
      setDocumentTitle(extractedCv.fullName + " Resume");
      setIsWorkspaceActive(true);
      showToast("PDF parsed and imported into CV Builder!", "success");
    } catch (err: any) {
      showToast("Failed to parse PDF: " + err.message, "error");
    }
  };

  // Export handlers
  const handleExportPdf = async () => {
    showToast("Generating high-resolution A4 PDF...", "info");
    const success = await exportDocumentToPdf('document-preview-page', {
      fileName: `${documentTitle.replace(/\s+/g, '_')}.pdf`,
      onProgress: (msg) => showToast(msg, "info")
    });

    if (success) {
      triggerCelebration();
      showToast("PDF downloaded successfully!", "success");
    }
  };

  const handleExportPng = async () => {
    showToast("Rendering PNG image snapshot...", "info");
    const success = await exportDocumentToPng('document-preview-page', `${documentTitle.replace(/\s+/g, '_')}.png`);
    if (success) {
      showToast("PNG snapshot downloaded!", "success");
    }
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(docData, null, 2);
    navigator.clipboard.writeText(jsonStr);
    showToast("JSON payload copied to clipboard!", "success");
  };

  const handleShareLink = () => {
    const shareUrl = encodeDocumentToShareUrl(activeToolId, docData, selectedTemplateId);
    navigator.clipboard.writeText(shareUrl);
    showToast("Shareable link copied to clipboard!", "success");
  };

  // ATS 1-Click Fix Dispatcher
  const handleAtsFix = (action: string) => {
    if (action.startsWith('add_skill_')) {
      const skillName = action.replace('add_skill_', '').trim();
      if (skillName) {
        setDocData(prev => {
          const cv = prev as SouthAfricanCvData;
          const currentSkills = cv.skills || [];
          if (!currentSkills.includes(skillName)) {
            return { ...cv, skills: [...currentSkills, skillName] };
          }
          return cv;
        });
        showToast(`Added missing ATS keyword: "${skillName}"!`, "success");
      }
    } else if (action === 'polish_verbs' || action === 'add_metrics') {
      setDocData(prev => {
        const cv = prev as SouthAfricanCvData;
        const polishedExp = (cv.workExperience || []).map(exp => ({
          ...exp,
          responsibilities: quantifyImpactBullets(exp.responsibilities, exp.jobTitle)
        }));
        return { ...cv, workExperience: polishedExp };
      });
      showToast("Work experience bullets quantified with power action verbs & metrics!", "success");
    } else if (action === 'generate_summary') {
      const cv = docData as SouthAfricanCvData;
      const polished = generateTailoredSummary({
        roleTitle: cv.headline || "Software Engineer",
        targetJobDescription: cv.targetJobDescription,
        skills: cv.skills
      });
      setDocData(prev => ({ ...prev, professionalSummary: polished }));
      showToast("AI Generated an ATS-optimized professional summary!", "success");
    } else if (action === 'suggest_skills') {
      setDocData(prev => ({
        ...prev,
        skills: Array.from(new Set([...((prev as SouthAfricanCvData).skills || []), "TypeScript", "React", "Next.js", "Docker", "PostgreSQL", "CI/CD", "Agile Delivery"]))
      }));
      showToast("Added in-demand domain skill keywords!", "success");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Toast System */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Global Top Navbar */}
      <Navbar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenVault={() => setIsVaultModalOpen(true)}
        onOpenMcpInspector={() => setIsMcpInspectorOpen(true)}
        onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
        onGoHome={() => setIsWorkspaceActive(false)}
        isWorkspaceActive={isWorkspaceActive}
        activeToolTitle={activeTool.title}
        mcpCallCount={mcpCallCount}
      />

      {/* Hidden File Input for PDF Imports */}
      <input
        type="file"
        id="global-pdf-upload"
        accept=".pdf"
        onChange={handlePdfUpload}
        className="hidden"
      />

      {/* Main View: Workspace or Dashboard */}
      {isWorkspaceActive ? (
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
          {/* Workspace Action Toolbar */}
          <WorkspaceHeader
            tool={activeTool}
            documentTitle={documentTitle}
            onTitleChange={setDocumentTitle}
            editorMode={editorMode}
            onToggleEditorMode={setEditorMode}
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={setSelectedTemplateId}
            availableTemplates={availableTemplates}
            onBackToDashboard={() => setIsWorkspaceActive(false)}
            onSaveDocument={() => showToast("Document saved in local Vault!", "success")}
            onExportPdf={handleExportPdf}
            onExportPng={handleExportPng}
            onExportJson={handleExportJson}
            onShareLink={handleShareLink}
            onOpenPrint={triggerPrintMode}
            onOpenMcpInspector={() => setIsMcpInspectorOpen(true)}
            onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
            onOpenJsonEditor={() => setIsJsonEditorOpen(true)}
            isSaving={isSaving}
          />

          {/* Dual-Pane Studio Body */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Column: Form Editor & Controls */}
            <div className="w-full lg:w-[480px] xl:w-[520px] h-full overflow-y-auto p-4 border-r border-white/10 bg-[#0A0D14] space-y-4 no-scrollbar">
              
              {/* ATS Resume Gauge for CV Builder */}
              {activeToolId === '1' && (
                <AtsScoreGauge
                  cvData={docData as SouthAfricanCvData}
                  onApplyFix={handleAtsFix}
                />
              )}

              {/* Form Editor */}
              <WorkspaceEditor
                toolId={activeToolId}
                data={docData}
                onChange={setDocData}
                editorMode={editorMode}
                onShowToast={showToast}
              />
            </div>

            {/* Right Column: Live A4 Canvas Preview */}
            <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#07080B]">
              <DocumentCanvas
                toolId={activeToolId}
                data={docData}
                templateId={selectedTemplateId}
                zoomLevel={zoomLevel}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Dashboard Home View */
        <main className="flex-1 overflow-y-auto">
          {/* Hero Section */}
          <Hero
            onImportPdfClick={() => document.getElementById('global-pdf-upload')?.click()}
            onOpenMcpInspector={() => setIsMcpInspectorOpen(true)}
            onOpenVault={() => setIsVaultModalOpen(true)}
            totalDocsCount={vaultDocs.length}
            onSelectQuickTool={(tId) => {
              const tool = toolCatalog.find(t => t.id === tId);
              if (tool) handleSelectTool(tool);
            }}
          />

          {/* Recent Vault Documents Summary */}
          <VaultSummary
            documents={vaultDocs}
            onOpenDocument={handleOpenVaultDoc}
            onOpenVaultModal={() => setIsVaultModalOpen(true)}
          />

          {/* MCP Server Live Banner */}
          <McpBanner
            onOpenMcpInspector={() => setIsMcpInspectorOpen(true)}
            onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
          />

          {/* 10-Tool Filterable Grid */}
          <ToolGrid onSelectTool={handleSelectTool} />

          {/* Footer */}
          <footer className="border-t border-white/10 py-8 px-4 text-center text-xs text-slate-500 font-mono">
            <p>DocStudio Pro 2.4 • Model Context Protocol Enabled • Client-Side Confidentiality Guaranteed</p>
          </footer>
        </main>
      )}

      {/* Global Modals & Drawers */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTool={(tId) => {
          const tool = toolCatalog.find(t => t.id === tId);
          if (tool) handleSelectTool(tool);
        }}
        onOpenMcpInspector={() => setIsMcpInspectorOpen(true)}
        onOpenVault={() => setIsVaultModalOpen(true)}
        onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
      />

      <McpInspectorModal
        isOpen={isMcpInspectorOpen}
        onClose={() => setIsMcpInspectorOpen(false)}
        onHydrateFromToolCall={(tId, payload) => {
          setActiveToolId(tId);
          setDocData(payload);
          setIsWorkspaceActive(true);
        }}
        onShowToast={showToast}
      />

      <AiCopilotDrawer
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        activeToolId={activeToolId}
        currentData={docData}
        onHydrateFromToolCall={(tId, payload) => {
          setActiveToolId(tId);
          setDocData(payload);
          setIsWorkspaceActive(true);
        }}
        onShowToast={showToast}
      />

      <VaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        onOpenDocument={handleOpenVaultDoc}
        onShowToast={showToast}
      />

      <JsonImportExportModal
        isOpen={isJsonEditorOpen}
        onClose={() => setIsJsonEditorOpen(false)}
        currentData={docData}
        onImportJson={(hydrated) => setDocData(hydrated)}
        onShowToast={showToast}
      />
    </div>
  );
};

export default App;

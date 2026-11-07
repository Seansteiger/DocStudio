import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Palette, 
  Sparkles, 
  Terminal, 
  FileCode, 
  FileImage, 
  FileText, 
  Save, 
  Check, 
  ChevronDown, 
  Wand2, 
  Layout, 
  Code
} from 'lucide-react';
import { ToolDefinition } from '../../types/document';

interface WorkspaceHeaderProps {
  tool: ToolDefinition;
  documentTitle: string;
  onTitleChange: (newTitle: string) => void;
  editorMode: 'wizard' | 'pro';
  onToggleEditorMode: (mode: 'wizard' | 'pro') => void;
  zoomLevel: number;
  onZoomChange: (newZoom: number) => void;
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  availableTemplates: Array<{ id: string; name: string; description: string }>;
  onBackToDashboard: () => void;
  onSaveDocument: () => void;
  onExportPdf: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onShareLink: () => void;
  onOpenPrint: () => void;
  onOpenMcpInspector: () => void;
  onOpenAiCopilot: () => void;
  onOpenJsonEditor: () => void;
  isSaving?: boolean;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  tool,
  documentTitle,
  onTitleChange,
  editorMode,
  onToggleEditorMode,
  zoomLevel,
  onZoomChange,
  selectedTemplateId,
  onSelectTemplate,
  availableTemplates,
  onBackToDashboard,
  onSaveDocument,
  onExportPdf,
  onExportPng,
  onExportJson,
  onShareLink,
  onOpenPrint,
  onOpenMcpInspector,
  onOpenAiCopilot,
  onOpenJsonEditor,
  isSaving
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  return (
    <div className="w-full bg-[#0E1118] border-b border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3 no-print sticky top-0 z-30 shadow-md">
      
      {/* Left Group: Back, Tool Badge, Document Title Editor */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToDashboard}
          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all"
          title="Back to Studio Dashboard"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
          <span 
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: tool.color }}
          />
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-transparent hover:bg-white/5 focus:bg-black/40 border border-transparent hover:border-white/10 focus:border-indigo-500/50 rounded-lg px-2 py-1 text-sm font-bold text-white focus:outline-none transition-colors max-w-[200px] sm:max-w-xs"
            placeholder="Untitled Document"
          />
        </div>
      </div>

      {/* Center Controls: Wizard vs Pro Mode, Template Selector, Zoom Controls */}
      <div className="flex items-center gap-2">
        {/* Wizard / Pro Mode Toggle */}
        <div className="bg-black/40 border border-white/10 p-0.5 rounded-xl flex items-center">
          <button
            onClick={() => onToggleEditorMode('wizard')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              editorMode === 'wizard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 size={13} />
            <span className="hidden md:inline">Guided Wizard</span>
          </button>
          <button
            onClick={() => onToggleEditorMode('pro')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              editorMode === 'pro'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layout size={13} />
            <span className="hidden md:inline">Pro Studio</span>
          </button>
        </div>

        {/* Template Switcher Dropdown */}
        {availableTemplates.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setIsTemplateOpen(!isTemplateOpen)}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all"
            >
              <Palette size={14} className="text-indigo-400" />
              <span className="hidden sm:inline">Theme:</span>
              <span className="font-mono text-white capitalize">{selectedTemplateId.replace('-', ' ')}</span>
              <ChevronDown size={13} />
            </button>

            {isTemplateOpen && (
              <div 
                className="absolute left-0 mt-2 w-56 bg-[#141824] border border-white/15 rounded-xl shadow-2xl p-1 z-50 space-y-1"
                onMouseLeave={() => setIsTemplateOpen(false)}
              >
                {availableTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTemplate(t.id);
                      setIsTemplateOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex flex-col transition-colors ${
                      selectedTemplateId === t.id
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="font-semibold">{t.name}</span>
                    <span className="text-[10px] text-slate-400 opacity-90">{t.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Zoom Controls */}
        <div className="hidden lg:flex items-center bg-black/40 border border-white/10 rounded-xl px-2 py-1 text-xs text-slate-400">
          <button
            onClick={() => onZoomChange(Math.max(0.5, zoomLevel - 0.1))}
            className="p-1 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="font-mono text-[11px] px-1.5 text-white">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => onZoomChange(Math.min(1.5, zoomLevel + 0.1))}
            className="p-1 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={() => onZoomChange(1.0)}
            className="ml-1 pl-1 border-l border-white/10 hover:text-white"
            title="Reset Zoom (100%)"
          >
            <Maximize2 size={12} />
          </button>
        </div>
      </div>

      {/* Right Controls: Save, Export Dropdown, MCP, AI Copilot */}
      <div className="flex items-center gap-2">
        {/* Auto-Save Status */}
        <button
          onClick={onSaveDocument}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all"
          title="Save Document to Vault"
        >
          <Save size={14} className={isSaving ? "text-amber-400 animate-spin" : "text-emerald-400"} />
          <span className="hidden sm:inline">{isSaving ? "Saving..." : "Saved"}</span>
        </button>

        {/* Share Link */}
        <button
          onClick={onShareLink}
          className="p-2 sm:px-3 sm:py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          title="Copy URL Share Link"
        >
          <Share2 size={14} className="text-cyan-400" />
          <span className="hidden md:inline">Share</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all hover:scale-105"
          >
            <Download size={14} />
            <span>Export Document</span>
            <ChevronDown size={13} />
          </button>

          {isExportOpen && (
            <div 
              className="absolute right-0 mt-2 w-52 bg-[#141824] border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 space-y-1"
              onMouseLeave={() => setIsExportOpen(false)}
            >
              <button
                onClick={() => { onExportPdf(); setIsExportOpen(false); }}
                className="w-full text-left p-2 rounded-lg text-xs flex items-center gap-2 hover:bg-indigo-600 text-white font-semibold transition-colors"
              >
                <Download size={14} className="text-emerald-400" />
                <span>Download PDF (A4 HQ)</span>
              </button>

              <button
                onClick={() => { onOpenPrint(); setIsExportOpen(false); }}
                className="w-full text-left p-2 rounded-lg text-xs flex items-center gap-2 hover:bg-indigo-600 text-white font-semibold transition-colors"
              >
                <Printer size={14} className="text-sky-400" />
                <span>Print / Save as PDF</span>
              </button>

              <button
                onClick={() => { onExportPng(); setIsExportOpen(false); }}
                className="w-full text-left p-2 rounded-lg text-xs flex items-center gap-2 hover:bg-indigo-600 text-white font-semibold transition-colors"
              >
                <FileImage size={14} className="text-pink-400" />
                <span>Download PNG Image</span>
              </button>

              <button
                onClick={() => { onExportJson(); setIsExportOpen(false); }}
                className="w-full text-left p-2 rounded-lg text-xs flex items-center gap-2 hover:bg-indigo-600 text-white font-semibold transition-colors font-mono"
              >
                <Code size={14} className="text-amber-400" />
                <span>Export JSON Payload</span>
              </button>
            </div>
          )}
        </div>

        {/* MCP Playground Button */}
        <button
          onClick={onOpenMcpInspector}
          className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 transition-all font-mono text-xs flex items-center gap-1.5"
          title="Open MCP JSON-RPC Inspector"
        >
          <Terminal size={14} />
          <span className="hidden lg:inline">MCP</span>
        </button>

        {/* AI Copilot Drawer Trigger */}
        <button
          onClick={onOpenAiCopilot}
          className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400 transition-all"
          title="Ask AI Copilot"
        >
          <Sparkles size={15} />
        </button>
      </div>

    </div>
  );
};

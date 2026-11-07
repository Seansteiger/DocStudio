import React from 'react';
import { Sparkles, Terminal, Database, Command, HelpCircle, Layers, FileText, Bot } from 'lucide-react';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onOpenVault: () => void;
  onOpenMcpInspector: () => void;
  onOpenAiCopilot: () => void;
  onGoHome: () => void;
  isWorkspaceActive: boolean;
  activeToolTitle?: string;
  mcpCallCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onOpenVault,
  onOpenMcpInspector,
  onOpenAiCopilot,
  onGoHome,
  isWorkspaceActive,
  activeToolTitle,
  mcpCallCount
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090A0F]/80 border-b border-white/10 transition-all no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onGoHome}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#0E1017] rounded-[11px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-sans">DocStudio</span>
              <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">PRO 2.4</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Intelligent Document & MCP Creation Suite</p>
          </div>
        </div>

        {/* Middle: Active Document Context or Quick Search */}
        <div className="flex items-center gap-3">
          {isWorkspaceActive && activeToolTitle ? (
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-slate-400">Workspace:</span>
              <span className="font-semibold text-white">{activeToolTitle}</span>
            </div>
          ) : null}

          {/* Command Palette Trigger */}
          <button 
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-all shadow-xs"
          >
            <Command size={14} className="text-indigo-400" />
            <span className="hidden sm:inline">Quick Find & Actions...</span>
            <kbd className="hidden sm:inline font-mono text-[10px] bg-black/40 border border-white/10 px-1.5 py-0.5 rounded text-slate-400">⌘K</kbd>
          </button>
        </div>

        {/* Right Tools Navigation */}
        <div className="flex items-center gap-2">
          {/* MCP Server Inspector Pill */}
          <button
            onClick={onOpenMcpInspector}
            className="relative flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 hover:border-emerald-500/60 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-400 transition-all shadow-xs"
            title="Open Model Context Protocol Inspector & JSON-RPC Playground"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Terminal size={14} />
            <span className="font-bold">MCP SERVER</span>
            {mcpCallCount > 0 && (
              <span className="ml-1 bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                {mcpCallCount}
              </span>
            )}
          </button>

          {/* Document Vault */}
          <button
            onClick={onOpenVault}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 p-2 sm:px-3 sm:py-2 rounded-xl text-xs text-slate-300 hover:text-white transition-all"
            title="Open Saved Documents Vault"
          >
            <Database size={15} className="text-indigo-400" />
            <span className="hidden md:inline font-medium">Vault</span>
          </button>

          {/* AI Copilot Toggle */}
          <button
            onClick={onOpenAiCopilot}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3.5 py-2 rounded-xl text-xs shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all hover:scale-105"
          >
            <Bot size={15} />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>
        </div>

      </div>
    </header>
  );
};

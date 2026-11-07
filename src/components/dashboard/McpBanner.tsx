import React from 'react';
import { Terminal, CheckCircle2, Copy, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

interface McpBannerProps {
  onOpenMcpInspector: () => void;
  onOpenAiCopilot: () => void;
}

export const McpBanner: React.FC<McpBannerProps> = ({ onOpenMcpInspector, onOpenAiCopilot }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-emerald-950/40 via-[#0B101B] to-indigo-950/40 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                Model Context Protocol (MCP) Live Connector
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
              Automate Document Workflows with Claude, Cursor, Antigravity & Cline
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              DocStudio functions as a fully compliant MCP Server. AI agents can autonomously generate invoices, 
              tailor CVs to job postings, audit ATS keywords, and draft legal agreements via standard JSON-RPC 2.0.
            </p>

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="bg-black/40 border border-white/10 text-emerald-300 px-2.5 py-1 rounded-lg">
                ⚡ docstudio_create_document
              </span>
              <span className="bg-black/40 border border-white/10 text-emerald-300 px-2.5 py-1 rounded-lg">
                ⚡ docstudio_generate_invoice
              </span>
              <span className="bg-black/40 border border-white/10 text-emerald-300 px-2.5 py-1 rounded-lg">
                ⚡ docstudio_audit_ats_resume
              </span>
              <span className="bg-black/40 border border-white/10 text-indigo-300 px-2.5 py-1 rounded-lg">
                + 7 more tools
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full lg:w-auto">
            <button
              onClick={onOpenMcpInspector}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm font-mono shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105"
            >
              <Terminal size={16} />
              <span>Launch MCP Playground</span>
            </button>

            <button
              onClick={onOpenAiCopilot}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold px-6 py-3 rounded-xl text-xs transition-colors"
            >
              <Sparkles size={15} className="text-indigo-400" />
              <span>Chat with In-App MCP Agent</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

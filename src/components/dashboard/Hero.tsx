import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, FileUp, Database, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface HeroProps {
  onImportPdfClick: () => void;
  onOpenMcpInspector: () => void;
  onOpenVault: () => void;
  totalDocsCount: number;
  onSelectQuickTool: (toolId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onImportPdfClick,
  onOpenMcpInspector,
  onOpenVault,
  totalDocsCount,
  onSelectQuickTool
}) => {
  return (
    <div className="relative pt-8 pb-10 px-4 sm:px-6">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center">
        {/* Release Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-xs font-mono text-indigo-400 mb-6 shadow-xs"
        >
          <Sparkles size={14} className="text-indigo-400" />
          <span>DOCSTUDIO PRO 2.4 — MODEL CONTEXT PROTOCOL (MCP) READY</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4"
        >
          World-Class Document Studio <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">
            For Professionals & AI Agents
          </span>
        </motion.h1>

        {/* Subtitle Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8"
        >
          Generate ATS-compliant CVs, verified tax invoices, contracts, NDAs, and credentials in seconds. 
          Seamlessly controllable by humans or automated via standard <strong>MCP JSON-RPC tools</strong>.
        </motion.p>

        {/* Quick Action Button Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {/* Primary Action: Create CV */}
          <button
            onClick={() => onSelectQuickTool('1')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-105"
          >
            <Zap size={16} />
            <span>Create New CV</span>
          </button>

          {/* Create Tax Invoice */}
          <button
            onClick={() => onSelectQuickTool('2')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-4 py-3 rounded-xl text-xs sm:text-sm border border-white/10 transition-all hover:scale-105"
          >
            <span>Create Invoice</span>
          </button>

          {/* Import PDF */}
          <button
            onClick={onImportPdfClick}
            className="flex items-center gap-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:scale-105"
          >
            <FileUp size={16} className="text-emerald-400" />
            <span>Import PDF</span>
          </button>

          {/* MCP Server Inspector */}
          <button
            onClick={onOpenMcpInspector}
            className="flex items-center gap-2 bg-black/40 hover:bg-white/5 text-slate-300 border border-white/15 px-4 py-3 rounded-xl text-xs sm:text-sm font-mono transition-all hover:border-indigo-400/50"
          >
            <Terminal size={15} className="text-indigo-400" />
            <span>MCP Playground</span>
          </button>
        </motion.div>

        {/* Feature Highlights Badges */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-emerald-400" />
            <span>100% Client-Side Privacy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={15} className="text-indigo-400" />
            <span>ATS Score & EE Compliance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Terminal size={15} className="text-cyan-400" />
            <span>Model Context Protocol v2024-11-05</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database size={15} className="text-amber-400" />
            <span>{totalDocsCount} Documents in Vault</span>
          </div>
        </div>

      </div>
    </div>
  );
};

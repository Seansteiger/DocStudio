import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Receipt, FileSignature, Layers, ShieldCheck, LogOut, Briefcase, AlertTriangle, Award, CreditCard, Terminal, Sparkles, X } from 'lucide-react';
import { toolCatalog } from '../../data/skillCatalog';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
  onOpenMcpInspector: () => void;
  onOpenVault: () => void;
  onOpenAiCopilot: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  onOpenMcpInspector,
  onOpenVault,
  onOpenAiCopilot
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTools = toolCatalog.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) || 
    t.description.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-2xl bg-[#0F121A] border border-white/15 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden z-10"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-white/10">
            <Search size={18} className="text-indigo-400 mr-3" />
            <input
              autoFocus
              type="text"
              placeholder="Search tools, MCP actions, templates, or shortcuts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
            />
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X size={16} />
            </button>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="p-3 border-b border-white/5 bg-black/20 flex flex-wrap gap-2">
            <button
              onClick={() => { onOpenAiCopilot(); onClose(); }}
              className="flex items-center gap-1.5 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Sparkles size={13} />
              <span>Ask AI Copilot</span>
            </button>
            <button
              onClick={() => { onOpenMcpInspector(); onClose(); }}
              className="flex items-center gap-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors font-mono"
            >
              <Terminal size={13} />
              <span>MCP Playground</span>
            </button>
            <button
              onClick={() => { onOpenVault(); onClose(); }}
              className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-2.5 py-1 rounded-lg transition-colors"
            >
              <FileText size={13} />
              <span>Open Vault</span>
            </button>
          </div>

          {/* Search Results List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Document Creation Tools ({filteredTools.length})
            </div>

            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool.id);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white" 
                    style={{ backgroundColor: `${tool.color}25`, border: `1px solid ${tool.color}40` }}
                  >
                    <Layers size={18} style={{ color: tool.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                      {tool.title}
                      {tool.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1">{tool.description}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-slate-400 group-hover:text-white transition-colors">
                    {tool.templatesCount} Templates →
                  </span>
                </div>
              </div>
            ))}

            {filteredTools.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No matching tools found for "{query}".
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 px-4 font-mono">
            <span>Navigation: ↑ ↓ Enter</span>
            <span>DocStudio Pro v2.4</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

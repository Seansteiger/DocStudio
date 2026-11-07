import React from 'react';
import { VaultDocument } from '../../types/vault';
import { Database, FileText, ArrowRight, Copy, Clock, Sparkles } from 'lucide-react';

interface VaultSummaryProps {
  documents: VaultDocument[];
  onOpenDocument: (doc: VaultDocument) => void;
  onOpenVaultModal: () => void;
}

export const VaultSummary: React.FC<VaultSummaryProps> = ({
  documents,
  onOpenDocument,
  onOpenVaultModal
}) => {
  const recentDocs = documents.slice(0, 4);

  if (recentDocs.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Recent Documents in Vault</h2>
          <span className="text-xs font-mono bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded-full">
            {documents.length} Saved
          </span>
        </div>
        <button
          onClick={onOpenVaultModal}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <span>View All Vault Documents</span>
          <ArrowRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onOpenDocument(doc)}
            className="p-4 bg-[#0E1118] hover:bg-[#141824] border border-white/10 hover:border-indigo-500/40 rounded-2xl cursor-pointer group transition-all shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                {doc.category}
              </span>
              {doc.atsScore ? (
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                  ATS {doc.atsScore}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-500">v{doc.version}</span>
              )}
            </div>

            <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
              {doc.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1 mb-3">
              {doc.subtitle}
            </p>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {new Date(doc.updatedAt).toLocaleDateString()}
              </span>
              <span className="text-indigo-400 font-semibold group-hover:underline">Open Studio →</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

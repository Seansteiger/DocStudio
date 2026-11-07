import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  FileText, 
  Trash2, 
  Copy, 
  Clock, 
  Download, 
  Upload, 
  X, 
  Search, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { VaultDocument } from '../../types/vault';
import { vaultService } from '../../services/storage/vaultService';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDocument: (doc: VaultDocument) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const VaultModal: React.FC<VaultModalProps> = ({
  isOpen,
  onClose,
  onOpenDocument,
  onShowToast
}) => {
  const [docs, setDocs] = useState<VaultDocument[]>(() => vaultService.getAllDocuments());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  if (!isOpen) return null;

  const filteredDocs = docs.filter(d => {
    const matchesCat = filterCategory === 'all' || d.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesQuery = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this document from your vault?")) {
      vaultService.deleteDocument(id);
      setDocs(vaultService.getAllDocuments());
      onShowToast("Document removed from vault.", "info");
    }
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const dup = vaultService.duplicateDocument(id);
    if (dup) {
      setDocs(vaultService.getAllDocuments());
      onShowToast("Document duplicated successfully.", "success");
    }
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(docs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `docstudio_vault_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast("Vault backup exported successfully!", "success");
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          vaultService.saveAllDocuments(imported);
          setDocs(imported);
          onShowToast("Vault backup imported successfully!", "success");
        } else {
          onShowToast("Invalid vault JSON format.", "error");
        }
      } catch (err) {
        onShowToast("Failed to parse backup JSON.", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 no-print">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl h-[80vh] bg-[#0A0D14] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 font-sans"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Database size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Document Vault & Local Storage</h2>
                <p className="text-xs text-slate-400">Manage all saved documents, version snapshots, and backups</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                title="Export all documents as JSON backup"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Export Backup</span>
              </button>

              <label className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                <Upload size={13} />
                <span className="hidden sm:inline">Import Backup</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>

              <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 ml-2">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="px-6 py-3 border-b border-white/10 bg-black/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              {['all', 'Career', 'Finance', 'Legal', 'Credentials'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat.toLowerCase())}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    filterCategory === cat.toLowerCase()
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Documents Grid */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#07090E]">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  onOpenDocument(doc);
                  onClose();
                }}
                className="p-4 bg-[#0E1118] hover:bg-[#141824] border border-white/10 hover:border-indigo-500/40 rounded-2xl cursor-pointer group transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                      {doc.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {doc.atsScore ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                          ATS {doc.atsScore}
                        </span>
                      ) : null}
                      <span className="text-[10px] font-mono text-slate-500">v{doc.version}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors mb-1">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mb-3">
                    {doc.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleDuplicate(doc.id, e)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
                      title="Duplicate Document"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="p-1.5 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredDocs.length === 0 && (
              <div className="col-span-2 p-12 text-center text-slate-500 text-xs">
                No documents found matching your filter criteria.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>IndexedDB & LocalStorage Enabled • Auto-saves every modification</span>
            <span>{docs.length} Documents Saved</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Copy, Check, Upload, X, AlertCircle } from 'lucide-react';
import { AnyDocumentData } from '../../types/document';

interface JsonImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: AnyDocumentData;
  onImportJson: (parsedData: AnyDocumentData) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const JsonImportExportModal: React.FC<JsonImportExportModalProps> = ({
  isOpen,
  onClose,
  currentData,
  onImportJson,
  onShowToast
}) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setJsonText(JSON.stringify(currentData, null, 2));
      setErrorMsg(null);
    }
  }, [isOpen, currentData]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setIsCopied(true);
    onShowToast("JSON payload copied to clipboard!", "success");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleApply = () => {
    try {
      setErrorMsg(null);
      if (!jsonText.trim()) {
        setErrorMsg("Please provide a valid JSON string.");
        return;
      }
      const parsed = JSON.parse(jsonText);
      onImportJson(parsed);
      onShowToast("Document hydrated from JSON successfully!", "success");
      onClose();
    } catch (e: any) {
      setErrorMsg("JSON Syntax Error: " + e.message);
    }
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
          className="relative w-full max-w-3xl h-[75vh] bg-[#0A0D14] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 font-sans"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Code size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Raw JSON Document Payload</h2>
                <p className="text-xs text-slate-400">Directly inspect, edit, or hydrate document state</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-colors"
              >
                {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{isCopied ? "Copied" : "Copy JSON"}</span>
              </button>

              <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 ml-2">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 p-6 flex flex-col space-y-3 bg-[#07090E]">
            <textarea
              rows={16}
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full flex-1 bg-black/60 border border-white/10 rounded-2xl p-4 font-mono text-xs text-emerald-300 focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
            />

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-black/40 border-t border-white/10 flex items-center justify-between">
            <button onClick={onClose} className="text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md transition-colors"
            >
              Apply JSON to Workspace
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

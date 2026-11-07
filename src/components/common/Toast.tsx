import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id?: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  const bgStyle =
    toast.type === 'success'
      ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
      : toast.type === 'error'
      ? 'bg-rose-950/90 border-rose-500/40 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
      : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-300 shadow-[0_0_25px_rgba(99,102,241,0.3)]';

  const icon =
    toast.type === 'success' ? (
      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
    ) : toast.type === 'error' ? (
      <AlertCircle size={18} className="text-rose-400 shrink-0" />
    ) : (
      <Info size={18} className="text-indigo-400 shrink-0" />
    );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-2xl text-xs sm:text-sm font-medium ${bgStyle} max-w-md no-print`}
      >
        {icon}
        <span className="leading-snug">{toast.message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-75 p-1">
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

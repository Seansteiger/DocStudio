import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Terminal, 
  X, 
  CheckCircle2, 
  Zap, 
  RefreshCw, 
  User, 
  CornerDownLeft 
} from 'lucide-react';
import { copilotService, CopilotMessage } from '../../services/ai/copilot';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeToolId: string;
  currentData: any;
  onHydrateFromToolCall: (toolId: string, data: any) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  activeToolId,
  currentData,
  onHydrateFromToolCall,
  onShowToast
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "👋 Hi there! I'm your **DocStudio AI Copilot** with direct **Model Context Protocol (MCP)** tool execution powers.\n\nAsk me anything or tell me what to build:\n• *\"Create a South African CV for a senior full-stack developer\"*\n• *\"Generate an invoice for R45,000 for cloud consulting\"*\n• *\"Draft a mutual NDA for an AI startup\"*\n• *\"Audit my resume for ATS compliance\"*",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || isThinking) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputPrompt,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    const promptToSend = inputPrompt;
    setInputPrompt('');
    setIsThinking(true);

    try {
      const responses = await copilotService.processUserPrompt(
        promptToSend,
        activeToolId,
        currentData,
        (tId, payload) => {
          onHydrateFromToolCall(tId, payload);
          onShowToast(`Workspace updated via MCP Agent tool call!`, 'success');
        }
      );

      setMessages(prev => [...prev, ...responses]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ An error occurred: ${e.message || "Failed to process prompt."}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end no-print">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Drawer Window */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-[#0D1017] border-l border-white/15 shadow-2xl flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>DocStudio AI Copilot</span>
                  <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                    MCP AGENT
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Natural language document generation</p>
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5">
              <X size={16} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs leading-relaxed">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              const isTool = m.sender === 'mcp_tool';

              if (isTool) {
                return (
                  <div key={m.id} className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 font-mono text-[11px] text-emerald-300 flex items-center gap-2">
                    <Terminal size={14} className="text-emerald-400 shrink-0" />
                    <span>{m.text}</span>
                  </div>
                );
              }

              return (
                <div key={m.id} className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                      <Sparkles size={12} />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-line ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono p-2">
                <RefreshCw size={14} className="animate-spin text-indigo-400" />
                <span>DocStudio Agent reasoning and orchestrating MCP tools...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Box */}
          <div className="p-3 border-t border-white/10 bg-black/40">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                placeholder="Ask Copilot or type an MCP command..."
                className="w-full bg-[#141824] border border-white/10 focus:border-indigo-500/60 rounded-xl py-2.5 pl-3.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputPrompt.trim() || isThinking}
                className="absolute right-2 text-indigo-400 hover:text-white p-1 rounded-lg disabled:opacity-30"
              >
                <Send size={15} />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1 font-mono">
              <span>Press Enter to send</span>
              <span>Powered by Model Context Protocol</span>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Download, 
  X, 
  Activity, 
  Sparkles, 
  Layers, 
  Code, 
  FileText, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { mcpServer } from '../../services/mcp/server';
import { DOCSTUDIO_MCP_TOOLS } from '../../services/mcp/tools';
import { DOCSTUDIO_MCP_PROMPTS } from '../../services/mcp/prompts';
import { getClientMcpConfigs, ClientMcpConfig } from '../../services/mcp/configs';
import { McpCallLog, JsonRpcRequest } from '../../types/mcp';

interface McpInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHydrateFromToolCall?: (toolId: string, data: any) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const McpInspectorModal: React.FC<McpInspectorModalProps> = ({
  isOpen,
  onClose,
  onHydrateFromToolCall,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'playground' | 'tools' | 'prompts' | 'configs' | 'logs'>('playground');
  const [selectedToolName, setSelectedToolName] = useState<string>(DOCSTUDIO_MCP_TOOLS[0].name);
  const [jsonRpcInput, setJsonRpcInput] = useState<string>('');
  const [jsonRpcOutput, setJsonRpcOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<McpCallLog[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    setLogs(mcpServer.getLogs());
    // Pre-populate sample RPC request
    const defaultReq: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: 'req-001',
      method: 'tools/call',
      params: {
        name: selectedToolName,
        arguments: selectedToolName === 'docstudio_generate_invoice' 
          ? { companyName: "Acme Cloud Ltd", clientName: "Global Logistics", currency: "ZAR", items: [{ description: "Cloud Setup", quantity: 1, rate: 25000 }] }
          : { toolId: "1", industry: "tech" }
      }
    };
    setJsonRpcInput(JSON.stringify(defaultReq, null, 2));
  }, [selectedToolName, isOpen]);

  if (!isOpen) return null;

  const clientConfigs = getClientMcpConfigs(window.location.origin);

  const handleExecuteRpc = async () => {
    try {
      setIsRunning(true);
      const parsedReq = JSON.parse(jsonRpcInput);
      const response = await mcpServer.handleJsonRpc(parsedReq);
      setJsonRpcOutput(JSON.stringify(response, null, 2));
      setLogs(mcpServer.getLogs());

      if (response.result?.toolId && response.result?.data && onHydrateFromToolCall) {
        onHydrateFromToolCall(response.result.toolId, response.result.data);
        onShowToast(`Tool ${parsedReq.params?.name} executed & hydrated workspace!`, 'success');
      } else {
        onShowToast("JSON-RPC executed successfully!", 'success');
      }
    } catch (e: any) {
      setJsonRpcOutput(JSON.stringify({ error: e.message }, null, 2));
      onShowToast("JSON-RPC execution error: " + e.message, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyConfig = (configJson: string, index: number) => {
    navigator.clipboard.writeText(configJson);
    setCopiedIndex(index);
    onShowToast("Config copied to clipboard!", "success");
    setTimeout(() => setCopiedIndex(null), 2000);
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
          className="relative w-full max-w-5xl h-[85vh] bg-[#0A0D14] border border-white/15 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden z-10 font-sans"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Terminal size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Model Context Protocol (MCP) Inspector</h2>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    LIVE SERVER 2.4
                  </span>
                </div>
                <p className="text-xs text-slate-400">Test JSON-RPC 2.0 tool execution and export client configs</p>
              </div>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5">
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 border-b border-white/10 flex items-center gap-2 bg-black/20 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('playground')}
              className={`py-3 px-3.5 border-b-2 font-semibold transition-all ${
                activeTab === 'playground'
                  ? 'border-emerald-400 text-emerald-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Interactive Playground
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`py-3 px-3.5 border-b-2 font-semibold transition-all ${
                activeTab === 'tools'
                  ? 'border-emerald-400 text-emerald-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Registered Tools ({DOCSTUDIO_MCP_TOOLS.length})
            </button>

            <button
              onClick={() => setActiveTab('prompts')}
              className={`py-3 px-3.5 border-b-2 font-semibold transition-all ${
                activeTab === 'prompts'
                  ? 'border-emerald-400 text-emerald-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              MCP Prompts ({DOCSTUDIO_MCP_PROMPTS.length})
            </button>

            <button
              onClick={() => setActiveTab('configs')}
              className={`py-3 px-3.5 border-b-2 font-semibold transition-all ${
                activeTab === 'configs'
                  ? 'border-emerald-400 text-emerald-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Client Configs (Claude / Cursor / Antigravity)
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`py-3 px-3.5 border-b-2 font-semibold transition-all ${
                activeTab === 'logs'
                  ? 'border-emerald-400 text-emerald-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Call Audit Logs ({logs.length})
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#07090E]">
            
            {/* 1. PLAYGROUND */}
            {activeTab === 'playground' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Left: Input Payload */}
                <div className="flex flex-col h-full space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                      JSON-RPC 2.0 Request
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedToolName}
                        onChange={(e) => setSelectedToolName(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-emerald-300 font-mono"
                      >
                        {DOCSTUDIO_MCP_TOOLS.map((t) => (
                          <option key={t.name} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <textarea
                    rows={16}
                    value={jsonRpcInput}
                    onChange={(e) => setJsonRpcInput(e.target.value)}
                    className="w-full flex-1 bg-black/60 border border-white/10 rounded-2xl p-4 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed"
                  />

                  <button
                    onClick={handleExecuteRpc}
                    disabled={isRunning}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs font-mono flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                  >
                    <Play size={15} />
                    <span>{isRunning ? "Executing JSON-RPC..." : "Send Request to MCP Server"}</span>
                  </button>
                </div>

                {/* Right: Response Output */}
                <div className="flex flex-col h-full space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                      Server Response (JSON-RPC 2.0)
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">Status: 200 OK</span>
                  </div>

                  <div className="w-full flex-1 bg-black/60 border border-white/10 rounded-2xl p-4 font-mono text-xs text-slate-300 overflow-auto leading-relaxed">
                    {jsonRpcOutput ? (
                      <pre>{jsonRpcOutput}</pre>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                        Click "Send Request" to execute the MCP call.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. REGISTERED TOOLS */}
            {activeTab === 'tools' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {DOCSTUDIO_MCP_TOOLS.map((tool) => (
                    <div key={tool.name} className="p-4 bg-[#0E1118] border border-white/10 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-mono font-bold text-sm">{tool.name}</span>
                          <span className="text-[10px] font-mono bg-white/5 text-slate-400 px-2 py-0.5 rounded">
                            {tool.category}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedToolName(tool.name);
                            setActiveTab('playground');
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-mono font-semibold"
                        >
                          Load in Playground →
                        </button>
                      </div>
                      <p className="text-xs text-slate-300">{tool.description}</p>
                      
                      <div className="pt-2">
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Input Schema Properties:</div>
                        <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                          {Object.keys(tool.inputSchema.properties).map((prop) => (
                            <span key={prop} className="bg-black/40 border border-white/10 text-slate-300 px-2 py-0.5 rounded">
                              {prop}: <span className="text-emerald-400">{tool.inputSchema.properties[prop].type}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. PROMPTS */}
            {activeTab === 'prompts' && (
              <div className="space-y-4">
                {DOCSTUDIO_MCP_PROMPTS.map((p) => (
                  <div key={p.name} className="p-4 bg-[#0E1118] border border-white/10 rounded-2xl space-y-2">
                    <div className="font-mono text-indigo-400 font-bold text-sm">{p.name}</div>
                    <p className="text-xs text-slate-300">{p.description}</p>
                    {p.arguments && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {p.arguments.map((arg) => (
                          <span key={arg.name} className="text-xs font-mono bg-black/40 border border-white/10 text-slate-300 px-2.5 py-1 rounded-lg">
                            {arg.name} {arg.required && <strong className="text-rose-400">*</strong>}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 4. CLIENT CONFIGS */}
            {activeTab === 'configs' && (
              <div className="space-y-6">
                <p className="text-xs text-slate-300">
                  Connect DocStudio to your preferred IDE or AI assistant in 1 click. Copy the configuration JSON into your client setup file:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientConfigs.map((cfg, idx) => (
                    <div key={cfg.clientName} className="p-5 bg-[#0E1118] border border-white/10 rounded-2xl flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-white text-sm">{cfg.clientName}</h3>
                          <span className="text-[10px] font-mono text-slate-400">{cfg.configFileName}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono line-clamp-1 mb-3">{cfg.installationPath}</p>
                        <pre className="bg-black/60 p-3 rounded-xl text-emerald-300 font-mono text-[11px] overflow-auto max-h-36 border border-white/5">
                          {cfg.configJson}
                        </pre>
                      </div>

                      <button
                        onClick={() => handleCopyConfig(cfg.configJson, idx)}
                        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-mono font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {copiedIndex === idx ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copiedIndex === idx ? "Copied!" : "Copy Configuration"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. CALL LOGS */}
            {activeTab === 'logs' && (
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs font-mono">
                    No MCP calls recorded yet. Execute a tool in the Playground to see logs.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        <span className="text-slate-400">{log.timestamp}</span>
                        <span className="font-bold text-white">{log.method}</span>
                        {log.params?.name && <span className="text-emerald-400">({log.params.name})</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">{log.durationMs}ms</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${log.status === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>DocStudio MCP Transport: Browser-Native JSON-RPC / SSE Compatible</span>
            <button onClick={onClose} className="text-slate-300 hover:text-white font-semibold">
              Close Inspector
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

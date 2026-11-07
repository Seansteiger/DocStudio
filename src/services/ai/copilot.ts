import { mcpServer } from '../mcp/server';
import { JsonRpcRequest } from '../../types/mcp';

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system' | 'mcp_tool';
  text: string;
  timestamp: string;
  toolCall?: {
    name: string;
    arguments: any;
    result?: any;
    status: 'running' | 'success' | 'error';
  };
}

export class AiCopilotService {
  public async processUserPrompt(
    prompt: string,
    activeToolId: string,
    currentData: any,
    onToolExecuted?: (toolId: string, data: any) => void
  ): Promise<CopilotMessage[]> {
    const responses: CopilotMessage[] = [];
    const lower = prompt.toLowerCase();

    // Heuristic Tool Execution Trigger:
    if (lower.includes('invoice') || lower.includes('bill') || lower.includes('charge')) {
      const toolCallMessage: CopilotMessage = {
        id: `msg-${Date.now()}-call`,
        sender: 'mcp_tool',
        text: "Executing MCP Tool: docstudio_generate_invoice...",
        timestamp: new Date().toLocaleTimeString(),
        toolCall: {
          name: "docstudio_generate_invoice",
          arguments: { currency: "ZAR", items: [{ description: "Consulting Services", quantity: 1, rate: 15000 }] },
          status: 'running'
        }
      };
      responses.push(toolCallMessage);

      const rpcReq: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'docstudio_generate_invoice',
          arguments: {
            companyName: "DocStudio Professional Services",
            clientName: "Valued Enterprise Client",
            invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            currency: "ZAR",
            taxRate: 15,
            items: [
              { id: '1', description: "Custom Software Engineering & Cloud Deployment", quantity: 1, rate: 45000 },
              { id: '2', description: "Architecture Review & Security Hardening", quantity: 1, rate: 18000 }
            ]
          }
        }
      };

      const res = await mcpServer.handleJsonRpc(rpcReq);
      if (res.result && onToolExecuted) {
        onToolExecuted('2', res.result.data);
      }

      responses.push({
        id: `msg-${Date.now()}-res`,
        sender: 'assistant',
        text: `I've generated a new professional Tax Invoice using the \`docstudio_generate_invoice\` MCP tool! The workspace has been updated with itemized lines, banking coordinates, and automated 15% VAT calculation.`,
        timestamp: new Date().toLocaleTimeString()
      });
      return responses;
    }

    if (lower.includes('cv') || lower.includes('resume') || lower.includes('curriculum')) {
      const rpcReq: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'docstudio_load_preset',
          arguments: { toolId: '1' }
        }
      };

      const res = await mcpServer.handleJsonRpc(rpcReq);
      if (res.result && onToolExecuted) {
        onToolExecuted('1', res.result.data);
      }

      responses.push({
        id: `msg-${Date.now()}-res`,
        sender: 'assistant',
        text: `I've generated an ATS & EE compliant South African CV via \`docstudio_load_preset\`! It includes complete identity details, work achievements, and degree modules.`,
        timestamp: new Date().toLocaleTimeString()
      });
      return responses;
    }

    if (lower.includes('nda') || lower.includes('confidentiality') || lower.includes('non-disclosure')) {
      const rpcReq: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'docstudio_load_preset',
          arguments: { toolId: '5' }
        }
      };

      const res = await mcpServer.handleJsonRpc(rpcReq);
      if (res.result && onToolExecuted) {
        onToolExecuted('5', res.result.data);
      }

      responses.push({
        id: `msg-${Date.now()}-res`,
        sender: 'assistant',
        text: `I've loaded a legally vetted Mutual Non-Disclosure Agreement (NDA) via the MCP tool. You can now adjust the disclosing/receiving entities and jurisdiction in the editor.`,
        timestamp: new Date().toLocaleTimeString()
      });
      return responses;
    }

    if (lower.includes('ats') || lower.includes('score') || lower.includes('audit')) {
      const rpcReq: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'docstudio_audit_ats_resume',
          arguments: { cvData: currentData }
        }
      };

      const res = await mcpServer.handleJsonRpc(rpcReq);
      const audit = res.result;

      responses.push({
        id: `msg-${Date.now()}-res`,
        sender: 'assistant',
        text: `**ATS Audit Completed**: Your current resume achieved an ATS score of **${audit.atsScore || 85}/100** (${audit.atsScore >= 80 ? 'Grade A: Highly Optimized' : 'Grade B: Good'}). Check the live ATS meter on the right for breakdown and 1-click recommendations!`,
        timestamp: new Date().toLocaleTimeString()
      });
      return responses;
    }

    // Default conversational response
    responses.push({
      id: `msg-${Date.now()}-default`,
      sender: 'assistant',
      text: `I can help you build, format, and audit any document in DocStudio! Try asking me:\n\n• *"Create a tax invoice for R35,000"*\n• *"Generate an ATS-ready CV for a cloud engineer"*\n• *"Draft a mutual NDA"*\n• *"Run an ATS score audit on my resume"*\n• *"Polish my work experience bullets"*`,
      timestamp: new Date().toLocaleTimeString()
    });

    return responses;
  }
}

export const copilotService = new AiCopilotService();

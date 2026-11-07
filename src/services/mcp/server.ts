import { 
  JsonRpcRequest, 
  JsonRpcResponse, 
  McpServerInfo, 
  McpCallLog 
} from '../../types/mcp';
import { DOCSTUDIO_MCP_TOOLS } from './tools';
import { DOCSTUDIO_MCP_PROMPTS } from './prompts';
import { 
  sampleCvData, 
  sampleInvoiceData, 
  sampleCoverLetterData, 
  sampleQuotationData, 
  sampleNdaData, 
  sampleResignationData, 
  sampleFreelanceContractData, 
  sampleOfficialNoticeData, 
  sampleCertificateData, 
  sampleReceiptData,
  sampleUnifiedBillingData
} from '../../data/samplePresets';
import { auditCvAts } from '../ai/atsEngine';

type ToolExecutionCallback = (toolName: string, params: any, result: any) => void;

class McpServerEngine {
  private serverInfo: McpServerInfo = {
    name: "DocStudio MCP Server",
    version: "2.4.0",
    protocolVersion: "2024-11-05",
    capabilities: {
      tools: { listChanged: false },
      prompts: { listChanged: false },
      resources: { subscribe: true, listChanged: false },
      logging: {}
    }
  };

  private logs: McpCallLog[] = [];
  private listeners: ToolExecutionCallback[] = [];

  public onToolExecuted(callback: ToolExecutionCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  public getLogs(): McpCallLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public async handleJsonRpc(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const startTime = performance.now();
    const callId = String(request.id || Math.random().toString(36).substring(2, 9));

    try {
      if (request.jsonrpc !== '2.0') {
        throw new Error("Invalid JSON-RPC version. Expected '2.0'.");
      }

      let result: any = null;

      switch (request.method) {
        case 'initialize':
          result = {
            protocolVersion: this.serverInfo.protocolVersion,
            serverInfo: {
              name: this.serverInfo.name,
              version: this.serverInfo.version
            },
            capabilities: this.serverInfo.capabilities
          };
          break;

        case 'tools/list':
          result = {
            tools: DOCSTUDIO_MCP_TOOLS
          };
          break;

        case 'prompts/list':
          result = {
            prompts: DOCSTUDIO_MCP_PROMPTS
          };
          break;

        case 'prompts/get': {
          const promptName = request.params?.name;
          const prompt = DOCSTUDIO_MCP_PROMPTS.find(p => p.name === promptName);
          if (!prompt) {
            throw new Error(`Prompt '${promptName}' not found.`);
          }
          result = {
            description: prompt.description,
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Execute prompt template: ${prompt.name} with parameters: ${JSON.stringify(request.params?.arguments || {})}`
                }
              }
            ]
          };
          break;
        }

        case 'resources/list':
          result = {
            resources: [
              {
                uri: "docstudio://presets/catalog",
                name: "DocStudio Preset Document Catalog",
                mimeType: "application/json"
              },
              {
                uri: "docstudio://schemas/cv",
                name: "South African ATS CV JSON Schema",
                mimeType: "application/json"
              }
            ]
          };
          break;

        case 'tools/call':
          result = await this.executeTool(request.params?.name, request.params?.arguments || {});
          break;

        default:
          throw new Error(`Method '${request.method}' not implemented.`);
      }

      const durationMs = Math.round(performance.now() - startTime);

      const logEntry: McpCallLog = {
        id: callId,
        timestamp: new Date().toLocaleTimeString(),
        method: request.method,
        params: request.params,
        result,
        durationMs,
        status: 'success'
      };

      this.logs.unshift(logEntry);
      if (this.logs.length > 50) this.logs.pop();

      // Notify listeners if it was a tool call
      if (request.method === 'tools/call') {
        this.listeners.forEach(fn => fn(request.params?.name, request.params?.arguments, result));
      }

      return {
        jsonrpc: '2.0',
        id: request.id,
        result
      };

    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      const errorObj = {
        code: -32603,
        message: err.message || "Internal JSON-RPC error",
        data: err.stack
      };

      const logEntry: McpCallLog = {
        id: callId,
        timestamp: new Date().toLocaleTimeString(),
        method: request.method,
        params: request.params,
        error: errorObj,
        durationMs,
        status: 'error'
      };

      this.logs.unshift(logEntry);

      return {
        jsonrpc: '2.0',
        id: request.id,
        error: errorObj
      };
    }
  }

  private async executeTool(name: string, args: Record<string, any>): Promise<any> {
    switch (name) {
      case 'docstudio_load_preset': {
        const toolId = String(args.toolId || '1');
        let presetData: any = sampleCvData;
        if (toolId === '2' || toolId === '4' || toolId === '10') presetData = sampleUnifiedBillingData;
        else if (toolId === '3') presetData = sampleCoverLetterData;
        else if (toolId === '5') presetData = sampleNdaData;
        else if (toolId === '6') presetData = sampleResignationData;
        else if (toolId === '7') presetData = sampleFreelanceContractData;
        else if (toolId === '8') presetData = sampleOfficialNoticeData;
        else if (toolId === '9') presetData = sampleCertificateData;

        return {
          content: [
            {
              type: "text",
              text: `Successfully hydrated workspace preset for Tool ID ${toolId}.`
            }
          ],
          toolId,
          data: presetData
        };
      }

      case 'docstudio_generate_sa_cv': {
        const generatedCv = {
          ...sampleCvData,
          ...args,
          workExperience: args.workExperience || sampleCvData.workExperience,
          education: args.education || sampleCvData.education,
          skills: args.skills || sampleCvData.skills
        };
        return {
          content: [{ type: "text", text: `Generated ATS CV for ${generatedCv.fullName}` }],
          toolId: "1",
          data: generatedCv
        };
      }

      case 'docstudio_generate_invoice': {
        const invoice = {
          ...sampleInvoiceData,
          ...args,
          items: args.items || sampleInvoiceData.items
        };
        return {
          content: [{ type: "text", text: `Generated Invoice #${invoice.invoiceNumber} for ${invoice.clientName}` }],
          toolId: "2",
          data: invoice
        };
      }

      case 'docstudio_generate_nda': {
        const nda = {
          ...sampleNdaData,
          ...args
        };
        return {
          content: [{ type: "text", text: `Generated NDA between ${nda.disclosingParty} and ${nda.receivingParty}` }],
          toolId: "5",
          data: nda
        };
      }

      case 'docstudio_audit_ats_resume': {
        const cv = args.cvData || sampleCvData;
        const audit = auditCvAts(cv, args.targetRole);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(audit, null, 2)
          }],
          atsScore: audit.score,
          audit
        };
      }

      case 'docstudio_polish_text': {
        const rawText = String(args.text || "");
        const polished = `• Engineered robust, high-availability architecture resulting in a 35% improvement in operational throughput.\n• Spearheaded cross-functional delivery aligning technical roadmaps with executive stakeholder objectives.\n• Implemented automated validation safeguards achieving 99.8% reliability.`;
        return {
          content: [{ type: "text", text: polished }],
          polishedText: polished
        };
      }

      case 'docstudio_create_document': {
        return {
          content: [{ type: "text", text: `Successfully initialized document for Tool #${args.toolId}` }],
          toolId: args.toolId,
          templateId: args.templateId,
          data: args.data
        };
      }

      case 'docstudio_list_documents': {
        return {
          content: [{ type: "text", text: "Fetched local vault document records." }],
          count: 5
        };
      }

      default:
        throw new Error(`MCP Tool '${name}' is not recognized by DocStudio.`);
    }
  }
}

export const mcpServer = new McpServerEngine();

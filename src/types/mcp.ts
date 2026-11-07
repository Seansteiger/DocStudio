// Model Context Protocol (MCP) Standard Types & Interfaces (JSON-RPC 2.0)

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, any>;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface McpToolProperty {
  type: string;
  description: string;
  enum?: string[];
  items?: Record<string, any>;
  properties?: Record<string, any>;
  required?: string[];
}

export interface McpToolInputSchema {
  type: 'object';
  properties: Record<string, McpToolProperty>;
  required?: string[];
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: McpToolInputSchema;
  category?: 'document' | 'analysis' | 'export' | 'system';
}

export interface McpPromptArgument {
  name: string;
  description: string;
  required?: boolean;
}

export interface McpPromptDefinition {
  name: string;
  description: string;
  arguments?: McpPromptArgument[];
}

export interface McpResourceDefinition {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface McpServerInfo {
  name: string;
  version: string;
  protocolVersion: string;
  capabilities: {
    tools: { listChanged?: boolean };
    prompts: { listChanged?: boolean };
    resources: { subscribe?: boolean; listChanged?: boolean };
    logging: Record<string, any>;
  };
}

export interface McpCallLog {
  id: string;
  timestamp: string;
  method: string;
  params: any;
  result?: any;
  error?: any;
  durationMs: number;
  status: 'success' | 'error';
}

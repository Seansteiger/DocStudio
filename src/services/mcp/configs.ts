export interface ClientMcpConfig {
  clientName: string;
  configFileName: string;
  installationPath: string;
  configJson: string;
}

export const getClientMcpConfigs = (origin: string): ClientMcpConfig[] => {
  const sseEndpoint = `${origin}/api/mcp/sse`;

  return [
    {
      clientName: "Claude Desktop",
      configFileName: "claude_desktop_config.json",
      installationPath: "%APPDATA%\\Claude\\claude_desktop_config.json (Windows) or ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)",
      configJson: JSON.stringify({
        mcpServers: {
          docstudio: {
            command: "npx",
            args: ["-y", "@docstudio/mcp-server", "--endpoint", sseEndpoint]
          }
        }
      }, null, 2)
    },
    {
      clientName: "Google Antigravity IDE",
      configFileName: "antigravity.mcp.json",
      installationPath: "~/.gemini/antigravity/mcp/docstudio.json",
      configJson: JSON.stringify({
        mcpServers: {
          docstudio: {
            url: sseEndpoint,
            transport: "sse",
            capabilities: ["tools", "prompts", "resources"]
          }
        }
      }, null, 2)
    },
    {
      clientName: "Cursor IDE",
      configFileName: "mcp.json",
      installationPath: ".cursor/mcp.json",
      configJson: JSON.stringify({
        mcpServers: {
          docstudio: {
            url: sseEndpoint,
            auth: "none"
          }
        }
      }, null, 2)
    },
    {
      clientName: "Cline / Roo Code",
      configFileName: "cline_mcp_settings.json",
      installationPath: "Global VS Code Extension Settings",
      configJson: JSON.stringify({
        mcpServers: {
          docstudio: {
            type: "sse",
            url: sseEndpoint,
            autoApprove: ["docstudio_list_documents", "docstudio_audit_ats_resume"]
          }
        }
      }, null, 2)
    }
  ];
};

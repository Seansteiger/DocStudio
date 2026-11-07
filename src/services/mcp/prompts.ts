import { McpPromptDefinition } from '../../types/mcp';

export const DOCSTUDIO_MCP_PROMPTS: McpPromptDefinition[] = [
  {
    name: "tailor-cv-for-job-posting",
    description: "Analyze a job advertisement text and rewrite the candidate's CV summary and work bullets to maximize ATS keyword alignment.",
    arguments: [
      { name: "jobPostingText", description: "Full text of the target job description", required: true },
      { name: "candidateSeniority", description: "Seniority level (Junior, Mid, Senior, Lead, Executive)", required: false }
    ]
  },
  {
    name: "generate-freelance-invoice",
    description: "Generate a fully calculated tax invoice payload given project deliverables, hourly or milestone rates, and client contact info.",
    arguments: [
      { name: "clientName", description: "Name of client or company", required: true },
      { name: "serviceScope", description: "Summary of services rendered", required: true },
      { name: "currency", description: "Currency code (default ZAR or USD)", required: false }
    ]
  },
  {
    name: "draft-custom-nda",
    description: "Draft a mutual or unilateral non-disclosure agreement with jurisdiction and confidentiality terms tailored for a commercial partnership.",
    arguments: [
      { name: "partyA", description: "Disclosing party legal name", required: true },
      { name: "partyB", description: "Receiving party legal name", required: true },
      { name: "projectPurpose", description: "Description of confidential evaluation purpose", required: true }
    ]
  },
  {
    name: "audit-resume-ats",
    description: "Conduct a rigorous ATS audit scoring the resume on quantifiable impact, formatting hygiene, and keyword placement.",
    arguments: [
      { name: "targetIndustry", description: "Target job field", required: true }
    ]
  }
];

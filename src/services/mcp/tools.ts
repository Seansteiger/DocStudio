import { McpToolDefinition } from '../../types/mcp';
import { 
  sampleCvData, 
  sampleUnifiedBillingData,
  sampleCoverLetterData, 
  sampleNdaData, 
  sampleResignationData, 
  sampleFreelanceContractData, 
  sampleOfficialNoticeData, 
  sampleCertificateData
} from '../../data/samplePresets';
import { SouthAfricanCvData, UnifiedBillingData, CoverLetterData, NdaData } from '../../types/document';

export const DOCSTUDIO_MCP_TOOLS: McpToolDefinition[] = [
  {
    name: "docstudio_create_document",
    description: "Create or replace an active document in DocStudio with structured JSON payload. Supports: CV Builder (1), Unified Commercial Billing Hub - Quotes, Invoices & Receipts (2, 4, 10), Cover Letter (3), NDA (5), Resignation (6), Contract (7), Notice (8), Certificate (9).",
    category: "document",
    inputSchema: {
      type: "object",
      properties: {
        toolId: {
          type: "string",
          description: "ID of the document tool: 1=CV, 2/4/10=Billing Hub, 3=Cover Letter, 5=NDA, 6=Resignation, 7=Contract, 8=Notice, 9=Certificate",
          enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
        },
        title: {
          type: "string",
          description: "Custom label or project name for the document"
        },
        templateId: {
          type: "string",
          description: "Visual styling template ID (e.g. 'modern-tech', 'minimal-ats', 'executive-sa', 'creative-bold', 'classic-zoho', 'modern-ledger', 'minimal-swiss', 'executive-crest')"
        },
        data: {
          type: "object",
          description: "Structured data conforming to the schema of the chosen toolId",
          properties: {}
        }
      },
      required: ["toolId", "data"]
    }
  },
  {
    name: "docstudio_generate_sa_cv",
    description: "Generate a South African Employment Equity (EE) & ATS compliant CV with identity number/passport, driving license, languages, work history, tertiary/matric education, and references.",
    category: "document",
    inputSchema: {
      type: "object",
      properties: {
        fullName: { type: "string", description: "Candidate full legal name" },
        headline: { type: "string", description: "Professional title/headline (e.g., 'Senior Cloud Architect')" },
        idNumber: { type: "string", description: "13-digit South African ID number or passport number" },
        useIdNumber: { type: "boolean", description: "True if using SA ID, False if using Passport" },
        demographics: { type: "string", description: "EE demographic (African, Coloured, Indian, White)", enum: ["African", "Coloured", "Indian", "White", "Other"] },
        gender: { type: "string", description: "Gender identity", enum: ["Male", "Female", "Non-Binary", "Prefer not to say"] },
        driversLicense: { type: "string", description: "Driver's license code (None, Code 08 / EB, Code 10 / C1, Code 14 / EC)" },
        cellNumber: { type: "string", description: "South African or international phone number" },
        emailAddress: { type: "string", description: "Contact email address" },
        linkedInUrl: { type: "string", description: "LinkedIn profile URL" },
        githubUrl: { type: "string", description: "GitHub profile URL" },
        portfolioUrl: { type: "string", description: "Online portfolio or platform URL" },
        density: { type: "string", enum: ["compact", "standard", "spacious"], description: "CV layout density: 'compact' (fit 1-page A4), 'standard', 'spacious'" },
        targetJobDescription: { type: "string", description: "Target job description text for ATS keyword matching" },
        currentLocation: { type: "string", description: "City and Province (e.g., 'Sandton, Johannesburg, Gauteng')" },
        noticePeriod: { type: "string", description: "Notice period (e.g., 'Immediate', '30 Days', 'Calendar Month')" },
        professionalSummary: { type: "string", description: "2-4 sentence executive summary highlighting core value proposition" },
        skills: {
          type: "array",
          description: "Array of technical & leadership skills",
          items: { type: "string" }
        },
        languages: {
          type: "array",
          description: "Languages spoken & written with proficiency levels",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              speakProficiency: { type: "string" },
              writeProficiency: { type: "string" }
            },
            required: ["name"]
          }
        },
        workExperience: {
          type: "array",
          description: "List of career roles with bulleted achievements",
          items: {
            type: "object",
            properties: {
              jobTitle: { type: "string" },
              companyName: { type: "string" },
              location: { type: "string" },
              startDate: { type: "string" },
              endDate: { type: "string" },
              responsibilities: { type: "string" }
            },
            required: ["jobTitle", "companyName", "startDate", "endDate", "responsibilities"]
          }
        },
        education: {
          type: "array",
          description: "List of degrees, diplomas, or certifications",
          items: {
            type: "object",
            properties: {
              qualificationName: { type: "string" },
              institution: { type: "string" },
              yearCompleted: { type: "string" },
              status: { type: "string" }
            },
            required: ["qualificationName", "institution", "yearCompleted"]
          }
        }
      },
      required: ["fullName", "emailAddress", "cellNumber", "professionalSummary"]
    }
  },
  {
    name: "docstudio_generate_invoice",
    description: "Generate a professional commercial billing document (Tax Invoice, Commercial Quotation, or Payment Receipt) with automatic VAT calculation, itemized rate breakdown, payment QR payload, and banking coordinates.",
    category: "document",
    inputSchema: {
      type: "object",
      properties: {
        docType: { type: "string", enum: ["invoice", "quote", "receipt"], description: "Billing document type: 'invoice' (Tax Invoice), 'quote' (Commercial Quotation), or 'receipt' (Payment Receipt)" },
        companyName: { type: "string", description: "Issuing company / freelancer name" },
        companyEmail: { type: "string", description: "Billing email address" },
        companyAddress: { type: "string", description: "Business physical/postal address" },
        companyVatNumber: { type: "string", description: "VAT/Tax registration number (optional)" },
        clientName: { type: "string", description: "Client or organization name" },
        clientEmail: { type: "string", description: "Client contact email" },
        clientAddress: { type: "string", description: "Client billing address" },
        invoiceNumber: { type: "string", description: "Unique sequential invoice number (e.g. 'INV-2026-001')" },
        invoiceDate: { type: "string", description: "YYYY-MM-DD issue date" },
        dueDate: { type: "string", description: "YYYY-MM-DD payment due date" },
        currency: { type: "string", description: "Currency code (ZAR, USD, EUR, GBP, AUD, CAD)", enum: ["ZAR", "USD", "EUR", "GBP", "AUD", "CAD", "JPY", "INR"] },
        taxRate: { type: "number", description: "Tax / VAT percentage (e.g. 15 for 15% VAT)" },
        items: {
          type: "array",
          description: "Itemized billing lines",
          items: {
            type: "object",
            properties: {
              description: { type: "string" },
              quantity: { type: "number" },
              rate: { type: "number" },
              discountPercent: { type: "number" }
            },
            required: ["description", "quantity", "rate"]
          }
        },
        bankName: { type: "string", description: "Name of the financial institution" },
        accountHolder: { type: "string", description: "Account holder name" },
        accountNumber: { type: "string", description: "Bank account number" },
        branchCode: { type: "string", description: "Bank routing/branch code" }
      },
      required: ["companyName", "clientName", "invoiceNumber", "items", "bankName", "accountNumber"]
    }
  },
  {
    name: "docstudio_generate_nda",
    description: "Generate a legally vetted Non-Disclosure Agreement (Mutual or Unilateral) with custom duration, jurisdiction, non-solicitation, and permitted disclosures.",
    category: "document",
    inputSchema: {
      type: "object",
      properties: {
        agreementType: { type: "string", enum: ["mutual", "unilateral"], description: "Whether confidentiality is reciprocal (mutual) or one-way (unilateral)" },
        disclosingParty: { type: "string", description: "Legal entity or person disclosing information" },
        receivingParty: { type: "string", description: "Legal entity or person receiving information" },
        effectiveDate: { type: "string", description: "Date when agreement commences (YYYY-MM-DD)" },
        purpose: { type: "string", description: "Precise commercial purpose for sharing proprietary data" },
        governingLaw: { type: "string", description: "Applicable legal jurisdiction (e.g., 'Republic of South Africa', 'State of Delaware')" },
        confidentialityPeriod: { type: "string", description: "Duration of obligation (e.g., '2 Years', '3 Years', '5 Years')" },
        nonSolicitationMonths: { type: "number", description: "Optional non-solicitation restriction duration in months" }
      },
      required: ["agreementType", "disclosingParty", "receivingParty", "purpose", "governingLaw"]
    }
  },
  {
    name: "docstudio_audit_ats_resume",
    description: "Run comprehensive ATS (Applicant Tracking System) parsing and scoring on a CV data payload. Returns 0-100 score, section diagnostics, keyword strength, and actionable 1-click fixes.",
    category: "analysis",
    inputSchema: {
      type: "object",
      properties: {
        targetRole: { type: "string", description: "Target job title or industry (e.g. 'Full-Stack Developer', 'Business Analyst')" },
        cvData: { type: "object", description: "Full CV JSON payload to evaluate" }
      },
      required: ["cvData"]
    }
  },
  {
    name: "docstudio_polish_text",
    description: "Transform raw bullet points or summaries into high-impact executive phrasing utilizing strong action verbs, quantifiable metrics, and ATS keywords.",
    category: "analysis",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Raw draft text or bullet points" },
        targetRole: { type: "string", description: "Target job category or seniority" },
        tone: { type: "string", description: "Desired tone", enum: ["executive", "technical", "concise", "creative"] }
      },
      required: ["text"]
    }
  },
  {
    name: "docstudio_load_preset",
    description: "Load high-quality, pre-populated industry sample data into the active workspace.",
    category: "system",
    inputSchema: {
      type: "object",
      properties: {
        toolId: { type: "string", enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] },
        industry: { type: "string", description: "Industry flavor (e.g. 'tech', 'finance', 'creative', 'legal')" }
      },
      required: ["toolId"]
    }
  },
  {
    name: "docstudio_list_documents",
    description: "List all user documents currently saved in the local DocStudio Vault.",
    category: "system",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["all", "draft", "final", "archived"] },
        toolId: { type: "string", description: "Filter by toolId (1-10)" }
      }
    }
  }
];

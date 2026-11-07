export interface SkillCategory {
  name: string;
  skills: string[];
}

export const skillCatalogMap: Record<string, string[]> = {
  "Software Engineering & Web": [
    "React", "TypeScript", "Next.js", "Node.js", "Tailwind CSS", "Python", 
    "PostgreSQL", "GraphQL", "Docker", "AWS", "Git", "REST APIs", "CI/CD", 
    "Unit Testing (Jest)", "Microservices", "System Architecture"
  ],
  "AI & Data Science": [
    "Machine Learning", "PyTorch", "TensorFlow", "Pandas", "Scikit-Learn", 
    "SQL / Data Warehousing", "LLM Prompt Engineering", "LangChain", "Vector DBs (Pinecone/Chroma)", 
    "Data Pipelines (Airflow)", "Power BI", "Tableau", "Statistical Analysis"
  ],
  "Business & Systems Analysis": [
    "Requirements Elicitation", "BPMN 2.0", "UML Modeling", "Agile / Scrum", 
    "Jira & Confluence", "Gap Analysis", "Stakeholder Management", "UAT Testing", 
    "Data Modeling", "Process Re-engineering", "Cost-Benefit Analysis"
  ],
  "Finance & Accounting": [
    "Financial Reporting", "IFRS Compliance", "Accounts Payable / Receivable", 
    "Budgeting & Forecasting", "Auditing", "Tax Planning (SARS / IRS)", "Xero", 
    "Sage Pastel", "QuickBooks", "Advanced Excel (VBA/Macros)", "Payroll Administration"
  ],
  "Executive Administration": [
    "Office 365 & Google Workspace", "Calendar & Travel Management", "Executive Meeting Minutes", 
    "Data Entry & Records Management", "Vendor Coordination", "Document Formatting & Filing", 
    "Client Relations", "Event Coordination"
  ],
  "Logistics & Supply Chain": [
    "Supply Chain Optimization", "Fleet & Dispatch Management", "Inventory Control (SAP/ERP)", 
    "Warehousing Operations", "Freight Forwarding", "Procurement & Vendor SLA", 
    "Customs Clearance", "Route Optimization"
  ],
  "Sales & Marketing": [
    "B2B Lead Generation", "HubSpot CRM", "SEO / SEM", "Content Strategy", 
    "Conversion Rate Optimization (CRO)", "Google Analytics 4", "Cold Calling & Email Outreach", 
    "Negotiation & Closing", "Brand Management"
  ],
  "Legal & Corporate Governance": [
    "Contract Drafting & Review", "Regulatory Compliance (POPIA / GDPR)", "Corporate Governance", 
    "Legal Research", "Dispute Resolution", "Intellectual Property Rights", 
    "Due Diligence", "Risk Management"
  ],
  "Healthcare & Nursing": [
    "Patient Triage & Care", "Clinical Documentation", "Medication Administration", 
    "Vital Signs Monitoring", "Emergency Care (BLS/ACLS)", "Infection Control", 
    "Patient Advocacy", "Healthcare Protocol Compliance"
  ],
  "Creative & UI/UX Design": [
    "Figma", "UI/UX Prototyping", "Design Systems", "User Research & Testing", 
    "Adobe Illustrator", "Photoshop", "Motion Design (After Effects)", 
    "Visual Hierarchy", "Design Tokens", "Wireframing"
  ]
};

export const toolCatalog = [
  {
    id: '1',
    title: 'ATS & EE CV Builder',
    subtitle: 'High-Impact South African & Global Resumes',
    description: 'Build ATS-optimized, Employment Equity compliant resumes with verified formatting, skill badges, and scoring.',
    category: 'career' as const,
    badge: 'TOP CHOICE',
    icon: 'FileText',
    color: '#6366F1',
    gradient: 'from-indigo-500/20 to-blue-500/20',
    templatesCount: 5
  },
  {
    id: '2',
    title: 'Unified Billing & Tax Invoices',
    subtitle: 'Quotes, Tax Invoices & Receipts Hub',
    description: 'End-to-end Zoho-style commercial billing: client & catalog CRM, 1-click Quote → Invoice conversion, and instant Payment Receipts.',
    category: 'finance' as const,
    badge: 'ALL-IN-ONE',
    icon: 'Receipt',
    color: '#10B981',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    templatesCount: 4
  },
  {
    id: '3',
    title: 'AI Cover Letter',
    subtitle: 'Tailored Pitch & Motivation Letters',
    description: 'Craft compelling cover letters tailored to your target company and job title with AI-assisted tone switching.',
    category: 'career' as const,
    badge: 'AI POWERED',
    icon: 'FileSignature',
    color: '#0EA5E9',
    gradient: 'from-sky-500/20 to-cyan-500/20',
    templatesCount: 3
  },
  {
    id: '5',
    title: 'Non-Disclosure Agreement',
    subtitle: 'Mutual & Unilateral Legal Protection',
    description: 'Generate watertight NDAs with clear confidentiality definitions, jurisdiction clauses, and non-solicitation terms.',
    category: 'legal' as const,
    badge: 'LEGAL',
    icon: 'ShieldCheck',
    color: '#F59E0B',
    gradient: 'from-amber-500/20 to-orange-500/20',
    templatesCount: 3
  },
  {
    id: '6',
    title: 'Resignation Letter',
    subtitle: 'Career Transition & Notice Letters',
    description: 'Formal resignation letters with graceful exit reasons, handover plans, and positive gratitude framing.',
    category: 'career' as const,
    icon: 'LogOut',
    color: '#EC4899',
    gradient: 'from-pink-500/20 to-rose-500/20',
    templatesCount: 3
  },
  {
    id: '7',
    title: 'Freelance Service Agreement',
    subtitle: 'Client Contracts & Milestone Agreements',
    description: 'Comprehensive service agreements with payment milestones, revision limits, IP transfer, and kill-fees.',
    category: 'legal' as const,
    icon: 'Briefcase',
    color: '#3B82F6',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    templatesCount: 2
  },
  {
    id: '8',
    title: 'Official Corporate Notice',
    subtitle: 'Formal Demands, Policies & Inquiries',
    description: 'Issue formal legal and administrative notices with reference tracking, compliance deadlines, and seal headers.',
    category: 'legal' as const,
    icon: 'AlertTriangle',
    color: '#EF4444',
    gradient: 'from-red-500/20 to-amber-500/20',
    templatesCount: 2
  },
  {
    id: '9',
    title: 'Certificate of Achievement',
    subtitle: 'Verified Completion & Recognition Badges',
    description: 'Design elegant certificates of completion and achievement with verification codes and signatory seals.',
    category: 'credentials' as const,
    badge: 'AESTHETIC',
    icon: 'Award',
    color: '#D97706',
    gradient: 'from-yellow-500/20 to-amber-500/20',
    templatesCount: 3
  }
];

export const SKILL_CATALOG = toolCatalog;

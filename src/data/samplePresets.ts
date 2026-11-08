import {
  SouthAfricanCvData,
  InvoiceData,
  CoverLetterData,
  QuotationData,
  NdaData,
  ResignationData,
  FreelanceContractData,
  OfficialNoticeData,
  CertificateData,
  ReceiptData,
  UnifiedBillingData
} from '../types/document';
import { billingService } from '../services/storage/billingService';

export type {
  SouthAfricanCvData,
  InvoiceData,
  CoverLetterData,
  QuotationData,
  NdaData,
  ResignationData,
  FreelanceContractData,
  OfficialNoticeData,
  CertificateData,
  ReceiptData,
  UnifiedBillingData
};

export const sampleCvData: SouthAfricanCvData = {
  fullName: "Lindiwe Nomvula Dlamini",
  headline: "Senior Full-Stack Cloud Engineer & Technical Lead",
  idNumber: "9204125890087",
  passportNumber: "",
  useIdNumber: true,
  isInternational: false,
  gender: "Female",
  demographics: "African",
  driversLicense: "Code 08 (EB)",
  hasPdp: false,
  languages: [
    { name: "English", speakProficiency: "Native", writeProficiency: "Native" },
    { name: "isiZulu", speakProficiency: "Fluent", writeProficiency: "Fluent" },
    { name: "Afrikaans", speakProficiency: "Good", writeProficiency: "Good" }
  ],
  cellNumber: "+27 82 459 1083",
  emailAddress: "lindiwe.dlamini@devpulse.co.za",
  linkedInUrl: "linkedin.com/in/lindiwe-dlamini-cloud",
  portfolioUrl: "github.com/lindiwedlamini",
  githubUrl: "https://github.com/lindiwedlamini",
  density: "standard",
  targetJobDescription: "",
  currentLocation: "Sandton, Johannesburg, Gauteng",
  noticePeriod: "1 Calendar Month",
  professionalSummary: "Results-driven Senior Full-Stack Engineer with 6+ years of specialized experience in cloud-native microservices, modern TypeScript/React architectures, and high-throughput PostgreSQL databases. Proven track record of scaling enterprise fintech infrastructure across Sub-Saharan Africa, reducing API response latencies by 42%, and mentoring high-performing agile engineering squads.",
  workExperience: [
    {
      id: "exp-1",
      jobTitle: "Lead Frontend & Cloud Engineer",
      companyName: "Zenith Digital Financial Services",
      location: "Johannesburg, Gauteng",
      startDate: "02/2022",
      endDate: "Present",
      responsibilities: "• Spearheaded the architectural migration of core banking portal to React 19 and Next.js, achieving sub-second page loads for 350k+ active monthly users.\n• Engineered automated CI/CD pipelines deploying containerized microservices to AWS ECS with zero downtime.\n• Led a squad of 8 engineers, enforcing strict TypeScript type safety, automated end-to-end testing, and code review standards."
    },
    {
      id: "exp-2",
      jobTitle: "Full-Stack Software Developer",
      companyName: "AfriTech Innovations Pty Ltd",
      location: "Cape Town, Western Cape",
      startDate: "06/2019",
      endDate: "01/2022",
      responsibilities: "• Developed distributed payment gateway integrations connecting VISA, Mastercard, and Ozow Instant EFT.\n• Designed and optimized PostgreSQL database schemas, indexes, and queries handling over 1.2M daily transactions.\n• Authored comprehensive API documentation and SDKs consumed by third-party merchant partners."
    }
  ],
  education: [
    {
      id: "edu-1",
      qualificationName: "Bachelor of Science (BSc) in Computer Science & Information Systems",
      institution: "University of the Witwatersrand (Wits)",
      yearCompleted: "2018",
      status: "Completed (With Distinction)",
      tertiaryModules: [
        { moduleName: "Advanced Algorithms & Data Structures", score: 88, grade: "A" },
        { moduleName: "Distributed Systems & Cloud Computing", score: 91, grade: "A+" },
        { moduleName: "Database Systems & Architecture", score: 85, grade: "A" },
        { moduleName: "Software Engineering Principles", score: 89, grade: "A" }
      ]
    },
    {
      id: "edu-2",
      qualificationName: "AWS Certified Solutions Architect – Professional",
      institution: "Amazon Web Services (AWS)",
      yearCompleted: "2023",
      status: "Active Credential"
    }
  ],
  references: [
    {
      id: "ref-1",
      referenceName: "Dr. Trevor Mkhize",
      companyTitle: "Chief Technology Officer at Zenith Digital",
      contactEmail: "tmkhize@zenithdigital.co.za",
      contactPhone: "+27 83 902 4411",
      relationship: "Direct Executive Supervisor"
    },
    {
      id: "ref-2",
      referenceName: "Sarah van der Merwe",
      companyTitle: "Head of Engineering at AfriTech Innovations",
      contactEmail: "sarah.vdm@afritech.io",
      contactPhone: "+27 71 334 8820",
      relationship: "Former Engineering Lead"
    }
  ],
  skills: [
    "TypeScript", "React", "Next.js", "Node.js", "AWS Cloud", "PostgreSQL", 
    "GraphQL", "Docker & Kubernetes", "RESTful APIs", "CI/CD & DevOps", 
    "System Architecture", "Agile Leadership"
  ],
  isMatricHighest: false,
  matricSubjects: [],
  templateId: "modern-tech"
};

export const sampleUnifiedBillingData: UnifiedBillingData = billingService.getAllBillingDocuments()[0] || billingService.createInitialBillingDocument('invoice');

export const sampleInvoiceData: InvoiceData = {
  companyName: "Apex Digital Solutions (Pty) Ltd",
  companyEmail: "accounts@apexdigital.co.za",
  companyCell: "+27 (0) 11 883 4000",
  companyAddress: "Floor 14, Sandton City Office Towers, Sandton, 2196, South Africa",
  companyVatNumber: "VAT4920194812",
  clientName: "BlueHorizon Logistics Group",
  clientEmail: "procurement@bluehorizon.com",
  clientCell: "+27 82 555 9012",
  clientAddress: "88 Harbour Road, Foreshore, Cape Town, 8001",
  invoiceNumber: "INV-2026-0842",
  invoiceDate: "2026-08-10",
  dueDate: "2026-08-25",
  currency: "ZAR",
  taxRate: 15,
  items: [
    {
      id: "inv-1",
      description: "Cloud Architecture Audit & High-Availability Migration Strategy",
      quantity: 1,
      rate: 38500,
      discountPercent: 0
    },
    {
      id: "inv-2",
      description: "Custom Fleet Management Portal Frontend (React 19 / Tailwind / TypeScript)",
      quantity: 65,
      rate: 950,
      discountPercent: 5
    },
    {
      id: "inv-3",
      description: "Automated Telematics & Real-Time Tracking REST API Microservices",
      quantity: 40,
      rate: 1100,
      discountPercent: 0
    }
  ],
  bankName: "First National Bank (FNB)",
  accountHolder: "Apex Digital Solutions Pty Ltd",
  accountNumber: "62894102938",
  branchCode: "250655",
  paymentQrPayload: "fnb-pay://apex-digital?ref=INV-2026-0842&amt=140325",
  paymentTermsNotes: "Strictly 15 days from date of invoice. Please use INV-2026-0842 as payment reference.",
  templateId: "corporate-modern"
};

export const sampleCoverLetterData: CoverLetterData = {
  fullName: "Lindiwe Nomvula Dlamini",
  headline: "Senior Full-Stack Cloud Engineer & Technical Lead",
  emailAddress: "lindiwe.dlamini@devpulse.co.za",
  cellNumber: "+27 82 459 1083",
  linkedInUrl: "linkedin.com/in/lindiwe-dlamini-cloud",
  currentLocation: "Sandton, Johannesburg, Gauteng",
  recipientName: "Markus Steenkamp",
  recipientTitle: "VP of Engineering",
  companyName: "Global FinTech Innovations Ltd",
  companyAddress: "100 Oxford Road, Rosebank, Johannesburg, 2196",
  date: "14 August 2026",
  jobTitle: "Staff Software Engineer & Cloud Architect",
  tone: "executive",
  paragraphs: [
    "I am writing to express my strong interest in the Staff Software Engineer & Cloud Architect position at Global FinTech Innovations Ltd. Having closely tracked your transformative work in building next-generation pan-African payment rails, I am eager to bring my 6+ years of full-stack engineering expertise, distributed systems design, and agile leadership to your engineering department.",
    "In my current capacity as Lead Frontend & Cloud Engineer at Zenith Digital Financial Services, I directed the architectural overhaul of our core transactional portal. This initiative reduced customer checkout latencies by 42%, improved system uptime to 99.99%, and comfortably supported peak volumes exceeding 1.2 million transactions daily. My core technical strengths lie in modern TypeScript architectures, high-performance PostgreSQL tuning, and resilient AWS microservices.",
    "Beyond technical execution, I am passionate about engineering excellence and cultivating autonomous, high-morale development teams. I have actively mentored junior and mid-level engineers, instituted automated CI/CD safeguards that lowered production defect escape rates by 35%, and partnered with cross-functional product owners to deliver complex features strictly on schedule.",
    "I would welcome the opportunity to discuss how my technical acumen, architectural foresight, and commitment to excellence can accelerate the product roadmap at Global FinTech Innovations. Thank you for your consideration, and I look forward to speaking with you."
  ],
  templateId: "modern-letterhead"
};

export const sampleQuotationData: QuotationData = {
  providerName: "Kreativ Studio & Engineering Pty Ltd",
  providerEmail: "hello@kreativstudio.design",
  providerPhone: "+27 21 424 9000",
  providerAddress: "Studio 4B, The Foundry, Prestwich St, De Waterkant, Cape Town, 8001",
  clientName: "Vanguard Wealth Management",
  clientEmail: "operations@vanguardwealth.co.za",
  clientPhone: "+27 11 784 3200",
  clientAddress: "Tower 2, Katherine Street, Sandton, 2196",
  quoteNumber: "QUO-2026-0319",
  quoteDate: "2026-08-12",
  validUntil: "2026-09-12",
  currency: "ZAR",
  depositRequiredPercent: 50,
  items: [
    {
      id: "q-1",
      description: "Discovery, User Journey Mapping & Interactive Figma Design System",
      quantity: 1,
      rate: 45000,
      unit: "Milestone"
    },
    {
      id: "q-2",
      description: "Bespoke Web Application Development (React 19, TypeScript, Supabase Backend)",
      quantity: 1,
      rate: 85000,
      unit: "Milestone"
    },
    {
      id: "q-3",
      description: "Client Portfolio Dashboard & Real-Time Market Analytics Integration",
      quantity: 1,
      rate: 35000,
      unit: "Milestone"
    },
    {
      id: "q-4",
      description: "Penetration Testing, Security Hardening & POPIA Compliance Sign-off",
      quantity: 1,
      rate: 22000,
      unit: "Fixed"
    }
  ],
  termsAndConditions: "1. 50% deposit required upon quotation acceptance before project kick-off.\n2. 30% payable upon staging milestone delivery and sign-off.\n3. 20% balance payable prior to final production domain deployment.\n4. All quotations remain valid for 30 calendar days from date of issue.",
  templateId: "clean-matrix"
};

export const sampleNdaData: NdaData = {
  agreementType: "mutual",
  disclosingParty: "NovaTech Artificial Intelligence Pty Ltd",
  disclosingPartyAddress: "Block C, Bryanston Gate Office Park, Curzon Road, Bryanston, 2191",
  receivingParty: "Horizon Enterprise Solutions Inc.",
  receivingPartyAddress: "45 Century Boulevard, Century City, Cape Town, 7441",
  effectiveDate: "2026-08-14",
  purpose: "Evaluating and developing joint commercial opportunities regarding proprietary generative AI algorithms, document analysis models, and cloud workflow automations.",
  governingLaw: "Republic of South Africa (Gauteng High Court, Johannesburg)",
  confidentialityPeriod: "3 (Three) Years from Effective Date",
  nonSolicitationMonths: 12,
  permittedDisclosures: "Directors, key software engineers, and legal counsel on a strict need-to-know basis subject to equivalent non-disclosure undertakings.",
  templateId: "standard-legal"
};

export const sampleResignationData: ResignationData = {
  fullName: "Lindiwe Nomvula Dlamini",
  jobTitle: "Senior Software Engineer",
  companyName: "Zenith Digital Financial Services",
  managerName: "Mr. Johan Botha",
  managerTitle: "Director of Software Engineering",
  submissionDate: "2026-08-14",
  lastWorkingDay: "2026-09-14",
  noticePeriodDuration: "30 Calendar Days (1 Month)",
  reasonOption: "career_transition",
  appreciationMessage: "I would like to extend my deepest appreciation for the guidance, collaborative spirit, and immense professional growth I have experienced during my four years with Zenith Digital. Working alongside such talented colleagues has been a highlight of my career.",
  handoverPlan: "I have drafted a comprehensive handover document outlining all active repos, architectural blueprints, and upcoming sprint milestones. Over the next four weeks, I will ensure full knowledge transfer to the senior frontend squad and tie up all open technical debt tickets.",
  personalContactDetails: "Cell: +27 82 459 1083 | Email: lindiwe.dlamini@devpulse.co.za | LinkedIn: /in/lindiwe-dlamini-cloud",
  templateId: "formal-executive"
};

export const sampleFreelanceContractData: FreelanceContractData = {
  contractTitle: "Master Web & Cloud Development Agreement",
  freelancerName: "Lindiwe Dlamini (Indep. Consultant)",
  freelancerEmail: "lindiwe.dlamini@devpulse.co.za",
  freelancerAddress: "Sandton, Johannesburg, Gauteng",
  clientName: "David Sterling",
  clientCompany: "OmniCorp Retail Brands Pty Ltd",
  clientEmail: "d.sterling@omnicorpretail.co.za",
  clientAddress: "12 Marine Drive, Umhlanga Rocks, Durban, 4319",
  effectiveDate: "2026-08-15",
  projectDeadline: "2026-10-31",
  scopeOfWork: "Architecting, coding, and deploying an omnichannel e-commerce portal with integrated loyalty points, real-time inventory synchronization, and secure multi-currency payment checkout.",
  currency: "ZAR",
  milestones: [
    {
      id: "m-1",
      milestoneTitle: "Architecture & UI Component Library",
      deliverableDescription: "Tailwind UI component system, Next.js 15 scaffolding, and Supabase database schema setup.",
      dueDate: "2026-08-31",
      amount: 40000
    },
    {
      id: "m-2",
      milestoneTitle: "Core E-Commerce Engine & Cart Flow",
      deliverableDescription: "Product catalogue search, real-time cart state, and customer profile management.",
      dueDate: "2026-09-30",
      amount: 45000
    },
    {
      id: "m-3",
      milestoneTitle: "Payment Gateway, QA & Production Launch",
      deliverableDescription: "Integration with Paystack & Peach Payments, end-to-end load testing, and Vercel production deployment.",
      dueDate: "2026-10-31",
      amount: 35000
    }
  ],
  revisionsAllowed: 3,
  killFeePercent: 35,
  ipTransferUponFullPayment: true,
  governingLaw: "Republic of South Africa",
  templateId: "master-services"
};

export const sampleOfficialNoticeData: OfficialNoticeData = {
  senderEntity: "DocStudio Enterprise Legal & Compliance Directorate",
  senderAddress: "Floor 21, Sandton Office Tower, Johannesburg, 2196",
  senderContact: "legal@docstudio.co.za | +27 11 900 1200",
  recipientEntity: "Apex Commercial Holdings Limited",
  recipientAddress: "50 Longmarket Street, Cape Town CBD, 8001",
  referenceNumber: "NOT-2026-7789-COMP",
  date: "14 August 2026",
  noticeSubject: "FORMAL NOTIFICATION OF UPCOMING REGULATORY SYSTEM AUDIT & POPIA COMPLIANCE REVIEW",
  noticeType: "formal_notice",
  bodyParagraphs: [
    "Please be formally advised that in accordance with Section 14 of the Master Corporate Service Framework Agreement, DocStudio Compliance Directorate will be initiating a scheduled bi-annual data integrity and POPIA governance audit effective 01 September 2026.",
    "The primary objective of this review is to verify that all customer identifying records, transaction logs, and cloud storage protocols remain in strict alignment with current Information Regulator benchmarks and ISO 27001 data protection standards.",
    "Your designated Data Protection Officer (DPO) and IT Security Leads are requested to furnish the relevant access logs, encryption certificates, and third-party processor sub-agreements prior to the commencement date."
  ],
  actionRequired: "Submission of Stage 1 Information Security Questionnaire and Authorized IT Security Contact details.",
  complianceDeadline: "28 August 2026 (17:00 SAST)",
  authorizedSignatoryName: "Advocate Sipho Ndlovu",
  authorizedSignatoryTitle: "Chief Compliance Officer & Legal Counsel",
  templateId: "formal-seal"
};

export const sampleCertificateData: CertificateData = {
  certificateId: "DOC-CERT-2026-9812A",
  recipientName: "Lindiwe Nomvula Dlamini",
  achievementTitle: "Advanced Cloud Systems & AI Architecture",
  descriptionText: "For exemplary mastery in engineering resilient, high-throughput cloud-native architectures, container orchestration, and deploying enterprise Model Context Protocol (MCP) tool integrations with distinction.",
  issuingOrganization: "DocStudio Institute of Advanced Software Engineering",
  issueDate: "14 August 2026",
  honorsBadgeText: "HONORS WITH DISTINCTION",
  verificationUrl: "https://verify.docstudio.co.za/cert/DOC-CERT-2026-9812A",
  primarySignatoryName: "Prof. Arthur Pendelton",
  primarySignatoryTitle: "Dean of Technical Curriculum",
  secondarySignatoryName: "Elena Rostova",
  secondarySignatoryTitle: "Director of Enterprise Certification",
  templateId: "gold-crest"
};

export const sampleReceiptData: ReceiptData = {
  receiptNumber: "REC-2026-00918",
  receiptDate: "2026-08-14",
  businessName: "DocStudio Cloud Technologies Pty Ltd",
  businessEmail: "billing@docstudio.co.za",
  businessPhone: "+27 11 555 0199",
  businessAddress: "DocStudio HQ, Sandton Innovation Hub, Johannesburg, 2196",
  payerName: "BlueHorizon Logistics Group",
  payerContact: "procurement@bluehorizon.com | +27 82 555 9012",
  paymentFor: "Settlement of Invoice INV-2026-0842 (Cloud Architecture & Frontend Portal)",
  amountPaid: 140325.00,
  currency: "ZAR",
  paymentMethod: "EFT / Bank Transfer",
  referenceTransactionId: "FNB-EFT-9918230914",
  notes: "Full payment received with thanks. Official tax clearance and invoice marked as PAID.",
  receivedByName: "Kagiso Molefe (Finance Manager)",
  templateId: "official-slip"
};

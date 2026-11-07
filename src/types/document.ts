import React from 'react';
import type {
  UnifiedBillingData,
  BillingClient,
  CatalogItem,
  OrganizationSettings,
  BillingPayment
} from '../services/storage/billingService';

export type {
  UnifiedBillingData,
  BillingClient,
  CatalogItem,
  OrganizationSettings,
  BillingPayment
};

// Tool Definition & Metadata
export interface ToolDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'career' | 'finance' | 'legal' | 'credentials';
  badge?: string;
  icon: string;
  color: string;
  gradient: string;
  templatesCount: number;
}

export enum DocumentCategory {
  CAREER = 'career',
  FINANCE = 'finance',
  LEGAL = 'legal',
  CREDENTIALS = 'credentials'
}

// 1. CV Types
export interface LanguageProficiency {
  name: string;
  speakProficiency: string;
  writeProficiency: string;
}

export interface JobExperience {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

export interface TertiaryModule {
  moduleName: string;
  score: number;
  grade?: string;
}

export interface EducationQualification {
  id: string;
  qualificationName: string;
  institution: string;
  yearCompleted: string;
  status?: string;
  tertiaryModules?: TertiaryModule[];
}

export interface ReferenceContact {
  id: string;
  referenceName: string;
  companyTitle: string;
  contactEmail: string;
  contactPhone: string;
  relationship: string;
}

export interface MatricSubject {
  subjectName: string;
  score: number;
  level: string;
}

export interface SouthAfricanCvData {
  fullName: string;
  headline?: string;
  idNumber: string;
  passportNumber: string;
  useIdNumber: boolean;
  isInternational?: boolean;
  gender: string;
  demographics: string;
  driversLicense: string;
  hasPdp: boolean;
  languages: LanguageProficiency[];
  cellNumber: string;
  emailAddress: string;
  linkedInUrl: string;
  portfolioUrl?: string;
  githubUrl?: string;
  density?: 'compact' | 'standard' | 'spacious';
  targetJobDescription?: string;
  currentLocation: string;
  noticePeriod: string;
  professionalSummary: string;
  workExperience: JobExperience[];
  education: EducationQualification[];
  references: ReferenceContact[];
  skills: string[];
  isMatricHighest?: boolean;
  matricSubjects?: MatricSubject[];
  templateId?: string;
}

// 2. Invoice Types
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  discountPercent?: number;
}

export interface InvoiceData {
  companyName: string;
  companyEmail: string;
  companyCell: string;
  companyAddress: string;
  companyVatNumber?: string;
  companyLogoUrl?: string;
  clientName: string;
  clientEmail: string;
  clientCell: string;
  clientAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  items: InvoiceItem[];
  taxRate: number;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
  paymentQrPayload?: string;
  paymentTermsNotes?: string;
  templateId?: string;
}

// 3. Cover Letter Types
export interface CoverLetterData {
  fullName: string;
  headline?: string;
  emailAddress: string;
  cellNumber: string;
  linkedInUrl: string;
  currentLocation: string;
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  companyAddress: string;
  date: string;
  jobTitle: string;
  tone?: 'executive' | 'confident' | 'academic' | 'creative';
  paragraphs: string[];
  templateId?: string;
}

// 4. Quotation Types
export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  unit?: string;
}

export interface QuotationData {
  providerName: string;
  providerEmail: string;
  providerPhone: string;
  providerAddress: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  quoteNumber: string;
  quoteDate: string;
  validUntil: string;
  currency: string;
  depositRequiredPercent?: number;
  items: QuotationItem[];
  termsAndConditions: string;
  templateId?: string;
}

// 5. NDA Types
export interface NdaData {
  agreementType: 'mutual' | 'unilateral';
  disclosingParty: string;
  disclosingPartyAddress?: string;
  receivingParty: string;
  receivingPartyAddress?: string;
  effectiveDate: string;
  purpose: string;
  governingLaw: string;
  confidentialityPeriod: string;
  nonSolicitationMonths?: number;
  permittedDisclosures?: string;
  templateId?: string;
}

// 6. Resignation Letter Types
export interface ResignationData {
  fullName: string;
  jobTitle: string;
  companyName: string;
  managerName: string;
  managerTitle: string;
  submissionDate: string;
  lastWorkingDay: string;
  noticePeriodDuration: string;
  reasonOption: 'new_opportunity' | 'career_transition' | 'relocation' | 'personal';
  appreciationMessage: string;
  handoverPlan: string;
  personalContactDetails: string;
  templateId?: string;
}

// 7. Freelance Agreement Types
export interface ContractMilestone {
  id: string;
  milestoneTitle: string;
  deliverableDescription: string;
  dueDate: string;
  amount: number;
}

export interface FreelanceContractData {
  contractTitle: string;
  freelancerName: string;
  freelancerEmail: string;
  freelancerAddress: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientAddress: string;
  effectiveDate: string;
  projectDeadline: string;
  scopeOfWork: string;
  currency: string;
  milestones: ContractMilestone[];
  revisionsAllowed: number;
  killFeePercent: number;
  ipTransferUponFullPayment: boolean;
  governingLaw: string;
  templateId?: string;
}

// 8. Official Notice / Formal Letter Types
export interface OfficialNoticeData {
  senderEntity: string;
  senderAddress: string;
  senderContact: string;
  recipientEntity: string;
  recipientAddress: string;
  referenceNumber: string;
  date: string;
  noticeSubject: string;
  noticeType: 'formal_notice' | 'demand_letter' | 'policy_update' | 'inquiry';
  bodyParagraphs: string[];
  actionRequired: string;
  complianceDeadline: string;
  authorizedSignatoryName: string;
  authorizedSignatoryTitle: string;
  templateId?: string;
}

// 9. Certificate Types
export interface CertificateData {
  certificateId: string;
  recipientName: string;
  achievementTitle: string;
  descriptionText: string;
  issuingOrganization: string;
  issueDate: string;
  honorsBadgeText?: string;
  verificationUrl?: string;
  primarySignatoryName: string;
  primarySignatoryTitle: string;
  secondarySignatoryName?: string;
  secondarySignatoryTitle?: string;
  templateId?: string;
}

// 10. Receipt Types
export interface ReceiptData {
  receiptNumber: string;
  receiptDate: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  payerName: string;
  payerContact?: string;
  paymentFor: string;
  amountPaid: number;
  currency: string;
  paymentMethod: 'EFT / Bank Transfer' | 'Credit / Debit Card' | 'Cash' | 'Stripe / Online' | 'Crypto';
  referenceTransactionId: string;
  notes?: string;
  receivedByName: string;
  templateId?: string;
}

// Universal Union of all Document Data
export type AnyDocumentData =
  | SouthAfricanCvData
  | UnifiedBillingData
  | InvoiceData
  | CoverLetterData
  | QuotationData
  | NdaData
  | ResignationData
  | FreelanceContractData
  | OfficialNoticeData
  | CertificateData
  | ReceiptData;

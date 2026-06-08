
// Added React import to resolve 'Cannot find namespace React' error for React.ReactNode
import React from 'react';

export interface ServiceCardData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export enum AppRoute {
  HOME = 'home',
  PROFILE = 'profile',
  TOOLS = 'tools',
  SETTINGS = 'settings'
}

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

export interface EducationQualification {
  id: string;
  qualificationName: string;
  institution: string;
  yearCompleted: string;
}

export interface ReferenceContact {
  id: string;
  referenceName: string;
  companyTitle: string;
  contactEmail: string;
  contactPhone: string;
  relationship: string;
}

export interface SouthAfricanCvData {
  fullName: string;
  idNumber: string;
  passportNumber: string;
  useIdNumber: boolean;
  gender: string;
  demographics: string;
  driversLicense: string;
  hasPdp: boolean;
  languages: LanguageProficiency[];
  cellNumber: string;
  emailAddress: string;
  linkedInUrl: string;
  currentLocation: string;
  noticePeriod: string;
  professionalSummary: string;
  workExperience: JobExperience[];
  education: EducationQualification[];
  references: ReferenceContact[];
  skills: string[];
}
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceData {
  companyName: string;
  companyEmail: string;
  companyCell: string;
  companyAddress: string;
  clientName: string;
  clientEmail: string;
  clientCell: string;
  clientAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate: number;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
}

export interface CoverLetterData {
  fullName: string;
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
  paragraphs: string[];
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
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
  items: QuotationItem[];
  termsAndConditions: string;
}

export interface NdaData {
  disclosingParty: string;
  receivingParty: string;
  effectiveDate: string;
  purpose: string;
  governingLaw: string;
  confidentialityPeriod: string;
}

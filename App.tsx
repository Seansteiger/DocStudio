import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Receipt, 
  Palette, 
  Calendar, 
  Home, 
  Wrench, 
  User, 
  Settings,
  ArrowLeft,
  Search,
  Bell,
  Plus,
  Trash2,
  Sparkles,
  Printer,
  Upload,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Languages as LanguagesIcon,
  FileSignature,
  Layers,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Clock,
  UserCheck,
  Building,
  CreditCard,
  CalendarDays,
  FileText as FileTextIcon
} from 'lucide-react';
import { 
  ServiceCardData, 
  AppRoute, 
  SouthAfricanCvData, 
  JobExperience, 
  EducationQualification, 
  ReferenceContact, 
  LanguageProficiency,
  InvoiceData,
  InvoiceItem,
  CoverLetterData,
  QuotationData,
  QuotationItem,
  NdaData
} from './types';

// PDF Extraction and Heuristic Parsing Functions
const parsePdfText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error("Failed to read file as ArrayBuffer"));
          return;
        }

        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          reject(new Error("PDF.js library is not loaded. Please verify your internet connection."));
          return;
        }

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const textItems = textContent.items.map((item: any) => item.str);
          fullText += textItems.join(" ") + "\n";
        }

        resolve(fullText);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("File reading error"));
    reader.readAsArrayBuffer(file);
  });
};

const parseDocumentText = (text: string): { toolId: string; data: any } => {
  console.log("Extracted PDF Text:", text);

  // 1. Detect Document Type
  if (text.includes("National ID Number") || text.includes("Employment Equity (EE)") || text.includes("EMPLOYMENT HISTORY") || text.includes("EDUCATION & QUALIFICATIONS") || text.includes("KEY CORE COMPETENCIES")) {
    const cv: Partial<SouthAfricanCvData> = {
      fullName: "", idNumber: "", passportNumber: "", useIdNumber: true,
      gender: "Male", demographics: "African", driversLicense: "None", hasPdp: false,
      cellNumber: "", emailAddress: "", linkedInUrl: "", currentLocation: "",
      noticePeriod: "Immediate", professionalSummary: "", languages: [],
      workExperience: [], education: [], skills: [], references: []
    };

    const nameMatch = text.match(/^\s*([A-Z\s]{3,30})/);
    if (nameMatch) {
      cv.fullName = nameMatch[1].trim();
    } else {
      const phoneMatchIndex = text.search(/(\+27|0\d{2})/);
      if (phoneMatchIndex > 0) {
        cv.fullName = text.slice(0, phoneMatchIndex).trim();
      }
    }

    const cellMatch = text.match(/(?:\+27|0)\s*\d{2}\s*\d{3}\s*\d{4}/);
    if (cellMatch) cv.cellNumber = cellMatch[0].trim();

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) cv.emailAddress = emailMatch[0].trim();

    const liMatch = text.match(/linkedin\.com\/in\/\S+/);
    if (liMatch) cv.linkedInUrl = liMatch[0].trim();

    const locMatch = text.match(/(?:Johannesburg|Pretoria|Midrand|Randburg|Sandton|Soweto|Benoni|Kempton Park|Roodepoort|Centurion|Cape Town|Stellenbosch|Durban|Gauteng|Western Cape|KwaZulu-Natal|Eastern Cape|Free State|Limpopo|Mpumalanga|North West|Northern Cape)[^,\n]*,\s*(?:Gauteng|Western Cape|KwaZulu-Natal|Eastern Cape|Free State|Limpopo|Mpumalanga|North West|Northern Cape)/i);
    if (locMatch) cv.currentLocation = locMatch[0].trim();

    const idMatch = text.match(/National ID Number:\s*(\d{13})/);
    if (idMatch) {
      cv.idNumber = idMatch[1].trim();
      cv.useIdNumber = true;
    } else {
      const passMatch = text.match(/Passport Number:\s*(\S+)/);
      if (passMatch) {
        cv.passportNumber = passMatch[1].trim();
        cv.useIdNumber = false;
      }
    }

    const eeMatch = text.match(/Employment Equity \(EE\):\s*(\w+)\s*\((\w+[^)]*)\)/);
    if (eeMatch) {
      cv.demographics = eeMatch[1].trim();
      cv.gender = eeMatch[2].trim();
    }

    const dlMatch = text.match(/Driver's License:\s*([^(\n]+)/);
    if (dlMatch) {
      const val = dlMatch[1].trim().toLowerCase();
      if (val.includes("code 8") || val.includes(" b ")) {
        cv.driversLicense = "Code 8 / B";
      } else if (val.includes("code 10") || val.includes("c1")) {
        cv.driversLicense = "Code 10 / C1";
      } else if (val.includes("code 14") || val.includes("ec")) {
        cv.driversLicense = "Code 14 / EC";
      } else {
        cv.driversLicense = "None";
      }
    }
    if (text.includes("PrDP Certified")) cv.hasPdp = true;

    const npMatch = text.match(/Notice Period:\s*([^\n]+)/);
    if (npMatch) {
      const val = npMatch[1].trim().toLowerCase();
      if (val.includes("immediate") || val.includes("unemployed")) {
        cv.noticePeriod = "Immediate";
      } else if (val.includes("2 week") || val.includes("two week")) {
        cv.noticePeriod = "2 Weeks";
      } else if (val.includes("1 calendar") || val.includes("one calendar") || val.includes("1 month") || val.includes("one month")) {
        cv.noticePeriod = "1 Calendar Month";
      } else if (val.includes("3 month") || val.includes("three month")) {
        cv.noticePeriod = "3 Months";
      } else {
        cv.noticePeriod = "Immediate";
      }
    }

    const summaryStart = text.indexOf("PROFESSIONAL SUMMARY");
    if (summaryStart !== -1) {
      const remaining = text.slice(summaryStart + "PROFESSIONAL SUMMARY".length);
      const nextSectionIdx = Math.min(
        remaining.includes("LANGUAGES") ? remaining.indexOf("LANGUAGES") : Infinity,
        remaining.includes("EMPLOYMENT HISTORY") ? remaining.indexOf("EMPLOYMENT HISTORY") : Infinity,
        remaining.includes("EDUCATION & QUALIFICATIONS") ? remaining.indexOf("EDUCATION & QUALIFICATIONS") : Infinity
      );
      if (nextSectionIdx !== Infinity) {
        cv.professionalSummary = remaining.slice(0, nextSectionIdx).trim();
      } else {
        cv.professionalSummary = remaining.trim();
      }
    }

    const langStart = text.indexOf("LANGUAGES");
    if (langStart !== -1) {
      const remaining = text.slice(langStart + "LANGUAGES".length);
      const nextSectionIdx = Math.min(
        remaining.includes("EMPLOYMENT HISTORY") ? remaining.indexOf("EMPLOYMENT HISTORY") : Infinity,
        remaining.includes("EDUCATION & QUALIFICATIONS") ? remaining.indexOf("EDUCATION & QUALIFICATIONS") : Infinity,
        remaining.includes("KEY CORE COMPETENCIES") ? remaining.indexOf("KEY CORE COMPETENCIES") : Infinity
      );
      const langText = nextSectionIdx !== Infinity ? remaining.slice(0, nextSectionIdx) : remaining;
      const regex = /(\w+)\s*\(Spoken:\s*(\w+)\s*\|\s*Written:\s*(\w+)\)/g;
      let match;
      const languagesList = [];
      while ((match = regex.exec(langText)) !== null) {
        languagesList.push({ name: match[1], speakProficiency: match[2], writeProficiency: match[3] });
      }
      cv.languages = languagesList;
    }

    const skillsStart = text.indexOf("KEY CORE COMPETENCIES");
    if (skillsStart !== -1) {
      const remaining = text.slice(skillsStart + "KEY CORE COMPETENCIES".length);
      const nextSectionIdx = remaining.includes("PROFESSIONAL REFERENCES") ? remaining.indexOf("PROFESSIONAL REFERENCES") : Infinity;
      const skillsText = nextSectionIdx !== Infinity ? remaining.slice(0, nextSectionIdx) : remaining;
      cv.skills = skillsText.split(/•|•/).map(s => s.trim()).filter(s => s.length > 0);
    }

    const expStart = text.indexOf("EMPLOYMENT HISTORY");
    if (expStart !== -1) {
      const remaining = text.slice(expStart + "EMPLOYMENT HISTORY".length);
      const nextSectionIdx = Math.min(
        remaining.includes("EDUCATION & QUALIFICATIONS") ? remaining.indexOf("EDUCATION & QUALIFICATIONS") : Infinity,
        remaining.includes("KEY CORE COMPETENCIES") ? remaining.indexOf("KEY CORE COMPETENCIES") : Infinity
      );
      const expText = nextSectionIdx !== Infinity ? remaining.slice(0, nextSectionIdx) : remaining;
      const jobs = [];
      const lines = expText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      let currentJob: any = null;

      for (let line of lines) {
        const dateMatch = line.match(/(.*)(\d{2}\/\d{4}\s*—\s*(?:\d{2}\/\d{4}|Current|Present|Ongoing))/i);
        if (dateMatch) {
          if (currentJob) jobs.push(currentJob);
          currentJob = {
            id: Date.now().toString() + Math.random().toString(),
            jobTitle: dateMatch[1].trim(),
            startDate: dateMatch[2].split("—")[0].trim(),
            endDate: dateMatch[2].split("—")[1].trim(),
            companyName: "", location: "", responsibilities: ""
          };
        } else if (currentJob) {
          if (!currentJob.companyName) {
            const locMatch = line.match(/(.*),\s*(Gauteng|Western Cape|KwaZulu-Natal|Eastern Cape|Free State|Limpopo|Mpumalanga|North West|Northern Cape)/i);
            if (locMatch) {
              currentJob.companyName = locMatch[1].trim();
              currentJob.location = locMatch[0].trim().replace(locMatch[1].trim(), "").replace(/^,\s*/, "").trim();
            } else {
              currentJob.companyName = line;
            }
          } else if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
            currentJob.responsibilities += (currentJob.responsibilities ? "\n" : "") + line;
          } else {
            currentJob.responsibilities += (currentJob.responsibilities ? "\n" : "") + "- " + line;
          }
        }
      }
      if (currentJob) jobs.push(currentJob);
      cv.workExperience = jobs;
    }

    const eduStart = text.indexOf("EDUCATION & QUALIFICATIONS");
    if (eduStart !== -1) {
      const remaining = text.slice(eduStart + "EDUCATION & QUALIFICATIONS".length);
      const nextSectionIdx = remaining.includes("KEY CORE COMPETENCIES") ? remaining.indexOf("KEY CORE COMPETENCIES") : Infinity;
      const eduText = nextSectionIdx !== Infinity ? remaining.slice(0, nextSectionIdx) : remaining;
      const edus = [];
      const lines = eduText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      let currentEdu: any = null;

      for (let line of lines) {
        const yearMatch = line.match(/(.*)(\d{4})$/);
        if (yearMatch) {
          if (currentEdu) edus.push(currentEdu);
          currentEdu = {
            id: Date.now().toString() + Math.random().toString(),
            qualificationName: yearMatch[1].trim(),
            yearCompleted: yearMatch[2].trim(),
            institution: ""
          };
        } else if (currentEdu) {
          currentEdu.institution = line;
          edus.push(currentEdu);
          currentEdu = null;
        }
      }
      if (currentEdu) edus.push(currentEdu);
      cv.education = edus;
    }

    const refStart = text.indexOf("PROFESSIONAL REFERENCES");
    if (refStart !== -1) {
      const remaining = text.slice(refStart + "PROFESSIONAL REFERENCES".length);
      const refs = [];
      const lines = remaining.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      let currentRef: any = null;

      for (let line of lines) {
        const phoneMatch = line.match(/Phone:\s*([^\n]+)/i);
        const emailMatch = line.match(/Email:\s*([^\n]+)/i);
        const relationMatch = line.match(/Relation:\s*([^\n]+)/i);

        if (phoneMatch) {
          if (!currentRef) {
            currentRef = { id: Date.now().toString() + Math.random().toString(), referenceName: "Reference Name", companyTitle: "", contactEmail: "", contactPhone: "", relationship: "" };
          }
          currentRef.contactPhone = phoneMatch[1].trim();
        } else if (emailMatch) {
          if (!currentRef) {
            currentRef = { id: Date.now().toString() + Math.random().toString(), referenceName: "Reference Name", companyTitle: "", contactEmail: "", contactPhone: "", relationship: "" };
          }
          currentRef.contactEmail = emailMatch[1].trim();
        } else if (relationMatch) {
          if (!currentRef) {
            currentRef = { id: Date.now().toString() + Math.random().toString(), referenceName: "Reference Name", companyTitle: "", contactEmail: "", contactPhone: "", relationship: "" };
          }
          currentRef.relationship = relationMatch[1].trim();
        } else {
          // Plain text line (Name or Company Title)
          if (!currentRef) {
            currentRef = {
              id: Date.now().toString() + Math.random().toString(),
              referenceName: line, companyTitle: "", contactEmail: "", contactPhone: "", relationship: ""
            };
          } else if (!currentRef.companyTitle) {
            currentRef.companyTitle = line;
          } else {
            // Already has name and title, so this starts a new reference
            refs.push(currentRef);
            currentRef = {
              id: Date.now().toString() + Math.random().toString(),
              referenceName: line, companyTitle: "", contactEmail: "", contactPhone: "", relationship: ""
            };
          }
        }
      }
      if (currentRef) refs.push(currentRef);
      cv.references = refs;
    }

    return { toolId: '1', data: cv };

  } else if (text.includes("TAX INVOICE") || text.includes("INVOICE NO:") || text.includes("BILLED TO:")) {
    const inv: Partial<InvoiceData> = {
      companyName: "", companyEmail: "", companyCell: "", companyAddress: "",
      clientName: "", clientEmail: "", clientCell: "", clientAddress: "",
      invoiceNumber: "", invoiceDate: "", dueDate: "", items: [],
      taxRate: 15, bankName: "", accountHolder: "", accountNumber: "", branchCode: ""
    };

    const invNumMatch = text.match(/INVOICE NO:\s*(\S+)/);
    if (invNumMatch) inv.invoiceNumber = invNumMatch[1].trim();

    const dateMatch = text.match(/Invoice Date:\s*(\S+)/);
    if (dateMatch) inv.invoiceDate = dateMatch[1].trim();
    const dueMatch = text.match(/Payment Due:\s*(\S+)/);
    if (dueMatch) inv.dueDate = dueMatch[1].trim();

    const providerStart = text.indexOf("TAX INVOICE");
    if (providerStart !== -1) {
      const preText = text.slice(0, providerStart);
      const lines = preText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 0) inv.companyName = lines[lines.length - 1];
    }

    const clientStart = text.indexOf("BILLED TO:");
    if (clientStart !== -1) {
      const remaining = text.slice(clientStart + "BILLED TO:".length);
      const lines = remaining.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 0) inv.clientName = lines[0];
      const emailMatch = remaining.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) inv.clientEmail = emailMatch[0].trim();
      const cellMatch = remaining.match(/(?:\+27|0)\s*\d{2}\s*\d{3}\s*\d{4}/);
      if (cellMatch) inv.clientCell = cellMatch[0].trim();
    }

    const bankMatch = text.match(/Bank Name:\s*([^\n]+)/);
    if (bankMatch) inv.bankName = bankMatch[1].trim();
    const holderMatch = text.match(/Account Holder:\s*([^\n]+)/);
    if (holderMatch) inv.accountHolder = holderMatch[1].trim();
    const numMatch = text.match(/Account Number:\s*([^\n]+)/);
    if (numMatch) inv.accountNumber = numMatch[1].trim();
    const branchMatch = text.match(/Branch Code:\s*([^\n]+)/);
    if (branchMatch) inv.branchCode = branchMatch[1].trim();

    const vatMatch = text.match(/VAT\s*\((\d+)%\):/);
    if (vatMatch) inv.taxRate = parseInt(vatMatch[1]);

    const tableStart = text.indexOf("DESCRIPTION");
    const subtotalIdx = text.indexOf("Subtotal:");

    if (tableStart !== -1 && subtotalIdx !== -1) {
      const tableText = text.slice(tableStart, subtotalIdx);
      const lines = tableText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const parsedItems = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const rowMatch = line.match(/(.*?)\s+(\d+)\s+R?\s*([\d,.]+)\s+R?\s*([\d,.]+)$/);
        if (rowMatch) {
          parsedItems.push({
            id: Date.now().toString() + Math.random().toString(),
            description: rowMatch[1].trim(), 
            quantity: parseInt(rowMatch[2]), 
            rate: parseFloat(rowMatch[3].replace(/,/g, ''))
          });
        }
      }
      if (parsedItems.length > 0) inv.items = parsedItems;
    }

    return { toolId: '2', data: inv };

  } else if (text.includes("RE: APPLICATION FOR THE POSITION OF") || text.includes("Dear Hiring Manager")) {
    const letter: Partial<CoverLetterData> = {
      fullName: "", emailAddress: "", cellNumber: "", linkedInUrl: "", currentLocation: "",
      recipientName: "", recipientTitle: "", companyName: "", companyAddress: "",
      date: "", jobTitle: "", paragraphs: []
    };

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0) letter.fullName = lines[0];

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) letter.emailAddress = emailMatch[0].trim();
    const cellMatch = text.match(/(?:\+27|0)\s*\d{2}\s*\d{3}\s*\d{4}/);
    if (cellMatch) letter.cellNumber = cellMatch[0].trim();
    const liMatch = text.match(/linkedin\.com\/in\/\S+/);
    if (liMatch) letter.linkedInUrl = liMatch[0].trim();

    const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) letter.date = dateMatch[0];

    const subjectMatch = text.match(/RE:\s*APPLICATION\s*FOR\s*THE\s*POSITION\s*OF\s*([^\n]+)/i);
    if (subjectMatch) letter.jobTitle = subjectMatch[1].replace(/RE:\s*/i, "").trim();

    const dateIdx = lines.findIndex(l => l.match(/\d{4}-\d{2}-\d{2}/));
    if (dateIdx !== -1 && lines.length > dateIdx + 3) {
      letter.recipientName = lines[dateIdx + 1];
      letter.recipientTitle = lines[dateIdx + 2];
      letter.companyName = lines[dateIdx + 3];
      const dearIdx = lines.findIndex(l => l.startsWith("Dear"));
      if (dearIdx !== -1 && dearIdx > dateIdx + 4) {
        letter.companyAddress = lines.slice(dateIdx + 4, dearIdx).join(", ");
      }
    }

    const dearIdx = lines.findIndex(l => l.startsWith("Dear"));
    const sincIdx = lines.findIndex(l => l.startsWith("Sincerely") || l.startsWith("Yours"));
    if (dearIdx !== -1 && sincIdx !== -1 && sincIdx > dearIdx + 1) {
      letter.paragraphs = lines.slice(dearIdx + 1, sincIdx);
    }

    return { toolId: '3', data: letter };

  } else if (text.includes("PRICE QUOTATION") || text.includes("QUOTE NO:") || text.includes("QUOTED TO:")) {
    const quote: Partial<QuotationData> = {
      providerName: "", providerEmail: "", providerPhone: "", providerAddress: "",
      clientName: "", clientEmail: "", clientPhone: "", clientAddress: "",
      quoteNumber: "", quoteDate: "", validUntil: "", items: [], termsAndConditions: ""
    };

    const quoteNumMatch = text.match(/QUOTE NO:\s*(\S+)/);
    if (quoteNumMatch) quote.quoteNumber = quoteNumMatch[1].trim();

    const dateMatch = text.match(/Quote Date:\s*(\S+)/);
    if (dateMatch) quote.quoteDate = dateMatch[1].trim();
    const validMatch = text.match(/Valid Until:\s*(\S+)/);
    if (validMatch) quote.validUntil = validMatch[1].trim();

    const clientIdx = text.indexOf("QUOTED TO:");
    if (clientIdx !== -1) {
      const preText = text.slice(0, clientIdx);
      const lines = preText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 3) {
        quote.providerName = lines[lines.length - 4];
        quote.providerEmail = lines[lines.length - 3];
        quote.providerPhone = lines[lines.length - 2];
        quote.providerAddress = lines[lines.length - 1];
      }
    }

    if (clientIdx !== -1) {
      const remaining = text.slice(clientIdx + "QUOTED TO:".length);
      const lines = remaining.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 0) quote.clientName = lines[0];
      const emailMatch = remaining.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) quote.clientEmail = emailMatch[0].trim();
      const cellMatch = remaining.match(/(?:\+27|0)\s*\d{2}\s*\d{3}\s*\d{4}/);
      if (cellMatch) quote.clientPhone = cellMatch[0].trim();
    }

    const tableStart = text.indexOf("DESCRIPTION");
    const totalIdx = text.indexOf("ESTIMATED TOTAL:");
    if (tableStart !== -1 && totalIdx !== -1) {
      const tableText = text.slice(tableStart, totalIdx);
      const lines = tableText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const parsedItems = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const rowMatch = line.match(/(.*?)\s+(\d+)\s+R?\s*([\d,.]+)\s+R?\s*([\d,.]+)$/);
        if (rowMatch) {
          parsedItems.push({
            id: Date.now().toString() + Math.random().toString(),
            description: rowMatch[1].trim(), 
            quantity: parseInt(rowMatch[2]), 
            rate: parseFloat(rowMatch[3].replace(/,/g, ''))
          });
        }
      }
      if (parsedItems.length > 0) quote.items = parsedItems;
    }

    const termsIdx = text.indexOf("TERMS & CONDITIONS:");
    if (termsIdx !== -1) {
      quote.termsAndConditions = text.slice(termsIdx + "TERMS & CONDITIONS:".length).trim();
    }

    return { toolId: '4', data: quote };

  } else if (text.includes("Non-Disclosure Agreement") || text.includes("CONFIDENTIALITY PERIOD") || text.includes("Governing Law")) {
    const nda: Partial<NdaData> = {
      disclosingParty: "", receivingParty: "", effectiveDate: "", purpose: "", governingLaw: "", confidentialityPeriod: ""
    };

    const dateMatch = text.match(/effective as of\s*([^\(]+)/i);
    if (dateMatch) nda.effectiveDate = dateMatch[1].trim();

    const partiesStart = text.indexOf("by and between:");
    const partiesEnd = text.indexOf("Hereinafter referred to");
    if (partiesStart !== -1 && partiesEnd !== -1) {
      const partiesText = text.slice(partiesStart + "by and between:".length, partiesEnd);
      const lines = partiesText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 0) nda.disclosingParty = lines[0].replace(/,\s*and$/i, "").trim();
      if (lines.length > 1) nda.receivingParty = lines[1].trim();
    }

    const purposeMatch = text.match(/sole purpose of:\s*([^\n.]+)/i);
    if (purposeMatch) nda.purpose = purposeMatch[1].trim();

    const termMatch = text.match(/period of\s*([^\n,]+?)\s*from the Effective Date/i);
    if (termMatch) nda.confidentialityPeriod = termMatch[1].trim();

    const govMatch = text.match(/laws of the\s*([^\n.]+)/i);
    if (govMatch) nda.governingLaw = govMatch[1].trim();

    return { toolId: '5', data: nda };
  }

  throw new Error("Could not identify document type or structure in this PDF.");
};

// Initial South African CV Mock Data
const initialCvData: SouthAfricanCvData = {
  fullName: "Lindiwe Dlamini",
  idNumber: "9604125089083",
  passportNumber: "",
  useIdNumber: true,
  gender: "Female",
  demographics: "African",
  driversLicense: "Code 8 / B",
  hasPdp: false,
  languages: [
    { name: "English", speakProficiency: "Fluent", writeProficiency: "Fluent" },
    { name: "isiZulu", speakProficiency: "Native", writeProficiency: "Fluent" },
    { name: "Afrikaans", speakProficiency: "Conversational", writeProficiency: "Basic" }
  ],
  cellNumber: "+27 72 345 6789",
  emailAddress: "lindiwe.dlamini@outlook.com",
  linkedInUrl: "linkedin.com/in/lindiwedlamini",
  currentLocation: "Randburg, Gauteng",
  noticePeriod: "1 Calendar Month",
  professionalSummary: "Detail-oriented Business Analyst with 4+ years of experience in the South African banking sector. Skilled in mapping business processes, translating stakeholder requirements, and running Agile sprints to improve efficiency.",
  workExperience: [
    {
      id: "w1",
      jobTitle: "Business Analyst",
      companyName: "Nedbank Group Ltd",
      location: "Sandton, Gauteng",
      startDate: "03/2022",
      endDate: "Present",
      responsibilities: "- Led requirements gathering workshops with retail banking executives to define project scopes.\n- Drafted functional and non-functional requirement specifications for mobile payments systems.\n- Reduced process bottlenecks by 15% through BPMN workflow re-engineering."
    },
    {
      id: "w2",
      jobTitle: "Junior Analyst",
      companyName: "SNG Grant Thornton",
      location: "Johannesburg, Gauteng",
      startDate: "01/2020",
      endDate: "02/2022",
      responsibilities: "- Assisted senior consultants in auditing business processes and identifying compliance risks.\n- Prepared data analytics dashboards using PowerBI to report project milestones.\n- Compiled client reports detailing standard operating procedure recommendations."
    }
  ],
  education: [
    {
      id: "e1",
      qualificationName: "Bachelor of Commerce in Information Systems",
      institution: "University of the Witwatersrand",
      yearCompleted: "2019"
    },
    {
      id: "e2",
      qualificationName: "National Senior Certificate (Matric - 6 Distinctions)",
      institution: "Parktown High School for Girls",
      yearCompleted: "2015"
    }
  ],
  references: [
    {
      id: "r1",
      referenceName: "Sarah Jenkins",
      companyTitle: "Senior Project Manager at Nedbank",
      contactEmail: "s.jenkins@nedbank.co.za",
      contactPhone: "+27 11 294 0000",
      relationship: "Direct Manager"
    },
    {
      id: "r2",
      referenceName: "Dr. David Ndlovu",
      companyTitle: "Partner at SNG Grant Thornton",
      contactEmail: "d.ndlovu@sng-gt.co.za",
      contactPhone: "+27 11 251 1000",
      relationship: "Career Mentor & Supervisor"
    }
  ],
  skills: ["Business Analysis", "BPMN", "SQL", "Agile (Scrum)", "Requirements Gathering", "UML Modeling", "Microsoft PowerBI"]
};

// Initial Invoice Mock Data
const initialInvoiceData: InvoiceData = {
  companyName: "Zenith Creative Group",
  companyEmail: "billing@zenithcreative.co.za",
  companyCell: "+27 82 999 8888",
  companyAddress: "12 Biermann Avenue, Rosebank, Johannesburg, 2196",
  clientName: "Acme Enterprises SA",
  clientEmail: "accounts@acme.co.za",
  clientCell: "+27 11 444 3322",
  clientAddress: "88 Grayston Drive, Sandown, Sandton, 2196",
  invoiceNumber: "INV-2026-004",
  invoiceDate: "2026-06-08",
  dueDate: "2026-06-22",
  items: [
    { id: "i1", description: "Visual Design & Branding Package", quantity: 1, rate: 8500 },
    { id: "i2", description: "React Frontend Dashboard Integration", quantity: 40, rate: 450 },
    { id: "i3", description: "Bimonthly Cloud Hosting Support", quantity: 2, rate: 1200 }
  ],
  taxRate: 15,
  bankName: "First National Bank (FNB)",
  accountHolder: "Zenith Creative Group Pty Ltd",
  accountNumber: "62839485761",
  branchCode: "250655"
};

// Initial Cover Letter Mock Data
const initialCoverLetterData: CoverLetterData = {
  fullName: "Lindiwe Dlamini",
  emailAddress: "lindiwe.dlamini@outlook.com",
  cellNumber: "+27 72 345 6789",
  linkedInUrl: "linkedin.com/in/lindiwedlamini",
  currentLocation: "Randburg, Gauteng",
  recipientName: "Hiring Manager",
  recipientTitle: "Talent Acquisition Director",
  companyName: "Nedbank Group Ltd",
  companyAddress: "135 Rivonia Road, Sandown, Sandton, 2196",
  date: "2026-06-08",
  jobTitle: "Senior Business Analyst",
  paragraphs: [
    "I am writing to express my strong interest in the Senior Business Analyst position at Nedbank. With over four years of experience mapping core systems, eliciting business requirements, and managing cross-functional Agile sprints within the South African retail banking sector, I am eager to contribute to Nedbank's digital transformation initiatives.",
    "During my tenure at Apex Tech Solutions, I successfully led process re-engineering projects that reduced payment processing cycle times by 15%. I am well-versed in BPMN 2.0 modeling, writing functional specifications, and conducting user acceptance testing (UAT). My background at the University of the Witwatersrand in Information Systems has equipped me with a robust analytical foundation to analyze complex banking systems.",
    "I admire Nedbank’s commitment to sustainable financial solutions and digital innovation. I am confident that my technical skills in SQL, Agile scrum practices, and stakeholder engagement will enable me to seamlessly integrate and drive high-performance outcomes for your retail banking squads.",
    "Thank you for your time and consideration of my application. I look forward to the opportunity to discuss how my experience and skills align with Nedbank's business requirements in an interview. Please find my detailed CV attached."
  ]
};

// Initial Quotation Mock Data
const initialQuotationData: QuotationData = {
  providerName: "Zenith Creative Group",
  providerEmail: "hello@zenithcreative.co.za",
  providerPhone: "+27 82 999 8888",
  providerAddress: "12 Biermann Avenue, Rosebank, Johannesburg, 2196",
  clientName: "Mokoena Logistics",
  clientEmail: "mokoena@mokoenalogistics.co.za",
  clientPhone: "+27 73 111 2222",
  clientAddress: "45 Pomona Road, Kempton Park, Gauteng, 1619",
  quoteNumber: "QT-2026-89",
  quoteDate: "2026-06-08",
  validUntil: "2026-07-08",
  items: [
    { id: "q1", description: "Supply Chain Dashboard Interface UI Mockup", quantity: 1, rate: 12500 },
    { id: "q2", description: "Database Modeling & API Setup", quantity: 1, rate: 9500 },
    { id: "q3", description: "Advanced Excel Reporting Automations", quantity: 1, rate: 4500 }
  ],
  termsAndConditions: "1. 50% deposit required to commence work.\n2. Balance payable within 7 days of delivery.\n3. Content and branding assets must be provided by the client."
};

// Initial NDA Mock Data
const initialNdaData: NdaData = {
  disclosingParty: "Zenith Creative Group Pty Ltd",
  receivingParty: "Lindiwe Dlamini Inc.",
  effectiveDate: "2026-06-08",
  purpose: "Collaborating on the design and programming of the DocStudio Document Workspace Suite.",
  governingLaw: "Republic of South Africa",
  confidentialityPeriod: "3 Years"
};

// Skill suggestions catalog by Job Category
const suggestedSkillsMap: { [key: string]: string[] } = {
  "Web Development": ["React", "TypeScript", "Node.js", "Tailwind CSS", "Git", "REST APIs", "SQL", "Next.js", "Supabase", "PostgreSQL"],
  "Business Analysis": ["Business Analysis", "BPMN 2.0", "SQL", "Agile (Scrum)", "Requirements Gathering", "UML Modeling", "Microsoft PowerBI", "Jira", "UAT Testing"],
  "Administration": ["Office 365", "Data Entry", "Calendar Management", "Billing", "Meeting Minutes", "Customer Service", "Filing Systems", "Travel Coordination"],
  "Logistics": ["Supply Chain", "Inventory Control", "Fleet Management", "Warehousing", "Route Optimization", "SAP", "Excel (Advanced)", "Procurement"],
  "Retail": ["Point of Sale (POS)", "Merchandising", "Customer Relations", "Stock Management", "Cash Handling", "Upselling", "Conflict Resolution", "Visual Merchandising"]
};

// Background Orbs Component
const BackgroundOrbs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00F2FF]/10 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 120, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#8B5CF6]/10 rounded-full blur-[150px]"
      />
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -100, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute top-[30%] left-[40%] w-[300px] h-[300px] bg-[#00F2FF]/5 rounded-full blur-[100px]"
      />
    </div>
  );
};

// ProfilePulse Component
const ProfilePulse = () => {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-[#00F2FF]/40 rounded-full blur-sm"
      />
      <div className="relative w-12 h-12 rounded-full border-2 border-[#00F2FF] overflow-hidden p-0.5">
        <img 
          src="https://picsum.photos/seed/docstudio/200" 
          alt="Profile" 
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    </div>
  );
};

// Hero Component
const Hero = () => {
  return (
    <div className="px-6 pt-12 pb-8 flex justify-between items-start">
      <div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[#00F2FF] font-orbitron text-sm font-bold tracking-widest mb-1"
        >
          WELCOME BACK
        </motion.h2>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white text-3xl font-orbitron font-extrabold"
        >
          Hello, Alex
        </motion.h1>
      </div>
      <ProfilePulse />
    </div>
  );
};

// SearchBar Component
const SearchBar = () => {
  return (
    <div className="px-6 mb-10">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#00F2FF] transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search tools..."
          className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00F2FF]/50 transition-all"
        />
      </div>
    </div>
  );
};

// GlassCard Component
const GlassCard: React.FC<{ 
  service: ServiceCardData; 
  onClick: (s: ServiceCardData) => void;
  layoutId: string;
}> = ({ service, onClick, layoutId }) => {
  return (
    <motion.div
      layoutId={layoutId}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(service)}
      className="relative cursor-pointer group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl -z-10" />
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 h-full flex flex-col justify-between transition-all group-hover:border-[#00F2FF]/50 group-hover:shadow-[0_0_20px_rgba(0,242,255,0.2)]">
        <div className={`p-3 rounded-2xl w-fit mb-4 bg-opacity-20 flex items-center justify-center`} style={{ backgroundColor: `${service.color}20` }}>
          <div style={{ color: service.color }}>
            {service.icon}
          </div>
        </div>
        <div>
          <h3 className="text-white font-orbitron font-bold text-lg mb-1">{service.title}</h3>
          <p className="text-gray-400 text-xs leading-relaxed">{service.description}</p>
        </div>
        <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '45%' }}
            className="h-full"
            style={{ backgroundColor: service.color }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// BottomNav Component
const BottomNav: React.FC<{ activeTab: AppRoute; setTab: (t: AppRoute) => void }> = ({ activeTab, setTab }) => {
  const tabs = [
    { id: AppRoute.HOME, icon: <Home size={22} />, label: 'Home' },
    { id: AppRoute.TOOLS, icon: <Wrench size={22} />, label: 'Tools' },
    { id: AppRoute.PROFILE, icon: <User size={22} />, label: 'Account' },
    { id: AppRoute.SETTINGS, icon: <Settings size={22} />, label: 'Setup' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md no-print z-40">
      <div className="bg-[#0B0D17]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 flex justify-around items-center shadow-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className="relative p-4 group"
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="nav-glow"
                className="absolute inset-0 bg-[#00F2FF]/10 rounded-2xl blur-md"
              />
            )}
            <div className={`relative z-10 transition-colors duration-300 ${activeTab === tab.id ? 'text-[#00F2FF]' : 'text-gray-500 group-hover:text-white'}`}>
              {tab.icon}
            </div>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="nav-dot"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00F2FF] rounded-full"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// ExpandedTool Component
const ExpandedTool: React.FC<{ service: ServiceCardData; onClose: () => void; onStartProject: () => void }> = ({ service, onClose, onStartProject }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#0B0D17]"
    >
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent" />
      </div>

      <div className="px-6 pt-14 pb-6 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:border-[#00F2FF]/50 transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-orbitron font-bold text-white">{service.title}</h2>
        <button className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white">
          <Bell size={24} />
        </button>
      </div>

      <div className="flex-1 px-6 overflow-y-auto pb-24">
        <motion.div 
          layoutId={`card-${service.id}`}
          className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 mb-8"
        >
          <div className="flex items-center gap-6 mb-8">
            <div className="p-5 rounded-3xl bg-opacity-20 flex items-center justify-center" style={{ backgroundColor: `${service.color}20`, color: service.color }}>
              {service.icon}
            </div>
            <div>
              <span className="text-xs text-[#00F2FF] font-orbitron font-bold tracking-widest block mb-1">ACTIVE TOOL</span>
              <h3 className="text-2xl font-orbitron font-bold text-white">{service.title}</h3>
            </div>
          </div>
          
          <p className="text-gray-300 leading-relaxed mb-8">
            Manage your {service.title.toLowerCase()} workspace with high-fidelity tools powered by DocStudio AI. 
            Create professional documents in minutes with futuristic templates.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={onStartProject}
              className="bg-[#00F2FF] text-[#0B0D17] font-bold py-4 px-6 rounded-2xl font-orbitron text-sm transition-all hover:scale-105"
            >
              NEW PROJECT
            </button>
            <button className="bg-white/5 border border-white/10 text-white font-bold py-4 px-6 rounded-2xl font-orbitron text-sm">
              TEMPLATES
            </button>
          </div>
        </motion.div>

        <div className="space-y-4">
          <h4 className="font-orbitron text-gray-400 text-xs tracking-widest uppercase">Recent Documents</h4>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="text-white text-sm font-medium">Document_{service.id}_00{i}.pdf</div>
                  <div className="text-gray-500 text-xs">Edited 2 hours ago</div>
                </div>
              </div>
              <div className="text-[#00F2FF] text-xs font-bold font-orbitron cursor-pointer">OPEN</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Generic Document Workspace Component (Dual-Pane)
const DocumentWorkspace: React.FC<{ 
  toolId: string; 
  onClose: () => void; 
  initialData?: any;
}> = ({ toolId, onClose, initialData }) => {
  // Document Type States
  const [cvData, setCvData] = useState<SouthAfricanCvData>(() => 
    toolId === '1' && initialData ? { ...initialCvData, ...initialData } : initialCvData
  );
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(() => 
    toolId === '2' && initialData ? { ...initialInvoiceData, ...initialData } : initialInvoiceData
  );
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>(() => 
    toolId === '3' && initialData ? { ...initialCoverLetterData, ...initialData } : initialCoverLetterData
  );
  const [quotationData, setQuotationData] = useState<QuotationData>(() => 
    toolId === '4' && initialData ? { ...initialQuotationData, ...initialData } : initialQuotationData
  );
  const [ndaData, setNdaData] = useState<NdaData>(() => 
    toolId === '5' && initialData ? { ...initialNdaData, ...initialData } : initialNdaData
  );

  // Workspace Local States
  const [jobCategory, setJobCategory] = useState<string>("Web Development");
  const [newSkill, setNewSkill] = useState<string>("");
  const [newLanguage, setNewLanguage] = useState<LanguageProficiency>({
    name: "", speakProficiency: "Fluent", writeProficiency: "Fluent"
  });

  // Accordion states
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    personal: true,
    contact: false,
    summary: false,
    experience: false,
    education: false,
    skills: false,
    references: false,
    // Invoice/Quote specific steps
    invoiceSender: true,
    invoiceInfo: false,
    invoiceItems: false,
    invoiceBank: false,
    // Cover Letter specific steps
    letterSender: true,
    letterRecipient: false,
    letterSubject: false,
    letterBody: false,
    // NDA specific steps
    ndaParties: true,
    ndaTerms: false
  });

  // Polishing loaders
  const [isSummaryPolishing, setIsSummaryPolishing] = useState<boolean>(false);
  const [polishingJobs, setPolishingJobs] = useState<{ [key: string]: boolean }>({});
  const [isLetterPolishing, setIsLetterPolishing] = useState<boolean>(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleWorkspaceImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      alert("Extracting document data from PDF... Please wait.");
      const text = await parsePdfText(file);
      const { toolId: parsedToolId, data } = parseDocumentText(text);

      if (parsedToolId !== toolId) {
        const toolNames: { [key: string]: string } = { '1': 'CV', '2': 'Invoice', '3': 'Cover Letter', '4': 'Quotation', '5': 'NDA' };
        alert(`This PDF appears to be a ${toolNames[parsedToolId] || 'unknown type'}, but you are in the ${toolNames[toolId]} workspace.`);
        return;
      }

      if (toolId === '1') setCvData(prev => ({ ...prev, ...data }));
      else if (toolId === '2') setInvoiceData(prev => ({ ...prev, ...data }));
      else if (toolId === '3') setCoverLetterData(prev => ({ ...prev, ...data }));
      else if (toolId === '4') setQuotationData(prev => ({ ...prev, ...data }));
      else if (toolId === '5') setNdaData(prev => ({ ...prev, ...data }));

      alert("Successfully loaded data into workspace!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to parse PDF.");
    }
  };

  // SA ID check
  const isIdValid = cvData.idNumber === "" || /^[0-9]{13}$/.test(cvData.idNumber);

  // Dynamic values helper for Invoice
  const calculateInvoiceTotals = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = subtotal * (invoiceData.taxRate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  // Dynamic values helper for Quotation
  const calculateQuoteTotals = () => {
    const total = quotationData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    return { total };
  };

  // Cover Letter AI Polish Simulated
  const handlePolishCoverLetter = () => {
    setIsLetterPolishing(true);
    setTimeout(() => {
      const company = coverLetterData.companyName || "your company";
      const title = coverLetterData.jobTitle || "Business Analyst";
      const name = coverLetterData.fullName || "Lindiwe Dlamini";
      const location = coverLetterData.currentLocation || "Gauteng";

      const polishedParagraphs = [
        `I am writing to formally submit my candidacy for the ${title} position at ${company}. With over four years of specialized experience in requirements analysis, systems modeling, and process engineering within the ${location} corporate sector, I am well-positioned to drive high-impact deliverables for your technical teams.`,
        `In my previous roles, I spearheaded multiple business process mapping initiatives, utilizing BPMN 2.0 and SQL. My strategic interventions led to a notable 15% reduction in transactional processing timelines and optimized system integration bottlenecks. I excel at translating complex client needs into robust technical frameworks and driving end-to-end User Acceptance Testing (UAT) in fast-paced Agile environments.`,
        `I am deeply drawn to ${company}'s market-leading projects and corporate growth mindset. I am confident that my technical qualifications, combined with a collaborative stakeholder management style, will make me a valuable addition to your project squads.`,
        `Thank you for reviewing my credentials. I welcome the opportunity to discuss my professional background and how my skills can contribute to the operational success at ${company} in a formal interview. Please find my professional credentials attached.`
      ];

      setCoverLetterData(prev => ({ ...prev, paragraphs: polishedParagraphs }));
      setIsLetterPolishing(false);
    }, 1000);
  };

  // Simulated AI Polish for CV Professional Summary
  const handlePolishSummary = () => {
    setIsSummaryPolishing(true);
    setTimeout(() => {
      let polishedText = "";
      switch (jobCategory) {
        case "Web Development":
          polishedText = "Highly analytical and detail-oriented Software Engineer with 4+ years of hands-on experience designing, developing, and deploying robust web applications. Proven success in modernizing legacy architectures, optimizing database performance, and building interactive, responsive frontends using React and Node.js. Passionate about driving technology-led solutions that align with corporate objectives.";
          break;
        case "Business Analysis":
          polishedText = "Dynamic and strategic Business Analyst with a strong background in process re-engineering and elicitation. Adept at translating high-level business goals into precise functional specifications, facilitating executive workshops, and leveraging data-driven dashboards to optimize operational efficiency and deliver high-impact banking solutions.";
          break;
        case "Administration":
          polishedText = "Organized and proactive Administrative Professional with extensive experience managing high-volume calendars, billing processes, and executive office workflows. Exceptional skill in customer relations, file organization, and cross-departmental coordination, ensuring flawless daily operations in demanding corporate environments.";
          break;
        case "Logistics":
          polishedText = "Efficiency-driven Logistics and Supply Chain Coordinator with expertise in inventory management, fleet routing, and warehouse optimization. Adept at using SAP and route-planning softwares to minimize transit bottlenecks, manage vendor relationships, and reduce delivery overhead by up to 18% year-on-year.";
          break;
        case "Retail":
          polishedText = "Dynamic and customer-focused Retail Representative with a strong background in product merchandising, stock inventory management, and POS transactions. Proven ability to meet monthly sales targets, upsell premium offerings, and resolve client complaints with professionalism and tact.";
          break;
        default:
          polishedText = "Dedicated, results-driven professional with a strong track record of operational excellence and project management. Skilled in analyzing complex issues, improving efficiency, and delivering high-quality client solutions.";
      }
      setCvData(prev => ({ ...prev, professionalSummary: polishedText }));
      setIsSummaryPolishing(false);
    }, 1000);
  };

  // Simulated AI Polish for Job Responsibilities
  const handlePolishJob = (jobId: string, jobTitle: string) => {
    setPolishingJobs(prev => ({ ...prev, [jobId]: true }));
    setTimeout(() => {
      let polishedText = "";
      const titleLower = jobTitle.toLowerCase();
      if (titleLower.includes("dev") || titleLower.includes("engineer") || titleLower.includes("program")) {
        polishedText = "- Spearheaded front-end optimization initiatives, improving loading speeds by 30% and overall application efficiency.\n- Collaborated within cross-functional Agile squads to design, build, and deploy secure microservices.\n- Authored comprehensive unit and integration test suites, achieving 92% coverage and enhancing system reliability.";
      } else if (titleLower.includes("analyst") || titleLower.includes("consultant")) {
        polishedText = "- Orchestrated requirements elicitation workshops with 10+ executive stakeholders to define project roadmaps.\n- Mapped 'as-is' and 'to-be' operational workflows using BPMN 2.0 standards, cutting process cycle times by 15%.\n- Delivered end-to-end user acceptance testing (UAT) scripts to guarantee zero-defect software deployments.";
      } else if (titleLower.includes("admin") || titleLower.includes("office") || titleLower.includes("clerk")) {
        polishedText = "- Streamlined office calendar scheduling and database entry processes, reducing administrative overhead by 20%.\n- Managed client billing, accounts payable, and weekly reconciliation reports with 100% accuracy.\n- Oversaw front-office operations and customer inquiry channels, maintaining a 98% client satisfaction rating.";
      } else if (titleLower.includes("logistics") || titleLower.includes("supply") || titleLower.includes("warehouse")) {
        polishedText = "- Optimized local delivery routes and fleet scheduling, saving 12% on fuel costs and improving dispatch times.\n- Managed warehouse inventory audits, resolving stock discrepancies and maintaining accuracy above 99.5%.\n- Directed inbound and outbound shipping operations, coordinating with multiple local freight carriers.";
      } else if (titleLower.includes("retail") || titleLower.includes("sales") || titleLower.includes("cashier")) {
        polishedText = "- Exceeded monthly store sales targets consistently by implementing strategic upselling and cross-selling techniques.\n- Managed visual merchandising layout and inventory restocking, enhancing shelf appeal and stock turnover.\n- Operated point-of-sale systems and resolved customer complaints promptly, ensuring repeat business.";
      } else {
        polishedText = "- Led daily operational tasks, ensuring strict compliance with company standards and delivery timelines.\n- Collaborated with internal teams to identify process bottlenecks and implement systemic improvements.\n- Prepared weekly performance reports for senior management review, identifying areas of growth.";
      }

      setCvData(prev => ({
        ...prev,
        workExperience: prev.workExperience.map(job => 
          job.id === jobId ? { ...job, responsibilities: polishedText } : job
        )
      }));
      setPolishingJobs(prev => ({ ...prev, [jobId]: false }));
    }, 1000);
  };

  // Form Renderers
  const renderCvForm = () => (
    <div className="space-y-6">
      {/* Step 1: Personal & Demographics */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('personal')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00F2FF]/10 text-[#00F2FF] rounded-xl"><User size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Personal & Demographics</h3>
              <p className="text-xs text-gray-400">SA identity, gender, and EE demographics</p>
            </div>
          </div>
          {expandedSections.personal ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.personal && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Full Name (As on ID/Passport)</label>
              <input type="text" value={cvData.fullName} onChange={(e) => setCvData(prev => ({ ...prev, fullName: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00F2FF]/50 transition-all" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Identification Document</label>
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                  <button type="button" onClick={() => setCvData(prev => ({ ...prev, useIdNumber: true }))} className={`flex-1 py-2 rounded-xl text-xs font-semibold font-orbitron transition-all ${cvData.useIdNumber ? 'bg-[#00F2FF] text-black' : 'text-gray-400 hover:text-white'}`}>SA ID CARD</button>
                  <button type="button" onClick={() => setCvData(prev => ({ ...prev, useIdNumber: false }))} className={`flex-1 py-2 rounded-xl text-xs font-semibold font-orbitron transition-all ${!cvData.useIdNumber ? 'bg-[#00F2FF] text-black' : 'text-gray-400 hover:text-white'}`}>PASSPORT</button>
                </div>
              </div>
              <div>
                {cvData.useIdNumber ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">South African ID Number</label>
                    <input type="text" maxLength={13} value={cvData.idNumber} onChange={(e) => setCvData(prev => ({ ...prev, idNumber: e.target.value }))} className={`w-full bg-white/5 border rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00F2FF]/50 transition-all ${isIdValid ? 'border-white/10' : 'border-yellow-500/50'}`} placeholder="YYMMDDSSSSCAZ" />
                    {!isIdValid && <p className="text-yellow-500 text-[10px] mt-1.5 flex items-center gap-1"><AlertCircle size={12} />SA ID must be exactly 13 digits.</p>}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">Passport Number</label>
                    <input type="text" value={cvData.passportNumber} onChange={(e) => setCvData(prev => ({ ...prev, passportNumber: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00F2FF]/50 transition-all" placeholder="e.g. A01234567" />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Gender (For EE Profiling)</label>
                <select value={cvData.gender} onChange={(e) => setCvData(prev => ({ ...prev, gender: e.target.value }))} className="w-full bg-[#0B0D17] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00F2FF]/50 transition-all">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Employment Equity (EE) Demographics</label>
                <select value={cvData.demographics} onChange={(e) => setCvData(prev => ({ ...prev, demographics: e.target.value }))} className="w-full bg-[#0B0D17] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00F2FF]/50 transition-all">
                  <option value="African">African</option>
                  <option value="Coloured">Coloured</option>
                  <option value="Indian">Indian</option>
                  <option value="White">White</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Permanent Resident">Permanent Resident</option>
                  <option value="Non-Citizen">Non-Citizen</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Driver's License Code</label>
                <select value={cvData.driversLicense} onChange={(e) => setCvData(prev => ({ ...prev, driversLicense: e.target.value }))} className="w-full bg-[#0B0D17] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00F2FF]/50 transition-all">
                  <option value="None">None</option>
                  <option value="Code 8 / B">Code 8 / B (Light Motor Vehicle)</option>
                  <option value="Code 10 / C1">Code 10 / C1 (Heavy Motor Vehicle)</option>
                  <option value="Code 14 / EC">Code 14 / EC (Heavy Articulated)</option>
                </select>
              </div>
              <div className="pt-5 flex items-center">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" checked={cvData.hasPdp} onChange={(e) => setCvData(prev => ({ ...prev, hasPdp: e.target.checked }))} className="sr-only" />
                  <div className={`w-6 h-6 border rounded-md transition-all flex items-center justify-center ${cvData.hasPdp ? 'bg-[#00F2FF] border-[#00F2FF]' : 'border-white/20 bg-white/5'}`}>
                    {cvData.hasPdp && <Check size={14} className="text-black font-extrabold" />}
                  </div>
                  <span className="text-xs font-medium text-gray-300">Has Professional Driving Permit (PrDP)</span>
                </label>
              </div>
            </div>
            {/* Languages Subform */}
            <div className="pt-2 border-t border-white/5">
              <h4 className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-2"><LanguagesIcon size={14} className="text-[#00F2FF]" />Languages Spoken</h4>
              <div className="space-y-3">
                {cvData.languages.map((lang, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-3">
                    <div className="text-xs">
                      <span className="font-bold text-white">{lang.name}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span>Speak: {lang.speakProficiency}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span>Write: {lang.writeProficiency}</span>
                    </div>
                    <button onClick={() => setCvData(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== index) }))} className="text-gray-500 hover:text-red-400 transition-colors p-1"><Trash2 size={14} /></button>
                  </div>
                ))}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <input type="text" placeholder="Language name" value={newLanguage.name} onChange={(e) => setNewLanguage(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                  <select value={newLanguage.speakProficiency} onChange={(e) => setNewLanguage(prev => ({ ...prev, speakProficiency: e.target.value }))} className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none">
                    <option value="Basic">Basic (Speak)</option>
                    <option value="Conversational">Conversational (Speak)</option>
                    <option value="Fluent">Fluent (Speak)</option>
                    <option value="Native">Native (Speak)</option>
                  </select>
                  <div className="flex gap-2">
                    <select value={newLanguage.writeProficiency} onChange={(e) => setNewLanguage(prev => ({ ...prev, writeProficiency: e.target.value }))} className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none">
                      <option value="Basic">Basic (Write)</option>
                      <option value="Intermediate">Intermediate (Write)</option>
                      <option value="Fluent">Fluent (Write)</option>
                    </select>
                    <button onClick={() => {
                      if (!newLanguage.name.trim()) return;
                      setCvData(prev => ({ ...prev, languages: [...prev.languages, newLanguage] }));
                      setNewLanguage({ name: "", speakProficiency: "Fluent", writeProficiency: "Fluent" });
                    }} className="bg-[#00F2FF] text-black font-bold p-2 rounded-xl text-xs hover:bg-[#00D2DD] transition-colors"><Plus size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Contact & Logistics */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('contact')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xl"><Clock size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Contact & Logistics</h3>
              <p className="text-xs text-gray-400">Phone, email, notice period, and location</p>
            </div>
          </div>
          {expandedSections.contact ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.contact && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={cvData.cellNumber} onChange={(e) => setCvData(prev => ({ ...prev, cellNumber: e.target.value }))} placeholder="Mobile Number" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none text-sm" />
              <input type="email" value={cvData.emailAddress} onChange={(e) => setCvData(prev => ({ ...prev, emailAddress: e.target.value }))} placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={cvData.linkedInUrl} onChange={(e) => setCvData(prev => ({ ...prev, linkedInUrl: e.target.value }))} placeholder="LinkedIn URL" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none text-sm" />
              <input type="text" value={cvData.currentLocation} onChange={(e) => setCvData(prev => ({ ...prev, currentLocation: e.target.value }))} placeholder="Location (City, Province)" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Notice Period</label>
              <select value={cvData.noticePeriod} onChange={(e) => setCvData(prev => ({ ...prev, noticePeriod: e.target.value }))} className="w-full bg-[#0B0D17] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00F2FF]/50 transition-all">
                <option value="Immediate">Immediate / Unemployed</option>
                <option value="2 Weeks">2 Weeks Notice</option>
                <option value="1 Calendar Month">1 Calendar Month</option>
                <option value="3 Months">3 Months Notice</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Professional Summary */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('summary')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F472B6]/10 text-[#F472B6] rounded-xl"><FileSignature size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Professional Summary</h3>
              <p className="text-xs text-gray-400">Brief overview of your career & expertise</p>
            </div>
          </div>
          {expandedSections.summary ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.summary && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-medium text-gray-300">Profile Summary</label>
              <button type="button" onClick={handlePolishSummary} disabled={isSummaryPolishing} className="flex items-center gap-1 text-xs font-bold text-[#00F2FF] bg-[#00F2FF]/10 border border-[#00F2FF]/20 rounded-xl py-1 px-3 hover:bg-[#00F2FF]/20 transition-all disabled:opacity-50">
                {isSummaryPolishing ? <span className="w-3 h-3 border-2 border-[#00F2FF] border-t-transparent rounded-full animate-spin"></span> : <Sparkles size={11} />}
                POLISH WITH AI
              </button>
            </div>
            <textarea rows={4} value={cvData.professionalSummary} onChange={(e) => setCvData(prev => ({ ...prev, professionalSummary: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none text-sm leading-relaxed" />
          </div>
        )}
      </div>

      {/* Step 4: Work Experience */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('experience')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#34D399]/10 text-[#34D399] rounded-xl"><Briefcase size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Work Experience</h3>
              <p className="text-xs text-gray-400">Reverse-chronological employment history</p>
            </div>
          </div>
          {expandedSections.experience ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.experience && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-6">
            {cvData.workExperience.map((job, index) => (
              <div key={job.id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase font-orbitron">Job Position #{index + 1}</h4>
                  <button onClick={() => setCvData(prev => ({ ...prev, workExperience: prev.workExperience.filter(j => j.id !== job.id) }))} className="text-gray-500 hover:text-red-400 transition-all flex items-center gap-1 text-xs"><Trash2 size={14} /> REMOVE</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={job.jobTitle} onChange={(e) => updateJob(job.id, 'jobTitle', e.target.value)} placeholder="Job Title" className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                  <input type="text" value={job.companyName} onChange={(e) => updateJob(job.id, 'companyName', e.target.value)} placeholder="Company Name" className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="text" value={job.location} onChange={(e) => updateJob(job.id, 'location', e.target.value)} placeholder="Location" className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                  <input type="text" value={job.startDate} onChange={(e) => updateJob(job.id, 'startDate', e.target.value)} placeholder="Start Date (MM/YYYY)" className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                  <input type="text" value={job.endDate} onChange={(e) => updateJob(job.id, 'endDate', e.target.value)} placeholder="End Date" className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-medium text-gray-400">Responsibilities</label>
                    <button type="button" onClick={() => handlePolishJob(job.id, job.jobTitle)} disabled={polishingJobs[job.id]} className="flex items-center gap-1 text-[10px] font-bold text-[#00F2FF] bg-[#00F2FF]/10 border border-[#00F2FF]/20 rounded-lg py-0.5 px-2 hover:bg-[#00F2FF]/20 transition-all disabled:opacity-50">
                      {polishingJobs[job.id] ? <span className="w-2.5 h-2.5 border-2 border-[#00F2FF] border-t-transparent rounded-full animate-spin"></span> : <Sparkles size={10} />}
                      POLISH ROLE
                    </button>
                  </div>
                  <textarea rows={4} value={job.responsibilities} onChange={(e) => updateJob(job.id, 'responsibilities', e.target.value)} className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono" placeholder="- Led development..." />
                </div>
              </div>
            ))}
            <button onClick={addJob} className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-xs font-bold text-gray-400 hover:text-[#00F2FF] hover:border-[#00F2FF]/50 transition-all flex items-center justify-center gap-2"><Plus size={16} /> ADD WORK EXPERIENCE</button>
          </div>
        )}
      </div>

      {/* Step 5: Education & Qualifications */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('education')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xl"><GraduationCap size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Education & Qualifications</h3>
              <p className="text-xs text-gray-400">Degrees, diplomas, and high school credentials</p>
            </div>
          </div>
          {expandedSections.education ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.education && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-6">
            {cvData.education.map((edu, index) => (
              <div key={edu.id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase font-orbitron">Qualification #{index + 1}</h4>
                  <button onClick={() => setCvData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== edu.id) }))} className="text-gray-500 hover:text-red-400 transition-all flex items-center gap-1 text-xs"><Trash2 size={14} /> REMOVE</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="text" value={edu.qualificationName} onChange={(e) => updateEducation(edu.id, 'qualificationName', e.target.value)} placeholder="Qualification Name" className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none md:col-span-2" />
                  <input type="text" value={edu.yearCompleted} onChange={(e) => updateEducation(edu.id, 'yearCompleted', e.target.value)} placeholder="Year Completed" className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                </div>
                <input type="text" value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} placeholder="Institution Name" className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              </div>
            ))}
            <button onClick={addEducation} className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-xs font-bold text-gray-400 hover:text-[#00F2FF] hover:border-[#00F2FF]/50 transition-all flex items-center justify-center gap-2"><Plus size={16} /> ADD QUALIFICATION</button>
          </div>
        )}
      </div>

      {/* Step 6: Skills & Suggested Tags */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('skills')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F472B6]/10 text-[#F472B6] rounded-xl"><Layers size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Skills & Job Category</h3>
              <p className="text-xs text-gray-400">Add industry skills and get recommendations</p>
            </div>
          </div>
          {expandedSections.skills ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.skills && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <div className="flex flex-wrap gap-2 min-h-[40px] bg-white/5 p-3 rounded-2xl border border-white/5">
              {cvData.skills.length === 0 ? <span className="text-xs text-gray-500 italic">No skills added yet.</span> : cvData.skills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-[#00F2FF]/10 text-[#00F2FF] border border-[#00F2FF]/20 rounded-full px-3 py-1 text-xs">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="text-[#00F2FF] hover:text-white transition-colors text-sm font-bold">&times;</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Type a skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()} className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              <button onClick={handleAddSkill} className="bg-[#00F2FF] text-black font-bold px-4 rounded-xl text-xs hover:bg-[#00D2DD]">ADD</button>
            </div>
            <div className="pt-2 border-t border-white/5 space-y-3">
              <select value={jobCategory} onChange={(e) => setJobCategory(e.target.value)} className="w-full bg-[#0B0D17] border border-white/10 rounded-2xl py-3 px-4 text-white text-xs">
                <option value="Web Development">Web Development</option>
                <option value="Business Analysis">Business Analysis</option>
                <option value="Administration">Administration</option>
                <option value="Logistics">Logistics</option>
                <option value="Retail">Retail</option>
              </select>
              <div className="flex flex-wrap gap-2">
                {suggestedSkillsMap[jobCategory]?.map((skill) => {
                  const isAdded = cvData.skills.includes(skill);
                  return (
                    <button key={skill} type="button" onClick={() => addSuggestedSkill(skill)} disabled={isAdded} className={`text-[10px] rounded-lg px-2 py-1 font-medium border transition-all ${isAdded ? 'bg-white/5 border-white/5 text-gray-600' : 'bg-white/5 border-white/10 text-gray-300 hover:border-[#00F2FF] hover:text-[#00F2FF]'}`}>+ {skill}</button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 7: References */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('references')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#34D399]/10 text-[#34D399] rounded-xl"><UserCheck size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Professional References</h3>
              <p className="text-xs text-gray-400">Min. 2 references required for SA compliance</p>
            </div>
          </div>
          {expandedSections.references ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.references && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-6">
            {cvData.references.length < 2 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-yellow-500 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>SA screening standards recommend a minimum of 2 professional reference contacts.</span>
              </div>
            )}
            {cvData.references.map((ref, index) => (
              <div key={ref.id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase font-orbitron">Reference #{index + 1}</h4>
                  <button onClick={() => setCvData(prev => ({ ...prev, references: prev.references.filter(r => r.id !== ref.id) }))} className="text-gray-500 hover:text-red-400 transition-all flex items-center gap-1 text-xs"><Trash2 size={14} /> REMOVE</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={ref.referenceName} onChange={(e) => updateReference(ref.id, 'referenceName', e.target.value)} placeholder="Full Name" className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                  <input type="text" value={ref.companyTitle} onChange={(e) => updateReference(ref.id, 'companyTitle', e.target.value)} placeholder="Company & Title" className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="text" value={ref.relationship} onChange={(e) => updateReference(ref.id, 'relationship', e.target.value)} placeholder="Relationship" className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                  <input type="email" value={ref.contactEmail} onChange={(e) => updateReference(ref.id, 'contactEmail', e.target.value)} placeholder="Email" className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                  <input type="text" value={ref.contactPhone} onChange={(e) => updateReference(ref.id, 'contactPhone', e.target.value)} placeholder="Phone" className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                </div>
              </div>
            ))}
            <button onClick={addReference} className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-xs font-bold text-gray-400 hover:text-[#00F2FF] hover:border-[#00F2FF]/50 transition-all flex items-center justify-center gap-2"><Plus size={16} /> ADD REFERENCE</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderInvoiceForm = () => (
    <div className="space-y-6">
      {/* Step 1: Sender & Client Details */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('invoiceSender')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xl"><Building size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Sender & Client Details</h3>
              <p className="text-xs text-gray-400">Company names, addresses, and contacts</p>
            </div>
          </div>
          {expandedSections.invoiceSender ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.invoiceSender && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <div className="border-b border-white/5 pb-4 space-y-3">
              <span className="block text-[10px] font-bold text-[#00F2FF] uppercase font-orbitron">YOUR DETAILS (SENDER)</span>
              <input type="text" value={invoiceData.companyName} onChange={(e) => setInvoiceData(prev => ({ ...prev, companyName: e.target.value }))} placeholder="Your Company/Trading Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={invoiceData.companyEmail} onChange={(e) => setInvoiceData(prev => ({ ...prev, companyEmail: e.target.value }))} placeholder="Billing Email" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                <input type="text" value={invoiceData.companyCell} onChange={(e) => setInvoiceData(prev => ({ ...prev, companyCell: e.target.value }))} placeholder="Contact Number" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              </div>
              <input type="text" value={invoiceData.companyAddress} onChange={(e) => setInvoiceData(prev => ({ ...prev, companyAddress: e.target.value }))} placeholder="Physical Address" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
            </div>

            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-[#8B5CF6] uppercase font-orbitron">CLIENT DETAILS (RECIPIENT)</span>
              <input type="text" value={invoiceData.clientName} onChange={(e) => setInvoiceData(prev => ({ ...prev, clientName: e.target.value }))} placeholder="Client Business Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={invoiceData.clientEmail} onChange={(e) => setInvoiceData(prev => ({ ...prev, clientEmail: e.target.value }))} placeholder="Client Email" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                <input type="text" value={invoiceData.clientCell} onChange={(e) => setInvoiceData(prev => ({ ...prev, clientCell: e.target.value }))} placeholder="Client Phone" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              </div>
              <input type="text" value={invoiceData.clientAddress} onChange={(e) => setInvoiceData(prev => ({ ...prev, clientAddress: e.target.value }))} placeholder="Client Address" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Invoice Metadata */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('invoiceInfo')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F472B6]/10 text-[#F472B6] rounded-xl"><CalendarDays size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Invoice Information</h3>
              <p className="text-xs text-gray-400">Invoice number, creation, and due dates</p>
            </div>
          </div>
          {expandedSections.invoiceInfo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.invoiceInfo && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Invoice Number</label>
                <input type="text" value={invoiceData.invoiceNumber} onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Invoice Date</label>
                <input type="text" value={invoiceData.invoiceDate} onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Due Date</label>
                <input type="text" value={invoiceData.dueDate} onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Line Items */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('invoiceItems')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#34D399]/10 text-[#34D399] rounded-xl"><Layers size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Services & Items</h3>
              <p className="text-xs text-gray-400">Add deliverables, quantities, and rates</p>
            </div>
          </div>
          {expandedSections.invoiceItems ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.invoiceItems && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <div className="space-y-3">
              {invoiceData.items.map((item) => (
                <div key={item.id} className="flex gap-2 items-center bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                  <input type="text" value={item.description} onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    items: prev.items.map(i => i.id === item.id ? { ...i, description: e.target.value } : i)
                  }))} placeholder="Item description" className="flex-1 bg-[#0B0D17] border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none" />
                  <input type="number" value={item.quantity} onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    items: prev.items.map(i => i.id === item.id ? { ...i, quantity: Math.max(1, parseInt(e.target.value) || 0) } : i)
                  }))} placeholder="Qty" className="w-16 bg-[#0B0D17] border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none" />
                  <input type="number" value={item.rate} onChange={(e) => setInvoiceData(prev => ({
                    ...prev,
                    items: prev.items.map(i => i.id === item.id ? { ...i, rate: Math.max(0, parseFloat(e.target.value) || 0) } : i)
                  }))} placeholder="Rate" className="w-24 bg-[#0B0D17] border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none" />
                  <button onClick={() => setInvoiceData(prev => ({
                    ...prev,
                    items: prev.items.filter(i => i.id !== item.id)
                  }))} className="text-gray-500 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => setInvoiceData(prev => ({
                ...prev,
                items: [...prev.items, { id: Date.now().toString(), description: "", quantity: 1, rate: 0 }]
              }))} className="w-full py-2 border border-dashed border-white/10 rounded-xl text-[10px] font-bold text-gray-400 hover:text-[#00F2FF] hover:border-[#00F2FF]/30 transition-all flex items-center justify-center gap-1.5"><Plus size={12} /> ADD LINE ITEM</button>
            </div>
            
            <div className="pt-2 border-t border-white/5">
              <label className="block text-[10px] text-gray-400 mb-1">South African VAT Rate (%)</label>
              <select value={invoiceData.taxRate} onChange={(e) => setInvoiceData(prev => ({ ...prev, taxRate: parseInt(e.target.value) }))} className="w-full bg-[#0B0D17] border border-white/10 rounded-2xl py-3 px-4 text-white text-xs">
                <option value="15">15% Standard VAT</option>
                <option value="0">0% VAT Exempt</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Step 4: Banking Details */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('invoiceBank')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#34D399]/10 text-[#34D399] rounded-xl"><CreditCard size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Banking Details</h3>
              <p className="text-xs text-gray-400">Payment settlement information</p>
            </div>
          </div>
          {expandedSections.invoiceBank ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.invoiceBank && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={invoiceData.bankName} onChange={(e) => setInvoiceData(prev => ({ ...prev, bankName: e.target.value }))} placeholder="Bank Name (e.g. FNB)" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              <input type="text" value={invoiceData.accountHolder} onChange={(e) => setInvoiceData(prev => ({ ...prev, accountHolder: e.target.value }))} placeholder="Account Holder Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={invoiceData.accountNumber} onChange={(e) => setInvoiceData(prev => ({ ...prev, accountNumber: e.target.value }))} placeholder="Account Number" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              <input type="text" value={invoiceData.branchCode} onChange={(e) => setInvoiceData(prev => ({ ...prev, branchCode: e.target.value }))} placeholder="Branch Code" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCoverLetterForm = () => (
    <div className="space-y-6">
      {/* Step 1: Candidate Contact Info */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('letterSender')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00F2FF]/10 text-[#00F2FF] rounded-xl"><User size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Your Profile Contact</h3>
              <p className="text-xs text-gray-400">Your email, cell, and LinkedIn info</p>
            </div>
          </div>
          {expandedSections.letterSender ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.letterSender && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <input type="text" value={coverLetterData.fullName} onChange={(e) => setCoverLetterData(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Your Full Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={coverLetterData.emailAddress} onChange={(e) => setCoverLetterData(prev => ({ ...prev, emailAddress: e.target.value }))} placeholder="Your Email" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              <input type="text" value={coverLetterData.cellNumber} onChange={(e) => setCoverLetterData(prev => ({ ...prev, cellNumber: e.target.value }))} placeholder="Your Mobile Number" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={coverLetterData.linkedInUrl} onChange={(e) => setCoverLetterData(prev => ({ ...prev, linkedInUrl: e.target.value }))} placeholder="LinkedIn URL" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              <input type="text" value={coverLetterData.currentLocation} onChange={(e) => setCoverLetterData(prev => ({ ...prev, currentLocation: e.target.value }))} placeholder="Your Location (City, Province)" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Employer Details */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('letterRecipient')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xl"><Building size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Employer Details</h3>
              <p className="text-xs text-gray-400">Recipient name, company name, address</p>
            </div>
          </div>
          {expandedSections.letterRecipient ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.letterRecipient && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={coverLetterData.recipientName} onChange={(e) => setCoverLetterData(prev => ({ ...prev, recipientName: e.target.value }))} placeholder="Hiring Manager/Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              <input type="text" value={coverLetterData.recipientTitle} onChange={(e) => setCoverLetterData(prev => ({ ...prev, recipientTitle: e.target.value }))} placeholder="Recipient Job Title (e.g. HR Lead)" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={coverLetterData.companyName} onChange={(e) => setCoverLetterData(prev => ({ ...prev, companyName: e.target.value }))} placeholder="Company / Institution Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              <input type="text" value={coverLetterData.date} onChange={(e) => setCoverLetterData(prev => ({ ...prev, date: e.target.value }))} placeholder="Letter Date" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
            </div>
            <input type="text" value={coverLetterData.companyAddress} onChange={(e) => setCoverLetterData(prev => ({ ...prev, companyAddress: e.target.value }))} placeholder="Company Address" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
          </div>
        )}
      </div>

      {/* Step 3: Job Title */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('letterSubject')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F472B6]/10 text-[#F472B6] rounded-xl"><FileTextIcon size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Target Position</h3>
              <p className="text-xs text-gray-400">Position applied for</p>
            </div>
          </div>
          {expandedSections.letterSubject ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.letterSubject && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5">
            <input type="text" value={coverLetterData.jobTitle} onChange={(e) => setCoverLetterData(prev => ({ ...prev, jobTitle: e.target.value }))} placeholder="Job Title / Code" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
          </div>
        )}
      </div>

      {/* Step 4: Body Paragraphs */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('letterBody')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#34D399]/10 text-[#34D399] rounded-xl"><FileSignature size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Letter Content</h3>
              <p className="text-xs text-gray-400">Write or AI-compose the letter paragraphs</p>
            </div>
          </div>
          {expandedSections.letterBody ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.letterBody && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 font-medium">Compose Paragraphs</span>
              <button type="button" onClick={handlePolishCoverLetter} disabled={isLetterPolishing} className="flex items-center gap-1.5 text-xs font-bold text-[#00F2FF] bg-[#00F2FF]/10 border border-[#00F2FF]/20 rounded-xl py-1.5 px-3 hover:bg-[#00F2FF]/20 transition-all disabled:opacity-50">
                {isLetterPolishing ? <span className="w-3 h-3 border-2 border-[#00F2FF] border-t-transparent rounded-full animate-spin"></span> : <Sparkles size={12} />}
                COMPOSE WITH AI
              </button>
            </div>
            {coverLetterData.paragraphs.map((p, idx) => (
              <div key={idx}>
                <label className="block text-[10px] text-gray-400 mb-1">Paragraph {idx + 1}</label>
                <textarea rows={3} value={p} onChange={(e) => {
                  const updated = [...coverLetterData.paragraphs];
                  updated[idx] = e.target.value;
                  setCoverLetterData(prev => ({ ...prev, paragraphs: updated }));
                }} className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none leading-relaxed" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderQuotationForm = () => (
    <div className="space-y-6">
      {/* Step 1: Provider & Client */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('invoiceSender')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xl"><Building size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Parties & Contacts</h3>
              <p className="text-xs text-gray-400">Provider and client details</p>
            </div>
          </div>
          {expandedSections.invoiceSender ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.invoiceSender && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <div className="border-b border-white/5 pb-4 space-y-3">
              <span className="block text-[10px] font-bold text-[#00F2FF] uppercase font-orbitron">SERVICE PROVIDER</span>
              <input type="text" value={quotationData.providerName} onChange={(e) => setQuotationData(prev => ({ ...prev, providerName: e.target.value }))} placeholder="Your Business/Trading Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={quotationData.providerEmail} onChange={(e) => setQuotationData(prev => ({ ...prev, providerEmail: e.target.value }))} placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                <input type="text" value={quotationData.providerPhone} onChange={(e) => setQuotationData(prev => ({ ...prev, providerPhone: e.target.value }))} placeholder="Contact Phone" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              </div>
              <input type="text" value={quotationData.providerAddress} onChange={(e) => setQuotationData(prev => ({ ...prev, providerAddress: e.target.value }))} placeholder="Physical Address" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
            </div>

            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-[#8B5CF6] uppercase font-orbitron">CLIENT DETAILS</span>
              <input type="text" value={quotationData.clientName} onChange={(e) => setQuotationData(prev => ({ ...prev, clientName: e.target.value }))} placeholder="Client Business Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={quotationData.clientEmail} onChange={(e) => setQuotationData(prev => ({ ...prev, clientEmail: e.target.value }))} placeholder="Client Email" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
                <input type="text" value={quotationData.clientPhone} onChange={(e) => setQuotationData(prev => ({ ...prev, clientPhone: e.target.value }))} placeholder="Client Phone" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              </div>
              <input type="text" value={quotationData.clientAddress} onChange={(e) => setQuotationData(prev => ({ ...prev, clientAddress: e.target.value }))} placeholder="Client Address" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Quote Info */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('invoiceInfo')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F472B6]/10 text-[#F472B6] rounded-xl"><CalendarDays size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Quotation Info</h3>
              <p className="text-xs text-gray-400">Quote number, dates, and validity</p>
            </div>
          </div>
          {expandedSections.invoiceInfo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.invoiceInfo && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Quote Number</label>
                <input type="text" value={quotationData.quoteNumber} onChange={(e) => setQuotationData(prev => ({ ...prev, quoteNumber: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Quote Date</label>
                <input type="text" value={quotationData.quoteDate} onChange={(e) => setQuotationData(prev => ({ ...prev, quoteDate: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Valid Until</label>
                <input type="text" value={quotationData.validUntil} onChange={(e) => setQuotationData(prev => ({ ...prev, validUntil: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Pricing Items */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('invoiceItems')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#34D399]/10 text-[#34D399] rounded-xl"><Layers size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Itemized Quotation</h3>
              <p className="text-xs text-gray-400">List deliverables and rates</p>
            </div>
          </div>
          {expandedSections.invoiceItems ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.invoiceItems && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <div className="space-y-3">
              {quotationData.items.map((item) => (
                <div key={item.id} className="flex gap-2 items-center bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                  <input type="text" value={item.description} onChange={(e) => setQuotationData(prev => ({
                    ...prev,
                    items: prev.items.map(i => i.id === item.id ? { ...i, description: e.target.value } : i)
                  }))} placeholder="Deliverable description" className="flex-1 bg-[#0B0D17] border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none" />
                  <input type="number" value={item.quantity} onChange={(e) => setQuotationData(prev => ({
                    ...prev,
                    items: prev.items.map(i => i.id === item.id ? { ...i, quantity: Math.max(1, parseInt(e.target.value) || 0) } : i)
                  }))} placeholder="Qty" className="w-16 bg-[#0B0D17] border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none" />
                  <input type="number" value={item.rate} onChange={(e) => setQuotationData(prev => ({
                    ...prev,
                    items: prev.items.map(i => i.id === item.id ? { ...i, rate: Math.max(0, parseFloat(e.target.value) || 0) } : i)
                  }))} placeholder="Rate" className="w-24 bg-[#0B0D17] border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none" />
                  <button onClick={() => setQuotationData(prev => ({
                    ...prev,
                    items: prev.items.filter(i => i.id !== item.id)
                  }))} className="text-gray-500 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => setQuotationData(prev => ({
                ...prev,
                items: [...prev.items, { id: Date.now().toString(), description: "", quantity: 1, rate: 0 }]
              }))} className="w-full py-2 border border-dashed border-white/10 rounded-xl text-[10px] font-bold text-gray-400 hover:text-[#00F2FF] hover:border-[#00F2FF]/30 transition-all flex items-center justify-center gap-1.5"><Plus size={12} /> ADD QUOTE ITEM</button>
            </div>
          </div>
        )}
      </div>

      {/* Step 4: Terms & Conditions */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('invoiceBank')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#34D399]/10 text-[#34D399] rounded-xl"><FileSignature size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Terms & Conditions</h3>
              <p className="text-xs text-gray-400">Payment terms and service rules</p>
            </div>
          </div>
          {expandedSections.invoiceBank ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.invoiceBank && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5">
            <textarea rows={4} value={quotationData.termsAndConditions} onChange={(e) => setQuotationData(prev => ({ ...prev, termsAndConditions: e.target.value }))} className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
          </div>
        )}
      </div>
    </div>
  );

  const renderNdaForm = () => (
    <div className="space-y-6">
      {/* Step 1: Parties */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('ndaParties')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xl"><Building size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Contracting Parties</h3>
              <p className="text-xs text-gray-400">Entities signing the agreement</p>
            </div>
          </div>
          {expandedSections.ndaParties ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.ndaParties && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <div>
              <label className="block text-xs text-gray-300 mb-1.5">Disclosing Party (Shares Info)</label>
              <input type="text" value={ndaData.disclosingParty} onChange={(e) => setNdaData(prev => ({ ...prev, disclosingParty: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1.5">Receiving Party (Receives Info)</label>
              <input type="text" value={ndaData.receivingParty} onChange={(e) => setNdaData(prev => ({ ...prev, receivingParty: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-xs focus:outline-none" />
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Terms */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <button onClick={() => toggleSection('ndaTerms')} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#34D399]/10 text-[#34D399] rounded-xl"><Clock size={20} /></div>
            <div>
              <h3 className="font-orbitron font-bold text-white">Agreement Scope</h3>
              <p className="text-xs text-gray-400">Start dates, purpose, and governing laws</p>
            </div>
          </div>
          {expandedSections.ndaTerms ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {expandedSections.ndaTerms && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Effective Date</label>
                <input type="text" value={ndaData.effectiveDate} onChange={(e) => setNdaData(prev => ({ ...prev, effectiveDate: e.target.value }))} className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Confidentiality Term</label>
                <input type="text" value={ndaData.confidentialityPeriod} onChange={(e) => setNdaData(prev => ({ ...prev, confidentialityPeriod: e.target.value }))} className="w-full bg-[#0B0D17] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1.5">Governing Jurisdiction</label>
              <input type="text" value={ndaData.governingLaw} onChange={(e) => setNdaData(prev => ({ ...prev, governingLaw: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1.5">Agreement Purpose</label>
              <textarea rows={3} value={ndaData.purpose} onChange={(e) => setNdaData(prev => ({ ...prev, purpose: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-xs focus:outline-none leading-relaxed" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderActiveForm = () => {
    switch (toolId) {
      case '1': return renderCvForm();
      case '2': return renderInvoiceForm();
      case '3': return renderCoverLetterForm();
      case '4': return renderQuotationForm();
      case '5': return renderNdaForm();
      default: return null;
    }
  };

  // Preview Renderers
  const renderCvPreview = () => (
    <>
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-slate-800">
        <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">{cvData.fullName || "YOUR FULL NAME"}</h1>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-slate-600 mt-1.5 text-xs">
          {cvData.cellNumber && <span className="flex items-center gap-1"><Phone size={10} /> {cvData.cellNumber}</span>}
          {cvData.emailAddress && <span className="flex items-center gap-1"><Mail size={10} /> {cvData.emailAddress}</span>}
          {cvData.linkedInUrl && <span className="flex items-center gap-1"><Linkedin size={10} /> {cvData.linkedInUrl}</span>}
          {cvData.currentLocation && <span className="flex items-center gap-1"><MapPin size={10} /> {cvData.currentLocation}</span>}
        </div>
      </div>

      {/* Personal Details & EE Metrics */}
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100">
        <div>
          <strong>{cvData.useIdNumber ? "National ID Number" : "Passport Number"}:</strong> {cvData.useIdNumber ? (cvData.idNumber || "Not specified") : (cvData.passportNumber || "Not specified")}
        </div>
        <div>
          <strong>Employment Equity (EE):</strong> {cvData.demographics} ({cvData.gender})
        </div>
        <div>
          <strong>Driver's License:</strong> {cvData.driversLicense} {cvData.hasPdp ? "(PrDP Certified)" : ""}
        </div>
        <div>
          <strong>Notice Period:</strong> {cvData.noticePeriod}
        </div>
      </div>

      {/* Professional Profile */}
      {cvData.professionalSummary && (
        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">PROFESSIONAL SUMMARY</h2>
          <p className="text-xs text-slate-700 text-justify leading-relaxed whitespace-pre-line">{cvData.professionalSummary}</p>
        </div>
      )}

      {/* Languages List */}
      {cvData.languages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">LANGUAGES</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
            {cvData.languages.map((lang, i) => (
              <span key={i}>
                <strong>{lang.name}</strong> (Spoken: {lang.speakProficiency} | Written: {lang.writeProficiency})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {cvData.workExperience.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">EMPLOYMENT HISTORY</h2>
          <div className="space-y-3.5">
            {cvData.workExperience.map((job) => (
              <div key={job.id} className="text-xs">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900">{job.jobTitle || "Job Title"}</h3>
                  <span className="font-medium text-slate-700 whitespace-nowrap">{job.startDate || "Start Date"} — {job.endDate || "End Date"}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 italic mb-1">
                  <span>{job.companyName || "Company Name"}</span>
                  <span>{job.location || "Location"}</span>
                </div>
                {job.responsibilities && (
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {job.responsibilities.split('\n').map((line, idx) => {
                      const cleanLine = line.replace(/^[-\*\u2022]\s*/, '').trim();
                      if (!cleanLine) return null;
                      return <li key={idx} className="text-justify leading-relaxed">{cleanLine}</li>;
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {cvData.education.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">EDUCATION & QUALIFICATIONS</h2>
          <div className="space-y-2">
            {cvData.education.map((edu) => (
              <div key={edu.id} className="text-xs">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{edu.qualificationName || "Qualification Title"}</span>
                  <span className="font-medium text-slate-700">{edu.yearCompleted || "Year Completed"}</span>
                </div>
                <div className="text-slate-600 italic">{edu.institution || "Institution / School"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Skills */}
      {cvData.skills.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">KEY CORE COMPETENCIES</h2>
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-700">
            {cvData.skills.map((skill, idx) => (
              <span key={idx}>
                {skill}{idx < cvData.skills.length - 1 ? ' • ' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* References */}
      {cvData.references.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-0.5 mb-1.5">PROFESSIONAL REFERENCES</h2>
          <div className="grid grid-cols-2 gap-4">
            {cvData.references.map((ref) => (
              <div key={ref.id} className="text-xs text-slate-700 leading-normal bg-slate-50 border border-slate-100 p-2 rounded">
                <div className="font-bold text-slate-900">{ref.referenceName || "Reference Name"}</div>
                <div className="text-slate-600">{ref.companyTitle || "Company Title"}</div>
                <div className="mt-1 text-slate-500">
                  <div><strong>Phone:</strong> {ref.contactPhone || "Not specified"}</div>
                  <div><strong>Email:</strong> {ref.contactEmail || "Not specified"}</div>
                  <div><strong>Relation:</strong> {ref.relationship || "Not specified"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderInvoicePreview = () => {
    const { subtotal, tax, total } = calculateInvoiceTotals();
    return (
      <div className="flex flex-col h-full justify-between">
        <div>
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">TAX INVOICE</h1>
              <span className="text-slate-500 font-medium text-xs">INVOICE NO: {invoiceData.invoiceNumber || "INV-001"}</span>
            </div>
            <div className="text-right text-xs text-slate-600">
              <strong className="text-slate-800 block text-sm">{invoiceData.companyName || "Your Company Name"}</strong>
              <div>{invoiceData.companyEmail}</div>
              <div>{invoiceData.companyCell}</div>
              <div className="max-w-[200px] mt-1 ml-auto text-[10px] leading-tight">{invoiceData.companyAddress}</div>
            </div>
          </div>

          {/* Client & Dates Info */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-b border-slate-200 pb-4 text-xs">
            <div>
              <span className="text-slate-500 font-bold block mb-1 font-sans text-[10px]">BILLED TO:</span>
              <strong className="text-slate-800 block">{invoiceData.clientName || "Client Name"}</strong>
              <div>{invoiceData.clientEmail}</div>
              <div>{invoiceData.clientCell}</div>
              <div className="max-w-[200px] mt-1 text-[10px] leading-tight text-slate-500">{invoiceData.clientAddress}</div>
            </div>
            <div className="text-right space-y-1">
              <div><strong>Invoice Date:</strong> {invoiceData.invoiceDate}</div>
              <div><strong>Payment Due:</strong> {invoiceData.dueDate}</div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mt-8 text-xs text-left">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500 font-bold font-sans text-[10px]">
                <th className="py-2">DESCRIPTION</th>
                <th className="py-2 text-center w-12">QTY</th>
                <th className="py-2 text-right w-24">RATE (ZAR)</th>
                <th className="py-2 text-right w-24">TOTAL (ZAR)</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 text-slate-800">
                  <td className="py-3 pr-4">{item.description || "Unnamed Deliverable"}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">R {item.rate.toFixed(2)}</td>
                  <td className="py-3 text-right font-bold">R {(item.quantity * item.rate).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div className="mt-8 flex justify-end">
            <div className="w-64 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">R {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span>VAT ({invoiceData.taxRate}%):</span>
                <span className="font-semibold text-slate-900">R {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-950 pt-1">
                <span>TOTAL DUE:</span>
                <span>R {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Banking Settlement Section */}
        {(invoiceData.bankName || invoiceData.accountNumber) && (
          <div className="mt-8 border-t border-slate-300 pt-4 bg-slate-50 p-4 rounded border">
            <h3 className="font-bold text-slate-900 text-xs font-sans mb-1.5">PAYMENT INSTRUCTIONS</h3>
            <div className="grid grid-cols-2 gap-2 text-slate-600 text-[10px] leading-relaxed">
              <div><strong>Bank Name:</strong> {invoiceData.bankName}</div>
              <div><strong>Account Holder:</strong> {invoiceData.accountHolder}</div>
              <div><strong>Account Number:</strong> {invoiceData.accountNumber}</div>
              <div><strong>Branch Code:</strong> {invoiceData.branchCode}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCoverLetterPreview = () => (
    <div className="flex flex-col h-full justify-between text-xs text-slate-800 leading-relaxed">
      <div>
        {/* Candidate Info Header */}
        <div className="pb-4 border-b border-slate-200 mb-6">
          <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">{coverLetterData.fullName}</h1>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600 mt-1 text-[10px]">
            {coverLetterData.cellNumber && <span>{coverLetterData.cellNumber}</span>}
            {coverLetterData.emailAddress && <span>{coverLetterData.emailAddress}</span>}
            {coverLetterData.linkedInUrl && <span>{coverLetterData.linkedInUrl}</span>}
            {coverLetterData.currentLocation && <span>{coverLetterData.currentLocation}</span>}
          </div>
        </div>

        {/* Date & Recipient */}
        <div className="space-y-4 mb-8">
          <div>{coverLetterData.date}</div>
          <div className="leading-tight text-slate-700">
            <strong className="text-slate-900 block">{coverLetterData.recipientName}</strong>
            <div className="italic">{coverLetterData.recipientTitle}</div>
            <div>{coverLetterData.companyName}</div>
            <div className="text-[10px] text-slate-500 max-w-[250px] mt-0.5">{coverLetterData.companyAddress}</div>
          </div>
        </div>

        {/* Subject */}
        <div className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-400 pb-1 mb-8">
          RE: APPLICATION FOR THE POSITION OF {coverLetterData.jobTitle || "POSITION"}
        </div>

        {/* Salutation */}
        <div className="mb-8">Dear {coverLetterData.recipientName || "Hiring Manager"},</div>

        {/* Paragraphs */}
        <div className="space-y-4 text-justify">
          {coverLetterData.paragraphs.map((p, idx) => (
            <p key={idx} className="whitespace-pre-line">{p}</p>
          ))}
        </div>
      </div>

      {/* Sign-off */}
      <div className="mt-8 pt-4 border-t border-slate-100">
        <div>Sincerely,</div>
        <div className="font-bold text-slate-900 mt-6 text-sm">{coverLetterData.fullName}</div>
      </div>
    </div>
  );

  const renderQuotationPreview = () => {
    const { total } = calculateQuoteTotals();
    return (
      <div className="flex flex-col h-full justify-between">
        <div>
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">PRICE QUOTATION</h1>
              <span className="text-slate-500 font-medium text-xs">QUOTE NO: {quotationData.quoteNumber || "QT-001"}</span>
            </div>
            <div className="text-right text-xs text-slate-600">
              <strong className="text-slate-800 block text-sm">{quotationData.providerName || "Service Provider"}</strong>
              <div>{quotationData.providerEmail}</div>
              <div>{quotationData.providerPhone}</div>
              <div className="max-w-[200px] mt-1 ml-auto text-[10px] leading-tight">{quotationData.providerAddress}</div>
            </div>
          </div>

          {/* Client & Date Info */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-b border-slate-200 pb-4 text-xs">
            <div>
              <span className="text-slate-500 font-bold block mb-1 font-sans text-[10px]">QUOTED TO:</span>
              <strong className="text-slate-800 block">{quotationData.clientName || "Client Name"}</strong>
              <div>{quotationData.clientEmail}</div>
              <div>{quotationData.clientPhone}</div>
              <div className="max-w-[200px] mt-1 text-[10px] leading-tight text-slate-500">{quotationData.clientAddress}</div>
            </div>
            <div className="text-right space-y-1">
              <div><strong>Quote Date:</strong> {quotationData.quoteDate}</div>
              <div><strong>Valid Until:</strong> {quotationData.validUntil}</div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mt-8 text-xs text-left">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500 font-bold font-sans text-[10px]">
                <th className="py-2">DESCRIPTION</th>
                <th className="py-2 text-center w-12">QTY</th>
                <th className="py-2 text-right w-24">UNIT RATE (ZAR)</th>
                <th className="py-2 text-right w-24">AMOUNT (ZAR)</th>
              </tr>
            </thead>
            <tbody>
              {quotationData.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 text-slate-800">
                  <td className="py-3 pr-4">{item.description || "Service Item"}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">R {item.rate.toFixed(2)}</td>
                  <td className="py-3 text-right font-bold">R {(item.quantity * item.rate).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Block */}
          <div className="mt-8 flex justify-end">
            <div className="w-64 text-xs border-t border-slate-300 pt-2 flex justify-between text-sm font-bold text-slate-950">
              <span>ESTIMATED TOTAL:</span>
              <span>R {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Terms and conditions */}
        {quotationData.termsAndConditions && (
          <div className="mt-8 border-t border-slate-200 pt-4 text-slate-500 text-[9px] leading-normal whitespace-pre-line">
            <strong className="text-slate-800 block text-[10px] mb-1 font-sans">TERMS & CONDITIONS:</strong>
            {quotationData.termsAndConditions}
          </div>
        )}
      </div>
    );
  };

  const renderNdaPreview = () => (
    <div className="text-xs text-slate-800 leading-relaxed text-justify flex flex-col justify-between h-full font-serif">
      <div>
        <h1 className="text-base font-bold text-center text-slate-950 mb-6 uppercase tracking-wide font-sans">Mutual Non-Disclosure Agreement</h1>
        <p className="mb-4">
          This Mutual Non-Disclosure Agreement ("Agreement") is entered into and made effective as of <strong>{ndaData.effectiveDate || "[Effective Date]"}</strong> ("Effective Date"), by and between:
        </p>
        <div className="pl-4 border-l-2 border-slate-300 space-y-1 mb-4 italic">
          <div><strong>{ndaData.disclosingParty || "[Disclosing Party]"}</strong>, and</div>
          <div><strong>{ndaData.receivingParty || "[Receiving Party]"}</strong></div>
        </div>
        <p className="mb-4">
          Hereinafter referred to individually as a "Party" and collectively as the "Parties".
        </p>

        <h3 className="font-bold text-slate-950 mt-8 mb-1 uppercase font-sans text-[10px]">1. PURPOSE</h3>
        <p className="mb-4">
          The Parties wish to disclose to each other certain confidential, proprietary, and commercial secrets for the sole purpose of: <strong className="font-serif">{ndaData.purpose || "[Purpose description]"}</strong>.
        </p>

        <h3 className="font-bold text-slate-950 mt-8 mb-1 uppercase font-sans text-[10px]">2. CONFIDENTIAL INFORMATION</h3>
        <p className="mb-4">
          "Confidential Information" refers to any financial, technical, software code, databases, diagrams, designs, or business operations information marked as confidential or that should reasonably be understood to be confidential under the circumstances.
        </p>

        <h3 className="font-bold text-slate-950 mt-8 mb-1 uppercase font-sans text-[10px]">3. CONFIDENTIALITY PERIOD</h3>
        <p className="mb-4">
          The Receiving Party agrees to hold all disclosed Confidential Information in strict secrecy and not disclose it to any third parties for a period of <strong>{ndaData.confidentialityPeriod || "3 Years"}</strong> from the Effective Date, unless written consent is provided by the Disclosing Party.
        </p>

        <h3 className="font-bold text-slate-950 mt-8 mb-1 uppercase font-sans text-[10px]">4. GOVERNING LAW</h3>
        <p className="mb-4">
          This Agreement, its interpretation, and any disputes arising from it shall be governed exclusively by the laws of the <strong>{ndaData.governingLaw || "Republic of South Africa"}</strong>.
        </p>
      </div>

      {/* Signature blocks */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="grid grid-cols-2 gap-8 text-[10px] leading-normal font-sans">
          <div>
            <div className="font-bold border-b border-slate-300 pb-1 mb-6 text-slate-900 uppercase">For Disclosing Party</div>
            <div className="space-y-1 text-slate-600">
              <div>Signature: _______________________</div>
              <div>Name: {ndaData.disclosingParty}</div>
              <div>Date: {ndaData.effectiveDate}</div>
            </div>
          </div>
          <div>
            <div className="font-bold border-b border-slate-300 pb-1 mb-6 text-slate-900 uppercase">For Receiving Party</div>
            <div className="space-y-1 text-slate-600">
              <div>Signature: _______________________</div>
              <div>Name: {ndaData.receivingParty}</div>
              <div>Date: {ndaData.effectiveDate}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivePreview = () => {
    switch (toolId) {
      case '1': return renderCvPreview();
      case '2': return renderInvoicePreview();
      case '3': return renderCoverLetterPreview();
      case '4': return renderQuotationPreview();
      case '5': return renderNdaPreview();
      default: return null;
    }
  };

  const getToolTitle = () => {
    switch (toolId) {
      case '1': return { main: "DocStudio", tag: "ATS & EE Optimized", sub: "South African Professional CV Builder" };
      case '2': return { main: "Invoice Builder", tag: "VAT Ready", sub: "Professional Tax Invoice Generator" };
      case '3': return { main: "Cover Letter", tag: "AI Optimized", sub: "Persuasive Business Application Builder" };
      case '4': return { main: "Quote Creator", tag: "Itemized Details", sub: "Instant Pricing Quotation Creator" };
      case '5': return { main: "NDA Generator", tag: "Legally Compliant", sub: "Mutual Non-Disclosure Agreement Creator" };
      default: return { main: "DocStudio", tag: "Document Suite", sub: "Professional Document Builder" };
    }
  };

  const titleInfo = getToolTitle();

  // Skill tag add/removes helpers
  const handleAddSkill = () => {
    if (newSkill.trim() && !cvData.skills.includes(newSkill.trim())) {
      setCvData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill("");
    }
  };

  const addSuggestedSkill = (skill: string) => {
    if (!cvData.skills.includes(skill)) {
      setCvData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setCvData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  // Job helpers
  const addJob = () => {
    const newJob: JobExperience = {
      id: Date.now().toString(), jobTitle: "", companyName: "", location: "", startDate: "", endDate: "", responsibilities: ""
    };
    setCvData(prev => ({ ...prev, workExperience: [...prev.workExperience, newJob] }));
  };

  const updateJob = (id: string, field: keyof JobExperience, value: string) => {
    setCvData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(j => j.id === id ? { ...j, [field]: value } : j)
    }));
  };

  // Education helpers
  const addEducation = () => {
    const newEdu: EducationQualification = {
      id: Date.now().toString(), qualificationName: "", institution: "", yearCompleted: ""
    };
    setCvData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const updateEducation = (id: string, field: keyof EducationQualification, value: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  // Reference helpers
  const addReference = () => {
    const newRef: ReferenceContact = {
      id: Date.now().toString(), referenceName: "", companyTitle: "", contactEmail: "", contactPhone: "", relationship: ""
    };
    setCvData(prev => ({ ...prev, references: [...prev.references, newRef] }));
  };

  const updateReference = (id: string, field: keyof ReferenceContact, value: string) => {
    setCvData(prev => ({
      ...prev,
      references: prev.references.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  return (
    <div id="cv-builder-workspace" className="min-h-screen bg-[#0B0D17] text-white flex flex-col">
      {/* Top Action Bar */}
      <header className="no-print bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:border-[#00F2FF]/50 transition-all flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
              {titleInfo.main} <span className="text-xs px-2 py-0.5 bg-[#00F2FF]/20 text-[#00F2FF] rounded-md font-sans">{titleInfo.tag}</span>
            </h1>
            <p className="text-xs text-gray-400">{titleInfo.sub}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            id="workspace-pdf-upload" 
            accept=".pdf" 
            onChange={handleWorkspaceImport} 
            className="hidden" 
          />
          <button 
            onClick={() => document.getElementById('workspace-pdf-upload')?.click()} 
            className="bg-white/5 border border-white/10 text-white font-bold py-3 px-6 rounded-2xl font-orbitron text-sm transition-all hover:bg-white/10 flex items-center gap-2 scale-100 hover:scale-105 active:scale-95"
          >
            <Upload size={18} />
            IMPORT PDF
          </button>
          <button onClick={() => window.print()} className="bg-gradient-to-r from-[#00F2FF] to-[#8B5CF6] text-black font-bold py-3 px-6 rounded-2xl font-orbitron text-sm transition-all hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] flex items-center gap-2 scale-100 hover:scale-105 active:scale-95">
            <Printer size={18} />
            PRINT / SAVE PDF
          </button>
        </div>
      </header>

      {/* Main Two-Pane Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 max-w-7xl mx-auto w-full h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Left Pane: Form Inputs */}
        <div className="no-print col-span-1 lg:col-span-7 h-full overflow-y-auto pr-2 no-scrollbar pb-24 space-y-6">
          {renderActiveForm()}
        </div>

        {/* Right Pane: Sticky Live Preview */}
        <div className="col-span-1 lg:col-span-5 h-full flex flex-col justify-start items-center overflow-y-auto pb-24 pr-1 scrollbar-thin">
          <div className="w-full text-center mb-3 no-print">
            <span className="text-xs text-gray-500 font-orbitron uppercase tracking-widest">LIVE PAPER PREVIEW (A4)</span>
          </div>

          <div id="cv-preview-page-container" className="w-full flex justify-center p-2 rounded-2xl bg-white/5 border border-white/10 overflow-auto">
            {/* The printable A4 sheet */}
            <div 
              id="document-preview-page" 
              className="bg-white text-slate-800 shadow-2xl rounded-sm w-[100%] max-w-[700px] border border-gray-200"
              style={{ minHeight: '297mm', fontSize: '9.5pt', lineHeight: '1.4', padding: 0 }}
            >
              <div 
                className="document-layout-container flex flex-col justify-between h-full min-h-[inherit]"
                style={{ padding: '2.5rem 3rem', boxSizing: 'border-box' }}
              >
                {renderActivePreview()}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppRoute>(AppRoute.HOME);
  const [selectedService, setSelectedService] = useState<ServiceCardData | null>(null);
  const [isWorkspaceActive, setIsWorkspaceActive] = useState<boolean>(false);
  const [activeToolId, setActiveToolId] = useState<string>('1');
  const [initialData, setInitialData] = useState<any>(null);

  const handleImportPdfClick = () => {
    document.getElementById('dashboard-pdf-upload')?.click();
  };

  const handleDashboardPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      alert("Extracting document data from PDF... Please wait.");
      const text = await parsePdfText(file);
      const { toolId, data } = parseDocumentText(text);

      setActiveToolId(toolId);
      setInitialData(data);
      setIsWorkspaceActive(true);
      alert("Successfully loaded data from PDF!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to parse PDF. Please ensure it is a valid DocStudio PDF.");
    }
  };

  const services: ServiceCardData[] = [
    { id: '1', title: 'CV Builder', description: 'ATS & EE optimized South African CVs', icon: <FileText size={28} />, color: '#00F2FF' },
    { id: '2', title: 'Tax Invoice', description: 'Professional invoicing for client gigs', icon: <Receipt size={28} />, color: '#8B5CF6' },
    { id: '3', title: 'Cover Letter', description: 'Persuasive AI-assisted cover letters', icon: <FileSignature size={28} />, color: '#F472B6' },
    { id: '4', title: 'Quotation', description: 'Instant itemized pricing quotations', icon: <Layers size={28} />, color: '#34D399' },
    { id: '5', title: 'NDA Generator', description: 'Legally compliant non-disclosure agreements', icon: <UserCheck size={28} />, color: '#FBBF24' }
  ];

  const handleStartProject = () => {
    if (selectedService) {
      setActiveToolId(selectedService.id);
      setIsWorkspaceActive(true);
      setSelectedService(null);
    }
  };

  if (isWorkspaceActive) {
    return (
      <DocumentWorkspace 
        toolId={activeToolId} 
        initialData={initialData} 
        onClose={() => {
          setIsWorkspaceActive(false);
          setInitialData(null);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <BackgroundOrbs />
      
      <main className="max-w-4xl mx-auto">
        <Hero />
        
        <SearchBar />

        <div className="px-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-orbitron font-bold text-xl">Service Hub</h2>
            <button className="text-[#00F2FF] text-xs font-bold font-orbitron tracking-widest font-sans">VIEW ALL</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {services.map((service) => (
              <GlassCard 
                key={service.id} 
                service={service} 
                onClick={setSelectedService}
                layoutId={`card-${service.id}`}
              />
            ))}

            {/* Premium Import PDF Card to balance the 3-column grid */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleImportPdfClick}
              className="relative cursor-pointer group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl -z-10" />
              <div className="bg-[#10B981]/5 backdrop-blur-2xl border border-[#10B981]/20 rounded-3xl p-6 h-full flex flex-col justify-between transition-all group-hover:border-[#10B981]/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <div className="p-3 rounded-2xl w-fit mb-4 bg-[#10B981]/15 flex items-center justify-center text-[#10B981]">
                  <Upload size={28} />
                </div>
                <div>
                  <h3 className="text-white font-orbitron font-bold text-lg mb-1">Import PDF</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">Upload and edit a previously generated document</p>
                </div>
                <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[100%] bg-[#10B981]" />
                </div>
              </div>
            </motion.div>
            
            <input 
              type="file" 
              id="dashboard-pdf-upload" 
              accept=".pdf" 
              onChange={handleDashboardPdfUpload} 
              className="hidden" 
            />
          </div>
        </div>

        <div className="px-6 mt-12">
          <div className="bg-gradient-to-r from-[#8B5CF6]/20 to-[#00F2FF]/20 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-white font-orbitron font-extrabold text-2xl mb-2">Upgrade to Pro</h3>
              <p className="text-gray-300 text-sm mb-6 max-w-[240px]">Get unlimited exports and AI design assistance for only $4.99/mo.</p>
              <button className="bg-white text-black font-bold py-3 px-8 rounded-xl font-orbitron text-xs shadow-lg">LEARN MORE</button>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 bg-[#00F2FF]/20 rounded-full blur-3xl" />
          </div>
        </div>
      </main>

      <BottomNav activeTab={activeTab} setTab={setActiveTab} />

      <AnimatePresence>
        {selectedService && (
          <ExpandedTool 
            service={selectedService} 
            onClose={() => setSelectedService(null)} 
            onStartProject={handleStartProject}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;

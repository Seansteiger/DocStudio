import { VaultDocument, VaultSnapshot } from '../../types/vault';
import { AnyDocumentData } from '../../types/document';
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
  sampleReceiptData 
} from '../../data/samplePresets';

const STORAGE_KEY = 'docstudio_vault_v2';
const SNAPSHOTS_KEY = 'docstudio_snapshots_v2';

export class VaultService {
  public getAllDocuments(): VaultDocument[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Initialize with realistic seed docs
        const initialDocs = this.getInitialSeedDocs();
        this.saveAllDocuments(initialDocs);
        return initialDocs;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse vault documents:", e);
      return this.getInitialSeedDocs();
    }
  }

  public saveAllDocuments(docs: VaultDocument[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }

  public saveDocument(
    toolId: string,
    title: string,
    data: AnyDocumentData,
    templateId: string = 'default',
    existingId?: string,
    atsScore?: number
  ): VaultDocument {
    const docs = this.getAllDocuments();
    const now = new Date().toISOString();

    if (existingId) {
      const index = docs.findIndex(d => d.id === existingId);
      if (index >= 0) {
        docs[index] = {
          ...docs[index],
          title,
          data,
          templateId,
          updatedAt: now,
          version: (docs[index].version || 1) + 1,
          atsScore: atsScore !== undefined ? atsScore : docs[index].atsScore
        };
        this.saveAllDocuments(docs);
        this.createSnapshot(docs[index].id, `Auto-saved v${docs[index].version}`, data);
        return docs[index];
      }
    }

    const newDoc: VaultDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      toolId,
      title: title || `Document ${new Date().toLocaleDateString()}`,
      subtitle: this.getSubtitleForTool(toolId, data),
      category: this.getCategoryForTool(toolId),
      createdAt: now,
      updatedAt: now,
      version: 1,
      status: 'draft',
      tags: [this.getCategoryForTool(toolId)],
      templateId,
      data,
      atsScore
    };

    docs.unshift(newDoc);
    this.saveAllDocuments(docs);
    this.createSnapshot(newDoc.id, "Initial Draft", data);
    return newDoc;
  }

  public deleteDocument(id: string): void {
    const docs = this.getAllDocuments().filter(d => d.id !== id);
    this.saveAllDocuments(docs);
  }

  public duplicateDocument(id: string): VaultDocument | null {
    const docs = this.getAllDocuments();
    const target = docs.find(d => d.id === id);
    if (!target) return null;

    const dup: VaultDocument = {
      ...target,
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: `${target.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      status: 'draft'
    };

    docs.unshift(dup);
    this.saveAllDocuments(docs);
    return dup;
  }

  public createSnapshot(documentId: string, label: string, data: AnyDocumentData): void {
    try {
      const allSnapshots: VaultSnapshot[] = JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || '[]');
      const snap: VaultSnapshot = {
        id: `snap-${Date.now()}`,
        documentId,
        timestamp: new Date().toISOString(),
        label,
        data
      };
      allSnapshots.unshift(snap);
      // Keep max 50 snapshots
      if (allSnapshots.length > 50) allSnapshots.pop();
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(allSnapshots));
    } catch (e) {
      console.error("Failed to save snapshot:", e);
    }
  }

  public getSnapshots(documentId: string): VaultSnapshot[] {
    try {
      const allSnapshots: VaultSnapshot[] = JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || '[]');
      return allSnapshots.filter(s => s.documentId === documentId);
    } catch (e) {
      return [];
    }
  }

  private getCategoryForTool(toolId: string): string {
    switch (toolId) {
      case '1': case '3': case '6': return 'Career';
      case '2': case '4': case '10': return 'Finance';
      case '5': case '7': case '8': return 'Legal';
      case '9': return 'Credentials';
      default: return 'General';
    }
  }

  private getSubtitleForTool(toolId: string, data: any): string {
    if (toolId === '1') return (data as any)?.fullName ? `${(data as any).fullName} (CV)` : 'ATS Resume';
    if (toolId === '2') return (data as any)?.invoiceNumber ? `Invoice #${(data as any).invoiceNumber}` : 'Tax Invoice';
    if (toolId === '3') return (data as any)?.companyName ? `Cover Letter to ${(data as any).companyName}` : 'Cover Letter';
    if (toolId === '4') return (data as any)?.quoteNumber ? `Quote #${(data as any).quoteNumber}` : 'Quotation';
    if (toolId === '5') return (data as any)?.receivingParty ? `NDA with ${(data as any).receivingParty}` : 'Non-Disclosure Agreement';
    if (toolId === '6') return (data as any)?.companyName ? `Resignation from ${(data as any).companyName}` : 'Resignation Letter';
    if (toolId === '7') return (data as any)?.clientCompany ? `Contract with ${(data as any).clientCompany}` : 'Freelance Contract';
    if (toolId === '8') return (data as any)?.referenceNumber ? `Notice ${(data as any).referenceNumber}` : 'Official Corporate Notice';
    if (toolId === '9') return (data as any)?.recipientName ? `Certificate for ${(data as any).recipientName}` : 'Certificate of Achievement';
    if (toolId === '10') return (data as any)?.receiptNumber ? `Receipt #${(data as any).receiptNumber}` : 'Payment Receipt';
    return 'Document';
  }

  private getInitialSeedDocs(): VaultDocument[] {
    const now = new Date().toISOString();
    return [
      {
        id: 'seed-1',
        toolId: '1',
        title: 'Senior Cloud Engineer Resume',
        subtitle: 'Lindiwe Nomvula Dlamini (CV)',
        category: 'Career',
        createdAt: now,
        updatedAt: now,
        version: 1,
        status: 'final',
        tags: ['Career', 'Tech', 'ATS 95'],
        templateId: 'modern-tech',
        data: sampleCvData,
        atsScore: 95
      },
      {
        id: 'seed-2',
        toolId: '2',
        title: 'Commercial Tax Invoice - BlueHorizon',
        subtitle: 'Invoice #INV-2026-0842',
        category: 'Finance',
        createdAt: now,
        updatedAt: now,
        version: 1,
        status: 'final',
        tags: ['Finance', 'VAT', 'Settled'],
        templateId: 'corporate-modern',
        data: sampleInvoiceData
      },
      {
        id: 'seed-3',
        toolId: '5',
        title: 'Mutual NDA - NovaTech AI',
        subtitle: 'NDA with Horizon Enterprise',
        category: 'Legal',
        createdAt: now,
        updatedAt: now,
        version: 1,
        status: 'draft',
        tags: ['Legal', 'Confidentiality'],
        templateId: 'standard-legal',
        data: sampleNdaData
      }
    ];
  }
}

export const vaultService = new VaultService();

/**
 * billingService.ts
 * Unified Zoho-Style Relational Storage & Business Logic Engine for DocStudio
 * 
 * Implements 4 core tables persisted in localStorage:
 * 1. clients (BillingClient)
 * 2. catalog_items (CatalogItem)
 * 3. organization_settings (OrganizationSettings)
 * 4. documents (UnifiedBillingData) & payments (BillingPayment)
 * 
 * Features atomic sequential counters, immutable client snapshots,
 * quote-to-invoice conversions, payment recording with receipt generation,
 * and cloning.
 */

export interface BillingClient {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  billingAddress: string;
  vatNumber?: string;
  createdAt: string;
}

export interface CatalogItem {
  id: string;
  title: string;
  sku: string;
  description: string;
  unitPrice: number;
  taxRate: number; // e.g. 15 for 15% VAT
  unit: string;    // e.g. 'Hours', 'Fixed', 'Day', 'Item', 'Sprint', 'Month'
}

export interface OrganizationSettings {
  companyName: string;
  tagline: string;
  logoUrl: string;
  accentColor: string; // e.g. '#059669' (Emerald)
  email: string;
  phone: string;
  address: string;
  vatNumber: string;
  regNumber: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  paymentTerms: string;
  quoteCounter: number;
  invoiceCounter: number;
  receiptCounter: number;
}

export interface BillingLineItem {
  id: string;
  catalogItemId?: string;
  description: string;
  details?: string;
  quantity: number;
  unitPrice: number;
  discountPct?: number;
  taxRate?: number; // 15 or 0
  unit?: string;
}

export type PaymentMethod = 'EFT' | 'Card' | 'Cash' | 'PayFast' | 'Yoco' | 'Ozow';

export interface BillingPayment {
  id: string;
  documentId: string;
  receiptNumber: string; // e.g. 'REC-0089'
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  reference: string;
  notes?: string;
}

export interface ClientSnapshot {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  billingAddress: string;
  vatNumber?: string;
}

export type BillingDocType = 'quote' | 'invoice' | 'receipt';
export type BillingDocStatus = 'draft' | 'sent' | 'accepted' | 'converted' | 'partial' | 'paid' | 'void';

export interface UnifiedBillingData {
  id: string;
  docType: BillingDocType;
  docNumber: string; // e.g. 'QUO-0104', 'INV-0218', 'REC-0089'
  title?: string;
  status: BillingDocStatus;
  clientId: string;
  clientSnapshot: ClientSnapshot;
  issueDate: string;
  dueDate: string;
  validUntil?: string; // used for quotes
  lineItems: BillingLineItem[];
  vatRate: number; // default 15
  discountAmount: number;
  currency: string; // default 'ZAR'
  currencySymbol: string; // default 'R'
  amountPaid: number;
  balanceDue: number;
  subtotal: number;
  vatTotal: number;
  grandTotal: number;
  payments: BillingPayment[];
  parentQuoteId?: string;
  parentQuoteNumber?: string;
  linkedInvoiceNumber?: string;
  notes?: string;
  termsAndConditions?: string;
  depositRequiredPercent?: number; // for quotes (e.g. 50%)
  receivedByName?: string; // for receipts
  paymentMethod?: PaymentMethod | string;
  receiptReference?: string;
  templateId?: string;
  brandOverrides?: Partial<OrganizationSettings>;
  createdAt: string;
  updatedAt: string;

  // Flattened aliases for cross-compatibility with legacy InvoiceData / QuotationData / ReceiptData
  companyName?: string;
  companyEmail?: string;
  companyCell?: string;
  companyAddress?: string;
  companyVatNumber?: string;
  companyLogoUrl?: string;
  clientName?: string;
  clientEmail?: string;
  clientCell?: string;
  clientAddress?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  items?: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    discountPercent?: number;
    unit?: string;
  }>;
  taxRate?: number;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  branchCode?: string;
  paymentTermsNotes?: string;
  quoteNumber?: string;
  quoteDate?: string;
  providerName?: string;
  providerEmail?: string;
  providerPhone?: string;
  providerAddress?: string;
  receiptNumber?: string;
  receiptDate?: string;
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  payerName?: string;
  payerContact?: string;
  paymentFor?: string;
  referenceTransactionId?: string;
}

// Storage Keys
const CLIENTS_KEY = 'docstudio_billing_clients';
const CATALOG_KEY = 'docstudio_billing_catalog';
const SETTINGS_KEY = 'docstudio_billing_settings';
const DOCUMENTS_KEY = 'docstudio_billing_docs';

// Realistic South African Seed Data
export const DEFAULT_ORG_SETTINGS: OrganizationSettings = {
  companyName: "Apex Cloud Solutions (Pty) Ltd",
  tagline: "Enterprise Cloud Architecture & Digital Systems",
  logoUrl: "",
  accentColor: "#059669", // Emerald Green
  email: "accounts@apexcloud.co.za",
  phone: "+27 (0) 11 883 4000",
  address: "Floor 14, Sandton City Office Towers, 5th Street, Sandton, 2196, South Africa",
  vatNumber: "4920194812",
  regNumber: "2019/148209/07",
  bankName: "First National Bank (FNB)",
  accountHolder: "Apex Cloud Solutions Pty Ltd",
  accountNumber: "62891048291",
  branchCode: "250655",
  accountType: "Business Cheque Account",
  paymentTerms: "Payment due strictly within 14 calendar days of tax invoice date. EFT payments must cite invoice number as payment reference.",
  quoteCounter: 104,
  invoiceCounter: 218,
  receiptCounter: 89
};

export const SEED_CLIENTS: BillingClient[] = [
  {
    id: "cli-1",
    name: "BlueHorizon Logistics Group (Pty) Ltd",
    contactPerson: "Thabo Mokoena (Procurement Director)",
    email: "procurement@bluehorizon.co.za",
    phone: "+27 82 555 9012",
    billingAddress: "88 Harbour Road, Foreshore, Cape Town, 8001",
    vatNumber: "4820194881",
    createdAt: "2026-01-15T08:00:00Z"
  },
  {
    id: "cli-2",
    name: "Vanguard Wealth Management",
    contactPerson: "Sarah van der Merwe (Chief Operations Officer)",
    email: "operations@vanguardwealth.co.za",
    phone: "+27 11 784 3200",
    billingAddress: "Tower 2, Katherine Street, Sandton, 2196",
    vatNumber: "4019284729",
    createdAt: "2026-02-10T10:30:00Z"
  },
  {
    id: "cli-3",
    name: "Kagiso Renewable Energy Ltd",
    contactPerson: "Dr. Kagiso Molefe",
    email: "finance@kagisoenergy.co.za",
    phone: "+27 31 301 9920",
    billingAddress: "14 Umhlanga Rocks Drive, Durban, 4320",
    vatNumber: "4550198273",
    createdAt: "2026-03-01T14:15:00Z"
  }
];

export const SEED_CATALOG_ITEMS: CatalogItem[] = [
  {
    id: "cat-1",
    title: "Cloud Architecture Audit & Security Review",
    sku: "AUD-CLOUD-01",
    description: "Comprehensive AWS/GCP infrastructure review, IAM vulnerability assessment, and ISO 27001 readiness.",
    unitPrice: 38500,
    taxRate: 15,
    unit: "Fixed"
  },
  {
    id: "cat-2",
    title: "Dedicated Agile Sprint (Full-Stack Squad)",
    sku: "ENG-SPRINT-02",
    description: "Two-week delivery sprint: React 19, TypeScript, microservices APIs and automated unit test suite.",
    unitPrice: 65000,
    taxRate: 15,
    unit: "Sprint"
  },
  {
    id: "cat-3",
    title: "Interactive UI/UX Design System & Prototypes",
    sku: "DSGN-SYS-03",
    description: "Figma tokenized component library, WCAG AA contrast audit, and responsive mobile/desktop specifications.",
    unitPrice: 42000,
    taxRate: 15,
    unit: "Milestone"
  },
  {
    id: "cat-4",
    title: "Payment Gateway & Webhook Microservice",
    sku: "INT-PAY-04",
    description: "Secure PayFast / Peach / Yoco checkout integration with webhook verification and tamper-evident event logging.",
    unitPrice: 28000,
    taxRate: 15,
    unit: "Fixed"
  },
  {
    id: "cat-5",
    title: "Monthly Managed SLA & DevOps Retainer",
    sku: "RET-DEVOPS-05",
    description: "24/7 uptime monitoring, automated backup drills, zero-downtime container deployments and priority hotline.",
    unitPrice: 18500,
    taxRate: 15,
    unit: "Month"
  }
];

class BillingService {
  // -------------------------------------------------------------
  // Organization Settings CRUD & Atomic Counters
  // -------------------------------------------------------------
  public getSettings(): OrganizationSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        this.saveSettings(DEFAULT_ORG_SETTINGS);
        return DEFAULT_ORG_SETTINGS;
      }
      return { ...DEFAULT_ORG_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_ORG_SETTINGS;
    }
  }

  public saveSettings(settings: OrganizationSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save organization settings:", e);
    }
  }

  public getNextDocNumber(docType: BillingDocType, increment: boolean = true): string {
    const settings = this.getSettings();
    let counter = 1;
    let prefix = 'DOC';

    switch (docType) {
      case 'quote':
        counter = settings.quoteCounter || 101;
        prefix = 'QUO';
        if (increment) {
          settings.quoteCounter = counter + 1;
          this.saveSettings(settings);
        }
        break;
      case 'invoice':
        counter = settings.invoiceCounter || 201;
        prefix = 'INV';
        if (increment) {
          settings.invoiceCounter = counter + 1;
          this.saveSettings(settings);
        }
        break;
      case 'receipt':
        counter = settings.receiptCounter || 51;
        prefix = 'REC';
        if (increment) {
          settings.receiptCounter = counter + 1;
          this.saveSettings(settings);
        }
        break;
    }

    const padded = String(counter).padStart(4, '0');
    return `${prefix}-${padded}`;
  }

  // -------------------------------------------------------------
  // Clients CRUD
  // -------------------------------------------------------------
  public getClients(): BillingClient[] {
    try {
      const raw = localStorage.getItem(CLIENTS_KEY);
      if (!raw) {
        this.saveClients(SEED_CLIENTS);
        return SEED_CLIENTS;
      }
      return JSON.parse(raw);
    } catch {
      return SEED_CLIENTS;
    }
  }

  public saveClients(clients: BillingClient[]): void {
    try {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    } catch (e) {
      console.error("Failed to save clients:", e);
    }
  }

  public getClientById(id: string): BillingClient | undefined {
    return this.getClients().find(c => c.id === id);
  }

  public upsertClient(client: Omit<BillingClient, 'id' | 'createdAt'> & { id?: string }): BillingClient {
    const clients = this.getClients();
    const now = new Date().toISOString();

    if (client.id) {
      const index = clients.findIndex(c => c.id === client.id);
      if (index >= 0) {
        const updated: BillingClient = {
          ...clients[index],
          ...client,
          id: client.id
        };
        clients[index] = updated;
        this.saveClients(clients);
        return updated;
      }
    }

    const newClient: BillingClient = {
      ...client,
      id: `cli-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now
    };
    clients.unshift(newClient);
    this.saveClients(clients);
    return newClient;
  }

  public deleteClient(id: string): void {
    const clients = this.getClients().filter(c => c.id !== id);
    this.saveClients(clients);
  }

  // -------------------------------------------------------------
  // Catalog Items CRUD
  // -------------------------------------------------------------
  public getCatalogItems(): CatalogItem[] {
    try {
      const raw = localStorage.getItem(CATALOG_KEY);
      if (!raw) {
        this.saveCatalogItems(SEED_CATALOG_ITEMS);
        return SEED_CATALOG_ITEMS;
      }
      return JSON.parse(raw);
    } catch {
      return SEED_CATALOG_ITEMS;
    }
  }

  public saveCatalogItems(items: CatalogItem[]): void {
    try {
      localStorage.setItem(CATALOG_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save catalog items:", e);
    }
  }

  public upsertCatalogItem(item: Omit<CatalogItem, 'id'> & { id?: string }): CatalogItem {
    const items = this.getCatalogItems();
    if (item.id) {
      const idx = items.findIndex(i => i.id === item.id);
      if (idx >= 0) {
        const updated: CatalogItem = { ...items[idx], ...item, id: item.id };
        items[idx] = updated;
        this.saveCatalogItems(items);
        return updated;
      }
    }
    const newItem: CatalogItem = {
      ...item,
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    items.unshift(newItem);
    this.saveCatalogItems(items);
    return newItem;
  }

  public deleteCatalogItem(id: string): void {
    const items = this.getCatalogItems().filter(i => i.id !== id);
    this.saveCatalogItems(items);
  }

  // -------------------------------------------------------------
  // Financial Math & Calculations
  // -------------------------------------------------------------
  public calculateTotals(
    lineItems: BillingLineItem[],
    vatRate: number = 15,
    discountAmount: number = 0,
    payments: BillingPayment[] = []
  ): {
    subtotal: number;
    vatTotal: number;
    grandTotal: number;
    amountPaid: number;
    balanceDue: number;
  } {
    let subtotal = 0;
    let computedVat = 0;

    for (const item of lineItems) {
      const itemGross = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      const discount = item.discountPct ? itemGross * (item.discountPct / 100) : 0;
      const itemNet = Math.max(0, itemGross - discount);
      subtotal += itemNet;

      const rate = item.taxRate !== undefined ? item.taxRate : vatRate;
      if (rate > 0) {
        computedVat += itemNet * (rate / 100);
      }
    }

    const netSubtotal = Math.max(0, subtotal - (Number(discountAmount) || 0));
    // If discount was applied to the whole doc, scale VAT proportionally
    const finalVat = subtotal > 0 ? (computedVat * (netSubtotal / subtotal)) : 0;
    const grandTotal = Math.round((netSubtotal + finalVat) * 100) / 100;

    const amountPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const balanceDue = Math.max(0, Math.round((grandTotal - amountPaid) * 100) / 100);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      vatTotal: Math.round(finalVat * 100) / 100,
      grandTotal,
      amountPaid: Math.round(amountPaid * 100) / 100,
      balanceDue
    };
  }

  public formatCurrency(amount: number, currency: string = 'ZAR'): string {
    const symbol = currency === 'ZAR' ? 'R' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : `${currency} `;
    const num = Math.abs(amount || 0).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${symbol} ${num}`;
  }

  // -------------------------------------------------------------
  // Billing Documents CRUD
  // -------------------------------------------------------------
  public getAllBillingDocuments(): UnifiedBillingData[] {
    try {
      const raw = localStorage.getItem(DOCUMENTS_KEY);
      if (!raw) {
        const initial = [this.createSeedInvoice()];
        this.saveAllBillingDocuments(initial);
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      return [this.createSeedInvoice()];
    }
  }

  public saveAllBillingDocuments(docs: UnifiedBillingData[]): void {
    try {
      localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
    } catch (e) {
      console.error("Failed to save billing documents:", e);
    }
  }

  public getBillingDocumentById(id: string): UnifiedBillingData | undefined {
    return this.getAllBillingDocuments().find(d => d.id === id);
  }

  public saveBillingDocument(doc: UnifiedBillingData): UnifiedBillingData {
    const docs = this.getAllBillingDocuments();
    const now = new Date().toISOString();

    // Recalculate totals to guarantee integrity
    const totals = this.calculateTotals(
      doc.lineItems || [],
      doc.vatRate !== undefined ? doc.vatRate : 15,
      doc.discountAmount || 0,
      doc.payments || []
    );

    // Sync legacy/flattened fields for full backwards-compatibility
    const settings = this.getSettings();
    const client = doc.clientSnapshot;

    const enrichedDoc: UnifiedBillingData = {
      ...doc,
      ...totals,
      updatedAt: now,
      // Flattened aliases for legacy templates/canvases
      companyName: settings.companyName,
      companyEmail: settings.email,
      companyCell: settings.phone,
      companyAddress: settings.address,
      companyVatNumber: settings.vatNumber,
      companyLogoUrl: settings.logoUrl,
      clientName: client?.name || '',
      clientEmail: client?.email || '',
      clientCell: client?.phone || '',
      clientAddress: client?.billingAddress || '',
      invoiceNumber: doc.docNumber,
      invoiceDate: doc.issueDate,
      taxRate: doc.vatRate,
      bankName: settings.bankName,
      accountHolder: settings.accountHolder,
      accountNumber: settings.accountNumber,
      branchCode: settings.branchCode,
      paymentTermsNotes: doc.termsAndConditions || settings.paymentTerms,
      quoteNumber: doc.docNumber,
      quoteDate: doc.issueDate,
      providerName: settings.companyName,
      providerEmail: settings.email,
      providerPhone: settings.phone,
      providerAddress: settings.address,
      receiptNumber: doc.docType === 'receipt' ? doc.docNumber : (doc.payments?.[0]?.receiptNumber || 'REC-0001'),
      receiptDate: doc.issueDate,
      businessName: settings.companyName,
      businessEmail: settings.email,
      businessPhone: settings.phone,
      businessAddress: settings.address,
      payerName: client?.name || '',
      payerContact: `${client?.email || ''} • ${client?.phone || ''}`,
      paymentFor: doc.notes || `Settlement of ${doc.docNumber}`,
      amountPaid: totals.amountPaid || totals.grandTotal,
      referenceTransactionId: doc.receiptReference || doc.payments?.[0]?.reference || 'EFT-REF',
      items: (doc.lineItems || []).map(li => ({
        id: li.id,
        description: li.description + (li.details ? ` (${li.details})` : ''),
        quantity: li.quantity,
        rate: li.unitPrice,
        discountPercent: li.discountPct,
        unit: li.unit
      }))
    };

    const idx = docs.findIndex(d => d.id === doc.id);
    if (idx >= 0) {
      docs[idx] = enrichedDoc;
    } else {
      docs.unshift(enrichedDoc);
    }

    this.saveAllBillingDocuments(docs);
    return enrichedDoc;
  }

  public deleteBillingDocument(id: string): void {
    const docs = this.getAllBillingDocuments().filter(d => d.id !== id);
    this.saveAllBillingDocuments(docs);
  }

  // -------------------------------------------------------------
  // Zoho-Style Conversions & Workflows
  // -------------------------------------------------------------

  /**
   * 1-Click Quote-to-Invoice Conversion
   * 1. Marks source quote as 'converted'
   * 2. Generates new INV-XXXX number
   * 3. Locks in immutable clientSnapshot and line items
   * 4. Links parentQuoteNumber = quote.docNumber
   * 5. Sets status to 'draft' or 'sent'
   * 6. Returns the brand-new invoice
   */
  public convertQuoteToInvoice(quoteDoc: UnifiedBillingData): UnifiedBillingData {
    // 1. Update source quote
    const updatedQuote: UnifiedBillingData = {
      ...quoteDoc,
      status: 'converted',
      updatedAt: new Date().toISOString()
    };
    this.saveBillingDocument(updatedQuote);

    // 2. Build target invoice
    const newDocNumber = this.getNextDocNumber('invoice', true);
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const totals = this.calculateTotals(quoteDoc.lineItems, quoteDoc.vatRate, quoteDoc.discountAmount, []);

    const newInvoice: UnifiedBillingData = {
      ...quoteDoc,
      id: `doc-inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      docType: 'invoice',
      docNumber: newDocNumber,
      title: `Tax Invoice ${newDocNumber} (${quoteDoc.clientSnapshot.name})`,
      status: 'draft',
      issueDate: today,
      dueDate: due,
      validUntil: undefined,
      payments: [],
      amountPaid: 0,
      balanceDue: totals.grandTotal,
      parentQuoteId: quoteDoc.id,
      parentQuoteNumber: quoteDoc.docNumber,
      linkedInvoiceNumber: undefined,
      notes: `Converted from Quotation ${quoteDoc.docNumber}. Thank you for your business.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.saveBillingDocument(newInvoice);
  }

  /**
   * 1-Click Document Clone
   * Clones any Quote, Invoice, or Receipt into a new draft with fresh sequential number and today's date.
   */
  public cloneBillingDocument(doc: UnifiedBillingData): UnifiedBillingData {
    const nextNumber = this.getNextDocNumber(doc.docType, true);
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const totals = this.calculateTotals(doc.lineItems, doc.vatRate, doc.discountAmount, []);

    const cloned: UnifiedBillingData = {
      ...doc,
      id: `doc-${doc.docType}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      docNumber: nextNumber,
      title: `${doc.docType === 'quote' ? 'Quotation' : doc.docType === 'invoice' ? 'Tax Invoice' : 'Receipt'} ${nextNumber} (${doc.clientSnapshot.name})`,
      status: 'draft',
      issueDate: today,
      dueDate: due,
      validUntil: doc.docType === 'quote' ? validUntil : undefined,
      payments: [],
      amountPaid: 0,
      balanceDue: totals.grandTotal,
      parentQuoteId: undefined,
      parentQuoteNumber: undefined,
      linkedInvoiceNumber: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.saveBillingDocument(cloned);
  }

  /**
   * Record Payment on Invoice
   * 1. Creates a sequential receipt number (REC-XXXX)
   * 2. Appends payment record to invoice.payments
   * 3. Recalculates amountPaid and balanceDue
   * 4. Updates invoice status to 'paid' (if balanceDue <= 0.01) or 'partial'
   * 5. Synthesizes a standalone Receipt document snapshot
   */
  public recordPaymentOnInvoice(
    invoiceDoc: UnifiedBillingData,
    paymentInput: {
      amount: number;
      method: PaymentMethod;
      reference: string;
      paymentDate?: string;
      notes?: string;
    }
  ): {
    updatedInvoice: UnifiedBillingData;
    payment: BillingPayment;
    receiptDoc: UnifiedBillingData;
  } {
    const receiptNumber = this.getNextDocNumber('receipt', true);
    const paymentDate = paymentInput.paymentDate || new Date().toISOString().split('T')[0];

    const newPayment: BillingPayment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      documentId: invoiceDoc.id,
      receiptNumber,
      amount: Math.round(paymentInput.amount * 100) / 100,
      paymentDate,
      method: paymentInput.method,
      reference: paymentInput.reference || `REF-${receiptNumber}`,
      notes: paymentInput.notes || `Settlement for Invoice ${invoiceDoc.docNumber}`
    };

    const updatedPayments = [...(invoiceDoc.payments || []), newPayment];
    const totals = this.calculateTotals(
      invoiceDoc.lineItems,
      invoiceDoc.vatRate,
      invoiceDoc.discountAmount,
      updatedPayments
    );

    const newStatus: BillingDocStatus = totals.balanceDue <= 0.01 ? 'paid' : 'partial';

    const updatedInvoice: UnifiedBillingData = {
      ...invoiceDoc,
      payments: updatedPayments,
      ...totals,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    this.saveBillingDocument(updatedInvoice);

    // Build the standalone official receipt view/snapshot
    const settings = this.getSettings();
    const receiptDoc: UnifiedBillingData = {
      id: `doc-rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      docType: 'receipt',
      docNumber: receiptNumber,
      title: `Official Receipt ${receiptNumber} (${invoiceDoc.clientSnapshot.name})`,
      status: 'paid',
      clientId: invoiceDoc.clientId,
      clientSnapshot: invoiceDoc.clientSnapshot,
      issueDate: paymentDate,
      dueDate: paymentDate,
      lineItems: [
        {
          id: `li-rec-1`,
          description: `Settlement for Tax Invoice ${invoiceDoc.docNumber}`,
          details: `Payment method: ${newPayment.method} • Ref: ${newPayment.reference}`,
          quantity: 1,
          unitPrice: newPayment.amount,
          taxRate: 0,
          unit: 'Payment'
        }
      ],
      vatRate: 0,
      discountAmount: 0,
      currency: invoiceDoc.currency || 'ZAR',
      currencySymbol: invoiceDoc.currencySymbol || 'R',
      amountPaid: newPayment.amount,
      balanceDue: totals.balanceDue,
      subtotal: newPayment.amount,
      vatTotal: 0,
      grandTotal: newPayment.amount,
      payments: [newPayment],
      linkedInvoiceNumber: invoiceDoc.docNumber,
      paymentMethod: newPayment.method,
      receiptReference: newPayment.reference,
      receivedByName: settings.accountHolder || "Finance Directorate",
      notes: newPayment.notes || `Full payment confirmation for Invoice ${invoiceDoc.docNumber}. Tax invoice marked as settled.`,
      termsAndConditions: "This document constitutes an electronic official receipt of payment. Verified on tamper-evident ledger.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.saveBillingDocument(receiptDoc);

    return {
      updatedInvoice,
      payment: newPayment,
      receiptDoc
    };
  }

  // -------------------------------------------------------------
  // Factory Helpers & Seed Document
  // -------------------------------------------------------------
  public createInitialBillingDocument(docType: BillingDocType = 'invoice'): UnifiedBillingData {
    const settings = this.getSettings();
    const clients = this.getClients();
    const primaryClient = clients[0] || SEED_CLIENTS[0];
    const docNumber = this.getNextDocNumber(docType, true);
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const catalog = this.getCatalogItems();
    const sampleItems: BillingLineItem[] = catalog.slice(0, 3).map((ci, idx) => ({
      id: `li-${Date.now()}-${idx}`,
      catalogItemId: ci.id,
      description: ci.title,
      details: ci.description,
      quantity: idx === 1 ? 2 : 1,
      unitPrice: ci.unitPrice,
      discountPct: 0,
      taxRate: ci.taxRate,
      unit: ci.unit
    }));

    const totals = this.calculateTotals(sampleItems, 15, 0, []);

    const doc: UnifiedBillingData = {
      id: `doc-${docType}-${Date.now()}`,
      docType,
      docNumber,
      title: `${docType === 'quote' ? 'Quotation' : docType === 'invoice' ? 'Tax Invoice' : 'Receipt'} ${docNumber} (${primaryClient.name})`,
      status: 'draft',
      clientId: primaryClient.id,
      clientSnapshot: {
        name: primaryClient.name,
        contactPerson: primaryClient.contactPerson,
        email: primaryClient.email,
        phone: primaryClient.phone,
        billingAddress: primaryClient.billingAddress,
        vatNumber: primaryClient.vatNumber
      },
      issueDate: today,
      dueDate: due,
      validUntil: docType === 'quote' ? validUntil : undefined,
      lineItems: sampleItems,
      vatRate: 15,
      discountAmount: 0,
      currency: 'ZAR',
      currencySymbol: 'R',
      ...totals,
      payments: [],
      notes: docType === 'quote'
        ? "Quotation valid for 30 calendar days. 50% deposit required upon confirmation."
        : "Thank you for your business. Please quote invoice number on all EFT remittances.",
      termsAndConditions: settings.paymentTerms,
      depositRequiredPercent: docType === 'quote' ? 50 : undefined,
      templateId: 'classic-zoho',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.saveBillingDocument(doc);
  }

  private createSeedInvoice(): UnifiedBillingData {
    const settings = DEFAULT_ORG_SETTINGS;
    const client = SEED_CLIENTS[0];

    const lineItems: BillingLineItem[] = [
      {
        id: "li-1",
        catalogItemId: "cat-1",
        description: "Cloud Architecture Audit & High-Availability Migration Strategy",
        details: "Full AWS/GCP cloud posture assessment, IAM policy hardening, and ISO 27001 readiness review.",
        quantity: 1,
        unitPrice: 38500,
        discountPct: 0,
        taxRate: 15,
        unit: "Assessment"
      },
      {
        id: "li-2",
        catalogItemId: "cat-2",
        description: "Custom Fleet Management Portal Frontend (React 19 / Tailwind / TypeScript)",
        details: "Interactive real-time map clustering, telematics telemetry views, and driver dispatch workflows.",
        quantity: 65,
        unitPrice: 950,
        discountPct: 5,
        taxRate: 15,
        unit: "Hours"
      },
      {
        id: "li-3",
        catalogItemId: "cat-4",
        description: "Automated Telematics & Real-Time Tracking REST API Microservices",
        details: "Go / Node microservice deployment, webhook authentication and background queue workers.",
        quantity: 40,
        unitPrice: 1100,
        discountPct: 0,
        taxRate: 15,
        unit: "Hours"
      }
    ];

    const payment: BillingPayment = {
      id: "pay-seed-1",
      documentId: "doc-seed-inv-2026",
      receiptNumber: "REC-0088",
      amount: 50000.00,
      paymentDate: "2026-08-12",
      method: "EFT",
      reference: "FNB-EFT-9918230914",
      notes: "Part-payment tranche received with thanks."
    };

    const totals = this.calculateTotals(lineItems, 15, 0, [payment]);

    const invoice: UnifiedBillingData = {
      id: "doc-seed-inv-2026",
      docType: "invoice",
      docNumber: "INV-0218",
      title: "Tax Invoice INV-0218 (BlueHorizon Logistics)",
      status: "partial",
      clientId: client.id,
      clientSnapshot: {
        name: client.name,
        contactPerson: client.contactPerson,
        email: client.email,
        phone: client.phone,
        billingAddress: client.billingAddress,
        vatNumber: client.vatNumber
      },
      issueDate: "2026-08-10",
      dueDate: "2026-08-25",
      lineItems,
      vatRate: 15,
      discountAmount: 0,
      currency: "ZAR",
      currencySymbol: "R",
      ...totals,
      payments: [payment],
      notes: "Thank you for partnering with Apex Cloud Solutions. Standard 14-day settlement applies.",
      termsAndConditions: settings.paymentTerms,
      templateId: "classic-zoho",
      createdAt: "2026-08-10T09:00:00Z",
      updatedAt: "2026-08-12T14:30:00Z"
    };

    return invoice;
  }
}

export const billingService = new BillingService();

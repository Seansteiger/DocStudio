import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building, 
  CreditCard, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  Clock, 
  FileText, 
  RefreshCw, 
  Search, 
  Users, 
  Package, 
  Settings, 
  History, 
  Layers, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Upload, 
  Image as ImageIcon, 
  Palette, 
  ChevronDown, 
  ExternalLink, 
  Sparkles, 
  Zap, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { 
  UnifiedBillingData, 
  BillingDocType, 
  BillingDocStatus, 
  BillingClient, 
  CatalogItem, 
  BillingLineItem, 
  BillingPayment, 
  PaymentMethod,
  OrganizationSettings,
  billingService,
  DEFAULT_ORG_SETTINGS
} from '../../services/storage/billingService';

interface BillingHubEditorProps {
  data: UnifiedBillingData | any;
  onChange: (newData: UnifiedBillingData) => void;
  editorMode: 'wizard' | 'pro';
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const BillingHubEditor: React.FC<BillingHubEditorProps> = ({
  data,
  onChange,
  editorMode,
  onShowToast
}) => {
  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<'builder' | 'payments' | 'crm' | 'settings' | 'ledger'>('builder');

  // Relational Tables state
  const [clients, setClients] = useState<BillingClient[]>(() => billingService.getClients());
  const [catalog, setCatalog] = useState<CatalogItem[]>(() => billingService.getCatalogItems());
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>(() => billingService.getSettings());
  const [billingDocs, setBillingDocs] = useState<UnifiedBillingData[]>(() => billingService.getAllBillingDocuments());

  // Modal / Drawer states
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewCatalogItemOpen, setIsNewCatalogItemOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isSnapshotUnlocked, setIsSnapshotUnlocked] = useState(false);

  // Search & Filter in CRM / Ledger
  const [clientSearch, setClientSearch] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'all' | BillingDocType>('all');
  const [crmSubTab, setCrmSubTab] = useState<'clients' | 'catalog'>('clients');

  // New Client Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientContact, setNewClientContact] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientVat, setNewClientVat] = useState('');

  // New Catalog Item Form State
  const [newCatalogTitle, setNewCatalogTitle] = useState('');
  const [newCatalogSku, setNewCatalogSku] = useState('');
  const [newCatalogDesc, setNewCatalogDesc] = useState('');
  const [newCatalogPrice, setNewCatalogPrice] = useState<number>(5000);
  const [newCatalogUnit, setNewCatalogUnit] = useState('Hours');

  // Record Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFT');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');

  // Ensure current data is cast and has all unified fields
  const currentDoc: UnifiedBillingData = useMemo(() => {
    if (data && data.docType && data.clientSnapshot) {
      return data as UnifiedBillingData;
    }
    // Backward compatibility normalization if opened from legacy preset
    const docType: BillingDocType = (
      data.docType || 
      (data.quoteNumber ? 'quote' : (data.receiptNumber ? 'receipt' : 'invoice'))
    ) as BillingDocType;

    const initialClient = clients[0] || {
      name: data.clientName || data.payerName || "Client Name",
      contactPerson: data.clientName || "",
      email: data.clientEmail || "",
      phone: data.clientCell || data.clientPhone || "",
      billingAddress: data.clientAddress || "",
      vatNumber: ""
    };

    const lineItems: BillingLineItem[] = data.lineItems || (data.items ? data.items.map((it: any, idx: number) => ({
      id: it.id || `li-${idx}`,
      description: it.description || 'Consulting',
      quantity: it.quantity || 1,
      unitPrice: it.rate || it.unitPrice || 0,
      discountPct: it.discountPercent || 0,
      taxRate: 15,
      unit: it.unit || 'Unit'
    })) : [
      {
        id: 'li-1',
        description: data.paymentFor || 'Professional Services',
        quantity: 1,
        unitPrice: data.amountPaid || 10000,
        taxRate: 15,
        unit: 'Fixed'
      }
    ]);

    const totals = billingService.calculateTotals(lineItems, data.taxRate || 15, 0, data.payments || []);

    return {
      id: data.id || `doc-${Date.now()}`,
      docType,
      docNumber: data.docNumber || data.invoiceNumber || data.quoteNumber || data.receiptNumber || 'INV-0218',
      title: data.title || `${docType === 'quote' ? 'Quotation' : docType === 'receipt' ? 'Receipt' : 'Tax Invoice'}`,
      status: data.status || 'draft',
      clientId: data.clientId || 'cli-1',
      clientSnapshot: data.clientSnapshot || initialClient,
      issueDate: data.issueDate || data.invoiceDate || data.quoteDate || data.receiptDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || data.validUntil || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      validUntil: data.validUntil,
      lineItems,
      vatRate: data.vatRate !== undefined ? data.vatRate : 15,
      discountAmount: data.discountAmount || 0,
      currency: data.currency || 'ZAR',
      currencySymbol: 'R',
      ...totals,
      payments: data.payments || [],
      notes: data.notes || data.paymentTermsNotes || "Payment due strictly within 14 calendar days of tax invoice date.",
      termsAndConditions: data.termsAndConditions || orgSettings.paymentTerms,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }, [data, clients, orgSettings]);

  // Recalculate totals and emit update
  const commitDocUpdate = (patch: Partial<UnifiedBillingData>) => {
    const updated: UnifiedBillingData = {
      ...currentDoc,
      ...patch,
      updatedAt: new Date().toISOString()
    };

    const totals = billingService.calculateTotals(
      updated.lineItems || [],
      updated.vatRate !== undefined ? updated.vatRate : 15,
      updated.discountAmount || 0,
      updated.payments || []
    );

    const finalized: UnifiedBillingData = {
      ...updated,
      ...totals
    };

    onChange(finalized);
  };

  // Preset Colors for Brand Customizer
  const brandPresets = [
    { name: 'Emerald', hex: '#059669' },
    { name: 'Sapphire', hex: '#2563EB' },
    { name: 'Slate', hex: '#334155' },
    { name: 'Amethyst', hex: '#7C3AED' },
    { name: 'Amber', hex: '#D97706' },
    { name: 'Ruby', hex: '#DC2626' }
  ];

  // -------------------------------------------------------------
  // Mode & Lifecycle Handlers
  // -------------------------------------------------------------
  const handleSwitchDocType = (type: BillingDocType) => {
    if (type === currentDoc.docType) return;
    const nextNumber = billingService.getNextDocNumber(type, false);
    commitDocUpdate({
      docType: type,
      docNumber: nextNumber
    });
    onShowToast(`Switched view to ${type.toUpperCase()}`, 'info');
  };

  const handleConvertQuoteToInvoice = () => {
    if (currentDoc.docType !== 'quote') return;
    const newInvoice = billingService.convertQuoteToInvoice(currentDoc);
    onChange(newInvoice);
    setBillingDocs(billingService.getAllBillingDocuments());
    onShowToast(`Quotation ${currentDoc.docNumber} converted to Tax Invoice ${newInvoice.docNumber}!`, 'success');
  };

  const handleCloneDocument = () => {
    const cloned = billingService.cloneBillingDocument(currentDoc);
    onChange(cloned);
    setBillingDocs(billingService.getAllBillingDocuments());
    onShowToast(`Cloned into new draft ${cloned.docNumber}`, 'success');
  };

  const handleOpenRecordPayment = () => {
    setPaymentAmount(currentDoc.balanceDue > 0 ? currentDoc.balanceDue : 0);
    setPaymentRef(`EFT-${currentDoc.docNumber}-${Math.floor(1000 + Math.random() * 9000)}`);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setIsRecordPaymentOpen(true);
  };

  const handleSavePayment = () => {
    if (paymentAmount <= 0) {
      onShowToast("Payment amount must be greater than zero.", 'error');
      return;
    }

    const res = billingService.recordPaymentOnInvoice(currentDoc, {
      amount: paymentAmount,
      method: paymentMethod,
      reference: paymentRef,
      paymentDate,
      notes: paymentNotes
    });

    onChange(res.updatedInvoice);
    setBillingDocs(billingService.getAllBillingDocuments());
    setIsRecordPaymentOpen(false);
    onShowToast(`Payment of R ${paymentAmount.toFixed(2)} recorded! Receipt ${res.payment.receiptNumber} generated.`, 'success');
  };

  // -------------------------------------------------------------
  // Client Autofill & Snapshot Handling
  // -------------------------------------------------------------
  const handleSelectClient = (clientId: string) => {
    const selected = clients.find(c => c.id === clientId);
    if (!selected) return;

    commitDocUpdate({
      clientId: selected.id,
      clientSnapshot: {
        name: selected.name,
        contactPerson: selected.contactPerson,
        email: selected.email,
        phone: selected.phone,
        billingAddress: selected.billingAddress,
        vatNumber: selected.vatNumber
      }
    });
    onShowToast(`Client "${selected.name}" autofilled & snapshot locked`, 'info');
  };

  const handleSaveNewClient = () => {
    if (!newClientName.trim()) {
      onShowToast("Client business name is required.", 'error');
      return;
    }

    const created = billingService.upsertClient({
      name: newClientName.trim(),
      contactPerson: newClientContact.trim(),
      email: newClientEmail.trim(),
      phone: newClientPhone.trim(),
      billingAddress: newClientAddress.trim(),
      vatNumber: newClientVat.trim()
    });

    const updatedList = billingService.getClients();
    setClients(updatedList);

    // Autofill immediately
    handleSelectClient(created.id);
    setIsNewClientOpen(false);

    // Reset fields
    setNewClientName('');
    setNewClientContact('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientAddress('');
    setNewClientVat('');
    onShowToast(`Saved client "${created.name}" to CRM`, 'success');
  };

  // -------------------------------------------------------------
  // Line Items & Catalog Autofill
  // -------------------------------------------------------------
  const handleAddLineItem = () => {
    const newItem: BillingLineItem = {
      id: `li-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: "Professional Engineering & Consulting Services",
      details: "",
      quantity: 1,
      unitPrice: 5000,
      discountPct: 0,
      taxRate: currentDoc.vatRate,
      unit: "Hours"
    };

    commitDocUpdate({
      lineItems: [...(currentDoc.lineItems || []), newItem]
    });
  };

  const handleAddFromCatalog = (catalogItemId: string) => {
    const catItem = catalog.find(c => c.id === catalogItemId);
    if (!catItem) return;

    const newItem: BillingLineItem = {
      id: `li-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      catalogItemId: catItem.id,
      description: catItem.title,
      details: catItem.description,
      quantity: 1,
      unitPrice: catItem.unitPrice,
      discountPct: 0,
      taxRate: catItem.taxRate,
      unit: catItem.unit
    };

    commitDocUpdate({
      lineItems: [...(currentDoc.lineItems || []), newItem]
    });
    onShowToast(`Added "${catItem.title}" from catalog`, 'info');
  };

  const handleUpdateLineItem = (id: string, field: keyof BillingLineItem, value: any) => {
    const updated = (currentDoc.lineItems || []).map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    commitDocUpdate({ lineItems: updated });
  };

  const handleRemoveLineItem = (id: string) => {
    const updated = (currentDoc.lineItems || []).filter(item => item.id !== id);
    commitDocUpdate({ lineItems: updated });
  };

  const handleSaveItemToCatalog = (item: BillingLineItem) => {
    billingService.upsertCatalogItem({
      title: item.description,
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      description: item.details || "",
      unitPrice: Number(item.unitPrice) || 0,
      taxRate: item.taxRate !== undefined ? item.taxRate : 15,
      unit: item.unit || "Unit"
    });
    setCatalog(billingService.getCatalogItems());
    onShowToast(`Saved "${item.description}" to product catalog!`, 'success');
  };

  // -------------------------------------------------------------
  // Organization Settings & Brand Handlers
  // -------------------------------------------------------------
  const handleUpdateOrgSettings = (patch: Partial<OrganizationSettings>) => {
    const updated = { ...orgSettings, ...patch };
    setOrgSettings(updated);
    billingService.saveSettings(updated);
    commitDocUpdate({
      brandOverrides: {
        ...currentDoc.brandOverrides,
        ...patch
      }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      if (base64) {
        handleUpdateOrgSettings({ logoUrl: base64 });
        onShowToast("Company logo uploaded and updated!", 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQuickLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      if (base64) {
        handleUpdateOrgSettings({ logoUrl: base64 });
        commitDocUpdate({
          companyLogoUrl: base64,
          showLogo: true,
          brandOverrides: {
            ...currentDoc.brandOverrides,
            logoUrl: base64
          }
        });
        onShowToast("Top-left logo uploaded & updated!", 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQuickLogoUrlChange = (url: string) => {
    handleUpdateOrgSettings({ logoUrl: url });
    commitDocUpdate({
      companyLogoUrl: url,
      brandOverrides: {
        ...currentDoc.brandOverrides,
        logoUrl: url
      }
    });
  };

  const handleQuickResetLogo = () => {
    handleUpdateOrgSettings({ logoUrl: '' });
    commitDocUpdate({
      companyLogoUrl: '',
      brandOverrides: {
        ...currentDoc.brandOverrides,
        logoUrl: ''
      }
    });
    onShowToast("Reset to default vector logo", 'info');
  };

  const handleToggleLogoVisibility = () => {
    const currentVis = currentDoc.showLogo !== false;
    const nextVis = !currentVis;
    commitDocUpdate({ showLogo: nextVis });
    handleUpdateOrgSettings({ showLogo: nextVis });
    onShowToast(nextVis ? "Top-left logo enabled on document" : "Top-left logo hidden from document", 'info');
  };

  return (
    <div className="space-y-4 text-xs font-sans text-slate-200">
      {/* ========================================================= */}
      {/* 1. LIFECYCLE & UNIFIED MODE BAR */}
      {/* ========================================================= */}
      <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Mode Switcher Pills */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => handleSwitchDocType('quote')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              currentDoc.docType === 'quote'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>Quote</span>
          </button>

          <button
            onClick={() => handleSwitchDocType('invoice')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              currentDoc.docType === 'invoice'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={13} />
            <span>Tax Invoice</span>
          </button>

          <button
            onClick={() => handleSwitchDocType('receipt')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              currentDoc.docType === 'receipt'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard size={13} />
            <span>Receipt</span>
          </button>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-slate-400 font-medium">Status:</label>
          <select
            value={currentDoc.status}
            onChange={(e) => commitDocUpdate({ status: e.target.value as BillingDocStatus })}
            className="bg-black/40 border border-white/15 rounded-xl px-2.5 py-1.5 text-white font-mono text-[8pt] uppercase font-bold focus:outline-none focus:border-emerald-500"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="converted">Converted</option>
            <option value="partial">Partially Paid</option>
            <option value="paid">Paid in Full</option>
            <option value="void">Void</option>
          </select>
        </div>

        {/* 1-Click Zoho Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentDoc.docType === 'quote' && (
            <button
              onClick={handleConvertQuoteToInvoice}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
              title="Convert this quote into a formal tax invoice with next INV-XXXX number"
            >
              <ArrowRight size={13} />
              <span>Convert → Invoice</span>
            </button>
          )}

          {currentDoc.docType === 'invoice' && (
            <button
              onClick={handleOpenRecordPayment}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
              title="Record an EFT or Card payment and auto-generate an Official Receipt"
            >
              <CreditCard size={13} />
              <span>Record Payment</span>
            </button>
          )}

          <button
            onClick={handleCloneDocument}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-[0.98]"
            title="Duplicate as a new draft document"
          >
            <Copy size={13} />
            <span className="hidden sm:inline">Clone</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SUB-NAVIGATION TABS */}
      {/* ========================================================= */}
      <div className="flex items-center gap-1 bg-[#0E1118] border border-white/10 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'builder'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText size={14} />
          <span>Document Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'payments'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <CreditCard size={14} />
          <span>Payments & Receipts</span>
          {currentDoc.payments?.length > 0 && (
            <span className="bg-white/20 text-white text-[7pt] px-1.5 py-0.2 rounded-full font-mono">
              {currentDoc.payments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('crm')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'crm'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users size={14} />
          <span>Clients & Catalog CRM</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings size={14} />
          <span>Brand & Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'ledger'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History size={14} />
          <span>Ledger & History</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DOCUMENT BUILDER */}
      {/* ========================================================= */}
      {activeTab === 'builder' && (
        <div className="space-y-4">
          {/* Quick Header Logo & Brand Bar (1-Click Upload & URL Control) */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Top-Left Document Logo</h3>
                <span className="text-[7pt] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                  Header Placement
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleLogoVisibility}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all active:scale-[0.98] ${
                    currentDoc.showLogo !== false 
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                  title="Toggle logo visibility on the rendered A4 document"
                >
                  <span>{currentDoc.showLogo !== false ? '✓ Logo Visible' : '✕ Logo Hidden'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 pt-1">
              {/* Logo Thumbnail Preview */}
              <div className="w-28 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center p-2 overflow-hidden shrink-0">
                {(currentDoc.brandOverrides?.logoUrl || currentDoc.companyLogoUrl || orgSettings.logoUrl) ? (
                  <img 
                    src={currentDoc.brandOverrides?.logoUrl || currentDoc.companyLogoUrl || orgSettings.logoUrl} 
                    alt="Logo Preview" 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-500 text-[7pt] font-mono leading-tight">
                    Default Vector Mark
                  </div>
                )}
              </div>

              {/* Upload & URL Controls */}
              <div className="flex-1 min-w-[200px] space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]">
                    <Upload size={13} />
                    <span>Upload Logo Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleQuickLogoUpload} 
                      className="hidden" 
                    />
                  </label>

                  {(currentDoc.brandOverrides?.logoUrl || currentDoc.companyLogoUrl || orgSettings.logoUrl) && (
                    <button
                      type="button"
                      onClick={handleQuickResetLogo}
                      className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2.5 py-1.5 rounded-xl transition-all"
                    >
                      Reset to Default
                    </button>
                  )}
                </div>

                <div>
                  <input
                    type="url"
                    placeholder="Or paste direct image URL (https://...)..."
                    value={currentDoc.brandOverrides?.logoUrl || currentDoc.companyLogoUrl || orgSettings.logoUrl || ''}
                    onChange={(e) => handleQuickLogoUrlChange(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs placeholder:text-slate-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Client Selection Card with Locked Snapshot Indicator */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Client Information</h3>
                <span 
                  className="inline-flex items-center gap-1 bg-white/5 border border-white/10 text-slate-300 text-[7pt] px-2 py-0.5 rounded-full font-mono cursor-pointer hover:border-emerald-500/50"
                  onClick={() => setIsSnapshotUnlocked(!isSnapshotUnlocked)}
                  title="Auditable immutable client snapshot. Click to unlock direct editing."
                >
                  {isSnapshotUnlocked ? (
                    <>
                      <Unlock size={10} className="text-amber-400" />
                      <span className="text-amber-300">Direct Edit Unlocked</span>
                    </>
                  ) : (
                    <>
                      <Lock size={10} className="text-emerald-400" />
                      <span>Audit Snapshot Locked</span>
                    </>
                  )}
                </span>
              </div>

              {/* Action: Select Client Dropdown or + Add New */}
              <div className="flex items-center gap-2">
                <select
                  value={currentDoc.clientId}
                  onChange={(e) => handleSelectClient(e.target.value)}
                  className="bg-black/40 border border-white/15 rounded-xl px-2.5 py-1 text-white text-xs max-w-[180px] sm:max-w-xs truncate"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsNewClientOpen(true)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 transition-all"
                  title="Create a new client in your CRM"
                >
                  <Plus size={12} />
                  <span>New Client</span>
                </button>
              </div>
            </div>

            {/* Client Snapshot Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Client Business Name</label>
                <input
                  type="text"
                  disabled={!isSnapshotUnlocked}
                  value={currentDoc.clientSnapshot?.name || ''}
                  onChange={(e) => commitDocUpdate({
                    clientSnapshot: { ...currentDoc.clientSnapshot, name: e.target.value }
                  })}
                  className={`w-full bg-black/40 border rounded-xl px-3 py-2 text-white ${
                    isSnapshotUnlocked ? 'border-amber-500/50' : 'border-white/10'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Contact Person</label>
                <input
                  type="text"
                  disabled={!isSnapshotUnlocked}
                  value={currentDoc.clientSnapshot?.contactPerson || ''}
                  onChange={(e) => commitDocUpdate({
                    clientSnapshot: { ...currentDoc.clientSnapshot, contactPerson: e.target.value }
                  })}
                  className={`w-full bg-black/40 border rounded-xl px-3 py-2 text-white ${
                    isSnapshotUnlocked ? 'border-amber-500/50' : 'border-white/10'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Billing Address</label>
                <input
                  type="text"
                  disabled={!isSnapshotUnlocked}
                  value={currentDoc.clientSnapshot?.billingAddress || ''}
                  onChange={(e) => commitDocUpdate({
                    clientSnapshot: { ...currentDoc.clientSnapshot, billingAddress: e.target.value }
                  })}
                  className={`w-full bg-black/40 border rounded-xl px-3 py-2 text-white ${
                    isSnapshotUnlocked ? 'border-amber-500/50' : 'border-white/10'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    disabled={!isSnapshotUnlocked}
                    value={currentDoc.clientSnapshot?.email || ''}
                    onChange={(e) => commitDocUpdate({
                      clientSnapshot: { ...currentDoc.clientSnapshot, email: e.target.value }
                    })}
                    className={`w-full bg-black/40 border rounded-xl px-3 py-2 text-white ${
                      isSnapshotUnlocked ? 'border-amber-500/50' : 'border-white/10'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Client VAT No</label>
                  <input
                    type="text"
                    disabled={!isSnapshotUnlocked}
                    value={currentDoc.clientSnapshot?.vatNumber || ''}
                    onChange={(e) => commitDocUpdate({
                      clientSnapshot: { ...currentDoc.clientSnapshot, vatNumber: e.target.value }
                    })}
                    placeholder="e.g. 4820194881"
                    className={`w-full bg-black/40 border rounded-xl px-3 py-2 text-white font-mono ${
                      isSnapshotUnlocked ? 'border-amber-500/50' : 'border-white/10'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Doc Number Card */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-400 text-[7.5pt] uppercase tracking-wider">Document Number</label>
                  <button
                    onClick={() => {
                      const next = billingService.getNextDocNumber(currentDoc.docType, true);
                      commitDocUpdate({ docNumber: next });
                      onShowToast(`Generated new number ${next}`, 'info');
                    }}
                    className="text-[7pt] text-slate-400 hover:text-white flex items-center gap-0.5"
                    title="Generate next sequential number"
                  >
                    <RefreshCw size={10} /> Next
                  </button>
                </div>
                <input
                  type="text"
                  value={currentDoc.docNumber}
                  onChange={(e) => commitDocUpdate({ docNumber: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold tracking-wide"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">
                  {currentDoc.docType === 'quote' ? 'Quote Date' : 'Tax Invoice Date'}
                </label>
                <input
                  type="date"
                  value={currentDoc.issueDate}
                  onChange={(e) => commitDocUpdate({ issueDate: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">
                  {currentDoc.docType === 'quote' ? 'Valid Until' : 'Payment Due Date'}
                </label>
                <input
                  type="date"
                  value={currentDoc.dueDate || currentDoc.validUntil || ''}
                  onChange={(e) => {
                    if (currentDoc.docType === 'quote') {
                      commitDocUpdate({ validUntil: e.target.value, dueDate: e.target.value });
                    } else {
                      commitDocUpdate({ dueDate: e.target.value });
                    }
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Line Items Table with Catalog Autofill */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Line Items & Deliverables</h3>
                <span className="text-[7pt] text-slate-400 font-mono">
                  {currentDoc.lineItems?.length || 0} items
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Catalog Autofill Dropdown */}
                {catalog.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddFromCatalog(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                    className="bg-black/40 border border-white/15 rounded-xl px-2.5 py-1 text-slate-300 text-xs hover:border-emerald-500/50"
                  >
                    <option value="" disabled>+ Add from Catalog...</option>
                    {catalog.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title} — R {c.unitPrice.toLocaleString()} ({c.unit})
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={handleAddLineItem}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1 transition-all active:scale-[0.98]"
                >
                  <Plus size={13} />
                  <span>Blank Item</span>
                </button>
              </div>
            </div>

            {/* Line Items List */}
            <div className="space-y-2.5 pt-1">
              {(currentDoc.lineItems || []).map((item, idx) => {
                const lineGross = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                const discount = item.discountPct ? lineGross * (item.discountPct / 100) : 0;
                const lineNet = lineGross - discount;

                return (
                  <div 
                    key={item.id} 
                    className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          placeholder="Item Description or Scope..."
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-medium"
                        />
                        <input
                          type="text"
                          placeholder="Scope details / specification notes (optional)..."
                          value={item.details || ''}
                          onChange={(e) => handleUpdateLineItem(item.id, 'details', e.target.value)}
                          className="w-full bg-black/20 border border-white/5 rounded-lg px-2.5 py-1 text-slate-300 text-[7.5pt]"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSaveItemToCatalog(item)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-colors"
                          title="Save this line item into your reusable item catalog"
                        >
                          <Package size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
                          title="Delete line item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 items-center">
                      <div>
                        <label className="block text-slate-400 text-[7pt] uppercase">Qty</label>
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleUpdateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white font-mono tabular-nums text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[7pt] uppercase">Unit</label>
                        <input
                          type="text"
                          placeholder="Hours/Fixed"
                          value={item.unit || ''}
                          onChange={(e) => handleUpdateLineItem(item.id, 'unit', e.target.value)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-slate-300 text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[7pt] uppercase">Rate (ZAR)</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white font-mono tabular-nums text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[7pt] uppercase">Disc %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPct || 0}
                          onChange={(e) => handleUpdateLineItem(item.id, 'discountPct', parseFloat(e.target.value) || 0)}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-slate-300 font-mono tabular-nums text-center"
                        />
                      </div>

                      <div className="text-right sm:col-span-1 col-span-2">
                        <span className="block text-slate-400 text-[7pt] uppercase">Net Total</span>
                        <span className="font-mono font-bold text-white tabular-nums text-xs">
                          R {lineNet.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Document VAT & Discount Controls */}
            <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-slate-400 text-[7pt] uppercase mb-1">Standard VAT Rate</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => commitDocUpdate({ vatRate: 15 })}
                      className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                        currentDoc.vatRate === 15 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      15% (Standard)
                    </button>
                    <button
                      onClick={() => commitDocUpdate({ vatRate: 0 })}
                      className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                        currentDoc.vatRate === 0 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      0% (Zero-Rated)
                    </button>
                  </div>
                </div>

                {currentDoc.docType === 'quote' && (
                  <div>
                    <label className="block text-slate-400 text-[7pt] uppercase mb-1">Deposit Req (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentDoc.depositRequiredPercent || 50}
                      onChange={(e) => commitDocUpdate({ depositRequiredPercent: parseFloat(e.target.value) || 0 })}
                      className="w-20 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-white font-mono text-center"
                    />
                  </div>
                )}
              </div>

              {/* Financial Quick Summary Bar */}
              <div className="bg-black/50 p-2.5 rounded-xl border border-white/10 space-y-1 font-mono text-[8pt]">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="tabular-nums">R {currentDoc.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>VAT ({currentDoc.vatRate}%):</span>
                  <span className="tabular-nums">R {currentDoc.vatTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-white text-xs pt-1 border-t border-white/10">
                  <span>Grand Total:</span>
                  <span className="text-emerald-400 tabular-nums">
                    R {currentDoc.grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Payment Terms Card */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileText size={16} className="text-emerald-400" />
              <span>Notes, Banking Instructions & Terms</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Client Remarks / Project Notes</label>
                <textarea
                  rows={2}
                  value={currentDoc.notes || ''}
                  onChange={(e) => commitDocUpdate({ notes: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white leading-relaxed resize-none"
                  placeholder="Notes shown on invoice..."
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={currentDoc.termsAndConditions || ''}
                  onChange={(e) => commitDocUpdate({ termsAndConditions: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white leading-relaxed resize-none font-mono text-[7.5pt]"
                  placeholder="Terms & Conditions..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PAYMENTS & RECEIPTS */}
      {/* ========================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {/* Balance Due Banner */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[7.5pt] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                INVOICE SETTLEMENT STATUS
              </span>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-black text-white font-mono tabular-nums">
                  R {currentDoc.grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </div>
                {currentDoc.balanceDue <= 0.01 ? (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2.5 py-1 rounded-full text-xs font-mono">
                    ✓ FULLY PAID
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2.5 py-1 rounded-full text-xs font-mono">
                    BALANCE DUE: R {currentDoc.balanceDue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleOpenRecordPayment}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-[0.98]"
            >
              <CreditCard size={14} />
              <span>Record Payment & Receipt</span>
            </button>
          </div>

          {/* Payment History Table */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <History size={16} className="text-emerald-400" />
              <span>Recorded Remittances & Receipts ({currentDoc.payments?.length || 0})</span>
            </h3>

            {(!currentDoc.payments || currentDoc.payments.length === 0) ? (
              <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-xl space-y-2">
                <CreditCard size={28} className="mx-auto text-slate-600" />
                <p>No payments recorded for this document yet.</p>
                <p className="text-[7.5pt] text-slate-600">
                  Click "Record Payment & Receipt" above to log an EFT, Card, or Cash remittance.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-mono text-[7.5pt] uppercase">
                      <th className="py-2 px-3">Receipt No</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Method</th>
                      <th className="py-2 px-3">Reference</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {currentDoc.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5">
                        <td className="py-2.5 px-3 font-bold text-emerald-400">{p.receiptNumber}</td>
                        <td className="py-2.5 px-3 text-slate-300">{p.paymentDate}</td>
                        <td className="py-2.5 px-3 text-slate-300">{p.method}</td>
                        <td className="py-2.5 px-3 text-slate-400">{p.reference}</td>
                        <td className="py-2.5 px-3 text-right text-white font-bold tabular-nums">
                          R {p.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => {
                              handleSwitchDocType('receipt');
                              commitDocUpdate({
                                docNumber: p.receiptNumber,
                                linkedInvoiceNumber: currentDoc.docNumber,
                                amountPaid: p.amount,
                                receiptReference: p.reference
                              });
                            }}
                            className="text-[7pt] bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-2 py-1 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <ExternalLink size={10} /> View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CLIENTS & CATALOG CRM */}
      {/* ========================================================= */}
      {activeTab === 'crm' && (
        <div className="space-y-4">
          {/* Sub-Switch: Clients vs Catalog */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCrmSubTab('clients')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                crmSubTab === 'clients'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Users size={13} />
              <span>Clients Directory ({clients.length})</span>
            </button>
            <button
              onClick={() => setCrmSubTab('catalog')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                crmSubTab === 'catalog'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Package size={13} />
              <span>Products & Services Catalog ({catalog.length})</span>
            </button>
          </div>

          {/* Clients CRM View */}
          {crmSubTab === 'clients' && (
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search clients by name, email, or VAT..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-white text-xs"
                  />
                </div>

                <button
                  onClick={() => setIsNewClientOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus size={13} />
                  <span>Add Client</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {clients
                  .filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.email.toLowerCase().includes(clientSearch.toLowerCase()))
                  .map((c) => (
                    <div 
                      key={c.id} 
                      className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2 hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-xs">{c.name}</h4>
                          <p className="text-[7.5pt] text-slate-400">{c.contactPerson}</p>
                        </div>
                        <button
                          onClick={() => handleSelectClient(c.id)}
                          className="text-[7pt] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold transition-colors"
                        >
                          Use in Doc
                        </button>
                      </div>

                      <div className="text-[7.5pt] text-slate-400 space-y-0.5 font-mono">
                        <p>{c.email} • {c.phone}</p>
                        <p className="text-slate-500 truncate">{c.billingAddress}</p>
                        {c.vatNumber && <p className="text-emerald-400">VAT: {c.vatNumber}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Catalog CRM View */}
          {crmSubTab === 'catalog' && (
            <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search items by title, SKU, or unit..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-white text-xs"
                  />
                </div>

                <button
                  onClick={() => setIsNewCatalogItemOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus size={13} />
                  <span>Add Item to Catalog</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {catalog
                  .filter(i => i.title.toLowerCase().includes(catalogSearch.toLowerCase()) || i.sku.toLowerCase().includes(catalogSearch.toLowerCase()))
                  .map((i) => (
                    <div 
                      key={i.id} 
                      className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2 hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-xs">{i.title}</h4>
                            <span className="text-[7pt] font-mono text-slate-500">{i.sku}</span>
                          </div>
                          <p className="text-[7.5pt] text-slate-400 mt-0.5 line-clamp-2">{i.description}</p>
                        </div>
                        <button
                          onClick={() => handleAddFromCatalog(i.id)}
                          className="text-[7pt] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold transition-colors whitespace-nowrap"
                        >
                          + Insert
                        </button>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[7.5pt] font-mono">
                        <span className="text-slate-400">{i.unit}</span>
                        <span className="font-bold text-white">R {i.unitPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: BRAND & SETTINGS */}
      {/* ========================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Logo & Brand Colors */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Palette size={16} className="text-emerald-400" />
              <span>Brand Identity & Logo</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              {/* Logo Upload & Preview */}
              <div>
                <label className="block text-slate-400 mb-1.5 text-[7.5pt] uppercase tracking-wider">Company Logo</label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center p-2 overflow-hidden">
                    {orgSettings.logoUrl ? (
                      <img src={orgSettings.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <ImageIcon size={22} className="text-slate-600" />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all inline-block">
                      <Upload size={13} />
                      <span>Upload Logo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                      />
                    </label>
                    {orgSettings.logoUrl && (
                      <button
                        onClick={() => handleUpdateOrgSettings({ logoUrl: '' })}
                        className="text-[7.5pt] text-rose-400 hover:underline block"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Accent Color Swatches */}
              <div>
                <label className="block text-slate-400 mb-1.5 text-[7.5pt] uppercase tracking-wider">Accent Brand Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {brandPresets.map(preset => (
                    <button
                      key={preset.hex}
                      onClick={() => handleUpdateOrgSettings({ accentColor: preset.hex })}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        orgSettings.accentColor === preset.hex 
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0E1118]' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    >
                      {orgSettings.accentColor === preset.hex && <Check size={14} className="text-white" />}
                    </button>
                  ))}

                  <input
                    type="color"
                    value={orgSettings.accentColor}
                    onChange={(e) => handleUpdateOrgSettings({ accentColor: e.target.value })}
                    className="w-7 h-7 rounded-full bg-transparent cursor-pointer border-0"
                    title="Custom Color"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Organization Details */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Building size={16} className="text-emerald-400" />
              <span>Issuer / Company Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Company Registered Name</label>
                <input
                  type="text"
                  value={orgSettings.companyName}
                  onChange={(e) => handleUpdateOrgSettings({ companyName: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Company Tagline</label>
                <input
                  type="text"
                  value={orgSettings.tagline}
                  onChange={(e) => handleUpdateOrgSettings({ tagline: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">VAT Registration Number</label>
                <input
                  type="text"
                  value={orgSettings.vatNumber}
                  onChange={(e) => handleUpdateOrgSettings({ vatNumber: e.target.value })}
                  placeholder="e.g. 4920194812"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Company Registration Number</label>
                <input
                  type="text"
                  value={orgSettings.regNumber}
                  onChange={(e) => handleUpdateOrgSettings({ regNumber: e.target.value })}
                  placeholder="e.g. 2019/148209/07"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Accounts Email</label>
                <input
                  type="email"
                  value={orgSettings.email}
                  onChange={(e) => handleUpdateOrgSettings({ email: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Telephone / Cell</label>
                <input
                  type="text"
                  value={orgSettings.phone}
                  onChange={(e) => handleUpdateOrgSettings({ phone: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Physical / Postal Address</label>
                <input
                  type="text"
                  value={orgSettings.address}
                  onChange={(e) => handleUpdateOrgSettings({ address: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* EFT Banking Details & Sequential Counters */}
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <CreditCard size={16} className="text-emerald-400" />
              <span>EFT Banking Details & Number Counters</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Bank Name</label>
                <input
                  type="text"
                  value={orgSettings.bankName}
                  onChange={(e) => handleUpdateOrgSettings({ bankName: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Account Holder</label>
                <input
                  type="text"
                  value={orgSettings.accountHolder}
                  onChange={(e) => handleUpdateOrgSettings({ accountHolder: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Account Number</label>
                <input
                  type="text"
                  value={orgSettings.accountNumber}
                  onChange={(e) => handleUpdateOrgSettings({ accountNumber: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Branch Code</label>
                <input
                  type="text"
                  value={orgSettings.branchCode}
                  onChange={(e) => handleUpdateOrgSettings({ branchCode: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Account Type</label>
                <input
                  type="text"
                  value={orgSettings.accountType}
                  onChange={(e) => handleUpdateOrgSettings({ accountType: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Next Quote #</label>
                <input
                  type="number"
                  value={orgSettings.quoteCounter}
                  onChange={(e) => handleUpdateOrgSettings({ quoteCounter: parseInt(e.target.value) || 1 })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Next Invoice #</label>
                <input
                  type="number"
                  value={orgSettings.invoiceCounter}
                  onChange={(e) => handleUpdateOrgSettings({ invoiceCounter: parseInt(e.target.value) || 1 })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[7.5pt] uppercase tracking-wider">Next Receipt #</label>
                <input
                  type="number"
                  value={orgSettings.receiptCounter}
                  onChange={(e) => handleUpdateOrgSettings({ receiptCounter: parseInt(e.target.value) || 1 })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-center"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: LEDGER & CLONING */}
      {/* ========================================================= */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History size={16} className="text-emerald-400" />
                <h3 className="font-bold text-white text-sm">Billing Documents Ledger</h3>
                <span className="text-[7pt] text-slate-400 font-mono">
                  {billingDocs.length} stored documents
                </span>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                {(['all', 'quote', 'invoice', 'receipt'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setLedgerTypeFilter(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      ledgerTypeFilter === t
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Ledger List */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-mono text-[7.5pt] uppercase">
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Doc #</th>
                    <th className="py-2 px-3">Client</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3 text-right">Grand Total</th>
                    <th className="py-2 px-3 text-center">Status</th>
                    <th className="py-2 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {billingDocs
                    .filter(d => ledgerTypeFilter === 'all' || d.docType === ledgerTypeFilter)
                    .map((d) => (
                      <tr key={d.id} className="hover:bg-white/5">
                        <td className="py-2.5 px-3">
                          <span className={`text-[7pt] px-2 py-0.5 rounded font-bold uppercase ${
                            d.docType === 'quote' ? 'bg-purple-500/20 text-purple-300' :
                            d.docType === 'receipt' ? 'bg-teal-500/20 text-teal-300' :
                            'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {d.docType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white">{d.docNumber}</td>
                        <td className="py-2.5 px-3 text-slate-300 truncate max-w-[140px] font-sans">
                          {d.clientSnapshot?.name || 'Client'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{d.issueDate}</td>
                        <td className="py-2.5 px-3 text-right text-white font-bold tabular-nums">
                          R {(d.grandTotal || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[7pt] text-slate-400 uppercase">
                            {d.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                onChange(d);
                                onShowToast(`Loaded ${d.docNumber} into editor`, 'info');
                              }}
                              className="text-[7pt] bg-white/5 hover:bg-white/15 text-white px-2 py-1 rounded-lg transition-colors"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => {
                                const dup = billingService.cloneBillingDocument(d);
                                onChange(dup);
                                setBillingDocs(billingService.getAllBillingDocuments());
                                onShowToast(`Cloned into ${dup.docNumber}`, 'success');
                              }}
                              className="text-[7pt] bg-white/5 hover:bg-white/15 text-slate-300 px-2 py-1 rounded-lg transition-colors"
                              title="Clone this document"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RECORD PAYMENT */}
      {/* ========================================================= */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#121622] border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <CreditCard size={18} className="text-emerald-400" />
                  <span>Record Payment & Issue Receipt</span>
                </h3>
                <p className="text-[8pt] text-slate-400 font-mono mt-0.5">
                  Invoice {currentDoc.docNumber} • Balance Due: R {currentDoc.balanceDue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <button
                onClick={() => setIsRecordPaymentOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-400 text-[7.5pt] uppercase">Payment Amount (ZAR)</label>
                  <button
                    onClick={() => setPaymentAmount(currentDoc.balanceDue)}
                    className="text-[7pt] text-emerald-400 hover:underline font-mono"
                  >
                    Full Balance (R {currentDoc.balanceDue.toFixed(2)})
                  </button>
                </div>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-base font-bold tabular-nums"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[7.5pt] uppercase mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-2.5 py-2 text-white text-xs"
                  >
                    <option value="EFT">EFT / Wire</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="PayFast">PayFast</option>
                    <option value="Yoco">Yoco</option>
                    <option value="Ozow">Ozow Instant EFT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[7.5pt] uppercase mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-2.5 py-2 text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[7.5pt] uppercase mb-1">Bank / Transaction Reference</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. FNB-EFT-991823"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[7.5pt] uppercase mb-1">Internal Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Optional payment notes..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsRecordPaymentOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 font-medium text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePayment}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold text-xs transition-all shadow-md active:scale-[0.98]"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD NEW CLIENT */}
      {/* ========================================================= */}
      {isNewClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#121622] border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users size={18} className="text-emerald-400" />
                <span>Save New Client to CRM</span>
              </h3>
              <button onClick={() => setIsNewClientOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 text-[7.5pt] uppercase mb-1">Client Business / Entity Name *</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Acme Innovations Pty Ltd"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[7.5pt] uppercase mb-1">Key Contact Person</label>
                <input
                  type="text"
                  value={newClientContact}
                  onChange={(e) => setNewClientContact(e.target.value)}
                  placeholder="e.g. Sarah Smith (Finance Lead)"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[7.5pt] uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="accounts@client.co.za"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[7.5pt] uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+27 82 000 0000"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[7.5pt] uppercase mb-1">Billing Address</label>
                <input
                  type="text"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="Floor, Street, City, Postal Code"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[7.5pt] uppercase mb-1">VAT Number</label>
                <input
                  type="text"
                  value={newClientVat}
                  onChange={(e) => setNewClientVat(e.target.value)}
                  placeholder="e.g. 4820194881"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsNewClientOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 font-medium text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewClient}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold text-xs transition-all shadow-md active:scale-[0.98]"
              >
                Save Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD NEW CATALOG ITEM */}
      {/* ========================================================= */}
      {isNewCatalogItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#121622] border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Package size={18} className="text-emerald-400" />
                <span>Add Item to Product Catalog</span>
              </h3>
              <button onClick={() => setIsNewCatalogItemOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 text-[7.5pt] uppercase mb-1">Item Title / Service Name *</label>
                <input
                  type="text"
                  value={newCatalogTitle}
                  onChange={(e) => setNewCatalogTitle(e.target.value)}
                  placeholder="e.g. Kubernetes Cluster Deployment"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[7.5pt] uppercase mb-1">SKU / Code</label>
                <input
                  type="text"
                  value={newCatalogSku}
                  onChange={(e) => setNewCatalogSku(e.target.value)}
                  placeholder="e.g. K8S-DEP-01"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[7.5pt] uppercase mb-1">Scope Description</label>
                <textarea
                  rows={2}
                  value={newCatalogDesc}
                  onChange={(e) => setNewCatalogDesc(e.target.value)}
                  placeholder="Detailed specifications..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white leading-relaxed resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[7.5pt] uppercase mb-1">Unit Price (ZAR)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newCatalogPrice}
                    onChange={(e) => setNewCatalogPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[7.5pt] uppercase mb-1">Billing Unit</label>
                  <select
                    value={newCatalogUnit}
                    onChange={(e) => setNewCatalogUnit(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-2.5 py-2 text-white text-xs"
                  >
                    <option value="Hours">Hours</option>
                    <option value="Day">Day</option>
                    <option value="Fixed">Fixed</option>
                    <option value="Sprint">Sprint</option>
                    <option value="Milestone">Milestone</option>
                    <option value="Month">Month</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsNewCatalogItemOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 font-medium text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newCatalogTitle.trim()) {
                    onShowToast("Title is required", 'error');
                    return;
                  }
                  billingService.upsertCatalogItem({
                    title: newCatalogTitle.trim(),
                    sku: newCatalogSku.trim() || `SKU-${Math.floor(100 + Math.random() * 900)}`,
                    description: newCatalogDesc.trim(),
                    unitPrice: newCatalogPrice,
                    taxRate: 15,
                    unit: newCatalogUnit
                  });
                  setCatalog(billingService.getCatalogItems());
                  setIsNewCatalogItemOpen(false);
                  setNewCatalogTitle('');
                  setNewCatalogSku('');
                  setNewCatalogDesc('');
                  onShowToast("Added item to catalog", 'success');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold text-xs transition-all shadow-md active:scale-[0.98]"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Layers, 
  Clock, 
  AlertCircle,
  Hash,
  Calendar,
  Lock
} from 'lucide-react';
import { 
  UnifiedBillingData, 
  BillingDocType, 
  BillingDocStatus,
  BillingLineItem,
  BillingPayment,
  billingService,
  DEFAULT_ORG_SETTINGS,
  DEFAULT_BRAND_LOGO_SVG
} from '../../services/storage/billingService';

interface BillingTemplatesProps {
  data: Partial<UnifiedBillingData> | any;
  templateId?: string;
}

export const BillingTemplates: React.FC<BillingTemplatesProps> = ({
  data,
  templateId = 'classic-zoho'
}) => {
  // Normalize settings and brand colors
  const orgSettings = billingService.getSettings() || DEFAULT_ORG_SETTINGS;
  const brandAccent = data.brandOverrides?.accentColor || orgSettings.accentColor || '#059669';
  const logoUrl = data.brandOverrides?.logoUrl || data.companyLogoUrl || orgSettings.logoUrl || DEFAULT_BRAND_LOGO_SVG;
  const showLogo = data.showLogo !== undefined ? data.showLogo : (orgSettings.showLogo !== undefined ? orgSettings.showLogo : true);

  // Resolve docType
  const docType: BillingDocType = (
    data.docType || 
    (data.quoteNumber || data.validUntil ? 'quote' : 
     (data.receiptNumber || (data.amountPaid !== undefined && !data.invoiceNumber) ? 'receipt' : 'invoice'))
  ) as BillingDocType;

  // Normalize Document Identification
  const docNumber = data.docNumber || data.invoiceNumber || data.quoteNumber || data.receiptNumber || 'DOC-0001';
  const issueDate = data.issueDate || data.invoiceDate || data.quoteDate || data.receiptDate || new Date().toISOString().split('T')[0];
  const dueDate = data.dueDate || (docType === 'quote' ? data.validUntil : undefined) || issueDate;
  const status: BillingDocStatus = (data.status || 'draft') as BillingDocStatus;

  // Normalize Issuer Details
  const companyName = data.companyName || data.providerName || data.businessName || orgSettings.companyName;
  const companyAddress = data.companyAddress || data.providerAddress || data.businessAddress || orgSettings.address;
  const companyEmail = data.companyEmail || data.providerEmail || data.businessEmail || orgSettings.email;
  const companyCell = data.companyCell || data.providerPhone || data.businessPhone || orgSettings.phone;
  const companyVatNumber = data.companyVatNumber || orgSettings.vatNumber;
  const companyRegNumber = orgSettings.regNumber;

  // Normalize Client Details (without synthetic badges)
  const clientName = data.clientSnapshot?.name || data.clientName || data.payerName || 'Client Name';
  const clientContact = data.clientSnapshot?.contactPerson || '';
  const clientEmail = data.clientSnapshot?.email || data.clientEmail || '';
  const clientPhone = data.clientSnapshot?.phone || data.clientCell || data.clientPhone || data.payerContact || '';
  const clientAddress = data.clientSnapshot?.billingAddress || data.clientAddress || '';
  const clientVat = data.clientSnapshot?.vatNumber || '';

  // Normalize Line Items
  const lineItems: BillingLineItem[] = React.useMemo(() => {
    if (data.lineItems && Array.isArray(data.lineItems)) {
      return data.lineItems;
    }
    if (data.items && Array.isArray(data.items)) {
      return data.items.map((it: any, idx: number) => ({
        id: it.id || `item-${idx}`,
        description: it.description || 'Consulting / Deliverable',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.rate || it.unitPrice) || 0,
        discountPct: Number(it.discountPercent || it.discountPct) || 0,
        unit: it.unit || 'Unit',
        taxRate: 15
      }));
    }
    if (data.paymentFor) {
      return [{
        id: 'rec-item-1',
        description: data.paymentFor,
        quantity: 1,
        unitPrice: Number(data.amountPaid) || 0,
        discountPct: 0,
        unit: 'Settlement',
        taxRate: 0
      }];
    }
    return [];
  }, [data.lineItems, data.items, data.paymentFor, data.amountPaid]);

  // Normalize Payments
  const payments: BillingPayment[] = Array.isArray(data.payments) ? data.payments : [];

  // Calculate live financial figures
  const vatRate = data.vatRate !== undefined ? Number(data.vatRate) : 15;
  const discountAmount = Number(data.discountAmount) || 0;
  const totals = billingService.calculateTotals(lineItems, vatRate, discountAmount, payments);

  const currency = data.currency || 'ZAR';
  const currencySymbol = currency === 'ZAR' ? 'R ' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : `${currency} `;

  // Banking Details
  const bankName = data.bankName || orgSettings.bankName;
  const accountHolder = data.accountHolder || orgSettings.accountHolder;
  const accountNumber = data.accountNumber || orgSettings.accountNumber;
  const branchCode = data.branchCode || orgSettings.branchCode;
  const accountType = orgSettings.accountType || 'Business Cheque Account';
  const paymentTerms = data.termsAndConditions || data.paymentTermsNotes || orgSettings.paymentTerms;

  // Status Badge Rendering Helper
  const renderStatusBadge = () => {
    const badgeConfigs: Record<BillingDocStatus, { label: string; bg: string; text: string; border: string }> = {
      draft: { label: 'DRAFT', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
      sent: { label: 'SENT TO CLIENT', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300' },
      accepted: { label: 'ACCEPTED', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
      converted: { label: 'CONVERTED TO INVOICE', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
      partial: { label: 'PARTIALLY PAID', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
      paid: { label: 'PAID IN FULL', bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-400' },
      void: { label: 'VOID / CANCELLED', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300' }
    };

    const cfg = badgeConfigs[status] || badgeConfigs.draft;

    return (
      <span 
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[7.5pt] font-mono font-bold tracking-wider uppercase border ${cfg.bg} ${cfg.text} ${cfg.border}`}
        style={{ verticalAlign: 'middle', lineHeight: '1.2' }}
      >
        {status === 'paid' && <CheckCircle2 size={11} className="text-emerald-700" />}
        {status === 'partial' && <Clock size={11} className="text-amber-700" />}
        {cfg.label}
      </span>
    );
  };

  // Document Type Header Strings
  const docTitleString = docType === 'quote' 
    ? 'COMMERCIAL QUOTATION' 
    : docType === 'receipt'
    ? 'OFFICIAL PAYMENT RECEIPT'
    : 'TAX INVOICE';

  const docNumberLabel = docType === 'quote' ? 'QUOTE NO' : docType === 'receipt' ? 'RECEIPT NO' : 'INVOICE NO';
  const dateLabel = docType === 'quote' ? 'Quote Date' : docType === 'receipt' ? 'Payment Date' : 'Tax Invoice Date';
  const dueDateLabel = docType === 'quote' ? 'Valid Until' : 'Payment Due Date';
  const clientHeading = docType === 'quote' ? 'PROPOSAL PREPARED FOR' : docType === 'receipt' ? 'RECEIVED FROM' : 'BILLED TO (CLIENT)';

  // Visual Theme Variations: classic-zoho, modern-ledger, minimal-swiss, executive-crest
  const isMinimalSwiss = templateId.includes('swiss') || templateId.includes('minimal');
  const isExecutiveCrest = templateId.includes('crest') || templateId.includes('executive') || templateId.includes('proposal');
  const isModernLedger = templateId.includes('ledger') || templateId.includes('agency') || templateId.includes('modern');

  // Explicit table border color
  const tableBorderColor = isModernLedger ? '#94a3b8' : '#cbd5e1';

  return (
    <div 
      className={`text-slate-900 text-[9pt] leading-relaxed flex flex-col justify-between min-h-[inherit] w-full print:p-0 ${
        isExecutiveCrest ? 'font-serif' : 'font-sans'
      }`}
      style={{
        ['--brand-accent' as any]: brandAccent
      }}
    >
      <div>
        {/* ========================================================= */}
        {/* 1. TOP ACCENT BAR / BORDER */}
        {/* ========================================================= */}
        {!isMinimalSwiss && (
          <div 
            className="w-full h-1.5 rounded-t-sm mb-6 print:mb-4 transition-colors"
            style={{ 
              backgroundColor: isModernLedger ? '#0f172a' : isExecutiveCrest ? '#1e3a8a' : brandAccent 
            }}
          />
        )}

        {/* ========================================================= */}
        {/* 2. HEADER BLOCK: TOP-LEFT LOGO & DOCUMENT NUMBER */}
        {/* ========================================================= */}
        <div className={`flex justify-between items-start pb-6 mb-6 ${
          isExecutiveCrest 
            ? 'border-b-4 border-double border-slate-900' 
            : isMinimalSwiss 
            ? 'border-b-2 border-slate-950 pt-2' 
            : 'border-b border-slate-200'
        }`}>
          {/* Left: Organization Brand & Top-Left Logo */}
          <div className="max-w-[420px]">
            {/* Top-Left Company Logo (Prominently placed at top-left) */}
            {showLogo && (
              <div className="mb-3 flex items-center">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={companyName} 
                    className="max-h-14 w-auto max-w-[220px] object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs"
                      style={{ backgroundColor: brandAccent }}
                    >
                      <Building size={20} />
                    </div>
                    <div className="leading-tight">
                      <div className="font-extrabold tracking-tight text-slate-950 text-xs font-mono uppercase">
                        {companyName ? companyName.split(' ')[0] : 'ENTERPRISE'}
                      </div>
                      <div className="text-[7pt] text-slate-500 font-mono tracking-wider uppercase">
                        COMMERCIAL
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <span 
                className="text-[8pt] font-mono font-bold tracking-widest uppercase transition-colors"
                style={{ color: isMinimalSwiss ? '#0f172a' : isModernLedger ? '#0f172a' : brandAccent }}
              >
                {docTitleString}
              </span>
              {renderStatusBadge()}
            </div>

            <h1 className={`text-xl font-extrabold text-slate-950 mt-1 tracking-tight text-balance ${
              isExecutiveCrest ? 'font-serif' : 'font-sans'
            }`}>
              {companyName}
            </h1>

            {orgSettings.tagline && (
              <p className="text-[8pt] text-slate-500 font-medium mt-0.5">{orgSettings.tagline}</p>
            )}

            <div className="text-[8pt] text-slate-600 mt-2 space-y-0.5 leading-snug">
              <p className="text-pretty">{companyAddress}</p>
              <p>{companyEmail} • {companyCell}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-slate-700 font-medium pt-1">
                {companyVatNumber && <span>VAT Reg: {companyVatNumber}</span>}
                {companyRegNumber && <span>Co Reg: {companyRegNumber}</span>}
              </div>
            </div>
          </div>

          {/* Right: Document Identification & Dates */}
          <div className="text-right flex flex-col items-end">
            <div 
              className="px-4 py-2.5 rounded-lg border text-right shadow-2xs"
              style={{
                backgroundColor: isModernLedger ? '#0f172a' : isMinimalSwiss ? '#f8fafc' : `${brandAccent}0D`,
                borderColor: isModernLedger ? '#0f172a' : isMinimalSwiss ? '#cbd5e1' : `${brandAccent}40`
              }}
            >
              <span className={`text-[7.5pt] font-mono uppercase tracking-wider block font-bold ${
                isModernLedger ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {docNumberLabel}
              </span>
              <span 
                className="text-lg font-black font-mono tracking-wide tabular-nums"
                style={{ color: isModernLedger ? '#ffffff' : brandAccent }}
              >
                {docNumber}
              </span>
            </div>

            <div className="mt-3 text-[8pt] text-slate-600 space-y-1">
              <div>
                <span className="text-slate-500">{dateLabel}:</span>{' '}
                <strong className="text-slate-900 font-mono tabular-nums">{issueDate}</strong>
              </div>
              {dueDate && (
                <div>
                  <span className="text-slate-500">{dueDateLabel}:</span>{' '}
                  <strong className="text-slate-900 font-mono tabular-nums">{dueDate}</strong>
                </div>
              )}
              {data.parentQuoteNumber && (
                <div className="text-[7.5pt] font-mono text-slate-500 pt-0.5">
                  Linked Quote: <span className="font-bold text-slate-800">{data.parentQuoteNumber}</span>
                </div>
              )}
              {data.linkedInvoiceNumber && (
                <div className="text-[7.5pt] font-mono text-slate-500 pt-0.5">
                  Linked Invoice: <span className="font-bold text-slate-800">{data.linkedInvoiceNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. CLIENT INFORMATION & FINANCIAL CALLOUT CARD */}
        {/* ========================================================= */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 p-4 rounded-xl border ${
          isModernLedger ? 'bg-slate-50 border-slate-300' :
          isExecutiveCrest ? 'bg-amber-50/20 border-amber-200/70' :
          isMinimalSwiss ? 'bg-slate-50/60 border-slate-300' :
          'bg-slate-50/80 border-slate-200/80'
        }`}>
          {/* Client Details (Clean Commercial Layout — Zero Synthetic Badges) */}
          <div>
            <div className="mb-1.5">
              <span className="text-[7.5pt] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                {clientHeading}
              </span>
            </div>

            <h3 className={`text-sm font-bold text-slate-950 text-balance ${isExecutiveCrest ? 'font-serif' : 'font-sans'}`}>
              {clientName}
            </h3>

            {clientContact && (
              <p className="text-[8pt] text-slate-700 font-medium mt-0.5">
                Attn: {clientContact}
              </p>
            )}

            {clientAddress && (
              <p className="text-[8pt] text-slate-600 mt-1 whitespace-pre-line text-pretty">
                {clientAddress}
              </p>
            )}

            <div className="text-[8pt] text-slate-500 mt-1.5 space-y-0.5 font-mono">
              {(clientEmail || clientPhone) && (
                <p>{clientEmail} {clientEmail && clientPhone ? '•' : ''} {clientPhone}</p>
              )}
              {clientVat && (
                <p className="text-slate-700 font-semibold">Client VAT: {clientVat}</p>
              )}
            </div>
          </div>

          {/* Financial Callout */}
          <div className="text-right flex flex-col justify-between sm:border-l sm:border-slate-200/80 sm:pl-6">
            <div>
              <span className="text-[7.5pt] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
                {docType === 'quote' 
                  ? 'TOTAL ESTIMATED INVESTMENT' 
                  : docType === 'receipt'
                  ? 'TOTAL SETTLED AMOUNT'
                  : 'TOTAL INVOICE AMOUNT'}
              </span>

              <div className="text-2xl font-black text-slate-950 font-mono tracking-tight tabular-nums">
                {currencySymbol}{totals.grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Contextual Balance or Settlement Notice */}
            <div className="mt-2 text-right">
              {docType === 'invoice' && (
                <div className="inline-flex items-center gap-1.5 text-[8pt] font-mono">
                  {totals.balanceDue <= 0.01 ? (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ INVOICE FULLY SETTLED
                    </span>
                  ) : (
                    <div className="bg-amber-50/80 border border-amber-200 px-2.5 py-1 rounded text-right">
                      <span className="text-[7.5pt] text-amber-800 uppercase block font-semibold">Balance Due:</span>
                      <span className="text-sm font-extrabold text-amber-900 tabular-nums">
                        {currencySymbol}{totals.balanceDue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {docType === 'quote' && data.depositRequiredPercent ? (
                <div className="bg-purple-50/80 border border-purple-200 px-2.5 py-1 rounded text-right inline-block">
                  <span className="text-[7.5pt] text-purple-800 uppercase block font-semibold">
                    {data.depositRequiredPercent}% Deposit Required:
                  </span>
                  <span className="text-sm font-extrabold text-purple-900 tabular-nums">
                    {currencySymbol}{(totals.grandTotal * (data.depositRequiredPercent / 100)).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ) : null}

              {docType === 'receipt' && (
                <div className="inline-flex items-center gap-1 text-[8pt] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Official SARS Tax Receipt • Verified Settlement
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. LINE ITEMS TABLE (Crisp Borders Separating All Columns) */}
        {/* ========================================================= */}
        <div className="mb-6 overflow-hidden">
          <table 
            className="w-full text-left text-[8.5pt]"
            style={{ 
              borderCollapse: 'collapse', 
              width: '100%',
              border: `1px solid ${tableBorderColor}`
            }}
          >
            <thead>
              <tr 
                className={`uppercase font-mono tracking-wider text-[7.5pt] ${
                  isModernLedger ? 'bg-slate-900 text-white' :
                  isExecutiveCrest ? 'bg-slate-900 text-amber-100' :
                  isMinimalSwiss ? 'bg-slate-100 text-slate-900' :
                  'bg-slate-100 text-slate-900'
                }`}
                style={{ 
                  borderBottom: `2px solid ${isModernLedger ? '#0f172a' : brandAccent}`
                }}
              >
                <th 
                  className="py-2.5 px-3 font-bold"
                  style={{ border: `1px solid ${tableBorderColor}`, width: '42%' }}
                >
                  {docType === 'quote' ? 'Scope / Deliverable Description' : 'Item Description & Service Scope'}
                </th>
                <th 
                  className="py-2.5 px-2 text-center font-bold"
                  style={{ border: `1px solid ${tableBorderColor}`, width: '13%' }}
                >
                  Units / Qty
                </th>
                <th 
                  className="py-2.5 px-3 text-right font-bold"
                  style={{ border: `1px solid ${tableBorderColor}`, width: '15%' }}
                >
                  Rate / Unit Price
                </th>
                <th 
                  className="py-2.5 px-3 text-right font-bold"
                  style={{ border: `1px solid ${tableBorderColor}`, width: '14%' }}
                >
                  Discount
                </th>
                <th 
                  className="py-2.5 px-3 text-right font-bold"
                  style={{ border: `1px solid ${tableBorderColor}`, width: '16%' }}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.length === 0 ? (
                <tr>
                  <td 
                    colSpan={5} 
                    className="py-6 text-center text-slate-400 italic font-mono text-[8pt]"
                    style={{ border: `1px solid ${tableBorderColor}` }}
                  >
                    No line items added yet.
                  </td>
                </tr>
              ) : (
                lineItems.map((item, idx) => {
                  const gross = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                  const discountVal = item.discountPct ? gross * (item.discountPct / 100) : 0;
                  const net = Math.max(0, gross - discountVal);

                  return (
                    <tr 
                      key={item.id || idx} 
                      className="break-inside-avoid even:bg-slate-50/50 hover:bg-slate-50/80 transition-colors"
                    >
                      <td 
                        className="py-2.5 px-3 text-slate-900"
                        style={{ border: `1px solid ${tableBorderColor}` }}
                      >
                        <div className="font-semibold text-slate-900 leading-snug">{item.description}</div>
                        {item.details && (
                          <div className="text-[7.5pt] text-slate-500 mt-0.5 leading-relaxed text-pretty">
                            {item.details}
                          </div>
                        )}
                      </td>
                      <td 
                        className="py-2.5 px-2 text-center text-slate-700 font-mono tabular-nums whitespace-nowrap"
                        style={{ border: `1px solid ${tableBorderColor}` }}
                      >
                        <span>{item.quantity}</span> {item.unit ? <span className="text-[7pt] text-slate-500">{item.unit}</span> : ''}
                      </td>
                      <td 
                        className="py-2.5 px-3 text-right text-slate-700 font-mono tabular-nums whitespace-nowrap"
                        style={{ border: `1px solid ${tableBorderColor}` }}
                      >
                        {currencySymbol}{(Number(item.unitPrice) || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td 
                        className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap text-[8pt]"
                        style={{ border: `1px solid ${tableBorderColor}` }}
                      >
                        {item.discountPct ? (
                          <span className="text-emerald-700 font-bold">{item.discountPct}%</span>
                        ) : (
                          <span className="text-slate-400">0%</span>
                        )}
                      </td>
                      <td 
                        className="py-2.5 px-3 text-right text-slate-950 font-bold font-mono tabular-nums whitespace-nowrap"
                        style={{ border: `1px solid ${tableBorderColor}` }}
                      >
                        {currencySymbol}{net.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* ========================================================= */}
          {/* 5. FINANCIAL SUMMARY TOTALS BLOCK */}
          {/* ========================================================= */}
          <div className="flex justify-end mt-4 break-inside-avoid">
            <div className="w-80 space-y-1.5 text-[8.5pt]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Net):</span>
                <span className="font-mono tabular-nums">
                  {currencySymbol}{totals.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Document Discount:</span>
                  <span className="font-mono tabular-nums">
                    -{currencySymbol}{discountAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Standard VAT ({vatRate}%):</span>
                <span className="font-mono tabular-nums">
                  {currencySymbol}{totals.vatTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div 
                className={`flex justify-between text-sm font-black pt-2 ${
                  isModernLedger ? 'bg-slate-950 text-white p-2.5 rounded-lg' :
                  isExecutiveCrest ? 'text-slate-950 border-t-2 border-slate-900 border-b-2 pb-1' :
                  'text-slate-950 border-t-2'
                }`}
                style={!isModernLedger && !isExecutiveCrest ? { borderTopColor: brandAccent } : {}}
              >
                <span>Grand Total:</span>
                <span 
                  className="font-mono tabular-nums"
                  style={!isModernLedger ? { color: brandAccent } : { color: '#ffffff' }}
                >
                  {currencySymbol}{totals.grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Amount Paid & Balance Due for Invoices */}
              {docType === 'invoice' && payments.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Total Paid to Date:</span>
                    <span className="font-mono tabular-nums text-emerald-700 font-bold">
                      {currencySymbol}{totals.amountPaid.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-900 bg-slate-100/90 p-1.5 rounded border border-slate-200">
                    <span>Outstanding Balance:</span>
                    <span className={`font-mono tabular-nums ${totals.balanceDue <= 0.01 ? 'text-emerald-700' : 'text-amber-800'}`}>
                      {currencySymbol}{totals.balanceDue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. PAYMENT HISTORY LOG TABLE (When payments exist on Invoice) */}
        {/* ========================================================= */}
        {docType === 'invoice' && payments.length > 0 && (
          <div className="mb-6 break-inside-avoid">
            <h4 className="text-[7.5pt] font-mono uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-1.5">
              <CreditCard size={12} className="text-emerald-600" />
              <span>Payment History & Verified Remittances</span>
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table 
                className="w-full text-left text-[7.5pt] font-mono"
                style={{ borderCollapse: 'collapse', width: '100%' }}
              >
                <thead className="bg-slate-100 text-slate-700 uppercase">
                  <tr>
                    <th className="py-1.5 px-3 font-bold" style={{ border: '1px solid #cbd5e1' }}>Receipt No</th>
                    <th className="py-1.5 px-3 font-bold" style={{ border: '1px solid #cbd5e1' }}>Date</th>
                    <th className="py-1.5 px-3 font-bold" style={{ border: '1px solid #cbd5e1' }}>Method</th>
                    <th className="py-1.5 px-3 font-bold" style={{ border: '1px solid #cbd5e1' }}>Reference</th>
                    <th className="py-1.5 px-3 text-right font-bold" style={{ border: '1px solid #cbd5e1' }}>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, pIdx) => (
                    <tr key={p.id || pIdx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-bold text-slate-900" style={{ border: '1px solid #cbd5e1' }}>{p.receiptNumber}</td>
                      <td className="py-1.5 px-3 text-slate-600" style={{ border: '1px solid #cbd5e1' }}>{p.paymentDate}</td>
                      <td className="py-1.5 px-3 text-slate-700" style={{ border: '1px solid #cbd5e1' }}>{p.method}</td>
                      <td className="py-1.5 px-3 text-slate-500" style={{ border: '1px solid #cbd5e1' }}>{p.reference}</td>
                      <td className="py-1.5 px-3 text-right text-emerald-800 font-bold tabular-nums" style={{ border: '1px solid #cbd5e1' }}>
                        {currencySymbol}{(Number(p.amount) || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. OFFICIAL SETTLEMENT BANNER FOR PAYMENT RECEIPTS */}
        {/* ========================================================= */}
        {docType === 'receipt' && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between break-inside-avoid">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div className="text-[8.5pt] font-extrabold text-emerald-950 uppercase tracking-wide">
                  FULL TRANSACTION SETTLED & ACKNOWLEDGED
                </div>
                <div className="text-[7.5pt] text-emerald-800 mt-0.5">
                  Method: <strong>{data.paymentMethod || payments[0]?.method || 'EFT'}</strong> • Reference: <strong>{data.receiptReference || payments[0]?.reference || 'DIRECT-REMITTANCE'}</strong>
                </div>
              </div>
            </div>
            <div className="text-right font-mono text-[8pt] text-emerald-900 font-bold">
              STATUS: PAID IN FULL
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 8. FOOTER: BANKING DETAILS / QUOTE ACCEPTANCE / SIGN-OFF */}
      {/* ========================================================= */}
      <div className={`pt-6 break-inside-avoid ${
        isExecutiveCrest ? 'border-t-4 border-double border-slate-900' : 'border-t-2 border-slate-900/40'
      }`}>
        {docType === 'quote' ? (
          /* Quote Acceptance Block */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[8pt]">
              <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wider text-[7.5pt]">
                Terms & Conditions of Proposal
              </span>
              <p className="text-slate-600 whitespace-pre-line leading-relaxed text-pretty">
                {paymentTerms || "1. Quotation valid for 30 calendar days from issue date.\n2. 50% deposit required upon confirmation before project kick-off."}
              </p>
            </div>

            <div className="space-y-3 text-[8pt] text-slate-700">
              <div className="border-b border-slate-300 pb-1">
                <span className="text-[7pt] text-slate-400 block font-mono">ACCEPTANCE SIGNATURE:</span>
                <div className="h-6" />
              </div>
              <div className="flex justify-between gap-4">
                <div className="border-b border-slate-300 pb-1 flex-1">
                  <span className="text-[7pt] text-slate-400 block font-mono">AUTHORIZED NAME:</span>
                  <div className="h-4" />
                </div>
                <div className="border-b border-slate-300 pb-1 w-28">
                  <span className="text-[7pt] text-slate-400 block font-mono">DATE:</span>
                  <div className="h-4" />
                </div>
              </div>
            </div>
          </div>
        ) : docType === 'receipt' ? (
          /* Receipt Sign-off Block */
          <div className="flex justify-between items-end text-[8pt]">
            <div>
              <span className="text-slate-500 block mb-2">Received on behalf of {companyName}:</span>
              <div className="font-bold text-slate-950 text-xs">{data.receivedByName || accountHolder}</div>
              <div className="text-slate-500 font-mono text-[7.5pt]">Authorized Finance Directorate & Cashier</div>
            </div>

            <div className="text-right text-[7.5pt] text-slate-500 font-mono space-y-0.5">
              <div className="font-semibold text-slate-700">Official Payment Remittance Slip</div>
              <div>Electronic settlement confirmed • SARS compliant</div>
            </div>
          </div>
        ) : (
          /* Tax Invoice Banking & Terms Block */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[8pt]">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2 uppercase tracking-wide text-[7.5pt]">
                <CreditCard size={13} style={{ color: brandAccent }} />
                <span>Banking & EFT Remittance Details</span>
              </div>
              <div className="space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank:</span>
                  <strong className="text-slate-900">{bankName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Holder:</span>
                  <span>{accountHolder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Number:</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">{accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Branch Code:</span>
                  <span className="font-mono tabular-nums">{branchCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Type:</span>
                  <span>{accountType}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 flex justify-between font-mono text-[7.5pt]">
                  <span className="text-slate-500">Payment Reference:</span>
                  <strong style={{ color: brandAccent }}>{docNumber}</strong>
                </div>
              </div>
            </div>

            <div className="text-right text-[8pt] text-slate-600 space-y-1">
              <p className="font-semibold text-slate-900">Payment Terms & Instructions:</p>
              <p className="leading-relaxed text-pretty text-[7.5pt]">
                {paymentTerms || "Payment due strictly within 14 calendar days of tax invoice date."}
              </p>
              <div className="pt-2 text-[7pt] text-slate-400 font-mono">
                Official Tax Invoice • Value-Added Tax Act, 1991 • SARS VAT Compliant
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
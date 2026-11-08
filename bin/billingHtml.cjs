/**
 * billingHtml.cjs
 * Executive Commercial Billing Document HTML Generator for DocStudio CLI
 * 
 * Generates print-ready, high-fidelity A4 accounting documents
 * (Quotations, Tax Invoices & Official Payment Receipts) across 4 themes:
 * - classic-zoho
 * - modern-ledger
 * - minimal-swiss
 * - executive-crest
 */

const DEFAULT_BRAND_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" fill="none"><rect width="36" height="36" y="2" rx="7" fill="%23059669"/><path d="M11 27L18 13L25 27M13.5 22.5H22.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="27" cy="13" r="2.5" fill="%2334d399"/><text x="44" y="21" font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="800" font-size="14" fill="%230f172a" letter-spacing="-0.03em">APEX</text><text x="84" y="21" font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="500" font-size="14" fill="%23059669" letter-spacing="-0.02em">CLOUD</text><text x="44" y="33" font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="600" font-size="7.5" fill="%2364748b" letter-spacing="0.08em">COMMERCIAL SOLUTIONS</text></svg>`;

function formatCurrency(amount, currency = 'ZAR') {
  const symbol = currency === 'ZAR' ? 'R ' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : `${currency} `;
  return symbol + Number(amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function generateBillingHtml(doc, settings, templateId = 'classic-zoho') {
  const isMinimalSwiss = templateId.includes('swiss') || templateId.includes('minimal');
  const isExecutiveCrest = templateId.includes('crest') || templateId.includes('executive');
  const isModernLedger = templateId.includes('ledger') || templateId.includes('agency') || templateId.includes('modern');

  const brandAccent = isModernLedger ? '#0f172a' : isExecutiveCrest ? '#1e3a8a' : isMinimalSwiss ? '#18181b' : (settings.accentColor || '#059669');
  const logoUrl = doc.companyLogoUrl || settings.logoUrl || DEFAULT_BRAND_LOGO_SVG;

  const docTitle = doc.docType === 'quote' 
    ? 'COMMERCIAL QUOTATION' 
    : doc.docType === 'receipt' 
    ? 'OFFICIAL PAYMENT RECEIPT' 
    : 'TAX INVOICE';

  const docNumberLabel = doc.docType === 'quote' ? 'QUOTE NO' : doc.docType === 'receipt' ? 'RECEIPT NO' : 'INVOICE NO';
  const clientHeading = doc.docType === 'quote' ? 'PROPOSAL PREPARED FOR' : doc.docType === 'receipt' ? 'RECEIVED FROM' : 'BILLED TO (CLIENT)';

  const tableBorder = isModernLedger ? '#94a3b8' : '#cbd5e1';
  const headerBg = isModernLedger ? '#0f172a' : isExecutiveCrest ? '#0f172a' : isMinimalSwiss ? '#f1f5f9' : '#f8fafc';
  const headerColor = (isModernLedger || isExecutiveCrest) ? '#ffffff' : '#0f172a';

  const lineItemsHtml = (doc.lineItems || []).map(item => {
    const gross = (Number(item.quantity) || 0) * (Number(item.unitPrice || item.rate) || 0);
    const discPct = Number(item.discountPct) || 0;
    const discountVal = discPct ? gross * (discPct / 100) : 0;
    const net = Math.max(0, gross - discountVal);

    return `
      <tr style="background: #ffffff;">
        <td style="border: 1px solid ${tableBorder}; padding: 10px 12px; vertical-align: middle;">
          <div style="font-weight: 600; color: #0f172a; font-size: 8.5pt;">${item.description}</div>
          ${item.details ? `<div style="font-size: 7.5pt; color: #64748b; margin-top: 3px;">${item.details}</div>` : ''}
        </td>
        <td style="border: 1px solid ${tableBorder}; padding: 10px 8px; text-align: center; font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; vertical-align: middle;">
          ${item.quantity} ${item.unit ? `<span style="font-size: 7pt; color: #64748b;">${item.unit}</span>` : ''}
        </td>
        <td style="border: 1px solid ${tableBorder}; padding: 10px 12px; text-align: right; font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; vertical-align: middle;">
          ${formatCurrency(item.unitPrice || item.rate, doc.currency)}
        </td>
        <td style="border: 1px solid ${tableBorder}; padding: 10px 12px; text-align: right; font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; vertical-align: middle;">
          ${discPct > 0 ? `<span style="color: #059669; font-weight: bold;">${discPct}%</span>` : `<span style="color: #94a3b8;">0%</span>`}
        </td>
        <td style="border: 1px solid ${tableBorder}; padding: 10px 12px; text-align: right; font-weight: bold; font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; vertical-align: middle; color: #0f172a;">
          ${formatCurrency(net, doc.currency)}
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${docTitle} - ${doc.docNumber}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090b10;
      color: #0f172a;
      font-family: ${isExecutiveCrest ? "'Playfair Display', serif" : "'Plus Jakarta Sans', -apple-system, sans-serif"};
      font-size: 9pt;
      line-height: 1.4;
      padding: 24px 12px;
      -webkit-font-smoothing: antialiased;
    }
    .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
    .action-bar {
      max-width: 210mm;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary { background: #059669; color: white; border: none; }
    .btn-secondary { background: #1e293b; color: #f8fafc; border: 1px solid #334155; }
    .page-sheet {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #ffffff;
      padding: 44px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    table { border-collapse: collapse !important; width: 100%; }
    th, td { border: 1px solid ${tableBorder} !important; }
    @media print {
      body { background: white !important; padding: 0 !important; }
      .action-bar { display: none !important; }
      .page-sheet { box-shadow: none !important; margin: 0 !important; width: 100% !important; min-height: 100% !important; padding: 25px 35px !important; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <div style="color: #94a3b8; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
      📄 ${doc.docNumber} • ${docTitle} (${templateId})
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" class="btn btn-primary">🖨️ Print / Save as PDF</button>
      <a href="https://docstudio-lovat.vercel.app/" target="_blank" class="btn btn-secondary">🌐 DocStudio App</a>
    </div>
  </div>

  <div class="page-sheet">
    <div>
      ${!isMinimalSwiss ? `<div style="height: 5px; background: ${brandAccent}; border-radius: 2px 2px 0 0; margin-bottom: 24px;"></div>` : ''}

      <!-- Header: Top-Left Logo & Issuer Details -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 22px; margin-bottom: 22px; border-bottom: ${isExecutiveCrest ? '4px double #0f172a' : isMinimalSwiss ? '2px solid #0f172a' : '1px solid #e2e8f0'};">
        <div style="max-width: 420px;">
          <!-- Top-Left Logo (Prominently placed at top-left) -->
          <div style="margin-bottom: 12px;">
            <img src="${logoUrl}" alt="${settings.companyName}" style="max-height: 56px; max-width: 220px; object-fit: contain; display: block;" />
          </div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 8pt; font-weight: bold; letter-spacing: 0.08em; text-transform: uppercase; color: ${brandAccent};">
            ${docTitle}
          </div>
          <h1 style="font-size: 18pt; font-weight: 800; color: #020617; margin-top: 4px; letter-spacing: -0.02em;">
            ${settings.companyName}
          </h1>
          ${settings.tagline ? `<div style="font-size: 8pt; color: #64748b; margin-top: 2px;">${settings.tagline}</div>` : ''}
          <div style="font-size: 8pt; color: #475569; margin-top: 8px; line-height: 1.4;">
            <div>${settings.address}</div>
            <div>${settings.email} • ${settings.phone}</div>
            <div class="mono" style="margin-top: 4px; color: #334155;">
              VAT Reg: ${settings.vatNumber} • Co Reg: ${settings.regNumber}
            </div>
          </div>
        </div>

        <!-- Document Identification -->
        <div style="text-align: right;">
          <div style="background: ${isModernLedger ? '#0f172a' : `${brandAccent}0D`}; border: 1px solid ${isModernLedger ? '#0f172a' : `${brandAccent}40`}; padding: 10px 16px; border-radius: 8px;">
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 7.5pt; text-transform: uppercase; font-weight: bold; color: ${isModernLedger ? '#94a3b8' : '#64748b'};">
              ${docNumberLabel}
            </div>
            <div class="mono" style="font-size: 16pt; font-weight: 900; color: ${isModernLedger ? '#ffffff' : brandAccent};">
              ${doc.docNumber}
            </div>
          </div>
          <div style="margin-top: 12px; font-size: 8pt; color: #475569; line-height: 1.5;">
            <div>Date: <strong class="mono" style="color: #0f172a;">${doc.issueDate}</strong></div>
            <div>Due: <strong class="mono" style="color: #0f172a;">${doc.dueDate}</strong></div>
          </div>
        </div>
      </div>

      <!-- Client & Financial Callout Card (Zero Synthetic Badges) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 16px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 24px;">
        <div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 7.5pt; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">
            ${clientHeading}
          </div>
          <div style="font-size: 11pt; font-weight: bold; color: #020617;">
            ${doc.clientSnapshot?.name || 'Client Name'}
          </div>
          ${doc.clientSnapshot?.contactPerson ? `<div style="font-size: 8pt; color: #334155; margin-top: 2px;">Attn: ${doc.clientSnapshot.contactPerson}</div>` : ''}
          ${doc.clientSnapshot?.billingAddress ? `<div style="font-size: 8pt; color: #475569; margin-top: 4px;">${doc.clientSnapshot.billingAddress}</div>` : ''}
          <div class="mono" style="font-size: 8pt; color: #64748b; margin-top: 6px;">
            ${doc.clientSnapshot?.email ? `<span>${doc.clientSnapshot.email}</span>` : ''}
            ${doc.clientSnapshot?.vatNumber ? `<div style="color: #334155; font-weight: 600; margin-top: 2px;">VAT: ${doc.clientSnapshot.vatNumber}</div>` : ''}
          </div>
        </div>

        <div style="text-align: right; display: flex; flex-direction: column; justify-content: space-between; border-left: 1px solid #e2e8f0; padding-left: 20px;">
          <div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 7.5pt; font-weight: bold; color: #64748b; text-transform: uppercase;">
              TOTAL INVOICE AMOUNT
            </div>
            <div class="mono" style="font-size: 20pt; font-weight: 900; color: #020617; margin-top: 4px;">
              ${formatCurrency(doc.grandTotal, doc.currency)}
            </div>
          </div>
          <div>
            ${doc.balanceDue <= 0.01 
              ? `<span style="background: #ecfdf5; color: #065f46; font-family: 'JetBrains Mono', monospace; font-size: 8pt; font-weight: bold; padding: 4px 10px; border-radius: 4px; border: 1px solid #a7f3d0;">✓ INVOICE FULLY SETTLED</span>` 
              : `<div style="background: #fffbeb; border: 1px solid #fde68a; padding: 6px 12px; border-radius: 6px; display: inline-block;">
                   <span style="font-size: 7.5pt; color: #92400e; display: block; font-weight: 600;">Balance Due:</span>
                   <span class="mono" style="font-size: 11pt; font-weight: 800; color: #78350f;">${formatCurrency(doc.balanceDue, doc.currency)}</span>
                 </div>`
            }
          </div>
        </div>
      </div>

      <!-- Line Items Table (Crisp Explicit Borders on All Cells) -->
      <div style="margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; border: 1px solid ${tableBorder};">
          <thead>
            <tr style="background: ${headerBg}; color: ${headerColor};">
              <th style="border: 1px solid ${tableBorder}; padding: 10px 12px; text-align: left; font-size: 7.5pt; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; width: 42%;">
                Item Description & Service Scope
              </th>
              <th style="border: 1px solid ${tableBorder}; padding: 10px 8px; text-align: center; font-size: 7.5pt; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; width: 13%;">
                Units / Qty
              </th>
              <th style="border: 1px solid ${tableBorder}; padding: 10px 12px; text-align: right; font-size: 7.5pt; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; width: 15%;">
                Rate
              </th>
              <th style="border: 1px solid ${tableBorder}; padding: 10px 12px; text-align: right; font-size: 7.5pt; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; width: 14%;">
                Discount
              </th>
              <th style="border: 1px solid ${tableBorder}; padding: 10px 12px; text-align: right; font-size: 7.5pt; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; width: 16%;">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHtml}
          </tbody>
        </table>

        <!-- Totals Box -->
        <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
          <div style="width: 320px; font-size: 8.5pt;">
            <div style="display: flex; justify-content: space-between; color: #475569; padding: 4px 0;">
              <span>Subtotal (Net):</span>
              <span class="mono">${formatCurrency(doc.subtotal, doc.currency)}</span>
            </div>
            ${doc.discountAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; color: #059669; padding: 4px 0;">
                <span>Document Discount:</span>
                <span class="mono">-${formatCurrency(doc.discountAmount, doc.currency)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; color: #475569; padding: 4px 0;">
              <span>Standard VAT (15%):</span>
              <span class="mono">${formatCurrency(doc.vatTotal, doc.currency)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11pt; font-weight: 800; color: #020617; padding-top: 8px; border-top: 2px solid ${brandAccent}; margin-top: 4px;">
              <span>Grand Total:</span>
              <span class="mono" style="color: ${brandAccent};">${formatCurrency(doc.grandTotal, doc.currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer: Banking Remittance & Legal Note -->
    <div style="border-top: 2px solid #0f172a; padding-top: 20px; margin-top: 24px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: flex-start;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; font-size: 8pt;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 7.5pt; color: #0f172a; margin-bottom: 8px;">
            🏦 Banking & EFT Remittance Details
          </div>
          <div style="color: #334155; line-height: 1.6;">
            <div>Bank: <strong>${settings.bankName}</strong></div>
            <div>Account Holder: ${settings.accountHolder}</div>
            <div class="mono">Account Number: <strong>${settings.accountNumber}</strong></div>
            <div class="mono">Branch Code: ${settings.branchCode} (${settings.accountType})</div>
            <div class="mono" style="margin-top: 4px; border-top: 1px solid #cbd5e1; padding-top: 4px;">
              Payment Reference: <strong style="color: ${brandAccent};">${doc.docNumber}</strong>
            </div>
          </div>
        </div>

        <div style="text-align: right; font-size: 8pt; color: #475569;">
          <div style="font-weight: 600; color: #0f172a; margin-bottom: 4px;">Payment Terms & Conditions:</div>
          <div style="font-size: 7.5pt; line-height: 1.5;">${settings.paymentTerms}</div>
          <div class="mono" style="font-size: 7pt; color: #94a3b8; margin-top: 12px;">
            Official Tax Invoice • Value-Added Tax Act, 1991 • SARS VAT Compliant
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

module.exports = {
  generateBillingHtml,
  DEFAULT_BRAND_LOGO_SVG
};

import { ICONS } from '../../utils/icons.js';
import { formGroup, formRow, formRow3, initRepeater, collectFormData, collectRepeaterData, showToast, autoSave, autoLoad } from '../../utils/form-helpers.js';
import { generateInvoicePDF, INVOICE_TEMPLATES } from './InvoicePDF.js';
import { getPreviewTheme } from '../../utils/preview-styles.js';

export function renderInvoicePage(container) {
  const templateCards = INVOICE_TEMPLATES.map((t, i) => `
    <div class="template-card ${i === 0 ? 'active' : ''}" data-template="${t.id}">
      <div class="template-card-icon">${t.icon}</div>
      <div class="template-card-name">${t.name}</div>
      <div class="template-card-desc">${t.desc}</div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Tax Invoice Generator</h1>
        <p class="page-subtitle">Create professional tax invoices with automatic calculations and multiple template styles.</p>
      </div>

      <div class="section-header">
        <div class="section-title">Choose Template</div>
        <span class="badge badge-green">${INVOICE_TEMPLATES.length} templates</span>
      </div>
      <div class="template-grid">${templateCards}</div>

      <div class="split-pane">
        <div class="form-panel" id="invoiceForm">
          <div class="section-header"><div class="section-title">Invoice Details</div></div>
          ${formRow3(
    formGroup('Invoice Number', 'invoiceNumber', 'text', 'INV-001', true),
    formGroup('Invoice Date', 'invoiceDate', 'date', '', true),
    formGroup('Due Date', 'dueDate', 'date')
  )}

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Your Business Details</div></div>
          ${formRow(
    formGroup('Business Name', 'sellerName', 'text', 'Your Company (Pty) Ltd', true),
    formGroup('Registration / VAT No.', 'sellerVat', 'text', '4123456789')
  )}
          ${formGroup('Address', 'sellerAddress', 'textarea', '123 Business Street\nJohannesburg, 2000\nSouth Africa')}
          ${formRow(
    formGroup('Email', 'sellerEmail', 'email', 'billing@company.com'),
    formGroup('Phone', 'sellerPhone', 'tel', '+27 11 123 4567')
  )}

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Bill To</div></div>
          ${formRow(
    formGroup('Client Name', 'buyerName', 'text', 'Client Company', true),
    formGroup('Client VAT No.', 'buyerVat', 'text', '')
  )}
          ${formGroup('Client Address', 'buyerAddress', 'textarea', 'Client address...')}
          ${formRow(
    formGroup('Client Email', 'buyerEmail', 'email', ''),
    formGroup('Client Phone', 'buyerPhone', 'tel', '')
  )}

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Line Items</div></div>
          <div data-repeater="items">
            <div class="repeater-item">
              <div class="repeater-item-header">
                <span class="repeater-item-number">Item 1</span>
                <button class="repeater-remove">×</button>
              </div>
              ${formGroup('Description', 'itemDesc', 'text', 'Web Development Services')}
              ${formRow3(
    formGroup('Quantity', 'itemQty', 'number', '1'),
    formGroup('Unit Price (R)', 'itemPrice', 'number', '0.00'),
    formGroup('Amount', 'itemAmount', 'text', 'R0.00')
  )}
            </div>
            <button class="repeater-add">${ICONS.plus} Add Line Item</button>
          </div>

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Tax & Notes</div></div>
          ${formRow(
    formGroup('VAT Rate (%)', 'taxRate', 'number', '15', false, '15'),
    formGroup('Discount (%)', 'discount', 'number', '0', false, '0')
  )}
          ${formGroup('Notes / Payment Terms', 'notes', 'textarea', 'Payment due within 30 days.\nBank: FNB\nAccount: 12345678')}
          
          <div class="action-bar">
            <button class="btn btn-primary btn-lg btn-block" id="generateInvoiceBtn">
              ${ICONS.download} Generate & Download PDF
            </button>
          </div>
        </div>

        <div class="preview-panel" id="invoicePreview">
          <div class="preview-placeholder">
            <div>
              <div style="font-size:40px;margin-bottom:16px;">🧾</div>
              <div style="font-size:15px;font-weight:600;color:#333;margin-bottom:8px;">Invoice Preview</div>
              <div style="font-size:12px;color:#999;">Fill in the form to see a preview</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  let selectedTemplate = INVOICE_TEMPLATES[0].id;
  container.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedTemplate = card.dataset.template;
      updatePreview();
    });
  });

  const form = container.querySelector('#invoiceForm');

  // Auto-calculate line item amounts
  form.addEventListener('input', (e) => {
    if (e.target.dataset.field === 'itemQty' || e.target.dataset.field === 'itemPrice') {
      const item = e.target.closest('.repeater-item');
      if (item) {
        const qty = parseFloat(item.querySelector('[data-field="itemQty"]')?.value || 0);
        const price = parseFloat(item.querySelector('[data-field="itemPrice"]')?.value || 0);
        const amountField = item.querySelector('[data-field="itemAmount"]');
        if (amountField) amountField.value = `R${(qty * price).toFixed(2)}`;
      }
    }
    clearTimeout(form._previewTimer);
    form._previewTimer = setTimeout(updatePreview, 300);
  });

  function updatePreview() {
    const data = collectFormData(form);
    const items = collectRepeaterData(form, 'items');
    const preview = container.querySelector('#invoicePreview');
    const t = getPreviewTheme(selectedTemplate);

    if (!data.sellerName && !data.invoiceNumber) {
      preview.innerHTML = `<div class="preview-placeholder"><div><div style="font-size:40px;margin-bottom:16px;">🧾</div><div style="font-size:15px;font-weight:600;color:#333;">Invoice Preview</div><div style="font-size:12px;color:#999;">Fill in the form to see a preview</div></div></div>`;
      return;
    }

    const taxRate = parseFloat(data.taxRate || 15) / 100;
    const discount = parseFloat(data.discount || 0) / 100;
    let subtotal = 0;
    items.forEach(item => subtotal += parseFloat(item.itemQty || 0) * parseFloat(item.itemPrice || 0));
    const discountAmt = subtotal * discount;
    const taxableAmount = subtotal - discountAmt;
    const tax = taxableAmount * taxRate;
    const total = taxableAmount + tax;

    const isBanner = selectedTemplate === 'modern' || selectedTemplate === 'bold';

    preview.innerHTML = `
      <div style="font-family:${t.font};">
        ${isBanner ? `
          <div style="background:${t.accent};color:white;padding:14px;margin:-16px -16px 16px -16px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <h1 style="font-size:18px;color:white;margin-bottom:2px;">${data.sellerName || 'Business Name'}</h1>
                <p style="font-size:9px;opacity:0.8;white-space:pre-line;">${data.sellerAddress || ''}</p>
              </div>
              <div style="text-align:right;">
                <h2 style="font-size:16px;color:white;">TAX INVOICE</h2>
                <p style="font-size:9px;opacity:0.8;">#${data.invoiceNumber || 'INV-001'}</p>
                <p style="font-size:9px;opacity:0.8;">Date: ${data.invoiceDate || '-'}</p>
              </div>
            </div>
          </div>
        ` : `
          <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
            <div>
              <h1 style="font-size:20px;color:#111;margin-bottom:4px;">${data.sellerName || 'Business Name'}</h1>
              <p style="font-size:10px;color:#666;white-space:pre-line;">${data.sellerAddress || ''}</p>
              <p style="font-size:10px;color:#666;">${data.sellerEmail || ''} | ${data.sellerPhone || ''}</p>
            </div>
            <div style="text-align:right;">
              <h2 style="font-size:18px;color:${t.accent};margin-bottom:4px;">TAX INVOICE</h2>
              <p style="font-size:10px;color:#666;">#${data.invoiceNumber || 'INV-001'}</p>
              <p style="font-size:10px;color:#666;">Date: ${data.invoiceDate || '-'}</p>
              <p style="font-size:10px;color:#666;">Due: ${data.dueDate || '-'}</p>
            </div>
          </div>
        `}

        <div style="background:${t.accentLight};padding:10px;border-radius:6px;margin-bottom:15px;border-left:3px solid ${t.accent};">
          <p style="font-size:10px;color:#999;margin-bottom:2px;">BILL TO</p>
          <p style="font-size:12px;font-weight:600;color:#111;">${data.buyerName || '-'}</p>
          <p style="font-size:10px;color:#666;white-space:pre-line;">${data.buyerAddress || ''}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:15px;">
          <thead><tr style="background:${t.accent};color:white;"><th style="padding:6px;text-align:left;">Description</th><th style="padding:6px;text-align:right;">Qty</th><th style="padding:6px;text-align:right;">Price</th><th style="padding:6px;text-align:right;">Amount</th></tr></thead>
          <tbody>${items.map(item => `<tr style="border-bottom:1px solid #eee;"><td style="padding:6px;">${item.itemDesc || '-'}</td><td style="padding:6px;text-align:right;">${item.itemQty || 0}</td><td style="padding:6px;text-align:right;">R${parseFloat(item.itemPrice || 0).toFixed(2)}</td><td style="padding:6px;text-align:right;">R${(parseFloat(item.itemQty || 0) * parseFloat(item.itemPrice || 0)).toFixed(2)}</td></tr>`).join('')}</tbody>
        </table>

        <div style="text-align:right;font-size:11px;">
          <p>Subtotal: <strong>R${subtotal.toFixed(2)}</strong></p>
          ${discountAmt > 0 ? `<p>Discount: -R${discountAmt.toFixed(2)}</p>` : ''}
          <p>VAT (${(taxRate * 100).toFixed(0)}%): R${tax.toFixed(2)}</p>
          <p style="font-size:14px;font-weight:700;color:${t.accent};margin-top:4px;">Total: R${total.toFixed(2)}</p>
        </div>

        ${data.notes ? `<div style="margin-top:15px;padding-top:10px;border-top:1px solid #eee;"><p style="font-size:9px;color:#999;margin-bottom:4px;">NOTES</p><p style="font-size:10px;color:#666;white-space:pre-line;">${data.notes}</p></div>` : ''}
      </div>
    `;
  }

  const itemRender = (n) => `
    <div class="repeater-item">
      <div class="repeater-item-header">
        <span class="repeater-item-number">Item ${n}</span>
        <button class="repeater-remove">×</button>
      </div>
      ${formGroup('Description', 'itemDesc', 'text', 'Description')}
      ${formRow3(
    formGroup('Quantity', 'itemQty', 'number', '1'),
    formGroup('Unit Price (R)', 'itemPrice', 'number', '0.00'),
    formGroup('Amount', 'itemAmount', 'text', 'R0.00')
  )}
    </div>`;

  initRepeater(form, 'items', itemRender);

  container.querySelector('#generateInvoiceBtn').addEventListener('click', () => {
    const data = collectFormData(form);
    data.items = collectRepeaterData(form, 'items');
    try {
      generateInvoicePDF(data, selectedTemplate);
      showToast('Invoice PDF generated successfully!');
    } catch (err) {
      console.error(err);
      showToast('Error generating PDF.', 'error');
    }
  });

  autoLoad('invoice', form);
  form.addEventListener('input', () => autoSave('invoice', form));
}

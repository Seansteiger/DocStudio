import { ICONS } from '../../utils/icons.js';
import { formGroup, formRow, formRow3, initRepeater, collectFormData, collectRepeaterData, showToast, autoSave, autoLoad } from '../../utils/form-helpers.js';
import { generateQuotationPDF, QUOTATION_TEMPLATES } from './QuotationPDF.js';
import { getPreviewTheme } from '../../utils/preview-styles.js';

export function renderQuotationPage(container) {
  const templateCards = QUOTATION_TEMPLATES.map((t, i) => `
    <div class="template-card ${i === 0 ? 'active' : ''}" data-template="${t.id}">
      <div class="template-card-icon">${t.icon}</div>
      <div class="template-card-name">${t.name}</div>
      <div class="template-card-desc">${t.desc}</div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Quotation Generator</h1>
        <p class="page-subtitle">Create professional business quotations with itemized pricing.</p>
      </div>

      <div class="section-header">
        <div class="section-title">Choose Template</div>
        <span class="badge badge-purple">${QUOTATION_TEMPLATES.length} templates</span>
      </div>
      <div class="template-grid">${templateCards}</div>

      <div class="split-pane">
        <div class="form-panel" id="quotationForm">
          <div class="section-header"><div class="section-title">Quote Details</div></div>
          ${formRow3(
    formGroup('Quote Number', 'quoteNumber', 'text', 'QT-001', true),
    formGroup('Quote Date', 'quoteDate', 'date', '', true),
    formGroup('Valid Until', 'validUntil', 'date')
  )}

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Your Company</div></div>
          ${formRow(
    formGroup('Company Name', 'companyName', 'text', 'Your Company', true),
    formGroup('Registration No.', 'companyReg', 'text', '')
  )}
          ${formGroup('Address', 'companyAddress', 'textarea', 'Company address...')}
          ${formRow(
    formGroup('Email', 'companyEmail', 'email', ''),
    formGroup('Phone', 'companyPhone', 'tel', '')
  )}

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Client Details</div></div>
          ${formRow(
    formGroup('Client Name', 'clientName', 'text', 'Client Company', true),
    formGroup('Contact Person', 'clientContact', 'text', '')
  )}
          ${formGroup('Client Address', 'clientAddress', 'textarea', '')}
          ${formRow(
    formGroup('Client Email', 'clientEmail', 'email', ''),
    formGroup('Client Phone', 'clientPhone', 'tel', '')
  )}

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Quote Items</div></div>
          <div data-repeater="items">
            <div class="repeater-item">
              <div class="repeater-item-header">
                <span class="repeater-item-number">Item 1</span>
                <button class="repeater-remove">×</button>
              </div>
              ${formGroup('Description', 'itemDesc', 'text', 'Service / Product description')}
              ${formRow3(
    formGroup('Quantity', 'itemQty', 'number', '1'),
    formGroup('Unit Price (R)', 'itemPrice', 'number', '0.00'),
    formGroup('Amount', 'itemAmount', 'text', 'R0.00')
  )}
            </div>
            <button class="repeater-add">${ICONS.plus} Add Item</button>
          </div>

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Additional</div></div>
          ${formRow(
    formGroup('VAT Rate (%)', 'taxRate', 'number', '15', false, '15'),
    formGroup('Discount (%)', 'discount', 'number', '0', false, '0')
  )}
          ${formGroup('Terms & Conditions', 'terms', 'textarea', '1. This quotation is valid for 30 days.\n2. Payment terms: 50% deposit, balance on completion.\n3. Prices exclude VAT unless stated.\n4. Delivery within 14 working days.')}
          ${formGroup('Notes', 'notes', 'textarea', '')}

          <div class="action-bar">
            <button class="btn btn-primary btn-lg btn-block" id="generateQuotationBtn">
              ${ICONS.download} Generate & Download PDF
            </button>
          </div>
        </div>

        <div class="preview-panel" id="quotationPreview">
          <div class="preview-placeholder">
            <div>
              <div style="font-size:40px;margin-bottom:16px;">💰</div>
              <div style="font-size:15px;font-weight:600;color:#333;margin-bottom:8px;">Quotation Preview</div>
              <div style="font-size:12px;color:#999;">Fill in the form to see a preview</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  let selectedTemplate = QUOTATION_TEMPLATES[0].id;
  container.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedTemplate = card.dataset.template;
      updatePreview();
    });
  });

  const form = container.querySelector('#quotationForm');

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
    form._previewTimer = setTimeout(() => updatePreview(), 300);
  });

  function updatePreview() {
    const data = collectFormData(form);
    const items = collectRepeaterData(form, 'items');
    const preview = container.querySelector('#quotationPreview');
    const t = getPreviewTheme(selectedTemplate);

    if (!data.companyName && !data.quoteNumber) {
      preview.innerHTML = `<div class="preview-placeholder"><div><div style="font-size:40px;margin-bottom:16px;">💰</div><div style="font-size:15px;font-weight:600;color:#333;">Quotation Preview</div></div></div>`;
      return;
    }

    const taxRate = parseFloat(data.taxRate || 15) / 100;
    const discountRate = parseFloat(data.discount || 0) / 100;
    let subtotal = 0;
    items.forEach(i => subtotal += parseFloat(i.itemQty || 0) * parseFloat(i.itemPrice || 0));
    const discountAmt = subtotal * discountRate;
    const taxable = subtotal - discountAmt;
    const tax = taxable * taxRate;
    const total = taxable + tax;

    const isBanner = selectedTemplate === 'modern' || selectedTemplate === 'creative';

    preview.innerHTML = `
      <div style="font-family:${t.font};">
        ${isBanner ? `
          <div style="background:${t.accent};color:white;padding:14px;margin:-16px -16px 16px -16px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <h1 style="font-size:18px;color:white;margin-bottom:2px;">${data.companyName || 'Company'}</h1>
                <p style="font-size:9px;opacity:0.8;white-space:pre-line;">${data.companyAddress || ''}</p>
              </div>
              <div style="text-align:right;">
                <h2 style="font-size:16px;color:white;">QUOTATION</h2>
                <p style="font-size:9px;opacity:0.8;">#${data.quoteNumber || 'QT-001'}</p>
                <p style="font-size:9px;opacity:0.8;">Date: ${data.quoteDate || '-'}</p>
                <p style="font-size:9px;opacity:0.8;">Valid: ${data.validUntil || '-'}</p>
              </div>
            </div>
          </div>
        ` : `
          <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
            <div>
              <h1 style="font-size:18px;color:#111;">${data.companyName || 'Company'}</h1>
              <p style="font-size:10px;color:#666;white-space:pre-line;">${data.companyAddress || ''}</p>
            </div>
            <div style="text-align:right;">
              <h2 style="font-size:16px;color:${t.accent};">QUOTATION</h2>
              <p style="font-size:10px;color:#666;">#${data.quoteNumber || 'QT-001'}</p>
              <p style="font-size:10px;color:#666;">Date: ${data.quoteDate || '-'}</p>
              <p style="font-size:10px;color:#666;">Valid: ${data.validUntil || '-'}</p>
            </div>
          </div>
        `}
        <div style="background:${t.accentLight};padding:10px;border-radius:6px;margin-bottom:12px;border-left:3px solid ${t.accent};">
          <p style="font-size:10px;color:#999;">QUOTED TO</p>
          <p style="font-size:12px;font-weight:600;">${data.clientName || '-'}</p>
          <p style="font-size:10px;color:#666;">${data.clientContact || ''}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:10px;margin-bottom:12px;">
          <thead><tr style="background:${t.accent};color:white;"><th style="padding:5px;text-align:left;">Description</th><th style="padding:5px;text-align:right;">Qty</th><th style="padding:5px;text-align:right;">Price</th><th style="padding:5px;text-align:right;">Amount</th></tr></thead>
          <tbody>${items.map(i => `<tr style="border-bottom:1px solid #eee;"><td style="padding:5px;">${i.itemDesc || '-'}</td><td style="padding:5px;text-align:right;">${i.itemQty || 0}</td><td style="padding:5px;text-align:right;">R${parseFloat(i.itemPrice || 0).toFixed(2)}</td><td style="padding:5px;text-align:right;">R${(parseFloat(i.itemQty || 0) * parseFloat(i.itemPrice || 0)).toFixed(2)}</td></tr>`).join('')}</tbody>
        </table>
        <div style="text-align:right;font-size:11px;margin-bottom:12px;">
          <p>Subtotal: R${subtotal.toFixed(2)}</p>
          ${discountAmt > 0 ? `<p>Discount: -R${discountAmt.toFixed(2)}</p>` : ''}
          <p>VAT: R${tax.toFixed(2)}</p>
          <p style="font-size:14px;font-weight:700;color:${t.accent};">Total: R${total.toFixed(2)}</p>
        </div>
        ${data.terms ? `<div style="border-top:1px solid #eee;padding-top:8px;"><p style="font-size:9px;color:#999;">TERMS & CONDITIONS</p><p style="font-size:9px;color:#666;white-space:pre-line;">${data.terms}</p></div>` : ''}
      </div>`;
  }

  const itemRender = (n) => `
    <div class="repeater-item">
      <div class="repeater-item-header"><span class="repeater-item-number">Item ${n}</span><button class="repeater-remove">×</button></div>
      ${formGroup('Description', 'itemDesc', 'text', 'Description')}
      ${formRow3(formGroup('Quantity', 'itemQty', 'number', '1'), formGroup('Unit Price (R)', 'itemPrice', 'number', '0.00'), formGroup('Amount', 'itemAmount', 'text', 'R0.00'))}
    </div>`;
  initRepeater(form, 'items', itemRender);

  container.querySelector('#generateQuotationBtn').addEventListener('click', () => {
    const data = collectFormData(form);
    data.items = collectRepeaterData(form, 'items');
    try {
      generateQuotationPDF(data, selectedTemplate);
      showToast('Quotation PDF generated!');
    } catch (err) { console.error(err); showToast('Error generating PDF.', 'error'); }
  });

  autoLoad('quotation', form);
  form.addEventListener('input', () => autoSave('quotation', form));
}

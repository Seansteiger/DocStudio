import { ICONS } from '../../utils/icons.js';
import { formGroup, formRow, selectGroup, collectFormData, showToast, autoSave, autoLoad } from '../../utils/form-helpers.js';
import { generateNDAPDF, NDA_TEMPLATES } from './NDAPDF.js';
import { getPreviewTheme } from '../../utils/preview-styles.js';

export function renderNDAPage(container) {
  const templateCards = NDA_TEMPLATES.map((t, i) => `
    <div class="template-card ${i === 0 ? 'active' : ''}" data-template="${t.id}">
      <div class="template-card-icon">${t.icon}</div>
      <div class="template-card-name">${t.name}</div>
      <div class="template-card-desc">${t.desc}</div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">NDA Generator</h1>
        <p class="page-subtitle">Create legally-structured non-disclosure agreements for protecting confidential information.</p>
      </div>

      <div class="section-header">
        <div class="section-title">Choose Template</div>
        <span class="badge badge-purple">${NDA_TEMPLATES.length} templates</span>
      </div>
      <div class="template-grid">${templateCards}</div>

      <div class="split-pane">
        <div class="form-panel" id="ndaForm">
          <div class="section-header"><div class="section-title">NDA Type & Details</div></div>
          ${formRow(
    selectGroup('NDA Type', 'ndaType', [
      { value: 'mutual', label: 'Mutual (Both parties)' },
      { value: 'unilateral', label: 'One-Way (Discloser → Recipient)' },
    ], true),
    formGroup('Effective Date', 'effectiveDate', 'date', '', true)
  )}

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Disclosing Party</div></div>
          ${formRow(
    formGroup('Full Name / Company', 'discloserName', 'text', 'Disclosing Company (Pty) Ltd', true),
    formGroup('Representative', 'discloserRep', 'text', 'John Doe')
  )}
          ${formGroup('Address', 'discloserAddress', 'textarea', '123 Business Street\nJohannesburg, 2000')}

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Receiving Party</div></div>
          ${formRow(
    formGroup('Full Name / Company', 'receiverName', 'text', 'Receiving Company (Pty) Ltd', true),
    formGroup('Representative', 'receiverRep', 'text', 'Jane Smith')
  )}
          ${formGroup('Address', 'receiverAddress', 'textarea', '456 Trade Avenue\nCape Town, 8000')}

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Agreement Terms</div></div>
          ${formGroup('Purpose of Disclosure', 'purpose', 'textarea', 'The confidential information is being shared for the purpose of evaluating a potential business partnership between the parties.', true)}
          ${formRow(
    formGroup('Duration (years)', 'duration', 'number', '2', true, '2'),
    selectGroup('Governing Law / Jurisdiction', 'jurisdiction', [
      'South Africa', 'United Kingdom', 'United States - New York', 'United States - California', 'Nigeria', 'Kenya', 'India', 'Australia', 'Other'
    ], true)
  )}
          ${formGroup('Definition of Confidential Information (optional)', 'confDefinition', 'textarea', 'All technical, business, financial, or other information disclosed by either party, whether in writing, orally, or by inspection of tangible objects.')}
          ${formGroup('Exclusions (optional)', 'exclusions', 'textarea', '(a) Information already in the public domain;\n(b) Information independently developed;\n(c) Information received from a third party without breach.')}

          <div class="action-bar">
            <button class="btn btn-primary btn-lg btn-block" id="generateNDABtn">
              ${ICONS.download} Generate & Download PDF
            </button>
          </div>
        </div>

        <div class="preview-panel" id="ndaPreview">
          <div class="preview-placeholder">
            <div>
              <div style="font-size:40px;margin-bottom:16px;">🔒</div>
              <div style="font-size:15px;font-weight:600;color:#333;margin-bottom:8px;">NDA Preview</div>
              <div style="font-size:12px;color:#999;">Fill in the form to see a preview</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  let selectedTemplate = NDA_TEMPLATES[0].id;
  container.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedTemplate = card.dataset.template;
      updatePreview();
    });
  });

  const form = container.querySelector('#ndaForm');

  function updatePreview() {
    const data = collectFormData(form);
    const preview = container.querySelector('#ndaPreview');
    const t = getPreviewTheme(selectedTemplate);
    const mutual = data.ndaType === 'mutual';

    if (!data.discloserName && !data.receiverName) {
      preview.innerHTML = `<div class="preview-placeholder"><div><div style="font-size:40px;margin-bottom:16px;">🔒</div><div style="font-size:15px;font-weight:600;color:#333;">NDA Preview</div></div></div>`;
      return;
    }

    const dateStr = data.effectiveDate ? new Date(data.effectiveDate).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }) : '[Date]';

    const isBanner = selectedTemplate === 'modern' || selectedTemplate === 'corporate';

    let titleHtml;
    if (isBanner) {
      titleHtml = `
        <div style="background:${t.accent};color:white;padding:14px;margin:-16px -16px 16px -16px;text-align:center;">
          <h1 style="font-size:16px;margin-bottom:4px;color:white;">${mutual ? 'MUTUAL ' : ''}NON-DISCLOSURE AGREEMENT</h1>
          <p style="font-size:10px;opacity:0.8;">Effective Date: ${dateStr}</p>
        </div>`;
    } else {
      titleHtml = `
        <h1 style="text-align:center;font-size:16px;margin-bottom:4px;color:${t.accent};">${mutual ? 'MUTUAL ' : ''}NON-DISCLOSURE AGREEMENT</h1>
        <p style="text-align:center;font-size:10px;color:#888;margin-bottom:16px;">Effective Date: ${dateStr}</p>`;
    }

    const clauseStyle = `font-size:12px;margin-bottom:4px;color:${t.accent};`;

    preview.innerHTML = `
      <div style="font-family:${t.font};font-size:11px;line-height:1.7;color:#333;">
        ${titleHtml}

        <p style="margin-bottom:12px;">This Non-Disclosure Agreement ("Agreement") is entered into by and between:</p>

        <div style="background:${t.accentLight};padding:10px;border-radius:6px;margin-bottom:8px;border-left:3px solid ${t.accent};">
          <p style="font-size:10px;color:#999;">DISCLOSING PARTY</p>
          <p style="font-weight:bold;">${data.discloserName || '[Party 1]'}</p>
          ${data.discloserRep ? `<p style="font-size:10px;color:#666;">Represented by: ${data.discloserRep}</p>` : ''}
        </div>
        
        <div style="background:${t.accentLight};padding:10px;border-radius:6px;margin-bottom:12px;border-left:3px solid ${t.accent};">
          <p style="font-size:10px;color:#999;">RECEIVING PARTY</p>
          <p style="font-weight:bold;">${data.receiverName || '[Party 2]'}</p>
          ${data.receiverRep ? `<p style="font-size:10px;color:#666;">Represented by: ${data.receiverRep}</p>` : ''}
        </div>

        <h3 style="${clauseStyle}">1. PURPOSE</h3>
        <p style="margin-bottom:10px;font-size:10px;">${data.purpose || '[Purpose]'}</p>

        <h3 style="${clauseStyle}">2. TERM</h3>
        <p style="margin-bottom:10px;font-size:10px;">This Agreement shall remain in effect for a period of ${data.duration || 2} year(s).</p>

        <h3 style="${clauseStyle}">3. GOVERNING LAW</h3>
        <p style="font-size:10px;">This Agreement shall be governed by the laws of ${data.jurisdiction || '[Jurisdiction]'}.</p>

        <div style="margin-top:20px;display:flex;gap:20px;border-top:2px solid ${t.accent};padding-top:15px;">
          <div style="flex:1;">
            <p style="font-size:10px;color:#999;">DISCLOSING PARTY</p>
            <div style="border-bottom:1px solid #333;height:30px;margin-bottom:4px;"></div>
            <p style="font-size:10px;">${data.discloserName || ''}</p>
          </div>
          <div style="flex:1;">
            <p style="font-size:10px;color:#999;">RECEIVING PARTY</p>
            <div style="border-bottom:1px solid #333;height:30px;margin-bottom:4px;"></div>
            <p style="font-size:10px;">${data.receiverName || ''}</p>
          </div>
        </div>
      </div>`;
  }

  let timer;
  form.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(updatePreview, 300); });

  container.querySelector('#generateNDABtn').addEventListener('click', () => {
    const data = collectFormData(form);
    try {
      generateNDAPDF(data, selectedTemplate);
      showToast('NDA PDF generated!');
    } catch (err) { console.error(err); showToast('Error generating PDF.', 'error'); }
  });

  autoLoad('nda', form);
  form.addEventListener('input', () => autoSave('nda', form));
}

import { ICONS } from '../../utils/icons.js';
import { formGroup, formRow, collectFormData, showToast, autoSave, autoLoad } from '../../utils/form-helpers.js';
import { generateCoverLetterPDF, COVER_LETTER_TEMPLATES } from './CoverLetterPDF.js';
import { getPreviewTheme } from '../../utils/preview-styles.js';

export function renderCoverLetterPage(container) {
  const templateCards = COVER_LETTER_TEMPLATES.map((t, i) => `
    <div class="template-card ${i === 0 ? 'active' : ''}" data-template="${t.id}">
      <div class="template-card-icon">${t.icon}</div>
      <div class="template-card-name">${t.name}</div>
      <div class="template-card-desc">${t.desc}</div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Cover Letter Generator</h1>
        <p class="page-subtitle">Write compelling cover letters to accompany your job applications.</p>
      </div>

      <div class="section-header">
        <div class="section-title">Choose Template</div>
        <span class="badge badge-amber">${COVER_LETTER_TEMPLATES.length} templates</span>
      </div>
      <div class="template-grid">${templateCards}</div>

      <div class="split-pane">
        <div class="form-panel" id="coverLetterForm">
          <div class="section-header"><div class="section-title">Your Details</div></div>
          ${formRow(
    formGroup('Full Name', 'senderName', 'text', 'John Doe', true),
    formGroup('Job Title', 'senderTitle', 'text', 'Software Engineer')
  )}
          ${formGroup('Address', 'senderAddress', 'textarea', '123 Main Road\nJohannesburg, 2000')}
          ${formRow(
    formGroup('Email', 'senderEmail', 'email', 'john@email.com'),
    formGroup('Phone', 'senderPhone', 'tel', '+27 12 345 6789')
  )}

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Recipient Details</div></div>
          ${formRow(
    formGroup('Recipient Name', 'recipientName', 'text', 'Jane Smith'),
    formGroup('Recipient Title', 'recipientTitle', 'text', 'Hiring Manager')
  )}
          ${formRow(
    formGroup('Company', 'recipientCompany', 'text', 'Dream Corp', true),
    formGroup('Date', 'letterDate', 'date')
  )}
          ${formGroup('Company Address', 'recipientAddress', 'textarea', 'Company Address...')}

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Letter Content</div></div>
          ${formGroup('Position Applied For', 'position', 'text', 'Senior Software Engineer', true)}
          ${formGroup('Opening Paragraph', 'opening', 'textarea', 'I am writing to express my strong interest in the [Position] role at [Company]...')}
          ${formGroup('Body Paragraph 1 - Why You', 'body1', 'textarea', 'With X years of experience in...')}
          ${formGroup('Body Paragraph 2 - Why This Company', 'body2', 'textarea', 'I am particularly drawn to [Company] because...')}
          ${formGroup('Closing Paragraph', 'closing', 'textarea', 'I would welcome the opportunity to discuss how my skills and experience align...')}

          <div class="action-bar">
            <button class="btn btn-primary btn-lg btn-block" id="generateCoverLetterBtn">
              ${ICONS.download} Generate & Download PDF
            </button>
          </div>
        </div>

        <div class="preview-panel" id="coverLetterPreview">
          <div class="preview-placeholder">
            <div>
              <div style="font-size:40px;margin-bottom:16px;">✉️</div>
              <div style="font-size:15px;font-weight:600;color:#333;margin-bottom:8px;">Cover Letter Preview</div>
              <div style="font-size:12px;color:#999;">Fill in the form to see a preview</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  let selectedTemplate = COVER_LETTER_TEMPLATES[0].id;
  container.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedTemplate = card.dataset.template;
      updatePreview();
    });
  });

  const form = container.querySelector('#coverLetterForm');

  function updatePreview() {
    const data = collectFormData(form);
    const preview = container.querySelector('#coverLetterPreview');
    const t = getPreviewTheme(selectedTemplate);

    if (!data.senderName && !data.position) {
      preview.innerHTML = `<div class="preview-placeholder"><div><div style="font-size:40px;margin-bottom:16px;">✉️</div><div style="font-size:15px;font-weight:600;color:#333;">Cover Letter Preview</div><div style="font-size:12px;color:#999;">Fill in the form to see a preview</div></div></div>`;
      return;
    }

    const dateStr = data.letterDate ? new Date(data.letterDate).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });

    const isModern = selectedTemplate === 'modern' || selectedTemplate === 'creative';
    const isElegant = selectedTemplate === 'elegant';

    let headerHtml;
    if (isModern) {
      headerHtml = `
              <div style="background:${t.accent};color:white;padding:14px;margin:-16px -16px 16px -16px;">
                <strong style="font-size:16px;color:white;">${data.senderName || 'Your Name'}</strong><br/>
                ${data.senderTitle ? `<span style="font-size:11px;opacity:0.85;">${data.senderTitle}</span><br/>` : ''}
                <span style="font-size:9px;opacity:0.7;">${data.senderEmail || ''} | ${data.senderPhone || ''}</span>
              </div>`;
    } else if (isElegant) {
      headerHtml = `
              <div style="text-align:center;border-bottom:2px solid ${t.accent};padding-bottom:14px;margin-bottom:16px;">
                <strong style="font-size:18px;color:${t.accent};font-family:Georgia,serif;">${data.senderName || 'Your Name'}</strong><br/>
                ${data.senderTitle ? `<span style="font-size:11px;color:#666;font-style:italic;">${data.senderTitle}</span><br/>` : ''}
                <span style="font-size:9px;color:#888;">${[data.senderEmail, data.senderPhone].filter(Boolean).join(' • ')}</span>
              </div>`;
    } else {
      headerHtml = `
              <div style="margin-bottom:20px;border-left:3px solid ${t.accent};padding-left:12px;">
                <strong style="font-size:14px;color:#111;">${data.senderName || 'Your Name'}</strong><br/>
                ${data.senderTitle ? `<span style="color:#666;">${data.senderTitle}</span><br/>` : ''}
                <span style="color:#888;font-size:10px;white-space:pre-line;">${data.senderAddress || ''}</span><br/>
                <span style="color:#888;font-size:10px;">${data.senderEmail || ''} | ${data.senderPhone || ''}</span>
              </div>`;
    }

    preview.innerHTML = `
      <div style="font-family:${t.font};font-size:11px;line-height:1.7;color:#333;">
        ${headerHtml}

        <p style="color:#888;font-size:10px;margin-bottom:15px;">${dateStr}</p>

        <div style="margin-bottom:15px;">
          <p>${data.recipientName || 'Recipient'}</p>
          <p style="color:#666;">${data.recipientTitle || ''}</p>
          <p style="color:#666;">${data.recipientCompany || ''}</p>
          <p style="color:#888;font-size:10px;white-space:pre-line;">${data.recipientAddress || ''}</p>
        </div>

        <p style="margin-bottom:12px;color:${t.accent};font-weight:600;">Re: Application for ${data.position || 'Position'}</p>

        <p style="margin-bottom:10px;">Dear ${data.recipientName || 'Hiring Manager'},</p>
        ${data.opening ? `<p style="margin-bottom:10px;">${data.opening}</p>` : ''}
        ${data.body1 ? `<p style="margin-bottom:10px;">${data.body1}</p>` : ''}
        ${data.body2 ? `<p style="margin-bottom:10px;">${data.body2}</p>` : ''}
        ${data.closing ? `<p style="margin-bottom:15px;">${data.closing}</p>` : ''}

        <p>Sincerely,</p>
        <p style="margin-top:20px;font-weight:bold;color:${t.accent};">${data.senderName || 'Your Name'}</p>
      </div>
    `;
  }

  let timer;
  form.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(updatePreview, 300); });

  container.querySelector('#generateCoverLetterBtn').addEventListener('click', () => {
    const data = collectFormData(form);
    try {
      generateCoverLetterPDF(data, selectedTemplate);
      showToast('Cover letter PDF generated successfully!');
    } catch (err) {
      console.error(err);
      showToast('Error generating PDF.', 'error');
    }
  });

  autoLoad('coverletter', form);
  form.addEventListener('input', () => autoSave('coverletter', form));
}

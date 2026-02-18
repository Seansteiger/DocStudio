import { ICONS } from '../../utils/icons.js';
import { formGroup, formRow, formRow3, initRepeater, collectFormData, collectRepeaterData, showToast, autoSave, autoLoad } from '../../utils/form-helpers.js';
import { generateResumePDF, RESUME_TEMPLATES } from './ResumePDF.js';
import { getPreviewTheme } from '../../utils/preview-styles.js';

export function renderResumePage(container) {
  const templateCards = RESUME_TEMPLATES.map((t, i) => `
    <div class="template-card ${i === 0 ? 'active' : ''}" data-template="${t.id}">
      <div class="template-card-icon">${t.icon}</div>
      <div class="template-card-name">${t.name}</div>
      <div class="template-card-desc">${t.desc}</div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Resume / CV Generator</h1>
        <p class="page-subtitle">Build a professional resume that stands out. Choose a template, fill in your details, and download.</p>
      </div>

      <div class="section-header">
        <div class="section-title">Choose Template</div>
        <span class="badge badge-cyan">${RESUME_TEMPLATES.length} templates</span>
      </div>
      <div class="template-grid">${templateCards}</div>

      <div class="split-pane">
        <div class="form-panel" id="resumeForm">
          <div class="section-header"><div class="section-title">Personal Information</div></div>
          ${formRow(
    formGroup('Full Name', 'fullName', 'text', 'John Doe', true),
    formGroup('Job Title', 'jobTitle', 'text', 'Software Engineer')
  )}
          ${formRow(
    formGroup('Email', 'email', 'email', 'john@example.com', true),
    formGroup('Phone', 'phone', 'tel', '+27 12 345 6789')
  )}
          ${formRow(
    formGroup('Location', 'location', 'text', 'Johannesburg, SA'),
    formGroup('LinkedIn / Website', 'website', 'text', 'linkedin.com/in/johndoe')
  )}

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Professional Summary</div></div>
          ${formGroup('Summary', 'summary', 'textarea', 'A brief professional summary highlighting your key skills and experience...')}

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Work Experience</div></div>
          <div data-repeater="experience">
            <div class="repeater-item">
              <div class="repeater-item-header">
                <span class="repeater-item-number">Position 1</span>
                <button class="repeater-remove">×</button>
              </div>
              ${formRow(formGroup('Job Title', 'expTitle', 'text', 'Software Engineer'), formGroup('Company', 'expCompany', 'text', 'Tech Corp'))}
              ${formRow(formGroup('Start Date', 'expStart', 'text', 'Jan 2020'), formGroup('End Date', 'expEnd', 'text', 'Present'))}
              ${formGroup('Description', 'expDesc', 'textarea', 'Key responsibilities and achievements...')}
            </div>
            <button class="repeater-add">${ICONS.plus} Add Experience</button>
          </div>

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Education</div></div>
          <div data-repeater="education">
            <div class="repeater-item">
              <div class="repeater-item-header">
                <span class="repeater-item-number">Education 1</span>
                <button class="repeater-remove">×</button>
              </div>
              ${formRow(formGroup('Degree', 'eduDegree', 'text', 'Bachelor of Science'), formGroup('Institution', 'eduSchool', 'text', 'University of Johannesburg'))}
              ${formRow(formGroup('Year', 'eduYear', 'text', '2016 - 2020'), formGroup('Grade / Honours', 'eduGrade', 'text', 'Cum Laude'))}
            </div>
            <button class="repeater-add">${ICONS.plus} Add Education</button>
          </div>

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">High School Education</div></div>
          <div data-repeater="highschool">
            <div class="repeater-item">
              <div class="repeater-item-header">
                <span class="repeater-item-number">School 1</span>
                <button class="repeater-remove">×</button>
              </div>
              ${formRow(formGroup('School Name', 'hsName', 'text', 'High School Name'), formGroup('Year', 'hsYear', 'text', '2015'))}
              ${formGroup('Subjects & Results', 'hsSubjects', 'textarea', 'Maths (80%), Physics (75%), English (B)...')}
            </div>
            <button class="repeater-add">${ICONS.plus} Add High School</button>
          </div>

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Languages</div></div>
          <div data-repeater="languages">
            <div class="repeater-item">
              <div class="repeater-item-header">
                <span class="repeater-item-number">Language 1</span>
                <button class="repeater-remove">×</button>
              </div>
              ${formRow(formGroup('Language', 'langName', 'text', 'English'), formGroup('Proficiency', 'langLevel', 'text', 'Native/Fluent'))}
            </div>
            <button class="repeater-add">${ICONS.plus} Add Language</button>
          </div>

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">Skills</div></div>
          ${formGroup('Skills', 'skills', 'textarea', 'JavaScript, Python, React, Node.js, SQL, Git (comma-separated)')}

          <div class="section-header" style="margin-top:1.5rem;"><div class="section-title">References</div></div>
          <div data-repeater="references">
            <div class="repeater-item">
              <div class="repeater-item-header">
                <span class="repeater-item-number">Reference 1</span>
                <button class="repeater-remove">×</button>
              </div>
              ${formRow(formGroup('Name', 'refName', 'text', 'Jane Manager'), formGroup('Title & Company', 'refTitle', 'text', 'CTO at Tech Corp'))}
              ${formRow(formGroup('Email', 'refEmail', 'email', 'jane@techcorp.com'), formGroup('Phone', 'refPhone', 'tel', '+27 12 345 6789'))}
            </div>
            <button class="repeater-add">${ICONS.plus} Add Reference</button>
          </div>

          <div class="action-bar">
            <button class="btn btn-primary btn-lg btn-block" id="generateResumeBtn">
              ${ICONS.download} Generate & Download PDF
            </button>
          </div>
        </div>

        <div class="preview-panel" id="resumePreview">
          <div class="preview-placeholder">
            <div>
              <div style="font-size:40px;margin-bottom:16px;">📄</div>
              <div style="font-size:15px;font-weight:600;color:#333;margin-bottom:8px;">Live Preview</div>
              <div style="font-size:12px;color:#999;">Fill in the form to see a preview of your resume</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Template selection
  let selectedTemplate = RESUME_TEMPLATES[0].id;
  container.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedTemplate = card.dataset.template;
      updatePreview();
    });
  });

  // Init repeaters
  const form = container.querySelector('#resumeForm');
  const experienceItemRender = (n) => `
    <div class="repeater-item">
      <div class="repeater-item-header"><span class="repeater-item-number">Position ${n}</span><button class="repeater-remove">×</button></div>
      ${formRow(formGroup('Job Title', 'expTitle', 'text', 'Job Title'), formGroup('Company', 'expCompany', 'text', 'Company Name'))}
      ${formRow(formGroup('Start Date', 'expStart', 'text', 'Jan 2020'), formGroup('End Date', 'expEnd', 'text', 'Present'))}
      ${formGroup('Description', 'expDesc', 'textarea', 'Key responsibilities...')}
    </div>`;

  const educationItemRender = (n) => `
    <div class="repeater-item">
      <div class="repeater-item-header"><span class="repeater-item-number">Education ${n}</span><button class="repeater-remove">×</button></div>
      ${formRow(formGroup('Degree', 'eduDegree', 'text', 'Degree'), formGroup('Institution', 'eduSchool', 'text', 'University'))}
      ${formRow(formGroup('Year', 'eduYear', 'text', '2020'), formGroup('Grade', 'eduGrade', 'text', ''))}
    </div>`;

  const highSchoolItemRender = (n) => `
    <div class="repeater-item">
      <div class="repeater-item-header"><span class="repeater-item-number">highschool ${n}</span><button class="repeater-remove">×</button></div>
      ${formRow(formGroup('School Name', 'hsName', 'text', 'High School Name'), formGroup('Year', 'hsYear', 'text', '2015'))}
      ${formGroup('Subjects & Results', 'hsSubjects', 'textarea', 'Maths (80%), Physics (75%), English (B)...')}
    </div>`;

  const languageItemRender = (n) => `
    <div class="repeater-item">
      <div class="repeater-item-header"><span class="repeater-item-number">languages ${n}</span><button class="repeater-remove">×</button></div>
      ${formRow(formGroup('Language', 'langName', 'text', 'English'), formGroup('Proficiency', 'langLevel', 'text', 'Native/Fluent'))}
    </div>`;

  const referenceItemRender = (n) => `
    <div class="repeater-item">
      <div class="repeater-item-header"><span class="repeater-item-number">Reference ${n}</span><button class="repeater-remove">×</button></div>
      ${formRow(formGroup('Name', 'refName', 'text', 'Name'), formGroup('Title & Company', 'refTitle', 'text', 'Title'))}
      ${formRow(formGroup('Email', 'refEmail', 'email', ''), formGroup('Phone', 'refPhone', 'tel', ''))}
    </div>`;

  initRepeater(form, 'experience', experienceItemRender);
  initRepeater(form, 'education', educationItemRender);
  initRepeater(form, 'highschool', highSchoolItemRender);
  initRepeater(form, 'languages', languageItemRender);
  initRepeater(form, 'references', referenceItemRender);

  // Preview update
  function updatePreview() {
    const data = collectFormData(form);
    const preview = container.querySelector('#resumePreview');
    const t = getPreviewTheme(selectedTemplate);

    if (!data.fullName && !data.email) {
      preview.innerHTML = `<div class="preview-placeholder"><div><div style="font-size:40px;margin-bottom:16px;">📄</div><div style="font-size:15px;font-weight:600;color:#333;">Live Preview</div><div style="font-size:12px;color:#999;">Fill in the form to see a preview</div></div></div>`;
      return;
    }

    const experience = collectRepeaterData(form, 'experience');
    const education = collectRepeaterData(form, 'education');
    const highschool = collectRepeaterData(form, 'highschool');
    const languages = collectRepeaterData(form, 'languages');
    const references = collectRepeaterData(form, 'references');
    const skills = (data.skills || '').split(',').map(s => s.trim()).filter(Boolean);

    const isSidebar = selectedTemplate === 'modern' || selectedTemplate === 'creative';
    const isDark = selectedTemplate === 'executive' || selectedTemplate === 'tech';

    const sectionHeading = (title) => `<h2 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${t.accent};padding-bottom:3px;margin-bottom:6px;color:${t.accent};">${title}</h2>`;

    let html = '';

    if (isSidebar) {
      // Sidebar layout preview
      html = `<div style="font-family:${t.font};display:flex;min-height:100%;">
              <div style="width:35%;background:${t.accent};color:white;padding:16px 12px;">
                <h1 style="font-size:16px;margin-bottom:2px;color:white;">${data.fullName || 'Your Name'}</h1>
                <p style="font-size:10px;opacity:0.8;margin-bottom:14px;">${data.jobTitle || 'Job Title'}</p>
                <p style="font-size:9px;opacity:0.7;margin-bottom:3px;">📧 ${data.email || ''}</p>
                <p style="font-size:9px;opacity:0.7;margin-bottom:3px;">📱 ${data.phone || ''}</p>
                <p style="font-size:9px;opacity:0.7;margin-bottom:3px;">📍 ${data.location || ''}</p>
                ${data.website ? `<p style="font-size:9px;opacity:0.7;">🔗 ${data.website}</p>` : ''}
                
                ${skills.length > 0 ? `<div style="margin-top:14px;border-top:1px solid rgba(255,255,255,0.2);padding-top:10px;"><p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Skills</p>${skills.map(s => `<div style="background:rgba(255,255,255,0.15);padding:3px 8px;border-radius:8px;font-size:9px;margin-bottom:3px;display:inline-block;margin-right:3px;">${s}</div>`).join('')}</div>` : ''}

                ${languages.length > 0 ? `<div style="margin-top:14px;border-top:1px solid rgba(255,255,255,0.2);padding-top:10px;"><p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Languages</p>${languages.map(l => `<div style="margin-bottom:4px;"><span style="font-size:9px;font-weight:600;">${l.langName}</span> <span style="font-size:8px;opacity:0.8;">- ${l.langLevel}</span></div>`).join('')}</div>` : ''}
              </div>
              <div style="flex:1;padding:16px;">
                ${data.summary ? `<div style="margin-bottom:14px;">${sectionHeading('Summary')}<p style="font-size:10px;color:#444;line-height:1.6;">${data.summary}</p></div>` : ''}
                ${experience.length > 0 ? `<div style="margin-bottom:14px;">${sectionHeading('Experience')}${experience.map(e => `<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;"><strong style="font-size:11px;">${e.expTitle || ''}</strong><span style="font-size:9px;color:#888;">${e.expStart || ''} — ${e.expEnd || ''}</span></div><div style="font-size:10px;color:${t.accent};">${e.expCompany || ''}</div><p style="font-size:9px;color:#555;margin-top:3px;">${e.expDesc || ''}</p></div>`).join('')}</div>` : ''}
                ${education.length > 0 ? `<div style="margin-bottom:14px;">${sectionHeading('Education')}${education.map(e => `<div style="margin-bottom:6px;"><strong style="font-size:11px;">${e.eduDegree || ''}</strong><div style="font-size:10px;color:#666;">${e.eduSchool || ''} ${e.eduGrade ? `— ${e.eduGrade}` : ''}</div><div style="font-size:9px;color:#888;">${e.eduYear || ''}</div></div>`).join('')}</div>` : ''}
                ${highschool.length > 0 ? `<div style="margin-bottom:14px;">${sectionHeading('High School')}${highschool.map(h => `<div style="margin-bottom:6px;"><strong style="font-size:11px;">${h.hsName || ''}</strong><div style="font-size:10px;color:#666;">${h.hsSubjects || ''}</div><div style="font-size:9px;color:#888;">${h.hsYear || ''}</div></div>`).join('')}</div>` : ''}
              </div>
            </div>`;
    } else if (isDark) {
      // Dark header layout
      html = `<div style="font-family:${t.font};">
              <div style="background:${t.headingBg};color:${t.headingText};padding:16px;margin:-16px -16px 16px -16px;">
                <h1 style="font-size:20px;margin-bottom:2px;color:${t.headingText};">${data.fullName || 'Your Name'}</h1>
                <p style="font-size:12px;opacity:0.8;margin-bottom:6px;">${data.jobTitle || 'Job Title'}</p>
                <p style="font-size:9px;opacity:0.6;">${[data.email, data.phone, data.location].filter(Boolean).join(' • ')}</p>
              </div>
              ${data.summary ? `<div style="margin-bottom:14px;">${sectionHeading('Summary')}<p style="font-size:10px;color:#444;line-height:1.6;">${data.summary}</p></div>` : ''}
              ${experience.length > 0 ? `<div style="margin-bottom:14px;">${sectionHeading('Experience')}${experience.map(e => `<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;"><strong style="font-size:11px;">${e.expTitle || ''}</strong><span style="font-size:9px;color:#888;">${e.expStart || ''} — ${e.expEnd || ''}</span></div><div style="font-size:10px;color:${t.accent};">${e.expCompany || ''}</div><p style="font-size:9px;color:#555;margin-top:3px;">${e.expDesc || ''}</p></div>`).join('')}</div>` : ''}
              ${education.length > 0 ? `<div style="margin-bottom:14px;">${sectionHeading('Education')}${education.map(e => `<div style="margin-bottom:6px;"><strong style="font-size:11px;">${e.eduDegree || ''}</strong><div style="font-size:10px;color:#666;">${e.eduSchool || ''}</div></div>`).join('')}</div>` : ''}
              ${highschool.length > 0 ? `<div style="margin-bottom:14px;">${sectionHeading('High School')}${highschool.map(h => `<div style="margin-bottom:6px;"><strong style="font-size:11px;">${h.hsName || ''}</strong><div style="font-size:10px;color:#666;">${h.hsSubjects || ''}</div><div style="font-size:9px;color:#888;">${h.hsYear || ''}</div></div>`).join('')}</div>` : ''}
              ${skills.length > 0 ? `<div style="margin-bottom:14px;">${sectionHeading('Skills')}<div style="display:flex;flex-wrap:wrap;gap:4px;">${skills.map(s => `<span style="background:${t.accentLight};color:${t.accent};padding:2px 8px;border-radius:10px;font-size:9px;font-weight:600;">${s}</span>`).join('')}</div></div>` : ''}
              ${languages.length > 0 ? `<div style="margin-bottom:14px;">${sectionHeading('Languages')}<div style="display:flex;flex-wrap:wrap;gap:8px;">${languages.map(l => `<span style="font-size:9px;color:#444;"><strong>${l.langName}</strong> (${l.langLevel})</span>`).join('')}</div></div>` : ''}
            </div>`;
    } else {
      // Standard layout
      html = `<div style="font-family:${t.font};">
              <h1 style="font-size:22px;margin-bottom:2px;color:#111;">${data.fullName || 'Your Name'}</h1>
              <p style="color:${t.accent};font-size:14px;margin-bottom:8px;">${data.jobTitle || 'Job Title'}</p>
              <p style="font-size:11px;color:#666;margin-bottom:16px;">${[data.email, data.phone, data.location].filter(Boolean).join(' • ')}</p>
              ${data.summary ? `<div style="margin-bottom:16px;">${sectionHeading('Summary')}<p style="font-size:11px;color:#444;line-height:1.6;">${data.summary}</p></div>` : ''}
              ${experience.length > 0 ? `<div style="margin-bottom:16px;">${sectionHeading('Experience')}${experience.map(e => `<div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;"><strong style="font-size:12px;">${e.expTitle || ''}</strong><span style="font-size:10px;color:#888;">${e.expStart || ''} — ${e.expEnd || ''}</span></div><div style="font-size:11px;color:${t.accent};">${e.expCompany || ''}</div><p style="font-size:10px;color:#555;margin-top:4px;line-height:1.5;">${e.expDesc || ''}</p></div>`).join('')}</div>` : ''}
              ${education.length > 0 ? `<div style="margin-bottom:16px;">${sectionHeading('Education')}${education.map(e => `<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;"><strong style="font-size:12px;">${e.eduDegree || ''}</strong><span style="font-size:10px;color:#888;">${e.eduYear || ''}</span></div><div style="font-size:11px;color:#666;">${e.eduSchool || ''} ${e.eduGrade ? `— ${e.eduGrade}` : ''}</div></div>`).join('')}</div>` : ''}
              ${highschool.length > 0 ? `<div style="margin-bottom:16px;">${sectionHeading('High School')}${highschool.map(h => `<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;"><strong style="font-size:12px;">${h.hsName || ''}</strong><span style="font-size:10px;color:#888;">${h.hsYear || ''}</span></div><div style="font-size:11px;color:#666;">${h.hsSubjects || ''}</div></div>`).join('')}</div>` : ''}
              ${skills.length > 0 ? `<div style="margin-bottom:16px;">${sectionHeading('Skills')}<div style="display:flex;flex-wrap:wrap;gap:4px;">${skills.map(s => `<span style="background:${t.accentLight};color:${t.accent};padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;">${s}</span>`).join('')}</div></div>` : ''}
              ${languages.length > 0 ? `<div style="margin-bottom:16px;">${sectionHeading('Languages')}<div style="display:flex;flex-wrap:wrap;gap:12px;">${languages.map(l => `<span style="font-size:10px;color:#444;"><strong>${l.langName}</strong> <span style="color:#777;">(${l.langLevel})</span></span>`).join('')}</div></div>` : ''}
              ${references.length > 0 ? `<div>${sectionHeading('References')}${references.map(r => `<div style="margin-bottom:8px;"><strong style="font-size:11px;">${r.refName || ''}</strong><div style="font-size:10px;color:#666;">${r.refTitle || ''}</div><div style="font-size:10px;color:#888;">${[r.refEmail, r.refPhone].filter(Boolean).join(' • ')}</div></div>`).join('')}</div>` : ''}
            </div>`;
    }

    preview.innerHTML = html;
  }

  // Debounced live preview
  let previewTimer;
  form.addEventListener('input', () => {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(updatePreview, 300);
  });

  // Generate PDF
  container.querySelector('#generateResumeBtn').addEventListener('click', () => {
    const data = collectFormData(form);
    data.experience = collectRepeaterData(form, 'experience');
    data.education = collectRepeaterData(form, 'education');
    data.highschool = collectRepeaterData(form, 'highschool');
    data.languages = collectRepeaterData(form, 'languages');
    data.references = collectRepeaterData(form, 'references');
    data.skillsList = (data.skills || '').split(',').map(s => s.trim()).filter(Boolean);

    try {
      generateResumePDF(data, selectedTemplate);
      showToast('Resume PDF generated successfully!');
    } catch (err) {
      console.error(err);
      showToast('Error generating PDF. Please check your input.', 'error');
    }
  });

  // Load saved data
  autoLoad('resume', form);
  form.addEventListener('input', () => autoSave('resume', form));
}

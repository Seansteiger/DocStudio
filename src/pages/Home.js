import { ICONS } from '../utils/icons.js';

export function renderHome(container) {
    const docs = [
        {
            type: 'resume', icon: '📄', title: 'Resume / CV',
            description: 'Create stunning professional resumes with multiple templates. Perfect for job applications.',
            templates: 6
        },
        {
            type: 'invoice', icon: '🧾', title: 'Tax Invoice',
            description: 'Generate professional tax invoices with automatic calculations, tax breakdowns, and branding.',
            templates: 5
        },
        {
            type: 'cover-letter', icon: '✉️', title: 'Cover Letter',
            description: 'Write compelling cover letters that make a strong first impression with employers.',
            templates: 5
        },
        {
            type: 'quotation', icon: '💰', title: 'Quotation',
            description: 'Create detailed business quotations with itemized pricing and professional terms.',
            templates: 5
        },
        {
            type: 'nda', icon: '🔒', title: 'NDA',
            description: 'Generate legally-structured non-disclosure agreements for business confidentiality.',
            templates: 4
        },
    ];

    container.innerHTML = `
    <div class="page-container">
      <div class="home-hero">
        <h1 class="home-title">Document Generator</h1>
        <p class="home-subtitle">Create professional documents in seconds. Fill in your details, choose a template, and download a polished PDF — completely free, no sign-up required.</p>
      </div>

      <div class="doc-cards-grid">
        ${docs.map(doc => `
          <a class="doc-card" data-type="${doc.type}" href="#/${doc.type}">
            <div class="doc-card-icon">${doc.icon}</div>
            <div class="doc-card-title">${doc.title}</div>
            <div class="doc-card-description">${doc.description}</div>
            <div class="doc-card-templates"><span>${doc.templates} templates</span> available</div>
          </a>
        `).join('')}
      </div>

      <div class="home-features">
        <div class="feature-item">
          <div class="feature-icon">⚡</div>
          <div class="feature-title">Instant Generation</div>
          <div class="feature-desc">Documents are generated instantly in your browser — no server processing needed.</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🔒</div>
          <div class="feature-title">100% Private</div>
          <div class="feature-desc">Your data never leaves your device. Everything is processed locally in your browser.</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎨</div>
          <div class="feature-title">Multiple Templates</div>
          <div class="feature-desc">Choose from various professionally designed templates for each document type.</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">💾</div>
          <div class="feature-title">Auto-Save</div>
          <div class="feature-desc">Your progress is automatically saved locally so you never lose your work.</div>
        </div>
      </div>
    </div>
  `;

    // Add home-specific styles
    const style = document.createElement('style');
    style.textContent = `
    .home-hero {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem 0;
    }
    .home-title {
      font-size: 3.5rem;
      font-weight: 900;
      letter-spacing: -0.04em;
      margin-bottom: 0.75rem;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.1;
    }
    .home-subtitle {
      font-size: 1.1rem;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
    .home-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-top: 3rem;
    }
    .feature-item {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      text-align: center;
      backdrop-filter: blur(16px);
    }
    .feature-icon { font-size: 2rem; margin-bottom: 0.75rem; }
    .feature-title { font-weight: 700; margin-bottom: 0.5rem; font-size: 0.95rem; }
    .feature-desc { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; }
    @media (max-width: 768px) {
      .home-title { font-size: 2.25rem; }
      .home-subtitle { font-size: 0.95rem; }
    }
  `;
    container.appendChild(style);
}

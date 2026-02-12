import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import { ICONS } from './utils/icons.js';
import { registerRoute, initRouter, getCurrentRoute } from './router.js';
import { renderHome } from './pages/Home.js';
import { renderResumePage } from './generators/resume/ResumePage.js';
import { renderInvoicePage } from './generators/invoice/InvoicePage.js';
import { renderCoverLetterPage } from './generators/cover-letter/CoverLetterPage.js';
import { renderQuotationPage } from './generators/quotation/QuotationPage.js';
import { renderNDAPage } from './generators/nda/NDAPage.js';

const app = document.getElementById('app');

const navItems = [
  { path: '/', label: 'Home', icon: ICONS.home },
  { section: 'Documents' },
  { path: '/resume', label: 'Resume / CV', icon: ICONS.resume },
  { path: '/invoice', label: 'Tax Invoice', icon: ICONS.invoice },
  { path: '/cover-letter', label: 'Cover Letter', icon: ICONS.coverLetter },
  { path: '/quotation', label: 'Quotation', icon: ICONS.quotation },
  { path: '/nda', label: 'NDA', icon: ICONS.nda },
];

app.innerHTML = `
  <div class="mobile-header">
    <button class="hamburger" id="menuBtn">${ICONS.menu}</button>
    <span style="font-weight:700;background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-left:8px;">DocForge</span>
  </div>
  <div class="sidebar-overlay" id="sidebarOverlay"></div>
  <div class="app-layout">
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">D</div>
        <div class="sidebar-brand-text">
          <div class="sidebar-brand-name">DocForge</div>
          <div class="sidebar-brand-tagline">Document Generator</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${navItems.map(item => {
  if (item.section) return `<div class="sidebar-section-label">${item.section}</div>`;
  return `<a href="#${item.path}" class="sidebar-link">
            <span class="sidebar-link-icon">${item.icon}</span>
            ${item.label}
          </a>`;
}).join('')}
      </nav>
      <div class="sidebar-footer">
        <div style="font-size:11px;opacity:0.5;">DocForge v1.0 — Free & Private</div>
      </div>
    </aside>
    <main class="main-content" id="mainContent"></main>
  </div>
`;

// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');

menuBtn?.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
});

overlay?.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
});

// Close sidebar on nav click (mobile)
sidebar?.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
});

// Register routes
registerRoute('/', renderHome);
registerRoute('/resume', renderResumePage);
registerRoute('/invoice', renderInvoicePage);
registerRoute('/cover-letter', renderCoverLetterPage);
registerRoute('/quotation', renderQuotationPage);
registerRoute('/nda', renderNDAPage);

// Start router
const mainContent = document.getElementById('mainContent');
initRouter(mainContent);

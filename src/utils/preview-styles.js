/* ===== Template Preview Styles ===== */
/* Maps template IDs to visual styles used in the live HTML preview panel */

export const PREVIEW_THEMES = {
    // Resume templates
    professional: { accent: '#1e3a5f', accentLight: '#e8eef5', headingBg: '#1e3a5f', headingText: '#fff', font: 'Arial, sans-serif' },
    modern: { accent: '#06b6d4', accentLight: '#ecfeff', headingBg: '#06b6d4', headingText: '#fff', font: "'Inter', sans-serif" },
    minimalist: { accent: '#374151', accentLight: '#f3f4f6', headingBg: '#374151', headingText: '#fff', font: "'Helvetica Neue', sans-serif" },
    creative: { accent: '#8b5cf6', accentLight: '#f5f3ff', headingBg: '#8b5cf6', headingText: '#fff', font: "'Inter', sans-serif" },
    executive: { accent: '#1a1a2e', accentLight: '#e8e8ee', headingBg: '#1a1a2e', headingText: '#c9a84c', font: 'Georgia, serif' },
    tech: { accent: '#10b981', accentLight: '#ecfdf5', headingBg: '#064e3b', headingText: '#6ee7b7', font: "'JetBrains Mono', monospace" },

    // Invoice / Quotation / Cover Letter templates
    minimal: { accent: '#6b7280', accentLight: '#f9fafb', headingBg: '#6b7280', headingText: '#fff', font: "'Helvetica Neue', sans-serif" },
    corporate: { accent: '#0f4c81', accentLight: '#e8f0f8', headingBg: '#0f4c81', headingText: '#fff', font: 'Georgia, serif' },
    bold: { accent: '#dc2626', accentLight: '#fef2f2', headingBg: '#dc2626', headingText: '#fff', font: "Arial, sans-serif" },
    elegant: { accent: '#78350f', accentLight: '#fef3c7', headingBg: '#78350f', headingText: '#fef3c7', font: 'Georgia, serif' },

    // NDA templates (simple uses minimal)
};

export function getPreviewTheme(templateId) {
    return PREVIEW_THEMES[templateId] || PREVIEW_THEMES.professional;
}

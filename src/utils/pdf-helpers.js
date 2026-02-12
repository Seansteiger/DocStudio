import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/* ===== Shared PDF Helpers ===== */

// Page dimensions in mm (A4)
export const PAGE = { w: 210, h: 297, margin: 15 };

// Color palettes for templates
export const PALETTES = {
    professional: { primary: [6, 71, 100], accent: [6, 182, 212], text: [30, 30, 30], muted: [120, 120, 120], bg: [245, 247, 250] },
    modern: { primary: [30, 30, 50], accent: [99, 102, 241], text: [40, 40, 40], muted: [130, 130, 130], bg: [240, 242, 248] },
    classic: { primary: [0, 0, 0], accent: [100, 100, 100], text: [20, 20, 20], muted: [100, 100, 100], bg: [255, 255, 255] },
    creative: { primary: [139, 92, 246], accent: [236, 72, 153], text: [30, 30, 30], muted: [120, 120, 120], bg: [250, 245, 255] },
    executive: { primary: [20, 40, 60], accent: [0, 100, 80], text: [25, 25, 25], muted: [100, 110, 120], bg: [248, 250, 252] },
    minimal: { primary: [50, 50, 50], accent: [50, 50, 50], text: [30, 30, 30], muted: [150, 150, 150], bg: [255, 255, 255] },
    bold: { primary: [220, 50, 50], accent: [220, 50, 50], text: [20, 20, 20], muted: [120, 120, 120], bg: [255, 248, 248] },
    elegant: { primary: [80, 60, 40], accent: [180, 150, 100], text: [40, 35, 30], muted: [140, 130, 120], bg: [252, 250, 248] },
    tech: { primary: [0, 150, 136], accent: [0, 200, 180], text: [30, 30, 30], muted: [120, 120, 120], bg: [240, 253, 250] },
    corporate: { primary: [0, 50, 100], accent: [0, 100, 200], text: [25, 25, 35], muted: [110, 110, 130], bg: [245, 248, 255] },
};

// Create a new PDF document
export function createPDF(orientation = 'portrait') {
    return new jsPDF({ orientation, unit: 'mm', format: 'a4' });
}

// Set text color
export function setColor(doc, color) {
    doc.setTextColor(color[0], color[1], color[2]);
}

// Set fill color
export function setFill(doc, color) {
    doc.setFillColor(color[0], color[1], color[2]);
}

// Draw colored rectangle
export function drawRect(doc, x, y, w, h, color) {
    setFill(doc, color);
    doc.rect(x, y, w, h, 'F');
}

// Add text with word wrap, returns final Y position
export function addWrappedText(doc, text, x, y, maxWidth, lineHeight = 5) {
    if (!text) return y;
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
}

// Add a section heading
export function addSectionHeading(doc, text, y, palette, style = 'underline') {
    const m = PAGE.margin;
    const w = PAGE.w - 2 * m;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    setColor(doc, palette.primary);

    if (style === 'underline') {
        doc.text(text.toUpperCase(), m, y);
        setFill(doc, palette.accent);
        doc.rect(m, y + 1.5, w, 0.5, 'F');
        return y + 8;
    } else if (style === 'bg') {
        drawRect(doc, m, y - 5, w, 8, palette.bg);
        doc.text(text.toUpperCase(), m + 3, y);
        return y + 8;
    } else if (style === 'line') {
        doc.text(text.toUpperCase(), m, y);
        setFill(doc, palette.accent);
        doc.rect(m, y + 1.5, 30, 0.8, 'F');
        return y + 8;
    }
    doc.text(text.toUpperCase(), m, y);
    return y + 8;
}

// Add page number footer
export function addPageNumbers(doc) {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, PAGE.w / 2, PAGE.h - 8, { align: 'center' });
    }
}

// Check if we need a new page
export function checkPage(doc, y, needed = 30) {
    if (y + needed > PAGE.h - 20) {
        doc.addPage();
        return PAGE.margin + 10;
    }
    return y;
}

// Download PDF
export function downloadPDF(doc, filename) {
    doc.save(filename);
}

// Format date
export function formatDate(dateStr) {
    if (!dateStr) return new Date().toLocaleDateString('en-ZA');
    return new Date(dateStr).toLocaleDateString('en-ZA');
}

// Format currency
export function formatCurrency(amount, currency = 'R') {
    const num = parseFloat(amount) || 0;
    return `${currency}${num.toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')}`;
}

import { createPDF, PALETTES, PAGE, setColor, setFill, drawRect, addWrappedText, addPageNumbers, checkPage, downloadPDF, formatDate, formatCurrency } from '../../utils/pdf-helpers.js';

export const QUOTATION_TEMPLATES = [
    { id: 'professional', name: 'Professional', icon: '💼', desc: 'Clean business style' },
    { id: 'modern', name: 'Modern', icon: '✨', desc: 'Contemporary design' },
    { id: 'corporate', name: 'Corporate', icon: '🏢', desc: 'Formal corporate look' },
    { id: 'creative', name: 'Creative', icon: '🎨', desc: 'Bold and colorful' },
    { id: 'elegant', name: 'Elegant', icon: '🖋️', desc: 'Refined and sophisticated' },
];

export function generateQuotationPDF(data, templateId) {
    const doc = createPDF();
    const pal = PALETTES[templateId] || PALETTES.professional;
    const m = PAGE.margin;
    const w = PAGE.w - 2 * m;
    let y = m;

    // Header
    if (templateId === 'modern' || templateId === 'creative') {
        drawRect(doc, 0, 0, PAGE.w, 50, pal.primary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text(data.companyName || 'Company', m, 20);
        doc.setFontSize(9);
        doc.setTextColor(200, 215, 235);
        if (data.companyAddress) {
            const lines = data.companyAddress.split('\n');
            lines.forEach((l, i) => doc.text(l, m, 28 + i * 4));
        }
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text('QUOTATION', PAGE.w - m, 20, { align: 'right' });
        doc.setFontSize(9);
        doc.text(`#${data.quoteNumber || 'QT-001'}`, PAGE.w - m, 28, { align: 'right' });
        doc.text(`Date: ${formatDate(data.quoteDate)}`, PAGE.w - m, 34, { align: 'right' });
        doc.text(`Valid: ${formatDate(data.validUntil)}`, PAGE.w - m, 40, { align: 'right' });
        y = 60;
    } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        setColor(doc, pal.primary);
        doc.text(data.companyName || 'Company', m, y + 8);
        y += 12;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        setColor(doc, pal.muted);
        if (data.companyReg) { doc.text(`Reg: ${data.companyReg}`, m, y); y += 4; }
        if (data.companyAddress) {
            data.companyAddress.split('\n').forEach(l => { doc.text(l, m, y); y += 4; });
        }
        [data.companyEmail, data.companyPhone].filter(Boolean).forEach(c => { doc.text(c, m, y); y += 4; });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        setColor(doc, pal.accent);
        doc.text('QUOTATION', PAGE.w - m, m + 8, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        setColor(doc, pal.text);
        doc.text(`#${data.quoteNumber || 'QT-001'}`, PAGE.w - m, m + 15, { align: 'right' });
        doc.text(`Date: ${formatDate(data.quoteDate)}`, PAGE.w - m, m + 21, { align: 'right' });
        doc.text(`Valid Until: ${formatDate(data.validUntil)}`, PAGE.w - m, m + 27, { align: 'right' });

        y += 2;
        setFill(doc, pal.accent);
        doc.rect(m, y, w, 0.5, 'F');
        y += 8;
    }

    // Client
    drawRect(doc, m, y - 3, w, 24, pal.bg);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setColor(doc, pal.muted);
    doc.text('QUOTED TO', m + 4, y + 1);
    y += 6;
    doc.setFontSize(11);
    setColor(doc, pal.text);
    doc.text(data.clientName || 'Client', m + 4, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(doc, pal.muted);
    if (data.clientContact) { doc.text(`Attn: ${data.clientContact}`, m + 4, y); y += 4; }
    if (data.clientAddress) {
        data.clientAddress.split('\n').forEach(l => { doc.text(l, m + 4, y); y += 4; });
    }
    y += 8;

    // Items table
    const items = data.items || [];
    const taxRate = parseFloat(data.taxRate || 15) / 100;
    const discountRate = parseFloat(data.discount || 0) / 100;

    const tableBody = items.map(item => {
        const q = parseFloat(item.itemQty || 0);
        const p = parseFloat(item.itemPrice || 0);
        return [item.itemDesc || '', q.toString(), formatCurrency(p), formatCurrency(q * p)];
    });

    doc.autoTable({
        startY: y,
        head: [['Description', 'Qty', 'Unit Price', 'Amount']],
        body: tableBody,
        margin: { left: m, right: m },
        styles: { fontSize: 9, cellPadding: 4, textColor: pal.text, lineColor: [220, 220, 220], lineWidth: 0.2 },
        headStyles: { fillColor: pal.accent, textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 251, 253] },
        columnStyles: { 1: { halign: 'right', cellWidth: 20 }, 2: { halign: 'right', cellWidth: 30 }, 3: { halign: 'right', cellWidth: 30 } },
    });

    y = doc.lastAutoTable.finalY + 8;

    // Totals
    let subtotal = 0;
    items.forEach(i => subtotal += parseFloat(i.itemQty || 0) * parseFloat(i.itemPrice || 0));
    const discountAmt = subtotal * discountRate;
    const taxable = subtotal - discountAmt;
    const tax = taxable * taxRate;
    const total = taxable + tax;

    const tx = PAGE.w - m - 60;
    const vx = PAGE.w - m;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setColor(doc, pal.text);
    doc.text('Subtotal:', tx, y); doc.text(formatCurrency(subtotal), vx, y, { align: 'right' }); y += 6;
    if (discountAmt > 0) {
        doc.text(`Discount (${(discountRate * 100).toFixed(0)}%):`, tx, y); doc.text(`-${formatCurrency(discountAmt)}`, vx, y, { align: 'right' }); y += 6;
    }
    doc.text(`VAT (${(taxRate * 100).toFixed(0)}%):`, tx, y); doc.text(formatCurrency(tax), vx, y, { align: 'right' }); y += 2;
    setFill(doc, pal.accent);
    doc.rect(tx, y, 60, 0.5, 'F'); y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    setColor(doc, pal.primary);
    doc.text('TOTAL:', tx, y); doc.text(formatCurrency(total), vx, y, { align: 'right' }); y += 14;

    // Terms
    if (data.terms) {
        y = checkPage(doc, y, 30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        setColor(doc, pal.primary);
        doc.text('TERMS & CONDITIONS', m, y); y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        setColor(doc, pal.text);
        data.terms.split('\n').forEach(line => {
            y = checkPage(doc, y, 6);
            doc.text(line, m, y); y += 4;
        });
        y += 4;
    }

    if (data.notes) {
        y = checkPage(doc, y, 15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        setColor(doc, pal.muted);
        doc.text('NOTES', m, y); y += 5;
        doc.setFont('helvetica', 'normal');
        setColor(doc, pal.text);
        data.notes.split('\n').forEach(line => { y = checkPage(doc, y, 5); doc.text(line, m, y); y += 4; });
    }

    addPageNumbers(doc);
    downloadPDF(doc, `Quotation_${data.quoteNumber || 'QT-001'}.pdf`);
}

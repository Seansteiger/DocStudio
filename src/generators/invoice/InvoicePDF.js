import { createPDF, PALETTES, PAGE, setColor, setFill, drawRect, addWrappedText, addPageNumbers, checkPage, downloadPDF, formatDate, formatCurrency } from '../../utils/pdf-helpers.js';

export const INVOICE_TEMPLATES = [
    { id: 'professional', name: 'Professional', icon: '💼', desc: 'Clean business invoice' },
    { id: 'modern', name: 'Modern', icon: '✨', desc: 'Contemporary colored header' },
    { id: 'minimal', name: 'Minimal', icon: '◻️', desc: 'Simple and clean' },
    { id: 'corporate', name: 'Corporate', icon: '🏢', desc: 'Formal corporate style' },
    { id: 'bold', name: 'Bold', icon: '🔴', desc: 'Eye-catching red accents' },
];

export function generateInvoicePDF(data, templateId) {
    const doc = createPDF();
    const pal = PALETTES[templateId] || PALETTES.professional;
    const m = PAGE.margin;
    const w = PAGE.w - 2 * m;
    let y = m;

    // Header
    if (templateId === 'modern' || templateId === 'bold') {
        drawRect(doc, 0, 0, PAGE.w, 55, pal.primary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text(data.sellerName || 'Business Name', m, 22);
        doc.setFontSize(10);
        doc.setTextColor(200, 210, 230);
        if (data.sellerAddress) {
            const addrLines = data.sellerAddress.split('\n');
            addrLines.forEach((line, i) => doc.text(line, m, 30 + i * 4.5));
        }
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text('TAX INVOICE', PAGE.w - m, 22, { align: 'right' });
        doc.setFontSize(10);
        doc.text(`#${data.invoiceNumber || 'INV-001'}`, PAGE.w - m, 30, { align: 'right' });
        doc.text(`Date: ${formatDate(data.invoiceDate)}`, PAGE.w - m, 36, { align: 'right' });
        if (data.dueDate) doc.text(`Due: ${formatDate(data.dueDate)}`, PAGE.w - m, 42, { align: 'right' });
        y = 65;
    } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        setColor(doc, pal.primary);
        doc.text(data.sellerName || 'Business Name', m, y + 8);
        y += 12;

        if (data.sellerVat) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setColor(doc, pal.muted);
            doc.text(`VAT No: ${data.sellerVat}`, m, y);
            y += 4;
        }

        doc.setFontSize(9);
        setColor(doc, pal.muted);
        if (data.sellerAddress) {
            const addrLines = data.sellerAddress.split('\n');
            addrLines.forEach(line => { doc.text(line, m, y); y += 4; });
        }
        if (data.sellerEmail) { doc.text(data.sellerEmail, m, y); y += 4; }
        if (data.sellerPhone) { doc.text(data.sellerPhone, m, y); y += 4; }

        // Invoice number on right
        const rightX = PAGE.w - m;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        setColor(doc, pal.accent);
        doc.text('TAX INVOICE', rightX, m + 8, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        setColor(doc, pal.text);
        doc.text(`Invoice #: ${data.invoiceNumber || 'INV-001'}`, rightX, m + 16, { align: 'right' });
        doc.text(`Date: ${formatDate(data.invoiceDate)}`, rightX, m + 22, { align: 'right' });
        if (data.dueDate) doc.text(`Due: ${formatDate(data.dueDate)}`, rightX, m + 28, { align: 'right' });

        y += 4;
        setFill(doc, pal.accent);
        doc.rect(m, y, w, 0.5, 'F');
        y += 8;
    }

    // Bill To
    drawRect(doc, m, y - 3, w, 28, pal.bg);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setColor(doc, pal.muted);
    doc.text('BILL TO', m + 4, y + 1);
    y += 6;
    doc.setFontSize(11);
    setColor(doc, pal.text);
    doc.text(data.buyerName || 'Client Name', m + 4, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(doc, pal.muted);
    if (data.buyerVat) { doc.text(`VAT: ${data.buyerVat}`, m + 4, y); y += 4; }
    if (data.buyerAddress) {
        const lines = data.buyerAddress.split('\n');
        lines.forEach(line => { doc.text(line, m + 4, y); y += 4; });
    }
    y += 10;

    // Line items table
    const items = data.items || [];
    const taxRate = parseFloat(data.taxRate || 15) / 100;
    const discountRate = parseFloat(data.discount || 0) / 100;

    const tableBody = items.map(item => {
        const qty = parseFloat(item.itemQty || 0);
        const price = parseFloat(item.itemPrice || 0);
        return [item.itemDesc || '', qty.toString(), formatCurrency(price), formatCurrency(qty * price)];
    });

    doc.autoTable({
        startY: y,
        head: [['Description', 'Qty', 'Unit Price', 'Amount']],
        body: tableBody,
        margin: { left: m, right: m },
        styles: { fontSize: 9, cellPadding: 4, textColor: pal.text, lineColor: [220, 220, 220], lineWidth: 0.2 },
        headStyles: { fillColor: pal.accent, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
        alternateRowStyles: { fillColor: [250, 251, 253] },
        columnStyles: { 0: { cellWidth: 'auto' }, 1: { halign: 'right', cellWidth: 20 }, 2: { halign: 'right', cellWidth: 30 }, 3: { halign: 'right', cellWidth: 30 } },
    });

    y = doc.lastAutoTable.finalY + 8;

    // Totals
    let subtotal = 0;
    items.forEach(item => { subtotal += parseFloat(item.itemQty || 0) * parseFloat(item.itemPrice || 0); });
    const discountAmt = subtotal * discountRate;
    const taxableAmount = subtotal - discountAmt;
    const tax = taxableAmount * taxRate;
    const total = taxableAmount + tax;

    const totalsX = PAGE.w - m - 60;
    const valX = PAGE.w - m;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setColor(doc, pal.text);
    doc.text('Subtotal:', totalsX, y);
    doc.text(formatCurrency(subtotal), valX, y, { align: 'right' });
    y += 6;

    if (discountAmt > 0) {
        doc.text(`Discount (${(discountRate * 100).toFixed(0)}%):`, totalsX, y);
        doc.text(`-${formatCurrency(discountAmt)}`, valX, y, { align: 'right' });
        y += 6;
    }

    doc.text(`VAT (${(taxRate * 100).toFixed(0)}%):`, totalsX, y);
    doc.text(formatCurrency(tax), valX, y, { align: 'right' });
    y += 2;
    setFill(doc, pal.accent);
    doc.rect(totalsX, y, 60, 0.5, 'F');
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    setColor(doc, pal.primary);
    doc.text('TOTAL:', totalsX, y);
    doc.text(formatCurrency(total), valX, y, { align: 'right' });
    y += 12;

    // Notes
    if (data.notes) {
        y = checkPage(doc, y, 30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        setColor(doc, pal.muted);
        doc.text('NOTES / PAYMENT TERMS', m, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        setColor(doc, pal.text);
        const noteLines = data.notes.split('\n');
        noteLines.forEach(line => {
            y = checkPage(doc, y, 6);
            doc.text(line, m, y);
            y += 4.5;
        });
    }

    addPageNumbers(doc);
    downloadPDF(doc, `Invoice_${data.invoiceNumber || 'INV-001'}.pdf`);
}

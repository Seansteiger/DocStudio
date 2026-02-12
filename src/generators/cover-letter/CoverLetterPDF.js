import { createPDF, PALETTES, PAGE, setColor, setFill, drawRect, addWrappedText, addPageNumbers, checkPage, downloadPDF, formatDate } from '../../utils/pdf-helpers.js';

export const COVER_LETTER_TEMPLATES = [
    { id: 'professional', name: 'Professional', icon: '💼', desc: 'Traditional business letter' },
    { id: 'modern', name: 'Modern', icon: '✨', desc: 'Contemporary with color header' },
    { id: 'elegant', name: 'Elegant', icon: '🖋️', desc: 'Refined serif typography' },
    { id: 'minimal', name: 'Minimal', icon: '◻️', desc: 'Clean and simple' },
    { id: 'creative', name: 'Creative', icon: '🎨', desc: 'Bold and expressive' },
];

export function generateCoverLetterPDF(data, templateId) {
    const doc = createPDF();
    const pal = PALETTES[templateId] || PALETTES.professional;
    const m = PAGE.margin;
    const w = PAGE.w - 2 * m;
    let y = m;

    const dateStr = data.letterDate
        ? new Date(data.letterDate).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });

    // Header styles based on template
    if (templateId === 'modern' || templateId === 'creative') {
        drawRect(doc, 0, 0, PAGE.w, 42, pal.primary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text(data.senderName || 'Your Name', m, 18);
        doc.setFontSize(10);
        doc.setTextColor(200, 215, 235);
        doc.text(data.senderTitle || '', m, 26);
        doc.setFontSize(8);
        doc.setTextColor(180, 195, 220);
        doc.text([data.senderEmail, data.senderPhone].filter(Boolean).join(' • '), m, 33);
        if (data.senderAddress) {
            const addrLine = data.senderAddress.replace(/\n/g, ', ');
            doc.text(addrLine, m, 38);
        }
        y = 52;
    } else if (templateId === 'elegant') {
        doc.setFont('times', 'bold');
        doc.setFontSize(20);
        setColor(doc, pal.primary);
        doc.text(data.senderName || 'Your Name', PAGE.w / 2, y + 10, { align: 'center' });
        y += 15;
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        setColor(doc, pal.muted);
        doc.text([data.senderEmail, data.senderPhone].filter(Boolean).join(' • '), PAGE.w / 2, y, { align: 'center' });
        y += 4;
        if (data.senderAddress) {
            doc.text(data.senderAddress.replace(/\n/g, ', '), PAGE.w / 2, y, { align: 'center' });
            y += 4;
        }
        y += 2;
        setFill(doc, pal.accent);
        doc.rect(PAGE.w / 2 - 30, y, 60, 0.5, 'F');
        y += 10;
    } else {
        // Professional / Minimal
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        setColor(doc, pal.primary);
        doc.text(data.senderName || 'Your Name', m, y + 8);
        y += 12;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        setColor(doc, pal.muted);
        if (data.senderTitle) { doc.text(data.senderTitle, m, y); y += 4; }
        if (data.senderAddress) {
            data.senderAddress.split('\n').forEach(line => { doc.text(line, m, y); y += 4; });
        }
        doc.text([data.senderEmail, data.senderPhone].filter(Boolean).join(' | '), m, y);
        y += 4;
        setFill(doc, pal.accent);
        doc.rect(m, y + 1, w, 0.5, 'F');
        y += 10;
    }

    // Date
    const fontFamily = templateId === 'elegant' ? 'times' : 'helvetica';
    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(10);
    setColor(doc, pal.text);
    doc.text(dateStr, m, y);
    y += 10;

    // Recipient
    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(10);
    setColor(doc, pal.text);
    if (data.recipientName) { doc.text(data.recipientName, m, y); y += 5; }
    if (data.recipientTitle) { doc.text(data.recipientTitle, m, y); y += 5; }
    if (data.recipientCompany) {
        doc.setFont(fontFamily, 'bold');
        doc.text(data.recipientCompany, m, y);
        doc.setFont(fontFamily, 'normal');
        y += 5;
    }
    if (data.recipientAddress) {
        doc.setFontSize(9);
        setColor(doc, pal.muted);
        data.recipientAddress.split('\n').forEach(line => { doc.text(line, m, y); y += 4; });
    }
    y += 8;

    // Subject line
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(10);
    setColor(doc, pal.text);
    doc.text(`Re: Application for ${data.position || 'Position'}`, m, y);
    y += 10;

    // Salutation
    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(10);
    setColor(doc, pal.text);
    doc.text(`Dear ${data.recipientName || 'Hiring Manager'},`, m, y);
    y += 8;

    // Body paragraphs
    const lineHeight = 4.8;
    const bodySize = templateId === 'elegant' ? 10.5 : 10;
    doc.setFontSize(bodySize);

    const paragraphs = [data.opening, data.body1, data.body2, data.closing].filter(Boolean);
    paragraphs.forEach(para => {
        y = checkPage(doc, y, 20);
        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(bodySize);
        setColor(doc, pal.text);
        y = addWrappedText(doc, para, m, y, w, lineHeight);
        y += 6;
    });

    // Closing
    y = checkPage(doc, y, 30);
    y += 4;
    doc.text('Sincerely,', m, y);
    y += 18;
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(11);
    setColor(doc, pal.primary);
    doc.text(data.senderName || 'Your Name', m, y);

    addPageNumbers(doc);
    downloadPDF(doc, `Cover_Letter_${(data.recipientCompany || 'letter').replace(/\s+/g, '_')}.pdf`);
}

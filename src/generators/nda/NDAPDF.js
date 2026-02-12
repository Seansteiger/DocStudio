import { createPDF, PALETTES, PAGE, setColor, setFill, drawRect, addWrappedText, addPageNumbers, checkPage, downloadPDF, formatDate } from '../../utils/pdf-helpers.js';

export const NDA_TEMPLATES = [
    { id: 'professional', name: 'Standard', icon: '📋', desc: 'Traditional legal format' },
    { id: 'modern', name: 'Modern', icon: '✨', desc: 'Contemporary style' },
    { id: 'corporate', name: 'Corporate', icon: '🏢', desc: 'Formal corporate NDA' },
    { id: 'minimal', name: 'Simple', icon: '◻️', desc: 'Simplified agreement' },
];

export function generateNDAPDF(data, templateId) {
    const doc = createPDF();
    const pal = PALETTES[templateId] || PALETTES.professional;
    const m = PAGE.margin;
    const w = PAGE.w - 2 * m;
    let y = m;

    const mutual = data.ndaType === 'mutual';
    const dateStr = data.effectiveDate
        ? new Date(data.effectiveDate).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });

    // Header
    if (templateId === 'modern' || templateId === 'corporate') {
        drawRect(doc, 0, 0, PAGE.w, 35, pal.primary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text(`${mutual ? 'MUTUAL ' : ''}NON-DISCLOSURE AGREEMENT`, PAGE.w / 2, 18, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(200, 215, 235);
        doc.text(`Effective Date: ${dateStr}`, PAGE.w / 2, 28, { align: 'center' });
        y = 45;
    } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        setColor(doc, pal.primary);
        doc.text(`${mutual ? 'MUTUAL ' : ''}NON-DISCLOSURE AGREEMENT`, PAGE.w / 2, y + 10, { align: 'center' });
        y += 14;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        setColor(doc, pal.muted);
        doc.text(`Effective Date: ${dateStr}`, PAGE.w / 2, y, { align: 'center' });
        y += 4;
        setFill(doc, pal.accent);
        doc.rect(PAGE.w / 2 - 30, y + 2, 60, 0.5, 'F');
        y += 12;
    }

    // Intro paragraph
    const fontFamily = templateId === 'minimal' ? 'helvetica' : 'helvetica';
    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(10);
    setColor(doc, pal.text);

    const intro = `This Non-Disclosure Agreement ("Agreement") is entered into as of ${dateStr}, by and between:`;
    y = addWrappedText(doc, intro, m, y, w, 5);
    y += 6;

    // Party 1
    drawRect(doc, m, y - 3, w / 2 - 3, 22, pal.bg);
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(8);
    setColor(doc, pal.muted);
    doc.text(mutual ? 'PARTY A (Disclosing & Receiving)' : 'DISCLOSING PARTY', m + 4, y + 1);
    y += 5;
    doc.setFontSize(10);
    setColor(doc, pal.text);
    doc.text(data.discloserName || '[Party 1 Name]', m + 4, y + 1);
    y += 5;
    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(8);
    setColor(doc, pal.muted);
    if (data.discloserRep) doc.text(`Rep: ${data.discloserRep}`, m + 4, y);

    // Party 2
    const p2x = m + w / 2 + 3;
    drawRect(doc, p2x, y - 11, w / 2 - 3, 22, pal.bg);
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(8);
    setColor(doc, pal.muted);
    doc.text(mutual ? 'PARTY B (Disclosing & Receiving)' : 'RECEIVING PARTY', p2x + 4, y - 6);
    doc.setFontSize(10);
    setColor(doc, pal.text);
    doc.text(data.receiverName || '[Party 2 Name]', p2x + 4, y - 1);
    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(8);
    setColor(doc, pal.muted);
    if (data.receiverRep) doc.text(`Rep: ${data.receiverRep}`, p2x + 4, y + 4);

    y += 16;

    // Helper to add numbered clauses
    let clauseNum = 1;
    function addClause(title, content) {
        y = checkPage(doc, y, 20);
        doc.setFont(fontFamily, 'bold');
        doc.setFontSize(11);
        setColor(doc, pal.primary);
        doc.text(`${clauseNum}. ${title}`, m, y);
        y += 6;
        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(9.5);
        setColor(doc, pal.text);
        y = addWrappedText(doc, content, m, y, w, 4.5);
        y += 6;
        clauseNum++;
    }

    // Clauses
    addClause('PURPOSE', data.purpose || 'The confidential information is being shared for the purpose of evaluating a potential business relationship between the parties.');

    const confDef = data.confDefinition || '"Confidential Information" shall mean all information, whether written, oral, electronic, or visual, that is disclosed by one party to the other, including but not limited to trade secrets, business plans, financial data, customer lists, technical specifications, and any other proprietary information.';
    addClause('DEFINITION OF CONFIDENTIAL INFORMATION', confDef);

    const obligations = mutual
        ? `Each party agrees to: (a) maintain the confidentiality of the other party's Confidential Information with at least the same degree of care it uses for its own confidential information; (b) not disclose the Confidential Information to any third party without prior written consent; (c) use the Confidential Information solely for the Purpose described in Section 1; (d) immediately notify the disclosing party of any unauthorized disclosure or use.`
        : `The Receiving Party agrees to: (a) maintain the confidentiality of the Disclosing Party's Confidential Information with at least the same degree of care it uses for its own confidential information; (b) not disclose the Confidential Information to any third party without prior written consent of the Disclosing Party; (c) use the Confidential Information solely for the Purpose described in Section 1; (d) immediately notify the Disclosing Party of any unauthorized disclosure or use.`;
    addClause('OBLIGATIONS', obligations);

    const excl = data.exclusions || 'The obligations of confidentiality shall not apply to information that: (a) is or becomes publicly available through no fault of the receiving party; (b) was already known to the receiving party prior to disclosure; (c) is independently developed by the receiving party without reference to the Confidential Information; (d) is rightfully received from a third party without restriction.';
    addClause('EXCLUSIONS', excl);

    addClause('TERM', `This Agreement shall remain in effect for a period of ${data.duration || 2} year(s) from the Effective Date. The obligations of confidentiality shall survive the termination of this Agreement for an additional period of ${data.duration || 2} year(s).`);

    addClause('RETURN OF INFORMATION', 'Upon termination of this Agreement or upon request by the disclosing party, the receiving party shall promptly return or destroy all copies of the Confidential Information in its possession, including any notes, summaries, or analyses derived from the Confidential Information.');

    addClause('REMEDIES', 'The parties acknowledge that any breach of this Agreement may cause irreparable harm for which monetary damages would be insufficient. Accordingly, the non-breaching party shall be entitled to seek injunctive relief in addition to any other remedies available at law or in equity.');

    addClause('GOVERNING LAW', `This Agreement shall be governed by and construed in accordance with the laws of ${data.jurisdiction || 'South Africa'}. Any disputes arising from this Agreement shall be subject to the exclusive jurisdiction of the courts of ${data.jurisdiction || 'South Africa'}.`);

    addClause('ENTIRE AGREEMENT', 'This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior agreements, negotiations, and discussions. This Agreement may not be amended except by a written document signed by both parties.');

    // Signature block
    y = checkPage(doc, y, 50);
    y += 8;
    setFill(doc, pal.accent);
    doc.rect(m, y, w, 0.5, 'F');
    y += 10;

    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(10);
    setColor(doc, pal.text);
    doc.text('IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.', m, y);
    y += 12;

    // Two signature columns
    const colW = (w - 10) / 2;

    // Left
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(9);
    setColor(doc, pal.muted);
    doc.text(mutual ? 'PARTY A' : 'DISCLOSING PARTY', m, y);
    y += 8;
    doc.setLineWidth(0.3);
    doc.setDrawColor(pal.text[0], pal.text[1], pal.text[2]);
    doc.line(m, y + 15, m + colW, y + 15);
    doc.setFontSize(8);
    setColor(doc, pal.muted);
    doc.text('Signature', m, y + 19);
    doc.line(m, y + 30, m + colW, y + 30);
    doc.text('Print Name', m, y + 34);
    doc.line(m, y + 42, m + colW, y + 42);
    doc.text('Date', m, y + 46);

    // Right
    const rx = m + colW + 10;
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(9);
    setColor(doc, pal.muted);
    doc.text(mutual ? 'PARTY B' : 'RECEIVING PARTY', rx, y - 8);
    doc.setLineWidth(0.3);
    doc.line(rx, y + 15, rx + colW, y + 15);
    doc.setFontSize(8);
    doc.text('Signature', rx, y + 19);
    doc.line(rx, y + 30, rx + colW, y + 30);
    doc.text('Print Name', rx, y + 34);
    doc.line(rx, y + 42, rx + colW, y + 42);
    doc.text('Date', rx, y + 46);

    addPageNumbers(doc);
    downloadPDF(doc, `NDA_${(data.discloserName || 'agreement').replace(/\s+/g, '_')}.pdf`);
}

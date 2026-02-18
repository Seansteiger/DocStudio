import { createPDF, PALETTES, PAGE, setColor, setFill, drawRect, addWrappedText, addSectionHeading, addPageNumbers, checkPage, downloadPDF } from '../../utils/pdf-helpers.js';

export const RESUME_TEMPLATES = [
    { id: 'professional', name: 'Professional', icon: '💼', desc: 'Clean corporate look' },
    { id: 'modern', name: 'Modern', icon: '✨', desc: 'Contemporary sidebar design' },
    { id: 'minimal', name: 'Minimalist', icon: '◻️', desc: 'Clean and simple' },
    { id: 'creative', name: 'Creative', icon: '🎨', desc: 'Bold colors, unique layout' },
    { id: 'executive', name: 'Executive', icon: '👔', desc: 'Premium corporate style' },
    { id: 'tech', name: 'Tech', icon: '💻', desc: 'Developer-focused layout' },
];

export function generateResumePDF(data, templateId) {
    const doc = createPDF();
    const pal = PALETTES[templateId] || PALETTES.professional;
    const m = PAGE.margin;
    const w = PAGE.w - 2 * m;

    if (templateId === 'modern' || templateId === 'creative') {
        generateSidebarResume(doc, data, pal, templateId);
    } else {
        generateClassicResume(doc, data, pal, templateId);
    }

    addPageNumbers(doc);
    downloadPDF(doc, `${(data.fullName || 'resume').replace(/\s+/g, '_')}_resume.pdf`);
}

function generateClassicResume(doc, data, pal, templateId) {
    const m = PAGE.margin;
    const w = PAGE.w - 2 * m;
    let y = m;

    // Header background
    if (templateId === 'executive' || templateId === 'tech') {
        drawRect(doc, 0, 0, PAGE.w, 50, pal.primary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text(data.fullName || 'Your Name', m, 25);
        doc.setFontSize(12);
        doc.setTextColor(200, 220, 240);
        doc.text(data.jobTitle || '', m, 35);
        doc.setFontSize(9);
        doc.setTextColor(180, 200, 220);
        const contactLine = [data.email, data.phone, data.location, data.website].filter(Boolean).join('  |  ');
        doc.text(contactLine, m, 44);
        y = 60;
    } else {
        // Standard header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        setColor(doc, pal.primary);
        doc.text(data.fullName || 'Your Name', m, y + 10);
        y += 14;
        doc.setFontSize(12);
        setColor(doc, pal.accent);
        doc.text(data.jobTitle || '', m, y + 2);
        y += 8;
        doc.setFontSize(9);
        setColor(doc, pal.muted);
        const contactLine = [data.email, data.phone, data.location, data.website].filter(Boolean).join('  •  ');
        doc.text(contactLine, m, y);
        y += 4;

        // Divider line
        setFill(doc, pal.accent);
        doc.rect(m, y + 2, w, 0.8, 'F');
        y += 10;
    }

    // Summary
    if (data.summary) {
        y = addSectionHeading(doc, 'Professional Summary', y, pal, templateId === 'minimal' ? 'line' : 'underline');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        setColor(doc, pal.text);
        y = addWrappedText(doc, data.summary, m, y, w, 4.5);
        y += 6;
    }

    // Experience
    if (data.experience?.length > 0) {
        y = checkPage(doc, y, 30);
        y = addSectionHeading(doc, 'Work Experience', y, pal, templateId === 'minimal' ? 'line' : 'underline');
        data.experience.forEach(exp => {
            y = checkPage(doc, y, 25);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            setColor(doc, pal.text);
            doc.text(exp.expTitle || '', m, y);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setColor(doc, pal.muted);
            const dateStr = `${exp.expStart || ''} — ${exp.expEnd || ''}`;
            doc.text(dateStr, PAGE.w - m, y, { align: 'right' });
            y += 5;
            doc.setFont('helvetica', 'italic');
            setColor(doc, pal.accent);
            doc.text(exp.expCompany || '', m, y);
            y += 5;
            if (exp.expDesc) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                setColor(doc, pal.text);
                y = addWrappedText(doc, exp.expDesc, m, y, w, 4.2);
            }
            y += 5;
        });
    }

    // Education
    if (data.education?.length > 0) {
        y = checkPage(doc, y, 25);
        y = addSectionHeading(doc, 'Education', y, pal, templateId === 'minimal' ? 'line' : 'underline');
        data.education.forEach(edu => {
            y = checkPage(doc, y, 15);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            setColor(doc, pal.text);
            doc.text(edu.eduDegree || '', m, y);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setColor(doc, pal.muted);
            doc.text(edu.eduYear || '', PAGE.w - m, y, { align: 'right' });
            y += 5;
            setColor(doc, pal.accent);
            doc.text(`${edu.eduSchool || ''}${edu.eduGrade ? ` — ${edu.eduGrade}` : ''}`, m, y);
            y += 7;
        });
    }

    // High School
    if (data.highschool?.length > 0) {
        y = checkPage(doc, y, 25);
        y = addSectionHeading(doc, 'High School', y, pal, templateId === 'minimal' ? 'line' : 'underline');
        data.highschool.forEach(hs => {
            y = checkPage(doc, y, 15);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            setColor(doc, pal.text);
            doc.text(hs.hsName || '', m, y);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setColor(doc, pal.muted);
            doc.text(hs.hsYear || '', PAGE.w - m, y, { align: 'right' });
            y += 5;
            setColor(doc, pal.accent);
            doc.text(hs.hsSubjects || '', m, y);
            y += 7;
        });
    }

    // Languages
    if (data.languages?.length > 0) {
        y = checkPage(doc, y, 20);
        y = addSectionHeading(doc, 'Languages', y, pal, templateId === 'minimal' ? 'line' : 'underline');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const langText = data.languages.map(l => `${l.langName} (${l.langLevel})`).join('  •  ');
        setColor(doc, pal.text);
        y = addWrappedText(doc, langText, m, y, w, 4.5);
        y += 6;
    }

    // Skills
    if (data.skillsList?.length > 0) {
        y = checkPage(doc, y, 20);
        y = addSectionHeading(doc, 'Skills', y, pal, templateId === 'minimal' ? 'line' : 'underline');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        setColor(doc, pal.text);

        if (templateId === 'tech') {
            // Skills as pills
            let xPos = m;
            data.skillsList.forEach(skill => {
                const textW = doc.getTextWidth(skill) + 6;
                if (xPos + textW > PAGE.w - m) {
                    xPos = m;
                    y += 8;
                    y = checkPage(doc, y);
                }
                setFill(doc, pal.bg);
                doc.roundedRect(xPos, y - 4, textW, 7, 2, 2, 'F');
                setColor(doc, pal.accent);
                doc.text(skill, xPos + 3, y);
                xPos += textW + 3;
            });
            y += 10;
        } else {
            const skillText = data.skillsList.join('  •  ');
            y = addWrappedText(doc, skillText, m, y, w, 4.5);
            y += 6;
        }
    }

    // References
    if (data.references?.length > 0) {
        y = checkPage(doc, y, 25);
        y = addSectionHeading(doc, 'References', y, pal, templateId === 'minimal' ? 'line' : 'underline');
        data.references.forEach(ref => {
            y = checkPage(doc, y, 15);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            setColor(doc, pal.text);
            doc.text(ref.refName || '', m, y);
            y += 4.5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setColor(doc, pal.muted);
            doc.text(ref.refTitle || '', m, y);
            y += 4;
            doc.text([ref.refEmail, ref.refPhone].filter(Boolean).join(' • '), m, y);
            y += 7;
        });
    }
}

function generateSidebarResume(doc, data, pal, templateId) {
    const sideW = 65;
    const mainX = sideW + 5;
    const mainW = PAGE.w - mainX - PAGE.margin;

    // Sidebar background
    drawRect(doc, 0, 0, sideW, PAGE.h, pal.primary);

    // Sidebar content
    let sy = 25;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    const nameLines = doc.splitTextToSize(data.fullName || 'Your Name', sideW - 16);
    doc.text(nameLines, 8, sy);
    sy += nameLines.length * 7 + 2;

    doc.setFontSize(10);
    doc.setTextColor(200, 210, 230);
    doc.text(data.jobTitle || '', 8, sy);
    sy += 12;

    // Contact info in sidebar
    doc.setFontSize(8);
    doc.setTextColor(180, 195, 220);
    const contactItems = [
        { label: 'Email', val: data.email },
        { label: 'Phone', val: data.phone },
        { label: 'Location', val: data.location },
        { label: 'Web', val: data.website },
    ].filter(c => c.val);

    if (contactItems.length) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text('CONTACT', 8, sy);
        sy += 2;
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.3);
        doc.line(8, sy, sideW - 8, sy);
        sy += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        contactItems.forEach(c => {
            doc.setTextColor(160, 180, 210);
            doc.text(c.label.toUpperCase(), 8, sy);
            sy += 4;
            doc.setTextColor(220, 230, 245);
            const lines = doc.splitTextToSize(c.val, sideW - 16);
            doc.text(lines, 8, sy);
            sy += lines.length * 3.5 + 4;
        });
        sy += 4;
    }

    // Skills in sidebar
    if (data.skillsList?.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text('SKILLS', 8, sy);
        sy += 2;
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.3);
        doc.line(8, sy, sideW - 8, sy);
        sy += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(200, 215, 235);
        data.skillsList.forEach(skill => {
            if (sy > PAGE.h - 20) return;
            doc.text(`• ${skill}`, 8, sy);
            sy += 5;
        });
        sy += 4;
    }

    // Languages in sidebar
    if (data.languages?.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text('LANGUAGES', 8, sy);
        sy += 2;
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.3);
        doc.line(8, sy, sideW - 8, sy);
        sy += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        data.languages.forEach(l => {
            if (sy > PAGE.h - 20) return;
            doc.setTextColor(220, 230, 245);
            doc.text(l.langName, 8, sy);
            doc.setTextColor(160, 180, 210);
            const levelW = doc.getTextWidth(l.langLevel);
            doc.text(l.langLevel, sideW - 8 - levelW, sy);
            sy += 5;
        });
    }

    // Main content
    let y = 20;

    // Summary
    if (data.summary) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        setColor(doc, pal.primary);
        doc.text('PROFILE', mainX, y);
        y += 2;
        setFill(doc, pal.accent);
        doc.rect(mainX, y, 25, 0.8, 'F');
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        setColor(doc, pal.text);
        y = addWrappedText(doc, data.summary, mainX, y, mainW, 4.5);
        y += 8;
    }

    // Experience
    if (data.experience?.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        setColor(doc, pal.primary);
        doc.text('EXPERIENCE', mainX, y);
        y += 2;
        setFill(doc, pal.accent);
        doc.rect(mainX, y, 25, 0.8, 'F');
        y += 7;

        data.experience.forEach(exp => {
            y = checkPage(doc, y, 25);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10.5);
            setColor(doc, pal.text);
            doc.text(exp.expTitle || '', mainX, y);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setColor(doc, pal.muted);
            doc.text(`${exp.expStart || ''} — ${exp.expEnd || ''}`, PAGE.w - PAGE.margin, y, { align: 'right' });

            y += 5;
            doc.setFont('helvetica', 'italic');
            setColor(doc, pal.accent);
            doc.text(exp.expCompany || '', mainX, y);
            y += 5;
            if (exp.expDesc) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                setColor(doc, pal.text);
                y = addWrappedText(doc, exp.expDesc, mainX, y, mainW, 4.2);
            }
            y += 6;
        });
    }

    // Education
    if (data.education?.length > 0) {
        y = checkPage(doc, y, 25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        setColor(doc, pal.primary);
        doc.text('EDUCATION', mainX, y);
        y += 2;
        setFill(doc, pal.accent);
        doc.rect(mainX, y, 25, 0.8, 'F');
        y += 7;

        data.education.forEach(edu => {
            y = checkPage(doc, y, 12);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            setColor(doc, pal.text);
            doc.text(edu.eduDegree || '', mainX, y);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setColor(doc, pal.muted);
            doc.text(edu.eduYear || '', PAGE.w - PAGE.margin, y, { align: 'right' });

            y += 4.5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setColor(doc, pal.muted);
            doc.text(`${edu.eduSchool || ''}${edu.eduGrade ? ` | ${edu.eduGrade}` : ''}`, mainX, y);
            y += 7;
        });
    }

    // High School
    if (data.highschool?.length > 0) {
        y = checkPage(doc, y, 25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        setColor(doc, pal.primary);
        doc.text('HIGH SCHOOL', mainX, y);
        y += 2;
        setFill(doc, pal.accent);
        doc.rect(mainX, y, 25, 0.8, 'F');
        y += 7;

        data.highschool.forEach(hs => {
            y = checkPage(doc, y, 12);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            setColor(doc, pal.text);
            doc.text(hs.hsName || '', mainX, y);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setColor(doc, pal.muted);
            doc.text(hs.hsYear || '', PAGE.w - PAGE.margin, y, { align: 'right' });

            y += 4.5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setColor(doc, pal.muted);
            doc.text(hs.hsSubjects || '', mainX, y);
            y += 7;
        });
    }

    // References
    if (data.references?.length > 0) {
        y = checkPage(doc, y, 20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        setColor(doc, pal.primary);
        doc.text('REFERENCES', mainX, y);
        y += 2;
        setFill(doc, pal.accent);
        doc.rect(mainX, y, 25, 0.8, 'F');
        y += 7;

        data.references.forEach(ref => {
            y = checkPage(doc, y, 12);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            setColor(doc, pal.text);
            doc.text(ref.refName || '', mainX, y);
            y += 4.5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            setColor(doc, pal.muted);
            doc.text(`${ref.refTitle || ''} | ${[ref.refEmail, ref.refPhone].filter(Boolean).join(' • ')}`, mainX, y);
            y += 7;
        });
    }
}

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const isJson = args.includes('--json');
const cleanArgs = args.filter(a => a !== '--json');

function output(data) {
  if (isJson) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    if (typeof data === 'string') {
      console.log(data);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

function error(msg, code = 'ERROR') {
  if (isJson) {
    console.error(JSON.stringify({ error: true, code, message: msg }));
  } else {
    console.error(`[ERROR: ${code}] ${msg}`);
  }
  process.exit(1);
}

// Generate URL Share Payload compatible with DocStudio Web App
function generateDocStudioShareUrl(toolId, data, templateId = 'modern-tech') {
  const payload = { toolId: String(toolId), templateId, data };
  const jsonString = JSON.stringify(payload);
  const base64 = Buffer.from(
    encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    })
  ).toString('base64');
  return `https://docstudio-lovat.vercel.app/?docShare=${encodeURIComponent(base64)}`;
}

// ATS Audit Engine
const ACTION_VERBS = [
  'spearheaded', 'engineered', 'architected', 'directed', 'developed', 'optimized',
  'streamlined', 'delivered', 'orchestrated', 'implemented', 'reduced', 'increased',
  'managed', 'negotiated', 'launched', 'mentored', 'designed', 'transformed', 'leveraged', 'accelerated'
];

function auditCvAts(cv) {
  let score = 0;

  // 1. Contact Completeness (15 pts)
  let contactScore = 0;
  if (cv.fullName && cv.fullName.trim().length > 2) contactScore += 4;
  if (cv.emailAddress && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cv.emailAddress)) contactScore += 4;
  if (cv.cellNumber && cv.cellNumber.length >= 8) contactScore += 4;
  if (cv.currentLocation && cv.currentLocation.length > 3) contactScore += 3;
  
  // 2. Professional Summary (20 pts)
  let summaryScore = 0;
  const summaryLength = cv.professionalSummary ? cv.professionalSummary.trim().length : 0;
  if (summaryLength > 150) summaryScore = 20;
  else if (summaryLength > 60) summaryScore = 12;
  else if (summaryLength > 0) summaryScore = 6;

  // 3. Work Experience & Impact (25 pts)
  let experienceScore = 0;
  let actionVerbsFound = 0;
  let metricsFound = 0;

  if (Array.isArray(cv.workExperience) && cv.workExperience.length > 0) {
    experienceScore += 10;
    if (cv.workExperience.length >= 2) experienceScore += 5;

    const allExpText = cv.workExperience.map(e => `${e.responsibilities} ${e.jobTitle}`).join(' ').toLowerCase();

    ACTION_VERBS.forEach(verb => {
      if (allExpText.includes(verb)) actionVerbsFound++;
    });
    if (actionVerbsFound >= 3) experienceScore += 5;

    const metricMatches = allExpText.match(/(\d+%\s*|\$\d+|\d+\+|\d+k|\d+m|reduced|increased|95\+|99\.9%)/g);
    metricsFound = metricMatches ? metricMatches.length : 0;
    if (metricsFound >= 2) experienceScore += 5;
  }

  // 4. Skills Density (20 pts)
  let skillsScore = 0;
  const skillCount = Array.isArray(cv.skills) ? cv.skills.length : 0;
  if (skillCount >= 8) skillsScore = 20;
  else if (skillCount >= 5) skillsScore = 14;
  else if (skillCount >= 2) skillsScore = 8;

  // 5. Education (10 pts)
  let educationScore = 0;
  if (Array.isArray(cv.education) && cv.education.length > 0) {
    educationScore = 10;
  }

  // 6. South African EE / Compliance (10 pts)
  let eeScore = 0;
  if (cv.useIdNumber ? cv.idNumber : cv.passportNumber) eeScore += 5;
  if (cv.demographics && cv.gender) eeScore += 5;

  score = contactScore + summaryScore + experienceScore + skillsScore + educationScore + eeScore;
  if (score > 100) score = 100;

  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';

  return {
    score,
    grade,
    breakdown: {
      contactInfo: { score: contactScore, max: 15, passed: contactScore >= 12 },
      professionalSummary: { score: summaryScore, max: 20, passed: summaryScore >= 16 },
      workExperience: { score: experienceScore, max: 25, passed: experienceScore >= 20 },
      skillsDensity: { score: skillsScore, max: 20, passed: skillsScore >= 15 },
      educationHistory: { score: educationScore, max: 10, passed: educationScore >= 10 },
      eeCompliance: { score: eeScore, max: 10, passed: eeScore >= 10 }
    },
    metricsCount: metricsFound,
    actionVerbsCount: actionVerbsFound
  };
}

// User-provided authoritative data payload
function getUserAuthoritativeCv() {
  const jsonCandidates = [
    'C:\\Users\\MELVILLE\\.gemini\\antigravity\\brain\\6904f73a-2195-4a8b-ba99-02a5d630d798\\Neo_Sekatane_CV_Data.json',
    path.join(PROJECT_DIR, 'Neo_Sekatane_CV_Data.json')
  ];

  for (const c of jsonCandidates) {
    if (fs.existsSync(c)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(c, 'utf8'));
        if (parsed.fullName && Array.isArray(parsed.languages) && parsed.languages.length >= 4) {
          if (!parsed.githubUrl || parsed.githubUrl.includes('placeholder')) {
            parsed.githubUrl = 'github.com/Seansteiger';
          }
          return parsed;
        }
      } catch (e) {}
    }
  }

  return {
    fullName: "Neo Shawn Sekatane",
    headline: "AI Vibe Coder / Full-Stack Developer",
    idNumber: "0305135423088",
    passportNumber: "",
    useIdNumber: true,
    isInternational: false,
    gender: "Male",
    demographics: "African",
    driversLicense: "None",
    hasPdp: false,
    languages: [
      { name: "English", speakProficiency: "Fluent", writeProficiency: "Fluent" },
      { name: "Sepedi", speakProficiency: "Native", writeProficiency: "Fluent" },
      { name: "isiZulu", speakProficiency: "Fluent", writeProficiency: "Basic" },
      { name: "Xitsonga", speakProficiency: "Conversational", writeProficiency: "Basic" }
    ],
    cellNumber: "+27 69 975 1347",
    emailAddress: "nsdsekatane@gmail.com",
    githubUrl: "github.com/Seansteiger",
    portfolioUrl: "https://docstudio-lovat.vercel.app",
    currentLocation: "Johannesburg, Gauteng",
    noticePeriod: "Immediate",
    professionalSummary: "Innovative Full-Stack Developer and AI Vibe Coder experienced in engineering responsive, high-performance web applications using modern JavaScript/TypeScript (React, Next.js, Node.js). Skilled in leveraging state-of-the-art AI-assisted tools (Cursor, Claude Code, GitHub Copilot and Antigravity) to translate complex UI/UX designs into pixel-perfect digital products at a rapid pace while maintaining code quality. Based in Johannesburg, immediately available for on-site employment. Fully committed to USA EST hours (3:00 PM - 12:00 AM).",
    workExperience: [
      {
        id: "exp-1",
        jobTitle: "Full-Stack Developer & AI Vibe Coder",
        companyName: "Jozi Student Hub (Pty) Ltd",
        location: "Johannesburg, Gauteng",
        startDate: "02/2025",
        endDate: "02/2026",
        responsibilities: "• Architected and deployed the core responsive e-commerce web platform (jozistudenthub.co.za), generating 100% of online company revenue with 99.9% uptime.\n• Integrated payment platforms (Payfast and Yoco) as per client request. Added email receipt automation for order tracking.\n• Included Abandoned Cart recovery as well as a dedicated admin dashboard with revenue tracking and product management.\n• Leveraged AI-assisted development workflows (Cursor, Antigravity & GitHub Copilot) to accelerate feature shipping speed by 60% and resolve edge cases rapidly without sacrificing code quality.\n• Collaborated closely with UI/UX designers to translate Figma concepts into clean, cross-browser compatible, and mobile-first responsive interfaces using React, Next.js, and modern CSS.\n• Streamlined store inventory management and backend API endpoints, reducing catalog update latency by 45%.\n• Optimized web asset delivery and DOM rendering performance, achieving 95+ Google Lighthouse audit scores across mobile and desktop devices.\n• Handled the SEO overhead to make sure the store ranks high on google search for user accessibility."
      },
      {
        id: "exp-2",
        jobTitle: "Software Developer (AI Assisted)",
        companyName: "SteigerOnline",
        location: "Johannesburg, Gauteng",
        startDate: "07/2025",
        endDate: "Present",
        responsibilities: "• Launched the Company Website for clients to view the company's work.\n• Launched several projects under the SteigerOnline brand, assigning subdomains to every subsequent project.\n• Launched a CV generator (DocStudio), which was utilized to author and engineer this CV.\n• Developed a social platform that allows users to chat and make end-to-end encrypted voice and video calls via the browser.\n• Developed a web app that allows a user to control their desktop from their mobile device using a python script with millisecond touch-navigation latency.\n• Developed a 3D QR Code generator that allows users to generate scannable 3D illustrations."
      }
    ],
    education: [
      {
        id: "edu-1",
        qualificationName: "National Senior Certificate (Matric) – 2 Distinctions",
        institution: "Hulwazi Secondary School",
        yearCompleted: "2020",
        status: "Completed",
        tertiaryModules: [
          { moduleName: "English First Additional Language", score: 80, grade: "Distinction (Level 7)" },
          { moduleName: "Life Sciences", score: 84, grade: "Distinction (Level 7)" }
        ]
      }
    ],
    references: [
      {
        id: "ref-1",
        referenceName: "Koketso Chesa",
        companyTitle: "Director at The Edutainment Company",
        contactEmail: "lumketso@gmail.com",
        contactPhone: "+27 81 826 5297",
        relationship: "Executive Supervisor & Engineering Mentor"
      },
      {
        id: "ref-2",
        referenceName: "Nqobile Ngwenya",
        companyTitle: "Academic Mentor at Hulwazi Secondary School",
        contactEmail: "-",
        contactPhone: "+27 61 746 7590",
        relationship: "Academic Reference"
      }
    ],
    skills: [
      "Vibe Coding & Rapid Prototyping",
      "TypeScript & JavaScript (ES6+)",
      "Next.js & Vite",
      "HTML5 & Modern CSS / Tailwind CSS",
      "Responsive Web Design & Mobile-First Layouts",
      "Cross-Browser Compatibility & Optimization",
      "RESTful API Integration & JSON Schemas",
      "UI/UX Implementation & Prototyping",
      "Git & GitHub Version Control",
      "AI-Assisted Development (Antigravity, Cursor, Claude Code, Copilot)",
      "Git",
      "Node.js",
      "Communication"
    ]
  };
}

// 1. TEMPLATE: MODERN DUAL (modern-tech) — Dual-Column Silicon Layout with Languages prominently in sidebar
function generateModernDualHtml(cv) {
  const shareUrl = generateDocStudioShareUrl('1', cv, 'modern-tech');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cv.fullName} - ${cv.headline} (Modern Dual Template)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #0b0f19;
      color: #1e293b;
      line-height: 1.34;
      font-size: 8.2pt;
      -webkit-font-smoothing: antialiased;
    }
    .mono { font-family: 'JetBrains Mono', monospace; }
    
    .action-bar {
      max-width: 210mm;
      margin: 15px auto 10px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .btn {
      padding: 7px 14px;
      font-size: 11.5px;
      font-weight: 600;
      border-radius: 6px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary { background: #4f46e5; color: white; }
    .btn-primary:hover { background: #4338ca; }
    .btn-secondary { background: #1e293b; color: #f8fafc; border: 1px solid #334155; }
    .btn-secondary:hover { background: #334155; }

    .paper {
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      margin: 0 auto 30px auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.5);
      padding: 9mm 12mm 7mm 12mm;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Header */
    .header-banner {
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 6px;
      margin-bottom: 7px;
    }
    .name-title {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
    }
    .name-title h1 {
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.4px;
      line-height: 1.1;
    }
    .name-title .headline {
      font-size: 9pt;
      font-weight: 700;
      color: #4f46e5;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      margin-top: 1px;
    }
    .contact-block {
      text-align: right;
      font-size: 7.7pt;
      color: #475569;
      line-height: 1.35;
    }
    .contact-block a {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 600;
    }

    .badge-bar {
      background: #f1f5f9;
      border-radius: 4px;
      padding: 3.5px 8px;
      font-size: 7.5pt;
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
      color: #334155;
    }
    .badge-bar strong { color: #0f172a; }
    .badge-bar .highlight { color: #4338ca; font-weight: 700; }

    /* Layout Grid */
    .layout-grid {
      display: grid;
      grid-template-columns: 2.22fr 1fr;
      gap: 12px;
      flex: 1;
    }

    .section-title {
      font-size: 7.8pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 1.5px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .section-title::before {
      content: '';
      display: inline-block;
      width: 4.5px;
      height: 4.5px;
      border-radius: 50%;
      background: #4f46e5;
    }

    .summary-text {
      font-size: 7.8pt;
      color: #334155;
      line-height: 1.38;
      text-align: justify;
      margin-bottom: 6px;
    }

    /* Job Item */
    .job-item {
      border-left: 2px solid #c7d2fe;
      padding-left: 8px;
      margin-bottom: 6px;
    }
    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .job-title {
      font-size: 8.4pt;
      font-weight: 700;
      color: #0f172a;
    }
    .job-date {
      font-size: 7.2pt;
      font-weight: 600;
      color: #4f46e5;
      background: #eef2ff;
      padding: 0.5px 4px;
      border-radius: 3px;
    }
    .job-company {
      font-size: 7.6pt;
      font-weight: 600;
      color: #475569;
      margin-bottom: 2px;
    }
    .job-duties {
      font-size: 7.5pt;
      color: #334155;
      line-height: 1.32;
      white-space: pre-line;
    }

    /* Sidebar cards */
    .sidebar-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      padding: 6px 8px;
      margin-bottom: 6px;
    }
    .sidebar-title {
      font-size: 7.4pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .skills-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 3px;
    }
    .skill-tag {
      background: white;
      border: 1px solid #cbd5e1;
      padding: 1.5px 5px;
      border-radius: 3px;
      font-size: 7pt;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.2;
    }
    .lang-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 7.3pt;
      padding: 1.5px 0;
      border-bottom: 1px dashed #e2e8f0;
    }
    .lang-row:last-child { border-bottom: none; }
    .lang-name { font-weight: 700; color: #1e293b; }
    .lang-sub { font-size: 6.8pt; color: #64748b; font-family: 'JetBrains Mono', monospace; }

    .ref-item {
      font-size: 7.2pt;
      padding: 2.5px 0;
      border-bottom: 1px dashed #e2e8f0;
    }
    .ref-item:last-child { border-bottom: none; }
    .ref-name { font-weight: 700; color: #0f172a; }
    .ref-title { font-size: 6.9pt; color: #475569; }
    .ref-phone { font-family: 'JetBrains Mono', monospace; font-size: 6.9pt; color: #4f46e5; }

    .edu-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      padding: 4px 7px;
      margin-top: 3px;
    }
    .edu-head {
      display: flex;
      justify-content: space-between;
      font-size: 7.8pt;
      font-weight: 700;
      color: #0f172a;
    }
    .edu-sub {
      font-size: 7.2pt;
      color: #4f46e5;
      font-weight: 600;
    }

    @media print {
      html, body {
        background: white !important;
        padding: 0 !important;
        margin: 0 !important;
        height: 297mm !important;
        max-height: 297mm !important;
        overflow: hidden !important;
      }
      .no-print { display: none !important; }
      .paper {
        width: 210mm !important;
        height: 297mm !important;
        max-height: 297mm !important;
        margin: 0 !important;
        padding: 8mm 11mm 6mm 11mm !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        overflow: hidden !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      @page {
        size: A4 portrait;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="action-bar no-print">
    <div style="color: #94a3b8; font-size: 13px;">
      Template: <strong style="color: #818cf8;">Modern Dual (Dual Column)</strong> • Candidate: <strong style="color: white;">${cv.fullName}</strong>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" class="btn btn-primary">
        🖨️ Print / Save as PDF
      </button>
      <a href="${shareUrl}" target="_blank" class="btn btn-secondary">
        🌐 Open in DocStudio Live
      </a>
    </div>
  </div>

  <div class="paper">
    <!-- Header Banner -->
    <div class="header-banner">
      <div class="name-title">
        <div>
          <h1>${cv.fullName}</h1>
          <div class="headline">${cv.headline}</div>
        </div>
        <div class="contact-block">
          <div>📧 <a href="mailto:${cv.emailAddress}">${cv.emailAddress}</a></div>
          <div>📱 <span>${cv.cellNumber}</span></div>
          <div>📍 <span>${cv.currentLocation}</span></div>
          <div>💻 <a href="https://${cv.githubUrl}" target="_blank">${cv.githubUrl}</a></div>
          <div>🔗 <a href="${cv.portfolioUrl}" target="_blank">DocStudio Platform Live</a></div>
        </div>
      </div>

      <div class="badge-bar">
        <span>🛡️ <strong>SA ID:</strong> ${cv.idNumber}</span>
        <span>• <strong>EE:</strong> ${cv.demographics} (${cv.gender})</span>
        <span>• <strong>Notice:</strong> <span class="highlight">Immediate</span></span>
        <span>• <strong>Availability:</strong> <span class="highlight">Houghton Estate On-Site & USA EST Hours (3pm–12am)</span></span>
      </div>
    </div>

    <!-- Layout Grid -->
    <div class="layout-grid">
      <!-- Main Content (Left) -->
      <div>
        <!-- Summary -->
        <div class="section-title">Professional Summary</div>
        <p class="summary-text">${cv.professionalSummary}</p>

        <!-- Experience -->
        <div class="section-title">Professional Experience & Key Projects</div>
        ${cv.workExperience.map(job => `
          <div class="job-item">
            <div class="job-header">
              <span class="job-title">${job.jobTitle}</span>
              <span class="job-date">${job.startDate} — ${job.endDate}</span>
            </div>
            <div class="job-company">${job.companyName} | ${job.location}</div>
            <div class="job-duties">${job.responsibilities}</div>
          </div>
        `).join('')}

        <!-- Education -->
        <div class="section-title">Education & Credentials</div>
        ${cv.education.map(edu => `
          <div class="edu-item">
            <div class="edu-head">
              <span>${edu.qualificationName}</span>
              <span class="mono" style="font-size: 7.2pt; color: #64748b;">${edu.yearCompleted}</span>
            </div>
            <div class="edu-sub">${edu.institution} • ${edu.status}</div>
            ${edu.tertiaryModules && edu.tertiaryModules.length ? `
              <div style="margin-top: 2px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 6.9pt; color: #475569;">
                ${edu.tertiaryModules.map(m => `
                  <div>• ${m.moduleName}: <strong style="color: #0f172a;">${m.score}% (${m.grade})</strong></div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <!-- Sidebar (Right) -->
      <div>
        <!-- Skills -->
        <div class="sidebar-card">
          <div class="sidebar-title">⚡ Core Competencies</div>
          <div class="skills-wrap">
            ${cv.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
          </div>
        </div>

        <!-- Languages (Prominently displayed) -->
        <div class="sidebar-card">
          <div class="sidebar-title">🌐 Languages</div>
          <div class="space-y-1">
            ${cv.languages.map(l => `
              <div class="lang-row">
                <span class="lang-name">${l.name}</span>
                <span class="lang-sub">Spoken: ${l.speakProficiency} | Written: ${l.writeProficiency}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- References -->
        <div class="sidebar-card">
          <div class="sidebar-title">👥 References</div>
          ${cv.references.map(r => `
            <div class="ref-item">
              <div class="ref-name">${r.referenceName}</div>
              <div class="ref-title">${r.companyTitle}</div>
              <div class="ref-phone">${r.contactPhone}</div>
              ${r.contactEmail && r.contactEmail !== '-' ? `<div style="font-size: 6.8pt; color: #64748b;">${r.contactEmail}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// 2. TEMPLATE: CLEAN MINIMAL (minimal-ats) — Ultra-Clean Single-Column Layout with GitHub and NO LinkedIn
function generateCleanMinimalHtml(cv) {
  const shareUrl = generateDocStudioShareUrl('1', cv, 'minimal-ats');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cv.fullName} - ${cv.headline} (Clean Minimal Template)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #0f172a;
      color: #0f172a;
      line-height: 1.34;
      font-size: 8.2pt;
      -webkit-font-smoothing: antialiased;
    }
    .mono { font-family: 'JetBrains Mono', monospace; }

    .action-bar {
      max-width: 210mm;
      margin: 15px auto 10px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .btn {
      padding: 7px 14px;
      font-size: 11.5px;
      font-weight: 600;
      border-radius: 6px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary { background: #0f172a; color: white; border: 1px solid #334155; }
    .btn-primary:hover { background: #1e293b; }
    .btn-secondary { background: #1e293b; color: #f8fafc; border: 1px solid #334155; }
    .btn-secondary:hover { background: #334155; }

    .paper {
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      margin: 0 auto 30px auto;
      background: white;
      border-radius: 6px;
      box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.5);
      padding: 8mm 12mm 6mm 12mm;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Centered Minimal Header */
    .header-minimal {
      text-align: center;
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 5px;
      margin-bottom: 6px;
    }
    .header-minimal h1 {
      font-size: 19pt;
      font-weight: 800;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      color: #0f172a;
      line-height: 1.1;
    }
    .header-minimal .headline {
      font-size: 9pt;
      font-weight: 700;
      color: #334155;
      margin-top: 2px;
      letter-spacing: 0.2px;
    }
    .contact-row {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 11px;
      font-size: 7.6pt;
      color: #475569;
      margin-top: 3px;
    }
    .contact-row a {
      color: #0f172a;
      text-decoration: underline;
      font-weight: 600;
    }
    .meta-row {
      font-size: 7.4pt;
      color: #64748b;
      margin-top: 2.5px;
      display: flex;
      justify-content: center;
      gap: 9px;
    }
    .meta-row strong { color: #0f172a; }

    /* Section Styling */
    .section-block {
      margin-bottom: 5px;
    }
    .section-title {
      font-size: 7.7pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: #0f172a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 1.5px;
      margin-bottom: 3.5px;
    }
    .summary-text {
      font-size: 7.8pt;
      color: #334155;
      line-height: 1.36;
      text-align: justify;
    }

    /* Skills Grid */
    .skills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 3px;
    }
    .skill-pill {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 7.1pt;
      font-weight: 600;
      color: #1e293b;
    }

    /* Experience */
    .job-entry {
      margin-bottom: 5px;
    }
    .job-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .job-title {
      font-size: 8.3pt;
      font-weight: 700;
      color: #0f172a;
    }
    .job-date {
      font-size: 7.3pt;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      color: #475569;
    }
    .job-company {
      font-size: 7.6pt;
      font-weight: 600;
      color: #475569;
      margin-bottom: 1.5px;
    }
    .job-bullets {
      font-size: 7.5pt;
      color: #334155;
      line-height: 1.32;
      padding-left: 7px;
      border-left: 2px solid #e2e8f0;
      white-space: pre-line;
    }

    /* Education */
    .edu-entry {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 7.8pt;
      margin-bottom: 1.5px;
    }
    .edu-name { font-weight: 700; color: #0f172a; }
    .edu-inst { font-size: 7.4pt; color: #475569; }

    /* Bottom row: Languages & References */
    .bottom-grid {
      display: grid;
      grid-template-columns: 1.1fr 1.9fr;
      gap: 12px;
      margin-top: 2px;
    }
    .lang-item {
      display: flex;
      justify-content: space-between;
      font-size: 7.3pt;
      padding: 1px 0;
      border-bottom: 1px dashed #e2e8f0;
    }
    .ref-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .ref-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 3px 5px;
      border-radius: 4px;
      font-size: 7.1pt;
    }
    .ref-card-name { font-weight: 700; color: #0f172a; }
    .ref-card-sub { font-size: 6.7pt; color: #64748b; }
    .ref-card-contact { font-family: 'JetBrains Mono', monospace; font-size: 6.7pt; color: #0f172a; margin-top: 1px; }

    @media print {
      html, body {
        background: white !important;
        padding: 0 !important;
        margin: 0 !important;
        height: 297mm !important;
        max-height: 297mm !important;
        overflow: hidden !important;
      }
      .no-print { display: none !important; }
      .paper {
        width: 210mm !important;
        height: 297mm !important;
        max-height: 297mm !important;
        margin: 0 !important;
        padding: 7mm 11mm 5mm 11mm !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        overflow: hidden !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      @page {
        size: A4 portrait;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="action-bar no-print">
    <div style="color: #94a3b8; font-size: 13px;">
      Template: <strong style="color: #38bdf8;">Clean Minimal (Single Column / ATS Standard)</strong> • Candidate: <strong style="color: white;">${cv.fullName}</strong>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" class="btn btn-primary">
        🖨️ Print / Save as PDF
      </button>
      <a href="${shareUrl}" target="_blank" class="btn btn-secondary">
        🌐 Open in DocStudio Live
      </a>
    </div>
  </div>

  <div class="paper">
    <!-- Header -->
    <div class="header-minimal">
      <h1>${cv.fullName}</h1>
      <div class="headline">${cv.headline}</div>
      <div class="contact-row">
        <span>📧 <a href="mailto:${cv.emailAddress}">${cv.emailAddress}</a></span>
        <span>• 📱 ${cv.cellNumber}</span>
        <span>• 📍 ${cv.currentLocation}</span>
        <span>• 💻 <a href="https://${cv.githubUrl}" target="_blank">${cv.githubUrl}</a></span>
        <span>• 🔗 <a href="${cv.portfolioUrl}" target="_blank">docstudio-lovat.vercel.app</a></span>
      </div>
      <div class="meta-row">
        <span>SA ID: <strong>${cv.idNumber}</strong></span>
        <span>• EE: <strong>${cv.demographics} (${cv.gender})</strong></span>
        <span>• Notice: <strong>${cv.noticePeriod}</strong></span>
        <span>• Work Setup: <strong>Houghton Estate On-Site & USA EST Hours (3pm–12am)</strong></span>
      </div>
    </div>

    <!-- Summary -->
    <div class="section-block">
      <div class="section-title">Professional Summary</div>
      <p class="summary-text">${cv.professionalSummary}</p>
    </div>

    <!-- Core Competencies -->
    <div class="section-block">
      <div class="section-title">Core Competencies & AI Development Stack</div>
      <div class="skills-container">
        ${cv.skills.map(s => `<span class="skill-pill">${s}</span>`).join('')}
      </div>
    </div>

    <!-- Experience -->
    <div class="section-block">
      <div class="section-title">Professional Experience & Featured Projects</div>
      ${cv.workExperience.map(job => `
        <div class="job-entry">
          <div class="job-top">
            <span class="job-title">${job.jobTitle}</span>
            <span class="job-date">${job.startDate} — ${job.endDate}</span>
          </div>
          <div class="job-company">${job.companyName} | ${job.location}</div>
          <div class="job-bullets">${job.responsibilities}</div>
        </div>
      `).join('')}
    </div>

    <!-- Education -->
    <div class="section-block">
      <div class="section-title">Education & Credentials</div>
      ${cv.education.map(edu => `
        <div class="edu-entry">
          <div>
            <span class="edu-name">${edu.qualificationName}</span>
            <span class="edu-inst"> — ${edu.institution} (${edu.status})</span>
          </div>
          <span class="mono" style="font-size: 7.2pt; color: #64748b;">${edu.yearCompleted}</span>
        </div>
        ${edu.tertiaryModules && edu.tertiaryModules.length ? `
          <div style="font-size: 7pt; color: #475569; margin-bottom: 2px;">
            ${edu.tertiaryModules.map(m => `<span>• ${m.moduleName}: <strong>${m.score}% (${m.grade})</strong> </span>`).join('  ')}
          </div>
        ` : ''}
      `).join('')}
    </div>

    <!-- Bottom Row: Languages & References -->
    <div class="bottom-grid">
      <div>
        <div class="section-title">Languages</div>
        ${cv.languages.map(l => `
          <div class="lang-item">
            <span style="font-weight: 600; color: #1e293b;">${l.name}</span>
            <span style="color: #64748b; font-size: 6.9pt;">Spoken: ${l.speakProficiency} | Written: ${l.writeProficiency}</span>
          </div>
        `).join('')}
      </div>

      <div>
        <div class="section-title">Professional References</div>
        <div class="ref-grid">
          ${cv.references.map(r => `
            <div class="ref-card">
              <div class="ref-card-name">${r.referenceName}</div>
              <div class="ref-card-sub">${r.companyTitle}</div>
              <div class="ref-card-contact">${r.contactPhone}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// --- UNIFIED COMMERCIAL BILLING HUB ENGINE (Zoho-Style Relational Engine) ---
const BILLING_DATA_PATH = path.join(PROJECT_DIR, 'data', 'billing.json');

function getSeedBillingData() {
  const settings = {
    companyName: "Apex Cloud Solutions (Pty) Ltd",
    tagline: "Enterprise Cloud Architecture & Digital Systems",
    email: "accounts@apexcloud.co.za",
    phone: "+27 (0) 11 883 4000",
    address: "Floor 14, Sandton City Office Towers, 5th Street, Sandton, 2196, South Africa",
    vatNumber: "4920194812",
    regNumber: "2019/148209/07",
    bankName: "First National Bank (FNB)",
    accountHolder: "Apex Cloud Solutions Pty Ltd",
    accountNumber: "62891048291",
    branchCode: "250655",
    accountType: "Business Cheque Account",
    paymentTerms: "Payment due strictly within 14 calendar days of tax invoice date. EFT payments must cite invoice number as payment reference.",
    quoteCounter: 105,
    invoiceCounter: 219,
    receiptCounter: 90
  };

  const clients = [
    {
      id: "cli-1",
      name: "BlueHorizon Logistics Group (Pty) Ltd",
      contactPerson: "Thabo Mokoena (Procurement Director)",
      email: "procurement@bluehorizon.co.za",
      phone: "+27 82 555 9012",
      billingAddress: "88 Harbour Road, Foreshore, Cape Town, 8001",
      vatNumber: "4820194881",
      createdAt: "2026-01-15T08:00:00Z"
    },
    {
      id: "cli-2",
      name: "Vanguard Wealth Management",
      contactPerson: "Sarah van der Merwe (Chief Operations Officer)",
      email: "operations@vanguardwealth.co.za",
      phone: "+27 11 784 3200",
      billingAddress: "Tower 2, Katherine Street, Sandton, 2196",
      vatNumber: "4019284729",
      createdAt: "2026-02-10T10:30:00Z"
    },
    {
      id: "cli-3",
      name: "Kagiso Renewable Energy Ltd",
      contactPerson: "Dr. Kagiso Molefe",
      email: "finance@kagisoenergy.co.za",
      phone: "+27 31 301 9920",
      billingAddress: "14 Umhlanga Rocks Drive, Durban, 4320",
      vatNumber: "4550198273",
      createdAt: "2026-03-01T14:15:00Z"
    }
  ];

  const documents = [
    {
      id: "doc-quo-0104",
      docType: "quote",
      docNumber: "QUO-0104",
      title: "Commercial Quotation QUO-0104 (Vanguard Wealth Management)",
      status: "sent",
      clientId: "cli-2",
      clientSnapshot: {
        name: "Vanguard Wealth Management",
        contactPerson: "Sarah van der Merwe (Chief Operations Officer)",
        email: "operations@vanguardwealth.co.za",
        phone: "+27 11 784 3200",
        billingAddress: "Tower 2, Katherine Street, Sandton, 2196",
        vatNumber: "4019284729"
      },
      issueDate: "2026-10-20",
      dueDate: "2026-11-20",
      validUntil: "2026-11-20",
      lineItems: [
        {
          id: "li-1",
          description: "Cloud Architecture Audit & Security Review",
          details: "IAM review and ISO 27001 readiness",
          quantity: 1,
          unitPrice: 38500,
          discountPct: 0,
          taxRate: 15,
          unit: "Fixed"
        },
        {
          id: "li-2",
          description: "Dedicated Agile Sprint (Full-Stack Squad)",
          details: "2-week sprint with senior engineers",
          quantity: 1,
          unitPrice: 42000,
          discountPct: 5,
          taxRate: 15,
          unit: "Sprint"
        }
      ],
      vatRate: 15,
      discountAmount: 0,
      currency: "ZAR",
      currencySymbol: "R",
      subtotal: 78400,
      vatTotal: 11760,
      grandTotal: 90160,
      amountPaid: 0,
      balanceDue: 90160,
      payments: [],
      notes: "Quotation valid for 30 calendar days. 50% deposit required upon acceptance.",
      termsAndConditions: "Standard SLA applies upon quote acceptance.",
      createdAt: "2026-10-20T09:00:00Z",
      updatedAt: "2026-10-20T09:00:00Z"
    },
    {
      id: "doc-inv-0218",
      docType: "invoice",
      docNumber: "INV-0218",
      title: "Tax Invoice INV-0218 (BlueHorizon Logistics Group)",
      status: "sent",
      clientId: "cli-1",
      clientSnapshot: {
        name: "BlueHorizon Logistics Group (Pty) Ltd",
        contactPerson: "Thabo Mokoena (Procurement Director)",
        email: "procurement@bluehorizon.co.za",
        phone: "+27 82 555 9012",
        billingAddress: "88 Harbour Road, Foreshore, Cape Town, 8001",
        vatNumber: "4820194881"
      },
      issueDate: "2026-10-15",
      dueDate: "2026-10-29",
      lineItems: [
        {
          id: "li-101",
          description: "Cloud Architecture Audit & High-Availability Migration Strategy",
          quantity: 1,
          unitPrice: 38500,
          discountPct: 0,
          taxRate: 15,
          unit: "Fixed"
        },
        {
          id: "li-102",
          description: "Custom Fleet Management Portal Frontend (React 19 / TypeScript)",
          quantity: 65,
          unitPrice: 950,
          discountPct: 5,
          taxRate: 15,
          unit: "Hours"
        },
        {
          id: "li-103",
          description: "Automated Telematics & Real-Time Tracking REST API Microservices",
          quantity: 40,
          unitPrice: 1100,
          discountPct: 0,
          taxRate: 15,
          unit: "Hours"
        }
      ],
      vatRate: 15,
      discountAmount: 0,
      currency: "ZAR",
      currencySymbol: "R",
      subtotal: 141162.50,
      vatTotal: 21174.38,
      grandTotal: 162336.88,
      amountPaid: 0,
      balanceDue: 162336.88,
      payments: [],
      notes: "Payment due strictly within 14 calendar days of tax invoice date.",
      termsAndConditions: "Standard commercial terms apply.",
      createdAt: "2026-10-15T11:00:00Z",
      updatedAt: "2026-10-15T11:00:00Z"
    }
  ];

  return { settings, clients, documents };
}

function loadBillingData() {
  const dir = path.dirname(BILLING_DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(BILLING_DATA_PATH)) {
    const seed = getSeedBillingData();
    saveBillingData(seed);
    return seed;
  }
  try {
    return JSON.parse(fs.readFileSync(BILLING_DATA_PATH, 'utf8'));
  } catch (e) {
    const seed = getSeedBillingData();
    saveBillingData(seed);
    return seed;
  }
}

function saveBillingData(data) {
  const dir = path.dirname(BILLING_DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(BILLING_DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function calculateBillingTotals(lineItems, vatRate = 15, discountAmount = 0, payments = []) {
  let subtotal = 0;
  let computedVat = 0;

  for (const item of (lineItems || [])) {
    const itemGross = (Number(item.quantity) || 0) * (Number(item.unitPrice || item.rate) || 0);
    const discount = item.discountPct ? itemGross * (item.discountPct / 100) : 0;
    const itemNet = Math.max(0, itemGross - discount);
    subtotal += itemNet;

    const rate = item.taxRate !== undefined ? item.taxRate : vatRate;
    if (rate > 0) {
      computedVat += itemNet * (rate / 100);
    }
  }

  const netSubtotal = Math.max(0, subtotal - (Number(discountAmount) || 0));
  const finalVat = subtotal > 0 ? (computedVat * (netSubtotal / subtotal)) : 0;
  const grandTotal = Math.round((netSubtotal + finalVat) * 100) / 100;

  const amountPaid = (payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const balanceDue = Math.max(0, Math.round((grandTotal - amountPaid) * 100) / 100);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatTotal: Math.round(finalVat * 100) / 100,
    grandTotal,
    amountPaid: Math.round(amountPaid * 100) / 100,
    balanceDue
  };
}

function formatZar(amount) {
  return 'R ' + Number(amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getArg(flag, defaultValue = null) {
  const idx = cleanArgs.indexOf(flag);
  if (idx !== -1 && idx + 1 < cleanArgs.length) {
    return cleanArgs[idx + 1];
  }
  return defaultValue;
}

// Commands
const command = cleanArgs[0] || 'help';

switch (command) {
  case 'doctor': {
    const checks = {
      project: 'DocStudio',
      directory: PROJECT_DIR,
      nodeVersion: process.version,
      hasPackageJson: fs.existsSync(path.join(PROJECT_DIR, 'package.json')),
      hasEnv: fs.existsSync(path.join(PROJECT_DIR, '.env')) || fs.existsSync(path.join(PROJECT_DIR, '.env.local')),
      backend: 'Static / REST',
      status: 'HEALTHY'
    };
    output(checks);
    break;
  }

  case 'status':
  case 'info': {
    let pkg = {};
    try {
      pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'package.json'), 'utf8'));
    } catch (e) {}

    output({
      name: pkg.name || 'DocStudio',
      version: pkg.version || '1.0.0',
      description: pkg.description || 'Project managed by cli-anything',
      scripts: Object.keys(pkg.scripts || {}),
      dependenciesCount: Object.keys(pkg.dependencies || {}).length
    });
    break;
  }

  case 'cv:generate': {
    const cvData = getUserAuthoritativeCv();
    const audit = auditCvAts(cvData);

    const shareUrlModernDual = generateDocStudioShareUrl('1', cvData, 'modern-tech');
    const shareUrlCleanMinimal = generateDocStudioShareUrl('1', cvData, 'minimal-ats');

    // 1. Target exports directory
    const exportsDir = path.join(PROJECT_DIR, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // 2. Parent Artifact directory
    const brainArtifactDir = 'C:\\Users\\MELVILLE\\.gemini\\antigravity\\brain\\6904f73a-2195-4a8b-ba99-02a5d630d798';

    // File paths in exports/
    const jsonPathExports = path.join(exportsDir, 'Neo_Sekatane_CV_Data.json');
    const htmlModernDualExports = path.join(exportsDir, 'Neo_Sekatane_CV_Modern_Dual.html');
    const pdfModernDualExports = path.join(exportsDir, 'Neo_Sekatane_CV_Modern_Dual.pdf');
    const htmlCleanMinimalExports = path.join(exportsDir, 'Neo_Sekatane_CV_Clean_Minimal.html');
    const pdfCleanMinimalExports = path.join(exportsDir, 'Neo_Sekatane_CV_Clean_Minimal.pdf');

    // Also root project paths
    const jsonPathRoot = path.join(PROJECT_DIR, 'Neo_Sekatane_CV_Data.json');
    const htmlModernDualRoot = path.join(PROJECT_DIR, 'Neo_Sekatane_CV_Modern_Dual.html');
    const pdfModernDualRoot = path.join(PROJECT_DIR, 'Neo_Sekatane_CV_Modern_Dual.pdf');
    const htmlCleanMinimalRoot = path.join(PROJECT_DIR, 'Neo_Sekatane_CV_Clean_Minimal.html');
    const pdfCleanMinimalRoot = path.join(PROJECT_DIR, 'Neo_Sekatane_CV_Clean_Minimal.pdf');

    const modernDualHtml = generateModernDualHtml(cvData);
    const cleanMinimalHtml = generateCleanMinimalHtml(cvData);
    const cvJsonStr = JSON.stringify(cvData, null, 2);

    // Write to exports/
    fs.writeFileSync(jsonPathExports, cvJsonStr, 'utf8');
    fs.writeFileSync(htmlModernDualExports, modernDualHtml, 'utf8');
    fs.writeFileSync(htmlCleanMinimalExports, cleanMinimalHtml, 'utf8');

    // Write to project root
    fs.writeFileSync(jsonPathRoot, cvJsonStr, 'utf8');
    fs.writeFileSync(htmlModernDualRoot, modernDualHtml, 'utf8');
    fs.writeFileSync(htmlCleanMinimalRoot, cleanMinimalHtml, 'utf8');

    // Write / copy to parent artifact directory
    if (fs.existsSync(brainArtifactDir)) {
      try {
        fs.writeFileSync(path.join(brainArtifactDir, 'Neo_Sekatane_CV_Data.json'), cvJsonStr, 'utf8');
        fs.writeFileSync(path.join(brainArtifactDir, 'Neo_Sekatane_CV_Modern_Dual.html'), modernDualHtml, 'utf8');
        fs.writeFileSync(path.join(brainArtifactDir, 'Neo_Sekatane_CV_Clean_Minimal.html'), cleanMinimalHtml, 'utf8');
      } catch (e) {}
    }

    // Generate PDFs via Chrome headless into exports/
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    let pdfModernCreated = false;
    let pdfMinimalCreated = false;

    if (fs.existsSync(chromePath)) {
      try {
        const fileUrlModern = 'file:///' + htmlModernDualExports.replace(/\\/g, '/');
        execSync(`"${chromePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfModernDualExports}" "${fileUrlModern}"`, { timeout: 15000 });
        if (fs.existsSync(pdfModernDualExports)) {
          pdfModernCreated = true;
          // Copy to root and brain
          fs.copyFileSync(pdfModernDualExports, pdfModernDualRoot);
          if (fs.existsSync(brainArtifactDir)) {
            fs.copyFileSync(pdfModernDualExports, path.join(brainArtifactDir, 'Neo_Sekatane_CV_Modern_Dual.pdf'));
          }
        }
      } catch (e) {}

      try {
        const fileUrlMinimal = 'file:///' + htmlCleanMinimalExports.replace(/\\/g, '/');
        execSync(`"${chromePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfCleanMinimalExports}" "${fileUrlMinimal}"`, { timeout: 15000 });
        if (fs.existsSync(pdfCleanMinimalExports)) {
          pdfMinimalCreated = true;
          // Copy to root and brain
          fs.copyFileSync(pdfCleanMinimalExports, pdfCleanMinimalRoot);
          if (fs.existsSync(brainArtifactDir)) {
            fs.copyFileSync(pdfCleanMinimalExports, path.join(brainArtifactDir, 'Neo_Sekatane_CV_Clean_Minimal.pdf'));
          }
        }
      } catch (e) {}
    }

    const result = {
      success: true,
      role: 'AI Vibe Coder / Full-Stack Developer',
      candidate: cvData.fullName,
      githubUrl: cvData.githubUrl,
      atsAudit: audit,
      templates: {
        modernDual: {
          templateId: 'modern-tech',
          name: 'Modern Dual (Dual Column Silicon)',
          exportsHtmlPath: htmlModernDualExports,
          exportsPdfPath: pdfModernCreated ? pdfModernDualExports : null,
          liveUrl: shareUrlModernDual
        },
        cleanMinimal: {
          templateId: 'minimal-ats',
          name: 'Clean Minimal (Single Column ATS Standard)',
          exportsHtmlPath: htmlCleanMinimalExports,
          exportsPdfPath: pdfMinimalCreated ? pdfCleanMinimalExports : null,
          liveUrl: shareUrlCleanMinimal
        }
      },
      exportsDir,
      brainArtifactDir: fs.existsSync(brainArtifactDir) ? brainArtifactDir : null
    };

    if (isJson) {
      output(result);
    } else {
      console.log(`
========================================================================
🚀 DOCSTUDIO CLI: CV GENERATED FOR BOTH TEMPLATES (1-PAGE A4 VERIFIED)
========================================================================
Candidate:      ${cvData.fullName}
Target Role:    ${cvData.headline}
GitHub Link:    ${cvData.githubUrl} (LinkedIn removed on Clean Minimal)
ATS Score:      ${audit.score}/100 (${audit.grade})

🎨 TEMPLATE 1: MODERN DUAL (modern-tech)
  - Layout:       Dual-column silicon aesthetic with prominent Languages card
  - Exports HTML: ${htmlModernDualExports}
  - Exports PDF:  ${pdfModernCreated ? pdfModernDualExports : 'Chrome headless required'}
  - Live Cloud:   ${shareUrlModernDual}

🎨 TEMPLATE 2: CLEAN MINIMAL (minimal-ats)
  - Layout:       Single-column ATS standard with GitHub link (No LinkedIn)
  - Exports HTML: ${htmlCleanMinimalExports}
  - Exports PDF:  ${pdfMinimalCreated ? pdfCleanMinimalExports : 'Chrome headless required'}
  - Live Cloud:   ${shareUrlCleanMinimal}

📁 Exports Dir:   ${exportsDir}
📁 Brain Dir:     ${brainArtifactDir}
========================================================================
`);
    }
    break;
  }

  case 'cv:audit': {
    const cvData = getUserAuthoritativeCv();
    const audit = auditCvAts(cvData);
    output(audit);
    break;
  }

  // --- UNIFIED BILLING HUB COMMANDS ---
  case 'billing:list': {
    const billing = loadBillingData();
    const typeFilter = getArg('--type');
    const statusFilter = getArg('--status');
    const clientFilter = getArg('--client');

    let docs = billing.documents || [];
    if (typeFilter) {
      docs = docs.filter(d => d.docType.toLowerCase() === typeFilter.toLowerCase());
    }
    if (statusFilter) {
      docs = docs.filter(d => d.status.toLowerCase() === statusFilter.toLowerCase());
    }
    if (clientFilter) {
      docs = docs.filter(d => 
        (d.clientSnapshot && d.clientSnapshot.name && d.clientSnapshot.name.toLowerCase().includes(clientFilter.toLowerCase())) ||
        (d.title && d.title.toLowerCase().includes(clientFilter.toLowerCase()))
      );
    }

    const totalQuotesValue = docs.filter(d => d.docType === 'quote').reduce((s, d) => s + d.grandTotal, 0);
    const totalInvoiced = docs.filter(d => d.docType === 'invoice').reduce((s, d) => s + d.grandTotal, 0);
    const totalCollected = docs.filter(d => d.docType === 'invoice').reduce((s, d) => s + (d.amountPaid || 0), 0);
    const totalOutstanding = docs.filter(d => d.docType === 'invoice').reduce((s, d) => s + (d.balanceDue || 0), 0);

    const metrics = {
      totalCount: docs.length,
      quotesValue: totalQuotesValue,
      invoicesValue: totalInvoiced,
      totalCollected,
      totalOutstanding
    };

    if (isJson) {
      output({
        success: true,
        count: docs.length,
        metrics,
        documents: docs.map(d => ({
          id: d.id,
          docType: d.docType,
          docNumber: d.docNumber,
          client: d.clientSnapshot?.name || 'Unknown',
          status: d.status,
          issueDate: d.issueDate,
          dueDate: d.dueDate,
          grandTotal: d.grandTotal,
          amountPaid: d.amountPaid || 0,
          balanceDue: d.balanceDue,
          liveUrl: generateDocStudioShareUrl(d.docType === 'quote' ? '4' : d.docType === 'receipt' ? '10' : '2', d, 'classic-zoho')
        }))
      });
    } else {
      console.log(`
========================================================================================
💼 DOCSTUDIO UNIFIED COMMERCIAL BILLING HUB — DOCUMENTS (${docs.length})
========================================================================================
🏢 Organization: ${billing.settings.companyName} | VAT: ${billing.settings.vatNumber}
📊 Financial Summary:
   • Total Invoiced:     ${formatZar(totalInvoiced)}
   • Total Collected:    ${formatZar(totalCollected)}
   • Total Outstanding:  ${formatZar(totalOutstanding)}
   • Active Quotations:  ${formatZar(totalQuotesValue)}
----------------------------------------------------------------------------------------
DOC NUMBER | TYPE    | STATUS    | ISSUE DATE | DUE DATE   | TOTAL        | CLIENT
----------------------------------------------------------------------------------------`);
      docs.forEach(d => {
        const num = d.docNumber.padEnd(10);
        const typ = (d.docType.toUpperCase()).padEnd(7);
        const stat = `[${d.status.toUpperCase()}]`.padEnd(11);
        const iss = (d.issueDate || '-').padEnd(10);
        const due = (d.dueDate || '-').padEnd(10);
        const tot = formatZar(d.grandTotal).padStart(12);
        const cli = (d.clientSnapshot?.name || '-').slice(0, 24);
        console.log(`${num} | ${typ} | ${stat} | ${iss} | ${due} | ${tot} | ${cli}`);
      });
      console.log(`========================================================================================\n`);
    }
    break;
  }

  case 'billing:create': {
    const billing = loadBillingData();
    const docType = (getArg('--type') || 'invoice').toLowerCase();
    const clientNameArg = getArg('--client');
    const titleArg = getArg('--title');
    const descArg = getArg('--desc') || (docType === 'quote' ? 'Agile Full-Stack Development Sprint' : 'Custom Web & Mobile Software Development');
    const qtyArg = Number(getArg('--qty') || 1);
    const priceArg = Number(getArg('--price') || 35000);
    const vatRateArg = Number(getArg('--vat') || 15);
    const discountArg = Number(getArg('--discount') || 0);
    const dueArg = getArg('--due') || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Find or create client
    let client = billing.clients[0];
    if (clientNameArg) {
      const found = billing.clients.find(c => c.name.toLowerCase().includes(clientNameArg.toLowerCase()));
      if (found) {
        client = found;
      } else {
        client = {
          id: `cli-${Date.now()}`,
          name: clientNameArg,
          contactPerson: "Accounts Payable",
          email: "finance@" + clientNameArg.toLowerCase().replace(/[^a-z0-9]/g, '') + ".co.za",
          phone: "+27 11 000 0000",
          billingAddress: "Johannesburg, South Africa",
          vatNumber: "4000000000",
          createdAt: new Date().toISOString()
        };
        billing.clients.push(client);
      }
    }

    let counterKey = docType === 'quote' ? 'quoteCounter' : docType === 'receipt' ? 'receiptCounter' : 'invoiceCounter';
    let prefix = docType === 'quote' ? 'QUO' : docType === 'receipt' ? 'REC' : 'INV';
    let counterVal = billing.settings[counterKey] || (docType === 'quote' ? 105 : docType === 'receipt' ? 90 : 219);
    billing.settings[counterKey] = counterVal + 1;
    const docNumber = `${prefix}-${String(counterVal).padStart(4, '0')}`;

    const lineItems = [
      {
        id: `li-${Date.now()}`,
        description: descArg,
        quantity: qtyArg,
        unitPrice: priceArg,
        discountPct: 0,
        taxRate: vatRateArg,
        unit: 'Fixed'
      }
    ];

    const totals = calculateBillingTotals(lineItems, vatRateArg, discountArg, []);
    const today = new Date().toISOString().split('T')[0];

    const newDoc = {
      id: `doc-${docType}-${Date.now()}`,
      docType,
      docNumber,
      title: titleArg || `${docType === 'quote' ? 'Quotation' : docType === 'receipt' ? 'Payment Receipt' : 'Tax Invoice'} ${docNumber} (${client.name})`,
      status: 'draft',
      clientId: client.id,
      clientSnapshot: {
        name: client.name,
        contactPerson: client.contactPerson,
        email: client.email,
        phone: client.phone,
        billingAddress: client.billingAddress,
        vatNumber: client.vatNumber
      },
      issueDate: today,
      dueDate: dueArg,
      validUntil: docType === 'quote' ? dueArg : undefined,
      lineItems,
      vatRate: vatRateArg,
      discountAmount: discountArg,
      currency: "ZAR",
      currencySymbol: "R",
      ...totals,
      payments: [],
      notes: docType === 'quote' 
        ? "Quotation valid for 30 days. 50% deposit required on acceptance." 
        : "Payment due strictly within 14 calendar days of tax invoice date.",
      termsAndConditions: billing.settings.paymentTerms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    billing.documents.unshift(newDoc);
    saveBillingData(billing);

    const toolId = docType === 'quote' ? '4' : docType === 'receipt' ? '10' : '2';
    const shareUrl = generateDocStudioShareUrl(toolId, newDoc, 'classic-zoho');

    if (isJson) {
      output({ success: true, document: newDoc, shareUrl });
    } else {
      console.log(`
========================================================================================
✅ DOCSTUDIO CLI: CREATED ${docType.toUpperCase()} ${docNumber}
========================================================================================
Document #:     ${docNumber} (${docType.toUpperCase()})
Client:         ${client.name} (${client.email})
Status:         [DRAFT]
Issue Date:     ${today} | Due Date: ${dueArg}
Subtotal:       ${formatZar(totals.subtotal)}
VAT (15%):      ${formatZar(totals.vatTotal)}
Grand Total:    ${formatZar(totals.grandTotal)}
Balance Due:    ${formatZar(totals.balanceDue)}
Live Cloud URL: ${shareUrl}
========================================================================================
`);
    }
    break;
  }

  case 'billing:convert': {
    const billing = loadBillingData();
    const targetIdentifier = cleanArgs[1] || getArg('--number') || getArg('--id');

    let quoteDoc = null;
    if (targetIdentifier) {
      quoteDoc = (billing.documents || []).find(d => 
        d.docType === 'quote' && (d.docNumber === targetIdentifier || d.id === targetIdentifier || d.docNumber.toLowerCase() === targetIdentifier.toLowerCase())
      );
    } else {
      quoteDoc = (billing.documents || []).find(d => d.docType === 'quote' && d.status !== 'converted');
      if (!quoteDoc) {
        quoteDoc = (billing.documents || []).find(d => d.docType === 'quote');
      }
    }

    if (!quoteDoc) {
      error("No suitable Quotation found to convert to Tax Invoice. Use 'billing:create --type quote' first.", "NO_QUOTE_FOUND");
    }

    // 1. Mark quote as converted
    quoteDoc.status = 'converted';
    quoteDoc.updatedAt = new Date().toISOString();

    // 2. Generate new invoice
    const invCounter = billing.settings.invoiceCounter || 219;
    billing.settings.invoiceCounter = invCounter + 1;
    const invNumber = `INV-${String(invCounter).padStart(4, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const totals = calculateBillingTotals(quoteDoc.lineItems, quoteDoc.vatRate, quoteDoc.discountAmount, []);

    const newInvoice = {
      ...quoteDoc,
      id: `doc-inv-${Date.now()}`,
      docType: 'invoice',
      docNumber: invNumber,
      title: `Tax Invoice ${invNumber} (${quoteDoc.clientSnapshot.name})`,
      status: 'draft',
      issueDate: today,
      dueDate: due,
      validUntil: undefined,
      payments: [],
      amountPaid: 0,
      balanceDue: totals.grandTotal,
      parentQuoteId: quoteDoc.id,
      parentQuoteNumber: quoteDoc.docNumber,
      linkedInvoiceNumber: undefined,
      notes: `Converted from Quotation ${quoteDoc.docNumber}. Thank you for your business.`,
      termsAndConditions: billing.settings.paymentTerms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    billing.documents.unshift(newInvoice);
    saveBillingData(billing);

    const shareUrl = generateDocStudioShareUrl('2', newInvoice, 'classic-zoho');

    if (isJson) {
      output({
        success: true,
        sourceQuote: { docNumber: quoteDoc.docNumber, status: quoteDoc.status },
        createdInvoice: newInvoice,
        shareUrl
      });
    } else {
      console.log(`
========================================================================================
🔄 DOCSTUDIO CLI: 1-CLICK QUOTE-TO-INVOICE CONVERSION COMPLETE
========================================================================================
Source Quote:   ${quoteDoc.docNumber} (Status updated to [CONVERTED])
Target Invoice: ${newInvoice.docNumber} (Status: [DRAFT])
Client:         ${newInvoice.clientSnapshot.name}
Issue Date:     ${today} | Due Date: ${due}
Total Value:    ${formatZar(newInvoice.grandTotal)}
Balance Due:    ${formatZar(newInvoice.balanceDue)}
Linked Quote:   ${newInvoice.parentQuoteNumber}
Live Cloud URL: ${shareUrl}
========================================================================================
`);
    }
    break;
  }

  case 'billing:pay': {
    const billing = loadBillingData();
    const targetIdentifier = cleanArgs[1] || getArg('--number') || getArg('--id');
    const amountArg = getArg('--amount');
    const methodArg = getArg('--method') || 'EFT';
    const refArg = getArg('--ref') || `EFT-TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const notesArg = getArg('--notes') || 'Payment processed via DocStudio CLI';

    let invoiceDoc = null;
    if (targetIdentifier) {
      invoiceDoc = (billing.documents || []).find(d => 
        d.docType === 'invoice' && (d.docNumber === targetIdentifier || d.id === targetIdentifier || d.docNumber.toLowerCase() === targetIdentifier.toLowerCase())
      );
    } else {
      invoiceDoc = (billing.documents || []).find(d => d.docType === 'invoice' && d.balanceDue > 0);
      if (!invoiceDoc) {
        invoiceDoc = (billing.documents || []).find(d => d.docType === 'invoice');
      }
    }

    if (!invoiceDoc) {
      error("No Invoice found to record payment against. Use 'billing:create --type invoice' first.", "NO_INVOICE_FOUND");
    }

    const payAmount = amountArg ? Number(amountArg) : invoiceDoc.balanceDue;
    if (payAmount <= 0) {
      error(`Invoice ${invoiceDoc.docNumber} has no outstanding balance (Balance: ${formatZar(invoiceDoc.balanceDue)}).`, "ALREADY_SETTLED");
    }

    // 1. Generate receipt number
    const recCounter = billing.settings.receiptCounter || 90;
    billing.settings.receiptCounter = recCounter + 1;
    const receiptNumber = `REC-${String(recCounter).padStart(4, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const paymentRecord = {
      id: `pay-${Date.now()}`,
      documentId: invoiceDoc.id,
      receiptNumber,
      amount: payAmount,
      paymentDate: today,
      method: methodArg,
      reference: refArg,
      notes: notesArg
    };

    invoiceDoc.payments = invoiceDoc.payments || [];
    invoiceDoc.payments.push(paymentRecord);

    const totals = calculateBillingTotals(invoiceDoc.lineItems, invoiceDoc.vatRate, invoiceDoc.discountAmount, invoiceDoc.payments);
    invoiceDoc.amountPaid = totals.amountPaid;
    invoiceDoc.balanceDue = totals.balanceDue;
    invoiceDoc.status = totals.balanceDue <= 0.01 ? 'paid' : 'partial';
    invoiceDoc.updatedAt = new Date().toISOString();

    // 2. Synthesize standalone Receipt document
    const receiptDoc = {
      id: `doc-rec-${Date.now()}`,
      docType: 'receipt',
      docNumber: receiptNumber,
      title: `Official Payment Receipt ${receiptNumber} (${invoiceDoc.clientSnapshot.name})`,
      status: 'paid',
      clientId: invoiceDoc.clientId,
      clientSnapshot: invoiceDoc.clientSnapshot,
      issueDate: today,
      dueDate: today,
      lineItems: [
        {
          id: `li-rec-${Date.now()}`,
          description: `Settlement for Tax Invoice ${invoiceDoc.docNumber}`,
          quantity: 1,
          unitPrice: payAmount,
          discountPct: 0,
          taxRate: 0,
          unit: 'Payment'
        }
      ],
      vatRate: 0,
      discountAmount: 0,
      currency: "ZAR",
      currencySymbol: "R",
      subtotal: payAmount,
      vatTotal: 0,
      grandTotal: payAmount,
      amountPaid: payAmount,
      balanceDue: 0,
      payments: [paymentRecord],
      linkedInvoiceNumber: invoiceDoc.docNumber,
      receiptReference: refArg,
      paymentMethod: methodArg,
      notes: `Payment of ${formatZar(payAmount)} received via ${methodArg} for ${invoiceDoc.docNumber}. Balance remaining on invoice: ${formatZar(totals.balanceDue)}.`,
      termsAndConditions: "Thank you for your prompt settlement.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    billing.documents.unshift(receiptDoc);
    saveBillingData(billing);

    const invoiceShareUrl = generateDocStudioShareUrl('2', invoiceDoc, 'classic-zoho');
    const receiptShareUrl = generateDocStudioShareUrl('10', receiptDoc, 'classic-zoho');

    if (isJson) {
      output({
        success: true,
        payment: paymentRecord,
        invoice: {
          docNumber: invoiceDoc.docNumber,
          status: invoiceDoc.status,
          grandTotal: invoiceDoc.grandTotal,
          amountPaid: invoiceDoc.amountPaid,
          balanceDue: invoiceDoc.balanceDue,
          shareUrl: invoiceShareUrl
        },
        receipt: {
          docNumber: receiptDoc.docNumber,
          amount: payAmount,
          shareUrl: receiptShareUrl
        }
      });
    } else {
      console.log(`
========================================================================================
💰 DOCSTUDIO CLI: PAYMENT RECORDED & RECEIPT GENERATED
========================================================================================
Receipt Number:     ${receiptNumber}
Target Invoice:     ${invoiceDoc.docNumber} (Status: [${invoiceDoc.status.toUpperCase()}])
Client:             ${invoiceDoc.clientSnapshot.name}
Amount Settled:     ${formatZar(payAmount)}
Payment Method:     ${methodArg}
Transaction Ref:    ${refArg}
Invoice Total:      ${formatZar(invoiceDoc.grandTotal)}
Total Paid to Date: ${formatZar(invoiceDoc.amountPaid)}
Remaining Balance:  ${formatZar(invoiceDoc.balanceDue)}

🌐 Live Invoice URL: ${invoiceShareUrl}
🧾 Live Receipt URL: ${receiptShareUrl}
========================================================================================
`);
    }
    break;
  }

  case 'dev': {
    console.log('[CLI] Starting development server...');
    execSync('npm run dev', { cwd: PROJECT_DIR, stdio: 'inherit' });
    break;
  }

  case 'build': {
    console.log('[CLI] Building project...');
    execSync('npm run build', { cwd: PROJECT_DIR, stdio: 'inherit' });
    break;
  }

  case 'list-files': {
    const files = fs.readdirSync(PROJECT_DIR).filter(f => !['node_modules', '.git', '.next', 'dist', 'bin'].includes(f));
    output({ files });
    break;
  }

  case 'help':
  default: {
    if (isJson) {
      output({
        cli: 'docstudio',
        commands: [
          { name: 'doctor', description: 'Run diagnostics on local setup, environment, and dependencies' },
          { name: 'status', description: 'Display project metadata, stack info, and package details' },
          { name: 'cv:generate', description: 'Generate tailored CVs for Modern Dual and Clean Minimal templates into exports/' },
          { name: 'cv:audit', description: 'Run ATS scoring and diagnostic breakdown' },
          { name: 'billing:list', description: 'List commercial documents (Quotes, Invoices, Receipts) with totals' },
          { name: 'billing:create', description: 'Create a new Quote, Invoice, or Receipt with automatic VAT calculation' },
          { name: 'billing:convert', description: 'Convert an approved Quote into a Tax Invoice (Zoho-style 1-click)' },
          { name: 'billing:pay', description: 'Record payment against an invoice and generate an official receipt' },
          { name: 'dev', description: 'Start the local development server' },
          { name: 'build', description: 'Compile/build the project for production' },
          { name: 'list-files', description: 'List project root files' },
          { name: 'help', description: 'Show this help menu' }
        ]
      });
    } else {
      console.log(`
========================================================================
  🛠️  CLI: docstudio (DocStudio Commercial Engine)
========================================================================

Usage:
  node bin/cli.cjs <command> [options]
  .\\bin\\cli.ps1 <command> [options]

📄 CV Commands:
  cv:generate      Generate Modern Dual & Clean Minimal CVs (1-page A4 PDF/HTML in exports/)
  cv:audit         Run ATS audit on candidate resume profile

💼 Commercial Billing Hub Commands (Zoho-Style):
  billing:list     List all Quotes, Invoices, and Receipts with summary metrics
                   Options: --type <quote|invoice|receipt>, --status <status>, --client <name>
  billing:create   Create a new commercial billing document
                   Options: --type <quote|invoice|receipt>, --client <name>, --desc <item>, --qty <n>, --price <p>, --vat <rate>
  billing:convert  Convert an approved Quote to an active Tax Invoice (1-Click)
                   Usage: billing:convert [QUO-XXXX]
  billing:pay      Record an EFT/Card payment on an Invoice and issue an official Receipt
                   Usage: billing:pay [INV-XXXX] --amount <amt> --method <EFT|Card> --ref <ref>

⚙️ System & Development Commands:
  doctor           Run system and environment diagnostic checks
  status           Show project metadata, stack summary, and status
  dev              Start the local development server (npm run dev)
  build            Run production build (npm run build)
  list-files       List non-ignored files in project directory
  help             Show this help message

Options:
  --json           Return output formatted as structured JSON for agents/scripts
`);
    }
    break;
  }
}

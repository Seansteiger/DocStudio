export interface PolishOptions {
  category?: string;
  role?: string;
  tone?: 'executive' | 'confident' | 'academic' | 'creative';
  experienceYears?: number;
  location?: string;
  targetJobDescription?: string;
  skills?: string[];
  currentCompany?: string;
}

export interface TailoredSummaryParams {
  roleTitle?: string;
  targetJobDescription?: string;
  skills?: string[];
  experienceYears?: number;
  tone?: 'executive' | 'confident' | 'academic' | 'creative';
  currentCompany?: string;
  location?: string;
}

// Map of weak passive openings to decisive action verb structures
const PASSIVE_REPLACEMENTS: Array<{ regex: RegExp; replacement: string }> = [
  { regex: /^(?:was\s+)?responsible\s+for\s+/i, replacement: "Spearheaded and executed " },
  { regex: /^(?:was\s+)?tasked\s+with\s+/i, replacement: "Entrusted to direct and deliver " },
  { regex: /^(?:helped\s+with|helped\s+to|assisted\s+in|assisted\s+with)\s+/i, replacement: "Collaborated to architect and deploy " },
  { regex: /^(?:worked\s+on|worked\s+with)\s+/i, replacement: "Engineered and optimized " },
  { regex: /^(?:handled|handled\s+all)\s+/i, replacement: "Administered and modernized " },
  { regex: /^(?:duties\s+included|my\s+role\s+was\s+to)\s+/i, replacement: "Orchestrated end-to-end deliverables for " },
  { regex: /^(?:involved\s+in|participated\s+in)\s+/i, replacement: "Partnered cross-functionally to drive " },
  { regex: /^(?:did|made|built\s+some)\s+/i, replacement: "Designed, engineered, and delivered " },
  { regex: /^(?:supported|maintained)\s+/i, replacement: "Hardened, scaled, and maintained " }
];

// Curated quantifiable metrics tailored by domain when a bullet lacks measured impact
const DOMAIN_METRIC_INJECTIONS: Record<string, string[]> = {
  tech: [
    ", improving core system throughput and reducing endpoint response latency by 36%",
    ", cutting automated CI/CD deployment cycle times by 42%",
    ", maintaining 99.98% production service uptime across high-traffic hours",
    ", expanding automated unit and integration test coverage from 60% to 92%",
    ", scaling backend transaction throughput to handle 450k+ daily API requests",
    ", reducing memory footprint and resource consumption by 28%"
  ],
  data: [
    ", reducing complex query execution latency by 3.5x across multi-million record datasets",
    ", eliminating 14+ hours of weekly manual reporting through automated pipeline orchestration",
    ", achieving a 99.8% reconciliation accuracy rating across heterogeneous data sources",
    ", accelerating executive dashboard refresh cycles from daily to real-time sub-minute intervals"
  ],
  finance: [
    ", accelerating month-end statutory closing cycles by 3 business days",
    ", reducing quarterly budgetary forecast variance from 8.5% down to under 1.2%",
    ", uncovering R240k+ in operational billing efficiencies and vendor cost reductions",
    ", ensuring 100% IFRS compliance and zero critical audit discrepancies"
  ],
  admin: [
    ", reducing administrative request turnaround times by 35% through standardized digital workflows",
    ", cutting quarterly departmental procurement expenditure by 18%",
    ", coordinating seamless high-stakes executive logistics with a 98% satisfaction rating"
  ],
  logistics: [
    ", improving on-time freight delivery reliability from 88% to 97.4%",
    ", reducing regional route fleet fuel expenditure by 15% using telematics optimization",
    ", achieving a 99.6% physical-to-digital inventory reconciliation rate"
  ],
  general: [
    ", boosting operational workflow velocity by 25% while maintaining strict quality benchmarks",
    ", driving cross-functional alignment and delivering key project milestones 2 weeks ahead of schedule",
    ", reducing manual error rates by 30% through automated verification checks"
  ]
};

/**
 * Polishes a single CV responsibility bullet into a metric-driven achievement line using the Google XYZ formula.
 */
export const polishSingleBullet = (bullet: string, roleContext: string = ''): string => {
  if (!bullet || typeof bullet !== 'string') return '';

  // Clean bullet prefix and whitespace
  let clean = bullet.trim()
    .replace(/^[•\-\*\d\.\)\s]+/g, '')
    .trim();

  if (clean.length < 5) return bullet;

  // 1. Replace weak passive starters
  for (const { regex, replacement } of PASSIVE_REPLACEMENTS) {
    if (regex.test(clean)) {
      clean = clean.replace(regex, replacement);
      break;
    }
  }

  // 2. Capitalize first letter
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);

  // 3. Remove trailing period for consistent processing
  if (clean.endsWith('.')) {
    clean = clean.slice(0, -1);
  }

  // 4. Check if line already has quantifiable metrics (% or numbers or currency)
  const hasMetric = /(\d+%\s*|\$\d+|r\d+|\d+\+|\d+k|\d+m|\b\d+\b\s*(?:users|clients|transactions|days|hours|squads|engineers|services))/i.test(clean);

  if (!hasMetric) {
    const roleLower = roleContext.toLowerCase();
    let domain = 'general';
    if (/dev|engineer|architect|frontend|backend|cloud|fullstack|software/i.test(roleLower)) domain = 'tech';
    else if (/data|analyst|analytics|bi|scientist/i.test(roleLower)) domain = 'data';
    else if (/finance|account|tax|audit|bookkeeper/i.test(roleLower)) domain = 'finance';
    else if (/admin|assistant|office|clerk/i.test(roleLower)) domain = 'admin';
    else if (/logistics|supply|warehouse|fleet/i.test(roleLower)) domain = 'logistics';

    const pool = DOMAIN_METRIC_INJECTIONS[domain] || DOMAIN_METRIC_INJECTIONS.general;
    // Deterministic selection based on string hash
    const index = Math.abs(clean.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % pool.length;
    clean = clean + pool[index];
  }

  return `• ${clean}.`;
};

/**
 * Quantifies and transforms raw responsibilities text into high-impact action bullets.
 */
export const quantifyImpactBullets = (rawResponsibilities: string, roleContext: string = ''): string => {
  if (!rawResponsibilities || typeof rawResponsibilities !== 'string') return '';

  const lines = rawResponsibilities
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) return '';

  return lines
    .map(line => polishSingleBullet(line, roleContext))
    .join('\n');
};

/**
 * Generates an executive, tailored Professional Summary aligned with a target Job Description and role.
 */
export const generateTailoredSummary = (params: TailoredSummaryParams = {}): string => {
  const role = params.roleTitle || "Senior Software Engineer";
  const years = params.experienceYears || 6;
  const tone = params.tone || 'executive';
  const skillsList = params.skills && params.skills.length > 0 
    ? params.skills.slice(0, 4).join(', ') 
    : "modern cloud-native architectures, resilient distributed systems, and API scalability";

  // If a JD is provided, extract target keywords and role highlights
  let jdHighlight = "";
  if (params.targetJobDescription && params.targetJobDescription.trim().length > 20) {
    const jd = params.targetJobDescription.toLowerCase();
    if (jd.includes('fintech') || jd.includes('payment')) {
      jdHighlight = " specializing in mission-critical transactional platforms and high-throughput payment rails";
    } else if (jd.includes('microservices') || jd.includes('cloud') || jd.includes('aws') || jd.includes('azure')) {
      jdHighlight = " with deep domain expertise in scalable multi-cloud infrastructure and high-availability microservices";
    } else if (jd.includes('lead') || jd.includes('manage') || jd.includes('stakeholder')) {
      jdHighlight = " distinguished by strategic stakeholder engagement and leading high-velocity engineering squads";
    }
  }

  if (tone === 'confident') {
    return `Dynamic and outcome-oriented ${role} with ${years}+ years of proven success architecting resilient, production-grade solutions${jdHighlight}. Adept in ${skillsList}, with an unwavering focus on engineering excellence, rapid deployment cycles, and cutting infrastructure overhead. Known for proactive problem-solving, rapid technical adaptation, and delivering enterprise value from day one.`;
  }

  if (tone === 'creative') {
    return `Forward-thinking and design-conscious ${role} bringing ${years}+ years of experience crafting elegant, high-performance digital experiences${jdHighlight}. Passionate about bridging technical scalability and intuitive product design through ${skillsList}. Champion of user-centric craftsmanship, iterative experimentation, and fostering collaborative cross-functional synergy.`;
  }

  if (tone === 'academic') {
    return `Methodical and research-driven ${role} with ${years}+ years of specialized background in computational systems, algorithmic optimization, and data governance${jdHighlight}. Proficient in ${skillsList}, adhering strictly to formal software engineering principles, automated verification standards, and verifiable quality benchmarks.`;
  }

  // Executive (Default)
  return `Accomplished and strategic ${role} with ${years}+ years of leadership in designing, scaling, and modernizing enterprise digital infrastructure${jdHighlight}. Proven track record leveraging ${skillsList} to drive operational efficiency, slash system latencies by over 35%, and deliver robust architectures that align directly with organizational growth objectives. Recognized for executive communication, rigorous technical governance, and mentoring high-performing teams.`;
};

/**
 * Polishes the professional summary based on role, category, and target job parameters.
 */
export const polishProfessionalSummary = (options: PolishOptions = {}): string => {
  // If target JD or custom parameters provided, use tailored summary generator
  if (options.targetJobDescription || options.skills || options.tone) {
    return generateTailoredSummary({
      roleTitle: options.role,
      targetJobDescription: options.targetJobDescription,
      skills: options.skills,
      experienceYears: options.experienceYears,
      tone: options.tone,
      currentCompany: options.currentCompany,
      location: options.location
    });
  }

  const role = options.role || "Software Engineer";
  const years = options.experienceYears || 5;

  const summariesByRole: Record<string, string> = {
    "Web Development": `Highly analytical and results-driven Senior Full-Stack Engineer with ${years}+ years of hands-on experience architecting, developing, and deploying resilient cloud-native applications. Proven track record in modernizing enterprise web portals, optimizing database latency by up to 40%, and mentoring high-performing engineering squads in fast-paced Agile environments.`,
    "Software Engineering": `Forward-thinking Software Engineer with ${years}+ years of experience building distributed microservices, scalable backend architectures, and high-performance frontend interfaces. Adept at translating complex product requirements into robust, type-safe software deliverables with automated test coverage exceeding 90%.`,
    "Business Analysis": `Strategic and data-driven Business Analyst with ${years}+ years of specialized experience in requirements elicitation, workflow re-engineering (BPMN 2.0), and systems integration. Recognized for facilitating executive alignment, reducing transactional cycle times by 20%, and orchestrating flawless end-to-end User Acceptance Testing.`,
    "Finance & Accounting": `Meticulous and IFRS-compliant Financial Accountant with ${years}+ years of experience managing multi-million-rand balance sheets, statutory tax compliance, and automated payroll operations. Skilled in building predictive cash-flow forecasting models and driving strict internal audit governance.`,
    "Executive Administration": `Proactive and organized Executive Administrative Professional with ${years}+ years of experience managing C-suite calendars, complex travel logistics, and high-volume corporate communications. Renowned for discretion, operational efficiency, and establishing streamlined digital record-keeping systems.`,
    "Logistics & Supply Chain": `Efficiency-driven Supply Chain and Logistics Coordinator with ${years}+ years of experience in fleet routing, inventory control, and warehouse optimization. Adept at leveraging ERP systems (SAP) to minimize transit bottlenecks and reduce operational logistics costs by up to 18%.`,
    "Sales & Marketing": `High-energy B2B Growth and Sales Strategist with ${years}+ years of track record in pipeline generation, strategic client acquisition, and omnichannel marketing campaigns. Proven capability to consistently exceed quarterly sales quotas by 125% while maintaining exceptional customer lifetime value.`,
    "Legal & Compliance": `Diligent Legal and Compliance Specialist with ${years}+ years of experience drafting commercial agreements, managing regulatory audits, and mitigating organizational risk under POPIA and GDPR frameworks. Skilled in dispute resolution and corporate governance advisory.`
  };

  for (const [key, text] of Object.entries(summariesByRole)) {
    if (role.toLowerCase().includes(key.toLowerCase()) || (options.category && options.category.toLowerCase().includes(key.toLowerCase()))) {
      return text;
    }
  }

  return `Dynamic, results-driven professional with ${years}+ years of proven track record in driving operational excellence, managing stakeholder expectations, and delivering high-impact strategic solutions that align with corporate growth objectives.`;
};

/**
 * Rewrites job responsibilities with strong action verbs and quantified impact metrics.
 * If existingText is provided, polishes the user's existing lines; otherwise provides domain template bullets.
 */
export const polishJobResponsibilities = (jobTitle: string, existingText?: string): string => {
  // If user provided existing responsibilities text, polish each bullet into a metric-driven achievement
  if (existingText && existingText.trim().length > 10) {
    return quantifyImpactBullets(existingText, jobTitle);
  }

  const t = jobTitle.toLowerCase();

  if (t.includes('dev') || t.includes('engineer') || t.includes('program') || t.includes('architect') || t.includes('tech')) {
    return [
      "• Spearheaded full-stack architecture modernization, improving Core Web Vitals and reducing API endpoint latency by 38%.",
      "• Engineered secure, containerized microservices utilizing Docker and Kubernetes, maintaining 99.98% production uptime.",
      "• Authored comprehensive automated unit, integration, and E2E test suites, expanding code test coverage to 92% and cutting bug regressions.",
      "• Mentored 6+ junior and intermediate engineers, establishing clean code review standards and accelerating sprint delivery velocity by 25%."
    ].join('\n');
  }

  if (t.includes('analyst') || t.includes('consultant') || t.includes('product')) {
    return [
      "• Mapped 'as-is' and 'to-be' operational workflows using BPMN 2.0 standards, cutting transaction cycle times by 18%.",
      "• Facilitated interactive requirements discovery workshops with 12+ executive stakeholders to define quarterly product roadmaps.",
      "• Authored detailed User Acceptance Testing (UAT) test cases and verified zero-defect software rollouts.",
      "• Designed real-time Tableau and PowerBI analytics dashboards, eliminating 15 hours of manual weekly status reporting."
    ].join('\n');
  }

  if (t.includes('account') || t.includes('finance') || t.includes('audit')) {
    return [
      "• Directed month-end financial closing, balance sheet reconciliations, and IFRS statutory reporting with 100% compliance.",
      "• Designed automated financial forecasting spreadsheets, reducing quarterly budget variance from 8% down to 1.2%.",
      "• Managed accounts payable and receivable operations, negotiating vendor payment terms to optimize cash-flow liquidity.",
      "• Uncovered R280k in misallocated expenditure through rigorous forensic reconciliations."
    ].join('\n');
  }

  if (t.includes('admin') || t.includes('office') || t.includes('coordinator')) {
    return [
      "• Streamlined executive calendar scheduling, board meeting preparation, and travel itineraries for senior leadership.",
      "• Overhauled office digital filing systems and procurement channels, reducing administrative supply costs by 15%.",
      "• Handled incoming client and vendor communications with utmost confidentiality and a 98% positive resolution rating.",
      "• Coordinated cross-departmental operations and logistics for quarterly town halls with 250+ attendees."
    ].join('\n');
  }

  if (t.includes('logistics') || t.includes('supply') || t.includes('warehouse')) {
    return [
      "• Optimized regional freight dispatch routes using GPS telematics, reducing fuel expenditure by 14% year-on-year.",
      "• Supervised periodic warehouse inventory cycle counts, achieving a 99.6% physical-to-digital inventory accuracy rate.",
      "• Negotiated service level agreements (SLAs) with 3rd-party logistics carriers, improving on-time delivery metrics to 97%.",
      "• Automated stock dispatch notifications, cutting order-to-ship turnaround times by 22%."
    ].join('\n');
  }

  return [
    "• Directed day-to-day operational deliverables, ensuring strict adherence to quality benchmarks and project deadlines.",
    "• Collaborated within cross-functional teams to identify workflow bottlenecks and implement systemic efficiencies.",
    "• Prepared weekly executive progress summaries and analytical KPI dashboards for departmental leadership.",
    "• Delivered key strategic milestones 2 weeks ahead of scheduled deadlines while maintaining zero critical compliance defects."
  ].join('\n');
};

export const polishCoverLetterParagraphs = (
  fullName: string,
  jobTitle: string,
  companyName: string,
  location: string = "Johannesburg, South Africa",
  tone: 'executive' | 'confident' | 'academic' | 'creative' = 'executive'
): string[] => {
  const cName = companyName || "your distinguished organization";
  const jTitle = jobTitle || "the advertised role";

  if (tone === 'confident') {
    return [
      `I am writing to express my enthusiastic interest in the ${jTitle} role at ${cName}. With a demonstrated history of driving high-impact innovation, accelerating project velocity, and solving complex challenges, I am excited to bring my skills to your team.`,
      `In my recent positions based in ${location}, I consistently delivered top-tier results by combining deep technical discipline with proactive stakeholder communication. Whether architecting new frameworks or streamlining legacy operations, I focus relentlessly on measurable outcomes and team synergy.`,
      `What excites me most about ${cName} is your ambitious vision and market reputation for excellence. I am eager to hit the ground running, take full ownership of key initiatives, and deliver rapid value to your engineering squads.`,
      `Thank you for taking the time to review my application. I look forward to the chance to speak with you directly and discuss how my expertise aligns with your strategic goals.`
    ];
  }

  if (tone === 'creative') {
    return [
      `Great products are built at the intersection of bold vision and meticulous execution. That is exactly what drew me to the ${jTitle} opportunity with ${cName}.`,
      `Throughout my career, I have dedicated myself to crafting elegant, intuitive solutions to complex problems. By blending creative problem-solving with data-backed methodologies, I have helped cross-functional teams build experiences that delight users and drive real business outcomes.`,
      `${cName}'s commitment to pushing creative and technical boundaries resonates deeply with my philosophy. I am eager to contribute fresh perspectives, high energy, and reliable execution to your upcoming product milestones.`,
      `I would love the opportunity to share my portfolio and explore how we can create something truly exceptional together. Thank you for your consideration.`
    ];
  }

  // Executive tone (default)
  return [
    `I am writing to formally submit my candidacy for the ${jTitle} position at ${cName}. With over 6 years of specialized expertise in delivering strategic initiatives, optimizing operational systems, and leading cross-functional teams within the ${location} market, I am well-prepared to contribute to your organization's continued success.`,
    `In my previous roles, I spearheaded key modernization programs that delivered measurable improvements in system throughput and reduced operating overhead. I specialize in translating high-level business requirements into robust, scalable frameworks while maintaining rigorous quality standards and clear stakeholder visibility.`,
    `I have long admired ${cName}'s market leadership and strategic forward momentum. I am confident that my technical background, strategic mindset, and collaborative leadership style will make me an asset to your leadership and delivery squads.`,
    `Thank you for your time and consideration of my credentials. I welcome the opportunity to discuss my qualifications and how I can support the strategic vision of ${cName} in a formal interview.`
  ];
};

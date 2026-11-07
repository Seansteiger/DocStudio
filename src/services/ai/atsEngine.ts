import type { SouthAfricanCvData } from '../../types/document';

export interface AtsAuditResult {
  score: number; // 0 to 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  breakdown: {
    contactInfo: { score: number; max: 15; label: string; passed: boolean; tip?: string };
    professionalSummary: { score: number; max: 20; label: string; passed: boolean; tip?: string };
    workExperience: { score: number; max: 25; label: string; passed: boolean; tip?: string };
    skillsDensity: { score: number; max: 20; label: string; passed: boolean; tip?: string };
    educationHistory: { score: number; max: 10; label: string; passed: boolean; tip?: string };
    eeCompliance: { score: number; max: 10; label: string; passed: boolean; tip?: string };
    jdMatch?: { score: number; max: 20; label: string; passed: boolean; tip?: string };
  };
  metricsCount: number;
  actionVerbsCount: number;
  identifiedKeywords: string[];
  missingKeywords: string[];
  targetJobDescription?: string;
  jdMatch?: {
    score: number; // 0 - 100%
    targetTitle?: string;
    matchedKeywords: string[];
    missingKeywords: string[];
    totalJdKeywords: number;
    matchRatio: string;
    tailoringSuggestions: Array<{
      id: string;
      category: 'skill' | 'summary' | 'experience';
      title: string;
      description: string;
      suggestedSkill?: string;
      suggestedText?: string;
      fixAction?: string;
    }>;
  };
  recommendations: Array<{
    id: string;
    type: 'critical' | 'warning' | 'enhancement';
    title: string;
    description: string;
    fixAction?: string;
  }>;
}

// Master list of power action verbs
const ACTION_VERBS = [
  'spearheaded', 'engineered', 'architected', 'directed', 'developed', 'optimized',
  'streamlined', 'delivered', 'orchestrated', 'implemented', 'reduced', 'increased',
  'managed', 'negotiated', 'launched', 'mentored', 'designed', 'transformed',
  'automated', 'modernized', 'overhauled', 'accelerated', 'consolidated', 'authored',
  'scaled', 'programmed', 'facilitated', 'administered', 'championed', 'deployed'
];

// Curated industry technical, engineering, cloud, and business skills dictionary
const TECH_SKILL_KEYWORDS = [
  // Languages & Runtimes
  'TypeScript', 'JavaScript', 'Python', 'Node.js', 'Java', 'C#', '.NET', 'Go', 'Golang', 
  'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'SQL', 'Bash', 'PowerShell', 'C++',
  
  // Frontend
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Tailwind CSS', 'Redux', 'HTML5', 
  'CSS3', 'Webpack', 'Vite', 'GraphQL', 'REST APIs', 'WebSockets', 'Microfrontends', 
  'Responsive Design', 'Core Web Vitals',

  // Backend & Architecture
  'Microservices', 'System Architecture', 'Distributed Systems', 'Event-Driven Architecture',
  'Domain-Driven Design', 'Express.js', 'NestJS', 'FastAPI', 'Django', 'Spring Boot',
  'gRPC', 'Serverless', 'Message Queues', 'Kafka', 'RabbitMQ', 'Redis',

  // Cloud & DevOps
  'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes',
  'Terraform', 'CI/CD', 'GitHub Actions', 'GitLab CI', 'Jenkins', 'Ansible', 'Linux',
  'Helm', 'Prometheus', 'Grafana', 'DevOps', 'Infrastructure as Code', 'Cloud Native',

  // Databases & Storage
  'PostgreSQL', 'MySQL', 'MongoDB', 'DynamoDB', 'Supabase', 'Firebase', 'Elasticsearch',
  'Cassandra', 'Database Optimization', 'Query Tuning', 'Prisma', 'TypeORM',

  // QA & Security
  'Unit Testing', 'End-to-End Testing', 'Jest', 'Cypress', 'Playwright', 'Test-Driven Development',
  'TDD', 'OWASP', 'Penetration Testing', 'Identity and Access Management', 'OAuth', 'JWT',
  'POPIA', 'GDPR', 'ISO 27001', 'PCI-DSS',

  // Methodologies & Leadership
  'Agile', 'Scrum', 'Kanban', 'Sprint Planning', 'Sprint Velocity', 'Product Roadmap',
  'Technical Leadership', 'Team Mentorship', 'Code Reviews', 'Stakeholder Management',
  'Incident Management', 'Root Cause Analysis', 'SLA Uptime', 'Cross-Functional Collaboration',

  // Domains & Business
  'FinTech', 'Payment Gateways', 'Instant EFT', 'E-Commerce', 'SaaS', 'API Integration',
  'Data Pipeline', 'ETL', 'Business Intelligence', 'Analytics', 'Enterprise Architecture'
];

/**
 * Extracts key technical skills, tools, and domain keywords from a Target Job Description (JD).
 */
export const extractKeywordsFromJd = (jobDescription: string): string[] => {
  if (!jobDescription || typeof jobDescription !== 'string') return [];

  const text = jobDescription.trim();
  if (text.length < 10) return [];

  const foundKeywords = new Set<string>();
  const lowerText = text.toLowerCase();

  // 1. Match against known technical skills catalog
  TECH_SKILL_KEYWORDS.forEach(skill => {
    // Escape regex characters
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      foundKeywords.add(skill);
    }
  });

  // 2. Extract capitalized acronyms (3-6 letters like REST, AWS, GCP, CI/CD, CRM, ERP, KPI, SRE, etc.)
  const acronymRegex = /\b[A-Z0-9/]{2,8}\b/g;
  const acronymMatches = text.match(acronymRegex);
  if (acronymMatches) {
    const commonNoise = new Set(['THE', 'AND', 'FOR', 'WITH', 'YOU', 'OUR', 'ARE', 'WILL', 'WHO', 'ALL', 'NOT', 'PER', 'JOB', 'ROLE', 'REQ']);
    acronymMatches.forEach(acronym => {
      const clean = acronym.trim();
      if (clean.length >= 2 && !commonNoise.has(clean) && !/^\d+$/.test(clean)) {
        foundKeywords.add(clean);
      }
    });
  }

  // 3. Extract common multi-word title and role phrases
  const rolePhrases = [
    'Full Stack', 'Cloud Architect', 'Software Engineer', 'Frontend Engineer', 'Backend Engineer',
    'Tech Lead', 'Staff Engineer', 'Site Reliability Engineer', 'Data Engineer', 'DevOps Engineer',
    'Scrum Master', 'Product Manager', 'Solutions Architect', 'Cybersecurity Specialist'
  ];
  rolePhrases.forEach(phrase => {
    if (lowerText.includes(phrase.toLowerCase())) {
      foundKeywords.add(phrase);
    }
  });

  return Array.from(foundKeywords);
};

/**
 * Compares a candidate's CV against a target Job Description, returning match metrics and actionable tailoring advice.
 */
export const matchCvToJobDescription = (
  cv: SouthAfricanCvData,
  jobDescription: string
): NonNullable<AtsAuditResult['jdMatch']> => {
  const jdKeywords = extractKeywordsFromJd(jobDescription);
  
  if (jdKeywords.length === 0) {
    return {
      score: 100,
      matchedKeywords: cv.skills || [],
      missingKeywords: [],
      totalJdKeywords: 0,
      matchRatio: '0/0',
      tailoringSuggestions: []
    };
  }

  // Aggregate all CV text for search
  const searchableCvText = [
    cv.fullName,
    cv.headline,
    cv.professionalSummary,
    ...(cv.skills || []),
    ...(cv.workExperience || []).map(w => `${w.jobTitle} ${w.companyName} ${w.responsibilities}`),
    ...(cv.education || []).map(e => `${e.qualificationName} ${e.institution} ${(e.tertiaryModules || []).map(m => m.moduleName).join(' ')}`),
    ...(cv.languages || []).map(l => l.name)
  ].filter(Boolean).join(' ').toLowerCase();

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  // Match each keyword
  jdKeywords.forEach(kw => {
    const lowerKw = kw.toLowerCase();
    // Direct or boundary match
    const inSkills = (cv.skills || []).some(s => s.toLowerCase() === lowerKw || s.toLowerCase().includes(lowerKw) || lowerKw.includes(s.toLowerCase()));
    const inText = searchableCvText.includes(lowerKw);

    if (inSkills || inText) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const totalJdKeywords = jdKeywords.length;
  const matchRatio = `${matchedKeywords.length}/${totalJdKeywords}`;
  const rawScore = totalJdKeywords > 0 ? Math.round((matchedKeywords.length / totalJdKeywords) * 100) : 100;
  const score = Math.min(100, Math.max(0, rawScore));

  // Generate actionable tailoring suggestions
  const tailoringSuggestions: NonNullable<AtsAuditResult['jdMatch']>['tailoringSuggestions'] = [];

  // 1-Click Skills suggestions for the top missing keywords
  missingKeywords.slice(0, 5).forEach((missingKw) => {
    tailoringSuggestions.push({
      id: `add-jd-skill-${missingKw.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      category: 'skill',
      title: `Add Target Skill: "${missingKw}"`,
      description: `The job description requires "${missingKw}". Adding this keyword directly to your Core Skills boosts your candidate match rating.`,
      suggestedSkill: missingKw,
      fixAction: `add_skill_${missingKw}`
    });
  });

  // Summary alignment suggestion
  if (missingKeywords.length > 0) {
    const topKeywordsSample = missingKeywords.slice(0, 3).join(', ');
    tailoringSuggestions.push({
      id: 'tailor-summary-keywords',
      category: 'summary',
      title: 'Weave Target Keywords into Executive Summary',
      description: `Consider mentioning experience or familiarity with ${topKeywordsSample} in your opening professional summary to immediately satisfy ATS search parsers.`,
      fixAction: 'generate_summary'
    });
  }

  // Experience bullet tip
  if (missingKeywords.length > 2) {
    tailoringSuggestions.push({
      id: 'tailor-experience-bullets',
      category: 'experience',
      title: 'Incorporate Missing Tooling in Job Experience',
      description: `Demonstrate real-world application of ${missingKeywords[0]} and ${missingKeywords[1]} in your most recent career experience bullets.`,
      fixAction: 'polish_verbs'
    });
  }

  // Detect potential target role title from JD
  const lines = jobDescription.split('\n').map(l => l.trim()).filter(Boolean);
  const possibleTitle = lines.find(l => 
    /engineer|developer|architect|lead|manager|analyst|specialist|consultant/i.test(l) && l.length < 60
  );

  return {
    score,
    targetTitle: possibleTitle,
    matchedKeywords,
    missingKeywords,
    totalJdKeywords,
    matchRatio,
    tailoringSuggestions
  };
};

/**
 * Audits a South African CV against ATS parsers, best practices, and optionally a target Job Description.
 */
export const auditCvAts = (
  cv: SouthAfricanCvData,
  targetJobDescription?: string
): AtsAuditResult => {
  // Support both function argument and optional property on cv data object
  const jdToAnalyze = targetJobDescription || (cv as any).targetJobDescription || '';

  let score = 0;
  const recommendations: AtsAuditResult['recommendations'] = [];

  // 1. Contact Completeness (15 pts)
  let contactScore = 0;
  if (cv.fullName && cv.fullName.trim().length > 2) contactScore += 4;
  if (cv.emailAddress && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cv.emailAddress)) contactScore += 4;
  if (cv.cellNumber && cv.cellNumber.length >= 8) contactScore += 4;
  if (cv.currentLocation && cv.currentLocation.length > 3) contactScore += 3;
  
  if (contactScore < 15) {
    recommendations.push({
      id: 'fix-contact',
      type: 'critical',
      title: 'Incomplete Contact Details',
      description: 'Ensure full name, email, phone number, and location are fully specified for ATS candidate matching.',
      fixAction: 'fill_contact'
    });
  }

  // 2. Professional Summary (20 pts)
  let summaryScore = 0;
  const summaryLength = cv.professionalSummary ? cv.professionalSummary.trim().length : 0;
  if (summaryLength > 150) summaryScore = 20;
  else if (summaryLength > 60) summaryScore = 12;
  else if (summaryLength > 0) summaryScore = 6;
  else {
    recommendations.push({
      id: 'fix-summary',
      type: 'critical',
      title: 'Missing Professional Summary',
      description: 'Add a 3-4 sentence summary showcasing years of experience, core domains, and quantifiable highlights.',
      fixAction: 'generate_summary'
    });
  }

  // 3. Work Experience & Impact (25 pts)
  let experienceScore = 0;
  let actionVerbsFound = 0;
  let metricsFound = 0;

  if (Array.isArray(cv.workExperience) && cv.workExperience.length > 0) {
    experienceScore += 10;
    if (cv.workExperience.length >= 2) experienceScore += 5;

    const allExpText = cv.workExperience.map(e => `${e.responsibilities} ${e.jobTitle}`).join(' ').toLowerCase();

    // Check action verbs
    ACTION_VERBS.forEach(verb => {
      if (allExpText.includes(verb)) actionVerbsFound++;
    });

    if (actionVerbsFound >= 3) experienceScore += 5;
    else {
      recommendations.push({
        id: 'fix-action-verbs',
        type: 'warning',
        title: 'Low Action Verb Density',
        description: 'Start bullet points with strong verbs (e.g., "Spearheaded", "Engineered", "Optimized") instead of passive phrases.',
        fixAction: 'polish_verbs'
      });
    }

    // Check quantifiable metrics (% or $ or R or numbers)
    const metricMatches = allExpText.match(/(\d+%\s*|\$\d+|r\d+|\d+\+|\d+k|\d+m|reduced|increased|scaled|optimized)/gi);
    metricsFound = metricMatches ? metricMatches.length : 0;

    if (metricsFound >= 2) experienceScore += 5;
    else {
      recommendations.push({
        id: 'fix-metrics',
        type: 'enhancement',
        title: 'Include Quantifiable Impact',
        description: 'Include measurable results (e.g., "reduced latency by 30%", "saved $50k", "scaled to 100k users").',
        fixAction: 'add_metrics'
      });
    }
  } else {
    recommendations.push({
      id: 'fix-experience',
      type: 'critical',
      title: 'No Work Experience Listed',
      description: 'Add at least one professional or project experience role with bulleted duties.',
      fixAction: 'add_experience'
    });
  }

  // 4. Skills Density (20 pts)
  let skillsScore = 0;
  const skillCount = Array.isArray(cv.skills) ? cv.skills.length : 0;
  if (skillCount >= 8) skillsScore = 20;
  else if (skillCount >= 5) skillsScore = 14;
  else if (skillCount >= 2) skillsScore = 8;
  else {
    recommendations.push({
      id: 'fix-skills',
      type: 'warning',
      title: 'Low Skill Count',
      description: 'ATS parsers look for at least 8-12 domain and technical skills to match against job descriptions.',
      fixAction: 'suggest_skills'
    });
  }

  // 5. Education (10 pts)
  let educationScore = 0;
  if (Array.isArray(cv.education) && cv.education.length > 0) {
    educationScore = 10;
  } else if (cv.isMatricHighest && cv.matricSubjects && cv.matricSubjects.length > 0) {
    educationScore = 10;
  } else {
    recommendations.push({
      id: 'fix-education',
      type: 'warning',
      title: 'Missing Education History',
      description: 'Add tertiary qualifications or Matric results to pass education prerequisite filters.',
      fixAction: 'add_education'
    });
  }

  // 6. South African EE / Compliance (10 pts)
  let eeScore = 0;
  if (cv.isInternational) {
    eeScore = 10; // international mode satisfies compliance
  } else {
    if (cv.useIdNumber ? cv.idNumber : cv.passportNumber) eeScore += 5;
    if (cv.demographics && cv.gender) eeScore += 5;
  }

  // 7. Optional JD Match Analysis
  let jdAnalysis: AtsAuditResult['jdMatch'] | undefined = undefined;
  let missingKeywordsList: string[] = ['System Architecture', 'Agile Delivery', 'Cross-Functional Collaboration'];

  if (jdToAnalyze && jdToAnalyze.trim().length > 20) {
    jdAnalysis = matchCvToJobDescription(cv, jdToAnalyze);
    
    // When JD is present, surface true missing keywords
    if (jdAnalysis.missingKeywords.length > 0) {
      missingKeywordsList = jdAnalysis.missingKeywords.slice(0, 8);
    }

    // Add JD tailoring recommendations directly into recommendations list for 1-click action
    jdAnalysis.tailoringSuggestions.forEach(ts => {
      recommendations.unshift({
        id: ts.id,
        type: ts.category === 'skill' ? 'warning' : 'enhancement',
        title: ts.title,
        description: ts.description,
        fixAction: ts.fixAction
      });
    });
  }

  score = contactScore + summaryScore + experienceScore + skillsScore + educationScore + eeScore;
  if (score > 100) score = 100;

  const grade: AtsAuditResult['grade'] =
    score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';

  const breakdown: AtsAuditResult['breakdown'] = {
    contactInfo: { score: contactScore, max: 15, label: 'Contact Completeness', passed: contactScore >= 12 },
    professionalSummary: { score: summaryScore, max: 20, label: 'Executive Summary', passed: summaryScore >= 16 },
    workExperience: { score: experienceScore, max: 25, label: 'Work History & Impact', passed: experienceScore >= 20 },
    skillsDensity: { score: skillsScore, max: 20, label: 'Skill Keyword Density', passed: skillsScore >= 15 },
    educationHistory: { score: educationScore, max: 10, label: 'Education & Credentials', passed: educationScore >= 10 },
    eeCompliance: { score: eeScore, max: 10, label: 'Demographics & ID Compliance', passed: eeScore >= 10 }
  };

  // If JD is analyzed, also expose jdMatch breakdown
  if (jdAnalysis) {
    const jdPassed = jdAnalysis.score >= 70;
    breakdown.jdMatch = {
      score: Math.round((jdAnalysis.score / 100) * 20),
      max: 20,
      label: `Job Match (${jdAnalysis.matchRatio})`,
      passed: jdPassed,
      tip: `${jdAnalysis.score}% keyword overlap with target job description`
    };
  }

  return {
    score,
    grade,
    breakdown,
    metricsCount: metricsFound,
    actionVerbsCount: actionVerbsFound,
    identifiedKeywords: cv.skills || [],
    missingKeywords: missingKeywordsList,
    targetJobDescription: jdToAnalyze,
    jdMatch: jdAnalysis,
    recommendations
  };
};

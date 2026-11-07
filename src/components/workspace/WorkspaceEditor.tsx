import React, { useState } from 'react';
import { BillingHubEditor } from './BillingHubEditor';
import { 
  AnyDocumentData, 
  SouthAfricanCvData, 
  InvoiceData, 
  CoverLetterData, 
  QuotationData, 
  NdaData, 
  ResignationData, 
  FreelanceContractData, 
  OfficialNoticeData, 
  CertificateData, 
  ReceiptData,
  JobExperience,
  EducationQualification,
  TertiaryModule,
  MatricSubject,
  ReferenceContact,
  InvoiceItem,
  QuotationItem,
  ContractMilestone,
  LanguageProficiency,
  UnifiedBillingData
} from '../../types/document';
import { skillCatalogMap } from '../../data/skillCatalog';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Wand2, 
  Shield, 
  User, 
  Briefcase, 
  GraduationCap, 
  Layers, 
  Award, 
  DollarSign, 
  Building, 
  CreditCard, 
  FileText, 
  HelpCircle,
  Zap,
  CheckCircle2,
  Globe,
  Languages as LanguagesIcon,
  Target,
  Sliders,
  ExternalLink,
  Linkedin
} from 'lucide-react';
import { matchCvToJobDescription } from '../../services/ai/atsEngine';
import { 
  polishProfessionalSummary, 
  polishJobResponsibilities, 
  quantifyImpactBullets,
  generateTailoredSummary,
  polishCoverLetterParagraphs 
} from '../../services/ai/textPolisher';

const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface WorkspaceEditorProps {
  toolId: string;
  data: AnyDocumentData;
  onChange: (newData: AnyDocumentData) => void;
  editorMode: 'wizard' | 'pro';
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const WorkspaceEditor: React.FC<WorkspaceEditorProps> = ({
  toolId,
  data,
  onChange,
  editorMode,
  onShowToast
}) => {
  // Accordion open/close state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    jdMatcher: true,
    experience: true,
    languages: true,
    education: false,
    skills: true,
    references: false,
    invoiceSender: true,
    invoiceClient: true,
    invoiceItems: true,
    invoiceBank: false,
    letterSender: true,
    letterRecipient: true,
    letterBody: true,
    quoteProvider: true,
    quoteClient: true,
    quoteItems: true,
    ndaParties: true,
    ndaTerms: true,
    resignationDetails: true,
    contractScope: true,
    contractMilestones: true,
    noticeDetails: true,
    certDetails: true,
    receiptDetails: true
  });

  // Wizard active step
  const [wizardStep, setWizardStep] = useState(0);

  // Skill category selector
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>("Software Engineering & Web");
  const [customSkillInput, setCustomSkillInput] = useState<string>("");

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper for updating fields
  const updateField = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // -------------------------------------------------------------
  // 1. CV BUILDER FORM (Tool ID = 1)
  // -------------------------------------------------------------
  if (toolId === '1') {
    const cv = data as SouthAfricanCvData;

    const addExperience = () => {
      const newExp: JobExperience = {
        id: `exp-${Date.now()}`,
        jobTitle: "Software Developer",
        companyName: "Tech Company",
        location: "Johannesburg, Gauteng",
        startDate: "01/2023",
        endDate: "Present",
        responsibilities: "• Developed core features and microservices.\n• Collaborated in cross-functional Agile sprints."
      };
      updateField('workExperience', [newExp, ...(cv.workExperience || [])]);
    };

    const removeExperience = (id: string) => {
      updateField('workExperience', (cv.workExperience || []).filter(e => e.id !== id));
    };

    const updateExperience = (id: string, key: keyof JobExperience, val: string) => {
      const updated = (cv.workExperience || []).map(e => e.id === id ? { ...e, [key]: val } : e);
      updateField('workExperience', updated);
    };

    const addEducation = () => {
      const newEdu: EducationQualification = {
        id: `edu-${Date.now()}`,
        qualificationName: "Bachelor of Science in Information Technology",
        institution: "University of South Africa (UNISA)",
        yearCompleted: "2022",
        status: "Completed"
      };
      updateField('education', [...(cv.education || []), newEdu]);
    };

    const removeEducation = (id: string) => {
      updateField('education', (cv.education || []).filter(e => e.id !== id));
    };

    const addSkill = (skillName: string) => {
      if (!skillName.trim()) return;
      if (!(cv.skills || []).includes(skillName.trim())) {
        updateField('skills', [...(cv.skills || []), skillName.trim()]);
      }
      setCustomSkillInput("");
    };

    const removeSkill = (skillName: string) => {
      updateField('skills', (cv.skills || []).filter(s => s !== skillName));
    };

    const addReference = () => {
      const newRef: ReferenceContact = {
        id: `ref-${Date.now()}`,
        referenceName: "John Doe",
        companyTitle: "Engineering Manager",
        contactEmail: "manager@example.com",
        contactPhone: "+27 82 000 0000",
        relationship: "Direct Manager"
      };
      updateField('references', [...(cv.references || []), newRef]);
    };

    const removeReference = (id: string) => {
      updateField('references', (cv.references || []).filter(r => r.id !== id));
    };

    const handleAutoPolishSummary = () => {
      const polished = polishProfessionalSummary({ role: cv.headline || "Software Engineer" });
      updateField('professionalSummary', polished);
      onShowToast("Professional Summary polished with executive phrasing!", "success");
    };

    const handleAutoPolishJob = (jobId: string, title: string, existingText?: string) => {
      const polishedBullets = existingText && existingText.trim().length > 10
        ? quantifyImpactBullets(existingText, title)
        : polishJobResponsibilities(title, existingText);
      updateExperience(jobId, 'responsibilities', polishedBullets);
      onShowToast("Responsibilities rewritten with action verbs & metric impact!", "success");
    };

    const handleAutoFix = (action: string) => {
      if (action.startsWith('add_skill_')) {
        const skillName = action.replace('add_skill_', '').trim();
        if (skillName) {
          addSkill(skillName);
          onShowToast(`Added missing ATS keyword: "${skillName}"!`, "success");
        }
      } else if (action === 'polish_verbs') {
        const updatedExp = (cv.workExperience || []).map(exp => ({
          ...exp,
          responsibilities: quantifyImpactBullets(exp.responsibilities, exp.jobTitle)
        }));
        updateField('workExperience', updatedExp);
        onShowToast("Work experience bullets quantified with power action verbs!", "success");
      } else if (action === 'generate_summary') {
        const tailored = generateTailoredSummary({
          roleTitle: cv.headline || "Software Engineer",
          targetJobDescription: cv.targetJobDescription,
          skills: cv.skills
        });
        updateField('professionalSummary', tailored);
        onShowToast("Generated ATS-optimized summary aligned with target role!", "success");
      } else if (action === 'suggest_skills') {
        const newSkills = Array.from(new Set([...(cv.skills || []), "TypeScript", "React", "Next.js", "Docker", "PostgreSQL", "CI/CD", "Agile Delivery"]));
        updateField('skills', newSkills);
        onShowToast("Added high-demand technical skill keywords!", "success");
      }
    };

    return (
      <div className="space-y-4 text-xs">
        
        {/* Section 1: Personal & EE Details */}
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection('personal')}
            className="w-full px-4 py-3.5 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors text-left font-bold text-white text-sm"
          >
            <div className="flex items-center gap-2">
              <User size={16} className="text-indigo-400" />
              <span>Personal & Employment Equity (EE) Details</span>
            </div>
            {openSections.personal ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.personal && (
            <div className="p-4 space-y-4 border-t border-white/5">
              {/* Page Density Selector */}
              <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold flex items-center gap-1.5 text-xs">
                    <Sliders size={14} className="text-indigo-400" />
                    <span>Page Density / Layout Spacing</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {cv.density === 'compact' ? 'Fit 1-Page A4' : cv.density === 'spacious' ? 'Spacious A4' : 'Standard A4'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'compact', label: 'Compact', desc: 'Fit 1-Page A4' },
                    { id: 'standard', label: 'Standard', desc: 'Balanced Spacing' },
                    { id: 'spacious', label: 'Spacious', desc: 'Executive Layout' }
                  ].map((dOption) => {
                    const active = (cv.density || 'standard') === dOption.id;
                    return (
                      <button
                        key={dOption.id}
                        type="button"
                        onClick={() => updateField('density', dOption.id)}
                        className={`px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                          active 
                            ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold shadow-xs' 
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <div className="text-[11px] font-semibold">{dOption.label}</div>
                        <div className="text-[9px] text-slate-400 leading-tight">{dOption.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    value={cv.fullName || ""}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    placeholder="e.g. Lindiwe Nomvula Dlamini"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Professional Headline / Title</label>
                  <input
                    type="text"
                    value={cv.headline || ""}
                    onChange={(e) => updateField('headline', e.target.value)}
                    placeholder="e.g. Senior Full-Stack Cloud Engineer"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={cv.emailAddress || ""}
                    onChange={(e) => updateField('emailAddress', e.target.value)}
                    placeholder="name@example.co.za"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Cell Number *</label>
                  <input
                    type="text"
                    value={cv.cellNumber || ""}
                    onChange={(e) => updateField('cellNumber', e.target.value)}
                    placeholder="+27 82 123 4567"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Current Location (City, Prov)</label>
                  <input
                    type="text"
                    value={cv.currentLocation || ""}
                    onChange={(e) => updateField('currentLocation', e.target.value)}
                    placeholder="Sandton, Gauteng"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Online Profiles & Repositories */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <Linkedin size={12} className="text-sky-400" />
                    <span>LinkedIn Profile</span>
                  </label>
                  <input
                    type="text"
                    value={cv.linkedInUrl || ""}
                    onChange={(e) => updateField('linkedInUrl', e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <GithubIcon size={12} className="text-slate-300" />
                    <span>GitHub Profile URL</span>
                  </label>
                  <input
                    type="text"
                    value={cv.githubUrl || ""}
                    onChange={(e) => updateField('githubUrl', e.target.value)}
                    placeholder="github.com/username"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <Globe size={12} className="text-emerald-400" />
                    <span>Portfolio / Platform URL</span>
                  </label>
                  <input
                    type="text"
                    value={cv.portfolioUrl || ""}
                    onChange={(e) => updateField('portfolioUrl', e.target.value)}
                    placeholder="portfolio.co.za or demo app"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* SA ID / EE Section */}
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Shield size={14} className="text-indigo-400" />
                    South African Compliance & Demographics
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer text-slate-400">
                      <input
                        type="checkbox"
                        checked={cv.isInternational || false}
                        onChange={(e) => updateField('isInternational', e.target.checked)}
                        className="rounded"
                      />
                      <span>International Mode (Hide EE/ID)</span>
                    </label>
                  </div>
                </div>

                {!cv.isInternational && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">SA ID Number (13 Digits)</label>
                      <input
                        type="text"
                        value={cv.idNumber || ""}
                        onChange={(e) => updateField('idNumber', e.target.value)}
                        placeholder="9204125890087"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">EE Demographic</label>
                      <select
                        value={cv.demographics || "African"}
                        onChange={(e) => updateField('demographics', e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                      >
                        <option value="African">African</option>
                        <option value="Coloured">Coloured</option>
                        <option value="Indian">Indian</option>
                        <option value="White">White</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Gender</label>
                      <select
                        value={cv.gender || "Female"}
                        onChange={(e) => updateField('gender', e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Non-Binary">Non-Binary</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Driver's License</label>
                      <input
                        type="text"
                        value={cv.driversLicense || "Code 08 (EB)"}
                        onChange={(e) => updateField('driversLicense', e.target.value)}
                        placeholder="Code 08 (EB)"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Professional Summary */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-bold">Executive Professional Summary</label>
                  <button
                    type="button"
                    onClick={handleAutoPolishSummary}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-md font-semibold text-[11px] transition-colors"
                  >
                    <Sparkles size={12} />
                    <span>AI Polish Summary</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={cv.professionalSummary || ""}
                  onChange={(e) => updateField('professionalSummary', e.target.value)}
                  placeholder="2-4 sentences highlighting years of experience, core domains, and achievements..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section: Target Job Description (JD) Matcher & Keyword Tailor */}
        {(() => {
          const jdText = cv.targetJobDescription || '';
          const jdAnalysis = matchCvToJobDescription(cv, jdText);
          const hasJd = jdText.trim().length > 15;

          const handleTailorSummary = () => {
            const tailored = generateTailoredSummary({
              roleTitle: cv.headline || "Software Engineer",
              targetJobDescription: cv.targetJobDescription,
              skills: cv.skills,
              location: cv.currentLocation
            });
            updateField('professionalSummary', tailored);
            onShowToast("Professional Summary tailored to match Target Job keywords!", "success");
          };

          return (
            <div className="bg-[#0E1118] border border-indigo-500/30 rounded-2xl overflow-hidden shadow-xs">
              <button
                onClick={() => toggleSection('jdMatcher')}
                className="w-full px-4 py-3.5 flex items-center justify-between bg-indigo-950/30 hover:bg-indigo-950/50 transition-colors text-left font-bold text-white text-sm"
              >
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-indigo-400" />
                  <span>Target Job Description (JD) Matcher & Keyword Tailor</span>
                  {hasJd && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      jdAnalysis.score >= 80 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                      jdAnalysis.score >= 60 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {jdAnalysis.score}% Match ({jdAnalysis.matchRatio})
                    </span>
                  )}
                </div>
                {openSections.jdMatcher ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {openSections.jdMatcher && (
                <div className="p-4 space-y-4 border-t border-indigo-500/20 bg-indigo-950/10">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-300 font-bold flex items-center gap-1.5">
                        <span>Target Job Posting Description (JD)</span>
                      </label>
                      {hasJd && (
                        <button
                          type="button"
                          onClick={handleTailorSummary}
                          className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold px-3 py-1 rounded-lg text-xs shadow-xs transition-all"
                        >
                          <Sparkles size={12} />
                          <span>Tailor Summary to JD</span>
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={4}
                      value={cv.targetJobDescription || ""}
                      onChange={(e) => updateField('targetJobDescription', e.target.value)}
                      placeholder="Paste the target job description or requirements here to analyze ATS keyword match and tailor your CV..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 text-xs leading-relaxed resize-none"
                    />
                  </div>

                  {hasJd && (
                    <div className="space-y-3 pt-1">
                      {/* Score meter & match ratio */}
                      <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/10">
                        <div className="space-y-0.5">
                          <div className="text-[11px] font-bold text-slate-300">Live ATS Match Score</div>
                          <div className="text-[10px] text-slate-400">
                            {jdAnalysis.matchedKeywords.length} of {jdAnalysis.totalJdKeywords} key requirements identified in your CV
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`text-xl font-mono font-black ${
                            jdAnalysis.score >= 80 ? 'text-emerald-400' :
                            jdAnalysis.score >= 60 ? 'text-indigo-400' : 'text-amber-400'
                          }`}>
                            {jdAnalysis.score}%
                          </div>
                        </div>
                      </div>

                      {/* Matched Keywords */}
                      {jdAnalysis.matchedKeywords.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            <span>Matched Keywords ({jdAnalysis.matchedKeywords.length})</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {jdAnalysis.matchedKeywords.map((kw, i) => (
                              <span key={i} className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1">
                                <span>✓</span>
                                <span>{kw}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Keywords - 1-Click Add */}
                      {jdAnalysis.missingKeywords.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                              <Zap size={11} />
                              <span>Missing Keywords ({jdAnalysis.missingKeywords.length})</span>
                            </span>
                            <span className="text-[9px] text-slate-400">Click a keyword to add to your skills</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {jdAnalysis.missingKeywords.map((kw, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  addSkill(kw);
                                  onShowToast(`Added "${kw}" to skills!`, "success");
                                }}
                                className="bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 hover:text-white px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-all"
                                title="Click to add to your skills list"
                              >
                                <Plus size={10} />
                                <span>{kw}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Section 2: Career Experience */}
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection('experience')}
            className="w-full px-4 py-3.5 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors text-left font-bold text-white text-sm"
          >
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-indigo-400" />
              <span>Career Experience ({cv.workExperience?.length || 0})</span>
            </div>
            {openSections.experience ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.experience && (
            <div className="p-4 space-y-4 border-t border-white/5">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addExperience}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
                >
                  <Plus size={14} />
                  <span>Add Role</span>
                </button>
              </div>

              {cv.workExperience?.map((exp, idx) => (
                <div key={exp.id} className="p-3.5 bg-black/30 rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-400 font-bold text-[11px]">ROLE #{idx + 1}</span>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="Remove Role"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-400 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={exp.jobTitle}
                        onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)}
                        placeholder="e.g. Lead Frontend Developer"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={exp.companyName}
                        onChange={(e) => updateExperience(exp.id, 'companyName', e.target.value)}
                        placeholder="e.g. Zenith Digital Financial Services"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-slate-400 mb-1">Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                        placeholder="Johannesburg, Gauteng"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        placeholder="02/2022"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">End Date</label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        placeholder="Present"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-400 font-medium">Responsibilities & Quantifiable Achievements</label>
                      <button
                        type="button"
                        onClick={() => handleAutoPolishJob(exp.id, exp.jobTitle, exp.responsibilities)}
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30 transition-colors"
                      >
                        <Sparkles size={11} />
                        <span>Quantify & Polish Bullets</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={exp.responsibilities}
                      onChange={(e) => updateExperience(exp.id, 'responsibilities', e.target.value)}
                      placeholder="• Spearheaded...&#10;• Engineered...&#10;• Reduced latency by 30%..."
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white font-sans leading-relaxed resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Core Skills & Competencies */}
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection('skills')}
            className="w-full px-4 py-3.5 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors text-left font-bold text-white text-sm"
          >
            <div className="flex items-center gap-2">
              <Award size={16} className="text-indigo-400" />
              <span>Core Skills & Competencies ({cv.skills?.length || 0})</span>
            </div>
            {openSections.skills ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.skills && (
            <div className="p-4 space-y-4 border-t border-white/5">
              {/* Active Skill Chips */}
              <div className="flex flex-wrap gap-1.5">
                {cv.skills?.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(skill)}
                      className="hover:text-rose-400 text-slate-400"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Skill */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addSkill(customSkillInput); }}
                  placeholder="Type a skill (e.g. Next.js, Docker, Scrum) and hit Add..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => addSkill(customSkillInput)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Industry Skill Suggestions Catalog */}
              <div className="pt-3 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    1-Click Suggested Skills
                  </span>
                  <select
                    value={selectedSkillCategory}
                    onChange={(e) => setSelectedSkillCategory(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white"
                  >
                    {Object.keys(skillCatalogMap).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skillCatalogMap[selectedSkillCategory]?.map((sName) => {
                    const isAdded = (cv.skills || []).includes(sName);
                    return (
                      <button
                        key={sName}
                        type="button"
                        onClick={() => isAdded ? removeSkill(sName) : addSkill(sName)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          isAdded
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:border-indigo-400/50 hover:text-white'
                        }`}
                      >
                        {isAdded ? `✓ ${sName}` : `+ ${sName}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Languages Spoken & Written */}
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection('languages')}
            className="w-full px-4 py-3.5 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors text-left font-bold text-white text-sm"
          >
            <div className="flex items-center gap-2">
              <LanguagesIcon size={16} className="text-indigo-400" />
              <span>Languages Spoken & Written ({cv.languages?.length || 0})</span>
            </div>
            {openSections.languages ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.languages && (
            <div className="p-4 space-y-4 border-t border-white/5">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const newLang: LanguageProficiency = {
                      name: "isiZulu",
                      speakProficiency: "Fluent",
                      writeProficiency: "Fluent"
                    };
                    updateField('languages', [...(cv.languages || []), newLang]);
                  }}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
                >
                  <Plus size={14} />
                  <span>Add Language</span>
                </button>
              </div>

              {(cv.languages || []).map((lang, lIdx) => (
                <div key={lIdx} className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-xs">{lang.name || `Language #${lIdx + 1}`}</span>
                    <button
                      onClick={() => {
                        const updated = (cv.languages || []).filter((_, i) => i !== lIdx);
                        updateField('languages', updated);
                      }}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="Remove Language"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">Language Name</label>
                      <input
                        type="text"
                        value={lang.name || ""}
                        onChange={(e) => {
                          const updated = [...(cv.languages || [])];
                          updated[lIdx] = { ...updated[lIdx], name: e.target.value };
                          updateField('languages', updated);
                        }}
                        placeholder="e.g. English, isiZulu, Afrikaans"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">Spoken Proficiency</label>
                      <select
                        value={lang.speakProficiency || "Fluent"}
                        onChange={(e) => {
                          const updated = [...(cv.languages || [])];
                          updated[lIdx] = { ...updated[lIdx], speakProficiency: e.target.value };
                          updateField('languages', updated);
                        }}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                      >
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Conversational">Conversational</option>
                        <option value="Basic">Basic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 text-[11px]">Written Proficiency</label>
                      <select
                        value={lang.writeProficiency || "Fluent"}
                        onChange={(e) => {
                          const updated = [...(cv.languages || [])];
                          updated[lIdx] = { ...updated[lIdx], writeProficiency: e.target.value };
                          updateField('languages', updated);
                        }}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                      >
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Conversational">Conversational</option>
                        <option value="Basic">Basic</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Education & Qualifications */}
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection('education')}
            className="w-full px-4 py-3.5 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors text-left font-bold text-white text-sm"
          >
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-indigo-400" />
              <span>Education & Qualifications ({cv.education?.length || 0})</span>
            </div>
            {openSections.education ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.education && (
            <div className="p-4 space-y-4 border-t border-white/5">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addEducation}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
                >
                  <Plus size={14} />
                  <span>Add Degree/Diploma</span>
                </button>
              </div>

              {cv.education?.map((edu) => (
                <div key={edu.id} className="p-3.5 bg-black/30 rounded-xl border border-white/5 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-xs">{edu.qualificationName || "Qualification"}</span>
                    <button onClick={() => removeEducation(edu.id)} className="text-rose-400 hover:text-rose-300">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={edu.qualificationName}
                        onChange={(e) => {
                          const updated = cv.education?.map(x => x.id === edu.id ? { ...x, qualificationName: e.target.value } : x);
                          updateField('education', updated);
                        }}
                        placeholder="Qualification Title"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={edu.yearCompleted}
                        onChange={(e) => {
                          const updated = cv.education?.map(x => x.id === edu.id ? { ...x, yearCompleted: e.target.value } : x);
                          updateField('education', updated);
                        }}
                        placeholder="Year (e.g. 2022)"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => {
                      const updated = cv.education?.map(x => x.id === edu.id ? { ...x, institution: e.target.value } : x);
                      updateField('education', updated);
                    }}
                    placeholder="Institution (e.g. University of the Witwatersrand)"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: References */}
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection('references')}
            className="w-full px-4 py-3.5 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors text-left font-bold text-white text-sm"
          >
            <div className="flex items-center gap-2">
              <User size={16} className="text-indigo-400" />
              <span>Professional References ({cv.references?.length || 0})</span>
            </div>
            {openSections.references ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.references && (
            <div className="p-4 space-y-4 border-t border-white/5">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addReference}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
                >
                  <Plus size={14} />
                  <span>Add Reference</span>
                </button>
              </div>

              {cv.references?.map((ref) => (
                <div key={ref.id} className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-xs">{ref.referenceName || "Reference Name"}</span>
                    <button onClick={() => removeReference(ref.id)} className="text-rose-400 hover:text-rose-300">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={ref.referenceName}
                      onChange={(e) => {
                        const updated = cv.references?.map(r => r.id === ref.id ? { ...r, referenceName: e.target.value } : r);
                        updateField('references', updated);
                      }}
                      placeholder="Reference Full Name"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      value={ref.companyTitle}
                      onChange={(e) => {
                        const updated = cv.references?.map(r => r.id === ref.id ? { ...r, companyTitle: e.target.value } : r);
                        updateField('references', updated);
                      }}
                      placeholder="Company & Role Title"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={ref.contactPhone}
                      onChange={(e) => {
                        const updated = cv.references?.map(r => r.id === ref.id ? { ...r, contactPhone: e.target.value } : r);
                        updateField('references', updated);
                      }}
                      placeholder="Phone Number"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                    <input
                      type="text"
                      value={ref.contactEmail}
                      onChange={(e) => {
                        const updated = cv.references?.map(r => r.id === ref.id ? { ...r, contactEmail: e.target.value } : r);
                        updateField('references', updated);
                      }}
                      placeholder="Email Address"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. UNIFIED COMMERCIAL BILLING HUB (Tool IDs: 2 = Invoices, 4 = Quotes, 10 = Receipts)
  // -------------------------------------------------------------
  if (toolId === '2' || toolId === '4' || toolId === '10') {
    return (
      <BillingHubEditor
        data={data as UnifiedBillingData}
        onChange={onChange}
        editorMode={editorMode}
        onShowToast={onShowToast}
      />
    );
  }

  // -------------------------------------------------------------
  // 3. COVER LETTER FORM (Tool ID = 3)
  // -------------------------------------------------------------
  if (toolId === '3') {
    const cl = data as CoverLetterData;

    const handleAutoGenerateLetter = () => {
      const paragraphs = polishCoverLetterParagraphs(
        cl.fullName || "Candidate",
        cl.jobTitle || "Software Engineer",
        cl.companyName || "Acme Corp",
        cl.currentLocation || "Johannesburg, South Africa",
        cl.tone || 'executive'
      );
      updateField('paragraphs', paragraphs);
      onShowToast(`Cover letter generated in ${cl.tone || 'executive'} tone!`, "success");
    };

    return (
      <div className="space-y-4 text-xs">
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-sm">Target Role & AI Tone</h3>
            <button
              onClick={handleAutoGenerateLetter}
              className="flex items-center gap-1 text-sky-400 bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 px-2.5 py-1 rounded-lg font-bold transition-colors"
            >
              <Sparkles size={13} />
              <span>AI Regenerate Letter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Applicant Full Name</label>
              <input
                type="text"
                value={cl.fullName || ""}
                onChange={(e) => updateField('fullName', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Target Job Title</label>
              <input
                type="text"
                value={cl.jobTitle || ""}
                onChange={(e) => updateField('jobTitle', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Target Company</label>
              <input
                type="text"
                value={cl.companyName || ""}
                onChange={(e) => updateField('companyName', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Hiring Manager Name</label>
              <input
                type="text"
                value={cl.recipientName || ""}
                onChange={(e) => updateField('recipientName', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Tone of Voice</label>
              <select
                value={cl.tone || 'executive'}
                onChange={(e) => updateField('tone', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
              >
                <option value="executive">Executive & Formal</option>
                <option value="confident">Confident & Direct</option>
                <option value="creative">Creative & Visionary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Letter Paragraphs */}
        <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 space-y-3">
          <h3 className="font-bold text-white text-sm">Cover Letter Paragraphs</h3>
          {cl.paragraphs?.map((p, pIdx) => (
            <div key={pIdx} className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400">Paragraph {pIdx + 1}</label>
              <textarea
                rows={3}
                value={p}
                onChange={(e) => {
                  const updated = [...cl.paragraphs];
                  updated[pIdx] = e.target.value;
                  updateField('paragraphs', updated);
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white leading-relaxed resize-none"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Default Generic Form Fallback for other tools (4 to 10)
  // -------------------------------------------------------------
  return (
    <div className="space-y-4 text-xs">
      <div className="bg-[#0E1118] border border-white/10 rounded-2xl p-4 space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <FileText size={16} className="text-indigo-400" />
          <span>Interactive Document Editor</span>
        </h3>

        <div className="space-y-3">
          {Object.entries(data).map(([k, v]) => {
            if (typeof v === 'string') {
              const isLong = v.length > 80 || k.toLowerCase().includes('plan') || k.toLowerCase().includes('scope') || k.toLowerCase().includes('terms');
              return (
                <div key={k}>
                  <label className="block text-slate-400 font-medium capitalize mb-1">
                    {k.replace(/([A-Z])/g, ' $1')}
                  </label>
                  {isLong ? (
                    <textarea
                      rows={3}
                      value={v}
                      onChange={(e) => updateField(k, e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white leading-relaxed resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={v}
                      onChange={(e) => updateField(k, e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

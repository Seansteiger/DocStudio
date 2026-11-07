import React from 'react';
import type { SouthAfricanCvData } from '../../types/document';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Globe, 
  Shield, 
  Award, 
  CheckCircle2, 
  Briefcase, 
  GraduationCap, 
  Languages, 
  ExternalLink,
  Calendar,
  Sparkles
} from 'lucide-react';

interface CvTemplateProps {
  data: SouthAfricanCvData;
  templateId?: string;
}

// Crisp, lightweight GitHub icon SVG component to guarantee 100% zero-import failure across all bundlers
const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = '' }) => (
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

// Helper to format URLs cleanly for display (stripping protocol and trailing slash)
const formatDisplayUrl = (url?: string): string => {
  if (!url) return '';
  return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
};

// Helper to get density classes
const getDensityConfig = (density: 'compact' | 'standard' | 'spacious' = 'standard') => {
  switch (density) {
    case 'compact':
      return {
        rootPadding: 'p-5 sm:p-6',
        fontSize: 'text-[8.5pt]',
        lineHeight: 'leading-snug',
        sectionSpacing: 'space-y-3.5',
        itemSpacing: 'space-y-2',
        subItemSpacing: 'space-y-1',
        headerMargin: 'mb-3',
        headerPadding: 'pb-2.5',
        cardPadding: 'p-2.5',
        chipPadding: 'px-1.5 py-0.5 text-[8pt]',
        iconSize: 11
      };
    case 'spacious':
      return {
        rootPadding: 'p-9 sm:p-12',
        fontSize: 'text-[10pt]',
        lineHeight: 'leading-relaxed',
        sectionSpacing: 'space-y-7',
        itemSpacing: 'space-y-5',
        subItemSpacing: 'space-y-2.5',
        headerMargin: 'mb-6',
        headerPadding: 'pb-5',
        cardPadding: 'p-4',
        chipPadding: 'px-3 py-1 text-[9pt]',
        iconSize: 13
      };
    case 'standard':
    default:
      return {
        rootPadding: 'p-7 sm:p-9',
        fontSize: 'text-[9.5pt]',
        lineHeight: 'leading-normal',
        sectionSpacing: 'space-y-5',
        itemSpacing: 'space-y-3.5',
        subItemSpacing: 'space-y-1.5',
        headerMargin: 'mb-4',
        headerPadding: 'pb-3.5',
        cardPadding: 'p-3',
        chipPadding: 'px-2.5 py-0.5 text-[8.5pt]',
        iconSize: 12
      };
  }
};

export const CvTemplates: React.FC<CvTemplateProps> = ({ data, templateId = 'modern-tech' }) => {
  const density = ((data as any).density || 'standard') as 'compact' | 'standard' | 'spacious';
  const densityCfg = getDensityConfig(density);

  // Extract optional social links cleanly
  const githubUrl = ((data as any).githubUrl || '').trim();
  const portfolioUrl = (data.portfolioUrl || '').trim();
  const linkedInUrl = (data.linkedInUrl || '').trim();

  // Valid languages with names
  const validLanguages = (data.languages || []).filter(l => l && l.name && l.name.trim().length > 0);

  // Style helper for preventing awkward page breaks
  const breakAvoidStyle = {
    breakInside: 'avoid' as const,
    pageBreakInside: 'avoid' as const
  };

  // =========================================================================
  // TEMPLATE 1: MINIMAL ATS (Clean Minimal - Single Column, Max Parseability)
  // =========================================================================
  if (templateId === 'minimal-ats') {
    return (
      <div className={`text-slate-900 font-sans ${densityCfg.rootPadding} ${densityCfg.fontSize} ${densityCfg.lineHeight}`}>
        {/* Header */}
        <div className={`text-center border-b border-slate-300 ${densityCfg.headerPadding} ${densityCfg.headerMargin}`}>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-slate-950 text-balance">
            {data.fullName || "Your Full Name"}
          </h1>
          {data.headline && (
            <p className="text-sm font-semibold text-slate-700 mt-1 uppercase tracking-wide">
              {data.headline}
            </p>
          )}

          {/* Contact Links Row - Only render non-empty fields */}
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-2.5 font-medium">
            {data.emailAddress && <span>{data.emailAddress}</span>}
            {data.cellNumber && (
              <>
                {data.emailAddress && <span className="text-slate-300">•</span>}
                <span className="tabular-nums">{data.cellNumber}</span>
              </>
            )}
            {data.currentLocation && (
              <>
                {(data.emailAddress || data.cellNumber) && <span className="text-slate-300">•</span>}
                <span>{data.currentLocation}</span>
              </>
            )}
            {linkedInUrl && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-800 font-semibold">{formatDisplayUrl(linkedInUrl)}</span>
              </>
            )}
            {githubUrl && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-800 font-semibold font-mono">{formatDisplayUrl(githubUrl)}</span>
              </>
            )}
            {portfolioUrl && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-800 font-semibold">{formatDisplayUrl(portfolioUrl)}</span>
              </>
            )}
          </div>

          {/* SA Employment Equity & ID Compliance bar */}
          {!data.isInternational && (
            <div className="text-[9pt] text-slate-500 mt-2 font-mono tabular-nums">
              <span>{data.useIdNumber ? `SA ID: ${data.idNumber || 'Verified'}` : `Passport: ${data.passportNumber || 'N/A'}`}</span>
              {data.demographics && <span> | EE: {data.demographics} ({data.gender})</span>}
              {data.driversLicense && data.driversLicense !== 'None' && <span> | License: {data.driversLicense}</span>}
              {data.noticePeriod && <span> | Notice: {data.noticePeriod}</span>}
            </div>
          )}
        </div>

        <div className={densityCfg.sectionSpacing}>
          {/* Professional Summary */}
          {data.professionalSummary && (
            <section style={breakAvoidStyle} className="break-inside-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-slate-700 text-justify leading-relaxed text-pretty">
                {data.professionalSummary}
              </p>
            </section>
          )}

          {/* Core Competencies & Skills */}
          {data.skills && data.skills.length > 0 && (
            <section style={breakAvoidStyle} className="break-inside-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Core Competencies & Technical Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className={`bg-slate-100 text-slate-800 rounded font-medium border border-slate-200 ${densityCfg.chipPadding}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Work Experience */}
          {data.workExperience && data.workExperience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Professional Experience
              </h2>
              <div className={densityCfg.itemSpacing}>
                {data.workExperience.map((job) => (
                  <div key={job.id} style={breakAvoidStyle} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-950 text-[10pt]">{job.jobTitle}</span>
                      <span className="text-xs text-slate-600 font-mono tabular-nums">{job.startDate} – {job.endDate}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
                      <span>{job.companyName}</span>
                      <span className="text-slate-500">{job.location}</span>
                    </div>
                    <div className="text-slate-700 text-[9pt] whitespace-pre-line leading-relaxed pl-2.5 border-l-2 border-slate-200">
                      {job.responsibilities}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education & Qualifications */}
          {((data.education && data.education.length > 0) || (data.matricSubjects && data.matricSubjects.length > 0)) && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Education & Qualifications
              </h2>
              <div className={densityCfg.itemSpacing}>
                {data.education?.map((edu) => (
                  <div key={edu.id} style={breakAvoidStyle} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-950 text-[9.5pt]">{edu.qualificationName}</span>
                      <span className="text-xs text-slate-600 font-mono tabular-nums">{edu.yearCompleted}</span>
                    </div>
                    <div className="text-xs text-slate-700 mb-1">
                      {edu.institution} {edu.status && <span className="text-slate-500 font-medium">• {edu.status}</span>}
                    </div>
                    {edu.tertiaryModules && edu.tertiaryModules.length > 0 && (
                      <div className="grid grid-cols-2 gap-1 text-[8.5pt] bg-slate-50 p-2 rounded border border-slate-200 mt-1">
                        {edu.tertiaryModules.map((m, mi) => (
                          <div key={mi} className="flex justify-between">
                            <span className="text-slate-700 truncate pr-2">• {m.moduleName}</span>
                            <span className="font-mono font-semibold text-slate-900 tabular-nums">
                              {m.score}% {m.grade && `(${m.grade})`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {data.isMatricHighest && data.matricSubjects && data.matricSubjects.length > 0 && (
                  <div style={breakAvoidStyle} className="break-inside-avoid mt-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div className="font-bold text-xs text-slate-900 mb-1">National Senior Certificate (Matric) Results:</div>
                    <div className="grid grid-cols-2 gap-1.5 text-[8.5pt]">
                      {data.matricSubjects.map((sub, sidx) => (
                        <div key={sidx} className="flex justify-between text-slate-700">
                          <span>{sub.subjectName}</span>
                          <span className="font-mono font-bold text-slate-900 tabular-nums">{sub.score}% (L{sub.level})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Languages - Full parity */}
          {validLanguages.length > 0 && (
            <section style={breakAvoidStyle} className="break-inside-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Languages
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {validLanguages.map((lang, lidx) => (
                  <div key={lidx} className="bg-slate-50 p-2 rounded border border-slate-200 text-xs">
                    <div className="font-bold text-slate-900">{lang.name}</div>
                    <div className="text-[8.5pt] text-slate-600 mt-0.5">
                      Spoken: <span className="font-medium text-slate-800">{lang.speakProficiency || 'Fluent'}</span> | Written: <span className="font-medium text-slate-800">{lang.writeProficiency || 'Fluent'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* References */}
          {data.references && data.references.length > 0 && (
            <section style={breakAvoidStyle} className="break-inside-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Professional References
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[9pt]">
                {data.references.map((ref) => (
                  <div key={ref.id} style={breakAvoidStyle} className="break-inside-avoid bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div className="font-bold text-slate-900">{ref.referenceName}</div>
                    <div className="text-xs text-slate-600">{ref.companyTitle}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1 tabular-nums">{ref.contactPhone}</div>
                    <div className="text-xs text-slate-500">{ref.contactEmail}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // TEMPLATE 3: EXECUTIVE SA (Distinguished Corporate, Navy & Slate Palette)
  // =========================================================================
  if (templateId === 'executive-sa') {
    return (
      <div className={`text-slate-900 font-serif ${densityCfg.rootPadding} ${densityCfg.fontSize} ${densityCfg.lineHeight}`}>
        {/* Executive Header Banner */}
        <div className={`border-b-2 border-slate-900 ${densityCfg.headerPadding} ${densityCfg.headerMargin}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
            <div>
              <span className="text-[9pt] font-mono uppercase tracking-[0.2em] text-slate-500 font-semibold block mb-0.5">
                Curriculum Vitae
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950 font-serif text-balance">
                {data.fullName || "Lindiwe Nomvula Dlamini"}
              </h1>
              {data.headline && (
                <p className="text-xs sm:text-sm font-sans font-semibold text-slate-700 tracking-wide mt-1 uppercase">
                  {data.headline}
                </p>
              )}
            </div>

            {/* Contact Coordinates */}
            <div className="text-left sm:text-right font-sans text-xs text-slate-700 space-y-1">
              {data.emailAddress && (
                <div className="flex items-center sm:justify-end gap-1.5">
                  <Mail size={densityCfg.iconSize} className="text-slate-800 shrink-0" />
                  <span>{data.emailAddress}</span>
                </div>
              )}
              {data.cellNumber && (
                <div className="flex items-center sm:justify-end gap-1.5 tabular-nums">
                  <Phone size={densityCfg.iconSize} className="text-slate-800 shrink-0" />
                  <span>{data.cellNumber}</span>
                </div>
              )}
              {data.currentLocation && (
                <div className="flex items-center sm:justify-end gap-1.5">
                  <MapPin size={densityCfg.iconSize} className="text-slate-800 shrink-0" />
                  <span>{data.currentLocation}</span>
                </div>
              )}
              {linkedInUrl && (
                <div className="flex items-center sm:justify-end gap-1.5 font-medium">
                  <Linkedin size={densityCfg.iconSize} className="text-slate-800 shrink-0" />
                  <span>{formatDisplayUrl(linkedInUrl)}</span>
                </div>
              )}
              {githubUrl && (
                <div className="flex items-center sm:justify-end gap-1.5 font-mono">
                  <GithubIcon size={densityCfg.iconSize} className="text-slate-800 shrink-0" />
                  <span>{formatDisplayUrl(githubUrl)}</span>
                </div>
              )}
              {portfolioUrl && (
                <div className="flex items-center sm:justify-end gap-1.5 font-medium">
                  <Globe size={densityCfg.iconSize} className="text-slate-800 shrink-0" />
                  <span>{formatDisplayUrl(portfolioUrl)}</span>
                </div>
              )}
            </div>
          </div>

          {/* South African Statutory Compliance Strip */}
          {!data.isInternational && (
            <div className="mt-3 pt-2.5 border-t border-slate-200 font-sans flex flex-wrap items-center gap-x-4 gap-y-1 text-[8.5pt] text-slate-600 bg-slate-50/80 px-3 py-1.5 rounded">
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Shield size={12} className="text-slate-800" />
                {data.useIdNumber ? `SA ID: ${data.idNumber || 'Verified'}` : `Passport: ${data.passportNumber || 'N/A'}`}
              </span>
              <span>• EE Status: <strong className="text-slate-900">{data.demographics || 'African'} ({data.gender || 'Female'})</strong></span>
              {data.driversLicense && data.driversLicense !== 'None' && (
                <span>• Driver's License: <strong className="text-slate-900">{data.driversLicense}</strong></span>
              )}
              {data.noticePeriod && (
                <span>• Availability: <strong className="text-slate-900">{data.noticePeriod}</strong></span>
              )}
            </div>
          )}
        </div>

        {/* Content Flow */}
        <div className={`font-sans ${densityCfg.sectionSpacing}`}>
          {/* Executive Profile */}
          {data.professionalSummary && (
            <section style={breakAvoidStyle} className="break-inside-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 font-serif border-b border-slate-300 pb-1 mb-2">
                Executive Profile
              </h2>
              <p className="text-slate-800 text-[9.5pt] leading-relaxed text-justify text-pretty font-serif">
                {data.professionalSummary}
              </p>
            </section>
          )}

          {/* Core Areas of Expertise */}
          {data.skills && data.skills.length > 0 && (
            <section style={breakAvoidStyle} className="break-inside-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 font-serif border-b border-slate-300 pb-1 mb-2">
                Core Competencies & Strategic Domains
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {data.skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                    <span className="font-medium truncate">{skill}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Professional Experience */}
          {data.workExperience && data.workExperience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 font-serif border-b border-slate-300 pb-1 mb-2.5">
                Executive & Professional Experience
              </h2>
              <div className={densityCfg.itemSpacing}>
                {data.workExperience.map((job) => (
                  <div key={job.id} style={breakAvoidStyle} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-950 text-[10pt] font-serif">{job.jobTitle}</h3>
                      <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded tabular-nums">
                        {job.startDate} — {job.endDate}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-semibold mb-1">
                      <span>{job.companyName}</span> <span className="text-slate-400 font-normal">| {job.location}</span>
                    </div>
                    <div className="text-slate-750 text-[9pt] whitespace-pre-line leading-relaxed pl-3 border-l-2 border-slate-300">
                      {job.responsibilities}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education & Academic Credentials */}
          {data.education && data.education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 font-serif border-b border-slate-300 pb-1 mb-2.5">
                Academic Qualifications & Credentials
              </h2>
              <div className={densityCfg.itemSpacing}>
                {data.education.map((edu) => (
                  <div key={edu.id} style={breakAvoidStyle} className="break-inside-avoid bg-slate-50/90 p-3 rounded border border-slate-200">
                    <div className="flex justify-between items-baseline">
                      <div className="font-bold text-slate-950 text-[9.5pt] font-serif">{edu.qualificationName}</div>
                      <span className="text-xs font-mono text-slate-600 tabular-nums">{edu.yearCompleted}</span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium">
                      {edu.institution} {edu.status && <span className="text-slate-500">• {edu.status}</span>}
                    </div>

                    {edu.tertiaryModules && edu.tertiaryModules.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-1 text-[8.5pt]">
                        {edu.tertiaryModules.map((m, mi) => (
                          <div key={mi} className="flex justify-between text-slate-700">
                            <span className="truncate pr-1">• {m.moduleName}</span>
                            <span className="font-mono font-bold text-slate-900 tabular-nums">{m.score}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {validLanguages.length > 0 && (
            <section style={breakAvoidStyle} className="break-inside-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 font-serif border-b border-slate-300 pb-1 mb-2">
                Language Proficiencies
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {validLanguages.map((lang, lidx) => (
                  <div key={lidx} className="bg-slate-50 p-2 rounded border border-slate-200 text-xs">
                    <div className="font-bold text-slate-950">{lang.name}</div>
                    <div className="text-[8pt] text-slate-600 font-mono mt-0.5">
                      Spoken: {lang.speakProficiency} | Written: {lang.writeProficiency}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* References */}
          {data.references && data.references.length > 0 && (
            <section style={breakAvoidStyle} className="break-inside-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 font-serif border-b border-slate-300 pb-1 mb-2">
                Executive References
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {data.references.map((ref) => (
                  <div key={ref.id} style={breakAvoidStyle} className="break-inside-avoid bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div className="font-bold text-slate-950">{ref.referenceName}</div>
                    <div className="text-slate-600">{ref.companyTitle}</div>
                    <div className="text-slate-500 font-mono text-[8pt] mt-1 tabular-nums">{ref.contactPhone}</div>
                    <div className="text-slate-500 text-[8pt]">{ref.contactEmail}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // TEMPLATE 4: CREATIVE BOLD (Editorial Design, Amber / Bronze Accent, 90/10 Rule)
  // =========================================================================
  if (templateId === 'creative-bold') {
    return (
      <div className={`text-stone-900 font-sans ${densityCfg.rootPadding} ${densityCfg.fontSize} ${densityCfg.lineHeight}`}>
        {/* Creative Editorial Header */}
        <div className={`border-b-4 border-amber-600 ${densityCfg.headerPadding} ${densityCfg.headerMargin}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <span className="text-[8.5pt] font-mono uppercase tracking-[0.25em] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                Portfolio & Curriculum Vitae
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-950 uppercase text-balance">
                {data.fullName || "Lindiwe Nomvula Dlamini"}
              </h1>
              {data.headline && (
                <p className="text-xs sm:text-sm font-bold text-stone-700 tracking-wider uppercase">
                  {data.headline}
                </p>
              )}
            </div>

            {/* Micro Badge Contact Links */}
            <div className="flex flex-wrap sm:flex-col sm:items-end gap-1.5 text-xs">
              {data.emailAddress && (
                <div className="flex items-center gap-1.5 bg-stone-100 text-stone-800 px-2.5 py-1 rounded-full font-medium">
                  <Mail size={densityCfg.iconSize} className="text-amber-700 shrink-0" />
                  <span>{data.emailAddress}</span>
                </div>
              )}
              {data.cellNumber && (
                <div className="flex items-center gap-1.5 bg-stone-100 text-stone-800 px-2.5 py-1 rounded-full font-medium tabular-nums">
                  <Phone size={densityCfg.iconSize} className="text-amber-700 shrink-0" />
                  <span>{data.cellNumber}</span>
                </div>
              )}
              {data.currentLocation && (
                <div className="flex items-center gap-1.5 bg-stone-100 text-stone-800 px-2.5 py-1 rounded-full font-medium">
                  <MapPin size={densityCfg.iconSize} className="text-amber-700 shrink-0" />
                  <span>{data.currentLocation}</span>
                </div>
              )}
              {linkedInUrl && (
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">
                  <Linkedin size={densityCfg.iconSize} className="text-amber-700 shrink-0" />
                  <span>{formatDisplayUrl(linkedInUrl)}</span>
                </div>
              )}
              {githubUrl && (
                <div className="flex items-center gap-1.5 bg-stone-900 text-white px-2.5 py-1 rounded-full font-mono text-[8pt]">
                  <GithubIcon size={densityCfg.iconSize} className="text-amber-400 shrink-0" />
                  <span>{formatDisplayUrl(githubUrl)}</span>
                </div>
              )}
              {portfolioUrl && (
                <div className="flex items-center gap-1.5 bg-amber-600 text-white px-2.5 py-1 rounded-full font-semibold text-[8pt]">
                  <Globe size={densityCfg.iconSize} className="text-white shrink-0" />
                  <span>{formatDisplayUrl(portfolioUrl)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Compliance Bar */}
          {!data.isInternational && (
            <div className="mt-3 pt-2 flex flex-wrap items-center gap-2 text-[8.5pt] text-stone-600 font-mono">
              <span className="bg-stone-100 px-2 py-0.5 rounded font-semibold text-stone-900">
                {data.useIdNumber ? `SA ID: ${data.idNumber || 'Verified'}` : `Passport: ${data.passportNumber || 'N/A'}`}
              </span>
              <span>• EE: <strong className="text-stone-900">{data.demographics} ({data.gender})</strong></span>
              {data.driversLicense && data.driversLicense !== 'None' && <span>• Driver: {data.driversLicense}</span>}
              {data.noticePeriod && <span>• Notice: <strong className="text-amber-700">{data.noticePeriod}</strong></span>}
            </div>
          )}
        </div>

        {/* 2-Column Asymmetric Narrative Split */}
        <div className="grid grid-cols-12 gap-6">
          {/* Main Column (8 Cols) */}
          <div className={`col-span-12 sm:col-span-8 ${densityCfg.sectionSpacing}`}>
            {/* Value Statement / Summary */}
            {data.professionalSummary && (
              <section style={breakAvoidStyle} className="break-inside-avoid">
                <div className="flex items-center gap-2 mb-2 pb-1 border-b-2 border-stone-200">
                  <span className="w-2.5 h-2.5 bg-amber-600 rotate-45" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-stone-900">
                    Profile & Impact Statement
                  </h2>
                </div>
                <p className="text-stone-700 text-[9.5pt] leading-relaxed text-justify text-pretty">
                  {data.professionalSummary}
                </p>
              </section>
            )}

            {/* Experience Timeline */}
            {data.workExperience && data.workExperience.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b-2 border-stone-200">
                  <span className="w-2.5 h-2.5 bg-amber-600 rotate-45" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-stone-900">
                    Career Progression
                  </h2>
                </div>

                <div className={densityCfg.itemSpacing}>
                  {data.workExperience.map((job) => (
                    <div key={job.id} style={breakAvoidStyle} className="break-inside-avoid relative pl-3.5 border-l-2 border-amber-600/40">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-amber-600 ring-4 ring-white" />
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-black text-stone-950 text-[10pt]">{job.jobTitle}</h3>
                        <span className="text-[8pt] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded tabular-nums">
                          {job.startDate} — {job.endDate}
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 font-bold mb-1">
                        {job.companyName} <span className="text-stone-400 font-normal">| {job.location}</span>
                      </div>
                      <div className="text-stone-700 text-[9pt] whitespace-pre-line leading-relaxed">
                        {job.responsibilities}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b-2 border-stone-200">
                  <span className="w-2.5 h-2.5 bg-amber-600 rotate-45" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-stone-900">
                    Education & Credentials
                  </h2>
                </div>

                <div className={densityCfg.itemSpacing}>
                  {data.education.map((edu) => (
                    <div key={edu.id} style={breakAvoidStyle} className="break-inside-avoid bg-stone-50 p-3 rounded-lg border border-stone-200">
                      <div className="flex justify-between items-baseline">
                        <div className="font-bold text-stone-950 text-[9.5pt]">{edu.qualificationName}</div>
                        <span className="text-xs font-mono text-stone-600 tabular-nums">{edu.yearCompleted}</span>
                      </div>
                      <div className="text-xs text-amber-800 font-semibold">{edu.institution} {edu.status && `• ${edu.status}`}</div>

                      {edu.tertiaryModules && edu.tertiaryModules.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-stone-200 grid grid-cols-2 gap-1.5 text-[8.5pt]">
                          {edu.tertiaryModules.map((m, mi) => (
                            <div key={mi} className="flex justify-between text-stone-700">
                              <span className="truncate pr-1">• {m.moduleName}</span>
                              <span className="font-mono font-bold text-stone-950 tabular-nums">{m.score}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Column (4 Cols) */}
          <div className={`col-span-12 sm:col-span-4 ${densityCfg.sectionSpacing}`}>
            {/* Core Competencies */}
            {data.skills && data.skills.length > 0 && (
              <div style={breakAvoidStyle} className="break-inside-avoid bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 mb-2.5 flex items-center gap-1.5">
                  <Award size={13} className="text-amber-600" />
                  Skills & Tools
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-white text-stone-900 border border-stone-300 px-2.5 py-1 rounded-md text-[8.5pt] font-bold shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {validLanguages.length > 0 && (
              <div style={breakAvoidStyle} className="break-inside-avoid bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 mb-2.5 flex items-center gap-1.5">
                  <Languages size={13} className="text-amber-600" />
                  Languages
                </h2>
                <div className="space-y-2">
                  {validLanguages.map((lang, li) => (
                    <div key={li} className="text-[8.5pt] flex justify-between items-center border-b border-stone-200/60 pb-1.5 last:border-0 last:pb-0">
                      <span className="font-bold text-stone-900">{lang.name}</span>
                      <span className="text-[7.5pt] text-stone-600 font-mono bg-stone-200/60 px-1.5 py-0.5 rounded">
                        {lang.speakProficiency} / {lang.writeProficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* References */}
            {data.references && data.references.length > 0 && (
              <div style={breakAvoidStyle} className="break-inside-avoid bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 mb-2.5">
                  Referees
                </h2>
                <div className="space-y-2.5 text-[8.5pt]">
                  {data.references.map((ref) => (
                    <div key={ref.id} className="border-b border-stone-200/60 pb-2 last:border-0 last:pb-0">
                      <div className="font-bold text-stone-950">{ref.referenceName}</div>
                      <div className="text-stone-600 text-[8pt]">{ref.companyTitle}</div>
                      <div className="text-amber-800 font-mono text-[8pt] mt-0.5 tabular-nums">{ref.contactPhone}</div>
                      <div className="text-stone-500 text-[8pt]">{ref.contactEmail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TEMPLATE 2: MODERN TECH / MODERN DUAL (Default Dual-Accent Silicon Layout)
  // =========================================================================
  return (
    <div className={`text-slate-800 font-sans ${densityCfg.rootPadding} ${densityCfg.fontSize} ${densityCfg.lineHeight}`}>
      {/* Top Banner Header */}
      <div className={`border-b-2 border-indigo-600 ${densityCfg.headerPadding} ${densityCfg.headerMargin}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 font-sans text-balance">
              {data.fullName || "Lindiwe Nomvula Dlamini"}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-indigo-600 tracking-wide mt-1 uppercase">
              {data.headline || "Senior Full-Stack Cloud Engineer & Technical Lead"}
            </p>
          </div>

          {/* Contact Coordinates Block - Clean rendering with zero placeholders */}
          <div className="text-left sm:text-right text-[8.5pt] text-slate-600 space-y-1">
            {data.emailAddress && (
              <div className="flex items-center sm:justify-end gap-1.5">
                <Mail size={densityCfg.iconSize} className="text-indigo-600 shrink-0" />
                <span>{data.emailAddress}</span>
              </div>
            )}
            {data.cellNumber && (
              <div className="flex items-center sm:justify-end gap-1.5 tabular-nums">
                <Phone size={densityCfg.iconSize} className="text-indigo-600 shrink-0" />
                <span>{data.cellNumber}</span>
              </div>
            )}
            {data.currentLocation && (
              <div className="flex items-center sm:justify-end gap-1.5">
                <MapPin size={densityCfg.iconSize} className="text-indigo-600 shrink-0" />
                <span>{data.currentLocation}</span>
              </div>
            )}
            {linkedInUrl && (
              <div className="flex items-center sm:justify-end gap-1.5 font-medium">
                <Linkedin size={densityCfg.iconSize} className="text-indigo-600 shrink-0" />
                <span>{formatDisplayUrl(linkedInUrl)}</span>
              </div>
            )}
            {githubUrl && (
              <div className="flex items-center sm:justify-end gap-1.5 font-mono text-[8pt]">
                <GithubIcon size={densityCfg.iconSize} className="text-indigo-600 shrink-0" />
                <span>{formatDisplayUrl(githubUrl)}</span>
              </div>
            )}
            {portfolioUrl && (
              <div className="flex items-center sm:justify-end gap-1.5 font-medium">
                <Globe size={densityCfg.iconSize} className="text-indigo-600 shrink-0" />
                <span>{formatDisplayUrl(portfolioUrl)}</span>
              </div>
            )}
          </div>
        </div>

        {/* EE Badge Bar */}
        {!data.isInternational && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1 text-[8.5pt] text-slate-600 bg-slate-50 p-2 rounded-lg">
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Shield size={12} className="text-indigo-600" />
              {data.useIdNumber ? `SA ID: ${data.idNumber || 'Verified'}` : `Passport: ${data.passportNumber || 'N/A'}`}
            </span>
            <span>• EE: <strong className="text-slate-800">{data.demographics || 'African'} ({data.gender || 'Female'})</strong></span>
            {data.driversLicense && data.driversLicense !== 'None' && (
              <span>• Driver's: <strong className="text-slate-800">{data.driversLicense}</strong></span>
            )}
            {data.noticePeriod && (
              <span>• Notice: <strong className="text-indigo-700">{data.noticePeriod}</strong></span>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Left Column (8 cols) & Right Sidebar (4 cols) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Column (8 cols) */}
        <div className={`col-span-12 sm:col-span-8 ${densityCfg.sectionSpacing}`}>
          {/* Executive Summary */}
          {data.professionalSummary && (
            <section style={breakAvoidStyle} className="break-inside-avoid">
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-indigo-100">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">Executive Summary</h2>
              </div>
              <p className="text-slate-700 text-[9.5pt] leading-relaxed text-justify text-pretty">
                {data.professionalSummary}
              </p>
            </section>
          )}

          {/* Work Experience */}
          {data.workExperience && data.workExperience.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 pb-1 border-b border-indigo-100">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">Career Experience</h2>
              </div>

              <div className={densityCfg.itemSpacing}>
                {data.workExperience.map((job) => (
                  <div key={job.id} style={breakAvoidStyle} className="break-inside-avoid relative pl-3 border-l-2 border-indigo-200">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-950 text-[10pt]">{job.jobTitle}</h3>
                      <span className="text-[8.5pt] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded tabular-nums">
                        {job.startDate} — {job.endDate}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-semibold mb-1.5">
                      {job.companyName} <span className="text-slate-400 font-normal">| {job.location}</span>
                    </div>
                    <div className="text-slate-700 text-[9pt] whitespace-pre-line leading-relaxed">
                      {job.responsibilities}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education & Qualifications */}
          {data.education && data.education.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 pb-1 border-b border-indigo-100">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">Education & Qualifications</h2>
              </div>

              <div className={densityCfg.itemSpacing}>
                {data.education.map((edu) => (
                  <div key={edu.id} style={breakAvoidStyle} className="break-inside-avoid bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-baseline">
                      <div className="font-bold text-slate-950 text-[9.5pt]">{edu.qualificationName}</div>
                      <span className="text-xs font-mono text-slate-600 tabular-nums">{edu.yearCompleted}</span>
                    </div>
                    <div className="text-xs text-indigo-700 font-medium">{edu.institution} {edu.status && `• ${edu.status}`}</div>

                    {edu.tertiaryModules && edu.tertiaryModules.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-1.5 text-[8.5pt]">
                        {edu.tertiaryModules.map((m, mi) => (
                          <div key={mi} className="flex justify-between text-slate-700">
                            <span className="truncate pr-1">• {m.moduleName}</span>
                            <span className="font-mono font-bold text-slate-900 tabular-nums">{m.score}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar (4 cols) */}
        <div className={`col-span-12 sm:col-span-4 ${densityCfg.sectionSpacing}`}>
          {/* Core Skills */}
          {data.skills && data.skills.length > 0 && (
            <div style={breakAvoidStyle} className="break-inside-avoid bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <Award size={14} className="text-indigo-600" />
                Core Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="bg-white text-slate-800 border border-slate-200 px-2.5 py-1 rounded-md text-[8.5pt] font-semibold shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {validLanguages.length > 0 && (
            <div style={breakAvoidStyle} className="break-inside-avoid bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <Languages size={14} className="text-indigo-600" />
                Languages
              </h2>
              <div className="space-y-2">
                {validLanguages.map((lang, li) => (
                  <div key={li} className="text-[8.5pt] flex justify-between items-center border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                    <span className="font-bold text-slate-800">{lang.name}</span>
                    <span className="text-[8pt] text-slate-500 font-mono">
                      {lang.speakProficiency} / {lang.writeProficiency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional References */}
          {data.references && data.references.length > 0 && (
            <div style={breakAvoidStyle} className="break-inside-avoid bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-3">
                References
              </h2>
              <div className="space-y-3 text-[8.5pt]">
                {data.references.map((ref) => (
                  <div key={ref.id} className="border-b border-slate-200/60 pb-2 last:border-0 last:pb-0">
                    <div className="font-bold text-slate-900">{ref.referenceName}</div>
                    <div className="text-slate-600 text-xs">{ref.companyTitle}</div>
                    <div className="text-indigo-700 font-mono text-[8pt] mt-0.5 tabular-nums">{ref.contactPhone}</div>
                    <div className="text-slate-500 text-[8pt]">{ref.contactEmail}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

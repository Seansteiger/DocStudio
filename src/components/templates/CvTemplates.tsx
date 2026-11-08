import React from 'react';
import type { SouthAfricanCvData } from '../../types/document';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Globe
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

// Helper for responsibilities rendering with optical bullet alignment
const renderResponsibilities = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const isBulletList = lines.some(l => l.startsWith('•') || l.startsWith('-') || l.startsWith('*'));
  
  if (isBulletList) {
    return (
      <ul className="space-y-1 mt-1 text-slate-700">
        {lines.map((line, idx) => {
          const cleanLine = line.replace(/^[•\-*]\s*/, '');
          return (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-slate-400 mt-1 leading-none select-none text-[8pt]">•</span>
              <span className="flex-1 leading-relaxed text-pretty">{cleanLine}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <p className="text-slate-700 whitespace-pre-line leading-relaxed text-pretty mt-1">
      {text}
    </p>
  );
};

// Helper to get density classes
const getDensityConfig = (density: 'compact' | 'standard' | 'spacious' = 'standard') => {
  switch (density) {
    case 'compact':
      return {
        rootPadding: 'p-4 sm:p-5',
        fontSize: 'text-[8.5pt]',
        lineHeight: 'leading-snug',
        sectionSpacing: 'space-y-3.5',
        itemSpacing: 'space-y-2',
        subItemSpacing: 'space-y-1',
        headerMargin: 'mb-3',
        headerPadding: 'pb-2.5',
        cardPadding: 'p-2.5',
        chipPadding: 'px-2 py-0.5 text-[8pt]',
        iconSize: 11
      };
    case 'spacious':
      return {
        rootPadding: 'p-8 sm:p-10',
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
        rootPadding: 'p-6 sm:p-8',
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
      <div 
        className={`text-slate-900 font-sans ${densityCfg.rootPadding} ${densityCfg.fontSize} ${densityCfg.lineHeight}`}
        style={{ boxSizing: 'border-box' }}
      >
        {/* Header */}
        <div 
          className={`text-center ${densityCfg.headerPadding} ${densityCfg.headerMargin}`}
          style={{ borderBottom: '1px solid #cbd5e1' }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-slate-950 text-balance">
            {data.fullName || "Your Full Name"}
          </h1>
          {data.headline && (
            <p className="text-xs font-semibold text-slate-700 mt-1 uppercase tracking-wide">
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
            <div className="text-[8.5pt] text-slate-500 mt-2 font-mono tabular-nums">
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
              <h2 
                className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 mb-2"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
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
              <h2 
                className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 mb-2"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
                Core Competencies & Technical Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className={`text-slate-800 rounded font-medium ${densityCfg.chipPadding}`}
                    style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}
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
              <h2 
                className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 mb-2"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
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
                    <div 
                      className="text-slate-700 text-[9pt] leading-relaxed pl-2.5"
                      style={{ borderLeft: '2px solid #cbd5e1' }}
                    >
                      {renderResponsibilities(job.responsibilities)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education & Qualifications */}
          {((data.education && data.education.length > 0) || (data.matricSubjects && data.matricSubjects.length > 0)) && (
            <section>
              <h2 
                className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 mb-2"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
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
                      <div 
                        className="grid grid-cols-2 gap-1 text-[8.5pt] p-2 rounded mt-1 bg-slate-50"
                        style={{ border: '1px solid #e2e8f0' }}
                      >
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
                  <div 
                    className="break-inside-avoid mt-2 p-2.5 rounded bg-slate-50"
                    style={{ ...breakAvoidStyle, border: '1px solid #e2e8f0' }}
                  >
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

          {/* Languages */}
          {validLanguages.length > 0 && (
            <section style={breakAvoidStyle} className="break-inside-avoid">
              <h2 
                className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 mb-2"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
                Languages
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {validLanguages.map((lang, lidx) => (
                  <div 
                    key={lidx} 
                    className="p-2 rounded bg-slate-50 text-xs"
                    style={{ border: '1px solid #e2e8f0' }}
                  >
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
              <h2 
                className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 mb-2"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
                Professional References
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[9pt]">
                {data.references.map((ref) => (
                  <div 
                    key={ref.id} 
                    className="break-inside-avoid p-2.5 rounded bg-slate-50"
                    style={{ ...breakAvoidStyle, border: '1px solid #e2e8f0' }}
                  >
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
      <div 
        className={`text-slate-900 font-serif ${densityCfg.rootPadding} ${densityCfg.fontSize} ${densityCfg.lineHeight}`}
        style={{ boxSizing: 'border-box' }}
      >
        {/* Executive Header Banner */}
        <div 
          className={`${densityCfg.headerPadding} ${densityCfg.headerMargin}`}
          style={{ borderBottom: '2px solid #0f172a' }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
            <div>
              <span className="text-[8.5pt] font-mono uppercase tracking-[0.2em] text-slate-500 font-bold block mb-0.5">
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
            <div 
              className="mt-3 pt-2.5 font-sans flex flex-wrap items-center gap-x-4 gap-y-1 text-[8.5pt] text-slate-700 px-3 py-1.5 rounded bg-slate-50"
              style={{ border: '1px solid #e2e8f0' }}
            >
              <span className="font-semibold text-slate-900">
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
              <h2 
                className="text-xs font-bold uppercase tracking-wider text-slate-950 font-serif pb-1 mb-2"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
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
              <h2 
                className="text-xs font-bold uppercase tracking-wider text-slate-950 font-serif pb-1 mb-2"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
                Core Competencies & Strategic Domains
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {data.skills.map((skill, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-1.5 text-xs text-slate-800 px-2 py-1 rounded bg-slate-50"
                    style={{ border: '1px solid #e2e8f0' }}
                  >
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
              <h2 
                className="text-xs font-bold uppercase tracking-wider text-slate-950 font-serif pb-1 mb-2.5"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
                Executive & Professional Experience
              </h2>
              <div className={densityCfg.itemSpacing}>
                {data.workExperience.map((job) => (
                  <div key={job.id} style={breakAvoidStyle} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-950 text-[10pt] font-serif">{job.jobTitle}</h3>
                      <span 
                        className="text-xs font-mono font-semibold text-slate-800 px-2 py-0.5 rounded tabular-nums bg-slate-100"
                        style={{ border: '1px solid #e2e8f0' }}
                      >
                        {job.startDate} — {job.endDate}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-semibold mb-1">
                      <span>{job.companyName}</span> <span className="text-slate-400 font-normal">| {job.location}</span>
                    </div>
                    <div 
                      className="text-slate-800 text-[9pt] leading-relaxed pl-3"
                      style={{ borderLeft: '2px solid #cbd5e1' }}
                    >
                      {renderResponsibilities(job.responsibilities)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education & Academic Credentials */}
          {((data.education && data.education.length > 0) || (data.matricSubjects && data.matricSubjects.length > 0)) && (
            <section>
              <h2 
                className="text-xs font-bold uppercase tracking-wider text-slate-950 font-serif pb-1 mb-2.5"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
                Academic Qualifications & Credentials
              </h2>
              <div className={densityCfg.itemSpacing}>
                {data.education?.map((edu) => (
                  <div 
                    key={edu.id} 
                    className="break-inside-avoid p-3 rounded bg-slate-50"
                    style={{ ...breakAvoidStyle, border: '1px solid #e2e8f0' }}
                  >
                    <div className="flex justify-between items-baseline">
                      <div className="font-bold text-slate-950 text-[9.5pt] font-serif">{edu.qualificationName}</div>
                      <span className="text-xs font-mono text-slate-600 tabular-nums">{edu.yearCompleted}</span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium">
                      {edu.institution} {edu.status && <span className="text-slate-500">• {edu.status}</span>}
                    </div>

                    {edu.tertiaryModules && edu.tertiaryModules.length > 0 && (
                      <div 
                        className="mt-2 pt-2 grid grid-cols-2 gap-1 text-[8.5pt]"
                        style={{ borderTop: '1px solid #e2e8f0' }}
                      >
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

                {data.isMatricHighest && data.matricSubjects && data.matricSubjects.length > 0 && (
                  <div 
                    className="break-inside-avoid mt-2 p-2.5 rounded bg-slate-50"
                    style={{ ...breakAvoidStyle, border: '1px solid #e2e8f0' }}
                  >
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

          {/* Languages */}
          {validLanguages.length > 0 && (
            <section style={breakAvoidStyle} className="break-inside-avoid">
              <h2 
                className="text-xs font-bold uppercase tracking-wider text-slate-950 font-serif pb-1 mb-2"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
                Language Proficiencies
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {validLanguages.map((lang, lidx) => (
                  <div 
                    key={lidx} 
                    className="p-2 rounded bg-slate-50 text-xs"
                    style={{ border: '1px solid #e2e8f0' }}
                  >
                    <div className="font-bold text-slate-950">{lang.name}</div>
                    <div className="text-[8pt] text-slate-600 font-mono mt-0.5">
                      Spoken: {lang.speakProficiency || 'Fluent'} | Written: {lang.writeProficiency || 'Fluent'}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* References */}
          {data.references && data.references.length > 0 && (
            <section style={breakAvoidStyle} className="break-inside-avoid">
              <h2 
                className="text-xs font-bold uppercase tracking-wider text-slate-950 font-serif pb-1 mb-2"
                style={{ borderBottom: '1px solid #cbd5e1' }}
              >
                Executive References
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {data.references.map((ref) => (
                  <div 
                    key={ref.id} 
                    className="break-inside-avoid p-2.5 rounded bg-slate-50"
                    style={{ ...breakAvoidStyle, border: '1px solid #e2e8f0' }}
                  >
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
  // TEMPLATE 4: CREATIVE BOLD (Editorial Swiss Design - Asymmetrical Grid, 90/10 Rule)
  // =========================================================================
  if (templateId === 'creative-bold') {
    return (
      <div 
        className={`text-neutral-900 font-sans ${densityCfg.rootPadding} ${densityCfg.fontSize} ${densityCfg.lineHeight}`}
        style={{ boxSizing: 'border-box' }}
      >
        {/* Creative Editorial Header */}
        <div 
          className={`${densityCfg.headerPadding} ${densityCfg.headerMargin}`}
          style={{ borderBottom: '3px solid #171717' }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <span className="text-[8pt] font-mono uppercase tracking-[0.25em] text-[#c2410c] font-bold block">
                Portfolio & Curriculum Vitae
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 uppercase text-balance">
                {data.fullName || "Lindiwe Nomvula Dlamini"}
              </h1>
              {data.headline && (
                <p className="text-xs sm:text-sm font-bold text-neutral-700 tracking-wider uppercase">
                  {data.headline}
                </p>
              )}
            </div>

            {/* Architectural Contact Metadata Block */}
            <div 
              className="text-left sm:text-right text-xs text-neutral-700 space-y-1 p-2.5 rounded bg-neutral-50 min-w-[200px]"
              style={{ border: '1px solid #e5e5e5' }}
            >
              {data.emailAddress && (
                <div className="flex items-center sm:justify-end gap-1.5">
                  <Mail size={densityCfg.iconSize} className="text-[#c2410c] shrink-0" />
                  <span className="font-medium text-neutral-800">{data.emailAddress}</span>
                </div>
              )}
              {data.cellNumber && (
                <div className="flex items-center sm:justify-end gap-1.5 tabular-nums">
                  <Phone size={densityCfg.iconSize} className="text-[#c2410c] shrink-0" />
                  <span className="font-medium text-neutral-800">{data.cellNumber}</span>
                </div>
              )}
              {data.currentLocation && (
                <div className="flex items-center sm:justify-end gap-1.5">
                  <MapPin size={densityCfg.iconSize} className="text-[#c2410c] shrink-0" />
                  <span>{data.currentLocation}</span>
                </div>
              )}
              {linkedInUrl && (
                <div className="flex items-center sm:justify-end gap-1.5 font-medium">
                  <Linkedin size={densityCfg.iconSize} className="text-[#c2410c] shrink-0" />
                  <span className="text-neutral-900">{formatDisplayUrl(linkedInUrl)}</span>
                </div>
              )}
              {githubUrl && (
                <div className="flex items-center sm:justify-end gap-1.5 font-mono text-[8pt]">
                  <GithubIcon size={densityCfg.iconSize} className="text-neutral-900 shrink-0" />
                  <span className="text-neutral-900">{formatDisplayUrl(githubUrl)}</span>
                </div>
              )}
              {portfolioUrl && (
                <div className="flex items-center sm:justify-end gap-1.5 font-medium text-[8pt]">
                  <Globe size={densityCfg.iconSize} className="text-[#c2410c] shrink-0" />
                  <span className="text-[#c2410c] font-semibold">{formatDisplayUrl(portfolioUrl)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Compliance Bar */}
          {!data.isInternational && (
            <div 
              className="mt-3 pt-2 flex flex-wrap items-center gap-2 text-[8.5pt] text-neutral-600 font-mono"
              style={{ borderTop: '1px solid #e5e5e5' }}
            >
              <span 
                className="px-2 py-0.5 rounded font-semibold text-neutral-900 bg-neutral-100"
                style={{ border: '1px solid #d4d4d4' }}
              >
                {data.useIdNumber ? `SA ID: ${data.idNumber || 'Verified'}` : `Passport: ${data.passportNumber || 'N/A'}`}
              </span>
              <span>• EE: <strong className="text-neutral-900">{data.demographics || 'African'} ({data.gender || 'Female'})</strong></span>
              {data.driversLicense && data.driversLicense !== 'None' && <span>• Driver: {data.driversLicense}</span>}
              {data.noticePeriod && <span>• Notice: <strong className="text-[#c2410c]">{data.noticePeriod}</strong></span>}
            </div>
          )}
        </div>

        {/* 2-Column Asymmetric Narrative Split (8 cols / 4 cols) */}
        <div className="grid grid-cols-12 gap-6">
          {/* Main Column (8 Cols) */}
          <div className={`col-span-12 sm:col-span-8 ${densityCfg.sectionSpacing}`}>
            {/* Value Statement / Summary */}
            {data.professionalSummary && (
              <section style={breakAvoidStyle} className="break-inside-avoid">
                <h2 
                  className="text-xs font-black uppercase tracking-wider text-neutral-950 mb-2 pb-1"
                  style={{ borderBottom: '2px solid #171717' }}
                >
                  Profile & Impact Statement
                </h2>
                <p className="text-neutral-700 text-[9.5pt] leading-relaxed text-justify text-pretty">
                  {data.professionalSummary}
                </p>
              </section>
            )}

            {/* Experience Timeline */}
            {data.workExperience && data.workExperience.length > 0 && (
              <section>
                <h2 
                  className="text-xs font-black uppercase tracking-wider text-neutral-950 mb-3 pb-1"
                  style={{ borderBottom: '2px solid #171717' }}
                >
                  Career Progression
                </h2>

                <div className={densityCfg.itemSpacing}>
                  {data.workExperience.map((job) => (
                    <div 
                      key={job.id} 
                      className="break-inside-avoid pl-3.5"
                      style={{ ...breakAvoidStyle, borderLeft: '2px solid #c2410c' }}
                    >
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-black text-neutral-950 text-[10pt]">{job.jobTitle}</h3>
                        <span 
                          className="text-[8pt] font-mono font-bold text-[#9a3412] px-2 py-0.5 rounded tabular-nums bg-orange-50"
                          style={{ border: '1px solid #fed7aa' }}
                        >
                          {job.startDate} — {job.endDate}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-600 font-bold mb-1">
                        {job.companyName} <span className="text-neutral-400 font-normal">| {job.location}</span>
                      </div>
                      <div className="text-neutral-700 text-[9pt] leading-relaxed">
                        {renderResponsibilities(job.responsibilities)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {((data.education && data.education.length > 0) || (data.matricSubjects && data.matricSubjects.length > 0)) && (
              <section>
                <h2 
                  className="text-xs font-black uppercase tracking-wider text-neutral-950 mb-3 pb-1"
                  style={{ borderBottom: '2px solid #171717' }}
                >
                  Education & Credentials
                </h2>

                <div className={densityCfg.itemSpacing}>
                  {data.education?.map((edu) => (
                    <div 
                      key={edu.id} 
                      className="break-inside-avoid p-3 rounded bg-neutral-50"
                      style={{ ...breakAvoidStyle, border: '1px solid #e5e5e5' }}
                    >
                      <div className="flex justify-between items-baseline">
                        <div className="font-bold text-neutral-950 text-[9.5pt]">{edu.qualificationName}</div>
                        <span className="text-xs font-mono text-neutral-600 tabular-nums">{edu.yearCompleted}</span>
                      </div>
                      <div className="text-xs text-[#c2410c] font-semibold">{edu.institution} {edu.status && `• ${edu.status}`}</div>

                      {edu.tertiaryModules && edu.tertiaryModules.length > 0 && (
                        <div 
                          className="mt-2 pt-2 grid grid-cols-2 gap-1.5 text-[8.5pt]"
                          style={{ borderTop: '1px solid #e5e5e5' }}
                        >
                          {edu.tertiaryModules.map((m, mi) => (
                            <div key={mi} className="flex justify-between text-neutral-700">
                              <span className="truncate pr-1">• {m.moduleName}</span>
                              <span className="font-mono font-bold text-neutral-950 tabular-nums">{m.score}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {data.isMatricHighest && data.matricSubjects && data.matricSubjects.length > 0 && (
                    <div 
                      className="break-inside-avoid mt-2 p-2.5 rounded bg-neutral-50"
                      style={{ ...breakAvoidStyle, border: '1px solid #e5e5e5' }}
                    >
                      <div className="font-bold text-xs text-neutral-900 mb-1">National Senior Certificate (Matric) Results:</div>
                      <div className="grid grid-cols-2 gap-1.5 text-[8.5pt]">
                        {data.matricSubjects.map((sub, sidx) => (
                          <div key={sidx} className="flex justify-between text-neutral-700">
                            <span>{sub.subjectName}</span>
                            <span className="font-mono font-bold text-neutral-950 tabular-nums">{sub.score}% (L{sub.level})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Column (4 Cols) */}
          <div className={`col-span-12 sm:col-span-4 ${densityCfg.sectionSpacing}`}>
            {/* Core Competencies */}
            {data.skills && data.skills.length > 0 && (
              <div 
                className="break-inside-avoid p-3.5 rounded bg-neutral-50"
                style={{ ...breakAvoidStyle, border: '1px solid #e5e5e5' }}
              >
                <h2 className="text-xs font-black uppercase tracking-wider text-neutral-900 mb-2.5">
                  Skills & Tools
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-neutral-900 px-2 py-1 rounded text-[8.5pt] font-semibold bg-white"
                      style={{ border: '1px solid #d4d4d4' }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {validLanguages.length > 0 && (
              <div 
                className="break-inside-avoid p-3.5 rounded bg-neutral-50"
                style={{ ...breakAvoidStyle, border: '1px solid #e5e5e5' }}
              >
                <h2 className="text-xs font-black uppercase tracking-wider text-neutral-900 mb-2.5">
                  Languages
                </h2>
                <div className="space-y-2">
                  {validLanguages.map((lang, li) => (
                    <div 
                      key={li} 
                      className="text-[8.5pt] flex justify-between items-center pb-1.5 last:pb-0"
                      style={{ borderBottom: li < validLanguages.length - 1 ? '1px solid #e5e5e5' : 'none' }}
                    >
                      <span className="font-bold text-neutral-900">{lang.name}</span>
                      <span 
                        className="text-[7.5pt] text-neutral-700 font-mono px-1.5 py-0.5 rounded bg-neutral-200"
                      >
                        {lang.speakProficiency || 'Fluent'} / {lang.writeProficiency || 'Fluent'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* References */}
            {data.references && data.references.length > 0 && (
              <div 
                className="break-inside-avoid p-3.5 rounded bg-neutral-50"
                style={{ ...breakAvoidStyle, border: '1px solid #e5e5e5' }}
              >
                <h2 className="text-xs font-black uppercase tracking-wider text-neutral-900 mb-2.5">
                  Referees
                </h2>
                <div className="space-y-2.5 text-[8.5pt]">
                  {data.references.map((ref, ri) => (
                    <div 
                      key={ref.id} 
                      className="pb-2 last:pb-0"
                      style={{ borderBottom: ri < data.references.length - 1 ? '1px solid #e5e5e5' : 'none' }}
                    >
                      <div className="font-bold text-neutral-950">{ref.referenceName}</div>
                      <div className="text-neutral-600 text-[8pt]">{ref.companyTitle}</div>
                      <div className="text-[#c2410c] font-mono text-[8pt] mt-0.5 tabular-nums">{ref.contactPhone}</div>
                      <div className="text-neutral-500 text-[8pt]">{ref.contactEmail}</div>
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
  // TEMPLATE 2: MODERN TECH / MODERN DUAL (Default Dual-Column Silicon Layout)
  // =========================================================================
  return (
    <div 
      className={`text-slate-800 font-sans ${densityCfg.rootPadding} ${densityCfg.fontSize} ${densityCfg.lineHeight}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Top Banner Header */}
      <div 
        className={`${densityCfg.headerPadding} ${densityCfg.headerMargin}`}
        style={{ borderBottom: '2px solid #0f172a' }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 font-sans text-balance">
              {data.fullName || "Lindiwe Nomvula Dlamini"}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide mt-1 uppercase">
              {data.headline || "Senior Full-Stack Cloud Engineer & Technical Lead"}
            </p>
          </div>

          {/* Contact Coordinates Block - Clean rendering with zero placeholders */}
          <div className="text-left sm:text-right text-[8.5pt] text-slate-600 space-y-1">
            {data.emailAddress && (
              <div className="flex items-center sm:justify-end gap-1.5">
                <Mail size={densityCfg.iconSize} className="text-slate-700 shrink-0" />
                <span>{data.emailAddress}</span>
              </div>
            )}
            {data.cellNumber && (
              <div className="flex items-center sm:justify-end gap-1.5 tabular-nums">
                <Phone size={densityCfg.iconSize} className="text-slate-700 shrink-0" />
                <span>{data.cellNumber}</span>
              </div>
            )}
            {data.currentLocation && (
              <div className="flex items-center sm:justify-end gap-1.5">
                <MapPin size={densityCfg.iconSize} className="text-slate-700 shrink-0" />
                <span>{data.currentLocation}</span>
              </div>
            )}
            {linkedInUrl && (
              <div className="flex items-center sm:justify-end gap-1.5 font-medium">
                <Linkedin size={densityCfg.iconSize} className="text-slate-700 shrink-0" />
                <span>{formatDisplayUrl(linkedInUrl)}</span>
              </div>
            )}
            {githubUrl && (
              <div className="flex items-center sm:justify-end gap-1.5 font-mono text-[8pt]">
                <GithubIcon size={densityCfg.iconSize} className="text-slate-700 shrink-0" />
                <span>{formatDisplayUrl(githubUrl)}</span>
              </div>
            )}
            {portfolioUrl && (
              <div className="flex items-center sm:justify-end gap-1.5 font-medium">
                <Globe size={densityCfg.iconSize} className="text-slate-700 shrink-0" />
                <span>{formatDisplayUrl(portfolioUrl)}</span>
              </div>
            )}
          </div>
        </div>

        {/* EE Badge Bar */}
        {!data.isInternational && (
          <div 
            className="mt-3 pt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[8.5pt] text-slate-700 bg-slate-50 p-2 rounded"
            style={{ border: '1px solid #e2e8f0' }}
          >
            <span className="font-semibold text-slate-900">
              {data.useIdNumber ? `SA ID: ${data.idNumber || 'Verified'}` : `Passport: ${data.passportNumber || 'N/A'}`}
            </span>
            <span>• EE: <strong className="text-slate-900">{data.demographics || 'African'} ({data.gender || 'Female'})</strong></span>
            {data.driversLicense && data.driversLicense !== 'None' && (
              <span>• Driver's: <strong className="text-slate-900">{data.driversLicense}</strong></span>
            )}
            {data.noticePeriod && (
              <span>• Notice: <strong className="text-slate-900">{data.noticePeriod}</strong></span>
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
              <h2 
                className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 mb-2"
                style={{ borderBottom: '1px solid #e2e8f0' }}
              >
                Executive Summary
              </h2>
              <p className="text-slate-700 text-[9.5pt] leading-relaxed text-justify text-pretty">
                {data.professionalSummary}
              </p>
            </section>
          )}

          {/* Work Experience */}
          {data.workExperience && data.workExperience.length > 0 && (
            <section>
              <h2 
                className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 mb-3"
                style={{ borderBottom: '1px solid #e2e8f0' }}
              >
                Career Experience
              </h2>

              <div className={densityCfg.itemSpacing}>
                {data.workExperience.map((job) => (
                  <div 
                    key={job.id} 
                    className="break-inside-avoid pl-3"
                    style={{ ...breakAvoidStyle, borderLeft: '2px solid #cbd5e1' }}
                  >
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-950 text-[10pt]">{job.jobTitle}</h3>
                      <span 
                        className="text-[8.5pt] font-mono font-semibold text-slate-800 px-2 py-0.5 rounded tabular-nums bg-slate-100"
                        style={{ border: '1px solid #e2e8f0' }}
                      >
                        {job.startDate} — {job.endDate}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-semibold mb-1.5">
                      {job.companyName} <span className="text-slate-400 font-normal">| {job.location}</span>
                    </div>
                    <div className="text-slate-700 text-[9pt] leading-relaxed">
                      {renderResponsibilities(job.responsibilities)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education & Qualifications */}
          {((data.education && data.education.length > 0) || (data.matricSubjects && data.matricSubjects.length > 0)) && (
            <section>
              <h2 
                className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 mb-3"
                style={{ borderBottom: '1px solid #e2e8f0' }}
              >
                Education & Qualifications
              </h2>

              <div className={densityCfg.itemSpacing}>
                {data.education?.map((edu) => (
                  <div 
                    key={edu.id} 
                    className="break-inside-avoid p-3 rounded bg-slate-50"
                    style={{ ...breakAvoidStyle, border: '1px solid #e2e8f0' }}
                  >
                    <div className="flex justify-between items-baseline">
                      <div className="font-bold text-slate-950 text-[9.5pt]">{edu.qualificationName}</div>
                      <span className="text-xs font-mono text-slate-600 tabular-nums">{edu.yearCompleted}</span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium">{edu.institution} {edu.status && `• ${edu.status}`}</div>

                    {edu.tertiaryModules && edu.tertiaryModules.length > 0 && (
                      <div 
                        className="mt-2 pt-2 grid grid-cols-2 gap-1.5 text-[8.5pt]"
                        style={{ borderTop: '1px solid #e2e8f0' }}
                      >
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

                {data.isMatricHighest && data.matricSubjects && data.matricSubjects.length > 0 && (
                  <div 
                    className="break-inside-avoid mt-2 p-2.5 rounded bg-slate-50"
                    style={{ ...breakAvoidStyle, border: '1px solid #e2e8f0' }}
                  >
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
        </div>

        {/* Right Sidebar (4 cols) */}
        <div className={`col-span-12 sm:col-span-4 ${densityCfg.sectionSpacing}`}>
          {/* Core Skills */}
          {data.skills && data.skills.length > 0 && (
            <div 
              className="break-inside-avoid p-3.5 rounded bg-slate-50"
              style={{ ...breakAvoidStyle, border: '1px solid #e2e8f0' }}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5">
                Core Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="text-slate-800 px-2.5 py-1 rounded text-[8.5pt] font-semibold bg-white"
                    style={{ border: '1px solid #cbd5e1' }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {validLanguages.length > 0 && (
            <div 
              className="break-inside-avoid p-3.5 rounded bg-slate-50"
              style={{ ...breakAvoidStyle, border: '1px solid #e2e8f0' }}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5">
                Languages
              </h2>
              <div className="space-y-2">
                {validLanguages.map((lang, li) => (
                  <div 
                    key={li} 
                    className="text-[8.5pt] flex justify-between items-center pb-1.5 last:pb-0"
                    style={{ borderBottom: li < validLanguages.length - 1 ? '1px solid #e2e8f0' : 'none' }}
                  >
                    <span className="font-bold text-slate-800">{lang.name}</span>
                    <span className="text-[8pt] text-slate-600 font-mono">
                      {lang.speakProficiency || 'Fluent'} / {lang.writeProficiency || 'Fluent'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional References */}
          {data.references && data.references.length > 0 && (
            <div 
              className="break-inside-avoid p-3.5 rounded bg-slate-50"
              style={{ ...breakAvoidStyle, border: '1px solid #e2e8f0' }}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5">
                References
              </h2>
              <div className="space-y-2.5 text-[8.5pt]">
                {data.references.map((ref, ri) => (
                  <div 
                    key={ref.id} 
                    className="pb-2 last:pb-0"
                    style={{ borderBottom: ri < data.references.length - 1 ? '1px solid #e2e8f0' : 'none' }}
                  >
                    <div className="font-bold text-slate-900">{ref.referenceName}</div>
                    <div className="text-slate-600 text-xs">{ref.companyTitle}</div>
                    <div className="text-slate-700 font-mono text-[8pt] mt-0.5 tabular-nums">{ref.contactPhone}</div>
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

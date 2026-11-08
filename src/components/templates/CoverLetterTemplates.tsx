import React from 'react';
import { CoverLetterData } from '../../types/document';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';

interface CoverLetterTemplateProps {
  data: CoverLetterData;
  templateId?: string;
}

export const CoverLetterTemplates: React.FC<CoverLetterTemplateProps> = ({ data, templateId = 'modern-letterhead' }) => {
  const isExecutive = templateId === 'executive' || templateId === 'formal-executive';
  const currentDate = data.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div 
      className={`text-slate-900 ${isExecutive ? 'font-serif' : 'font-sans'} text-[9.5pt] leading-relaxed flex flex-col justify-between min-h-[inherit]`}
      style={{ boxSizing: 'border-box' }}
    >
      <div>
        {/* Letterhead Header */}
        <div 
          className="pb-5 mb-7 flex flex-col sm:flex-row justify-between items-start gap-4"
          style={{ borderBottom: '2px solid #0f172a' }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              {data.fullName || "Candidate Name"}
            </h1>
            {data.headline && (
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mt-1 font-sans">
                {data.headline}
              </p>
            )}
          </div>

          {/* Contact Coordinates */}
          <div className="text-left sm:text-right text-xs text-slate-600 space-y-1 font-sans">
            {data.emailAddress && (
              <div className="flex items-center sm:justify-end gap-1.5">
                <Mail size={12} className="text-slate-700 shrink-0" />
                <span>{data.emailAddress}</span>
              </div>
            )}
            {data.cellNumber && (
              <div className="flex items-center sm:justify-end gap-1.5 tabular-nums">
                <Phone size={12} className="text-slate-700 shrink-0" />
                <span>{data.cellNumber}</span>
              </div>
            )}
            {data.currentLocation && (
              <div className="flex items-center sm:justify-end gap-1.5">
                <MapPin size={12} className="text-slate-700 shrink-0" />
                <span>{data.currentLocation}</span>
              </div>
            )}
            {data.linkedInUrl && (
              <div className="flex items-center sm:justify-end gap-1.5">
                <Linkedin size={12} className="text-slate-700 shrink-0" />
                <span>{data.linkedInUrl.replace(/^https?:\/\//i, '').replace(/^www\./i, '')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Date & Recipient Details */}
        <div className="mb-6 text-xs text-slate-700 space-y-1 font-sans">
          <div className="text-slate-500 font-semibold mb-3 tabular-nums">{currentDate}</div>
          <div className="font-bold text-slate-950 text-sm">{data.recipientName || "Hiring Manager"}</div>
          {data.recipientTitle && <div className="text-slate-600">{data.recipientTitle}</div>}
          <div className="font-semibold text-slate-900">{data.companyName || "Target Company"}</div>
          {data.companyAddress && <div className="text-slate-500 max-w-sm whitespace-pre-line">{data.companyAddress}</div>}
        </div>

        {/* Formal Subject Line */}
        <div 
          className="mb-6 pb-2"
          style={{ borderBottom: '1px solid #cbd5e1' }}
        >
          <span className="font-bold text-xs uppercase tracking-wide text-slate-950 font-sans">
            RE: APPLICATION FOR {data.jobTitle ? data.jobTitle.toUpperCase() : "THE POSITION"}
          </span>
        </div>

        {/* Body Paragraphs */}
        <div className="space-y-4 text-justify text-[9.5pt] text-slate-800 leading-relaxed font-sans">
          <p className="font-semibold text-slate-900">
            Dear {data.recipientName || "Hiring Team"},
          </p>
          {data.paragraphs && data.paragraphs.map((p, idx) => (
            <p key={idx} className="text-pretty">{p}</p>
          ))}
        </div>
      </div>

      {/* Formal Sign-off */}
      <div 
        className="pt-6 mt-8 font-sans"
        style={{ borderTop: '1px solid #e2e8f0' }}
      >
        <p className="text-xs text-slate-600 mb-6">Sincerely,</p>
        <div className="font-bold text-base text-slate-950">{data.fullName}</div>
        <p className="text-xs text-slate-500 mt-0.5">{data.jobTitle || "Applicant"}</p>
      </div>
    </div>
  );
};

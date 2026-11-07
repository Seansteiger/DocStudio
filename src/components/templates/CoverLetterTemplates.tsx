import React from 'react';
import { CoverLetterData } from '../../types/document';
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react';

interface CoverLetterTemplateProps {
  data: CoverLetterData;
  templateId?: string;
}

export const CoverLetterTemplates: React.FC<CoverLetterTemplateProps> = ({ data }) => {
  return (
    <div className="text-slate-900 font-sans p-6 text-[10pt] leading-relaxed flex flex-col justify-between min-h-[inherit]">
      <div>
        {/* Modern Letterhead Header */}
        <div className="border-b-2 border-sky-600 pb-5 mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-slate-950">{data.fullName || "Candidate Name"}</h1>
            {data.headline && <p className="text-xs font-bold text-sky-700 uppercase tracking-wider mt-0.5">{data.headline}</p>}
          </div>

          <div className="text-right text-xs text-slate-600 space-y-1">
            {data.emailAddress && <div className="flex items-center justify-end gap-1.5"><Mail size={12} className="text-sky-600" /><span>{data.emailAddress}</span></div>}
            {data.cellNumber && <div className="flex items-center justify-end gap-1.5"><Phone size={12} className="text-sky-600" /><span>{data.cellNumber}</span></div>}
            {data.currentLocation && <div className="flex items-center justify-end gap-1.5"><MapPin size={12} className="text-sky-600" /><span>{data.currentLocation}</span></div>}
            {data.linkedInUrl && <div className="flex items-center justify-end gap-1.5"><Linkedin size={12} className="text-sky-600" /><span>{data.linkedInUrl}</span></div>}
          </div>
        </div>

        {/* Date & Recipient Details */}
        <div className="mb-6 text-xs text-slate-700 space-y-1">
          <div className="text-slate-500 font-medium mb-4">{data.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <div className="font-bold text-slate-950 text-sm">{data.recipientName || "Hiring Manager"}</div>
          {data.recipientTitle && <div>{data.recipientTitle}</div>}
          <div className="font-semibold text-slate-800">{data.companyName || "Target Company"}</div>
          {data.companyAddress && <div className="text-slate-500 max-w-xs">{data.companyAddress}</div>}
        </div>

        {/* Subject Line */}
        <div className="mb-6 pb-2 border-b border-slate-200">
          <span className="font-bold text-sm text-slate-950 uppercase tracking-wide">
            RE: APPLICATION FOR {data.jobTitle ? data.jobTitle.toUpperCase() : "THE POSITION"}
          </span>
        </div>

        {/* Body Paragraphs */}
        <div className="space-y-4 text-justify text-[9.5pt] text-slate-800 leading-relaxed">
          <p className="font-medium text-slate-900">Dear {data.recipientName || "Hiring Team"},</p>
          {data.paragraphs && data.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </div>

      {/* Formal Sign-off */}
      <div className="pt-8 mt-6 border-t border-slate-100">
        <p className="text-xs text-slate-600 mb-6">Sincerely,</p>
        <div className="font-bold text-base text-slate-950 font-sans">{data.fullName}</div>
        <p className="text-xs text-slate-500 mt-0.5">{data.jobTitle || "Applicant"}</p>
      </div>
    </div>
  );
};

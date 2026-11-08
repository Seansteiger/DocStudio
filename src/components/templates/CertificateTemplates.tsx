import React from 'react';
import { CertificateData } from '../../types/document';

interface CertificateTemplateProps {
  data: CertificateData;
  templateId?: string;
}

export const CertificateTemplates: React.FC<CertificateTemplateProps> = ({ data }) => {
  return (
    <div 
      className="text-slate-900 font-serif text-center flex flex-col justify-between min-h-[inherit] p-8 sm:p-10 relative bg-white"
      style={{ 
        boxSizing: 'border-box',
        border: '3px solid #b45309',
        outline: '1px solid #d97706',
        outlineOffset: '-7px'
      }}
    >
      <div>
        {/* Issuing Authority Header */}
        <div className="mb-8 pt-4">
          <span className="font-mono text-[8.5pt] font-bold tracking-[0.25em] text-[#92400e] uppercase block mb-2">
            {data.issuingOrganization || "DOCSTUDIO ACADEMY OF EXCELLENCE"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-slate-950 uppercase font-serif">
            Certificate of Achievement
          </h1>
          
          {data.honorsBadgeText && (
            <div className="inline-block mt-3">
              <span 
                className="inline-block px-4 py-1 text-[8pt] font-sans font-bold uppercase tracking-[0.25em] text-[#92400e]"
                style={{ 
                  borderTop: '1px solid #d97706', 
                  borderBottom: '1px solid #d97706' 
                }}
              >
                {data.honorsBadgeText}
              </span>
            </div>
          )}
        </div>

        {/* Presentation Text */}
        <div className="my-8">
          <p className="text-xs font-sans text-slate-500 uppercase tracking-[0.2em] mb-3">
            This credential is officially conferred upon
          </p>
          <div 
            className="text-3xl sm:text-4xl font-bold text-slate-950 font-serif italic pb-3 max-w-lg mx-auto"
            style={{ borderBottom: '1px solid #94a3b8' }}
          >
            {data.recipientName || "Recipient Full Name"}
          </div>
        </div>

        {/* Achievement Description */}
        <div className="max-w-xl mx-auto mb-10">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-sans mb-2.5">
            In Recognition of Professional Mastery in <span className="text-[#92400e] font-serif">{data.achievementTitle}</span>
          </h3>
          <p className="text-xs font-sans text-slate-600 leading-relaxed text-justify px-4 text-pretty">
            {data.descriptionText}
          </p>
        </div>
      </div>

      {/* Signatures & Formal Authentication Ledger */}
      <div 
        className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end font-sans"
        style={{ borderTop: '1px solid #e2e8f0' }}
      >
        {/* Primary Signatory */}
        <div className="text-center sm:text-left">
          <div 
            className="pt-6 font-serif text-slate-900 font-bold text-xs"
            style={{ borderBottom: '1px solid #94a3b8' }}
          >
            {data.primarySignatoryName}
          </div>
          <div className="text-[8pt] text-slate-500 mt-1 font-sans">{data.primarySignatoryTitle}</div>
        </div>

        {/* Central Authentication Ledger */}
        <div className="flex flex-col items-center justify-center">
          <div 
            className="px-4 py-2 rounded text-center bg-stone-50 min-w-[160px]"
            style={{ border: '1px solid #e2e8f0' }}
          >
            <div className="text-[7pt] font-mono font-bold text-[#92400e] uppercase tracking-widest">
              OFFICIALLY REGISTERED
            </div>
            <div className="text-[8pt] font-mono text-slate-800 font-bold mt-0.5 tabular-nums">
              ID: {data.certificateId}
            </div>
            <div className="text-[7pt] text-slate-500 font-mono tabular-nums">
              Date: {data.issueDate}
            </div>
          </div>
        </div>

        {/* Secondary Signatory */}
        <div className="text-center sm:text-right">
          <div 
            className="pt-6 font-serif text-slate-900 font-bold text-xs"
            style={{ borderBottom: '1px solid #94a3b8' }}
          >
            {data.secondarySignatoryName || "Authorized Executive"}
          </div>
          <div className="text-[8pt] text-slate-500 mt-1 font-sans">
            {data.secondarySignatoryTitle || "Executive Registrar"}
          </div>
        </div>
      </div>
    </div>
  );
};

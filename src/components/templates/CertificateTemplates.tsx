import React from 'react';
import { CertificateData } from '../../types/document';
import { Award, ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';

export const CertificateTemplates: React.FC<{ data: CertificateData }> = ({ data }) => {
  return (
    <div className="text-slate-900 font-serif p-8 text-center flex flex-col justify-between min-h-[inherit] border-8 border-double border-amber-600/60 bg-gradient-to-b from-amber-50/20 via-white to-amber-50/20 rounded-lg relative overflow-hidden">
      {/* Corner Ornaments */}
      <div className="absolute top-2 left-2 text-amber-600 text-xs font-mono">✦</div>
      <div className="absolute top-2 right-2 text-amber-600 text-xs font-mono">✦</div>
      <div className="absolute bottom-2 left-2 text-amber-600 text-xs font-mono">✦</div>
      <div className="absolute bottom-2 right-2 text-amber-600 text-xs font-mono">✦</div>

      <div>
        {/* Issuing Header */}
        <div className="mb-6 pt-4">
          <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
            <Award size={36} className="text-amber-600" />
          </div>
          <span className="font-mono text-xs font-bold tracking-widest text-amber-700 uppercase block mb-1">
            {data.issuingOrganization || "DOCSTUDIO ACADEMY OF EXCELLENCE"}
          </span>
          <h1 className="text-3xl font-black tracking-wider text-slate-950 uppercase font-serif">
            Certificate of Achievement
          </h1>
          {data.honorsBadgeText && (
            <div className="inline-block mt-2 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-sans font-extrabold uppercase tracking-widest">
              ★ {data.honorsBadgeText} ★
            </div>
          )}
        </div>

        {/* Presentation Text */}
        <div className="my-8">
          <p className="text-xs font-sans text-slate-500 uppercase tracking-widest mb-3">This credential is proudly awarded to:</p>
          <div className="text-3xl font-bold text-slate-950 font-serif italic border-b-2 border-slate-300 pb-2 max-w-lg mx-auto">
            {data.recipientName || "Recipient Full Name"}
          </div>
        </div>

        {/* Achievement Description */}
        <div className="max-w-xl mx-auto mb-10">
          <h3 className="text-lg font-bold text-slate-900 font-sans mb-2">
            In Recognition of Mastery in <span className="text-amber-800">{data.achievementTitle}</span>
          </h3>
          <p className="text-xs font-sans text-slate-600 leading-relaxed text-justify px-6">
            {data.descriptionText}
          </p>
        </div>
      </div>

      {/* Signatures & Seal Verification */}
      <div className="pt-6 border-t border-amber-200 grid grid-cols-3 gap-4 items-end font-sans">
        <div>
          <div className="pt-6 border-b border-slate-400 font-serif text-slate-900 font-bold text-xs">{data.primarySignatoryName}</div>
          <div className="text-[8pt] text-slate-500 mt-1">{data.primarySignatoryTitle}</div>
        </div>

        {/* Central Gold Seal Badge */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex flex-col items-center justify-center shadow-lg border-2 border-amber-300 p-1">
            <ShieldCheck size={20} />
            <span className="text-[6pt] font-extrabold tracking-widest uppercase mt-0.5">VERIFIED</span>
          </div>
          <div className="text-[7pt] text-slate-400 font-mono mt-1">ID: {data.certificateId}</div>
          <div className="text-[7pt] text-slate-400 font-mono">Date: {data.issueDate}</div>
        </div>

        <div>
          <div className="pt-6 border-b border-slate-400 font-serif text-slate-900 font-bold text-xs">{data.secondarySignatoryName || "Authorized Executive"}</div>
          <div className="text-[8pt] text-slate-500 mt-1">{data.secondarySignatoryTitle || "Executive Registrar"}</div>
        </div>
      </div>
    </div>
  );
};

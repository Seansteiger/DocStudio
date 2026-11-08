import React from 'react';
import { ResignationData } from '../../types/document';

interface ResignationTemplateProps {
  data: ResignationData;
  templateId?: string;
}

export const ResignationTemplates: React.FC<ResignationTemplateProps> = ({ data }) => {
  const submissionDate = data.submissionDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div 
      className="text-slate-900 font-sans text-[9.5pt] leading-relaxed flex flex-col justify-between min-h-[inherit]"
      style={{ boxSizing: 'border-box' }}
    >
      <div>
        {/* Header */}
        <div 
          className="pb-5 mb-7 flex flex-col sm:flex-row justify-between items-start gap-4"
          style={{ borderBottom: '2px solid #0f172a' }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              {data.fullName || "Your Full Name"}
            </h1>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mt-1">
              {data.jobTitle || "Current Job Title"}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono tabular-nums">
            {submissionDate}
          </div>
        </div>

        {/* Manager Details */}
        <div className="mb-6 text-xs text-slate-700 space-y-1">
          <div className="font-bold text-slate-950 text-sm">{data.managerName || "Department Manager"}</div>
          {data.managerTitle && <div>{data.managerTitle}</div>}
          <div className="font-semibold text-slate-800">{data.companyName || "Company Name"}</div>
        </div>

        {/* Formal Notice Statement */}
        <div 
          className="mb-6 pb-2"
          style={{ borderBottom: '1px solid #cbd5e1' }}
        >
          <h2 className="font-bold text-xs text-slate-950 uppercase tracking-wide">
            RE: FORMAL LETTER OF RESIGNATION — {data.jobTitle ? data.jobTitle.toUpperCase() : "POSITION"}
          </h2>
        </div>

        {/* Body Content */}
        <div className="space-y-4 text-justify text-[9.5pt] text-slate-800 leading-relaxed">
          <p className="font-semibold text-slate-900">Dear {data.managerName || "Manager"},</p>
          
          <p className="text-pretty">
            Please accept this letter as formal notification that I am resigning from my position as <strong>{data.jobTitle}</strong> with <strong>{data.companyName}</strong>. As per my employment contract, my notice period is {data.noticePeriodDuration || "30 Calendar Days"}, making my last working day <strong className="tabular-nums">{data.lastWorkingDay || "To be confirmed"}</strong>.
          </p>

          {data.appreciationMessage && (
            <p className="text-pretty">{data.appreciationMessage}</p>
          )}

          {data.handoverPlan && (
            <div 
              className="p-3.5 rounded bg-slate-50 my-2"
              style={{ border: '1px solid #e2e8f0' }}
            >
              <h3 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-1.5">
                Handover & Transition Plan
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line text-pretty">
                {data.handoverPlan}
              </p>
            </div>
          )}

          <p className="text-pretty">
            I wish {data.companyName} continued success, and I hope to maintain professional contact with the team in the future.
          </p>
        </div>
      </div>

      {/* Sign-off */}
      <div 
        className="pt-6 mt-8"
        style={{ borderTop: '1px solid #e2e8f0' }}
      >
        <p className="text-xs text-slate-600 mb-6">Sincerely,</p>
        <div className="font-bold text-base text-slate-950">{data.fullName}</div>
        {data.personalContactDetails && (
          <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">{data.personalContactDetails}</p>
        )}
      </div>
    </div>
  );
};

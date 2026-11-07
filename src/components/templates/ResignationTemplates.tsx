import React from 'react';
import { ResignationData } from '../../types/document';
import { LogOut, Calendar, CheckCircle } from 'lucide-react';

export const ResignationTemplates: React.FC<{ data: ResignationData }> = ({ data }) => {
  return (
    <div className="text-slate-900 font-sans p-6 text-[10pt] leading-relaxed flex flex-col justify-between min-h-[inherit]">
      <div>
        {/* Header */}
        <div className="border-b-2 border-pink-600 pb-5 mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-slate-950">{data.fullName || "Your Full Name"}</h1>
            <p className="text-xs font-bold text-pink-700 uppercase tracking-wider mt-0.5">{data.jobTitle || "Current Job Title"}</p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            {data.submissionDate || new Date().toISOString().split('T')[0]}
          </div>
        </div>

        {/* Manager Details */}
        <div className="mb-6 text-xs text-slate-700 space-y-1">
          <div className="font-bold text-slate-950 text-sm">{data.managerName || "Department Manager"}</div>
          <div>{data.managerTitle || "Director"}</div>
          <div className="font-semibold text-slate-800">{data.companyName || "Company Name"}</div>
        </div>

        {/* Formal Notice Statement */}
        <div className="mb-6 pb-2 border-b border-slate-200">
          <h2 className="font-bold text-sm text-slate-950 uppercase tracking-wide">
            RE: FORMAL LETTER OF RESIGNATION — {data.jobTitle ? data.jobTitle.toUpperCase() : "POSITION"}
          </h2>
        </div>

        {/* Body Content */}
        <div className="space-y-4 text-justify text-[9.5pt] text-slate-800 leading-relaxed">
          <p>Dear {data.managerName || "Manager"},</p>
          
          <p>
            Please accept this letter as formal notification that I am resigning from my position as <strong>{data.jobTitle}</strong> with <strong>{data.companyName}</strong>. As per my employment contract, my notice period is {data.noticePeriodDuration || "30 Calendar Days"}, making my last working day <strong>{data.lastWorkingDay || "To be confirmed"}</strong>.
          </p>

          <p>{data.appreciationMessage}</p>

          <div>
            <h3 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-1">Handover & Transition Plan:</h3>
            <p>{data.handoverPlan}</p>
          </div>

          <p>
            I wish {data.companyName} continued success, and I hope to maintain professional contact with the team in the future.
          </p>
        </div>
      </div>

      {/* Sign-off */}
      <div className="pt-8 mt-6 border-t border-slate-100">
        <p className="text-xs text-slate-600 mb-6">Sincerely,</p>
        <div className="font-bold text-base text-slate-950">{data.fullName}</div>
        <p className="text-xs text-slate-500 mt-1 font-mono">{data.personalContactDetails}</p>
      </div>
    </div>
  );
};

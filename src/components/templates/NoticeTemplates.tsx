import React from 'react';
import { OfficialNoticeData } from '../../types/document';
import { AlertCircle, ShieldAlert, Stamp } from 'lucide-react';

export const NoticeTemplates: React.FC<{ data: OfficialNoticeData }> = ({ data }) => {
  return (
    <div className="text-slate-900 font-sans p-6 text-[9.5pt] leading-relaxed flex flex-col justify-between min-h-[inherit]">
      <div>
        {/* Formal Header with Reference Tag */}
        <div className="border-b-2 border-red-600 pb-5 mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-slate-950">{data.senderEntity || "Corporate Directorate"}</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">{data.senderAddress}</p>
            <p className="text-xs text-slate-500 font-mono">{data.senderContact}</p>
          </div>

          <div className="text-right">
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-mono font-bold">
              REF: {data.referenceNumber || "NOT-001"}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-2">
              Date: {data.date || new Date().toISOString().split('T')[0]}
            </div>
          </div>
        </div>

        {/* Recipient */}
        <div className="mb-6 text-xs text-slate-700 space-y-1 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <span className="font-bold text-[8pt] uppercase font-mono tracking-wider text-slate-400 block">SERVED TO:</span>
          <div className="font-bold text-slate-950 text-sm">{data.recipientEntity}</div>
          <div className="text-slate-600">{data.recipientAddress}</div>
        </div>

        {/* Notice Subject Line */}
        <div className="mb-6 pb-2 border-b-2 border-slate-900">
          <h2 className="font-extrabold text-sm text-slate-950 uppercase tracking-wide">
            {data.noticeSubject || "FORMAL OFFICIAL NOTIFICATION"}
          </h2>
        </div>

        {/* Body Paragraphs */}
        <div className="space-y-4 text-justify text-[9.5pt] text-slate-800 leading-relaxed mb-6">
          {data.bodyParagraphs && data.bodyParagraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Action Required Box */}
        {data.actionRequired && (
          <div className="bg-red-50/70 border-l-4 border-red-600 p-4 rounded-r-lg mb-6">
            <h4 className="font-bold text-red-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <AlertCircle size={14} className="text-red-600" />
              Action Required:
            </h4>
            <p className="text-xs text-red-800 mb-2">{data.actionRequired}</p>
            {data.complianceDeadline && (
              <div className="text-xs font-bold font-mono text-red-950">
                Compliance Deadline: {data.complianceDeadline}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Official Signatory Block */}
      <div className="pt-8 mt-6 border-t-2 border-slate-900">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-slate-600 mb-6">Duly Authorized Signatory:</p>
            <div className="font-bold text-sm text-slate-950">{data.authorizedSignatoryName}</div>
            <p className="text-xs text-slate-500 font-mono">{data.authorizedSignatoryTitle}</p>
          </div>

          <div className="border border-slate-300 rounded-lg px-4 py-3 text-center bg-slate-50">
            <div className="text-[8pt] font-mono font-bold text-slate-400 uppercase tracking-widest">OFFICIAL SEAL</div>
            <div className="text-[9pt] font-extrabold text-slate-800 mt-1">VERIFIED NOTICE</div>
            <div className="text-[7pt] text-slate-400 font-mono">{data.referenceNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

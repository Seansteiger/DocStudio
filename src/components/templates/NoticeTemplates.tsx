import React from 'react';
import { OfficialNoticeData } from '../../types/document';

interface NoticeTemplateProps {
  data: OfficialNoticeData;
  templateId?: string;
}

export const NoticeTemplates: React.FC<NoticeTemplateProps> = ({ data }) => {
  const formattedDate = data.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div 
      className="text-slate-900 font-sans text-[9.5pt] leading-relaxed flex flex-col justify-between min-h-[inherit]"
      style={{ boxSizing: 'border-box' }}
    >
      <div>
        {/* Formal Header with Reference Tag */}
        <div 
          className="pb-5 mb-7 flex flex-col sm:flex-row justify-between items-start gap-4"
          style={{ borderBottom: '2px solid #0f172a' }}
        >
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
              {data.senderEntity || "Corporate Directorate"}
            </h1>
            {data.senderAddress && (
              <p className="text-xs text-slate-600 mt-1 max-w-sm whitespace-pre-line">{data.senderAddress}</p>
            )}
            {data.senderContact && (
              <p className="text-xs text-slate-500 font-mono mt-0.5 tabular-nums">{data.senderContact}</p>
            )}
          </div>

          <div className="text-left sm:text-right">
            <div 
              className="px-3 py-1.5 rounded text-xs font-mono font-bold text-red-800"
              style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
            >
              REF: {data.referenceNumber || "NOT-001"}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-1.5 tabular-nums">
              Date: {formattedDate}
            </div>
          </div>
        </div>

        {/* Recipient */}
        <div 
          className="mb-6 text-xs text-slate-700 space-y-1 p-3.5 rounded bg-slate-50"
          style={{ border: '1px solid #e2e8f0' }}
        >
          <span className="font-bold text-[8pt] uppercase font-mono tracking-wider text-slate-400 block">
            SERVED TO:
          </span>
          <div className="font-bold text-slate-950 text-sm">{data.recipientEntity}</div>
          {data.recipientAddress && (
            <div className="text-slate-600 whitespace-pre-line">{data.recipientAddress}</div>
          )}
        </div>

        {/* Notice Subject Line */}
        <div 
          className="mb-6 pb-2"
          style={{ borderBottom: '2px solid #0f172a' }}
        >
          <h2 className="font-black text-xs text-slate-950 uppercase tracking-wide">
            {data.noticeSubject || "FORMAL OFFICIAL NOTIFICATION"}
          </h2>
        </div>

        {/* Body Paragraphs */}
        <div className="space-y-4 text-justify text-[9.5pt] text-slate-800 leading-relaxed mb-6">
          {data.bodyParagraphs && data.bodyParagraphs.map((p, idx) => (
            <p key={idx} className="text-pretty">{p}</p>
          ))}
        </div>

        {/* Action Required Box */}
        {data.actionRequired && (
          <div 
            className="p-4 rounded-r mb-6"
            style={{ 
              backgroundColor: '#fef2f2', 
              borderLeft: '4px solid #dc2626',
              borderTop: '1px solid #fee2e2',
              borderRight: '1px solid #fee2e2',
              borderBottom: '1px solid #fee2e2'
            }}
          >
            <h4 className="font-bold text-red-950 text-xs uppercase tracking-wider mb-1">
              Required Compliance Action:
            </h4>
            <p className="text-xs text-red-900 leading-relaxed mb-2 text-pretty">{data.actionRequired}</p>
            {data.complianceDeadline && (
              <div className="text-xs font-bold font-mono text-red-950 tabular-nums">
                Compliance Deadline: {data.complianceDeadline}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Official Signatory Block */}
      <div 
        className="pt-6 mt-8"
        style={{ borderTop: '2px solid #0f172a' }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <p className="text-xs text-slate-500 mb-6 font-medium">Duly Authorized Signatory:</p>
            <div className="font-bold text-sm text-slate-950">{data.authorizedSignatoryName}</div>
            <p className="text-xs text-slate-600 font-mono mt-0.5">{data.authorizedSignatoryTitle}</p>
          </div>

          <div 
            className="rounded px-4 py-3 text-left sm:text-right bg-slate-50 min-w-[200px]"
            style={{ border: '1px solid #cbd5e1' }}
          >
            <div className="text-[7.5pt] font-mono font-bold text-slate-500 uppercase tracking-widest">
              RECORD ARCHIVE
            </div>
            <div className="text-xs font-bold font-mono text-slate-800 mt-0.5 tabular-nums">
              {data.referenceNumber}
            </div>
            <div className="text-[7.5pt] text-slate-400 font-mono mt-0.5">
              Formally Served & Logged
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

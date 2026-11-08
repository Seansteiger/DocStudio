import React from 'react';
import { FreelanceContractData } from '../../types/document';

interface ContractTemplateProps {
  data: FreelanceContractData;
  templateId?: string;
}

export const ContractTemplates: React.FC<ContractTemplateProps> = ({ data }) => {
  const total = (data.milestones || []).reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  return (
    <div 
      className="text-slate-900 font-sans text-[9pt] leading-relaxed flex flex-col justify-between min-h-[inherit]"
      style={{ boxSizing: 'border-box' }}
    >
      <div>
        {/* Header */}
        <div 
          className="text-center pb-4 mb-6"
          style={{ borderBottom: '2px solid #0f172a' }}
        >
          <span className="text-[8pt] font-bold font-mono tracking-widest text-slate-500 uppercase">
            INDEPENDENT CONTRACTOR AGREEMENT
          </span>
          <h1 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-wide mt-1">
            {data.contractTitle || "MASTER FREELANCE SERVICES AGREEMENT"}
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1 tabular-nums">
            Effective Date: {data.effectiveDate || 'N/A'} • Project Deadline: {data.projectDeadline || 'N/A'}
          </p>
        </div>

        {/* Parties */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded bg-slate-50 mb-5 text-xs"
          style={{ border: '1px solid #e2e8f0' }}
        >
          <div>
            <span className="font-bold text-slate-900 uppercase text-[8pt] tracking-wider block mb-1">
              Contractor / Service Provider:
            </span>
            <div className="text-slate-900 font-semibold">{data.freelancerName}</div>
            {data.freelancerEmail && <div className="text-slate-600 font-mono">{data.freelancerEmail}</div>}
            {data.freelancerAddress && <div className="text-slate-500 whitespace-pre-line">{data.freelancerAddress}</div>}
          </div>
          <div>
            <span className="font-bold text-slate-900 uppercase text-[8pt] tracking-wider block mb-1">
              Client / Engaging Organization:
            </span>
            <div className="text-slate-900 font-semibold">{data.clientName} {data.clientCompany ? `(${data.clientCompany})` : ''}</div>
            {data.clientEmail && <div className="text-slate-600 font-mono">{data.clientEmail}</div>}
            {data.clientAddress && <div className="text-slate-500 whitespace-pre-line">{data.clientAddress}</div>}
          </div>
        </div>

        {/* Scope & Terms */}
        <div className="space-y-4 mb-6">
          <div>
            <h3 className="font-bold text-slate-950 uppercase text-[8.5pt] tracking-wide mb-1">
              1. Scope of Work & Deliverables
            </h3>
            <p className="text-slate-700 leading-relaxed text-justify text-pretty">
              {data.scopeOfWork}
            </p>
          </div>

          {/* Milestones Table */}
          {data.milestones && data.milestones.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-950 uppercase text-[8.5pt] tracking-wide mb-2">
                2. Payment Milestones & Compensation
              </h3>
              <table 
                className="w-full text-xs"
                style={{ borderCollapse: 'collapse', border: '1px solid #cbd5e1' }}
              >
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <th className="p-2 text-left font-bold text-slate-900" style={{ borderRight: '1px solid #e2e8f0' }}>Milestone</th>
                    <th className="p-2 text-left font-bold text-slate-900" style={{ borderRight: '1px solid #e2e8f0' }}>Deliverable Description</th>
                    <th className="p-2 text-center font-bold text-slate-900" style={{ borderRight: '1px solid #e2e8f0' }}>Due Date</th>
                    <th className="p-2 text-right font-bold text-slate-900">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.milestones.map((m, idx) => (
                    <tr 
                      key={m.id || idx} 
                      style={{ 
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: idx % 2 === 1 ? '#fcfdfd' : '#ffffff' 
                      }}
                    >
                      <td className="p-2 font-semibold text-slate-900" style={{ borderRight: '1px solid #e2e8f0' }}>
                        {m.milestoneTitle}
                      </td>
                      <td className="p-2 text-slate-600" style={{ borderRight: '1px solid #e2e8f0' }}>
                        {m.deliverableDescription}
                      </td>
                      <td className="p-2 text-center font-mono text-slate-600 tabular-nums" style={{ borderRight: '1px solid #e2e8f0' }}>
                        {m.dueDate}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-950 tabular-nums">
                        {data.currency} {Number(m.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right text-xs font-bold font-mono text-slate-950 mt-2 pr-2 tabular-nums">
                Total Contract Value: {data.currency} {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-bold text-slate-950 uppercase text-[8.5pt] tracking-wide mb-1">
              3. Revisions & Kill Fee
            </h3>
            <p className="text-slate-700 leading-relaxed text-justify text-pretty">
              The project includes up to {data.revisionsAllowed || 2} revision rounds. In the event of early project termination by the Client without cause, a non-refundable kill fee equal to <strong className="tabular-nums">{data.killFeePercent || 30}%</strong> of the remaining contract balance shall become due immediately.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-950 uppercase text-[8.5pt] tracking-wide mb-1">
              4. Intellectual Property & Governing Jurisdiction
            </h3>
            <p className="text-slate-700 leading-relaxed text-justify text-pretty">
              All intellectual property rights created under this agreement shall transfer exclusively to the Client {data.ipTransferUponFullPayment ? "upon receipt of full and final payment" : "upon delivery"}. Governed and construed in accordance with the substantive laws of <strong>{data.governingLaw || "Republic of South Africa"}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Signature Execution */}
      <div 
        className="pt-6"
        style={{ borderTop: '2px solid #0f172a' }}
      >
        <div className="grid grid-cols-2 gap-8 text-xs">
          <div 
            className="p-3.5 rounded bg-slate-50"
            style={{ border: '1px solid #cbd5e1' }}
          >
            <div className="font-bold text-slate-900 mb-1">Contractor Signature:</div>
            <div 
              className="pt-8 font-mono text-slate-600"
              style={{ borderBottom: '1px solid #94a3b8' }}
            >
              {data.freelancerName}
            </div>
            <div className="mt-1 text-[8pt] text-slate-500 font-mono">Date: ________________________</div>
          </div>
          <div 
            className="p-3.5 rounded bg-slate-50"
            style={{ border: '1px solid #cbd5e1' }}
          >
            <div className="font-bold text-slate-900 mb-1">Client Authorized Signatory:</div>
            <div 
              className="pt-8 font-mono text-slate-600"
              style={{ borderBottom: '1px solid #94a3b8' }}
            >
              {data.clientName}
            </div>
            <div className="mt-1 text-[8pt] text-slate-500 font-mono">Date: ________________________</div>
          </div>
        </div>
      </div>
    </div>
  );
};

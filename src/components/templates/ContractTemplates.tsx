import React from 'react';
import { FreelanceContractData } from '../../types/document';
import { Briefcase, Calendar, ShieldCheck } from 'lucide-react';

export const ContractTemplates: React.FC<{ data: FreelanceContractData }> = ({ data }) => {
  const total = data.milestones.reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="text-slate-900 font-sans p-6 text-[9pt] leading-relaxed flex flex-col justify-between min-h-[inherit]">
      <div>
        {/* Header */}
        <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
          <span className="text-xs font-bold font-mono tracking-widest text-blue-600 uppercase">INDEPENDENT CONTRACTOR AGREEMENT</span>
          <h1 className="text-xl font-black text-slate-950 uppercase tracking-wide mt-1">
            {data.contractTitle || "MASTER FREELANCE SERVICES AGREEMENT"}
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">Effective Date: {data.effectiveDate} • Deadline: {data.projectDeadline}</p>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-5 text-xs">
          <div>
            <span className="font-bold text-slate-900 block">Freelancer / Contractor:</span>
            <div className="text-slate-800 font-semibold">{data.freelancerName}</div>
            <div className="text-slate-500">{data.freelancerEmail}</div>
            <div className="text-slate-500">{data.freelancerAddress}</div>
          </div>
          <div>
            <span className="font-bold text-slate-900 block">Client / Organization:</span>
            <div className="text-slate-800 font-semibold">{data.clientName} ({data.clientCompany})</div>
            <div className="text-slate-500">{data.clientEmail}</div>
            <div className="text-slate-500">{data.clientAddress}</div>
          </div>
        </div>

        {/* Scope of Work */}
        <div className="space-y-4 mb-6">
          <div>
            <h3 className="font-bold text-slate-950 uppercase text-[9.5pt] mb-1">1. Scope of Work & Deliverables</h3>
            <p className="text-slate-700 leading-relaxed text-justify">{data.scopeOfWork}</p>
          </div>

          {/* Milestones Table */}
          <div>
            <h3 className="font-bold text-slate-950 uppercase text-[9.5pt] mb-2">2. Payment Milestones & Compensation</h3>
            <table className="w-full text-xs border-collapse border border-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-900">
                <tr>
                  <th className="p-2 text-left border-b">Milestone</th>
                  <th className="p-2 text-left border-b">Deliverable</th>
                  <th className="p-2 text-center border-b">Due Date</th>
                  <th className="p-2 text-right border-b">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.milestones.map((m) => (
                  <tr key={m.id}>
                    <td className="p-2 font-semibold text-slate-900">{m.milestoneTitle}</td>
                    <td className="p-2 text-slate-600">{m.deliverableDescription}</td>
                    <td className="p-2 text-center font-mono text-slate-500">{m.dueDate}</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">
                      {data.currency} {m.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right text-xs font-bold font-mono text-slate-950 mt-1.5 pr-2">
              Total Contract Value: {data.currency} {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-950 uppercase text-[9.5pt] mb-1">3. Revisions & Kill Fee</h3>
            <p className="text-slate-700">
              The project includes up to {data.revisionsAllowed} revision rounds. In the event of early project termination by the Client without cause, a non-refundable kill fee equal to <strong>{data.killFeePercent}%</strong> of the remaining contract balance shall become due immediately.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-950 uppercase text-[9.5pt] mb-1">4. Intellectual Property Transfer & Jurisdiction</h3>
            <p className="text-slate-700">
              All intellectual property rights created under this agreement shall transfer exclusively to the Client {data.ipTransferUponFullPayment ? "upon receipt of full and final payment" : "upon delivery"}. Governed by the laws of <strong>{data.governingLaw || "Republic of South Africa"}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Signature Execution */}
      <div className="pt-6 border-t-2 border-slate-900">
        <div className="grid grid-cols-2 gap-8 text-xs">
          <div className="p-3 border border-slate-200 rounded bg-slate-50">
            <div className="font-bold text-slate-900 mb-1">Freelancer Signature:</div>
            <div className="pt-8 border-b border-slate-400 font-mono text-slate-500">{data.freelancerName}</div>
            <div className="mt-1 text-[8pt] text-slate-500">Date: ________________________</div>
          </div>
          <div className="p-3 border border-slate-200 rounded bg-slate-50">
            <div className="font-bold text-slate-900 mb-1">Client Signature:</div>
            <div className="pt-8 border-b border-slate-400 font-mono text-slate-500">{data.clientName}</div>
            <div className="mt-1 text-[8pt] text-slate-500">Date: ________________________</div>
          </div>
        </div>
      </div>
    </div>
  );
};

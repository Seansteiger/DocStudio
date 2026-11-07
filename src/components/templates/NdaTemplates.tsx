import React from 'react';
import { NdaData } from '../../types/document';
import { ShieldCheck, Scale, Lock } from 'lucide-react';

interface NdaTemplateProps {
  data: NdaData;
  templateId?: string;
}

export const NdaTemplates: React.FC<NdaTemplateProps> = ({ data }) => {
  const isMutual = data.agreementType === 'mutual';

  return (
    <div className="text-slate-900 font-sans p-6 text-[9pt] leading-relaxed flex flex-col justify-between min-h-[inherit]">
      <div>
        {/* Header */}
        <div className="text-center border-b-2 border-amber-600 pb-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-amber-700 text-xs font-mono font-bold uppercase tracking-widest mb-1">
            <Lock size={14} /> CONFIDENTIAL LEGAL INSTRUMENT
          </div>
          <h1 className="text-xl font-black text-slate-950 uppercase tracking-wide">
            {isMutual ? "MUTUAL NON-DISCLOSURE & CONFIDENTIALITY AGREEMENT" : "UNILATERAL NON-DISCLOSURE AGREEMENT"}
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">Effective Date: {data.effectiveDate || new Date().toISOString().split('T')[0]}</p>
        </div>

        {/* Preamble & Parties */}
        <div className="space-y-4 text-justify mb-6">
          <p>
            This Non-Disclosure Agreement (hereinafter the <strong>"Agreement"</strong>) is entered into as of the Effective Date by and between:
          </p>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <div>
              <span className="font-bold text-slate-900">1. Disclosing Party:</span> {data.disclosingParty} 
              {data.disclosingPartyAddress && <span className="text-slate-600 block text-xs">Address: {data.disclosingPartyAddress}</span>}
            </div>
            <div>
              <span className="font-bold text-slate-900">2. Receiving Party:</span> {data.receivingParty}
              {data.receivingPartyAddress && <span className="text-slate-600 block text-xs">Address: {data.receivingPartyAddress}</span>}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-950 uppercase text-[9.5pt] mb-1">1. Purpose of Disclosure</h3>
            <p className="text-slate-700">{data.purpose || "Evaluating mutual commercial or technical collaboration."}</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-950 uppercase text-[9.5pt] mb-1">2. Definition of Confidential Information</h3>
            <p className="text-slate-700">
              "Confidential Information" shall encompass all proprietary technical, financial, commercial, design, algorithmic, customer, and strategic information disclosed by either party, whether in oral, visual, machine-readable, or physical documentation format.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-950 uppercase text-[9.5pt] mb-1">3. Non-Disclosure Obligations & Term</h3>
            <p className="text-slate-700">
              The Receiving Party agrees to hold all Confidential Information in strictest confidence, using at least the same degree of care as it uses for its own sensitive data, but no less than reasonable care. These confidentiality covenants shall endure for a duration of <strong>{data.confidentialityPeriod || "3 (Three) Years"}</strong> from the Effective Date.
            </p>
          </div>

          {data.nonSolicitationMonths ? (
            <div>
              <h3 className="font-bold text-slate-950 uppercase text-[9.5pt] mb-1">4. Non-Solicitation Undertaking</h3>
              <p className="text-slate-700">
                Neither party shall solicit, hire, or entice away any employee or technical contractor of the other party for a period of {data.nonSolicitationMonths} months post termination without express prior written consent.
              </p>
            </div>
          ) : null}

          <div>
            <h3 className="font-bold text-slate-950 uppercase text-[9.5pt] mb-1">5. Governing Law & Dispute Jurisdiction</h3>
            <p className="text-slate-700">
              This Agreement shall be governed and construed strictly in accordance with the substantive laws of <strong>{data.governingLaw || "Republic of South Africa"}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Signature Execution Block */}
      <div className="pt-6 border-t-2 border-slate-900">
        <p className="text-xs text-slate-600 font-semibold mb-4 text-center">
          IN WITNESS WHEREOF, the Parties hereto have caused this Agreement to be executed by their duly authorized representatives:
        </p>

        <div className="grid grid-cols-2 gap-8 text-xs">
          <div className="border border-slate-200 p-3 rounded bg-slate-50">
            <div className="font-bold text-slate-900 mb-1">Signed for {data.disclosingParty}:</div>
            <div className="pt-8 border-b border-slate-400 font-mono text-slate-500">Authorized Signature</div>
            <div className="mt-1 text-[8pt] text-slate-500">Date: ________________________</div>
          </div>

          <div className="border border-slate-200 p-3 rounded bg-slate-50">
            <div className="font-bold text-slate-900 mb-1">Signed for {data.receivingParty}:</div>
            <div className="pt-8 border-b border-slate-400 font-mono text-slate-500">Authorized Signature</div>
            <div className="mt-1 text-[8pt] text-slate-500">Date: ________________________</div>
          </div>
        </div>
      </div>
    </div>
  );
};

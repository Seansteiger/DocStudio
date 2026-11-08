import React from 'react';
import { NdaData } from '../../types/document';

interface NdaTemplateProps {
  data: NdaData;
  templateId?: string;
}

export const NdaTemplates: React.FC<NdaTemplateProps> = ({ data }) => {
  const isMutual = data.agreementType === 'mutual';
  const effectiveDate = data.effectiveDate || new Date().toISOString().split('T')[0];

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
          <div className="text-slate-500 text-[8pt] font-mono font-bold uppercase tracking-widest mb-1">
            CONFIDENTIAL LEGAL INSTRUMENT
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-wide">
            {isMutual ? "MUTUAL NON-DISCLOSURE & CONFIDENTIALITY AGREEMENT" : "UNILATERAL NON-DISCLOSURE AGREEMENT"}
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1 tabular-nums">
            Effective Date: {effectiveDate}
          </p>
        </div>

        {/* Preamble & Parties */}
        <div className="space-y-4 text-justify mb-6">
          <p className="text-pretty">
            This Non-Disclosure Agreement (hereinafter the <strong>"Agreement"</strong>) is entered into and made effective as of the Effective Date by and between the following parties:
          </p>

          <div 
            className="p-3.5 rounded bg-slate-50 space-y-2 text-xs"
            style={{ border: '1px solid #e2e8f0' }}
          >
            <div>
              <span className="font-bold text-slate-900 block sm:inline">1. Disclosing Party: </span>
              <span className="text-slate-900 font-semibold">{data.disclosingParty}</span>
              {data.disclosingPartyAddress && (
                <div className="text-slate-500 text-[8.5pt] mt-0.5 whitespace-pre-line">
                  Address: {data.disclosingPartyAddress}
                </div>
              )}
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
              <span className="font-bold text-slate-900 block sm:inline">2. Receiving Party: </span>
              <span className="text-slate-900 font-semibold">{data.receivingParty}</span>
              {data.receivingPartyAddress && (
                <div className="text-slate-500 text-[8.5pt] mt-0.5 whitespace-pre-line">
                  Address: {data.receivingPartyAddress}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-950 uppercase text-[8.5pt] tracking-wide mb-1">
              1. Purpose of Disclosure
            </h3>
            <p className="text-slate-700 leading-relaxed text-pretty">
              {data.purpose || "Evaluating mutual commercial or technical collaboration."}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-950 uppercase text-[8.5pt] tracking-wide mb-1">
              2. Definition of Confidential Information
            </h3>
            <p className="text-slate-700 leading-relaxed text-pretty">
              "Confidential Information" shall encompass all proprietary technical, financial, commercial, algorithmic, customer, design, source code, and strategic data disclosed by either party, whether transmitted in oral, visual, electronic, machine-readable, or physical documentation format.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-950 uppercase text-[8.5pt] tracking-wide mb-1">
              3. Non-Disclosure Obligations & Term
            </h3>
            <p className="text-slate-700 leading-relaxed text-pretty">
              The Receiving Party agrees to hold all Confidential Information in strictest confidence, using at least the same degree of care as it uses to protect its own sensitive trade secrets, but no less than a reasonable standard of care. These confidentiality covenants shall endure for a period of <strong>{data.confidentialityPeriod || "3 (Three) Years"}</strong> from the Effective Date.
            </p>
          </div>

          {data.nonSolicitationMonths ? (
            <div>
              <h3 className="font-bold text-slate-950 uppercase text-[8.5pt] tracking-wide mb-1">
                4. Non-Solicitation Undertaking
              </h3>
              <p className="text-slate-700 leading-relaxed text-pretty">
                Neither party shall directly or indirectly solicit, recruit, or entice away any employee, software engineer, or technical contractor of the other party for a period of <strong className="tabular-nums">{data.nonSolicitationMonths} months</strong> following termination of this Agreement without prior written authorization.
              </p>
            </div>
          ) : null}

          <div>
            <h3 className="font-bold text-slate-950 uppercase text-[8.5pt] tracking-wide mb-1">
              {data.nonSolicitationMonths ? '5.' : '4.'} Governing Law & Jurisdiction
            </h3>
            <p className="text-slate-700 leading-relaxed text-pretty">
              This Agreement shall be governed by, interpreted, and enforced in accordance with the substantive laws of <strong>{data.governingLaw || "Republic of South Africa"}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Signature Execution Block */}
      <div 
        className="pt-6"
        style={{ borderTop: '2px solid #0f172a' }}
      >
        <p className="text-xs text-slate-600 font-semibold mb-4 text-center">
          IN WITNESS WHEREOF, the Parties have executed this Agreement by their duly authorized signatories:
        </p>

        <div className="grid grid-cols-2 gap-8 text-xs">
          <div 
            className="p-3.5 rounded bg-slate-50"
            style={{ border: '1px solid #cbd5e1' }}
          >
            <div className="font-bold text-slate-900 mb-1">Signed for {data.disclosingParty}:</div>
            <div 
              className="pt-8 font-mono text-slate-600"
              style={{ borderBottom: '1px solid #94a3b8' }}
            >
              Authorized Signatory
            </div>
            <div className="mt-1 text-[8pt] text-slate-500 font-mono">Date: ________________________</div>
          </div>

          <div 
            className="p-3.5 rounded bg-slate-50"
            style={{ border: '1px solid #cbd5e1' }}
          >
            <div className="font-bold text-slate-900 mb-1">Signed for {data.receivingParty}:</div>
            <div 
              className="pt-8 font-mono text-slate-600"
              style={{ borderBottom: '1px solid #94a3b8' }}
            >
              Authorized Signatory
            </div>
            <div className="mt-1 text-[8pt] text-slate-500 font-mono">Date: ________________________</div>
          </div>
        </div>
      </div>
    </div>
  );
};

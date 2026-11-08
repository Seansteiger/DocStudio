import React from 'react';
import { 
  AnyDocumentData, 
  SouthAfricanCvData, 
  InvoiceData, 
  CoverLetterData, 
  QuotationData, 
  NdaData, 
  ResignationData, 
  FreelanceContractData, 
  OfficialNoticeData, 
  CertificateData, 
  ReceiptData 
} from '../../types/document';
import { CvTemplates } from '../templates/CvTemplates';
import { BillingTemplates } from '../templates/BillingTemplates';
import { CoverLetterTemplates } from '../templates/CoverLetterTemplates';
import { NdaTemplates } from '../templates/NdaTemplates';
import { ResignationTemplates } from '../templates/ResignationTemplates';
import { ContractTemplates } from '../templates/ContractTemplates';
import { NoticeTemplates } from '../templates/NoticeTemplates';
import { CertificateTemplates } from '../templates/CertificateTemplates';

interface DocumentCanvasProps {
  toolId: string;
  data: AnyDocumentData;
  templateId?: string;
  zoomLevel: number;
}

export const DocumentCanvas: React.FC<DocumentCanvasProps> = ({
  toolId,
  data,
  templateId,
  zoomLevel
}) => {
  const renderDocumentContent = () => {
    switch (toolId) {
      case '1':
        return <CvTemplates data={data as SouthAfricanCvData} templateId={templateId} />;
      case '2':
      case '4':
      case '10':
        return <BillingTemplates data={data} templateId={templateId} />;
      case '3':
        return <CoverLetterTemplates data={data as CoverLetterData} templateId={templateId} />;
      case '5':
        return <NdaTemplates data={data as NdaData} templateId={templateId} />;
      case '6':
        return <ResignationTemplates data={data as ResignationData} />;
      case '7':
        return <ContractTemplates data={data as FreelanceContractData} />;
      case '8':
        return <NoticeTemplates data={data as OfficialNoticeData} />;
      case '9':
        return <CertificateTemplates data={data as CertificateData} />;
      default:
        return <div className="p-8 text-center text-slate-400">Select a document tool to render.</div>;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start p-4 sm:p-8 overflow-auto bg-[#07080B] no-scrollbar">
      {/* Canvas Paper Wrapper with Scale Transform */}
      <div 
        className="transition-transform duration-150 origin-top flex justify-center w-full"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* The Printable A4 Sheet (Standard 210mm x 297mm Ratio: 794px x 1123px at 96 DPI) */}
        <div
          id="document-preview-page"
          data-testid="document-canvas"
          className="bg-white text-slate-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] rounded-xs w-[794px] min-h-[1123px] border border-slate-200 relative overflow-hidden"
          style={{
            boxSizing: 'border-box',
            width: '794px'
          }}
        >
          <div className="p-8 sm:p-10 h-full flex flex-col justify-between min-h-[inherit] w-full">
            {renderDocumentContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

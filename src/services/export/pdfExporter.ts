import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  fileName?: string;
  quality?: number;
  onProgress?: (msg: string) => void;
}

export const exportDocumentToPdf = async (
  elementId: string = 'document-preview-page',
  options: PdfExportOptions = {}
): Promise<boolean> => {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    throw new Error(`Element with id #${elementId} not found.`);
  }

  const fileName = options.fileName || `DocStudio_Export_${Date.now()}.pdf`;

  if (options.onProgress) options.onProgress("Rendering high-resolution vector canvas...");

  try {
    const canvas = await html2canvas(targetElement, {
      scale: 2.5, // Crisp retina quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: targetElement.scrollWidth,
      windowHeight: targetElement.scrollHeight
    });

    if (options.onProgress) options.onProgress("Generating A4 printable PDF structure...");

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210; // A4 mm
    const pdfHeight = 297; // A4 mm
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgHeight / imgWidth;
    const renderedHeight = pdfWidth * ratio;

    if (renderedHeight <= pdfHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, renderedHeight);
    } else {
      // Multi-page handling if document exceeds 1 page
      let position = 0;
      let remainingHeight = renderedHeight;

      while (remainingHeight > 0) {
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, renderedHeight);
        remainingHeight -= pdfHeight;
        if (remainingHeight > 0) {
          pdf.addPage();
          position -= pdfHeight;
        }
      }
    }

    if (options.onProgress) options.onProgress("Finalizing download...");
    pdf.save(fileName);
    return true;

  } catch (err: any) {
    console.error("Client PDF generation error, falling back to window.print():", err);
    window.print();
    return false;
  }
};

export const triggerPrintMode = () => {
  window.print();
};

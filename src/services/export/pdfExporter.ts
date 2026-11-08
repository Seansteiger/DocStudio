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
  const targetElement = document.getElementById(elementId) || 
    document.getElementById('document-preview-page') || 
    (document.querySelector('[data-testid="document-canvas"]') as HTMLElement);

  if (!targetElement) {
    throw new Error(`Target document element (#${elementId}) not found.`);
  }

  const fileName = options.fileName || `DocStudio_Commercial_Export_${Date.now()}.pdf`;

  if (options.onProgress) options.onProgress("Synchronizing typographic fonts & brand assets...");

  // 1. Wait for document fonts to be 100% ready
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch (fontErr) {
    console.warn("Font loading wait skipped:", fontErr);
  }

  // 2. Wait for all <img> elements inside document to complete loading
  const images = Array.from(targetElement.querySelectorAll('img'));
  await Promise.all(
    images.map(img => {
      if (img.complete && img.naturalWidth !== 0) return Promise.resolve(true);
      return new Promise(resolve => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        setTimeout(() => resolve(true), 800);
      });
    })
  );

  // 3. Mount an unscaled 1:1 off-screen sandbox to avoid zoom/transform scale distortions
  let sandbox: HTMLDivElement | null = null;

  try {
    if (options.onProgress) options.onProgress("Rendering pixel-perfect unscaled A4 canvas...");

    sandbox = document.createElement('div');
    sandbox.style.position = 'fixed';
    sandbox.style.left = '-99999px';
    sandbox.style.top = '0';
    sandbox.style.width = '794px';
    sandbox.style.minHeight = '1123px';
    sandbox.style.margin = '0';
    sandbox.style.padding = '0';
    sandbox.style.transform = 'none';
    sandbox.style.zIndex = '-9999';
    sandbox.style.backgroundColor = '#ffffff';

    // Clone target element
    const clone = targetElement.cloneNode(true) as HTMLElement;
    clone.style.transform = 'none';
    clone.style.width = '794px';
    clone.style.maxWidth = '794px';
    clone.style.minWidth = '794px';
    clone.style.boxShadow = 'none';
    clone.style.border = 'none';
    clone.style.margin = '0';
    clone.style.boxSizing = 'border-box';

    // Prevent html2canvas baseline text-shift bug in cells and badges:
    // Explicitly enforce middle vertical alignment and clean line-height
    const cells = clone.querySelectorAll('th, td');
    cells.forEach((cell: any) => {
      cell.style.verticalAlign = 'middle';
      cell.style.lineHeight = '1.35';
    });

    const badges = clone.querySelectorAll('span, div');
    badges.forEach((el: any) => {
      if (el.className && typeof el.className === 'string' && el.className.includes('rounded-full')) {
        el.style.verticalAlign = 'middle';
        el.style.lineHeight = '1.2';
      }
    });

    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);

    // 4. Capture with html2canvas at crisp retina scale
    const canvas = await html2canvas(clone, {
      scale: 2.5, // High-clarity retina resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794
    });

    // 5. Clean up sandbox immediately
    if (sandbox && sandbox.parentNode) {
      document.body.removeChild(sandbox);
      sandbox = null;
    }

    if (options.onProgress) options.onProgress("Generating commercial A4 printable PDF structure...");

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // A4 dimensions: 210mm width x 297mm height
    // Ratio = 297 / 210 = 1.4142857
    const a4Ratio = 297 / 210;
    const pageHeightInCanvasPx = Math.round(canvas.width * a4Ratio);

    // Single-page vs multi-page detection
    if (canvas.height <= pageHeightInCanvasPx + 15) {
      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      const renderHeightMm = Math.min(297, (canvas.height / canvas.width) * 210);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, renderHeightMm);
    } else {
      // Precise multi-page sub-canvas slicing
      const totalPages = Math.ceil(canvas.height / pageHeightInCanvasPx);
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        const sliceHeight = Math.min(pageHeightInCanvasPx, canvas.height - page * pageHeightInCanvasPx);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageHeightInCanvasPx;
        const pctx = pageCanvas.getContext('2d');
        if (pctx) {
          pctx.fillStyle = '#ffffff';
          pctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          pctx.drawImage(
            canvas,
            0, page * pageHeightInCanvasPx, canvas.width, sliceHeight,
            0, 0, pageCanvas.width, sliceHeight
          );
        }

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.96);
        pdf.addImage(pageImgData, 'JPEG', 0, 0, 210, 297);
      }
    }

    if (options.onProgress) options.onProgress("Finalizing PDF download...");
    pdf.save(fileName);
    return true;

  } catch (err: any) {
    console.error("Client PDF generation error, falling back to window.print():", err);
    if (sandbox && sandbox.parentNode) {
      document.body.removeChild(sandbox);
    }
    window.print();
    return false;
  }
};

export const triggerPrintMode = () => {
  window.print();
};

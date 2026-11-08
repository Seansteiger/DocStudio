import html2canvas from 'html2canvas';

export const exportDocumentToPng = async (
  elementId: string = 'document-preview-page',
  fileName?: string
): Promise<boolean> => {
  const targetElement = document.getElementById(elementId) || 
    document.getElementById('document-preview-page') || 
    (document.querySelector('[data-testid="document-canvas"]') as HTMLElement);

  if (!targetElement) return false;

  let sandbox: HTMLDivElement | null = null;

  try {
    // 1. Wait for document fonts
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    } catch {}

    // 2. Wait for images
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

    // 3. Mount isolated unscaled 1:1 sandbox
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

    const clone = targetElement.cloneNode(true) as HTMLElement;
    clone.style.transform = 'none';
    clone.style.width = '794px';
    clone.style.maxWidth = '794px';
    clone.style.minWidth = '794px';
    clone.style.boxShadow = 'none';
    clone.style.border = 'none';
    clone.style.margin = '0';
    clone.style.boxSizing = 'border-box';

    const cells = clone.querySelectorAll('th, td');
    cells.forEach((cell: any) => {
      cell.style.verticalAlign = 'middle';
      cell.style.lineHeight = '1.35';
    });

    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);

    const canvas = await html2canvas(clone, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794
    });

    if (sandbox && sandbox.parentNode) {
      document.body.removeChild(sandbox);
      sandbox = null;
    }

    const link = document.createElement('a');
    link.download = fileName || `DocStudio_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    return true;

  } catch (e) {
    console.error("Failed to render PNG:", e);
    if (sandbox && sandbox.parentNode) {
      document.body.removeChild(sandbox);
    }
    return false;
  }
};

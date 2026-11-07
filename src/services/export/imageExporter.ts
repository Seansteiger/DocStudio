import html2canvas from 'html2canvas';

export const exportDocumentToPng = async (
  elementId: string = 'document-preview-page',
  fileName?: string
): Promise<boolean> => {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) return false;

  try {
    const canvas = await html2canvas(targetElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const link = document.createElement('a');
    link.download = fileName || `DocStudio_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    return true;
  } catch (e) {
    console.error("Failed to render PNG:", e);
    return false;
  }
};

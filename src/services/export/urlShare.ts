import { AnyDocumentData } from '../../types/document';

export interface SharedDocPayload {
  toolId: string;
  templateId?: string;
  data: AnyDocumentData;
}

export const encodeDocumentToShareUrl = (toolId: string, data: AnyDocumentData, templateId?: string): string => {
  const payload: SharedDocPayload = { toolId, templateId, data };
  const jsonString = JSON.stringify(payload);
  
  // Safe UTF-8 Base64 encoding
  const base64 = btoa(
    encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );

  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('docShare', base64);
  return url.toString();
};

export const decodeDocumentFromUrl = (): SharedDocPayload | null => {
  try {
    const params = new URLSearchParams(window.location.search);
    
    // Check new docShare param or legacy cvData param
    const docShare = params.get('docShare');
    if (docShare) {
      let base64 = docShare.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      const decodedString = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(decodedString);
    }

    const legacyCvData = params.get('cvData');
    if (legacyCvData) {
      let base64 = legacyCvData.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      const decodedString = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const cvData = JSON.parse(decodedString);
      return { toolId: '1', data: cvData };
    }

    return null;
  } catch (e) {
    console.error("Failed to decode share URL payload:", e);
    return null;
  }
};

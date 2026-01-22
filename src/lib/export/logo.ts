import 'server-only';

type LogoAssets = {
  pdfLogo: string | null;
  wordLogo: Buffer | null;
};

const parseDataUrl = (value: string): LogoAssets | null => {
  const match = value.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    return null;
  }

  const [, mimeType, data] = match;
  if (!mimeType || !data) {
    return null;
  }

  const buffer = Buffer.from(data, 'base64');
  return { pdfLogo: value, wordLogo: buffer };
};

export const fetchLogoAssets = async (logoUrl?: string | null): Promise<LogoAssets> => {
  if (!logoUrl) {
    return { pdfLogo: null, wordLogo: null };
  }

  if (logoUrl.startsWith('data:')) {
    return parseDataUrl(logoUrl) ?? { pdfLogo: null, wordLogo: null };
  }

  try {
    const res = await fetch(logoUrl);
    if (!res.ok) {
      return { pdfLogo: null, wordLogo: null };
    }

    const contentType = res.headers.get('content-type') || 'image/png';
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    return {
      pdfLogo: `data:${contentType};base64,${base64}`,
      wordLogo: buffer
    };
  } catch (error) {
    console.warn('Failed to fetch logo assets', error);
    return { pdfLogo: null, wordLogo: null };
  }
};

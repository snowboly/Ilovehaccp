import 'server-only';

const DEFAULT_TIMEOUT_MS = 45_000;

export class GotenbergNotConfiguredError extends Error {
  constructor() {
    super('Gotenberg URL is not configured. Set GOTENBERG_URL environment variable.');
    this.name = 'GotenbergNotConfiguredError';
  }
}

export class GotenbergConversionError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'GotenbergConversionError';
  }
}

export function isGotenbergConfigured(): boolean {
  return !!process.env.GOTENBERG_URL;
}

export async function convertDocxToPdfWithGotenberg(docxBuffer: Buffer): Promise<Buffer> {
  const gotenbergUrl = process.env.GOTENBERG_URL;
  if (!gotenbergUrl) {
    throw new GotenbergNotConfiguredError();
  }

  const timeoutMs = Number(process.env.PDF_CONVERSION_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const endpoint = `${gotenbergUrl.replace(/\/$/, '')}/forms/libreoffice/convert`;

  const formData = new FormData();
  // Convert Buffer to ArrayBuffer for Blob compatibility
  const arrayBuffer = docxBuffer.buffer.slice(docxBuffer.byteOffset, docxBuffer.byteOffset + docxBuffer.byteLength) as ArrayBuffer;
  formData.append('files', new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), 'document.docx');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new GotenbergConversionError(
        `Gotenberg conversion failed (${response.status}): ${errorText}`,
        response.status
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    if (!pdfBuffer.length) {
      throw new GotenbergConversionError('Gotenberg returned an empty PDF buffer.');
    }

    return pdfBuffer;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new GotenbergConversionError(`Gotenberg conversion timed out after ${timeoutMs}ms.`);
    }
    if (error instanceof GotenbergConversionError) {
      throw error;
    }
    throw new GotenbergConversionError(`Gotenberg conversion failed: ${error?.message || error}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

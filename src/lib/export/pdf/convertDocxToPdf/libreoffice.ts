import 'server-only';
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const DEFAULT_TIMEOUT_MS = 45_000;

export class LibreOfficeNotAvailableError extends Error {
  constructor(message: string = 'LibreOffice (soffice) is not installed or not available on PATH.') {
    super(message);
    this.name = 'LibreOfficeNotAvailableError';
  }
}

export function isLibreOfficeNotAvailableError(error: unknown): error is LibreOfficeNotAvailableError {
  return error instanceof LibreOfficeNotAvailableError;
}

export async function convertDocxToPdfWithLibreOffice(docxBuffer: Buffer): Promise<Buffer> {
  const runId = randomUUID();
  const tempDir = await fs.mkdtemp(path.join(tmpdir(), `ilovehaccp-export-${runId}-`));
  const baseName = `input-${runId}`;
  const inputPath = path.join(tempDir, `${baseName}.docx`);
  const outputPath = path.join(tempDir, `${baseName}.pdf`);
  const timeoutMs = Number(process.env.PDF_CONVERSION_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);

  try {
    await fs.writeFile(inputPath, docxBuffer);

    try {
      await execFileAsync(
        'soffice',
        [
          '--headless',
          '--nologo',
          '--nofirststartwizard',
          '--convert-to',
          'pdf',
          '--outdir',
          tempDir,
          inputPath
        ],
        { timeout: timeoutMs }
      );
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        throw new LibreOfficeNotAvailableError();
      }
      const message = error?.killed || error?.signal === 'SIGTERM'
        ? `LibreOffice conversion timed out after ${timeoutMs}ms.`
        : `LibreOffice conversion failed: ${error?.message || error}`;
      throw new Error(message);
    }

    try {
      const pdfBuffer = await fs.readFile(outputPath);
      if (!pdfBuffer.length) {
        throw new Error('LibreOffice returned an empty PDF buffer.');
      }
      return pdfBuffer;
    } catch (error: any) {
      throw new Error(`LibreOffice conversion did not produce a PDF: ${error?.message || error}`);
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

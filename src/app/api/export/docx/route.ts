import { NextResponse } from 'next/server';
import { generateWordDocument } from '@/lib/word-generator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9._-]/gi, '_');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = body?.data;
    const lang = (body?.lang || 'en') as 'en' | 'es' | 'fr' | 'pt';
    const logoUrl = body?.logoUrl as string | undefined;

    if (!data) {
      return NextResponse.json({ error: 'Missing data payload' }, { status: 400 });
    }

    let logoBuffer = null;
    if (logoUrl) {
      try {
        const res = await fetch(logoUrl);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          logoBuffer = Buffer.from(arrayBuffer);
        }
      } catch (error) {
        console.warn('Failed to fetch logo for DOCX export', error);
      }
    }

    const buffer = await generateWordDocument({ ...data, logoBuffer }, lang);

    const baseName = data.businessName || 'HACCP_Plan';
    const fileName = sanitizeFileName(body?.fileName || `${baseName}.docx`);

    const responseBody = Buffer.isBuffer(buffer)
      ? buffer
      : buffer instanceof ArrayBuffer
        ? new Uint8Array(buffer)
        : buffer;

    return new NextResponse(responseBody as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
  } catch (error: any) {
    console.error('DOCX Export Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

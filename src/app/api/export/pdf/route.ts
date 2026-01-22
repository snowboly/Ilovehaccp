import React from 'react';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import HACCPDocument from '@/components/pdf/HACCPDocument';
import { getDictionary } from '@/lib/locales';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9._-]/gi, '_');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = body?.data;
    const lang = (body?.lang || 'en') as 'en' | 'es' | 'fr' | 'pt';
    const logo = body?.logo || null;
    const template = body?.template || 'audit-classic';

    if (!data) {
      return NextResponse.json({ error: 'Missing data payload' }, { status: 400 });
    }

    const dict = getDictionary(lang).pdf;
    const pdfBuffer = await renderToBuffer(
      React.createElement(HACCPDocument, { data, dict, logo, template })
    );

    const baseName = data.businessName || 'HACCP_Plan';
    const fileName = sanitizeFileName(body?.fileName || `${baseName}.pdf`);

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
  } catch (error: any) {
    console.error('PDF Export Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

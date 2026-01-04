import { NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export async function POST(req: Request) {
  try {
    const { product } = await req.json();

    if (!product) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert Food Safety AI. 
    Analyze the given food product and identify ONE primary biological or chemical hazard and ONE scientific control measure (Critical Limit).
    
    Output Format: Strict JSON
    {
      "hazard": "Hazard name and specific pathogen",
      "control": "Specific scientific control measure or critical limit"
    }`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Product: ${product}` },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 150,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No content received');

    return NextResponse.json(JSON.parse(content));
  } catch (error: any) {
    console.error('Demo API Error:', error);
    return NextResponse.json({ 
      hazard: "Biological: General Pathogen Risk", 
      control: "Follow standard HACCP thermal processing guidelines." 
    });
  }
}

import { NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan, language = 'en' } = body;

    const HACCPSYSTEM_VALIDATION_PROMPT = `You are acting as an independent HACCP auditor.
Your task is to REVIEW a completed HACCP plan for quality,
completeness, and Codex Alimentarius compliance.

IMPORTANT RULES:
- You must NOT rewrite the HACCP plan.
- You must NOT invent missing data.
- You must NOT suggest new hazards or CCPs.
- You must ONLY evaluate what is present.

VALIDATION CRITERIA:
1. Codex 12 Steps completeness
2. Hazard analysis clarity per process step
3. Logical linkage between hazards, CCPs, and controls
4. CCP critical limits clarity and measurability
5. Monitoring practicality
6. Corrective actions effectiveness
7. Verification and validation adequacy
8. Record-keeping clarity
9. Internal consistency
10. Audit readiness

NOTE: Absence of CCPs is acceptable if all hazards are effectively controlled by PRPs (Prerequisite Programs) and the hazard analysis justifies this decision. Do not flag "No CCPs" as a major gap unless significant hazards remain uncontrolled.

RECOMMENDATION GENERATION:
For EACH validation finding (Major or Minor gap/risk/weakness), generate a Recommendation object.
Language MUST be non-directive (e.g. "Review whether...", "Consider documenting...").
Do NOT use prescriptive words like "Set", "Change", "Must".

OUTPUT STRUCTURE (mandatory):
Return a JSON object with these exact keys:
- section_1_overall_assessment: { rating: "Excellent" | "Acceptable" | "Weak", audit_readiness: "Ready" | "Minor gaps" | "Major gaps" }
- section_2_strengths: string[]
- section_3_weaknesses_risks: { weakness: string, section: string }[]
- section_4_auditor_red_flags: { item: string, type: "Minor non-conformity" | "Major non-conformity" }[]
- advisory_recommendations: {
    gap_type: "MAJOR" | "MINOR",
    issue_summary: string,
    why_it_matters: string,
    recommendation_text: string,
    related_haccp_principle: string,
    related_builder_section: string
}[]

Do not include disclaimers.
Do not mention AI.`;

    const userPrompt = JSON.stringify(plan);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: HACCPSYSTEM_VALIDATION_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No content');

    const parsedContent = JSON.parse(content);
    
    // Logic to block export if Major gaps are detected
    const block_export = parsedContent.section_1_overall_assessment?.audit_readiness === "Major gaps";

    return NextResponse.json({ ...parsedContent, block_export });

  } catch (error) {
    console.error('Auditor Review Error:', error);
    return NextResponse.json({ error: 'Review failed' }, { status: 500 });
  }
}

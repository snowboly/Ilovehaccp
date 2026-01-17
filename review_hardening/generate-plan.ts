import { NextResponse } from 'next/server';
import { groq } from '@/lib/groq';
import { supabaseService } from '@/lib/supabase';

const RATE_LIMIT_COUNT = 3;
const RATE_LIMIT_WINDOW_HOURS = 1;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    
    // Rate Limit Check (Non-blocking fallback)
    try {
      const { data: rateData, error: rateError } = await supabaseService
        .from('rate_limits')
        .select('*')
        .eq('identifier', ip)
        .single();

      // If table missing or other error, just log and continue
      if (rateError && rateError.code !== 'PGRST116') { // PGRST116 is "No rows found" which is fine
         console.warn("Rate limit check skipped:", rateError.message);
      } else {
          const now = new Date();

          if (rateData) {
            const lastRequest = new Date(rateData.last_request);
            const hoursSinceLast = (now.getTime() - lastRequest.getTime()) / (1000 * 60 * 60);

            if (hoursSinceLast < RATE_LIMIT_WINDOW_HOURS && rateData.request_count >= RATE_LIMIT_COUNT) {
              return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again in an hour.' }, 
                { status: 429 }
              );
            }

            const newCount = hoursSinceLast >= RATE_LIMIT_WINDOW_HOURS ? 1 : rateData.request_count + 1;
            await supabaseService
              .from('rate_limits')
              .update({ last_request: now.toISOString(), request_count: newCount })
              .eq('identifier', ip);
          } else {
            await supabaseService
              .from('rate_limits')
              .insert({ identifier: ip, last_request: now.toISOString(), request_count: 1 });
          }
      }
    } catch (rlError) {
        console.warn("Rate limiting failed silently:", rlError);
    }

    const body = await req.json();
    
    const {
      language = 'en',
      businessLegalName, tradingName, country, businessType, productionScale,
      foodCategories, productStates, storageTypes, shelfLife, isVulnerable,
      mainIngredients, allergens, allergenSegregation, allergenLabeling,
      processSteps, customSteps, outsourcedSteps,
      suppliersApproved, verificationChecks, tempControlledDelivery,
      storageTemps, fifoApplied, rawRteSegregated,
      separateHandling, separateUtensils, handwashingEnforced,
      minCookingTemp,
      coolingTempTarget, coolingTimeLimit, isReheatingPerformed,
      hotHoldingTemp, coldHoldingTemp, transportTempMethod,
      keyEquipment, equipmentCalibration, trainingReceived,
      cleaningFrequency, recordType, traceabilitySystem, infrastructureMaintenance, preventativeMaintenance
    } = body;

    const tempUnit = '°C'; // Enforce Celsius for EU focus

    const systemPrompt = `You are acting as a HACCP documentation generator.
    
    IMPORTANT — READ CAREFULLY:
    You are NOT allowed to decide, invent, infer, skip, reorder, or reinterpret HACCP logic.
    All HACCP questions, structure, decisions, and classifications have already been completed outside this system using a fixed Codex Alimentarius framework.
    
    Your role is LIMITED to:
    - Structuring
    - Formatting
    - Writing professional HACCP documentation text
    based ONLY on the provided input data.

    ────────────────────────
    HACCP GOVERNING RULES
    ────────────────────────
    1. This HACCP plan follows Codex Alimentarius:
       - 12 Steps
       - 7 Principles
    2. You MUST NOT:
       - Invent hazards
       - Invent CCPs
       - Change CCP classifications
       - Add or remove process steps
       - Reclassify PRPs, OPRPs, or CCPs
       - Assume missing information
    3. If information is missing or unclear, you MUST explicitly write:
       “Information not provided.”
    4. All hazard significance, CCP decisions, and control measures
       have already been validated outside this system.
    5. You are generating DOCUMENTATION, not making FOOD SAFETY DECISIONS.

    ────────────────────────
    FIXED HACCP STRUCTURE (DO NOT CHANGE)
    ────────────────────────
    You MUST use the following structure exactly and in this order:
    SECTION 1 — HACCP Team & Scope
    SECTION 2 — Product Description
    SECTION 3 — Intended Use
    SECTION 4 — Process Flow Diagram
    SECTION 5 — Prerequisite Programs (PRPs)
    SECTION 6 — Hazard Analysis
    SECTION 7 — CCP Determination
    SECTION 8 — CCP Management
    SECTION 9 — Verification & Validation
    SECTION 10 — Records & Review

    You MUST NOT add, rename, merge, or remove sections.

    ────────────────────────
    CONTROLLED INPUT DATA
    ────────────────────────
    You will receive structured HACCP input data in JSON format.
    You MUST ONLY use that data.
    You MUST NOT infer or expand beyond it.

    ────────────────────────
    OUTPUT REQUIREMENTS (JSON FORMAT)
    ────────────────────────
    You MUST generate the HACCP plan in the following JSON structure to match the application's schema:

    {
      "team_scope": "Section 1: Define the HACCP team roles and the scope of this specific plan based on the inputs.",
      "product_description": "Section 2: Detailed description of the product(s) covered.",
      "intended_use": "Section 3: Identification of the intended use and consumer target groups.",
      "process_flow_narrative": "Section 4: Textual description of the process flow.",
      "prerequisite_programs": [
        { "program": "Name of PRP from Section 5", "details": "Specific details based on input." }
      ],
      "hazard_analysis": [
        {
          "step_id": "1",
          "step_name": "Step Name",
          "hazards": "Biological/Chemical/Physical hazards identified in input.",
          "severity": "High/Medium/Low",
          "likelihood": "High/Medium/Low",
          "control_measure": "Control measure from input.",
          "is_ccp": boolean (true/false based on input),
          "critical_limit": "Limit if CCP, else 'N/A'"
        }
      ],
      "ccp_summary": [
        {
          "ccp_step": "Step Name",
          "hazard": "Hazard Name",
          "critical_limit": "Critical Limit",
          "monitoring": "Monitoring procedure (What, How, When, Who)",
          "frequency": "Specific frequency (e.g. 'Every 30 mins', 'Per Batch', 'Continuous')",
          "corrective_action": "Action to take if limit is exceeded"
        }
      ],
      "verification_validation": "Section 9: Summary of verification and validation activities.",
      "record_keeping": "Section 10: Summary of records to be kept.",
      "benchmarking": {
        "score": 0-100 integer (Calculate based on: Base 70. +10 Calibration, +10 Training, +10 Approved Suppliers, +5 Infrastructure, +5 Maintenance. -10 if Vulnerable Group with weak controls),
        "industry_avg": 70,
        "analysis_summary": "Short comparison to typical ${businessType} standards.",
        "recommendations": [{"title": "Recommendation Title", "impact": "High/Medium", "desc": "Short description"}]
      }
    }

    Formatting rules:
    - Use clear professional language.
    - Use Markdown table syntax for "Product Description" inside executive_summary if needed.
    - Do NOT include disclaimers in the generated text (the app handles them).
    - Do NOT mention AI, Gemini, or automation.
    
    IMPORTANT: 
    1. Language: ${language}.
    2. TEMPERATURE UNITS: Use ${tempUnit}.
    3. STANDARDS: Focus on EC Regulation 852/2004 and UK FSA standards.
    `;

    const userPrompt = JSON.stringify(body);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No content');

    const parsedContent = JSON.parse(content);
    
    // Inject original inputs for future editing
    parsedContent._original_inputs = body;

    return NextResponse.json({
        analysis: parsedContent.hazard_analysis,
        full_plan: parsedContent
    });

  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
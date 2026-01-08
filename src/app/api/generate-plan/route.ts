import { NextResponse } from 'next/server';
import { groq } from '@/lib/groq';
import { supabaseService } from '@/lib/supabase';

const RATE_LIMIT_COUNT = 3;
const RATE_LIMIT_WINDOW_HOURS = 1;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    
    const { data: rateData } = await supabaseService
      .from('rate_limits')
      .select('*')
      .eq('identifier', ip)
      .single();

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
      cookingMethods, minCookingTemp,
      coolingTempTarget, coolingTimeLimit, isReheatingPerformed,
      hotHoldingTemp, coldHoldingTemp, transportTempMethod,
      keyEquipment, equipmentCalibration, trainingReceived,
      cleaningFrequency, recordType, infrastructureMaintenance, preventativeMaintenance
    } = body;

    const tempUnit = (country || '').toLowerCase().includes('usa') || (country || '').toLowerCase().includes('united states') ? '°F' : '°C';

    const systemPrompt = `You are an expert Food Safety Consultant and HACCP Lead Auditor. 
    Your task is to generate a professional, high-authority HACCP Plan.
    
    IMPORTANT: 
    1. Language: ${language}.
    2. TEMPERATURE UNITS: Use ${tempUnit}.
    
    Output Format (JSON):
    {
      "executive_summary": "...",
      "benchmarking": {
        "score": 0-100 integer,
        "industry_avg": 70,
        "analysis_summary": "Comparison to typical ${businessType} standards.",
        "recommendations": [{"title": "...", "impact": "High/Medium", "desc": "..."}]
      },
      "prerequisite_programs": [{"program": "...", "details": "..."}],
      "process_flow_narrative": "...",
      "hazard_analysis": [
        {
          "step_id": "1",
          "step_name": "Receiving",
          "hazards": "...",
          "control_measure": "...",
          "is_ccp": false,
          "critical_limit": "N/A"
        }
      ],
      "ccp_summary": [
        {
          "ccp_step": "...",
          "hazard": "...",
          "critical_limit": "...",
          "monitoring": "...",
          "corrective_action": "..."
        }
      ]
    }

    Benchmarking Logic:
    - Base score 70. 
    - Adjust +10 for Calibration='Yes', +10 for Training='Yes', +10 for Approved Suppliers='Yes'.
    - Adjust +5 for Infrastructure='Yes' and +5 for Preventative Maintenance='Yes'.
    - Adjust -10 if 'isVulnerable' is 'Yes' but controls look basic.
    `;

    const userPrompt = `
      Business: ${businessLegalName} | Type: ${businessType} | Country: ${country}
      Ingredients: ${mainIngredients?.join(', ')} | Allergens: ${allergens?.join(', ')}
      Steps: ${processSteps?.map((s: any) => s.name).join(', ')}
      Controls: Calibration=${equipmentCalibration}, Training=${trainingReceived}, Suppliers=${suppliersApproved}, Infrastructure=${infrastructureMaintenance}, Maintenance=${preventativeMaintenance}
    `;

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
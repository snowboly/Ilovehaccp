import { NextResponse } from 'next/server';
import { groq } from '@/lib/groq';
import { supabaseService } from '@/lib/supabase';

const RATE_LIMIT_COUNT = 3;
const RATE_LIMIT_WINDOW_HOURS = 1;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    
    // 1. Check Rate Limit
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
      businessLegalName, tradingName, country, regulation, businessType, productionScale,
      foodCategories, productStates, storageTypes, shelfLife, isVulnerable,
      mainIngredients, allergens, allergenSegregation, allergenLabeling,
      processSteps, customSteps, outsourcedSteps,
      verificationChecks, tempControlledDelivery,
      storageTemps, fifoApplied, rawRteSegregated,
      separateHandling, separateUtensils, handwashingEnforced,
      cookingMethods, minCookingTemp, cookingIsCcp,
      coolingMethods, coolingTempTarget, coolingTimeLimit, isReheatingPerformed, reheatingTempTarget,
      hotHoldingTemp, coldHoldingTemp, transportTempMethod,
      keyEquipment, equipmentCalibration, // New
      cleaningFrequency, cleaningChemicals,
      pestControlContract, pestMonitoringDevices,
      trainingFrequency, recordType
    } = body;

    const tempUnit = (country || '').toLowerCase().includes('usa') || (country || '').toLowerCase().includes('united states') ? '°F' : '°C';

    const systemPrompt = `You are an expert Food Safety Consultant and HACCP Lead Auditor. 
    Your task is to generate a professional, high-authority HACCP Plan based on the user's detailed inputs.
    
    IMPORTANT: 
    1. You MUST generate all text content in the following language: ${language}.
    2. TEMPERATURE UNITS: Use ${tempUnit} for all temperature references.
    
    Output Format:
    Strict JSON object with the following structure:
    {
      "executive_summary": "A brief professional summary of the business context and scope.",
      "prerequisite_programs": [
        {"program": "Cleaning & Sanitation", "details": "Summary of their cleaning protocols..."},
        {"program": "Maintenance & Calibration", "details": "Summary of equipment maintenance and the ${equipmentCalibration} calibration status..."},
        {"program": "Pest Control", "details": "Summary..."},
        {"program": "Allergen Management", "details": "Summary..."}
      ],
      "process_flow_narrative": "A text description of the process flow from receiving to dispatch.",
      "hazard_analysis": [
        {
          "step_id": "1",
          "step_name": "Receiving",
          "hazards": "Biological (Pathogens), Physical (Foreign bodies)",
          "control_measure": "Visual inspection, Temp check",
          "is_ccp": false,
          "critical_limit": "N/A"
        }
      ],
      "ccp_summary": [
        {
          "ccp_step": "Cooking",
          "hazard": "Survival of pathogens",
          "critical_limit": "75°C for 30s",
          "monitoring": "Core temp check",
          "corrective_action": "Continue cooking"
        }
      ]
    }

    Validation Rules:
    1. If 'isVulnerable' is Yes, increase hazard significance.
    2. 'hazard_analysis' must cover every step in user process steps.
    3. Use ${tempUnit} exclusively.
    `;

    const userPrompt = `
      Name: ${businessLegalName} (${tradingName}) | Type: ${businessType} | Region: ${country}
      Ingredients: ${mainIngredients?.join(', ')} | Allergens: ${allergens?.join(', ')}
      Steps: ${processSteps?.map((s: any) => s.name).join(', ')} | Custom: ${customSteps}
      Controls: Calibration=${equipmentCalibration}, CookingTemp=${minCookingTemp}, CoolingTarget=${coolingTempTarget}
      Storage: ${storageTypes?.join(', ')} | Scales: ${productionScale}
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
    if (!content) throw new Error('No content received from AI');

    const parsedContent = JSON.parse(content);
    return NextResponse.json({
        analysis: parsedContent.hazard_analysis,
        full_plan: parsedContent
    });

  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}

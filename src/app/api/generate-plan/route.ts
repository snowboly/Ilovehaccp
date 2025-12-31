import { NextResponse } from 'next/server';
import { groq } from '@/lib/groq';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Destructure all 18 sections from the body
    const {
      language = 'en',
      // Section 1
      businessLegalName, tradingName, country, regulation, businessType, employeeCount, productionScale, haccpScope, certifications,
      // Section 2
      foodCategories, productStates, productCharacteristics, shelfLife, isVulnerable, packagingTypes,
      // Section 3
      mainIngredients, allergens, allergensHandled, allergenSegregation, allergenLabeling,
      // Section 4
      processSteps, customSteps, outsourcedSteps,
      // Section 5
      suppliersApproved, verificationChecks, tempControlledDelivery, rejectNonConforming,
      // Section 6
      storageTypes, storageTemps, fifoApplied, rawRteSegregated, storageAllergenSegregation,
      // Section 7
      separateHandling, separateUtensils, handwashingEnforced, prepTimeLimits, chemicalsInPrep,
      // Section 8
      doYouCook, cookingMethods, minCookingTemp, tempRecorded, cookingIsCcp,
      // Section 9
      isFoodCooled, coolingMethods, coolingTimeLimit, coolingTempTarget, isReheatingPerformed, reheatingTempTarget, reheatingLimitedOnce,
      // Section 10
      hotHoldingTemp, coldHoldingTemp, maxHoldingTime, isTransported, transportTempMethod, transportTempMonitored,
      // Section 11
      keyEquipment, devicesCalibrated, calibrationFrequency, preventiveMaintenance, foreignBodyControls,
      // Section 12
      cleaningSchedulesDocumented, cleaningFrequency, cleaningChemicals, chemicalsStoredSeparately, cleaningVerified,
      // Section 13
      trainingReceived, trainingFrequency, hygieneRulesDocumented, healthDeclarations, ppeUsed,
      // Section 14
      ccpsMonitored, monitoringFrequency, recordsKept, retentionPeriod, recordType,
      // Section 15
      correctiveActionsDefined, correctiveActionExamples, productIsolation, rootCauseAnalysis,
      // Section 16
      internalAudits, auditFrequency, externalAudits, annualReview, reviewTriggers,
      // Section 17
      pestControlContract, pestMonitoringDevices, pestSightingReporting
    } = body;

    const systemPrompt = `You are an expert Food Safety Consultant and HACCP Lead Auditor. 
    Your task is to generate a professional, audit-ready HACCP Plan based on the user's detailed inputs.
    
    IMPORTANT: You MUST generate all text content (summary, program details, hazards, control measures, etc.) in the following language: ${language}.
    
    Output Format:
    Strict JSON object with the following structure:
    {
      "executive_summary": "A brief professional summary of the business context and scope.",
      "prerequisite_programs": [
        {"program": "Cleaning & Sanitation", "details": "Summary of their cleaning protocols based on inputs..."},
        {"program": "Pest Control", "details": "Summary of pest control..."},
        {"program": "Allergen Management", "details": "Summary of allergen controls..."}
        // Add summaries for Training, Maintenance, etc.
      ],
      "process_flow_narrative": "A text description of the process flow from receiving to dispatch.",
      "hazard_analysis": [
        {
          "step_id": "1",
          "step_name": "Receiving",
          "hazards": "Biological (Pathogens on raw meat), Physical (Foreign bodies)",
          "control_measure": "Check approved supplier list, Visual inspection",
          "is_ccp": false,
          "critical_limit": "N/A"
        }
        // ... Generate rows for ALL process steps provided by the user
      ],
      "ccp_summary": [
        {
          "ccp_step": "Cooking",
          "hazard": "Survival of pathogens",
          "critical_limit": "75°C for 30s",
          "monitoring": "Check core temp every batch",
          "corrective_action": "Continue cooking until temp reached"
        }
        // ... Only for steps identified as CCPs
      ]
    }

    Validation Rules:
    1. If 'isVulnerable' is Yes, increase hazard significance for biological hazards.
    2. If 'doYouCook' is Yes, 'Cooking' MUST be evaluated as a potential CCP.
    3. If 'allergens' list is not empty, include Allergen Management in PRPs and hazards at Receiving/Storage.
    4. Use the specific temperatures provided by the user in Critical Limits (e.g. ${minCookingTemp}, ${coolingTempTarget}).
    5. 'hazard_analysis' array must cover every step in 'processSteps'.
    `;

    const userPrompt = `
      --- BUSINESS CONTEXT ---
      Name: ${businessLegalName} (${tradingName})
      Type: ${businessType} | Scale: ${productionScale}
      Region: ${country} | Regulation: ${regulation}
      
      --- PRODUCT DETAILS ---
      Categories: ${foodCategories?.join(', ')}
      States: ${productStates?.join(', ')}
      Storage: ${storageTypes?.join(', ')}
      Shelf Life: ${shelfLife}
      Vulnerable Consumers: ${isVulnerable}
      
      --- INGREDIENTS & ALLERGENS ---
      Ingredients: ${mainIngredients?.join(', ')}
      Allergens: ${allergens?.join(', ')}
      Allergen Controls: Segregation=${allergenSegregation}, Labeling=${allergenLabeling}
      
      --- PROCESS STEPS ---
      Steps: ${processSteps?.map((s: any) => s.name).join(', ')}
      Custom Steps: ${customSteps}
      Outsourced: ${outsourcedSteps}
      
      --- OPERATIONAL CONTROLS ---
      Receiving: Verified=${verificationChecks?.join(', ')}, Temp Controlled=${tempControlledDelivery}
      Storage: Temps=${storageTemps}, FIFO=${fifoApplied}, Raw/RTE Segregated=${rawRteSegregated}
      Prep: Separate Handling=${separateHandling}, Utensils=${separateUtensils}, Handwashing=${handwashingEnforced}
      
      --- PROCESSING PARAMETERS ---
      Cooking: Method=${cookingMethods?.join(', ')}, Min Temp=${minCookingTemp}, CCP=${cookingIsCcp}
      Cooling: Method=${coolingMethods?.join(', ')}, Target=${coolingTempTarget}, Time=${coolingTimeLimit}
      Reheating: Target=${reheatingTempTarget}
      Holding: Hot=${hotHoldingTemp}, Cold=${coldHoldingTemp}
      Transport: Method=${transportTempMethod}
      
      --- PREREQUISITE PROGRAMS (PRPs) ---
      Equipment: ${keyEquipment?.join(', ')}, Calibration=${devicesCalibrated}
      Cleaning: Freq=${cleaningFrequency}, Chemicals=${cleaningChemicals?.join(', ')}
      Pest Control: Contract=${pestControlContract}, Devices=${pestMonitoringDevices?.join(', ')}
      Training: Freq=${trainingFrequency}
      Records: Type=${recordType}
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
    
    if (!content) {
      throw new Error('No content received from AI');
    }

    const parsedContent = JSON.parse(content);
    return NextResponse.json({
        analysis: parsedContent.hazard_analysis, // Keep backward compatibility for the table
        full_plan: parsedContent // Send full structure for the PDF/Future usage
    });

  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { HACCPSectionData } from '@/types/haccp';
import HACCPQuestionnaire from './HACCPQuestionnaire';

// Import all JSON schemas
import productQuestions from '@/data/haccp/haccp_product_description_questions_v1.json';
import processQuestions from '@/data/haccp/haccp_process_flow_questions_v1.json';
import prpQuestions from '@/data/haccp/haccp_prerequisite_programs_questions_v1.json';
import hazardQuestions from '@/data/haccp/haccp_hazard_analysis_questions_v1.json';
import ccpDeterminationQuestions from '@/data/haccp/haccp_ccp_determination_questions_v1.json';
import ccpManagementQuestions from '@/data/haccp/haccp_ccp_management_questions_v1.json';
import validationQuestions from '@/data/haccp/haccp_verification_validation_review_v1.json';
import { generateHACCPWordDoc } from '@/lib/export-utils';
import { AlertTriangle, Info, Edit, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Tooltip } from '@/components/ui/Tooltip';

type SectionKey = 
  | 'product' 
  | 'process' 
  | 'prp' 
  | 'hazards' 
  | 'ccp_determination' 
  | 'ccp_management' 
  | 'validation'
  | 'generating'
  | 'validating'
  | 'complete';

export default function HACCPMasterFlow() {
  const [currentSection, setCurrentSection] = useState<SectionKey>('product');
  const [allAnswers, setAllAnswers] = useState<any>({});
  const [draftId, setDraftId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef<any>(null);

  // 1. Initialize Draft on Mount
  useEffect(() => {
    const initDraft = async () => {
        // Check for existing plan first (Persistence)
        const planId = localStorage.getItem('haccp_plan_id');
        if (planId) {
            try {
                const res = await fetch(`/api/admin/plans/${planId}`, { headers: { Authorization: '' } }); // Oops, need auth or public endpoint?
                // api/admin/plans/[id] is protected.
                // We should use /api/plans/[id] if available? Or verify if we can access it.
                // Actually, the user might be anonymous.
                // HACCPBuilder.tsx uses `/api/plans/${loadId}`.
                // I should use that.
                
                const planRes = await fetch(`/api/plans/${planId}`);
                if (planRes.ok) {
                    const data = await planRes.json();
                    if (data.plan) {
                        setGeneratedPlan(data.plan);
                        setValidationReport(data.plan.full_plan?.validation);
                        setAllAnswers(data.plan.full_plan?._original_inputs || {});
                        setValidationStatus(data.plan.full_plan?.validation ? 'completed' : 'idle');
                        setCurrentSection('complete');
                        return;
                    }
                }
            } catch (e) { console.error("Failed to restore plan"); }
        }

        const storedId = localStorage.getItem('haccp_draft_id');
        if (storedId) {
            try {
                const res = await fetch(`/api/drafts/${storedId}`);
                if (res.ok) {
                    const data = await res.json();
                    setDraftId(storedId);
                    if (data.draft?.answers) {
                        setAllAnswers(data.draft.answers);
                    }
                    return;
                }
            } catch (e) {
                console.error("Failed to restore draft");
            }
        }

        try {
            const res = await fetch('/api/drafts', { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setDraftId(data.draftId);
                localStorage.setItem('haccp_draft_id', data.draftId);
            }
        } catch (e) {
            console.error("Failed to create draft");
        }
    };
    
    initDraft();
  }, []);

  // 2. Autosave with Debounce & Serial Queue
  useEffect(() => {
    if (!draftId || Object.keys(allAnswers).length === 0) return;

    // Queue the latest state
    pendingSaveRef.current = allAnswers;

    if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
    }

    const performSave = async () => {
        if (isSavingRef.current) {
            // If already saving, retry in 1s
            saveTimeoutRef.current = setTimeout(performSave, 1000);
            return;
        }

        const dataToSave = pendingSaveRef.current;
        if (!dataToSave) return;

        isSavingRef.current = true;
        
        try {
            await fetch(`/api/drafts/${draftId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: dataToSave })
            });
            // If the pending data is what we just saved, clear it
            if (pendingSaveRef.current === dataToSave) {
                pendingSaveRef.current = null;
            }
        } catch (e) {
            console.error("Autosave failed", e);
        } finally {
            isSavingRef.current = false;
            // If new data came in while saving, trigger another save immediately
            if (pendingSaveRef.current) {
                performSave();
            }
        }
    };

    saveTimeoutRef.current = setTimeout(performSave, 2000); // 2s debounce

    return () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [allAnswers, draftId]);

  // 3. Attach Anonymous Draft to User on Login
  useEffect(() => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session && draftId) {
              try {
                  await fetch('/api/drafts/attach', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${session.access_token}`
                      },
                      body: JSON.stringify({ draftId })
                  });
              } catch (e) {
                  console.error("Failed to attach draft to user", e);
              }
          }
      });

      return () => subscription.unsubscribe();
  }, [draftId]);
  
  // State for loops
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentCCPIndex, setCurrentCCPIndex] = useState(0);
  const [identifiedCCPs, setIdentifiedCCPs] = useState<any[]>([]);

  // Generation & Validation State
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [validationReport, setValidationReport] = useState<any>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [exportTemplate, setExportTemplate] = useState('Audit Classic');

  // Helper: Detect Generic Risk Pattern
  const checkGenericRiskPattern = () => {
    const hazards = allAnswers.hazard_analysis || [];
    if (hazards.length < 3) return false;

    // Extract all evaluations
    const evaluations = hazards.map((h: any) => ({
        s: h.data?.hazard_evaluation?.severity,
        l: h.data?.hazard_evaluation?.likelihood
    })).filter((e: any) => e.s && e.l);

    if (evaluations.length < 3) return false;

    // Check if all are identical
    const first = evaluations[0];
    return evaluations.every((e: any) => e.s === first.s && e.l === first.l);
  };

  // Helper: Flatten Significant Hazards for CCP Loop
  const getSignificantHazards = (answers = allAnswers) => {
      const flattened: any[] = [];
      const analysis = answers.hazard_analysis || [];
      
      analysis.forEach((stepData: any) => {
          const d = stepData.data;
          
          // d.hazard_evaluation is now keyed by hazard ID (bio, chem, phys, allergen)
          const evaluations = d.hazard_evaluation || {};
          const controls = d.control_measures || {}; // Also keyed by hazard ID if it uses group_per_hazard
          
          // Map of hazard IDs to human readable names
          const hazardMap: Record<string, string> = {
              bio: d.hazard_identification?.bio_hazards_description || "Biological Hazard",
              chem: d.hazard_identification?.chem_hazards_description || "Chemical Hazard",
              phys: d.hazard_identification?.phys_hazards_description || "Physical Hazard",
              allergen: d.hazard_identification?.allergen_hazards_description || "Allergen Hazard"
          };

          // Iterate over potential hazard keys
          ['bio', 'chem', 'phys', 'allergen'].forEach(key => {
              const evalData = evaluations[key];
              if (evalData && evalData.is_significant === true) {
                  flattened.push({
                      step_name: stepData.step_id,
                      hazards: hazardMap[key],
                      severity: evalData.severity,
                      likelihood: evalData.likelihood,
                      control_measure: controls[key]?.applied_controls // Get controls for this specific hazard
                  });
              }
          });
      });
      
      // Map step_id to step_name
      const steps = answers.process?.process_steps || [];
      return flattened.map(h => {
          const step = steps.find((s: any) => s.step_id === h.step_name) || { step_name: h.step_name };
          return { ...h, step_name: step.step_name };
      });
  };

  // Helper: Evaluate CCP based on Codex Decision Tree
  const evaluateCCP = (answers: any) => {
      const q1 = answers.q1_control_measure;
      const q2 = answers.q2_step_designed_to_eliminate;
      const q3 = answers.q3_contamination_possible;
      const q4 = answers.q4_subsequent_step;

      if (q1 === false) return false;
      if (q2 === true) return true;
      if (q2 === false && q3 === true && q4 === false) return true;
      return false;
  };

  const getIdentifiedCCPs = (answers = allAnswers) => {
      return (answers.ccp_decisions || []).filter((d: any) => d.is_ccp === true);
  };

  const handleSectionComplete = async (sectionKey: SectionKey, data: any) => {
    // Merge data
    const newAnswers = { ...allAnswers, [sectionKey]: data };
    setAllAnswers(newAnswers);

    // Navigation Logic
    switch (sectionKey) {
      case 'product':
        setCurrentSection('process');
        break;
      
      case 'process':
        setCurrentSection('prp');
        break;
      
      case 'prp':
        // Start Hazard Analysis Loop
        if (newAnswers.process?.process_steps?.length > 0) {
            setCurrentStepIndex(0);
            setCurrentSection('hazards');
        } else {
            alert("No process steps defined!");
            setCurrentSection('process');
        }
        break;
      
      case 'hazards':
        // Check if more steps remain
        const steps = newAnswers.process.process_steps;
        if (currentStepIndex < steps.length - 1) {
            const existingHazards = newAnswers.hazard_analysis || [];
            const stepId = steps[currentStepIndex].step_id || steps[currentStepIndex].step_name;
            newAnswers.hazard_analysis = [...existingHazards, { step_id: stepId, data }];
            setAllAnswers(newAnswers);
            setCurrentStepIndex(prev => prev + 1);
        } else {
            // Loop done. Save final one.
             const existingHazards = newAnswers.hazard_analysis || [];
             const stepId = steps[currentStepIndex].step_id || steps[currentStepIndex].step_name;
             newAnswers.hazard_analysis = [...existingHazards, { step_id: stepId, data }];
             setAllAnswers(newAnswers);

            // Check if any significant hazards were identified
            const sigHazards = getSignificantHazards(newAnswers);
            if (sigHazards.length === 0) {
                setCurrentSection('validation'); // Skip CCP steps entirely
            } else {
                setCurrentCCPIndex(0);
                setIdentifiedCCPs([]);
                setCurrentSection('ccp_determination');
            }
        }
        break;
        
      case 'ccp_determination':
         const sigHazards = getSignificantHazards();
         const currentHazard = sigHazards[currentCCPIndex];

         // Save decision for CURRENT hazard
         const isCCPResult = evaluateCCP(data);
         const decision = {
             step_name: currentHazard.step_name,
             hazard: currentHazard.hazards,
             is_ccp: isCCPResult,
             answers: data
         };
         
         const updatedCCPs = [...identifiedCCPs, decision];
         setIdentifiedCCPs(updatedCCPs);
         
         if (currentCCPIndex < sigHazards.length - 1) {
             setCurrentCCPIndex(prev => prev + 1);
         } else {
             // Loop done
             newAnswers.ccp_decisions = updatedCCPs;
             setAllAnswers(newAnswers);
             
             // Conditionally show CCP Management
             const hasCCPs = updatedCCPs.some(ccp => ccp.is_ccp);
             if (hasCCPs) {
                 setCurrentCCPIndex(0);
                 setCurrentSection('ccp_management');
             } else {
                 setCurrentSection('validation');
             }
         }
         break;

      case 'ccp_management':
        const ccpList = getIdentifiedCCPs();
        
        // Transform the nested group answers back into the array structure
        const flattenedManagement = ccpList.map((ccp: any) => {
            const groupKey = `ccp_${ccp.step_name}_${ccp.hazard}`.replace(/[^a-zA-Z0-9]/g, '_');
            const groupData = data[groupKey] || {};
            
            return {
                ccp_id: groupKey,
                step_name: ccp.step_name,
                hazard: ccp.hazard,
                ...groupData
            };
        });

        // Save
        newAnswers.ccp_management = flattenedManagement;
        setAllAnswers(newAnswers);
        setCurrentSection('validation');
        break;

      case 'validation':
        setCurrentSection('generating');
        await generatePlan(newAnswers);
        break;
    }

    // Force scroll to top on section change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generatePlan = async (answers: any) => {
    try {
        const payload = {
            ...answers,
            metadata: {
                framework_version: "1.0.0",
                question_set_versions: {
                    product: "1.0.0",
                    process: "1.0.0",
                    prp: "1.0.0",
                    hazards: "1.0.0",
                    ccp: "1.0.0",
                    validation: "1.0.0"
                }
            }
        };

        const res = await fetch('/api/generate-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        setGeneratedPlan(data);
        setCurrentSection('complete'); 
        setValidationStatus('idle');
    } catch (e) {
        console.error(e);
        alert("Generation failed");
    }
  };

  const handleRunValidation = async () => {
      if (!generatedPlan) return;
      setValidationStatus('running');
      await validatePlan(generatedPlan.full_plan);
  };

  const validatePlan = async (plan: any) => {
      try {
          const res = await fetch('/api/advanced-review', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ plan })
          });
          const data = await res.json();
          setValidationReport(data);
          setValidationStatus('completed');
          await savePlan(plan, data);
      } catch (e) {
          console.error(e);
          alert("Validation failed");
          setValidationStatus('idle');
      }
  };

  const savePlan = async (fullPlan: any, validationReport: any) => {
      try {
        const res = await fetch('/api/save-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                draftId, 
                businessName: allAnswers.product?.businessLegalName,
                businessType: allAnswers.product?.product_category,
                fullPlan: { ...fullPlan, validation: validationReport },
                metadata: {
                    framework_version: "1.0.0",
                    question_set_versions: {
                        product: "1.0.0",
                        process: "1.0.0",
                        prp: "1.0.0",
                        hazards: "1.0.0",
                        ccp: "1.0.0",
                        validation: "1.0.0"
                    }
                },
                answers: allAnswers 
            })
        });
        const data = await res.json();
        if (data.plan?.id) {
            localStorage.setItem('haccp_plan_id', data.plan.id);
            setGeneratedPlan({ ...generatedPlan, id: data.plan.id, payment_status: data.plan.payment_status });
        }
        localStorage.removeItem('haccp_draft_id');
        setDraftId(null);
      } catch (e) {
          console.error("Auto-save failed", e);
      }
  };

  // --- Render Helpers ---

  if (currentSection === 'product') {
      return <HACCPQuestionnaire sectionData={productQuestions as unknown as HACCPSectionData} onComplete={(d) => handleSectionComplete('product', d)} initialData={allAnswers.product} />;
  }
  
  if (currentSection === 'process') {
      return <HACCPQuestionnaire sectionData={processQuestions as unknown as HACCPSectionData} onComplete={(d) => handleSectionComplete('process', d)} initialData={allAnswers.process} />;
  }

  if (currentSection === 'prp') {
      return <HACCPQuestionnaire sectionData={prpQuestions as unknown as HACCPSectionData} onComplete={(d) => handleSectionComplete('prp', d)} initialData={allAnswers.prp} />;
  }

  if (currentSection === 'hazards') {
      const step = allAnswers.process?.process_steps?.[currentStepIndex];
      const dynamicSchema = { 
          ...hazardQuestions, 
          section: `Hazard Analysis: ${step?.step_name || 'Unknown Step'}` 
      } as unknown as HACCPSectionData;

      const isGenericPattern = checkGenericRiskPattern();

      return (
        <div key={currentStepIndex} className="space-y-6"> 
            {isGenericPattern && (
                <div className="max-w-3xl mx-auto bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl flex gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-amber-100 p-3 rounded-2xl h-fit">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-black text-amber-900 leading-tight">Risk Assessment Quality Check</p>
                        <p className="text-amber-800 text-sm font-medium">
                            Multiple hazards have identical risk ratings. Ensure these reflect a site-specific risk assessment to meet auditor expectations.
                        </p>
                    </div>
                </div>
            )}
            <HACCPQuestionnaire 
                sectionData={dynamicSchema} 
                onComplete={(d) => handleSectionComplete('hazards', d)} 
            />
        </div>
      );
  }

  if (currentSection === 'ccp_determination') {
      const sigHazards = getSignificantHazards();
      const currentHazard = sigHazards[currentCCPIndex];

      if (!currentHazard) {
          return <div className="p-10 text-center">No significant hazards identified. Moving to next section...</div>;
      }

      const dynamicSchema = { 
          ...ccpDeterminationQuestions, 
          section: `CCP Determination: ${currentHazard.step_name}`,
          questions: ccpDeterminationQuestions.questions.map((q: any) => ({
              ...q,
              description: q.id === 'q1_control_measure' 
                ? `For hazard: "${currentHazard.hazards}" at step "${currentHazard.step_name}"`
                : q.description
          }))
      } as unknown as HACCPSectionData;

       return (
        <div key={currentCCPIndex} className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-xl mb-8 max-w-3xl mx-auto shadow-sm">
                <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                        <h3 className="font-black text-blue-900 text-lg mb-1">Hazard Context</h3>
                        <p className="text-blue-800 font-medium text-sm">
                            <strong>Process Step:</strong> {currentHazard.step_name}
                        </p>
                        <p className="text-blue-800 font-medium text-sm mt-1">
                            <strong>Identified Hazard:</strong> {currentHazard.hazards}
                        </p>
                        <p className="text-blue-700 text-xs mt-2 italic">
                            Control Measure: {currentHazard.control_measure || "None defined"}
                        </p>
                    </div>
                </div>
            </div>
            
            <HACCPQuestionnaire 
                sectionData={dynamicSchema} 
                onComplete={(d) => handleSectionComplete('ccp_determination', d)} 
            />
        </div>
       );
  }

  if (currentSection === 'ccp_management') {
      const ccpList = getIdentifiedCCPs();

      if (ccpList.length === 0) {
          return <div className="p-10 text-center">No CCPs to manage. Moving to next section...</div>;
      }

      // Construct Dynamic Schema: One group per CCP
      const dynamicQuestions = ccpList.map((ccp: any, idx: number) => {
          const groupId = `ccp_${ccp.step_name}_${ccp.hazard}`.replace(/[^a-zA-Z0-9]/g, '_');
          
          return {
              id: groupId,
              text: `📍 CCP #${idx + 1} — ${ccp.step_name} (${ccp.hazard})`,
              type: 'group',
              questions: ccpManagementQuestions.questions // Reuse standard questions inside the group
          };
      });

      const dynamicSchema = { 
          ...ccpManagementQuestions, 
          section: `CCP Management (${ccpList.length} Critical Points)`,
          questions: dynamicQuestions
      } as unknown as HACCPSectionData;

       return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-xl mb-8 max-w-3xl mx-auto shadow-sm">
                <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                        <h3 className="font-black text-blue-900 text-lg mb-1">CCP Management Strategy</h3>
                        <p className="text-blue-800 font-medium text-sm">
                            You have identified <strong>{ccpList.length} Critical Control Points</strong>. 
                            Define the monitoring and control limits for each one below to ensure food safety.
                        </p>
                    </div>
                </div>
            </div>
            
            <HACCPQuestionnaire 
                sectionData={dynamicSchema} 
                onComplete={(d) => handleSectionComplete('ccp_management', d)} 
                // Initial data mapping: { group_id: { ...answers } }
                initialData={
                    allAnswers.ccp_management 
                    ? allAnswers.ccp_management.reduce((acc: any, item: any) => {
                        if(item.ccp_id) acc[item.ccp_id] = item;
                        return acc;
                    }, {})
                    : {}
                }
            />
        </div>
       );
  }

  if (currentSection === 'validation') {
       return <HACCPQuestionnaire sectionData={validationQuestions as unknown as HACCPSectionData} onComplete={(d) => handleSectionComplete('validation', d)} />;
  }

  if (currentSection === 'generating' || currentSection === 'validating') {
      return (
          <div className="min-h-screen flex items-center justify-center flex-col gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="font-bold text-slate-500">{currentSection === 'generating' ? 'Writing Plan...' : 'Auditing Plan...'}</p>
          </div>
      );
  }

  if (currentSection === 'complete') {
      return (
          <div className="max-w-4xl mx-auto p-10 space-y-8">
              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center space-y-4">
                  <h1 className="text-4xl font-black text-emerald-900">Draft Created</h1>
                  <p className="text-emerald-700">Validation is required for final export. Run the check below to proceed.</p>
              </div>

              {/* 1. Idle State: Not yet validated */}
              {validationStatus === 'idle' && (
                  <div className="bg-white border border-slate-200 p-12 rounded-3xl shadow-sm text-center space-y-8">
                      <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                              <h2 className="text-2xl font-black text-slate-900">Validation Status</h2>
                              <Tooltip text="Validation checks whether the HACCP plan logic is complete and internally consistent. It does not represent regulatory or audit approval." />
                          </div>
                          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-sm">
                              <Info className="w-4 h-4" /> Not yet validated
                          </div>
                      </div>
                      
                      <button 
                          onClick={handleRunValidation}
                          className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 transform hover:scale-105 active:scale-95"
                      >
                          Run Validation
                      </button>
                  </div>
              )}

              {/* 2. Running State */}
              {validationStatus === 'running' && (
                  <div className="bg-white border border-slate-200 p-12 rounded-3xl shadow-sm text-center space-y-6">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-100 border-t-blue-600 mx-auto"></div>
                      <div>
                          <h2 className="text-2xl font-black text-slate-900">Auditing Plan...</h2>
                          <p className="text-slate-500">Our system auditor is checking your plan against Codex standards.</p>
                      </div>
                  </div>
              )}

              {/* 3. Completed State: Report & Export */}
              {validationStatus === 'completed' && (
                  <>
                    <div id="audit-report" className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                            <h2 className="text-2xl font-black text-slate-900">Audit Report</h2>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase">Validated by</p>
                                <p className="font-bold text-slate-900">iLoveHACCP Auditor</p>
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <span className="text-xs font-bold uppercase text-slate-400">Rating</span>
                                <p className="text-xl font-black text-slate-900">{validationReport?.section_1_overall_assessment?.rating}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <span className="text-xs font-bold uppercase text-slate-400">Readiness</span>
                                <p className={`text-xl font-black ${validationReport?.block_export ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {validationReport?.section_1_overall_assessment?.audit_readiness}
                                </p>
                            </div>
                        </div>
                        
                        {/* Detailed Report Gating */}
                        <div className="relative">
                            <div className={generatedPlan?.payment_status === 'paid' ? '' : 'blur-md select-none pointer-events-none opacity-40 max-h-96 overflow-hidden'}>
                                {/* Strengths */}
                                <div className="mt-6">
                                    <h3 className="font-bold text-slate-900 mb-2">Strengths</h3>
                                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                                        {validationReport?.section_2_strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                
                                {/* Weaknesses */}
                                <div className="mt-6">
                                    <h3 className="font-bold text-slate-900 mb-2">Weaknesses</h3>
                                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                                        {validationReport?.section_3_weaknesses_risks?.map((w: any, i: number) => <li key={i}>{w.weakness} ({w.section})</li>)}
                                    </ul>
                                </div>

                                {/* Auditor Recommendations (Advisory) */}
                                {validationReport?.advisory_recommendations && validationReport.advisory_recommendations.length > 0 && (
                                    <div className="pt-6 border-t border-slate-100 mt-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="bg-blue-100 p-2 rounded-lg">
                                                <Info className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900">Auditor Recommendations</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {validationReport.advisory_recommendations.map((rec: any, i: number) => (
                                                <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-200 transition-colors">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">{rec.issue_summary}</h4>
                                                        <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${rec.gap_type === 'MAJOR' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {rec.gap_type}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600 text-sm mb-3 italic">"{rec.why_it_matters}"</p>
                                                    <div className="bg-white p-3 rounded-xl border border-slate-100 mb-3">
                                                        <p className="text-blue-700 font-medium text-sm">💡 {rec.recommendation_text}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                                        <span>{rec.related_haccp_principle}</span>
                                                        <span className="bg-slate-200 px-2 py-1 rounded text-slate-600">{rec.related_builder_section}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {generatedPlan?.payment_status !== 'paid' && (
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-slate-200 text-center max-w-md mx-auto">
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <ShieldAlert className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">Detailed Report Locked</h3>
                                        <p className="text-slate-500 font-medium mb-6">Upgrade to Professional to view full analysis, weaknesses, and recommendations.</p>
                                        <button 
                                            onClick={() => {
                                                // Trigger Dashboard or redirect to pricing? 
                                                // Ideally scroll to export controls where payment is handled.
                                                // Or redirect to dashboard.
                                                window.location.href = '/dashboard';
                                            }}
                                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors w-full"
                                        >
                                            View Options
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Export Controls - Only visible after validation */}
                    <div className="bg-slate-900 p-8 rounded-3xl text-center space-y-6">
                        <h2 className="text-2xl font-black text-white">Export Documents</h2>
                        
                        {/* Document Style Selection */}
                        <div className="flex justify-center gap-4 mb-4">
                            {['Audit Classic', 'Professional Modern'].map(style => (
                                <button
                                    key={style}
                                    onClick={() => setExportTemplate(style)}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 ${
                                        exportTemplate === style 
                                        ? 'bg-blue-600 border-blue-600 text-white' 
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>

                        {validationReport?.block_export || validationReport?.section_1_overall_assessment?.audit_readiness === "Major Gaps" ? (
                            <div className="space-y-6">
                                <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl font-bold">
                                    Cannot Export: Major Gaps Detected. Please fix critical issues before downloading.
                                </div>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <button 
                                        onClick={() => {
                                            setCurrentSection('product');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" /> Go back to Builder
                                    </button>
                                    <button 
                                        onClick={() => {
                                            document.getElementById('audit-report')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="bg-slate-800 text-slate-300 border border-slate-700 px-8 py-3 rounded-xl font-bold hover:text-white hover:bg-slate-700 transition-all"
                                    >
                                        View Validation Report
                                    </button>
                                </div>
                            </div>
                        ) : generatedPlan?.payment_status !== 'paid' ? (
                            // UNPAID STATE
                            <div className="space-y-6">
                                <p className="text-slate-400 font-medium">Your plan is ready. Download a watermarked preview or upgrade for the official files.</p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <a 
                                        href={`/api/download-pdf?planId=${generatedPlan?.id || ''}`}
                                        target="_blank"
                                        className="bg-white text-slate-900 border border-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        Download Preview (Watermarked)
                                    </a>
                                    <button 
                                        onClick={() => window.location.href = '/dashboard'}
                                        className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2"
                                    >
                                        Unlock Official Export (€39)
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // PAID STATE
                            <div className="flex justify-center gap-4">
                                <button 
                                    onClick={() => generateHACCPWordDoc({
                                        businessName: allAnswers.product?.businessLegalName || "My Business",
                                        full_plan: {
                                            ...generatedPlan?.full_plan,
                                            _original_inputs: { ...allAnswers, template: exportTemplate }
                                        }
                                    })}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50"
                                >
                                    Download Word (.docx)
                                </button>
                                <a 
                                    href={`/api/download-pdf?planId=${generatedPlan?.id || ''}`}
                                    target="_blank"
                                    className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black hover:bg-slate-100 transition-all flex items-center gap-2"
                                >
                                    Download PDF (.pdf)
                                </a>
                            </div>
                        )}
                    </div>
                  </>
              )}
          </div>
      );
  }

  return <div>Loading...</div>;
}

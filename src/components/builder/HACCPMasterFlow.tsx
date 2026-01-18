/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { HACCPSectionData } from '@/types/haccp';
import HACCPQuestionnaire from './HACCPQuestionnaire';
import { getQuestions } from '@/data/haccp/loader';
import { useLanguage } from '@/lib/i18n';

import { generateHACCPWordDoc } from '@/lib/export-utils';
import { AlertTriangle, Info, Edit, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Tooltip } from '@/components/ui/Tooltip';

import { useSearchParams } from 'next/navigation';

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
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const [currentSection, setCurrentSection] = useState<SectionKey>('product');
  const [allAnswers, setAllAnswers] = useState<any>({});
  const [draftId, setDraftId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef<any>(null);

  // 1. Initialize Draft on Mount
  useEffect(() => {
    const initDraft = async () => {
        const urlId = searchParams.get('id');
        const isNew = searchParams.get('new') === 'true';
        
        // A. Priority: Start Fresh if explicitly requested
        if (isNew) {
            console.log("Starting fresh session (?new=true)");
            localStorage.removeItem('haccp_plan_id');
            localStorage.removeItem('haccp_draft_id');
            await createNewDraft();
            return;
        } 
        
        // B. Priority: URL Parameter (Resume specific plan/draft)
        if (urlId) {
            await loadFromId(urlId);
            return;
        }

        // C. Fallback: LocalStorage -> PROMPT (Don't auto-load)
        const storedPlanId = localStorage.getItem('haccp_plan_id');
        const storedDraftId = localStorage.getItem('haccp_draft_id');

        if (storedPlanId || storedDraftId) {
             setResumeIds({ planId: storedPlanId, draftId: storedDraftId });
             setShowResumePrompt(true);
             return;
        }

        // D. Fallback: Create New
        await createNewDraft();
    };
    
    initDraft();
  }, [searchParams]);

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
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Resume / Start New Logic
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeIds, setResumeIds] = useState<{planId: string | null, draftId: string | null}>({planId: null, draftId: null});

  const claimDraft = async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
           try {
              await fetch('/api/drafts/attach', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${session.access_token}`
                  },
                  body: JSON.stringify({ draftId: id })
              });
          } catch (e) {
              console.error("Failed to attach draft to user", e);
          }
      }
  };

  const loadFromId = async (id: string) => {
    // Try as PLAN first (Paid/Generated)
    try {
        const planRes = await fetch(`/api/plans/${id}`);
        if (planRes.ok) {
            const data = await planRes.json();
            if (data.plan) {
                console.log("Restored PLAN from URL:", id);
                setGeneratedPlan(data.plan);
                setValidationReport(data.plan.full_plan?.validation);
                setAllAnswers(data.plan.full_plan?._original_inputs || {});
                setValidationStatus(data.plan.full_plan?.validation ? 'completed' : 'idle');
                setCurrentSection('complete');
                // Update local storage to match current focus
                localStorage.setItem('haccp_plan_id', id);
                return;
            }
        }
    } catch (e) { console.error("Not a plan, checking draft..."); }

    // Try as DRAFT
    try {
        const draftRes = await fetch(`/api/drafts/${id}`);
        if (draftRes.ok) {
            const data = await draftRes.json();
            if (data.draft) {
                console.log("Restored DRAFT from URL:", id);
                setDraftId(id);
                if (data.draft.answers) {
                    setAllAnswers(data.draft.answers);
                }
                if (data.draft.validation) {
                    setValidationReport(data.draft.validation);
                    setValidationStatus('completed');
                    setCurrentSection('complete');
                }
                // Update local storage
                localStorage.setItem('haccp_draft_id', id);
                
                // Attempt to claim if logged in
                claimDraft(id);
                return;
            }
        }
    } catch (e) { console.error("Failed to restore draft from URL"); }
  };

  const createNewDraft = async () => {
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

  const handleResume = async () => {
      setShowResumePrompt(false);
      // Prioritize DRAFT over Plan (Work in Progress > Finished Work)
      const idToLoad = resumeIds.draftId || resumeIds.planId;
      if (idToLoad) {
          await loadFromId(idToLoad);
      } else {
          await createNewDraft();
      }
  };

  const handleStartNew = async () => {
      setShowResumePrompt(false);
      localStorage.removeItem('haccp_plan_id');
      localStorage.removeItem('haccp_draft_id');
      setAllAnswers({});
      setCurrentSection('product');
      await createNewDraft();
  };

  // Helper: Detect Generic Risk Pattern
  const checkGenericRiskPattern = () => {
    const hazards = allAnswers.hazard_analysis || [];
    if (hazards.length < 3) return false;

    // Extract all evaluations
    const evaluations: any[] = [];
    hazards.forEach((h: any) => {
        const evalGroup = h.data?.hazard_evaluation || {};
        ['bio', 'chem', 'phys', 'allergen'].forEach(key => {
            const data = evalGroup[key];
            if (data?.severity && data?.likelihood) {
                evaluations.push({ s: data.severity, l: data.likelihood });
            }
        });
    });

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

  const handleDownloadPdf = async () => {
      if (!generatedPlan?.id) return;
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const res = await fetch(`/api/download-pdf?planId=${generatedPlan.id}&lang=${language}`, {
              headers: { Authorization: `Bearer ${session.access_token}` }
          });
          
          if (!res.ok) {
              const err = await res.json();
              alert(err.error || 'Download failed');
              return;
          }
          
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `HACCP_Plan_${allAnswers.product?.businessLegalName?.replace(/\s+/g, '_') || 'Draft'}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
      } catch (e) {
          console.error(e);
          alert('Failed to download PDF.');
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

          // Save validation result to draft immediately
          if (draftId) {
              await fetch(`/api/drafts/${draftId}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ validation: data })
              });
          }

          // Check Auth
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
              await savePlan(plan, data);
          } else {
              setShowAuthPrompt(true);
          }
      } catch (e) {
          console.error(e);
          alert("Validation failed");
          setValidationStatus('idle');
      }
  };

  const savePlan = async (fullPlan: any, validationReport: any) => {
      setIsSavingPlan(true);
      setSaveError(null);
      
      // Clear any pending autosave to prevent race conditions
      if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
      }

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
        
        if (!res.ok) throw new Error("Failed to save plan to database");

        const data = await res.json();
        if (data.plan?.id) {
            localStorage.setItem('haccp_plan_id', data.plan.id);
            setGeneratedPlan({ ...generatedPlan, id: data.plan.id, payment_status: data.plan.payment_status });
        }
        localStorage.removeItem('haccp_draft_id');
        setDraftId(null);
      } catch (e: any) {
          console.error("Auto-save failed", e);
          setSaveError(e.message || "Connection error. Failed to save your progress.");
      } finally {
          setIsSavingPlan(false);
      }
  };

  // 4. Auto-Promote Draft to Plan
  useEffect(() => {
      const promote = async () => {
          // FIX: Check if we have a plan but NO ID (meaning it's not saved to DB yet)
          if (currentSection === 'complete' && validationReport && (!generatedPlan || !generatedPlan.id)) {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                  console.log("Auto-promoting draft to plan...");
                  try {
                      // If we already have generated content, use it. Otherwise generate.
                      // We need to save what we have.
                      if (generatedPlan && !generatedPlan.id) {
                           await savePlan(generatedPlan.full_plan, validationReport);
                      } else {
                          // 1. Re-generate content (as draft only stored answers)
                          const res = await fetch('/api/generate-plan', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                  ...allAnswers, 
                                  metadata: { framework_version: "1.0.0", question_set_versions: { product: "1.0.0" } } 
                              })
                          });
                          const data = await res.json();
                          
                          // 2. Save permanently
                          if (data.full_plan) {
                              await savePlan(data.full_plan, validationReport);
                          }
                      }
                  } catch (e) {
                      console.error("Promotion failed", e);
                  }
              }
          }
      };
      promote();
  }, [currentSection, validationReport, generatedPlan]);

  // 5. Navigation Sync (URL <-> Section)
  const updateStepInUrl = (section: string) => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('step') === section) return;
      params.set('step', section);
      window.history.pushState({ section }, '', `?${params.toString()}`);
  };

  useEffect(() => {
      const urlStep = searchParams.get('step') as SectionKey;
      if (urlStep && urlStep !== currentSection) {
          // Verify we have data to support this jump (pessimistic)
          if (urlStep === 'process' && !allAnswers.product) return;
          if (urlStep === 'hazards' && !allAnswers.process) return;
          
          setCurrentSection(urlStep);
      }
  }, [searchParams]);

  useEffect(() => {
      if (currentSection !== 'complete') {
        updateStepInUrl(currentSection);
      }
  }, [currentSection]);

  const handleCheckout = async (tier: 'professional' | 'expert') => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
              // Redirect to login with return URL
              const nextUrl = encodeURIComponent(`/builder?id=${draftId || generatedPlan?.id || ''}`);
              window.location.href = `/login?next=${nextUrl}`;
              return;
          }

          if (!generatedPlan?.id) {
              alert("Please wait for the plan to finish saving...");
              return;
          }

          const res = await fetch('/api/create-checkout', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`
              },
              body: JSON.stringify({ 
                  tier, 
                  planId: generatedPlan.id, 
                  businessName: allAnswers.product?.businessLegalName || "My Business" 
              })
          });

          const data = await res.json();
          if (data.url) {
              window.location.href = data.url;
          } else {
              alert(data.error || "Failed to start checkout");
          }
      } catch (e) {
          console.error(e);
          alert("System error starting checkout.");
      }
  };

  // --- Render Helpers ---

  const getProgress = (section: SectionKey) => {
    const steps = ['product', 'process', 'prp', 'hazards', 'ccp_determination', 'ccp_management', 'validation', 'complete'];
    const idx = steps.indexOf(section);
    if (section === 'generating' || section === 'validating') return 90;
    if (idx === -1) return 0;
    return Math.min(Math.round((idx / 7) * 100), 100);
  };

  const progress = getProgress(currentSection);

  const renderContent = () => {
    if (showResumePrompt) {
        return (
            <div className="max-w-2xl mx-auto p-10 text-center space-y-8 mt-20">
                <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl">
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Resume your previous session?</h2>
                    <p className="text-slate-500 mb-8">We found an unfinished draft on this device.</p>
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={handleResume} 
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all cursor-pointer"
                        >
                            Resume Draft
                        </button>
                        <button 
                            onClick={handleStartNew} 
                            className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all cursor-pointer"
                        >
                            Start New Plan
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (currentSection === 'product') {
        return <HACCPQuestionnaire sectionData={getQuestions('product', language) as unknown as HACCPSectionData} onComplete={(d) => handleSectionComplete('product', d)} initialData={allAnswers.product} />;
    }
    
    if (currentSection === 'process') {
      return <HACCPQuestionnaire sectionData={getQuestions('process', language) as unknown as HACCPSectionData} onComplete={(d) => handleSectionComplete('process', d)} initialData={allAnswers.process} />;
  }

  if (currentSection === 'prp') {
      return <HACCPQuestionnaire sectionData={getQuestions('prp', language) as unknown as HACCPSectionData} onComplete={(d) => handleSectionComplete('prp', d)} initialData={allAnswers.prp} />;
  }

  if (currentSection === 'hazards') {
      const step = allAnswers.process?.process_steps?.[currentStepIndex];
      const dynamicSchema = { 
          ...getQuestions('hazards', language), 
          section: `Hazard Analysis: ${step?.step_name || 'Unknown Step'}` 
      } as unknown as HACCPSectionData;

      const isGenericPattern = checkGenericRiskPattern();

      return (
        <div key={currentStepIndex} className="space-y-6"> 
            <HACCPQuestionnaire 
                sectionData={dynamicSchema} 
                onComplete={(d) => handleSectionComplete('hazards', d)} 
                additionalContext={{ step_name: step?.step_name }}
            />
        </div>
      );
  }

  if (currentSection === 'ccp_determination') {
      const sigHazards = getSignificantHazards();
      const currentHazard = sigHazards[currentCCPIndex];
      const questionsData = getQuestions('ccp_determination', language);

      if (!currentHazard) {
          return <div className="p-10 text-center">No significant hazards identified. Moving to next section...</div>;
      }

      const dynamicSchema = { 
          ...questionsData, 
          section: `CCP Determination: ${currentHazard.step_name}`,
          questions: questionsData.questions.map((q: any) => ({
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
      const questionsData = getQuestions('ccp_management', language);

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
              questions: questionsData.questions // Reuse standard questions inside the group
          };
      });

      const dynamicSchema = { 
          ...questionsData, 
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
       const isGeneric = checkGenericRiskPattern();
       
       return (
        <div className="space-y-6">
            {isGeneric && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl max-w-3xl mx-auto shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-amber-500 mt-1" />
                        <div>
                            <h3 className="font-black text-amber-900 text-lg mb-1">Risk Assessment Pattern Detected</h3>
                            <p className="text-amber-800 font-medium text-sm">
                                Several hazards share identical risk ratings. 
                                Consider reviewing whether these reflect site-specific risks or if they have been copied. 
                                Auditors often look for variation in risk scoring.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <HACCPQuestionnaire sectionData={getQuestions('validation', language) as unknown as HACCPSectionData} onComplete={(d) => handleSectionComplete('validation', d)} />
        </div>
       );
  }

  if (currentSection === 'generating' || currentSection === 'validating') {
      return (
          <div className="min-h-screen flex items-center justify-center flex-col gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="font-bold text-slate-500">{currentSection === 'generating' ? 'Writing Plan...' : 'Auditing Plan...'}</p>
          </div>
      );
  }

  if (showAuthPrompt) {
      return (
          <div className="max-w-4xl mx-auto p-10 text-center space-y-8">
              <div className="bg-blue-50 p-10 rounded-3xl border border-blue-100">
                  <ShieldAlert className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h1 className="text-3xl font-black text-slate-900 mb-2">Validation Complete!</h1>
                  <p className="text-slate-600 text-lg mb-8">
                      Your HACCP plan has been validated. Create a free account to save your progress and unlock exports.
                  </p>
                  <button 
                      onClick={() => {
                          const nextUrl = encodeURIComponent(`/builder?id=${draftId}`);
                          window.location.href = `/signup?next=${nextUrl}`;
                      }}
                      className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                  >
                      Save & Continue
                  </button>
                  <p className="text-sm text-slate-400 mt-4">Already have an account? <a href={`/login?next=${encodeURIComponent(`/builder?id=${draftId}`)}`} className="text-blue-600 hover:underline">Log In</a></p>
              </div>
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
                                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/95 backdrop-blur-sm rounded-3xl">
                                    <div className="max-w-4xl w-full px-6">
                                        <div className="text-center mb-8">
                                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                                <ShieldAlert className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-2">Upgrade to View Details</h3>
                                            <p className="text-slate-500 font-medium">Unlock your full HACCP plan and remove watermarks.</p>
                                            
                                            {saveError && (
                                                <div className="mt-4 bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col items-center gap-3 animate-in fade-in zoom-in">
                                                    <p className="text-red-600 font-bold text-sm">⚠️ {saveError}</p>
                                                    <button 
                                                        onClick={() => savePlan(generatedPlan.full_plan, validationReport)}
                                                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                                                    >
                                                        Retry Saving Progress
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Tier 39 */}
                                            <div 
                                                className={`bg-white border-2 border-slate-100 p-6 rounded-2xl transition-colors shadow-xl shadow-slate-200/50 ${isSavingPlan ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-100 cursor-pointer'}`} 
                                                onClick={() => !isSavingPlan && handleCheckout('professional')}
                                            >
                                                <div className="mb-4">
                                                    <h4 className="font-black text-slate-900 text-lg">Self-Service Export</h4>
                                                    <p className="text-3xl font-black text-slate-900 mt-2">€39 <span className="text-sm text-slate-400 font-medium text-base">+ VAT</span></p>
                                                </div>
                                                <ul className="space-y-3 mb-8 text-left">
                                                    {[
                                                        "Download HACCP plan as Word (DOCX)",
                                                        "Download HACCP plan as PDF (no watermark)",
                                                        "Remove “Draft” watermark",
                                                        "Save documents for future access", 
                                                        "Share with inspectors or consultants"
                                                    ].map((item, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                                                            <span className="text-emerald-500 font-bold">✓</span> {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button 
                                                    disabled={isSavingPlan}
                                                    onClick={(e) => { e.stopPropagation(); handleCheckout('professional'); }}
                                                    className="bg-slate-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-black transition-colors w-full flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                                                >
                                                    {isSavingPlan ? (
                                                        <>
                                                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                            Saving...
                                                        </>
                                                    ) : 'Export Documents'}
                                                </button>
                                            </div>

                                            {/* Tier 79 */}
                                            <div 
                                                className={`bg-blue-50 border-2 border-blue-200 p-6 rounded-2xl relative shadow-xl shadow-blue-900/10 transition-colors ${isSavingPlan ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} 
                                                onClick={() => !isSavingPlan && handleCheckout('expert')}
                                            >
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                    Recommended
                                                </div>
                                                <div className="mb-4">
                                                    <h4 className="font-black text-blue-900 text-lg">Expert Review</h4>
                                                    <p className="text-3xl font-black text-blue-900 mt-2">€79 <span className="text-sm text-blue-400 font-medium text-base">+ VAT</span></p>
                                                </div>
                                                <ul className="space-y-3 mb-8 text-left">
                                                    {[
                                                        "Includes all Export features (€39)",
                                                        "Human review by a food safety professional",
                                                        "Written feedback on gaps and clarity",
                                                        "Review stored in dashboard",
                                                        "Priority Email Support"
                                                    ].map((item, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-sm text-blue-800 font-medium">
                                                            <span className="text-blue-600 font-bold">✓</span> {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button 
                                                    disabled={isSavingPlan}
                                                    onClick={(e) => { e.stopPropagation(); handleCheckout('expert'); }}
                                                    className="bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors w-full flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer disabled:cursor-not-allowed"
                                                >
                                                    {isSavingPlan ? (
                                                        <>
                                                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                            Saving...
                                                        </>
                                                    ) : 'Request Expert Review'}
                                                </button>
                                            </div>
                                        </div>
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
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 cursor-pointer ${
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
                                        className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <Edit className="w-4 h-4" /> Go back to Builder
                                    </button>
                                    <button 
                                        onClick={() => {
                                            document.getElementById('audit-report')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="bg-slate-800 text-slate-300 border border-slate-700 px-8 py-3 rounded-xl font-bold hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
                                    >
                                        View Validation Report
                                    </button>
                                </div>
                            </div>
                        ) : generatedPlan?.payment_status !== 'paid' ? (
                            // UNPAID STATE
                            <div className="text-center pt-4 space-y-4">
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <button 
                                        onClick={handleDownloadPdf}
                                        className="bg-white text-slate-900 border border-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        Download Preview (Watermarked PDF)
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500">Full exports are available after upgrade above.</p>
                            </div>
                        ) : (
                            // PAID STATE
                            <div className="text-center space-y-6">
                                <h2 className="text-3xl font-black text-white">Export unlocked</h2>
                                <p className="text-slate-400">
                                    You can now download your HACCP plan as a Word or PDF document.
                                    <br/><span className="text-xs opacity-75 mt-1 block">Your document reflects the information you entered in the builder.</span>
                                </p>

                                <div className="flex justify-center gap-4">
                                    <button 
                                        onClick={() => generateHACCPWordDoc({
                                            businessName: allAnswers.product?.businessLegalName || "My Business",
                                            full_plan: {
                                                ...generatedPlan?.full_plan,
                                                _original_inputs: { ...allAnswers, template: exportTemplate }
                                            }
                                        })}
                                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50 cursor-pointer"
                                    >
                                        Download Word (.docx)
                                    </button>
                                    <button 
                                        onClick={handleDownloadPdf}
                                        className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
                                    >
                                        Download PDF (.pdf)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                  </>
              )}
          </div>
      );
  }

    return <div>Loading...</div>;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
        {/* Progress Bar */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="max-w-3xl mx-auto px-6 py-4">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-600 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>

        <div className="pt-10 px-6">
            {renderContent()}
        </div>
    </div>
  );
}

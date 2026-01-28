/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { HACCPSectionData } from '@/types/haccp';
import HACCPQuestionnaire from './HACCPQuestionnaire';
import { getQuestions } from '@/data/haccp/loader';
import { useLanguage } from '@/lib/i18n';

import { AlertTriangle, Info, ShieldAlert, CheckCircle2, Loader2, CloudOff, Check, CloudUpload } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Tooltip } from '@/components/ui/Tooltip';
import { ProcessLog } from '@/components/ui/ProcessLog';
import { fetchWithTimeout } from '@/lib/builder/utils/withTimeoutFetch';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PLAN_TIERS, TIER_PRICE } from '@/lib/constants';

type SectionKey = 
  | 'product' 
  | 'process' 
  | 'prp' 
  | 'hazards' 
  | 'ccp_determination' 
  | 'ccp_management' 
  | 'review_validation'
  | 'generating'
  | 'validating'
  | 'complete';

export default function HACCPMasterFlow() {
  const supabase = createClient();
  const { language, setLanguage } = useLanguage();
  const searchParams = useSearchParams();
  const [currentSection, setCurrentSection] = useState<SectionKey>('product');
  const [allAnswers, setAllAnswers] = useState<any>({});
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef<any>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveFadeRef = useRef<NodeJS.Timeout | null>(null);
  const isGeneratingRef = useRef(false);
  const hasInitialized = useRef(false);
  const stepSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const returnToCompleteRef = useRef(false);
  const anonSnapshotKey = 'haccp_anon_snapshot';
  const isValidUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  // UX State for Review Actions
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [pulseAction, setPulseAction] = useState<string | null>(null);

  const triggerPulse = (action: string) => {
      setPulseAction(action);
      setTimeout(() => setPulseAction(null), 400);
  };

  const runWithBusy = async (action: string, fn: () => Promise<void>) => {
      if (busyAction) return;
      triggerPulse(action);
      setBusyAction(action);
      try {
          await fn();
      } finally {
          setTimeout(() => setBusyAction(null), 300);
      }
  };

  const persistAnonymousSnapshot = () => {
    try {
        const payload = {
            answers: allAnswers,
            currentSection,
            generatedPlan,
            validationReport,
            validationStatus,
            language
        };
        localStorage.setItem(anonSnapshotKey, JSON.stringify(payload));
    } catch (e) {
        console.warn("Failed to persist anonymous snapshot", e);
    }
  };

  const hydrateAnonymousSnapshot = async (session: { access_token: string }) => {
    const storedSnapshot = localStorage.getItem(anonSnapshotKey);
    if (!storedSnapshot) return false;

    try {
        const parsed = JSON.parse(storedSnapshot);
        const answers = parsed?.answers ?? {};
        const nextSection: SectionKey = parsed?.currentSection || 'product';
        const planData = parsed?.generatedPlan ?? null;
        const validationData = parsed?.validationReport ?? null;
        const nextValidationStatus = parsed?.validationStatus ?? 'idle';
        const savedLanguage = parsed?.language;
        if (savedLanguage && savedLanguage !== language) {
            setLanguage(savedLanguage);
        }

        const res = await fetch('/api/drafts', { 
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (!res.ok) {
            return false;
        }

        const data = await res.json();
        const newDraftId = data.draftId as string | undefined;
        if (!newDraftId) {
            return false;
        }

        await fetch(`/api/drafts/${newDraftId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                answers,
                current_step: nextSection,
                ...(planData ? { plan_data: planData } : {}),
                ...(validationData ? { validation: validationData } : {})
            })
        });

        setDraftId(newDraftId);
        setAllAnswers(answers);
        setGeneratedPlan(planData);
        setValidationReport(validationData);
        setValidationStatus(nextValidationStatus);
        setCurrentSection(nextSection);
        localStorage.setItem('haccp_draft_id', newDraftId);
        localStorage.removeItem(anonSnapshotKey);
        return true;
    } catch (e) {
        console.warn("Failed to hydrate anonymous snapshot", e);
        return false;
    }
  };

  // ... (Autosave Logic remains same) ...

  const loadFromId = async (id: string) => {
    // Try as PLAN first (Paid/Generated)
    try {
        console.info(`[Builder] loadFromId:start`, { id });
        const { data: { session } } = await supabase.auth.getSession();
        console.info(`[Builder] loadFromId:session`, { id, hasSession: Boolean(session) });
        const token = searchParams.get('token');
        
        if (!session && !token) {
            const nextUrl = encodeURIComponent(`/builder?id=${id}`);
            window.location.href = `/login?next=${nextUrl}`;
            return;
        }

        const headers: HeadersInit = {};
        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const planUrl = `/api/plans/${id}${token ? `?token=${token}` : ''}`;
        console.info(`[Builder] loadFromId:fetch`, { planUrl, id });
        const planRes = await fetch(planUrl, {
            headers
        });

        if (planRes.ok) {
            const data = await planRes.json();
            if (data.plan) {
                console.log("Restored PLAN from URL:", id);
                setGeneratedPlan(data.plan);
                setValidationReport(data.plan.full_plan?.validation);
                setAllAnswers(data.plan.full_plan?._original_inputs || {});
                setValidationStatus(data.plan.full_plan?.validation ? 'completed' : 'idle');
                setCurrentSection('complete');
                setLoadError(null);
                // Update local storage to match current focus
                localStorage.setItem('haccp_plan_id', id);
                return;
            }
        }
    } catch (e) { console.error("Not a plan, checking draft..."); }

    await loadDraftFromId(id);
  };

  const loadDraftFromId = async (id: string) => {
    try {
        console.info(`[Builder] loadDraftFromId:start`, { id });
        if (!isValidUuid(id)) {
            console.info(`[Builder] loadDraftFromId:invalid`, { id });
            setLoadError("We couldn’t find this draft. It may have been deleted or you don't have permission to view it.");
            return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        console.info(`[Builder] loadDraftFromId:session`, { id, hasSession: Boolean(session) });
        const token = searchParams.get('token');

        if (!session && !token) {
            const nextUrl = encodeURIComponent(`/builder?draft=${id}`);
            window.location.href = `/login?next=${nextUrl}`;
            return;
        }

        const headers: HeadersInit = {};
        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const draftUrl = `/api/drafts/${id}${token ? `?token=${token}` : ''}`;
        console.info(`[Builder] loadDraftFromId:fetch`, { draftUrl, id });
        const { response: draftRes } = await fetchWithTimeout(draftUrl, { headers }, 12000);
        console.info(`[Builder] loadDraftFromId:response`, { id, status: draftRes.status });
        
        if (!draftRes.ok) {
             throw new Error("Draft fetch failed");
        }
        
        const data = await draftRes.json();
        
        if (data.draft) {
            const answerCount = Object.keys(data.draft.answers || {}).length;
            console.info(`[Builder] loadDraftFromId:loaded`, { id, currentStep: data.draft.current_step, answerCount });
            console.log(`[Builder] Draft Loaded: ${id}. Steps: ${data.draft.current_step}, Keys: ${Object.keys(data.draft.answers || {}).length}`);
            setDraftId(id);
            const fallbackAnswers = (data.draft.answers && Object.keys(data.draft.answers).length > 0)
                ? data.draft.answers
                : (data.draft.plan_data?._original_inputs || data.draft.plan_data?.answers || {});
            
            if (fallbackAnswers) {
                setAllAnswers(fallbackAnswers);
            }
            
            const existingName = data.draft.name ?? null;
            if (existingName) {
                setDraftName(existingName);
            } else if (session) { // Only attempt rename if authenticated
                // If no name, set one but don't block
                const createdDate = data.draft.created_at
                    ? new Date(data.draft.created_at).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0];
                const fallbackName = `HACCP Draft – ${createdDate}`;
                setDraftName(fallbackName);
                
                // Fire and forget rename
                fetch(`/api/drafts/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({ name: fallbackName })
                });
            }
            
            if (data.draft.plan_data) {
                setGeneratedPlan(data.draft.plan_data);
            }
            if (data.draft.validation) {
                setValidationReport(data.draft.validation);
                setValidationStatus('completed');
                setCurrentSection('complete');
            }
            if (data.draft.current_step) {
                setCurrentSection(data.draft.current_step);
            } else {
                setCurrentSection('product');
            }
            setCurrentStepIndex(0);
            setCurrentCCPIndex(0);
            setLoadError(null);
            // Update local storage
            localStorage.setItem('haccp_draft_id', id);
            return;
        }
        throw new Error("Draft data invalid");
    } catch (e) {
        console.error("Failed to restore draft from URL", e);
        if (e instanceof Error && e.name === 'FetchTimeout') {
            setLoadError("Draft load timed out. Please try again.");
            return;
        }
        setLoadError("We couldn’t find this draft. It may have been deleted or you don't have permission to view it.");
    }
  };

  const createNewDraft = async (activeSession?: { access_token: string } | null) => {
      try {
          const session = activeSession || (await supabase.auth.getSession()).data.session;
          if (!session) {
              setDraftId(null);
              return null;
          }

          const res = await fetch('/api/drafts', { 
              method: 'POST',
              headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setDraftId(data.draftId);
              if (data.claimToken) {
                  localStorage.setItem('haccp_claim_token', data.claimToken);
              }
              setDraftName(null);
              setLoadError(null);
              localStorage.setItem('haccp_draft_id', data.draftId);
              return data.draftId as string;
          }
      } catch (e) {
          console.error("Failed to create draft");
      }
      return null;
  };

  const handleResume = async () => {
      setShowResumePrompt(false);
      setIsResumed(true);
      // Prioritize DRAFT over Plan (Work in Progress > Finished Work)
      const idToLoad = resumeIds.draftId || resumeIds.planId;
      if (idToLoad) {
          setIsInitializing(true);
          try {
              await loadFromId(idToLoad);
          } finally {
              setIsInitializing(false);
          }
      } else {
          await createNewDraft();
      }
  };

  const handleStartNew = async () => {
      setShowResumePrompt(false);
      setIsResumed(false);
      
      // ZERO STATE ENFORCEMENT
      localStorage.removeItem('haccp_plan_id');
      localStorage.removeItem('haccp_draft_id');
      setDraftName(null);
      setLoadError(null);
      localStorage.removeItem('haccp_last_active');
      
      setAllAnswers({});
      setGeneratedPlan(null);
      setValidationReport(null);
      setDraftId(null);
      setIdentifiedCCPs([]);
      setCurrentStepIndex(0);
      setCurrentCCPIndex(0);
      setValidationStatus('idle');
      
      setCurrentSection('product');
      await createNewDraft();
  };
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
        setAutoSaveStatus('saving');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                isSavingRef.current = false;
                return;
            }

            const productName = dataToSave?.product?.product_name?.trim();
            const isDefaultName = draftName ? draftName.startsWith('HACCP Draft –') : true;
            const shouldSetName = Boolean(productName && isDefaultName);
            const nextDraftName = shouldSetName ? `${productName} – HACCP Draft` : undefined;

            await fetch(`/api/drafts/${draftId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    answers: dataToSave,
                    ...(nextDraftName ? { name: nextDraftName } : {})
                })
            });
            // Update local timestamp
            localStorage.setItem('haccp_last_active', new Date().toISOString());
            if (nextDraftName) {
                setDraftName(nextDraftName);
            }

            // If the pending data is what we just saved, clear it
            if (pendingSaveRef.current === dataToSave) {
                pendingSaveRef.current = null;
            }
            setAutoSaveStatus('saved');
            if (autoSaveFadeRef.current) clearTimeout(autoSaveFadeRef.current);
            autoSaveFadeRef.current = setTimeout(() => setAutoSaveStatus('idle'), 3000);
        } catch (e) {
            console.error("Autosave failed", e);
            setAutoSaveStatus('error');
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
  }, [allAnswers, draftId, draftName]);

  useEffect(() => {
    if (!draftId) return;
    if (stepSyncTimeoutRef.current) {
        clearTimeout(stepSyncTimeoutRef.current);
    }

    stepSyncTimeoutRef.current = setTimeout(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await fetch(`/api/drafts/${draftId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ current_step: currentSection })
            });
        } catch (e) {
            console.error("Failed to persist current step", e);
        }
    }, 300);

    return () => {
        if (stepSyncTimeoutRef.current) {
            clearTimeout(stepSyncTimeoutRef.current);
        }
    };
  }, [currentSection, draftId]);

  // 3. Attach Anonymous Draft to User on Login
  useEffect(() => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session && draftId) {
              try {
                  const claimToken = localStorage.getItem('haccp_claim_token');
                  await fetch('/api/drafts/attach', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${session.access_token}`
                      },
                      body: JSON.stringify({ draftId, claimToken })
                  });
                  if (claimToken) localStorage.removeItem('haccp_claim_token');
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
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [transition, setTransition] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
  const [showHighRiskModal, setShowHighRiskModal] = useState(false);
  const [showScopeConfirmation, setShowScopeConfirmation] = useState(false);
  const [isResumed, setIsResumed] = useState(false);
  const [highRiskConfirmation, setHighRiskConfirmation] = useState("");

  // Resume / Start New Logic
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeIds, setResumeIds] = useState<{planId: string | null, draftId: string | null}>({planId: null, draftId: null});
  const [isInitializing, setIsInitializing] = useState(true);

  // 1. Initialize Draft on Mount (AUDITOR-COMPLIANT)
  useEffect(() => {
    const initSession = async () => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setIsInitializing(true);
        setLoadError(null);

        console.info(`[Builder] init:start`, {
            draftId: searchParams.get('draft'),
            planId: searchParams.get('id'),
            isNew: searchParams.get('new') === 'true'
        });

        try {
            const urlDraftId = searchParams.get('draft');
            const urlId = searchParams.get('id');
            const isNew = searchParams.get('new') === 'true';

            // 1. Check Authentication State
            console.info(`[Builder] init:session:fetch`);
            const { data: { session } } = await supabase.auth.getSession();
            console.info(`[Builder] init:session:done`, { hasSession: Boolean(session) });

            // SCENARIO A: Explicit New Session
            if (isNew) {
                console.log("Auditor Rule: Explicit 'New Plan' requested -> Zero State");
                console.info(`[Builder] init:start-new`);
                await handleStartNew(); 
                return;
            }

            // SCENARIO B: URL Parameter (Explicit Intent to specific document)
            if (urlDraftId) {
                console.log(`Auditor Rule: Explicit draft URL load -> ${urlDraftId}`);
                console.info(`[Builder] init:load-draft`, { draftId: urlDraftId });
                await loadDraftFromId(urlDraftId);
                return;
            }

            if (urlId) {
                console.log(`Auditor Rule: Explicit URL load -> ${urlId}`);
                console.info(`[Builder] init:load-plan-or-draft`, { id: urlId });
                await loadFromId(urlId);
                return;
            }

            // SCENARIO C: Anonymous User (Strict Zero State)
            if (!session) {
                console.log("Auditor Rule: Anonymous User -> Force Clean Slate (No Resume)");
                localStorage.removeItem('haccp_plan_id');
                localStorage.removeItem('haccp_draft_id');
                localStorage.removeItem('haccp_last_active');
                setDraftId(null);
                console.info(`[Builder] init:create-new:anonymous`);
                await createNewDraft(); 
                return;
            }

            // SCENARIO D: Authenticated User (Managed Continuity)
            console.log("Auditor Rule: Authenticated User -> Checking Server-Side State");

            console.info(`[Builder] init:hydrate-snapshot`);
            const hydratedFromSnapshot = await hydrateAnonymousSnapshot(session);
            if (hydratedFromSnapshot) {
                console.info(`[Builder] init:hydrated-snapshot`);
                return;
            }
            
            // Query server for latest unfinished draft
            try {
                console.info(`[Builder] init:fetch-latest-draft`);
                const { data: drafts } = await supabase
                    .from('drafts')
                    .select('id, updated_at, plan_data')
                    .eq('user_id', session.user.id)
                    .eq('status', 'active')
                    .order('updated_at', { ascending: false })
                    .limit(1);

                if (drafts && drafts.length > 0) {
                    const latest = drafts[0];
                    setResumeIds({ planId: null, draftId: latest.id });
                    setShowResumePrompt(true);
                    console.info(`[Builder] init:resume-prompt`, { draftId: latest.id });
                } else {
                    console.log("No server-side drafts found -> Starting New");
                    console.info(`[Builder] init:create-new:authenticated`);
                    await createNewDraft(session);
                }
            } catch (err) {
                console.error("Failed to check server drafts", err);
                console.info(`[Builder] init:create-new:fallback`);
                await createNewDraft(session);
            }
        } catch (error) {
            console.error("Initialization error:", error);
            setLoadError("An unexpected error occurred while loading the builder.");
        } finally {
            console.info(`[Builder] init:end`);
            setIsInitializing(false);
        }
    };
    
    initSession();
  }, [searchParams]);

  // Helper: Calculate Risk Flags
  const riskFlags = React.useMemo(() => {
      const product = allAnswers.product || {};
      
      // 1. Scope Grouped
      const scope = product.plan_scope || "";
      const SCOPE_GROUPED = scope.includes("group") || scope.includes("process");

      // 2. Ingredient Detail Low
      const ingredients = product.key_ingredients || "";
      const INGREDIENT_DETAIL_LOW = (ingredients.length > 0 && ingredients.length < 20) || 
                                    !!ingredients.match(/\b(various|mixed|etc|misc|assorted|generic)\b/i);

      // 3. Shelf Life Unvalidated
      const shelfLifeBasis = product.shelf_life_basis || "";
      const SHELF_LIFE_UNVALIDATED = shelfLifeBasis.includes("Assumption") || 
                                     shelfLifeBasis.includes("Suposição") || 
                                     shelfLifeBasis.includes("Suposición") || 
                                     shelfLifeBasis.includes("Hypothèse");

      // 4. High Risk RTE
      const cooking = product.cooking_required || "";
      const storage = product.storage_conditions || "";
      const isRTE = cooking.includes('Ready-to-eat') || cooking.includes('Pronto a comer') || cooking.includes('Listo para comer') || cooking.includes('Prêt à consommer');
      const isCold = storage.includes('Refrigerated') || storage.includes('Frozen') || storage.includes('Refrigerado') || storage.includes('Congelado') || storage.includes('Réfrigéré') || storage.includes('Congelé');
      const HIGH_RISK_RTE = isRTE && isCold;

      // 5. Vulnerable Consumer
      const consumerGroup = product.intended_consumer_group || "";
      const VULNERABLE_CONSUMER = consumerGroup.includes("Vulnerable") || consumerGroup.includes("Mixed") ||
                                  consumerGroup.includes("vulneráveis") || consumerGroup.includes("mistos") ||
                                  consumerGroup.includes("vulnerables") || consumerGroup.includes("vulnérables");

      // 6. Foreseeable Misuse
      const misuse = product.foreseeable_misuse || "";
      const FORESEEABLE_MISUSE = misuse.includes("Possible") || misuse.includes("Possível") || 
                                 misuse.includes("Posible") || misuse.includes("possible");

      return {
          SCOPE_GROUPED,
          INGREDIENT_DETAIL_LOW,
          SHELF_LIFE_UNVALIDATED,
          HIGH_RISK_RTE,
          VULNERABLE_CONSUMER,
          FORESEEABLE_MISUSE,
          HAS_WARNINGS: SCOPE_GROUPED || INGREDIENT_DETAIL_LOW || SHELF_LIFE_UNVALIDATED || HIGH_RISK_RTE || VULNERABLE_CONSUMER || FORESEEABLE_MISUSE
      };
  }, [allAnswers]);

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
                      hazard_type: key,
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

    // Helper to trigger transition
    const triggerTransition = (msg: string, nextSection: SectionKey, cb?: () => void) => {
        setTransition({ show: true, message: msg });
        setTimeout(() => {
            setTransition({ show: false, message: '' });
            setCurrentSection(nextSection);
            if(cb) cb();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1500);
    };

    // If editing from complete section, save and return there instead of continuing flow
    if (returnToCompleteRef.current) {
        returnToCompleteRef.current = false;
        // Clear the returnTo param from URL
        const params = new URLSearchParams(window.location.search);
        params.delete('returnTo');
        params.delete('step');
        window.history.replaceState({}, '', `?${params.toString()}`);
        // Trigger auto-save with new answers
        setAllAnswers(newAnswers);
        // Clear stale validation to force re-validation after edits
        setValidationReport(null);
        setValidationStatus('idle');
        triggerTransition("Changes saved! Please re-validate your plan.", 'complete');
        return;
    }

    // Navigation Logic
    switch (sectionKey) {
      case 'product':
        // Critical Change Detection
        const oldProduct = allAnswers.product || {};
        const productKeys = ['plan_scope', 'product_category', 'intended_consumer_group', 'shelf_life_basis', 'cooking_required'];
        const productChanged = productKeys.some(k => oldProduct[k] !== data[k]);

        if (productChanged && (allAnswers.hazard_analysis?.length > 0 || allAnswers.ccp_decisions?.length > 0)) {
            if (confirm("⚠️ Critical changes detected.\n\nChanging product details invalidates your Hazard Analysis and CCPs.\n\nClick OK to save and CLEAR downstream data.\nClick Cancel to discard changes.")) {
                newAnswers.hazard_analysis = undefined;
                newAnswers.ccp_decisions = undefined;
                newAnswers.ccp_management = undefined;
                setValidationReport(null);
                setGeneratedPlan(null);
            } else {
                return;
            }
        }
        triggerTransition("Product details saved!", 'process');
        break;
      
      case 'process':
        // Process Step Change Detection
        const oldSteps = allAnswers.process?.process_steps || [];
        const newSteps = data.process_steps || [];
        // Compare step IDs and names to detect structural changes
        const stepsChanged = JSON.stringify(oldSteps.map((s: any) => ({id: s.step_id, name: s.step_name}))) !== 
                             JSON.stringify(newSteps.map((s: any) => ({id: s.step_id, name: s.step_name})));

        if (stepsChanged && (allAnswers.hazard_analysis?.length > 0 || allAnswers.ccp_decisions?.length > 0)) {
             if (confirm("⚠️ Process Flow modified.\n\nChanging the process flow invalidates your Hazard Analysis (steps no longer match).\n\nClick OK to save and CLEAR downstream data.\nClick Cancel to discard changes.")) {
                newAnswers.hazard_analysis = undefined;
                newAnswers.ccp_decisions = undefined;
                newAnswers.ccp_management = undefined;
                setValidationReport(null);
                setGeneratedPlan(null);
            } else {
                return;
            }
        }
        triggerTransition("Process flow mapped!", 'prp');
        break;
      
      case 'prp':
        // Start Hazard Analysis Loop
        if (newAnswers.process?.process_steps?.length > 0) {
            // Priority 2: Grouped Scope Variance Confirmation
            if (riskFlags.SCOPE_GROUPED) {
                setShowScopeConfirmation(true);
                return;
            }
            triggerTransition("Starting Hazard Analysis...", 'hazards', () => setCurrentStepIndex(0));
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
            // Small toast for loop steps instead of full transition? Or fast transition?
            // Let's just increment for flow speed, maybe a quick toast in future.
            // For now, standard behavior within loop to keep it fast.
            setCurrentStepIndex(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Loop done. Save final one.
             const existingHazards = newAnswers.hazard_analysis || [];
             const stepId = steps[currentStepIndex].step_id || steps[currentStepIndex].step_name;
             newAnswers.hazard_analysis = [...existingHazards, { step_id: stepId, data }];
             setAllAnswers(newAnswers);

            // Check if any significant hazards were identified
            const sigHazards = getSignificantHazards(newAnswers);
            if (sigHazards.length === 0) {
                triggerTransition("Risk Assessment Complete!", 'review_validation'); // Skip CCP steps entirely
            } else {
                triggerTransition("Hazards Identified. Moving to CCPs...", 'ccp_determination', () => {
                    setCurrentCCPIndex(0);
                    setIdentifiedCCPs([]);
                });
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
             window.scrollTo({ top: 0, behavior: 'smooth' });
         } else {
             // Loop done
             newAnswers.ccp_decisions = updatedCCPs;
             setAllAnswers(newAnswers);
             
             // Conditionally show CCP Management
             const hasCCPs = updatedCCPs.some(ccp => ccp.is_ccp);
             if (hasCCPs) {
                 triggerTransition("Critical Points Identified!", 'ccp_management', () => setCurrentCCPIndex(0));
             } else {
                 triggerTransition("Analysis Complete!", 'review_validation');
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
        setCurrentSection('review_validation');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;

      case 'review_validation':
        // Check for High Risk Gate
        if (riskFlags.HIGH_RISK_RTE && riskFlags.SHELF_LIFE_UNVALIDATED) {
            setShowHighRiskModal(true);
            return;
        }

        // No visual transition needed, goes to 'generating' spinner
        setCurrentSection('generating');
        await generatePlan(newAnswers);
        break;
    }
  };

  const generatePlan = async (answers: any) => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    const requiredSections = ['product', 'process', 'prp', 'hazards'] as const;
    const missing = requiredSections.filter(s => !answers[s] || Object.keys(answers[s]).length === 0);
    if (missing.length > 0) {
        isGeneratingRef.current = false;
        setCurrentSection(missing[0] as SectionKey);
        alert(`Please complete: ${missing.join(', ')}`);
        return;
    }

    try {
        const payload = {
            ...answers,
            ...riskFlags,
            language,
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

        const body = JSON.stringify(payload);
        let res: Response | null = null;
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                res = await fetch('/api/generate-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body
                });
                if (res.ok || res.status < 500) break;
            } catch (fetchErr) {
                if (attempt === 1) throw fetchErr;
            }
            await new Promise(r => setTimeout(r, (attempt + 1) * 2000));
        }
        if (!res) throw new Error('Network error after retries');
        const data = await res.json();
        setGeneratedPlan(data);
        setCurrentSection('complete'); 
        setValidationStatus('idle');

        // Persist generated content to draft
        if (draftId) {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                return;
            }
            await fetch(`/api/drafts/${draftId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ plan_data: data })
            });
        }
    } catch (e) {
        console.error(e);
        alert("Generation failed");
    } finally {
        isGeneratingRef.current = false;
    }
  };

  const handleDownloadPdf = async (isPaidContext = false) => {
      const actionKey = isPaidContext ? 'pdf_paid' : 'pdf_free';
      if (busyAction) return;

      await runWithBusy(actionKey, async () => {
          const exportId = generatedPlan?.id || draftId;
          if (!exportId) return;
          try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) return;

              const fetchPdf = async (id: string) => {
                  const response = await fetch(`/api/download-pdf?planId=${id}&lang=${language}`, {
                      headers: { Authorization: `Bearer ${session.access_token}` }
                  });
                  return response;
              };

              let res = await fetchPdf(exportId);
              if (!res.ok && draftId && draftId !== exportId) {
                  const err = await res.json().catch(() => null);
                  if (err?.error === 'Plan not found') {
                      res = await fetchPdf(draftId);
                  }
              }

              if (!res.ok) {
                  const err = await res.json().catch(() => null);
                  alert(err?.error || 'Download failed');
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
      });
  };

  const handleDownloadWord = async () => {
      if (busyAction) return;
      await runWithBusy('word', async () => {
          const exportId = generatedPlan?.id;
          if (!exportId) {
              alert('Please save your plan before downloading the Word document.');
              return;
          }

          try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) return;

              const res = await fetch(`/api/download-word?planId=${exportId}&lang=${language}`, {
                  headers: { Authorization: `Bearer ${session.access_token}` }
              });

              if (!res.ok) {
                  const err = await res.json().catch(() => null);
                  alert(err?.error || 'Download failed');
                  return;
              }

              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `HACCP_Plan_${allAnswers.product?.businessLegalName?.replace(/\s+/g, '_') || 'Draft'}.docx`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
          } catch (e) {
              console.error(e);
              alert('Failed to download Word document.');
          }
      });
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
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                  return;
              }
              await fetch(`/api/drafts/${draftId}`, {
                  method: 'PATCH',
                  headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${session.access_token}`
                  },
                  body: JSON.stringify({ validation: data })
              });
          }

          // Check Auth
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
              await savePlan(plan, data);
          } else {
              persistAnonymousSnapshot();
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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            throw new Error("Unauthorized");
        }

        const res = await fetch('/api/save-plan', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
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
      const returnTo = searchParams.get('returnTo');

      // Track if we should return to complete after this edit
      if (returnTo === 'complete') {
          returnToCompleteRef.current = true;
      }

      if (urlStep && urlStep !== currentSection) {
          // Verify we have data to support this jump (pessimistic)
          if (urlStep === 'process' && !allAnswers.product) return;
          if (urlStep === 'hazards' && !allAnswers.process) return;

          setCurrentSection(urlStep);
      }
  }, [searchParams]);

  useEffect(() => {
      if (currentSection === 'complete') {
        // Reset scroll so review summary opens at top, not mid-page
        window.scrollTo(0, 0);
      } else {
        updateStepInUrl(currentSection);
      }
  }, [currentSection]);

  const openCheckout = async (tier: 'professional' | 'expert') => {
      const actionKey = tier === 'professional' ? 'checkout_professional' : 'checkout_expert';
      if (busyAction) return;

      triggerPulse(actionKey);
      setBusyAction(actionKey);

      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
              const nextUrl = encodeURIComponent(
                  draftId ? `/builder?draft=${draftId}` : generatedPlan?.id ? `/builder?id=${generatedPlan.id}` : '/builder'
              );
              window.location.href = `/login?next=${nextUrl}`;
              return;
          }

          if (!generatedPlan?.id) {
              alert("Please wait for the plan to finish saving...");
              setBusyAction(null);
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
              // Navigate in same tab - back button returns to Stripe cancel URL (/builder?id=...)
              window.location.href = data.url;
          } else {
              alert(data.error || "Failed to start checkout");
              setBusyAction(null);
          }
      } catch (e) {
          console.error(e);
          alert("System error starting checkout.");
          setBusyAction(null);
      }
  };

    const handleHighRiskConfirm = async () => {

        if (highRiskConfirmation.toLowerCase() === "i accept responsibility for validation") {

            setShowHighRiskModal(false);

            setCurrentSection('generating');

            await generatePlan(allAnswers);

        } else {

            alert("Please type the confirmation sentence exactly as shown.");

        }

    };

  

    // --- Render Helpers ---

  

    const getProgress = (section: SectionKey) => {

      const steps = ['product', 'process', 'prp', 'hazards', 'ccp_determination', 'ccp_management', 'review_validation', 'complete'];

      const idx = steps.indexOf(section);

      if (section === 'generating' || section === 'validating') return 90;

      if (idx === -1) return 0;

      return Math.min(Math.round((idx / 7) * 100), 100);

    };

    

    const getSectionTitle = (section: SectionKey) => {

        const titles: Record<string, string> = {

            product: '1. Product Description',

            process: '2. Process Flow',

            prp: '3. Prerequisite Programs',

            hazards: '4. Hazard Analysis',

            ccp_determination: '5. CCP Determination',

            ccp_management: '6. CCP Management',

            review_validation: '7. Review & Validation Requirements',

            generating: 'Generating Plan...', 

            validating: 'Auditing Plan...', 

            complete: 'Plan Complete'

        };

        return titles[section] || 'Builder';

    }

  

    const progress = getProgress(currentSection);

  

    const renderContent = () => {

      // 1. Loading State (Highest Priority)
      if (isInitializing) {
          return (
              <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-300">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
                  <h2 className="text-xl font-bold text-slate-700">Loading your plan...</h2>
              </div>
          );
      }

      // 2. Error State
      if (loadError) {
          return (
              <div className="max-w-2xl mx-auto p-10 text-center mt-20 animate-in fade-in zoom-in duration-300">
                  <div className="bg-red-50 p-10 rounded-3xl border border-red-200">
                      <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-6" />
                      <h2 className="text-3xl font-black text-red-900 mb-4">Unable to Load Draft</h2>
                      <p className="text-red-800 text-lg mb-8 leading-relaxed">{loadError}</p>
                      <div className="flex justify-center gap-4">
                          <a href="/dashboard" className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all cursor-pointer">
                              Back to Dashboard
                          </a>
                          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 cursor-pointer">
                              Try Again
                          </button>
                      </div>
                  </div>
              </div>
          );
      }

      if (transition.show) {

          return (

              <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">

                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">

                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />

                  </div>

                  <h2 className="text-3xl font-black text-slate-900 mb-2">{transition.message}</h2>

                  <p className="text-slate-500">Saving progress...</p>

              </div>

          );

      }

      

      if (showHighRiskModal) {

          return (

              <div className="max-w-2xl mx-auto p-10 text-center space-y-8 mt-20 animate-in fade-in zoom-in duration-300">

                  <div className="bg-red-50 p-10 rounded-3xl border-2 border-red-200 shadow-xl">

                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">

                          <ShieldAlert className="w-8 h-8 text-red-600" />

                      </div>

                      <h2 className="text-3xl font-black text-red-900 mb-4">CRITICAL SAFETY WARNING</h2>

                      <p className="text-red-800 font-bold text-lg mb-4">

                          You are creating a plan for High-Risk Ready-to-Eat food with an Unvalidated Shelf Life.

                      </p>

                      <p className="text-red-700 mb-8 leading-relaxed">

                          This combination creates a severe risk of pathogen growth (e.g., Listeria monocytogenes) which can be fatal. 

                          You CANNOT rely on this draft for safety without professional laboratory validation of your shelf life.

                      </p>

                      

                      <div className="bg-white p-6 rounded-xl border border-red-200 text-left mb-6">

                          <label className="block text-xs font-bold text-red-500 uppercase mb-2">

                              To proceed, type: "I accept responsibility for validation"

                          </label>

                          <input 

                              type="text" 

                              value={highRiskConfirmation}

                              onChange={(e) => setHighRiskConfirmation(e.target.value)}

                              className="w-full p-3 rounded-lg border-2 border-red-100 focus:border-red-500 outline-none font-bold text-slate-700"

                              placeholder="Type here..."

                          />

                      </div>

  

                      <div className="flex justify-center gap-4">

                          <button 

                              onClick={() => setShowHighRiskModal(false)} 

                              className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"

                          >

                              Go Back

                          </button>

                          <button 

                              onClick={handleHighRiskConfirm} 

                              disabled={highRiskConfirmation.toLowerCase() !== "i accept responsibility for validation"}

                              className="bg-red-600 disabled:bg-slate-300 disabled:text-slate-400 text-white px-8 py-3 rounded-xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"

                          >

                              Confirm & Generate

                          </button>

                      </div>

                  </div>

              </div>

          );

      }

      if (showScopeConfirmation) {
          return (
              <div className="max-w-2xl mx-auto p-10 text-center space-y-8 mt-20 animate-in fade-in zoom-in duration-300">
                  <div className="bg-amber-50 p-10 rounded-3xl border-2 border-amber-200 shadow-xl">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <AlertTriangle className="w-8 h-8 text-amber-600" />
                      </div>
                      <h2 className="text-3xl font-black text-amber-900 mb-4">Grouped Scope Confirmation</h2>
                      <p className="text-amber-800 font-bold text-lg mb-4">
                          You are creating a plan for a "Group" or "Process Category".
                      </p>
                      <p className="text-amber-800 mb-8 leading-relaxed">
                          This assumes that <strong>all products</strong> in this group share identical hazards, ingredients, and processing steps. 
                          <br/><br/>
                          If specific products have unique allergens or risks, they should have their own separate plans.
                      </p>
                      
                      <div className="flex justify-center gap-4">
                          <button 
                              onClick={() => setShowScopeConfirmation(false)} 
                              className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                          >
                              Go Back
                          </button>
                          <button 
                              onClick={() => {
                                  setShowScopeConfirmation(false);
                                  // Replicate the logic from handleSectionComplete('prp')
                                  setTransition({ show: true, message: "Starting Hazard Analysis..." });
                                  setTimeout(() => {
                                      setTransition({ show: false, message: '' });
                                      setCurrentSection('hazards');
                                      setCurrentStepIndex(0);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }, 1500);
                              }} 
                              className="bg-amber-600 text-white px-8 py-3 rounded-xl font-black hover:bg-amber-700 transition-all shadow-lg shadow-amber-500/20"
                          >
                              I Understand, Proceed
                          </button>
                      </div>
                  </div>
              </div>
          );
      }
      
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
        return (
            <div className="space-y-12 pb-32">
                <HACCPQuestionnaire sectionData={getQuestions('product', language) as unknown as HACCPSectionData} onComplete={(d) => handleSectionComplete('product', d)} initialData={allAnswers.product} />
                
                <div className="max-w-3xl mx-auto pt-4 border-t border-slate-200">
                    <div className={`rounded-2xl p-6 border ${riskFlags.HAS_WARNINGS ? 'bg-amber-50 border-amber-200' : 'bg-slate-100/50 border-slate-200'}`}>
                        <div className="flex items-start gap-3">
                            {riskFlags.HAS_WARNINGS ? (
                                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                            ) : (
                                <Info className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                            )}
                            <div>
                                <h4 className={`font-black text-sm uppercase tracking-wider mb-2 ${riskFlags.HAS_WARNINGS ? 'text-amber-900' : 'text-slate-900'}`}>
                                    HACCP Assisted Draft Notice
                                </h4>
                                <p className={`text-sm leading-relaxed ${riskFlags.HAS_WARNINGS ? 'text-amber-800' : 'text-slate-600'}`}>
                                    {riskFlags.HAS_WARNINGS 
                                        ? "This HACCP draft includes assumptions and unvalidated elements. Review and approval by a competent food safety professional is required before implementation."
                                        : "This HACCP document is an assisted draft based on the information provided. It has not been validated or verified and must be reviewed by a competent food safety professional before implementation."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
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
          section: 'Hazard Analysis'
      } as unknown as HACCPSectionData;

      const isGenericPattern = checkGenericRiskPattern();

      return (
        <div key={currentStepIndex} className="space-y-6"> 
            {riskFlags.SCOPE_GROUPED && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl max-w-3xl mx-auto shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-amber-500 mt-1" />
                        <div>
                            <h3 className="font-black text-amber-900 text-lg mb-1">Hazard analysis is based on grouped product assumptions.</h3>
                            <p className="text-amber-800 font-medium text-sm">
                                This HACCP draft assumes similar hazards across the defined scope. 
                                Differences in ingredients, allergens, or processing may introduce unassessed hazards.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <HACCPQuestionnaire 
                sectionData={dynamicSchema} 
                onComplete={(d) => handleSectionComplete('hazards', d)} 
                additionalContext={{ step_name: step?.step_name }}
                title="Analyze Hazards"
                description={
                    <span className="font-bold text-slate-700">
                        Analyzing Step: <span className="text-blue-600">{step?.step_name || 'Unknown Step'}</span>
                    </span>
                }
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
          section: 'CCP Determination'
      } as unknown as HACCPSectionData;

      return (
        <div className="space-y-6">
            <HACCPQuestionnaire 
                sectionData={dynamicSchema} 
                onComplete={(d) => handleSectionComplete('ccp_determination', d)} 
                additionalContext={{ step_name: currentHazard.step_name }}
                title="Identify Critical Points"
                description={
                    <div className="bg-blue-50 border-blue-200 border p-4 rounded-xl inline-block text-left text-sm text-blue-800">
                        <p><strong>Step:</strong> {currentHazard.step_name}</p>
                        <p><strong>Hazard:</strong> {currentHazard.hazards} ({currentHazard.hazard_type})</p>
                    </div>
                }
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
          section: 'CCP Management',
          questions: dynamicQuestions
      } as unknown as HACCPSectionData;

       return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
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
                title="Manage Critical Points"
                description={
                    <span>
                        You have identified <strong>{ccpList.length} Critical Control Points</strong>.<br/>
                        Define the monitoring and control limits for each one below to ensure food safety.
                    </span>
                }
            />
        </div>
       );
  }

  if (currentSection === 'review_validation') {
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
            <HACCPQuestionnaire sectionData={getQuestions('validation', language) as unknown as HACCPSectionData} onComplete={(d) => handleSectionComplete('review_validation', d)} />
        </div>
       );
  }

  if (currentSection === 'generating' || currentSection === 'validating') {
      return (
          <div className="min-h-screen flex items-center justify-center flex-col gap-4">
              <ProcessLog mode={currentSection as 'generating' | 'validating'} />
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
                          persistAnonymousSnapshot();
                          const nextUrl = encodeURIComponent(draftId ? `/builder?draft=${draftId}` : '/builder');
                          window.location.href = `/signup?next=${nextUrl}`;
                      }}
                      className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 cursor-pointer"
                  >
                      Save & Continue
                  </button>
                  <p className="text-sm text-slate-400 mt-4">Already have an account? <a href={`/login?next=${encodeURIComponent(draftId ? `/builder?draft=${draftId}` : '/builder')}`} className="text-blue-600 hover:underline">Log In</a></p>
              </div>
          </div>
      );
  }

  if (currentSection === 'complete') {
      const isPaid = generatedPlan?.payment_status === 'paid';
      const exportBlocked = validationReport?.block_export || validationReport?.section_1_overall_assessment?.audit_readiness === "Major Gaps";
      /** Map validation section names to builder step keys. */
      const sectionToStep = (section: string): SectionKey => {
          const s = section.toLowerCase();
          if (s.includes('product') || s.includes('scope') || s.includes('team') || s.includes('intended use')) return 'product';
          if (s.includes('process') || s.includes('flow')) return 'process';
          if (s.includes('prerequisite') || s.includes('prp')) return 'prp';
          if (s.includes('hazard')) return 'hazards';
          if (s.includes('ccp') && s.includes('management')) return 'ccp_management';
          if (s.includes('ccp') || s.includes('critical control')) return 'ccp_determination';
          if (s.includes('verification') || s.includes('record') || s.includes('review') || s.includes('validation')) return 'review_validation';
          return 'product';
      };

      const editUrlForStep = (step: SectionKey) => {
          if (draftId) return `/builder?draft=${draftId}&step=${step}&returnTo=complete`;
          if (generatedPlan?.id) return `/builder?id=${generatedPlan.id}&step=${step}&returnTo=complete`;
          return `/builder?step=${step}&returnTo=complete`;
      };

      const editUrl = editUrlForStep('product');
      return (
          <div className="max-w-4xl mx-auto p-10 space-y-8">
              <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl text-center space-y-4">
                  <h1 className="text-4xl font-black text-slate-900">Automated Draft Summary</h1>
                  <p className="text-slate-600">
                      This document is an automated output generated by software based on your inputs and includes system assumptions. It does not constitute professional advice or a guarantee that your operations meet food safety requirements.
                  </p>
              </div>

              {/* SECTION 2 — AUTOMATED CHECKS & LIMITATIONS */}
              <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                      <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                          Automated Draft Checks Completed
                      </h2>
                      <ul className="space-y-3 text-sm text-slate-600">
                          <li className="flex items-start gap-2">
                              <span className="text-blue-600 font-bold">•</span>
                              <span><strong>Logical Consistency:</strong> Verified that process steps align with common hazard patterns.</span>
                          </li>
                          <li className="flex items-start gap-2">
                              <span className="text-blue-600 font-bold">•</span>
                              <span><strong>Mandatory Completion:</strong> Confirmed all essential sections have user entries.</span>
                          </li>
                          <li className="flex items-start gap-2">
                              <span className="text-blue-600 font-bold">•</span>
                              <span><strong>Hazard Categorization:</strong> Sorted risks into biological, chemical, and physical groups.</span>
                          </li>
                          <li className="flex items-start gap-2">
                              <span className="text-blue-600 font-bold">•</span>
                              <span><strong>Rule-Based CCP Mapping:</strong> Applied standard decision logic to your provided inputs.</span>
                          </li>
                      </ul>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl shadow-sm">
                      <h2 className="text-xl font-black text-amber-900 mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          System Limitations
                      </h2>
                      <ul className="space-y-3 text-sm text-amber-800">
                          <li className="flex items-start gap-2 italic">
                              <span className="font-bold">•</span>
                              <span>No verification of technical data accuracy.</span>
                          </li>
                          <li className="flex items-start gap-2 italic">
                              <span className="font-bold">•</span>
                              <span>No assessment of control measure effectiveness.</span>
                          </li>
                          <li className="flex items-start gap-2 italic">
                              <span className="font-bold">•</span>
                              <span>No check of actual site-specific practices or environment.</span>
                          </li>
                      </ul>
                  </div>
              </div>

              {/* SECTION 3 — KEY ASSUMPTIONS & GAPS */}
              {(riskFlags.HAS_WARNINGS || riskFlags.SCOPE_GROUPED) && (
                  <div className="bg-slate-50 border-l-4 border-amber-500 p-8 rounded-r-3xl shadow-sm">
                      <h2 className="text-xl font-black text-slate-900 mb-4">Key Assumptions & Potential Gaps</h2>
                      <p className="text-sm text-slate-600 mb-4">The following list identifies areas where inputs were missing and details the assumptions the system applied to generate the draft. It serves as a record of the information used to complete the current version of the document.</p>
                      <ul className="space-y-3 mb-6">
                          {riskFlags.SCOPE_GROUPED && (
                              <li className="flex items-start gap-3">
                                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                  <span className="text-slate-700 text-sm"><strong>Grouped Scope:</strong> The draft assumes hazards are identical across all grouped products. Differences may introduce unassessed risks.</span>
                              </li>
                          )}
                          {riskFlags.INGREDIENT_DETAIL_LOW && (
                              <li className="flex items-start gap-3">
                                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                  <span className="text-slate-700 text-sm"><strong>Generic Ingredient Detail:</strong> Low-specificity lists ("various", "etc") may obscure specific chemical or allergen hazards.</span>
                              </li>
                          )}
                          {riskFlags.SHELF_LIFE_UNVALIDATED && (
                              <li className="flex items-start gap-3">
                                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                  <span className="text-slate-700 text-sm"><strong>Unvalidated Shelf Life:</strong> Shelf life is based on assumption rather than stability data. This is a critical safety gap.</span>
                              </li>
                          )}
                          {riskFlags.HIGH_RISK_RTE && (
                              <li className="flex items-start gap-3">
                                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                  <span className="text-slate-700 text-sm"><strong>High-Risk Combination:</strong> RTE products with cold storage require rigorous Listeria management which this automated draft cannot verify.</span>
                              </li>
                          )}
                          {riskFlags.VULNERABLE_CONSUMER && (
                              <li className="flex items-start gap-3">
                                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                  <span className="text-slate-700 text-sm"><strong>Vulnerable Consumers:</strong> Serving vulnerable groups requires stricter controls than this standard draft may provide.</span>
                              </li>
                          )}
                      </ul>
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                          Caution: Failure to professionally verify these assumptions may result in an ineffective food safety system.
                      </p>
                  </div>
              )}

              <div className="bg-red-50 border border-red-100 p-8 rounded-3xl shadow-sm">
                  <h2 className="text-xl font-black text-red-900 mb-4 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-600" />
                      What This Draft Does Not Provide
                  </h2>
                  <ul className="space-y-3 text-sm text-red-800">
                      <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span><strong>No Professional Assessment:</strong> This document has not been assessed for effectiveness by a professional.</span>
                      </li>
                      <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span><strong>No Technical Confirmation:</strong> The system does not confirm that your CCPs or Critical Limits are scientifically sufficient.</span>
                      </li>
                      <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span><strong>No Regulatory Authorization:</strong> This draft does not constitute authorization by any food safety authority.</span>
                      </li>
                      <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span><strong>No Data Verification:</strong> The system does not check the accuracy of technical inputs or shelf-life declarations.</span>
                      </li>
                      <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span><strong>No Assurance of Compliance:</strong> Implementing this draft alone does not ensure compliance with food law.</span>
                      </li>
                  </ul>
              </div>

              {/* 1. Idle State: Not yet checked */}
              {validationStatus === 'idle' && (
                  <div className="bg-white border border-slate-200 p-12 rounded-3xl shadow-sm text-center space-y-8">
                      <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2">
                              <h2 className="text-2xl font-black text-slate-900">Draft Check Status</h2>
                              <Tooltip text="This check analyzes the internal logic of your draft for completeness and standard patterns. It is not an approval." />
                          </div>
                          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-sm">
                              <Info className="w-4 h-4" /> Check Pending
                          </div>
                      </div>
                      
                      <button 
                          onClick={handleRunValidation}
                          className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 transform hover:scale-105 active:scale-95 cursor-pointer"
                      >
                          Run System Check
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
                    <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
                        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Validation complete  choose an outcome</h2>
                                <p className="text-slate-600 text-sm">
                                    Free users can download a watermarked draft. Paid users can check out and unlock full exports from this page.
                                </p>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400 mb-2">Free draft download</p>
                                    <h3 className="text-lg font-black text-slate-900 mb-3">Watermarked PDF for review</h3>
                                    <p className="text-sm text-slate-600">
                                        Keep a watermarked version for internal review and team sign-off. It stays clearly marked as a draft.
                                    </p>
                                </div>
                                <div className="mt-6 space-y-3">
                                    <button 
                                        onClick={() => handleDownloadPdf(false)}
                                        disabled={!!busyAction}
                                        className={`bg-white text-slate-900 border border-slate-300 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all w-full flex items-center justify-center gap-2 active:scale-[0.98] focus-visible:ring-2 ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed ${pulseAction === 'pdf_free' ? 'animate-pulse' : ''}`}
                                    >
                                        {busyAction === 'pdf_free' ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing PDF...</> : 'Download Watermarked PDF'}
                                    </button>
                                    <p className="text-[11px] text-slate-500">
                                        Drafts are for internal review only and are not intended for operational implementation.
                                    </p>
                                </div>
                            </div>

                            <div className={`rounded-2xl border p-6 ${isPaid ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <p className={`text-xs font-bold uppercase mb-2 ${isPaid ? 'text-emerald-500' : 'text-blue-500'}`}>
                                            {isPaid ? 'Export unlocked' : 'Checkout to unlock'}
                                        </p>
                                        <h3 className={`text-xl font-black mb-2 ${isPaid ? 'text-emerald-900' : 'text-blue-900'}`}>
                                            {isPaid ? 'Professional exports are ready' : 'Remove watermarks & unlock findings'}
                                        </h3>
                                        <p className={`text-sm ${isPaid ? 'text-emerald-700' : 'text-blue-700'}`}>
                                            {isPaid
                                                ? 'Download your plan in Word or PDF with your selected format.'
                                                : 'Pay here to unlock Word + PDF exports and the full validation findings.'}
                                        </p>
                                    </div>

                                    {isPaid ? (
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            <button
                                                onClick={handleDownloadWord}
                                                disabled={!!busyAction}
                                                className={`bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-[0.98] focus-visible:ring-2 ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed ${pulseAction === 'word' ? 'animate-pulse' : ''}`}
                                            >
                                                {busyAction === 'word' ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing Word...</> : 'Download Word'}
                                            </button>
                                            <button
                                                onClick={() => handleDownloadPdf(true)}
                                                disabled={!!busyAction}
                                                className={`bg-white text-emerald-900 px-4 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all border border-emerald-200 flex items-center justify-center gap-2 active:scale-[0.98] focus-visible:ring-2 ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed ${pulseAction === 'pdf_paid' ? 'animate-pulse' : ''}`}
                                            >
                                                {busyAction === 'pdf_paid' ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing PDF...</> : 'Download PDF'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => openCheckout('professional')}
                                                disabled={isSavingPlan || !!busyAction}
                                                className={`bg-slate-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 active:scale-[0.98] focus-visible:ring-2 ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed ${pulseAction === 'checkout_professional' ? 'animate-pulse' : ''}`}
                                            >
                                                {busyAction === 'checkout_professional' ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening checkout...</> : (isSavingPlan ? 'Saving...' : `${PLAN_TIERS.professional.label} (${TIER_PRICE.professional})`)}
                                            </button>
                                            <button 
                                                onClick={() => openCheckout('expert')}
                                                disabled={isSavingPlan || !!busyAction}
                                                className={`bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 active:scale-[0.98] focus-visible:ring-2 ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed ${pulseAction === 'checkout_expert' ? 'animate-pulse' : ''}`}
                                            >
                                                {busyAction === 'checkout_expert' ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening checkout...</> : (isSavingPlan ? 'Saving...' : `${PLAN_TIERS.expert.label} (${TIER_PRICE.expert})`)}
                                            </button>
                                        </div>
                                    )}

                                    {saveError && (
                                        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col items-center gap-3 animate-in fade-in zoom-in">
                                            <p className="text-red-600 font-bold text-sm"> {saveError}</p>
                                            <button 
                                                onClick={() => savePlan(generatedPlan.full_plan, validationReport)}
                                                className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
                                            >
                                                Retry Saving Progress
                                            </button>
                                        </div>
                                    )}

                                    {!isPaid && (
                                        <div className="grid md:grid-cols-2 gap-4 text-xs">
                                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                                <p className="font-bold text-slate-500 uppercase mb-2">{PLAN_TIERS.professional.label}</p>
                                                <ul className="text-slate-600 space-y-1">
                                                    <li> Remove watermarks</li>
                                                    <li> Word + PDF downloads</li>
                                                    <li> Automated gap list</li>
                                                </ul>
                                            </div>
                                            <div className="bg-white border border-blue-200 rounded-xl p-4">
                                                <p className="font-bold text-blue-500 uppercase mb-2">{PLAN_TIERS.expert.label}</p>
                                                <p className="text-blue-700 text-xs leading-relaxed">
                                                    The Professional Review provides a human assessment of your draft based solely on the information you have provided. This service is limited to checking for logical consistency and does not provide certification, regulatory validation, or a guarantee of any specific outcome.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="audit-report" className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                            <h2 className="text-2xl font-black text-slate-900">HACCP Draft Review Summary</h2>
                            <div className="flex items-center gap-4">
                                <Link href={editUrl} className="bg-white text-blue-700 border border-blue-200 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">
                                    Edit answers
                                </Link>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Generated by</p>
                                    <p className="font-bold text-slate-900">iLoveHACCP (Assisted Draft)</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <span className="text-xs font-bold uppercase text-slate-400">Draft Completeness</span>
                                <p className="text-base font-semibold text-slate-900">Required sections present</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <span className="text-xs font-bold uppercase text-slate-400">Review Status</span>
                                <p className="text-base font-semibold text-slate-900">Assumptions and gaps identified</p>
                            </div>
                        </div>
                        
                        {/* Detailed Report — free content (gaps & assumptions) */}
                        <div className="relative">
                            <div>
                                {/* Strengths (free) */}
                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-slate-900">Draft checks</h3>
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Included free</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3">Automated completeness checks against the required HACCP sections.</p>
                                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                                        {validationReport?.section_2_strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>

                                {/* Gaps & assumptions (free) */}
                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-slate-900">Gaps &amp; assumptions</h3>
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Included free</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3">
                                        Sections where information may be missing, unclear, or based on default assumptions. You can edit your answers to address each item.
                                    </p>
                                    <ul className="list-none space-y-3">
                                        {validationReport?.section_3_weaknesses_risks?.map((w: any, i: number) => {
                                            const step = sectionToStep(w.section || '');
                                            return (
                                                <li key={i} className="flex items-start gap-2 text-slate-600">
                                                    <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                                                    <span className="flex-1">{w.weakness} <span className="text-slate-400 text-xs">({w.section})</span></span>
                                                    <Link
                                                        href={editUrlForStep(step)}
                                                        className="text-blue-600 hover:text-blue-800 text-xs font-bold whitespace-nowrap shrink-0"
                                                    >
                                                        Edit
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                {/* Professional Review Notes — paid only */}
                                {isPaid && validationReport?.advisory_recommendations && validationReport.advisory_recommendations.length > 0 && (
                                    <div className="pt-6 border-t border-slate-100 mt-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="bg-slate-100 p-2 rounded-lg">
                                                <Info className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900">{PLAN_TIERS.expert.shortLabel} Notes</h3>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-4">
                                            Detailed expert feedback on each gap: why it matters, what to consider, and which HACCP principle applies.
                                        </p>
                                        <div className="space-y-4">
                                            {validationReport.advisory_recommendations.map((rec: any, i: number) => {
                                                const recStep = sectionToStep(rec.related_builder_section || '');
                                                return (
                                                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-200 transition-colors">
                                                        <div className="flex items-start justify-between gap-4 mb-2">
                                                            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">{rec.issue_summary}</h4>
                                                            <span className="text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest bg-slate-200 text-slate-600">
                                                                {rec.gap_type}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-600 text-sm mb-3 italic">&ldquo;{rec.why_it_matters}&rdquo;</p>
                                                        <div className="bg-white p-3 rounded-xl border border-slate-100 mb-3">
                                                            <p className="text-slate-700 font-medium text-sm">{rec.recommendation_text}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                                            <span>{rec.related_haccp_principle}</span>
                                                            <Link href={editUrlForStep(recStep)} className="bg-slate-200 px-2 py-1 rounded text-blue-600 hover:text-blue-800 font-bold">
                                                                {rec.related_builder_section}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-200">
                        <p className="text-[10px] text-slate-400 text-center leading-relaxed max-w-2xl mx-auto">
                            This document is an assisted draft generated based on user-provided information and has not undergone professional validation or verification. 
                            A comprehensive review by a competent food safety professional is required to ensure accuracy and regulatory compliance before implementation.
                        </p>
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
        {loadError && (
            <div className="max-w-3xl mx-auto px-6 pt-6">
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{loadError}</span>
                </div>
            </div>
        )}
        {/* Progress Bar */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-3xl mx-auto px-6 py-4">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{getSectionTitle(currentSection)}</span>
                    <span className="flex items-center gap-2">
                      {autoSaveStatus === 'saving' && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <CloudUpload className="w-3 h-3 animate-pulse" /> Saving…
                        </span>
                      )}
                      {autoSaveStatus === 'saved' && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                          <Check className="w-3 h-3" /> Saved
                        </span>
                      )}
                      {autoSaveStatus === 'error' && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500">
                          <CloudOff className="w-3 h-3" /> Save failed
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-400">{progress}%</span>
                    </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2">
                  {(['product','process','prp','hazards','ccp_determination','ccp_management','review_validation'] as const).map((step, i) => {
                    const steps = ['product','process','prp','hazards','ccp_determination','ccp_management','review_validation'];
                    const currentIdx = steps.indexOf(currentSection);
                    const done = i < currentIdx || currentSection === 'generating' || currentSection === 'validating' || currentSection === 'complete';
                    const active = step === currentSection;
                    return (
                      <div key={step} className="flex flex-col items-center" style={{ width: `${100/7}%` }}>
                        <div className={`w-2 h-2 rounded-full ${active ? 'bg-blue-600 ring-2 ring-blue-200' : done ? 'bg-blue-400' : 'bg-slate-200'}`} />
                        <span className={`text-[9px] mt-0.5 leading-tight text-center ${active ? 'text-blue-700 font-bold' : done ? 'text-slate-400' : 'text-slate-300'}`}>
                          {['Product','Process','PRP','Hazards','CCP ID','CCP Mgmt','Review'][i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
            </div>
        </div>

        {isResumed && currentSection !== 'complete' && !showScopeConfirmation && !showHighRiskModal && (
            <div className="bg-blue-600 text-white py-2 px-6 text-center text-xs font-black uppercase tracking-widest animate-in slide-in-from-top duration-500">
                You are continuing a previous draft.
            </div>
        )}

        <div className="pt-10 px-6">
            {renderContent()}
        </div>
        
    </div>
  );
}

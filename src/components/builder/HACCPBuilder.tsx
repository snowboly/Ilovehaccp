"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus,
  Trash2,
  ShieldCheck, 
  Loader2,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Globe,
  Gavel,
  Users,
  BarChart3,
  MapPin,
  Award,
  UtensilsCrossed,
  Thermometer,
  Snowflake,
  Calendar,
  Baby,
  Package,
  List,
  AlertOctagon,
  ShieldAlert,
  Tag,
  Truck,
  Workflow,
  UserCheck,
  FileCheck,
  XCircle,
  ClipboardCheck,
  Warehouse,
  RefreshCcw,
  Layers,
  Hand,
  Clock,
  FlaskConical,
  Scissors,
  Flame,
  Wind,
  RotateCcw,
  Timer,
  Wrench,
  Settings,
  Filter,
  Brush,
  GraduationCap,
  BookOpen,
  Search,
  History,
  FileDigit,
  Siren,
  Bug,
  Briefcase,
  Sparkles,
  Info
} from 'lucide-react';

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';
import { PDFDownloadLink } from '@react-pdf/renderer';
import HACCPDocument from '../pdf/HACCPDocument';
import { useLanguage } from '@/lib/i18n';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type Step = 'intro' | 'questions' | 'generating' | 'result';

interface HazardAnalysisItem {
  step_id: string;
  step_name: string;
  hazards: string;
  control_measure: string;
  is_ccp: boolean;
  critical_limit: string;
}

interface FullHACCPPlan {
  executive_summary: string;
  prerequisite_programs: { program: string; details: string }[];
  process_flow_narrative: string;
  hazard_analysis: HazardAnalysisItem[];
  ccp_summary: {
    ccp_step: string;
    hazard: string;
    critical_limit: string;
    monitoring: string;
    corrective_action: string;
  }[];
}

const STORAGE_KEY = 'haccp_builder_state_v1';

export default function HACCPBuilder() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<Step>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [generatedAnalysis, setGeneratedAnalysis] = useState<HazardAnalysisItem[]>([]);
  const [fullPlan, setFullPlan] = useState<FullHACCPPlan | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [isClient, setIsClient] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCheckout = async (tier: 'starter' | 'pro') => {
    setIsPaying(true);
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tier, 
          planId, 
          businessName: formData.businessLegalName 
        }),
      });
      const session = await response.json();
      if (session.url) {
          window.location.href = session.url;
      } else {
          throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };
  
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [formData, setFormData] = useState({
    businessLegalName: '',
    tradingName: '',
    country: '',
    regulation: 'Codex Alimentarius',
    otherRegulation: '',
    businessType: 'Restaurant',
    employeeCount: '',
    productionScale: 'Small (<100 meals/day)',
    haccpScope: 'Single site',
    certifications: [] as string[],
    foodCategories: [] as string[],
    productStates: [] as string[],
    productCharacteristics: [] as string[],
    shelfLife: 'Short',
    isVulnerable: 'No',
    packagingTypes: [] as string[],
    mainIngredients: [] as string[],
    allergens: [] as string[],
    allergensHandled: 'No',
    allergenSegregation: 'No',
    allergenLabeling: 'No',
    processSteps: [] as string[],
    customSteps: '',
    outsourcedSteps: 'No',
    suppliersApproved: 'No',
    verificationChecks: [] as string[],
    tempControlledDelivery: 'No',
    rejectNonConforming: 'No',
    storageTypes: [] as string[],
    storageTemps: '',
    fifoApplied: 'No',
    rawRteSegregated: 'No',
    storageAllergenSegregation: 'No',
    separateHandling: 'No',
    separateUtensils: 'No',
    handwashingEnforced: 'No',
    prepTimeLimits: 'No',
    chemicalsInPrep: 'No',
    doYouCook: 'No',
    cookingMethods: [] as string[],
    minCookingTemp: '',
    tempRecorded: 'No',
    cookingIsCcp: 'No',
    isFoodCooled: 'No',
    coolingMethods: [] as string[],
    coolingTimeLimit: '',
    coolingTempTarget: '',
    isReheatingPerformed: 'No',
    reheatingTempTarget: '',
    reheatingLimitedOnce: 'No',
    hotHoldingTemp: '',
    coldHoldingTemp: '',
    maxHoldingTime: '',
    isTransported: 'No',
    transportTempMethod: '',
    transportTempMonitored: 'No',
    keyEquipment: [] as string[],
    devicesCalibrated: 'No',
    calibrationFrequency: '',
    preventiveMaintenance: 'No',
    foreignBodyControls: [] as string[],
    cleaningSchedulesDocumented: 'No',
    cleaningFrequency: '',
    cleaningChemicals: [] as string[],
    chemicalsStoredSeparately: 'No',
    cleaningVerified: 'No',
    trainingReceived: 'No',
    trainingFrequency: '',
    hygieneRulesDocumented: 'No',
    healthDeclarations: 'No',
    ppeUsed: [] as string[],
    ccpsMonitored: 'No',
    monitoringFrequency: '',
    recordsKept: 'No',
    retentionPeriod: '',
    recordType: 'Paper',
    correctiveActionsDefined: 'No',
    correctiveActionExamples: [] as string[],
    productIsolation: 'No',
    rootCauseAnalysis: 'No',
    internalAudits: 'No',
    auditFrequency: '',
    externalAudits: 'No',
    annualReview: 'No',
    reviewTriggers: [] as string[],
    pestControlContract: 'No',
    pestMonitoringDevices: [] as string[],
    pestSightingReporting: 'No',
    wantProfessionalReview: 'No',
    reviewTurnaround: 'Standard (7 days)',
    regionComplianceCheck: 'No',
    auditReadyDocs: 'No',
    certificationSupport: 'No',
    productName: '',
    productDescription: '',
    intendedUse: '',
    storageType: 'Refrigerated',
  });

  const [currentIngredient, setCurrentIngredient] = useState('');

  // --- PERSISTENCY ---
  useEffect(() => {
    setIsClient(true);
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            setFormData(prev => ({ ...prev, ...parsed }));
        } catch (e) {
            console.error("Failed to load saved state", e);
        }
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUserId(session.user.id);
    };
    checkUser();
  }, []);

  useEffect(() => {
      if (isClient) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      }
  }, [formData, isClient]);

  // --- QUESTIONS ---
  const questions = [
    {
      id: 'businessLegalName',
      section: 'Business Context',
      question: "What is your business legal name?",
      description: "This will appear on the cover of your official HACCP document.",
      type: 'text',
      icon: <Building2 className="w-6 h-6 text-blue-500" />,
      placeholder: "e.g., Global Food Solutions Ltd.",
      required: true
    },
    {
      id: 'tradingName',
      section: 'Business Context',
      question: "Trading name (if different)",
      description: "Your brand name or the name on your storefront.",
      type: 'text',
      icon: <Building2 className="w-6 h-6 text-blue-400" />,
      placeholder: "e.g., The Healthy Grill"
    },
    {
      id: 'businessType',
      section: 'Business Context',
      question: "Type of business",
      description: "This helps the AI select the correct hazard database.",
      type: 'radio',
      icon: <Building2 className="w-6 h-6 text-purple-500" />,
      options: ['Restaurant', 'Catering', 'Manufacturer', 'Processor', 'Distributor', 'Retail'],
      required: true
    },
    {
      id: 'mainIngredients',
      section: 'Ingredients',
      question: "List your main ingredients",
      description: "Crucial for identifying biological hazards like Salmonella or E. coli.",
      type: 'list',
      icon: <List className="w-6 h-6 text-emerald-600" />,
      placeholder: "e.g., Raw Beef, Eggs, Flour...",
      required: true
    },
    {
      id: 'processSteps',
      section: 'Process Flow',
      question: "Select applicable process steps",
      description: "This builds your process flow diagram. Be comprehensive.",
      type: 'checkbox',
      icon: <Workflow className="w-6 h-6 text-blue-600" />,
      options: [
        'Receiving', 'Storage (ambient)', 'Storage (chilled)', 'Storage (frozen)',
        'Thawing', 'Washing', 'Cutting', 'Mixing',
        'Cooking', 'Cooling', 'Reheating', 'Holding', 'Packaging', 'Dispatch'
      ],
      required: true
    },
    {
      id: 'doYouCook',
      section: 'Critical Steps',
      question: "Do you cook food on site?",
      description: "Cooking is often a Critical Control Point (CCP).",
      type: 'radio',
      icon: <Flame className="w-6 h-6 text-orange-600" />,
      options: ['Yes', 'No'],
      required: true
    },
    {
      id: 'minCookingTemp',
      section: 'Critical Steps',
      question: "Minimum internal cooking temperature?",
      description: "Specificy the critical limit (e.g., 75°C).",
      type: 'text',
      icon: <Thermometer className="w-6 h-6 text-red-600" />,
      placeholder: "e.g., 75°C (167°F) for 30 seconds"
    },
    {
      id: 'isFoodCooled',
      section: 'Critical Steps',
      question: "Is food cooled after cooking?",
      description: "Cooling is a high-risk step for spore-forming bacteria.",
      type: 'radio',
      icon: <Wind className="w-6 h-6 text-blue-400" />,
      options: ['Yes', 'No']
    },
    {
      id: 'coolingTimeLimit',
      section: 'Critical Steps',
      question: "Cooling time limits?",
      description: "Standard: 60°C to 10°C in under 2 hours.",
      type: 'text',
      icon: <Clock className="w-6 h-6 text-slate-500" />,
      placeholder: "e.g., 2 hours max"
    },
    {
      id: 'ccpsMonitored',
      section: 'Monitoring',
      question: "Are Critical Control Points (CCPs) monitored?",
      description: "Without monitoring, a CCP is not valid.",
      type: 'radio',
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      options: ['Yes', 'No'],
      required: true
    }
  ];

  const handleNext = () => {
    // Validation
    const currentQ = questions[currentQuestionIdx];
    if (currentQ.required) {
        const val = (formData as any)[currentQ.id];
        if (!val || (Array.isArray(val) && val.length === 0)) {
            alert("This field is required to generate a valid plan.");
            return;
        }
    }

    if (currentQuestionIdx < questions.length - 1) {
      // Skip logic
      if (currentQ.id === 'doYouCook' && formData.doYouCook === 'No') {
        const nextIdx = questions.findIndex(q => q.id === 'isFoodCooled');
        setCurrentQuestionIdx(nextIdx);
        return;
      }
      if (currentQ.id === 'isFoodCooled' && formData.isFoodCooled === 'No') {
        const nextIdx = questions.findIndex(q => q.id === 'ccpsMonitored');
        setCurrentQuestionIdx(nextIdx);
        return;
      }
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    } else {
      setStep('intro');
    }
  };

  const updateFormData = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleGenerate = async () => {
    setStep('generating');
    
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          language,
          processSteps: formData.processSteps.map((name, i) => ({ id: String(i+1), name }))
        })
      });
      
      if (!response.ok) throw new Error('Generation failed');
      
      const aiData = await response.json();
      setGeneratedAnalysis(aiData.analysis);
      setFullPlan(aiData.full_plan);

      // Save to Supabase (Always, to get an ID for payment)
      const { data: savedPlan, error: saveError } = await supabase.from('plans').insert({
          business_name: formData.businessLegalName,
          business_type: formData.businessType,
          product_name: "HACCP Plan",
          product_description: `Generated for ${formData.businessLegalName}`,
          process_steps: formData.processSteps.map((name, i) => ({ id: String(i+1), name })),
          hazard_analysis: aiData.analysis,
          full_plan: aiData.full_plan,
          user_id: userId,
          payment_status: 'pending'
      }).select().single();

      if (saveError) console.error("Supabase Save Error:", saveError);
      if (savedPlan) setPlanId(savedPlan.id);
      
      // Clear storage on success
      localStorage.removeItem(STORAGE_KEY);
      setStep('result');
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to generate your plan. Please try again.');
      setStep('questions');
    }
  };

  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4 font-sans">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center space-y-8 border border-slate-100"
          >
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShieldCheck className="w-12 h-12 text-blue-600" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {t('wizard.title')}
              </h1>
              <p className="text-xl text-slate-500 max-w-lg mx-auto leading-relaxed">
                {t('wizard.subtitle')}
              </p>
            </div>
            <div className="flex flex-col gap-4">
                <button 
                onClick={() => setStep('questions')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl text-xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 group transform hover:scale-[1.02]"
                >
                {t('wizard.start')}
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex justify-center gap-6 text-sm text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> 5 Min</span>
                    <span className="flex items-center gap-1"><FileText className="w-4 h-4"/> PDF Export</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Secure</span>
                </div>
            </div>
          </motion.div>
        )}

        {step === 'questions' && (
          <motion.div 
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl w-full space-y-6"
          >
            {/* Progress Header */}
            <div className="flex justify-between items-center px-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Step {currentQuestionIdx + 1} of {questions.length}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">{currentQ.section}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                />
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 relative overflow-hidden">
              {/* Tooltip Toggle */}
              <button 
                onClick={() => setShowTooltip(!showTooltip)}
                className="absolute top-8 right-8 text-slate-300 hover:text-blue-500 transition-colors"
              >
                <Info className="w-6 h-6" />
              </button>

              {showTooltip && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800"
                  >
                      <strong>Expert Tip:</strong> {currentQ.description || "Be as specific as possible to get the best AI analysis."}
                  </motion.div>
              )}

              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                    {currentQ.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 leading-tight">{currentQ.question}</h2>
                </div>

                <div className="pt-2">
                  {currentQ.type === 'text' || currentQ.type === 'number' ? (
                    <input 
                      autoFocus
                      type={currentQ.type}
                      value={(formData as any)[currentQ.id]}
                      onChange={(e) => updateFormData(currentQ.id, e.target.value)}
                      placeholder={currentQ.placeholder}
                      className="w-full text-2xl py-4 border-b-2 border-slate-200 focus:border-blue-600 outline-none transition-colors placeholder:text-slate-300 bg-transparent font-medium text-slate-800"
                      onKeyDown={(e) => e.key === 'Enter' && (formData as any)[currentQ.id] && handleNext()}
                    />
                  ) : currentQ.type === 'radio' ? (
                    <div className="grid gap-3">
                      {currentQ.options?.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            updateFormData(currentQ.id, opt);
                            setTimeout(handleNext, 250);
                          }}
                          className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                            (formData as any)[currentQ.id] === opt 
                              ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-md ring-1 ring-blue-600/20' 
                              : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <span className="font-semibold text-lg">{opt}</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            (formData as any)[currentQ.id] === opt ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-blue-400'
                          }`}>
                            {(formData as any)[currentQ.id] === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : currentQ.type === 'checkbox' ? (
                    <div className="grid gap-3">
                      {currentQ.options?.map((opt) => {
                        const currentValues = (formData as any)[currentQ.id] || [];
                        const isSelected = currentValues.includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => {
                              const next = isSelected 
                                ? currentValues.filter((c: string) => c !== opt)
                                : [...currentValues, opt];
                              updateFormData(currentQ.id, next);
                            }}
                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-md ring-1 ring-blue-600/20' 
                                : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <span className="font-semibold text-lg">{opt}</span>
                            <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-colors ${
                              isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-400'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : currentQ.type === 'list' ? (
                    <div className="space-y-6">
                        <div className="flex gap-3">
                            <input 
                                type="text"
                                value={currentIngredient}
                                onChange={(e) => setCurrentIngredient(e.target.value)}
                                onKeyDown={(e) => {
                                if (e.key === 'Enter' && currentIngredient.trim()) {
                                    const list = (formData as any)[currentQ.id] || [];
                                    updateFormData(currentQ.id, [...list, currentIngredient.trim()]);
                                    setCurrentIngredient('');
                                }
                                }}
                                placeholder={currentQ.placeholder}
                                className="flex-1 text-lg py-4 px-6 bg-slate-50 rounded-xl border-2 border-slate-100 focus:border-blue-600 outline-none transition-colors"
                            />
                            <button 
                                onClick={() => {
                                if (currentIngredient.trim()) {
                                    const list = (formData as any)[currentQ.id] || [];
                                    updateFormData(currentQ.id, [...list, currentIngredient.trim()]);
                                    setCurrentIngredient('');
                                }
                                }}
                                className="bg-slate-900 text-white rounded-xl px-6 font-bold hover:bg-black transition-colors"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[100px] content-start">
                            {((formData as any)[currentQ.id] || []).length === 0 && (
                                <span className="text-slate-400 text-sm italic w-full text-center py-8">Added items will appear here...</span>
                            )}
                            {((formData as any)[currentQ.id] || []).map((item: string, idx: number) => (
                                <motion.div 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    key={idx} 
                                    className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm border border-blue-100"
                                >
                                {item}
                                <button 
                                    onClick={() => {
                                    const list = (formData as any)[currentQ.id].filter((_: string, i: number) => i !== idx);
                                    updateFormData(currentQ.id, list);
                                    }}
                                    className="text-blue-400 hover:text-blue-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 mt-4 border-t border-slate-100">
                <button 
                  onClick={handleBack}
                  className="text-slate-400 hover:text-slate-600 font-bold flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-slate-50"
                >
                  <ChevronLeft className="w-5 h-5" /> {t('wizard.back')}
                </button>
                <button 
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                >
                  {currentQuestionIdx === questions.length - 1 ? 'Generate Plan' : t('wizard.next')}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'generating' && (
          <motion.div 
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-8 text-center"
          >
            <div className="relative">
              <div className="w-32 h-32 border-8 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2">
                <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900">{t('wizard.generating')}</h2>
              <p className="text-slate-500 font-medium max-w-sm">{t('wizard.generatingDesc')}</p>
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl w-full pb-20 space-y-8"
          >
            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
               {/* Success Header */}
               <div className={`p-10 text-white transition-colors duration-500 ${paymentStatus === 'paid' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-slate-900'}`}>
                   <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                    {paymentStatus === 'paid' ? <CheckCircle2 className="w-8 h-8 text-white" /> : <ShieldCheck className="w-8 h-8 text-white" />}
                                </div>
                                <h1 className="text-3xl font-black">
                                    {paymentStatus === 'paid' ? t('wizard.success') : 'Draft Plan Generated'}
                                </h1>
                            </div>
                            <p className="text-blue-50/80 font-medium text-lg">
                                {paymentStatus === 'paid' 
                                    ? 'Your professional HACCP plan is ready for download.' 
                                    : 'Your initial hazard analysis is complete. Upgrade to unlock the full document.'}
                            </p>
                        </div>
                        
                        {paymentStatus === 'paid' ? (
                            isClient && (
                                <PDFDownloadLink
                                    document={
                                    <HACCPDocument 
                                        data={{
                                        businessName: formData.businessLegalName || "My Business",
                                        productName: "Food Safety Plan",
                                        productDescription: `HACCP Plan for ${formData.businessType}`,
                                        intendedUse: formData.isVulnerable === 'Yes' ? 'Vulnerable Populations' : 'General Consumption',
                                        storageType: formData.productCharacteristics.join(', '),
                                        analysis: generatedAnalysis,
                                        fullPlan: fullPlan
                                        }} 
                                    />
                                    }
                                    fileName={`${(formData.businessLegalName || "HACCP_Plan").replace(/\s+/g, '_')}.pdf`}
                                    className="bg-white text-green-700 px-8 py-4 rounded-xl font-bold hover:bg-green-50 transition-all shadow-xl flex items-center gap-3"
                                >
                                    {({ loading }) => (
                                    <>
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                                        {loading ? 'Preparing...' : t('wizard.download')}
                                    </>
                                    )}
                                </PDFDownloadLink>
                            )
                        ) : (
                            <div className="bg-blue-600/20 px-4 py-2 rounded-lg border border-blue-400/30 backdrop-blur-sm text-sm font-bold text-blue-200">
                                <ShieldCheck className="inline w-4 h-4 mr-2 mb-0.5" /> DRAFT MODE
                            </div>
                        )}
                   </div>
               </div>

               {/* Preview Content */}
               <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                   <div className="lg:col-span-2 space-y-6">
                       <div className="flex items-center justify-between mb-6">
                           <h3 className="text-xl font-bold text-slate-900">Hazard Analysis Preview</h3>
                           <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                               {generatedAnalysis.length} Process Steps
                           </span>
                       </div>
                       
                       <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative group">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Step</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Critical?</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Control</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y divide-slate-100 ${paymentStatus === 'pending' ? 'select-none blur-[2px]' : ''}`}>
                                    {generatedAnalysis.slice(0, paymentStatus === 'paid' ? 99 : 5).map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-800">{item.step_name}</td>
                                        <td className="p-4 text-center">
                                        {item.is_ccp ? (
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black shadow-sm">CCP</span>
                                        ) : (
                                            <span className="text-slate-300 font-bold text-xs">-</span>
                                        )}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">{item.control_measure}</td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                            {paymentStatus === 'pending' && (
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                                    <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-blue-400" /> Upgrade to see full analysis
                                    </div>
                                </div>
                            )}
                       </div>
                   </div>

                   {/* Right: Pricing Paywall */}
                   {paymentStatus === 'pending' && (
                       <div className="space-y-6">
                           <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                               <Sparkles className="w-5 h-5 text-amber-500" />
                               Unlock Full Plan
                           </h3>
                           
                           {/* Starter Card */}
                           <div className="p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-sm hover:border-blue-200 transition-all group">
                               <div className="flex justify-between items-start mb-4">
                                   <div>
                                       <h4 className="text-lg font-black text-slate-900 leading-none">Starter</h4>
                                       <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Self-Service</p>
                                   </div>
                                   <div className="text-2xl font-black text-slate-900 tracking-tight">€29</div>
                               </div>
                               <ul className="space-y-3 mb-6">
                                   <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                       <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Instant PDF Download
                                   </li>
                                   <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                       <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Full Hazard Analysis
                                   </li>
                                   <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                       <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> PRPs & Control Chart
                                   </li>
                               </ul>
                               <button 
                                   onClick={() => handleCheckout('starter')}
                                   disabled={isPaying}
                                   className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                               >
                                   {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Select Starter'}
                               </button>
                           </div>

                           {/* Pro Card */}
                           <div className="p-6 bg-blue-600 rounded-3xl border-2 border-blue-500 shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all relative overflow-hidden text-white">
                               <div className="absolute top-0 right-0 p-2 bg-amber-400 text-[10px] font-black uppercase text-slate-900 rounded-bl-xl tracking-widest shadow-lg">Popular</div>
                               <div className="flex justify-between items-start mb-4">
                                   <div>
                                       <h4 className="text-lg font-black leading-none">Expert Pro</h4>
                                       <p className="text-xs text-blue-100 mt-1 uppercase tracking-widest font-bold">Review Included</p>
                                   </div>
                                   <div className="text-2xl font-black tracking-tight">€79</div>
                               </div>
                               <ul className="space-y-3 mb-6">
                                   <li className="flex items-center gap-2 text-sm text-blue-50 font-medium">
                                       <CheckCircle2 className="w-4 h-4 text-blue-200 flex-shrink-0" /> Everything in Starter
                                   </li>
                                   <li className="flex items-center gap-2 text-sm text-blue-50 font-medium font-bold">
                                       <CheckCircle2 className="w-4 h-4 text-amber-300 flex-shrink-0" /> 1-on-1 Expert Review
                                   </li>
                                   <li className="flex items-center gap-2 text-sm text-blue-50 font-medium">
                                       <CheckCircle2 className="w-4 h-4 text-blue-200 flex-shrink-0" /> Compliance Assurance
                                   </li>
                               </ul>
                               <button 
                                   onClick={() => handleCheckout('pro')}
                                   disabled={isPaying}
                                   className="w-full py-3 bg-white text-blue-600 rounded-xl font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                               >
                                   {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get Expert Plan'}
                               </button>
                           </div>
                       </div>
                   )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
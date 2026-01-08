/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  Info,
  ArrowDown,
  Mail,
  Send,
  Image as ImageIcon,
  LayoutTemplate,
  Edit
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import HACCPDocument from '../pdf/HACCPDocument';
import { useLanguage, getDictionary } from '@/lib/i18n';

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
  benchmarking?: {
    score: number;
    industry_avg: number;
    analysis_summary: string;
    recommendations: { title: string; impact: string; desc: string }[];
  };
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

const PREDEFINED_INGREDIENTS: any = {
  'Restaurant': ['Raw Meat', 'Poultry', 'Fish', 'Eggs', 'Dairy', 'Fresh Produce', 'Dry Goods', 'Frozen Goods', 'Oils & Fats'],
  'Bakery': ['Flour', 'Sugar', 'Eggs', 'Yeast', 'Butter', 'Milk', 'Nuts', 'Chocolate', 'Fruit Fillings', 'Spices'],
  'Butcher Shop': ['Raw Beef', 'Raw Pork', 'Raw Lamb', 'Raw Poultry', 'Sausage Casings', 'Marinades', 'Spices', 'Salt'],
  'Cafe / Coffee Shop': ['Coffee Beans', 'Milk', 'Syrups', 'Pastries', 'Sandwich Fillings', 'Salad Greens', 'Tea', 'Sugar'],
  'Food Manufacturer': ['Bulk Raw Materials', 'Additives', 'Preservatives', 'Water', 'Packaging Material', 'Processing Aids'],
  'Catering Service': ['Pre-cooked Meals', 'Fresh Salads', 'Buffet Items', 'Sauces', 'Desserts'],
  'default': ['Raw Meat', 'Fresh Produce', 'Dairy', 'Eggs', 'Dry Goods']
};

const PREDEFINED_EQUIPMENT: any = {
  'Restaurant': ['Rational Oven', 'Stove', 'Grill', 'Deep Fryer', 'Walk-in Fridge', 'Freezer', 'Dishwasher', 'Sous-vide Circulator', 'Vacuum Packer'],
  'Bakery': ['Deck Oven', 'Proofer', 'Planetary Mixer', 'Dough Sheeter', 'Cooling Racks', 'Spiral Mixer', 'Bread Slicer', 'Walk-in Fridge'],
  'Butcher Shop': ['Industrial Mincer', 'Sausage Filler', 'Slicer', 'Cold Room', 'Vacuum Packer', 'Bone Saw', 'Knife Sterilizer', 'Scales'],
  'Cafe / Coffee Shop': ['Espresso Machine', 'Milk Steamer', 'Panini Press', 'Display Fridge', 'Dishwasher', 'Bean Grinder', 'Ice Machine'],
  'Food Manufacturer': ['Conveyor System', 'Industrial Mixer', 'Metal Detector', 'Filling Machine', 'Pasteurizer', 'Pallet Jack', 'Lab Testing Kit'],
  'Catering Service': ['Portable Burners', 'Insulated Hot Boxes', 'Mobile Refrigeration', 'Hand Wash Station', 'Blast Chiller'],
  'default': ['Oven', 'Fridge', 'Freezer', 'Prep Tables', 'Sink']
};

const AI_LOG_MESSAGES = [
  "Initializing Hazard Analysis System...",
  "Cross-referencing Global Food Safety Databases...",
  "Analyzing Biological Pathogens (Salmonella, Listeria)...",
  "Evaluating Chemical & Allergen Risks...",
  "Determining Critical Control Points (CCPs)...",
  "Calculating Scientific Critical Limits...",
  "Drafting Standard Operating Procedures...",
  "Compiling Professional PDF Document..."
];

export default function HACCPBuilder() {
  const { t, language } = useLanguage();
  const dict = getDictionary(language).pdf;
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [generatedAnalysis, setGeneratedAnalysis] = useState<HazardAnalysisItem[]>([]);
  const [fullPlan, setFullPlan] = useState<FullHACCPPlan | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [history, setHistory] = useState<number[]>([]);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const topRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    businessLegalName: '',
    tradingName: '',
    country: '',
    regulation: 'Codex Alimentarius',
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
    keyEquipment: [] as string[],
    suppliersApproved: 'No',
    verificationChecks: [] as string[],
    tempControlledDelivery: 'No',
    storageTypes: [] as string[],
    handwashingEnforced: 'No',
    doYouCook: 'No',
    cookingMethods: [] as string[],
    minCookingTemp: '',
    cookingIsCcp: 'No',
    isFoodCooled: 'No',
    isReheatingPerformed: 'No',
    cleaningFrequency: '',
    trainingReceived: 'No',
    pestControlContract: 'No',
    infrastructureMaintenance: 'Yes',
    preventativeMaintenance: 'Yes',
    equipmentCalibration: 'Yes, scheduled', // New field
    ccpsMonitored: 'No',
    logo: null as string | null,
    template: 'Minimal',
  });

  // Helper to determine temperature unit
  const tempUnit = formData.country.toLowerCase().includes('usa') || formData.country.toLowerCase().includes('united states') ? '°F' : '°C';

  useEffect(() => {
    // Scroll to top of the wizard container whenever step or question changes
    if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step, currentQuestionIdx]);

  useEffect(() => {
    setIsClient(true);
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUserId(session.user.id);
    };
    checkUser();

    // Check URL for existing plan
    const loadId = searchParams.get('id');
    if (loadId) {
        setStep('generating');
        setLoadingMessage('Retrieving secured plan...');
        fetch(`/api/plans/${loadId}`)
            .then(res => res.json())
            .then(data => {
                if(data.error) throw new Error(data.error);
                if(data.plan) {
                    setFullPlan(data.plan.full_plan);
                    setGeneratedAnalysis(data.plan.hazard_analysis || []);
                    
                    // Restore original inputs if available
                    if (data.plan.full_plan?._original_inputs) {
                        setFormData(data.plan.full_plan._original_inputs);
                    } else {
                        // Fallback for old plans
                        setFormData(prev => ({
                            ...prev,
                            businessLegalName: data.plan.business_name || '',
                            businessType: data.plan.business_type || 'Restaurant'
                        }));
                    }
                    
                    setPlanId(data.plan.id);
                    setStep('result');
                }
            })
            .catch(err => {
                console.error("Failed to load plan:", err);
                setStep('intro'); // Fallback to start
                alert("Could not load the requested plan. It may have been deleted.");
            });
        return; // Skip checking local storage if loading from URL
    }

    // Check for saved progress
    const saved = localStorage.getItem('haccp_builder_progress');
    if (saved) setHasSavedProgress(true);
  }, [searchParams]);

  // Auto-save progress
  useEffect(() => {
    if (step === 'questions' && isClient) {
        const progress = {
            formData,
            currentQuestionIdx,
            history
        };
        localStorage.setItem('haccp_builder_progress', JSON.stringify(progress));
    }
  }, [formData, currentQuestionIdx, history, step, isClient]);

  const handleResume = () => {
    const saved = localStorage.getItem('haccp_builder_progress');
    if (saved) {
        const { formData: savedData, currentQuestionIdx: savedIdx, history: savedHistory } = JSON.parse(saved);
        setFormData(savedData);
        setCurrentQuestionIdx(savedIdx);
        setHistory(savedHistory);
        setStep('questions');
    }
  };

  const handleClearProgress = () => {
    localStorage.removeItem('haccp_builder_progress');
    setHasSavedProgress(false);
  };

  const questions = [
    // 1. Identity
    { id: 'businessLegalName', section: 'Identity', question: "What is your business legal name?", type: 'text', icon: <Building2 />, required: true },
    { id: 'country', section: 'Region', question: "In which country do you operate?", type: 'text', icon: <Globe />, required: true },
    { id: 'businessType', section: 'Sector', question: "Select your business type", type: 'radio', options: ['Restaurant', 'Bakery', 'Butcher Shop', 'Cafe / Coffee Shop', 'Food Manufacturer', 'Catering Service', 'Food Truck / Mobile Unit', 'Hotel Kitchen', 'School / Canteen', 'Hospital Kitchen', 'Ghost Kitchen'], icon: <Briefcase />, required: true },
    
    // 2. Inventory
    { id: 'mainIngredients', section: 'Inventory', question: "List your main ingredients", type: 'list', icon: <List />, required: true },
    { id: 'foodCategories', section: 'Scope', question: "Food categories handled", type: 'checkbox', options: ['Raw Red Meat', 'Raw Poultry', 'Raw Fish & Seafood', 'Raw Shellfish', 'Dairy Products', 'Shell Eggs', 'Fresh Produce', 'Ready-to-Eat (RTE)', 'Baked Goods', 'Grains & Cereals', 'Frozen Goods', 'Canned / Dry Goods', 'Beverages'], icon: <UtensilsCrossed />, required: true },
    { id: 'allergens', section: 'Allergens', question: "Do you handle any of these allergens?", type: 'checkbox', options: ['Gluten', 'Crustaceans', 'Eggs', 'Fish', 'Peanuts', 'Soy', 'Milk', 'Nuts', 'Celery', 'Mustard', 'Sesame'], icon: <AlertOctagon />, required: true },
    
    // 3. Risk Level
    { id: 'isVulnerable', section: 'Risk', question: "Is your food intended for vulnerable groups?", description: "e.g., Children, elderly, hospitals.", type: 'radio', options: ['Yes', 'No'], icon: <Baby /> },
    { id: 'shelfLife', section: 'Risk', question: "Typical product shelf life?", type: 'radio', options: ['Short (< 3 days)', 'Medium (< 1 week)', 'Long (> 1 week)'], icon: <Calendar /> },
    
    // 4. Workflow
    { id: 'processSteps', section: 'Workflow', question: "Applicable process steps", type: 'checkbox', options: ['Receiving', 'Storage', 'Thawing', 'Prep', 'Cooking', 'Cooling', 'Reheating', 'Holding', 'Packaging'], icon: <Workflow />, required: true },
    { id: 'keyEquipment', section: 'Equipment', question: "Key equipment used", type: 'list', icon: <Wrench />, required: true },
    { id: 'suppliersApproved', section: 'Suppliers', question: "Are all suppliers approved & audited?", type: 'radio', options: ['Yes', 'No'], icon: <UserCheck /> },
    
    // 5. Processing
    { id: 'doYouCook', section: 'Processing', question: "Do you cook food on-site?", type: 'radio', options: ['Yes', 'No'], icon: <Flame />, required: true },
    { id: 'minCookingTemp', section: 'Processing', question: `Target internal cooking temperature (${tempUnit})?`, type: 'text', icon: <Thermometer />, placeholder: `e.g., ${tempUnit === '°C' ? '75°C' : '165°F'} for 30s` },
    { id: 'isFoodCooled', section: 'Processing', question: "Do you cool food after cooking?", type: 'radio', options: ['Yes', 'No'], icon: <Wind /> },
    { id: 'isReheatingPerformed', section: 'Processing', question: "Is reheating performed?", type: 'radio', options: ['Yes', 'No'], icon: <RotateCcw /> },
    
    // 6. Prerequisite Programs
    { id: 'cleaningFrequency', section: 'Hygiene', question: "Frequency of deep cleaning?", type: 'radio', options: ['Daily', 'Weekly', 'Shift-based'], icon: <Brush /> },
    { id: 'trainingReceived', section: 'Personnel', question: "Have all staff received food hygiene training?", type: 'radio', options: ['Yes', 'No'], icon: <GraduationCap /> },
    { id: 'pestControlContract', section: 'Safety', question: "Is a pest control contract in place?", type: 'radio', options: ['Yes', 'No'], icon: <Bug /> },
    
    // New PRPs
    { id: 'infrastructureMaintenance', section: 'Infrastructure', question: "Are premises maintained to prevent contamination (lighting, drainage, ventilation)?", type: 'radio', options: ['Yes', 'No'], icon: <Warehouse /> },
    { id: 'preventativeMaintenance', section: 'Maintenance', question: "Is there a preventative maintenance schedule for key equipment?", type: 'radio', options: ['Yes', 'No'], icon: <Wrench /> },
    
    // New Section or Step
    { id: 'equipmentCalibration', section: 'Maintenance', question: "Are critical thermometers and equipment calibrated regularly?", type: 'radio', options: ['Yes, scheduled', 'Occasionally', 'No'], icon: <Wrench />, required: true },
    
    // 7. Monitoring
    { id: 'ccpsMonitored', section: 'Compliance', question: "Will you monitor Critical Control Points?", type: 'radio', options: ['Yes', 'No'], icon: <ClipboardCheck />, required: true },

    // 8. Customization
    { id: 'logo', section: 'Branding', question: "Upload your business logo", type: 'file', icon: <ImageIcon />, description: "It will appear on the cover of your PDF (Optional)." },
    { id: 'template', section: 'Style', question: "Choose a document style", type: 'template_select', icon: <LayoutTemplate />, options: ['Minimal', 'Corporate', 'Modern'], required: true },
  ];

  const updateFormData = (id: string, value: any) => {
      setFormData(prev => ({ ...prev, [id]: value }));
      if (errors[id]) {
          const newErrors = { ...errors };
          delete newErrors[id];
          setErrors(newErrors);
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateFormData('logo', event.target?.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleNext = () => {
    const q = questions[currentQuestionIdx];
    const val = (formData as any)[q.id];
    
    // Validation
    if (q.required) {
        if (!val || (Array.isArray(val) && val.length === 0)) {
            setErrors({ [q.id]: "This field is required to ensure compliance." });
            return;
        }
    }
    
    // Clear errors if valid
    setErrors({});

    // Save current index to history before moving
    setHistory(prev => [...prev, currentQuestionIdx]);

    // Skip logic
    if (q.id === 'doYouCook' && formData.doYouCook === 'No') {
        const nextIdx = questions.findIndex(q => q.id === 'cleaningFrequency');
        setCurrentQuestionIdx(nextIdx);
        return;
    }

    if (currentQuestionIdx < questions.length - 1) setCurrentQuestionIdx(currentQuestionIdx + 1);
    else handleGenerate();
  };

  const handleBack = () => {
    if (history.length === 0) return; // Can't go back further
    
    const prevIdx = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1)); // Pop from stack
    setCurrentQuestionIdx(prevIdx);
  };

  const handleGenerate = async () => {
    setStep('generating');
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, language, processSteps: formData.processSteps.map((n, i) => ({ id: String(i+1), name: n })) })
      });
      const data = await response.json();
      if (!data.analysis) throw new Error("Invalid response");
      setGeneratedAnalysis(data.analysis);
      setFullPlan(data.full_plan);
      
      let savedId = planId;
      
      if (planId) {
          // Update existing plan
          const { error } = await supabase.from('plans').update({ 
              business_name: formData.businessLegalName, 
              business_type: formData.businessType,
              hazard_analysis: data.analysis, 
              full_plan: data.full_plan,
              // user_id is NOT updated to prevent ownership theft or loss
          }).eq('id', planId);
          
          if (error) throw error;
      } else {
          // Insert new plan
          const { data: saved, error } = await supabase.from('plans').insert({ 
              business_name: formData.businessLegalName, 
              business_type: formData.businessType,
              hazard_analysis: data.analysis, 
              full_plan: data.full_plan, 
              user_id: userId 
          }).select().single();
          
          if (error) throw error;
          if (saved) {
              savedId = saved.id;
              setPlanId(saved.id);
          }
      }
      
      // Clear progress after success
      localStorage.removeItem('haccp_builder_progress');
      setHasSavedProgress(false);

      setStep('result');
    } catch (e) { console.error(e); alert("Generation failed. Please check your inputs."); setStep('questions'); }
  };

  const handleCheckout = async (tier: string) => {
    setIsPaying(true);
    const { data: { session: authSession } } = await supabase.auth.getSession();
    
    if (!authSession) {
        alert("Please log in to purchase.");
        setIsPaying(false);
        return;
    }

    // Open tab immediately to avoid popup blockers and show feedback
    const newWindow = window.open('', '_blank');
    if (newWindow) {
        newWindow.document.write('<div style="font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;">Loading secure checkout...</div>');
    }

    try {
        const res = await fetch('/api/create-checkout', { 
            method: 'POST', 
            headers: {
                'Content-Type':'application/json',
                'Authorization': `Bearer ${authSession.access_token}`
            }, 
            body: JSON.stringify({ tier, planId, businessName: formData.businessLegalName }) 
        });
        
        const session = await res.json();
        
        if (session.url && newWindow) {
            newWindow.location.href = session.url;
        } else {
            newWindow?.close();
            if (session.error) alert(session.error);
        }
    } catch (err) {
        newWindow?.close();
        console.error(err);
        alert("Checkout failed to initialize.");
    } finally {
        setIsPaying(false);
    }
  };

  const currentQ = questions[currentQuestionIdx];

  return (
    <div ref={topRef} className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900 scroll-mt-24">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center space-y-8 border border-slate-100">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-10 h-10 text-blue-600" />
            </div>
            <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight">{t('wizard.title')}</h1>
                <p className="text-lg text-slate-500 font-medium">{t('wizard.subtitle')}</p>
                <div className="bg-emerald-50 text-emerald-800 text-sm font-bold py-2 px-4 rounded-full inline-flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {t('wizard.reassurance' as any)}
                </div>
            </div>
            
            <div className="space-y-4">
                <button onClick={() => setStep('questions')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3">
                    {t('wizard.start')} <ChevronRight className="w-6 h-6" />
                </button>

                {hasSavedProgress && (
                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={handleResume} 
                            className="w-full bg-emerald-50 text-emerald-700 py-4 rounded-2xl font-bold text-lg border-2 border-emerald-100 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                        >
                            <History className="w-5 h-5" /> Resume Last Session
                        </button>
                        <button 
                            onClick={handleClearProgress}
                            className="text-xs text-slate-400 hover:text-red-500 font-bold uppercase tracking-widest transition-colors"
                        >
                            Clear saved progress
                        </button>
                    </div>
                )}
            </div>
          </motion.div>
        )}

        {step === 'questions' && (
          <motion.div key="questions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl w-full space-y-6">
            <div className="flex justify-between items-center px-4">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Step {currentQuestionIdx + 1} / {questions.length}</span>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">{currentQ.section}</span>
            </div>
            <div className="bg-white rounded-[2rem] shadow-2xl p-10 relative border border-slate-100">
              <div className="flex items-center gap-5 mb-10">
                <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 shadow-sm">{currentQ.icon}</div>
                <h2 className="text-3xl font-bold leading-tight">{currentQ.question}</h2>
              </div>

              {currentQ.type === 'list' && (
                <div className="space-y-4 mb-8">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Quick Add Suggestions:</span>
                  <div className="flex flex-wrap gap-2">
                    {((currentQ.id === 'keyEquipment' ? PREDEFINED_EQUIPMENT : PREDEFINED_INGREDIENTS)[formData.businessType] || (currentQ.id === 'keyEquipment' ? PREDEFINED_EQUIPMENT : PREDEFINED_INGREDIENTS)['default']).map((item: string) => (
                        <button key={item} onClick={() => {
                            const cur = (formData as any)[currentQ.id] || [];
                            if(!cur.includes(item)) updateFormData(currentQ.id, [...cur, item]);
                        }} className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">+ {item}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="min-h-[200px]">
                {currentQ.type === 'radio' ? (
                    <div className="grid gap-3">
                    {currentQ.options?.map(opt => (
                        <button key={opt} onClick={() => updateFormData(currentQ.id, opt)} className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-bold text-lg flex justify-between items-center ${ (formData as any)[currentQ.id] === opt ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-md' : errors[currentQ.id] ? 'border-red-300 bg-red-50/50 text-red-800' : 'border-slate-100 hover:border-slate-200 text-slate-600' }`}>
                            {opt}
                            { (formData as any)[currentQ.id] === opt && <CheckCircle2 className="w-6 h-6 text-blue-600" /> }
                        </button>
                    ))}
                    {errors[currentQ.id] && <p className="text-red-500 text-sm font-bold mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {errors[currentQ.id]}</p>}
                    </div>
                ) : currentQ.type === 'checkbox' ? (
                    <div className="grid gap-3">
                    {currentQ.options?.map(opt => {
                        const isSelected = (formData as any)[currentQ.id].includes(opt);
                        return (
                            <button key={opt} onClick={() => {
                                const cur = (formData as any)[currentQ.id];
                                updateFormData(currentQ.id, isSelected ? cur.filter((x:string)=>x!==opt) : [...cur, opt]);
                            }} className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-bold text-lg flex justify-between items-center ${ isSelected ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-md' : errors[currentQ.id] ? 'border-red-300 bg-red-50/50 text-red-800' : 'border-slate-100 hover:border-slate-200 text-slate-600' }`}>
                                {opt}
                                { isSelected && <CheckCircle2 className="w-6 h-6 text-blue-600" /> }
                            </button>
                        );
                    })}
                    {errors[currentQ.id] && <p className="text-red-500 text-sm font-bold mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {errors[currentQ.id]}</p>}
                    </div>
                ) : currentQ.type === 'list' ? (
                    <div className="space-y-6">
                    <div className="flex gap-3">
                        <input type="text" value={currentIngredient} onChange={e => setCurrentIngredient(e.target.value)} onKeyDown={e => { if(e.key==='Enter' && currentIngredient) { updateFormData(currentQ.id, [...(formData as any)[currentQ.id], currentIngredient.trim()]); setCurrentIngredient(''); } }} className="flex-1 p-5 bg-slate-50 rounded-2xl outline-none border-2 border-slate-100 focus:border-blue-600 font-bold" placeholder="Type here..." />
                        <button onClick={() => { if(currentIngredient) { updateFormData(currentQ.id, [...(formData as any)[currentQ.id], currentIngredient.trim()]); setCurrentIngredient(''); } }} className="bg-slate-900 text-white px-8 rounded-2xl font-black hover:bg-black transition-all">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(formData as any)[currentQ.id].map((item:string, i:number) => (
                        <div key={i} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl flex items-center gap-3 font-black text-sm border border-blue-100 shadow-sm">
                            {item} <Trash2 className="w-4 h-4 cursor-pointer text-blue-300 hover:text-red-500 transition-colors" onClick={() => updateFormData(currentQ.id, (formData as any)[currentQ.id].filter((_:any,idx:number)=>idx!==i))} />
                        </div>
                        ))}
                    </div>
                    {errors[currentQ.id] && <p className="text-red-500 text-sm font-bold mt-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {errors[currentQ.id]}</p>}
                    </div>
                ) : currentQ.type === 'file' ? (
                    <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="hidden" 
                            id="logo-upload"
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center gap-4">
                            {formData.logo ? (
                                <img src={formData.logo} alt="Logo Preview" className="h-32 object-contain" />
                            ) : (
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <ImageIcon className="w-10 h-10" />
                                </div>
                            )}
                            <span className="font-bold text-slate-600 text-lg">
                                {formData.logo ? 'Change Logo' : 'Click to Upload Logo'}
                            </span>
                            <span className="text-sm text-slate-400">PNG, JPG up to 2MB</span>
                        </label>
                        {formData.logo && (
                            <button onClick={() => updateFormData('logo', null)} className="mt-6 text-red-500 font-bold text-sm flex items-center gap-2 hover:underline">
                                <Trash2 className="w-4 h-4" /> Remove Logo
                            </button>
                        )}
                    </div>
                ) : currentQ.type === 'template_select' ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {currentQ.options?.map(opt => (
                            <button 
                                key={opt} 
                                onClick={() => updateFormData('template', opt)}
                                className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${formData.template === opt ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-600/10' : 'border-slate-200 hover:border-blue-300'}`}
                            >
                                <div className={`h-32 w-full mb-4 rounded-xl border border-slate-200 shadow-sm ${opt === 'Minimal' ? 'bg-white' : opt === 'Corporate' ? 'bg-slate-900' : 'bg-blue-600'}`}>
                                    {/* Mock Preview */}
                                    <div className="p-3">
                                        <div className={`w-1/2 h-2 rounded-full mb-2 ${opt === 'Minimal' ? 'bg-slate-200' : 'bg-white/20'}`}></div>
                                        <div className={`w-3/4 h-2 rounded-full ${opt === 'Minimal' ? 'bg-slate-100' : 'bg-white/10'}`}></div>
                                    </div>
                                </div>
                                <h3 className="font-black text-lg text-slate-900">{opt}</h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    {opt === 'Minimal' ? 'Clean & Simple' : opt === 'Corporate' ? 'Professional & Bold' : 'Modern & Colorful'}
                                </p>
                                {formData.template === opt && (
                                    <div className="absolute top-4 right-4 bg-blue-600 text-white p-1 rounded-full">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="w-full">
                        <input type="text" autoFocus value={(formData as any)[currentQ.id]} onChange={e => updateFormData(currentQ.id, e.target.value)} onKeyDown={e => e.key === 'Enter' && handleNext()} className={`w-full text-3xl py-6 border-b-4 outline-none bg-transparent font-black placeholder:text-slate-200 transition-all ${errors[currentQ.id] ? 'border-red-400 placeholder:text-red-200' : 'border-slate-100 focus:border-blue-600'}`} placeholder="Enter detail..." />
                        {errors[currentQ.id] && <p className="text-red-500 text-sm font-bold mt-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {errors[currentQ.id]}</p>}
                    </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-12 pt-10 border-t border-slate-50">
                <button 
                    onClick={handleBack} 
                    disabled={history.length === 0}
                    className={`text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-sm transition-colors flex items-center gap-2 ${history.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
                    {currentQuestionIdx === questions.length - 1 ? 'Generate Plan' : 'Next'} <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'generating' && (
          <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md w-full text-center space-y-10">
            <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-blue-600 animate-pulse" />
                </div>
            </div>
            <div className="space-y-4">
                <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-slate-900">Intelligence Engine Active</h2>
                <div className="bg-slate-900 text-emerald-400 font-mono p-8 rounded-[2rem] text-left border border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
                    <div className="flex items-center gap-3 animate-pulse">
                        <span className="text-blue-500 font-bold">{">>>"}</span>
                        <span className="text-lg">{loadingMessage}</span>
                    </div>
                </div>
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl w-full pb-20 space-y-10">
            <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden border border-slate-100">
              {/* Header Dashboard */}
              <div className="p-12 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20">Audit Ready System</span>
                        <span className="text-slate-500 font-bold font-mono">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h1 className="text-5xl font-black tracking-tight">{formData.businessLegalName}</h1>
                        <button 
                            onClick={() => {
                                setStep('questions');
                                setCurrentQuestionIdx(0);
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 self-start md:self-auto"
                        >
                            <Edit className="w-5 h-5" /> Edit Inputs
                        </button>
                    </div>
                    <p className="text-slate-400 text-xl font-medium max-w-md leading-relaxed">HACCP Plan generated successfully based on {formData.businessType} sector standards.</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="bg-slate-900/80 p-6 rounded-[2rem] border border-slate-800 backdrop-blur-md text-center min-w-[140px] shadow-2xl">
                        <div className="text-5xl font-black text-emerald-400 mb-1">{fullPlan?.benchmarking?.score || 0}%</div>
                        <div className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Safety Score</div>
                    </div>
                    <div className="bg-slate-900/80 p-6 rounded-[2rem] border border-slate-800 backdrop-blur-md text-center min-w-[140px] shadow-2xl">
                        <div className="text-5xl font-black text-blue-500 mb-1">{generatedAnalysis.length}</div>
                        <div className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Steps Analyzed</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-12 grid lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8 space-y-16">
                  
                  {/* NEW: Benchmarking & Recommendations */}
                  {fullPlan?.benchmarking && (
                    <div className="bg-blue-50/50 rounded-[2.5rem] p-10 border-2 border-blue-100/50 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg"><BarChart3 className="w-8 h-8" /></div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Industry Benchmarking</h3>
                                <p className="text-slate-500 font-medium text-lg">Comparison against {formData.businessType} sector averages.</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Your Score</span>
                                    <span className="font-black text-blue-600 text-2xl">{fullPlan.benchmarking.score}%</span>
                                </div>
                                <div className="h-4 bg-white rounded-full overflow-hidden border border-blue-100">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${fullPlan.benchmarking.score}%` }}
                                        className="h-full bg-blue-600"
                                    />
                                </div>
                                <p className="text-sm text-slate-500 font-medium italic">Industry average for your sector is {fullPlan.benchmarking.industry_avg}%.</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                                <p className="text-slate-600 font-medium leading-relaxed">{fullPlan.benchmarking.analysis_summary}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="font-black text-slate-900 uppercase tracking-[0.2em] text-xs">Expert Recommendations</h4>
                            <div className="grid gap-4">
                                {fullPlan.benchmarking.recommendations.map((rec: any, i: number) => (
                                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 flex gap-5 items-start">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${rec.impact === 'High' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {rec.impact}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 mb-1">{rec.title}</p>
                                            <p className="text-sm text-slate-500 font-medium">{rec.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  )}
                  
                  {/* CCP Action Cards */}
                  {fullPlan?.ccp_summary && fullPlan.ccp_summary.length > 0 && (
                    <div className="space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-red-50 rounded-2xl text-red-600 shadow-sm"><ShieldAlert className="w-8 h-8" /></div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Critical Control Points</h3>
                                <p className="text-slate-500 font-medium text-lg">Your high-risk steps requiring rigorous daily monitoring.</p>
                            </div>
                        </div>

                        <div className="grid gap-8">
                            {fullPlan.ccp_summary.map((ccp, idx) => (
                                <div key={idx} className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><AlertOctagon className="w-32 h-32" /></div>
                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <h4 className="text-2xl font-black text-slate-900">{ccp.ccp_step}</h4>
                                        <span className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-red-600/20">CCP #{idx + 1}</span>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-10 text-sm relative z-10">
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Critical Limit</span>
                                            <p className="text-xl font-black text-red-600 bg-red-50 p-4 rounded-2xl inline-block border border-red-100">{ccp.critical_limit}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Primary Hazard</span>
                                            <p className="text-lg font-bold text-slate-700 leading-snug">{ccp.hazard}</p>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Monitoring & Corrective Action</span>
                                                <p className="text-slate-600 font-medium leading-relaxed text-base mb-4">{ccp.monitoring}</p>
                                                <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                                    <Siren className="w-5 h-5 text-amber-500 mt-1" />
                                                    <p className="text-slate-500 italic font-medium">"{ccp.corrective_action}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}

                  {/* NEW: Visual Process Flow Diagram */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm"><Workflow className="w-8 h-8" /></div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Visual Process Flow</h3>
                            <p className="text-slate-500 font-medium text-lg">Your manufacturing journey from intake to service.</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                        {generatedAnalysis.map((item, i) => (
                            <div key={i} className="flex flex-col items-center w-full">
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`
                                        w-full max-w-md p-6 rounded-2xl border-2 flex items-center justify-between transition-all
                                        ${item.is_ccp 
                                            ? 'border-red-500 bg-red-50 shadow-lg shadow-red-500/10 ring-4 ring-red-500/5' 
                                            : 'border-slate-100 bg-white shadow-sm'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${item.is_ccp ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className={`font-black ${item.is_ccp ? 'text-red-900' : 'text-slate-900'}`}>{item.step_name}</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.is_ccp ? 'Critical Control Point' : 'Prerequisite Step'}</p>
                                        </div>
                                    </div>
                                    {item.is_ccp && <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />}
                                </motion.div>
                                
                                {i < generatedAnalysis.length - 1 && (
                                    <div className="py-2">
                                        <ArrowDown className="w-6 h-6 text-slate-200" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                  </div>

                  {/* Existing: Full Analysis Table */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 shadow-sm"><ClipboardCheck className="w-8 h-8" /></div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Process Flow Audit</h3>
                            <p className="text-slate-500 font-medium text-lg">Full risk analysis for every operational step.</p>
                        </div>
                    </div>
                    <div className="border-2 border-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step Name</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Protocol</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Control Measure</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {generatedAnalysis.map((item, i) => (
                            <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                                <td className="p-6 font-bold text-slate-900">{item.step_name}</td>
                                <td className="p-6 text-center">
                                    {item.is_ccp ? 
                                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg shadow-red-600/20">CCP</span> : 
                                        <span className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black">PRP</span>
                                    }
                                </td>
                                <td className="p-6 text-sm text-slate-500 font-medium leading-relaxed">{item.control_measure}</td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-10">
                  {/* High Value Roadmap */}
                  <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] p-10 shadow-xl shadow-emerald-500/5">
                      <h4 className="text-2xl font-black text-emerald-900 mb-8 flex items-center gap-3">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600" /> Implementation
                      </h4>
                      <ul className="space-y-8">
                          <li className="flex gap-5">
                              <span className="font-black bg-emerald-600 text-white w-8 h-8 flex items-center justify-center rounded-2xl text-sm flex-shrink-0 shadow-lg shadow-emerald-600/30">1</span>
                              <div className="space-y-1">
                                  <p className="font-black text-emerald-900">Print Official Plan</p>
                                  <p className="text-sm text-emerald-700/70 font-medium leading-snug">Download your PDF and keep it in your HACCP folder.</p>
                              </div>
                          </li>
                          <li className="flex gap-5">
                              <span className="font-black bg-emerald-600 text-white w-8 h-8 flex items-center justify-center rounded-2xl text-sm flex-shrink-0 shadow-lg shadow-emerald-600/30">2</span>
                              <div className="space-y-1">
                                  <p className="font-black text-emerald-900">Active Monitoring</p>
                                  <p className="text-sm text-emerald-700/70 font-medium leading-snug">Use the included monitoring logs for your CCPs daily.</p>
                              </div>
                          </li>
                          <li className="flex gap-5">
                              <span className="font-black bg-emerald-600 text-white w-8 h-8 flex items-center justify-center rounded-2xl text-sm flex-shrink-0 shadow-lg shadow-emerald-600/30">3</span>
                              <div className="space-y-1">
                                  <p className="font-black text-emerald-900">Staff Training</p>
                                  <p className="text-sm text-emerald-700/70 font-medium leading-snug">Ensure all {formData.businessType} handlers know the critical limits.</p>
                              </div>
                          </li>
                      </ul>
                  </div>

                  {/* Free Tier Card */}
                  <div className="p-8 bg-slate-950 rounded-[2.5rem] border border-slate-800 shadow-xl group text-white">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                            <h4 className="text-xl font-black">Free Plan</h4>
                            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Instant Access</p>
                        </div>
                        <div className="text-2xl font-black tracking-tight">€0</div>
                    </div>
                    
                    <LeadCapture 
                        planId={planId} 
                        businessName={formData.businessLegalName}
                        onSuccess={() => {}} // Optional: trigger some tracking
                    >
                        {isClient && (
                            <PDFDownloadLink
                                document={
                                <HACCPDocument 
                                    dict={dict}
                                    logo={formData.logo}
                                    template={formData.template}
                                    data={{
                                    businessName: formData.businessLegalName || "My Business",
                                    productName: "HACCP Plan",
                                    productDescription: `Food Safety Plan for ${formData.businessType}`,
                                    intendedUse: "General Consumption",
                                    storageType: "Multiple",
                                    analysis: generatedAnalysis,
                                    fullPlan: fullPlan
                                    }} 
                                />
                                }
                                fileName={`${(formData.businessLegalName || "HACCP_Plan").replace(/\s+/g, '_')}.pdf`}
                                className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-center shadow-xl hover:bg-slate-100 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {({ loading }) => (
                                <>
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                                    {loading ? 'Preparing...' : 'Download PDF Plan'}
                                </>
                                )}
                            </PDFDownloadLink>
                        )}
                    </LeadCapture>
                  </div>

                  {/* Starter Review Card */}
                  <div className="p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 bg-yellow-400 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">Recommended</div>
                    <div className="space-y-1 mb-6">
                        <h4 className="text-xl font-black">Starter Review</h4>
                        <div className="text-3xl font-black">€79 <span className="text-xs font-bold text-blue-100">+ VAT</span></div>
                    </div>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-sm font-bold text-blue-50"><CheckCircle2 className="w-4 h-4 text-blue-200" /> Editable Word/Excel</li>
                        <li className="flex items-center gap-3 text-sm font-bold text-blue-50"><CheckCircle2 className="w-4 h-4 text-blue-200" /> Basic Prof. Review</li>
                    </ul>
                    <button onClick={() => handleCheckout('starter')} disabled={isPaying} className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                        {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Reviewed Plan'}
                    </button>
                  </div>

                  {/* Hire an Expert CTA */}
                  <div className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Users className="w-32 h-32" />
                    </div>
                    <h4 className="text-xl font-black mb-2">Need Expert Help?</h4>
                    <p className="text-blue-100 text-sm mb-6 font-medium leading-relaxed">
                        Confused by the hazard analysis? Our certified auditors can review your plan 1-on-1.
                    </p>
                    <Link 
                        href="/contact"
                        className="block w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl font-black text-center transition-all"
                    >
                        Talk to an Expert
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LeadCapture({ planId, businessName, children, onSuccess }: { planId: string | null, businessName: string, children: React.ReactNode, onSuccess: () => void }) {
    const [email, setEmail] = useState('');
    const [captured, setCaptured] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCapture = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('leads').insert({
                email: email.trim(),
                business_name: businessName,
                plan_id: planId
            });
            if (error) throw error;
            
            // Try to send email (don't block UI if it fails)
            fetch('/api/send-plan-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), businessName, planId })
            }).catch(console.error);

            setCaptured(true);
            onSuccess();
        } catch (err: any) {
            console.error("Lead capture failed:", err);
            alert(`Failed to save: ${err.message || "Please check your email and try again."}`);
        } finally {
            setLoading(false);
        }
    };

    if (captured) {
        return (
            <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">Plan Sent to {email}</p>
                </div>
                {children}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Email me this plan:</p>
                </div>
                <form onSubmit={handleCapture} className="flex flex-col gap-3">
                    <input 
                        type="email" 
                        required 
                        placeholder="chef@restaurant.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 group"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                        Send & Download PDF
                    </button>
                </form>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
                We respect your privacy. By continuing, you agree to our <Link href="/terms" className="underline">Terms</Link>.
            </p>
        </div>
    );
}
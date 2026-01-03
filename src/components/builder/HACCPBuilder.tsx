/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useLanguage, getDictionary } from '@/lib/i18n';
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

// ... (in component)
export default function HACCPBuilder() {
  const { t, language } = useLanguage();
  const dict = getDictionary(language).pdf; // Get PDF dictionary
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
    // --- SECTION 1: Business Context ---
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
      id: 'country',
      section: 'Regulatory Context',
      question: "Country of operation",
      description: "Regulations vary by region.",
      type: 'text',
      icon: <Globe className="w-6 h-6 text-green-500" />,
      placeholder: "e.g., Portugal",
      required: true
    },
    {
      id: 'regulation',
      section: 'Regulatory Context',
      question: "Which primary regulation applies?",
      description: "Select the legal framework you must comply with.",
      type: 'radio',
      icon: <Gavel className="w-6 h-6 text-amber-500" />,
      options: ['Codex Alimentarius', 'EU (Reg. 852/2004)', 'FDA (21 CFR 117)', 'Other']
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
      id: 'employeeCount',
      section: 'Operational Context',
      question: "Number of employees involved in food handling",
      description: "Includes kitchen staff, servers, and handlers.",
      type: 'number',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      placeholder: "e.g., 12"
    },
    {
      id: 'productionScale',
      section: 'Operational Context',
      question: "What is your production scale?",
      type: 'radio',
      icon: <BarChart3 className="w-6 h-6 text-indigo-500" />,
      options: ['Small (<100 meals/day)', 'Medium', 'Large / industrial']
    },
    {
      id: 'haccpScope',
      section: 'Operational Context',
      question: "Is this HACCP for a single or multiple sites?",
      type: 'radio',
      icon: <MapPin className="w-6 h-6 text-red-500" />,
      options: ['Single site', 'Multiple sites']
    },
    {
      id: 'certifications',
      section: 'Regulatory Context',
      question: "Are you required to comply with any of these?",
      description: "Check all that apply.",
      type: 'checkbox',
      icon: <Award className="w-6 h-6 text-yellow-500" />,
      options: ['ISO 22000', 'BRCGS', 'IFS']
    },

    // --- SECTION 2: Product Details ---
    {
      id: 'foodCategories',
      section: 'Product Details',
      question: "Which food categories do you handle?",
      description: "Select all that apply to your operation.",
      type: 'checkbox',
      icon: <UtensilsCrossed className="w-6 h-6 text-orange-500" />,
      options: ['Raw meat', 'Poultry', 'Fish / seafood', 'Dairy', 'Eggs', 'Produce', 'Ready-to-eat foods', 'Baked goods', 'Beverages'],
      required: true
    },
    {
      id: 'productStates',
      section: 'Product Details',
      question: "How are the products processed?",
      description: "Check all that apply.",
      type: 'checkbox',
      icon: <Thermometer className="w-6 h-6 text-red-600" />,
      options: ['Raw', 'Cooked', 'Ready-to-eat', 'Mixed']
    },
    {
      id: 'productCharacteristics',
      section: 'Product Details',
      question: "Final product storage characteristics",
      type: 'checkbox',
      icon: <Snowflake className="w-6 h-6 text-blue-400" />,
      options: ['Refrigerated', 'Frozen', 'Ambient']
    },
    {
      id: 'shelfLife',
      section: 'Product Details',
      question: "Expected shelf life",
      type: 'radio',
      icon: <Calendar className="w-6 h-6 text-slate-500" />,
      options: ['Short (< 3 days)', 'Medium (< 1 week)', 'Long (> 1 week)']
    },
    {
      id: 'isVulnerable',
      section: 'Intended Use',
      question: "Is any product intended for vulnerable populations?",
      description: "e.g., Children, elderly, or hospitals.",
      type: 'radio',
      icon: <Baby className="w-6 h-6 text-pink-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'packagingTypes',
      section: 'Packaging',
      question: "What type of packaging is used?",
      type: 'checkbox',
      icon: <Package className="w-6 h-6 text-amber-700" />,
      options: ['Bulk', 'Vacuum', 'MAP', 'Open', 'Sealed']
    },

    // --- SECTION 3: Ingredients & Allergens ---
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
      id: 'allergens',
      section: 'Allergens',
      question: "Do you use any of these allergens?",
      description: "Select all that apply.",
      type: 'checkbox',
      icon: <AlertOctagon className="w-6 h-6 text-red-500" />,
      options: [
        'Cereals containing gluten', 'Crustaceans', 'Eggs', 'Fish', 'Peanuts', 
        'Soybeans', 'Milk', 'Nuts', 'Celery', 'Mustard', 'Sesame', 'Sulphites', 'Lupin', 'Molluscs'
      ]
    },
    {
      id: 'allergensHandled',
      section: 'Allergen Management',
      question: "Are allergens handled on-site?",
      type: 'radio',
      icon: <ShieldAlert className="w-6 h-6 text-orange-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'allergenSegregation',
      section: 'Allergen Management',
      question: "Is allergen segregation implemented?",
      description: "Separate storage, utensils, or production times.",
      type: 'radio',
      icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'allergenLabeling',
      section: 'Allergen Management',
      question: "Are allergen declarations required on labels?",
      type: 'radio',
      icon: <Tag className="w-6 h-6 text-purple-500" />,
      options: ['Yes', 'No']
    },

    // --- SECTION 4: Process Overview ---
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
      id: 'customSteps',
      section: 'Process Flow',
      question: "Do you have any non-standard steps?",
      description: "Describe any unique processes not listed above.",
      type: 'text',
      icon: <FileText className="w-6 h-6 text-slate-500" />,
      placeholder: "e.g., Fermentation, Smoking, Sous-vide..."
    },
    {
      id: 'outsourcedSteps',
      section: 'Process Flow',
      question: "Are any steps outsourced?",
      description: "e.g., Delivery by third party.",
      type: 'radio',
      icon: <Truck className="w-6 h-6 text-orange-500" />,
      options: ['Yes', 'No']
    },

    // --- SECTION 5: Receiving & Supplier Control ---
    {
      id: 'suppliersApproved',
      section: 'Supplier Control',
      question: "Are all your suppliers approved?",
      description: "Based on audits, certifications, or performance.",
      type: 'radio',
      icon: <UserCheck className="w-6 h-6 text-blue-600" />,
      options: ['Yes', 'No']
    },
    {
      id: 'verificationChecks',
      section: 'Receiving Controls',
      question: "What do you verify on receipt?",
      description: "Check all that apply.",
      type: 'checkbox',
      icon: <ClipboardCheck className="w-6 h-6 text-emerald-600" />,
      options: ['Temperature', 'Packaging integrity', 'Documentation (Invoices/COA)']
    },
    {
      id: 'tempControlledDelivery',
      section: 'Receiving Controls',
      question: "Are raw materials temperature-controlled on delivery?",
      type: 'radio',
      icon: <Thermometer className="w-6 h-6 text-red-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'rejectNonConforming',
      section: 'Receiving Controls',
      question: "Do you reject non-conforming deliveries?",
      description: "e.g., Incorrect temp or damaged packaging.",
      type: 'radio',
      icon: <XCircle className="w-6 h-6 text-rose-600" />,
      options: ['Yes', 'No']
    },

    // --- SECTION 6: Storage Conditions ---
    {
      id: 'storageTypes',
      section: 'Storage',
      question: "Which storage types do you use?",
      type: 'checkbox',
      icon: <Warehouse className="w-6 h-6 text-blue-600" />,
      options: ['Ambient', 'Refrigerated', 'Frozen']
    },
    {
      id: 'storageTemps',
      section: 'Storage',
      question: "Standard storage temperatures?",
      description: "e.g., <5°C for fridge, <-18°C for freezer.",
      type: 'text',
      icon: <Thermometer className="w-6 h-6 text-red-500" />,
      placeholder: "e.g., Chilled < 5°C, Frozen < -18°C"
    },
    {
      id: 'fifoApplied',
      section: 'Storage',
      question: "Is FIFO (First-In, First-Out) applied?",
      type: 'radio',
      icon: <RefreshCcw className="w-6 h-6 text-emerald-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'rawRteSegregated',
      section: 'Storage',
      question: "Are raw and Ready-to-Eat (RTE) foods segregated?",
      description: "Preventing cross-contamination in storage.",
      type: 'radio',
      icon: <Layers className="w-6 h-6 text-orange-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'storageAllergenSegregation',
      section: 'Storage',
      question: "Is allergen segregation applied in storage?",
      type: 'radio',
      icon: <ShieldAlert className="w-6 h-6 text-purple-500" />,
      options: ['Yes', 'No']
    },

    // --- SECTION 7: Preparation & Handling ---
    {
      id: 'separateHandling',
      section: 'Preparation',
      question: "Are raw and cooked foods handled separately?",
      description: "Preventing cross-contamination during prep.",
      type: 'radio',
      icon: <Scissors className="w-6 h-6 text-blue-600" />,
      options: ['Yes', 'No']
    },
    {
      id: 'separateUtensils',
      section: 'Preparation',
      question: "Are separate utensils/equipment used?",
      description: "e.g., Color-coded boards for raw meat vs veg.",
      type: 'radio',
      icon: <UtensilsCrossed className="w-6 h-6 text-orange-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'handwashingEnforced',
      section: 'Preparation',
      question: "Is handwashing enforced before handling food?",
      type: 'radio',
      icon: <Hand className="w-6 h-6 text-emerald-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'prepTimeLimits',
      section: 'Preparation',
      question: "Are time limits applied during preparation?",
      description: "e.g., High-risk foods out of fridge < 2 hours.",
      type: 'radio',
      icon: <Clock className="w-6 h-6 text-blue-400" />,
      options: ['Yes', 'No']
    },
    {
      id: 'chemicalsInPrep',
      section: 'Preparation',
      question: "Are chemicals used in prep areas?",
      description: "e.g., Sanitizers or cleaning agents.",
      type: 'radio',
      icon: <FlaskConical className="w-6 h-6 text-purple-500" />,
      options: ['Yes', 'No']
    },

    // --- SECTION 8: Cooking / Processing ---
    {
      id: 'doYouCook',
      section: 'Cooking',
      question: "Do you cook food on site?",
      description: "Cooking is often a Critical Control Point (CCP).",
      type: 'radio',
      icon: <Flame className="w-6 h-6 text-orange-600" />,
      options: ['Yes', 'No'],
      required: true
    },
    {
      id: 'cookingMethods',
      section: 'Cooking',
      question: "Which cooking methods are used?",
      type: 'checkbox',
      icon: <UtensilsCrossed className="w-6 h-6 text-blue-500" />,
      options: ['Oven', 'Frying', 'Boiling', 'Sous-vide', 'Other']
    },
    {
      id: 'minCookingTemp',
      section: 'Cooking',
      question: "Minimum internal cooking temperature?",
      description: "Specify the critical limit (e.g., 75°C).",
      type: 'text',
      icon: <Thermometer className="w-6 h-6 text-red-600" />,
      placeholder: "e.g., 75°C (167°F) for 30 seconds"
    },
    {
      id: 'tempRecorded',
      section: 'Cooking',
      question: "Is temperature measured and recorded?",
      type: 'radio',
      icon: <FileCheck className="w-6 h-6 text-emerald-600" />,
      options: ['Yes', 'No']
    },
    {
      id: 'cookingIsCcp',
      section: 'Cooking',
      question: "Is cooking considered a Critical Control Point (CCP)?",
      type: 'radio',
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      options: ['Yes', 'No']
    },

    // --- SECTION 9: Cooling & Reheating ---
    {
      id: 'isFoodCooled',
      section: 'Cooling',
      question: "Is food cooled after cooking?",
      description: "Cooling is a high-risk step for spore-forming bacteria.",
      type: 'radio',
      icon: <Wind className="w-6 h-6 text-blue-400" />,
      options: ['Yes', 'No']
    },
    {
      id: 'coolingMethods',
      section: 'Cooling',
      question: "What cooling methods are used?",
      type: 'checkbox',
      icon: <Snowflake className="w-6 h-6 text-blue-600" />,
      options: ['Blast chiller', 'Ambient', 'Refrigeration']
    },
    {
      id: 'coolingTimeLimit',
      section: 'Cooling',
      question: "Cooling time limits?",
      description: "Standard: 60°C to 10°C in under 2 hours.",
      type: 'text',
      icon: <Clock className="w-6 h-6 text-slate-500" />,
      placeholder: "e.g., 2 hours max"
    },
    {
      id: 'coolingTempTarget',
      section: 'Cooling',
      question: "What are your cooling temperature targets?",
      type: 'text',
      icon: <Thermometer className="w-6 h-6 text-blue-500" />,
      placeholder: "e.g., < 5°C"
    },
    {
      id: 'isReheatingPerformed',
      section: 'Reheating',
      question: "Is reheating performed?",
      type: 'radio',
      icon: <RotateCcw className="w-6 h-6 text-orange-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'reheatingTempTarget',
      section: 'Reheating',
      question: "What is your reheating temperature target?",
      type: 'text',
      icon: <Thermometer className="w-6 h-6 text-red-500" />,
      placeholder: "e.g., > 75°C"
    },
    {
      id: 'reheatingLimitedOnce',
      section: 'Reheating',
      question: "Is reheating limited to only once?",
      type: 'radio',
      icon: <XCircle className="w-6 h-6 text-rose-600" />,
      options: ['Yes', 'No']
    },

    // --- SECTION 10: Holding & Distribution ---
    {
      id: 'hotHoldingTemp',
      section: 'Holding',
      question: "Hot holding temperature target?",
      type: 'text',
      icon: <Flame className="w-6 h-6 text-red-500" />,
      placeholder: "e.g., > 63°C"
    },
    {
      id: 'coldHoldingTemp',
      section: 'Holding',
      question: "Cold holding temperature target?",
      type: 'text',
      icon: <Snowflake className="w-6 h-6 text-blue-500" />,
      placeholder: "e.g., < 5°C"
    },
    {
      id: 'maxHoldingTime',
      section: 'Holding',
      question: "Maximum holding time for display/service?",
      type: 'text',
      icon: <Timer className="w-6 h-6 text-slate-600" />,
      placeholder: "e.g., 4 hours"
    },
    {
      id: 'isTransported',
      section: 'Distribution',
      question: "Is food transported?",
      description: "Delivery to customers or other sites.",
      type: 'radio',
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      options: ['Yes', 'No']
    },
    {
      id: 'transportTempMethod',
      section: 'Distribution',
      question: "Transport temperature control method?",
      description: "e.g., Insulated boxes, refrigerated vehicle.",
      type: 'text',
      icon: <Package className="w-6 h-6 text-amber-600" />,
      placeholder: "e.g., Refrigerated Van"
    },
    {
      id: 'transportTempMonitored',
      section: 'Distribution',
      question: "Is temperature monitored during transport?",
      type: 'radio',
      icon: <FileCheck className="w-6 h-6 text-emerald-600" />,
      options: ['Yes', 'No']
    },

    // --- SECTION 11: Equipment & Facilities ---
    {
      id: 'keyEquipment',
      section: 'Equipment',
      question: "List key equipment used",
      description: "Type an item and press Enter.",
      type: 'list',
      icon: <Wrench className="w-6 h-6 text-slate-600" />,
      placeholder: "e.g., Industrial Oven, Walk-in Fridge"
    },
    {
      id: 'devicesCalibrated',
      section: 'Equipment',
      question: "Are temperature-controlled devices calibrated?",
      type: 'radio',
      icon: <Settings className="w-6 h-6 text-blue-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'calibrationFrequency',
      section: 'Equipment',
      question: "What is the calibration frequency?",
      type: 'text',
      icon: <RefreshCcw className="w-6 h-6 text-emerald-500" />,
      placeholder: "e.g., Annually, Every 6 months"
    },
    {
      id: 'preventiveMaintenance',
      section: 'Equipment',
      question: "Is preventive maintenance in place?",
      type: 'radio',
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      options: ['Yes', 'No']
    },
    {
      id: 'foreignBodyControls',
      section: 'Equipment',
      question: "Are foreign body controls in place?",
      type: 'checkbox',
      icon: <Filter className="w-6 h-6 text-orange-500" />,
      options: ['Sieves', 'Magnets', 'Visual checks']
    },

    // --- SECTION 12: Cleaning & Chemicals ---
    {
      id: 'cleaningSchedulesDocumented',
      section: 'Cleaning',
      question: "Are cleaning schedules documented?",
      type: 'radio',
      icon: <Brush className="w-6 h-6 text-blue-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'cleaningFrequency',
      section: 'Cleaning',
      question: "How often is deep cleaning performed?",
      type: 'text',
      icon: <Calendar className="w-6 h-6 text-slate-500" />,
      placeholder: "e.g., Daily, Weekly, Monthly"
    },
    {
      id: 'cleaningChemicals',
      section: 'Cleaning',
      question: "List main cleaning chemicals used",
      type: 'list',
      icon: <FlaskConical className="w-6 h-6 text-purple-500" />,
      placeholder: "e.g., Degreaser, Sanitizer"
    },
    {
      id: 'chemicalsStoredSeparately',
      section: 'Cleaning',
      question: "Are chemicals stored separately from food?",
      type: 'radio',
      icon: <ShieldAlert className="w-6 h-6 text-red-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'cleaningVerified',
      section: 'Cleaning',
      question: "Is cleaning effectiveness verified?",
      description: "e.g., ATP swabs, visual inspection.",
      type: 'radio',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
      options: ['Yes', 'No']
    },

    // --- SECTION 13: Personnel & Training ---
    {
      id: 'trainingReceived',
      section: 'Personnel',
      question: "Do food handlers receive food safety training?",
      type: 'radio',
      icon: <GraduationCap className="w-6 h-6 text-blue-600" />,
      options: ['Yes', 'No']
    },
    {
      id: 'trainingFrequency',
      section: 'Personnel',
      question: "Training frequency?",
      type: 'text',
      icon: <RefreshCcw className="w-6 h-6 text-slate-500" />,
      placeholder: "e.g., On induction, Annually"
    },
    {
      id: 'hygieneRulesDocumented',
      section: 'Personnel',
      question: "Are hygiene rules documented?",
      type: 'radio',
      icon: <BookOpen className="w-6 h-6 text-indigo-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'healthDeclarations',
      section: 'Personnel',
      question: "Are health declarations required?",
      description: "For reporting illness (vomiting, diarrhea).",
      type: 'radio',
      icon: <FileText className="w-6 h-6 text-orange-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'ppeUsed',
      section: 'Personnel',
      question: "What PPE is used?",
      type: 'checkbox',
      icon: <UserCheck className="w-6 h-6 text-green-600" />,
      options: ['Gloves', 'Hairnets', 'Aprons', 'Masks']
    },

    // --- SECTION 14: Monitoring & Records ---
    {
      id: 'ccpsMonitored',
      section: 'Monitoring',
      question: "Are Critical Control Points (CCPs) monitored?",
      description: "Without monitoring, a CCP is not valid.",
      type: 'radio',
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      options: ['Yes', 'No'],
      required: true
    },
    {
      id: 'monitoringFrequency',
      section: 'Monitoring',
      question: "General monitoring frequency?",
      type: 'text',
      icon: <History className="w-6 h-6 text-slate-500" />,
      placeholder: "e.g., Every batch, Twice daily"
    },
    {
      id: 'recordsKept',
      section: 'Monitoring',
      question: "Are records kept?",
      type: 'radio',
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'retentionPeriod',
      section: 'Monitoring',
      question: "Record retention period?",
      description: "How long do you keep records?",
      type: 'text',
      icon: <Calendar className="w-6 h-6 text-slate-500" />,
      placeholder: "e.g., 12 months"
    },
    {
      id: 'recordType',
      section: 'Monitoring',
      question: "Are records digital or paper?",
      type: 'radio',
      icon: <FileDigit className="w-6 h-6 text-purple-500" />,
      options: ['Digital', 'Paper', 'Both']
    },

    // --- SECTION 15: Corrective Actions ---
    {
      id: 'correctiveActionsDefined',
      section: 'Corrective Actions',
      question: "Are corrective actions defined for CCP failures?",
      type: 'radio',
      icon: <Siren className="w-6 h-6 text-red-600" />,
      options: ['Yes', 'No']
    },
    {
      id: 'correctiveActionExamples',
      section: 'Corrective Actions',
      question: "Examples of corrective actions used",
      type: 'checkbox',
      icon: <Wrench className="w-6 h-6 text-slate-600" />,
      options: ['Retraining', 'Recooking', 'Disposal of product', 'Equipment repair']
    },
    {
      id: 'productIsolation',
      section: 'Corrective Actions',
      question: "Is product isolation (quarantine) implemented?",
      type: 'radio',
      icon: <ShieldCheck className="w-6 h-6 text-orange-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'rootCauseAnalysis',
      section: 'Corrective Actions',
      question: "Is root cause analysis performed?",
      type: 'radio',
      icon: <Search className="w-6 h-6 text-blue-500" />,
      options: ['Yes', 'No']
    },

    // --- SECTION 16: Verification & Validation ---
    {
      id: 'internalAudits',
      section: 'Verification',
      question: "Are internal audits conducted?",
      type: 'radio',
      icon: <ClipboardCheck className="w-6 h-6 text-emerald-600" />,
      options: ['Yes', 'No']
    },
    {
      id: 'auditFrequency',
      section: 'Verification',
      question: "Audit frequency?",
      type: 'text',
      icon: <Calendar className="w-6 h-6 text-slate-500" />,
      placeholder: "e.g., Quarterly"
    },
    {
      id: 'externalAudits',
      section: 'Verification',
      question: "Are external audits conducted?",
      description: "By local authority or third party.",
      type: 'radio',
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'annualReview',
      section: 'Verification',
      question: "Is the HACCP plan reviewed annually?",
      type: 'radio',
      icon: <RefreshCcw className="w-6 h-6 text-purple-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'reviewTriggers',
      section: 'Verification',
      question: "Triggers for HACCP review?",
      type: 'checkbox',
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      options: ['Process change', 'Product change', 'Incident', 'Regulation change']
    },

    // --- SECTION 17: Pest Control ---
    {
      id: 'pestControlContract',
      section: 'Pest Control',
      question: "Is there a pest control contract in place?",
      type: 'radio',
      icon: <Bug className="w-6 h-6 text-slate-700" />,
      options: ['Yes', 'No']
    },
    {
      id: 'pestMonitoringDevices',
      section: 'Pest Control',
      question: "Which monitoring devices are used?",
      type: 'checkbox',
      icon: <Wrench className="w-6 h-6 text-slate-500" />,
      options: ['Bait stations', 'Electric fly killers', 'Pheromone traps', 'Visual inspections']
    },
    {
      id: 'pestSightingReporting',
      section: 'Pest Control',
      question: "Is there a system for reporting pest sightings?",
      type: 'radio',
      icon: <FileText className="w-6 h-6 text-orange-500" />,
      options: ['Yes', 'No']
    },

    // --- SECTION 18: Professional Review (Upsell) ---
    {
      id: 'wantProfessionalReview',
      section: 'Professional Review',
      question: "Do you want a professional review of your plan?",
      description: "Recommended for audit readiness and compliance assurance.",
      type: 'radio',
      icon: <Briefcase className="w-6 h-6 text-blue-600" />,
      options: ['Yes', 'No']
    },
    {
      id: 'reviewTurnaround',
      section: 'Professional Review',
      question: "Required turnaround time?",
      type: 'radio',
      icon: <Clock className="w-6 h-6 text-emerald-500" />,
      options: ['Standard (7 days)', 'Express (48 hours)', 'Urgent (24 hours)']
    },
    {
      id: 'regionComplianceCheck',
      section: 'Professional Review',
      question: "Require region-specific compliance check?",
      type: 'radio',
      icon: <Globe className="w-6 h-6 text-purple-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'auditReadyDocs',
      section: 'Professional Review',
      question: "Do you need audit-ready documentation?",
      type: 'radio',
      icon: <FileCheck className="w-6 h-6 text-amber-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'certificationSupport',
      section: 'Professional Review',
      question: "Do you need support with certification?",
      description: "Help with BRCGS, ISO 22000, etc.",
      type: 'radio',
      icon: <Award className="w-6 h-6 text-yellow-500" />,
      options: ['Yes', 'No']
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
                                        dict={dict}
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
                                       <h4 className="text-lg font-black text-slate-900 leading-none">Starter Review</h4>
                                       <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Standard Review</p>
                                   </div>
                                   <div className="text-2xl font-black text-slate-900 tracking-tight">€79 <span className="text-xs font-normal text-slate-500">+ VAT</span></div>
                               </div>
                               <ul className="space-y-3 mb-6">
                                   <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                       <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> AI Plan + Expert Review
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
                                   {isPaying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get Started'}
                               </button>
                           </div>

                           {/* Pro Card */}
                           <div className="p-6 bg-blue-600 rounded-3xl border-2 border-blue-500 shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all relative overflow-hidden text-white">
                               <div className="absolute top-0 right-0 p-2 bg-amber-400 text-[10px] font-black uppercase text-slate-900 rounded-bl-xl tracking-widest shadow-lg">Popular</div>
                               <div className="flex justify-between items-start mb-4">
                                   <div>
                                       <h4 className="text-lg font-black leading-none">Expert Pro</h4>
                                       <p className="text-xs text-blue-100 mt-1 uppercase tracking-widest font-bold">Complex Operations</p>
                                   </div>
                                   <div className="text-2xl font-black tracking-tight">Custom</div>
                               </div>
                               <ul className="space-y-3 mb-6">
                                   <li className="flex items-center gap-2 text-sm text-blue-50 font-medium">
                                       <CheckCircle2 className="w-4 h-4 text-blue-200 flex-shrink-0" /> Multi-site / Industrial
                                   </li>
                                   <li className="flex items-center gap-2 text-sm text-blue-50 font-medium font-bold">
                                       <CheckCircle2 className="w-4 h-4 text-amber-300 flex-shrink-0" /> Dedicated Consultant
                                   </li>
                                   <li className="flex items-center gap-2 text-sm text-blue-50 font-medium">
                                       <CheckCircle2 className="w-4 h-4 text-blue-200 flex-shrink-0" /> Full Compliance Audit
                                   </li>
                               </ul>
                               <button 
                                   onClick={() => window.location.href = '/contact'}
                                   className="w-full py-3 bg-white text-blue-600 rounded-xl font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                               >
                                   Contact Sales
                               </button>
                           </div>

                           {/* NEW: Email Lead Capture */}
                           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                               <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                   <FileCheck className="w-4 h-4 text-blue-600" /> Save your work?
                               </h4>
                               <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                   Enter your email to receive a backup copy of your plan and periodic compliance reminders.
                               </p>
                               <form 
                                   onSubmit={async (e) => {
                                       e.preventDefault();
                                       const email = (e.target as any).email.value;
                                       if (!email) return;
                                       const btn = (e.target as any).querySelector('button');
                                       btn.disabled = true;
                                       btn.innerText = 'Saving...';
                                       
                                       await supabase.from('leads').insert({ 
                                           email, 
                                           plan_id: planId, 
                                           source: 'builder_result' 
                                       });
                                       
                                       btn.innerText = 'Saved!';
                                       btn.classList.add('bg-green-600');
                                   }}
                                   className="flex flex-col gap-2"
                               >
                                   <input 
                                       required
                                       type="email" 
                                       name="email"
                                       placeholder="you@company.com" 
                                       className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm focus:border-blue-500 outline-none" 
                                   />
                                   <button className="bg-slate-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-black transition-all">
                                       Email Me My Plan
                                   </button>
                               </form>
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
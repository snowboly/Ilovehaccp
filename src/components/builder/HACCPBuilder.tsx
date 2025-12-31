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
  Lock,
  Save,
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
  Briefcase
} from 'lucide-react';

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';
import { PDFDownloadLink } from '@react-pdf/renderer';
import HACCPDocument from '../pdf/HACCPDocument';
import { useLanguage } from '@/lib/i18n';

type Step = 'intro' | 'questions' | 'generating' | 'result';

interface ProcessStep {
  id: string;
  name: string;
}

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

export default function HACCPBuilder() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<Step>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [planId, setPlanId] = useState<string | null>(null);
  const [generatedAnalysis, setGeneratedAnalysis] = useState<HazardAnalysisItem[]>([]);
  const [fullPlan, setFullPlan] = useState<FullHACCPPlan | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('id');

  const [formData, setFormData] = useState({
    // Section 1: Business & Regulatory
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
    
    // Section 2: Product & Food Categories
    foodCategories: [] as string[],
    productStates: [] as string[],
    productCharacteristics: [] as string[],
    shelfLife: 'Short',
    isVulnerable: 'No',
    packagingTypes: [] as string[],

    // Section 3: Ingredients & Allergens
    mainIngredients: [] as string[],
    allergens: [] as string[],
    allergensHandled: 'No',
    allergenSegregation: 'No',
    allergenLabeling: 'No',

    // Section 4: Process Overview
    processSteps: [] as string[],
    customSteps: '',
    outsourcedSteps: 'No',

    // Section 5: Receiving & Supplier Control
    suppliersApproved: 'No',
    verificationChecks: [] as string[],
    tempControlledDelivery: 'No',
    rejectNonConforming: 'No',

    // Section 6: Storage Conditions
    storageTypes: [] as string[],
    storageTemps: '',
    fifoApplied: 'No',
    rawRteSegregated: 'No',
    storageAllergenSegregation: 'No',

    // Section 7: Preparation & Handling
    separateHandling: 'No',
    separateUtensils: 'No',
    handwashingEnforced: 'No',
    prepTimeLimits: 'No',
    chemicalsInPrep: 'No',

    // Section 8: Cooking / Processing
    doYouCook: 'No',
    cookingMethods: [] as string[],
    minCookingTemp: '',
    tempRecorded: 'No',
    cookingIsCcp: 'No',

    // Section 9: Cooling & Reheating
    isFoodCooled: 'No',
    coolingMethods: [] as string[],
    coolingTimeLimit: '',
    coolingTempTarget: '',
    isReheatingPerformed: 'No',
    reheatingTempTarget: '',
    reheatingLimitedOnce: 'No',

    // Section 10: Holding & Distribution
    hotHoldingTemp: '',
    coldHoldingTemp: '',
    maxHoldingTime: '',
    isTransported: 'No',
    transportTempMethod: '',
    transportTempMonitored: 'No',

    // Section 11: Equipment & Facilities
    keyEquipment: [] as string[],
    devicesCalibrated: 'No',
    calibrationFrequency: '',
    preventiveMaintenance: 'No',
    foreignBodyControls: [] as string[],

    // Section 12: Cleaning & Chemicals
    cleaningSchedulesDocumented: 'No',
    cleaningFrequency: '',
    cleaningChemicals: [] as string[],
    chemicalsStoredSeparately: 'No',
    cleaningVerified: 'No',

    // Section 13: Personnel & Training
    trainingReceived: 'No',
    trainingFrequency: '',
    hygieneRulesDocumented: 'No',
    healthDeclarations: 'No',
    ppeUsed: [] as string[],

    // Section 14: Monitoring & Records
    ccpsMonitored: 'No',
    monitoringFrequency: '',
    recordsKept: 'No',
    retentionPeriod: '',
    recordType: 'Paper',

    // Section 15: Corrective Actions
    correctiveActionsDefined: 'No',
    correctiveActionExamples: [] as string[],
    productIsolation: 'No',
    rootCauseAnalysis: 'No',

    // Section 16: Verification & Validation
    internalAudits: 'No',
    auditFrequency: '',
    externalAudits: 'No',
    annualReview: 'No',
    reviewTriggers: [] as string[],

    // Section 17: Pest Control
    pestControlContract: 'No',
    pestMonitoringDevices: [] as string[],
    pestSightingReporting: 'No',

    // Section 18: Professional Review (Upsell)
    wantProfessionalReview: 'No',
    reviewTurnaround: 'Standard (7 days)',
    regionComplianceCheck: 'No',
    auditReadyDocs: 'No',
    certificationSupport: 'No',

    // Placeholder for future sections
    productName: '',
    productDescription: '',
    intendedUse: '',
    storageType: 'Refrigerated',
  });

  const [currentIngredient, setCurrentIngredient] = useState('');

  useEffect(() => {
    setIsClient(true);
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUserId(session.user.id);
    };
    checkUser();
  }, []);

  // Questions Definition
  const questions = [
    // --- SECTION 1 ---
    {
      id: 'businessLegalName',
      section: 'Business Context',
      question: "What is your business legal name?",
      description: "As it appears on official registration documents.",
      type: 'text',
      icon: <Building2 className="w-6 h-6 text-blue-500" />,
      placeholder: "e.g., Global Food Solutions Ltd."
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
      placeholder: "e.g., Portugal"
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
      description: "Helps us categorize your hazards accurately.",
      type: 'radio',
      icon: <Building2 className="w-6 h-6 text-purple-500" />,
      options: ['Restaurant', 'Catering', 'Manufacturer', 'Processor', 'Distributor', 'Retail']
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
    // --- SECTION 2 ---
    {
      id: 'foodCategories',
      section: 'Food Categories',
      question: "Which food categories do you handle?",
      description: "Select all that apply to your operation.",
      type: 'checkbox',
      icon: <UtensilsCrossed className="w-6 h-6 text-orange-500" />,
      options: ['Raw meat', 'Poultry', 'Fish / seafood', 'Dairy', 'Eggs', 'Produce', 'Ready-to-eat foods', 'Baked goods', 'Beverages']
    },
    {
      id: 'productStates',
      section: 'Product State',
      question: "How are the products processed?",
      description: "Check all that apply.",
      type: 'checkbox',
      icon: <Thermometer className="w-6 h-6 text-red-600" />,
      options: ['Raw', 'Cooked', 'Ready-to-eat', 'Mixed']
    },
    {
      id: 'productCharacteristics',
      section: 'Product Characteristics',
      question: "Final product storage characteristics",
      type: 'checkbox',
      icon: <Snowflake className="w-6 h-6 text-blue-400" />,
      options: ['Refrigerated', 'Frozen', 'Ambient']
    },
    {
      id: 'shelfLife',
      section: 'Product Characteristics',
      question: "Expected shelf life",
      type: 'radio',
      icon: <Calendar className="w-6 h-6 text-slate-500" />,
      options: ['Short', 'Medium', 'Long']
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
    // --- SECTION 3 ---
    {
      id: 'mainIngredients',
      section: 'Ingredients',
      question: "List your main ingredients",
      description: "Type an ingredient and press Enter or 'Add'.",
      type: 'list',
      icon: <List className="w-6 h-6 text-emerald-600" />,
      placeholder: "e.g., Raw Beef"
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
    // --- SECTION 4 ---
    {
      id: 'processSteps',
      section: 'Process Overview',
      question: "Select applicable process steps",
      description: "These will form your process flow diagram.",
      type: 'checkbox',
      icon: <Workflow className="w-6 h-6 text-blue-600" />,
      options: [
        'Receiving', 'Storage (ambient)', 'Storage (chilled)', 'Storage (frozen)',
        'Thawing', 'Washing', 'Cutting', 'Mixing',
        'Cooking', 'Cooling', 'Reheating', 'Holding', 'Packaging', 'Dispatch'
      ]
    },
    {
      id: 'customSteps',
      section: 'Process Overview',
      question: "Do you have any non-standard steps?",
      description: "Describe any unique processes not listed above.",
      type: 'text',
      icon: <FileText className="w-6 h-6 text-slate-500" />,
      placeholder: "e.g., Fermentation, Smoking, Sous-vide..."
    },
    {
      id: 'outsourcedSteps',
      section: 'Process Overview',
      question: "Are any steps outsourced?",
      description: "e.g., Delivery by third party.",
      type: 'radio',
      icon: <Truck className="w-6 h-6 text-orange-500" />,
      options: ['Yes', 'No']
    },
    // --- SECTION 5 ---
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
    // --- SECTION 6 ---
    {
      id: 'storageTypes',
      section: 'Storage Conditions',
      question: "Which storage types do you use?",
      type: 'checkbox',
      icon: <Warehouse className="w-6 h-6 text-blue-600" />,
      options: ['Ambient', 'Refrigerated', 'Frozen']
    },
    {
      id: 'storageTemps',
      section: 'Storage Conditions',
      question: "Standard storage temperatures?",
      description: "e.g., <5°C for fridge, <-18°C for freezer.",
      type: 'text',
      icon: <Thermometer className="w-6 h-6 text-red-500" />,
      placeholder: "e.g., Chilled < 5°C, Frozen < -18°C"
    },
    {
      id: 'fifoApplied',
      section: 'Storage Conditions',
      question: "Is FIFO (First-In, First-Out) applied?",
      type: 'radio',
      icon: <RefreshCcw className="w-6 h-6 text-emerald-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'rawRteSegregated',
      section: 'Storage Conditions',
      question: "Are raw and Ready-to-Eat (RTE) foods segregated?",
      description: "Preventing cross-contamination in storage.",
      type: 'radio',
      icon: <Layers className="w-6 h-6 text-orange-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'storageAllergenSegregation',
      section: 'Storage Conditions',
      question: "Is allergen segregation applied in storage?",
      type: 'radio',
      icon: <ShieldAlert className="w-6 h-6 text-purple-500" />,
      options: ['Yes', 'No']
    },
    // --- SECTION 7 ---
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
    // --- SECTION 8 ---
    {
      id: 'doYouCook',
      section: 'Cooking / Processing',
      question: "Do you cook food?",
      type: 'radio',
      icon: <Flame className="w-6 h-6 text-orange-600" />,
      options: ['Yes', 'No']
    },
    {
      id: 'cookingMethods',
      section: 'Cooking / Processing',
      question: "Which cooking methods are used?",
      type: 'checkbox',
      icon: <UtensilsCrossed className="w-6 h-6 text-blue-500" />,
      options: ['Oven', 'Frying', 'Boiling', 'Sous-vide', 'Other']
    },
    {
      id: 'minCookingTemp',
      section: 'Cooking / Processing',
      question: "Minimum internal cooking temperature?",
      type: 'text',
      icon: <Thermometer className="w-6 h-6 text-red-600" />,
      placeholder: "e.g., 75°C (167°F) for 30 seconds"
    },
    {
      id: 'tempRecorded',
      section: 'Cooking / Processing',
      question: "Is temperature measured and recorded?",
      type: 'radio',
      icon: <FileCheck className="w-6 h-6 text-emerald-600" />,
      options: ['Yes', 'No']
    },
    {
      id: 'cookingIsCcp',
      section: 'Cooking / Processing',
      question: "Is cooking considered a Critical Control Point (CCP)?",
      type: 'radio',
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      options: ['Yes', 'No']
    },
    // --- SECTION 9 ---
    {
      id: 'isFoodCooled',
      section: 'Cooling & Reheating',
      question: "Is food cooled after cooking?",
      type: 'radio',
      icon: <Wind className="w-6 h-6 text-blue-400" />,
      options: ['Yes', 'No']
    },
    {
      id: 'coolingMethods',
      section: 'Cooling & Reheating',
      question: "What cooling methods are used?",
      type: 'checkbox',
      icon: <Snowflake className="w-6 h-6 text-blue-600" />,
      options: ['Blast chiller', 'Ambient', 'Refrigeration']
    },
    {
      id: 'coolingTimeLimit',
      section: 'Cooling & Reheating',
      question: "Cooling time limits?",
      description: "e.g., From 60°C to 10°C in < 2 hours.",
      type: 'text',
      icon: <Clock className="w-6 h-6 text-slate-500" />,
      placeholder: "e.g., 2 hours"
    },
    {
      id: 'coolingTempTarget',
      section: 'Cooling & Reheating',
      question: "What are your cooling temperature targets?",
      type: 'text',
      icon: <Thermometer className="w-6 h-6 text-blue-500" />,
      placeholder: "e.g., < 5°C"
    },
    {
      id: 'isReheatingPerformed',
      section: 'Cooling & Reheating',
      question: "Is reheating performed?",
      type: 'radio',
      icon: <RotateCcw className="w-6 h-6 text-orange-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'reheatingTempTarget',
      section: 'Cooling & Reheating',
      question: "What is your reheating temperature target?",
      type: 'text',
      icon: <Thermometer className="w-6 h-6 text-red-500" />,
      placeholder: "e.g., > 75°C"
    },
    {
      id: 'reheatingLimitedOnce',
      section: 'Cooling & Reheating',
      question: "Is reheating limited to only once?",
      type: 'radio',
      icon: <XCircle className="w-6 h-6 text-rose-600" />,
      options: ['Yes', 'No']
    },
    // --- SECTION 10 ---
    {
      id: 'hotHoldingTemp',
      section: 'Holding & Distribution',
      question: "Hot holding temperature target?",
      type: 'text',
      icon: <Flame className="w-6 h-6 text-red-500" />,
      placeholder: "e.g., > 63°C"
    },
    {
      id: 'coldHoldingTemp',
      section: 'Holding & Distribution',
      question: "Cold holding temperature target?",
      type: 'text',
      icon: <Snowflake className="w-6 h-6 text-blue-500" />,
      placeholder: "e.g., < 5°C"
    },
    {
      id: 'maxHoldingTime',
      section: 'Holding & Distribution',
      question: "Maximum holding time for display/service?",
      type: 'text',
      icon: <Timer className="w-6 h-6 text-slate-600" />,
      placeholder: "e.g., 4 hours"
    },
    {
      id: 'isTransported',
      section: 'Holding & Distribution',
      question: "Is food transported?",
      description: "Delivery to customers or other sites.",
      type: 'radio',
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      options: ['Yes', 'No']
    },
    {
      id: 'transportTempMethod',
      section: 'Holding & Distribution',
      question: "Transport temperature control method?",
      description: "e.g., Insulated boxes, refrigerated vehicle.",
      type: 'text',
      icon: <Package className="w-6 h-6 text-amber-600" />,
      placeholder: "e.g., Refrigerated Van"
    },
    {
      id: 'transportTempMonitored',
      section: 'Holding & Distribution',
      question: "Is temperature monitored during transport?",
      type: 'radio',
      icon: <FileCheck className="w-6 h-6 text-emerald-600" />,
      options: ['Yes', 'No']
    },
    // --- SECTION 11 ---
    {
      id: 'keyEquipment',
      section: 'Equipment & Facilities',
      question: "List key equipment used",
      description: "Type an item and press Enter.",
      type: 'list',
      icon: <Wrench className="w-6 h-6 text-slate-600" />,
      placeholder: "e.g., Industrial Oven, Walk-in Fridge"
    },
    {
      id: 'devicesCalibrated',
      section: 'Equipment & Facilities',
      question: "Are temperature-controlled devices calibrated?",
      type: 'radio',
      icon: <Settings className="w-6 h-6 text-blue-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'calibrationFrequency',
      section: 'Equipment & Facilities',
      question: "What is the calibration frequency?",
      type: 'text',
      icon: <RefreshCcw className="w-6 h-6 text-emerald-500" />,
      placeholder: "e.g., Annually, Every 6 months"
    },
    {
      id: 'preventiveMaintenance',
      section: 'Equipment & Facilities',
      question: "Is preventive maintenance in place?",
      type: 'radio',
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      options: ['Yes', 'No']
    },
    {
      id: 'foreignBodyControls',
      section: 'Equipment & Facilities',
      question: "Are foreign body controls in place?",
      type: 'checkbox',
      icon: <Filter className="w-6 h-6 text-orange-500" />,
      options: ['Sieves', 'Magnets', 'Visual checks']
    },
    // --- SECTION 12 ---
    {
      id: 'cleaningSchedulesDocumented',
      section: 'Cleaning & Chemicals',
      question: "Are cleaning schedules documented?",
      type: 'radio',
      icon: <Brush className="w-6 h-6 text-blue-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'cleaningFrequency',
      section: 'Cleaning & Chemicals',
      question: "How often is deep cleaning performed?",
      type: 'text',
      icon: <Calendar className="w-6 h-6 text-slate-500" />,
      placeholder: "e.g., Daily, Weekly, Monthly"
    },
    {
      id: 'cleaningChemicals',
      section: 'Cleaning & Chemicals',
      question: "List main cleaning chemicals used",
      type: 'list',
      icon: <FlaskConical className="w-6 h-6 text-purple-500" />,
      placeholder: "e.g., Degreaser, Sanitizer"
    },
    {
      id: 'chemicalsStoredSeparately',
      section: 'Cleaning & Chemicals',
      question: "Are chemicals stored separately from food?",
      type: 'radio',
      icon: <ShieldAlert className="w-6 h-6 text-red-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'cleaningVerified',
      section: 'Cleaning & Chemicals',
      question: "Is cleaning effectiveness verified?",
      description: "e.g., ATP swabs, visual inspection.",
      type: 'radio',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
      options: ['Yes', 'No']
    },
    // --- SECTION 13 ---
    {
      id: 'trainingReceived',
      section: 'Personnel & Training',
      question: "Do food handlers receive food safety training?",
      type: 'radio',
      icon: <GraduationCap className="w-6 h-6 text-blue-600" />,
      options: ['Yes', 'No']
    },
    {
      id: 'trainingFrequency',
      section: 'Personnel & Training',
      question: "Training frequency?",
      type: 'text',
      icon: <RefreshCcw className="w-6 h-6 text-slate-500" />,
      placeholder: "e.g., On induction, Annually"
    },
    {
      id: 'hygieneRulesDocumented',
      section: 'Personnel & Training',
      question: "Are hygiene rules documented?",
      type: 'radio',
      icon: <BookOpen className="w-6 h-6 text-indigo-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'healthDeclarations',
      section: 'Personnel & Training',
      question: "Are health declarations required?",
      description: "For reporting illness (vomiting, diarrhea).",
      type: 'radio',
      icon: <FileText className="w-6 h-6 text-orange-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'ppeUsed',
      section: 'Personnel & Training',
      question: "What PPE is used?",
      type: 'checkbox',
      icon: <UserCheck className="w-6 h-6 text-green-600" />,
      options: ['Gloves', 'Hairnets', 'Aprons', 'Masks']
    },
    // --- SECTION 14 ---
    {
      id: 'ccpsMonitored',
      section: 'Monitoring & Records',
      question: "Are Critical Control Points (CCPs) monitored?",
      type: 'radio',
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'monitoringFrequency',
      section: 'Monitoring & Records',
      question: "General monitoring frequency?",
      type: 'text',
      icon: <History className="w-6 h-6 text-slate-500" />,
      placeholder: "e.g., Every batch, Twice daily"
    },
    {
      id: 'recordsKept',
      section: 'Monitoring & Records',
      question: "Are records kept?",
      type: 'radio',
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'retentionPeriod',
      section: 'Monitoring & Records',
      question: "Record retention period?",
      description: "How long do you keep records?",
      type: 'text',
      icon: <Calendar className="w-6 h-6 text-slate-500" />,
      placeholder: "e.g., 12 months"
    },
    {
      id: 'recordType',
      section: 'Monitoring & Records',
      question: "Are records digital or paper?",
      type: 'radio',
      icon: <FileDigit className="w-6 h-6 text-purple-500" />,
      options: ['Digital', 'Paper', 'Both']
    },
    // --- SECTION 15 ---
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
      icon: <Lock className="w-6 h-6 text-orange-500" />,
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
    // --- SECTION 16 ---
    {
      id: 'internalAudits',
      section: 'Verification & Validation',
      question: "Are internal audits conducted?",
      type: 'radio',
      icon: <ClipboardCheck className="w-6 h-6 text-emerald-600" />,
      options: ['Yes', 'No']
    },
    {
      id: 'auditFrequency',
      section: 'Verification & Validation',
      question: "Audit frequency?",
      type: 'text',
      icon: <Calendar className="w-6 h-6 text-slate-500" />,
      placeholder: "e.g., Quarterly"
    },
    {
      id: 'externalAudits',
      section: 'Verification & Validation',
      question: "Are external audits conducted?",
      description: "By local authority or third party.",
      type: 'radio',
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'annualReview',
      section: 'Verification & Validation',
      question: "Is the HACCP plan reviewed annually?",
      type: 'radio',
      icon: <RefreshCcw className="w-6 h-6 text-purple-500" />,
      options: ['Yes', 'No']
    },
    {
      id: 'reviewTriggers',
      section: 'Verification & Validation',
      question: "Triggers for HACCP review?",
      type: 'checkbox',
      icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
      options: ['Process change', 'Product change', 'Incident', 'Regulation change']
    },
    // --- SECTION 17 ---
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
    // --- SECTION 18 ---
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
    if (currentQuestionIdx < questions.length - 1) {
      // Skip logic
      const currentQ = questions[currentQuestionIdx];
      
      // Cooking skips
      if (currentQ.id === 'doYouCook' && formData.doYouCook === 'No') {
        const nextIdx = questions.findIndex(q => q.id === 'isFoodCooled');
        setCurrentQuestionIdx(nextIdx);
        return;
      }
      // Cooling skips
      if (currentQ.id === 'isFoodCooled' && formData.isFoodCooled === 'No') {
        const nextIdx = questions.findIndex(q => q.id === 'isReheatingPerformed');
        setCurrentQuestionIdx(nextIdx);
        return;
      }
      // Reheating skips
      if (currentQ.id === 'isReheatingPerformed' && formData.isReheatingPerformed === 'No') {
        const nextIdx = questions.findIndex(q => q.id === 'hotHoldingTemp');
        setCurrentQuestionIdx(nextIdx);
        return;
      }
      // Transport skips
      if (currentQ.id === 'isTransported' && formData.isTransported === 'No') {
        const nextIdx = questions.findIndex(q => q.id === 'keyEquipment');
        setCurrentQuestionIdx(nextIdx);
        return;
      }
      // Calibration skips
      if (currentQ.id === 'devicesCalibrated' && formData.devicesCalibrated === 'No') {
        const nextIdx = questions.findIndex(q => q.id === 'preventiveMaintenance');
        setCurrentQuestionIdx(nextIdx);
        return;
      }
      // Upsell skips (If they say No to review, skip the details)
      if (currentQ.id === 'wantProfessionalReview' && formData.wantProfessionalReview === 'No') {
        // Go straight to generation
        handleGenerate();
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
      // Generate Plan via AI
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
      const analysis: HazardAnalysisItem[] = aiData.analysis;
      setGeneratedAnalysis(analysis);
      setFullPlan(aiData.full_plan);

      // Save to Supabase
      const planData = {
        business_name: formData.businessLegalName,
        business_type: formData.businessType,
        product_name: "HACCP Plan",
        product_description: `HACCP Plan for ${formData.businessLegalName}`,
        storage_type: formData.productCharacteristics.join(', '),
        intended_use: formData.isVulnerable === 'Yes' ? 'Vulnerable Populations' : 'General Consumption',
        process_steps: formData.processSteps.map((name, i) => ({ id: String(i+1), name })),
        hazard_analysis: analysis,
        user_id: userId,
      };

      if (userId) {
        const { data, error } = await supabase
          .from('plans')
          .insert(planData)
          .select()
          .single();
        if (error) console.error("Supabase Save Error:", error);
        else if (data) setPlanId(data.id);
      }
      
      setStep('result');
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to generate your plan. Please try again.');
      setStep('questions');
    }
  };

  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center space-y-8"
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-10 h-10 text-blue-600" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {t('wizard.title')}
              </h1>
              <p className="text-lg text-slate-500 max-w-md mx-auto">
                {t('wizard.subtitle')}
              </p>
            </div>
            <button 
              onClick={() => setStep('questions')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
            >
              {t('wizard.start')}
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-sm text-slate-400">Takes about 5 minutes • Free to draft</p>
          </motion.div>
        )}

        {step === 'questions' && (
          <motion.div 
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl w-full space-y-8"
          >
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">{currentQ.section}</span>
                <span className="text-sm font-medium text-slate-400">{currentQuestionIdx + 1} / {questions.length}</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    {currentQ.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{currentQ.question}</h2>
                </div>
                {currentQ.description && (
                  <p className="text-slate-500 ml-11">{currentQ.description}</p>
                )}
              </div>

              <div className="space-y-4">
                {currentQ.type === 'text' || currentQ.type === 'number' ? (
                  <input 
                    autoFocus
                    type={currentQ.type}
                    value={(formData as any)[currentQ.id]}
                    onChange={(e) => updateFormData(currentQ.id, e.target.value)}
                    placeholder={currentQ.placeholder}
                    className="w-full text-2xl py-4 border-b-2 border-slate-200 focus:border-blue-600 outline-none transition-colors placeholder:text-slate-200"
                    onKeyDown={(e) => e.key === 'Enter' && (formData as any)[currentQ.id] && handleNext()}
                  />
                ) : currentQ.type === 'radio' ? (
                  <div className="grid gap-3">
                    {currentQ.options?.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          updateFormData(currentQ.id, opt);
                          setTimeout(handleNext, 300);
                        }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                          (formData as any)[currentQ.id] === opt 
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-600'
                        }`}
                      >
                        {opt}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          (formData as any)[currentQ.id] === opt ? 'border-blue-600 bg-blue-600' : 'border-slate-200'
                        }`}>
                          {(formData as any)[currentQ.id] === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : currentQ.type === 'list' ? (
                  <div className="space-y-4">
                     <div className="flex gap-2">
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
                         className="flex-1 text-xl py-4 border-b-2 border-slate-200 focus:border-blue-600 outline-none transition-colors"
                       />
                       <button 
                         onClick={() => {
                           if (currentIngredient.trim()) {
                             const list = (formData as any)[currentQ.id] || [];
                             updateFormData(currentQ.id, [...list, currentIngredient.trim()]);
                             setCurrentIngredient('');
                           }
                         }}
                         className="bg-blue-600 text-white rounded-xl px-6 font-bold hover:bg-blue-700 transition-colors"
                       >
                         Add
                       </button>
                     </div>
                     <div className="flex flex-wrap gap-2">
                       {((formData as any)[currentQ.id] || []).map((item: string, idx: number) => (
                         <div key={idx} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full flex items-center gap-2 font-medium">
                           {item}
                           <button 
                             onClick={() => {
                               const list = (formData as any)[currentQ.id].filter((_: string, i: number) => i !== idx);
                               updateFormData(currentQ.id, list);
                             }}
                             className="text-slate-400 hover:text-red-500"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       ))}
                     </div>
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
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' 
                              : 'border-slate-100 hover:border-slate-200 text-slate-600'
                          }`}
                        >
                          {opt}
                          <div className={`w-6 h-6 rounded flex items-center justify-center border-2 ${
                            isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-200'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between pt-4">
                <button 
                  onClick={handleBack}
                  className="text-slate-400 hover:text-slate-600 font-medium flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> {t('wizard.back')}
                </button>
                <button 
                  onClick={handleNext}
                  disabled={currentQ.type !== 'checkbox' && currentQ.type !== 'list' && !(formData as any)[currentQ.id]}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-2"
                >
                  {t('wizard.next')}
                  <ChevronRight className="w-4 h-4" />
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
            className="flex flex-col items-center space-y-8"
          >
            <div className="relative">
              <div className="w-32 h-32 border-8 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Sparkles className="w-12 h-12 text-blue-600 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{t('wizard.generating')}</h2>
              <p className="text-slate-500">{t('wizard.generatingDesc')}</p>
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl w-full space-y-8 pb-20"
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 border-t-8 border-t-green-500">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold">{t('wizard.success')}</h1>
                    <p className="text-slate-500">Full analysis based on your business context.</p>
                  </div>
                  
                  {userId ? (
                    isClient && (
                      <PDFDownloadLink
                        document={
                          <HACCPDocument 
                            data={{
                              businessName: formData.businessLegalName,
                              productName: "Food Safety Plan",
                              productDescription: `HACCP Plan for ${formData.businessType}`,
                              intendedUse: formData.isVulnerable === 'Yes' ? 'Vulnerable Populations' : 'General Consumption',
                              storageType: formData.productCharacteristics.join(', '),
                              analysis: generatedAnalysis,
                              fullPlan: fullPlan
                            }} 
                          />
                        }
                        fileName={`${formData.businessLegalName.replace(/\s+/g, '_')}_HACCP.pdf`}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-500/20"
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
                    <div className="flex flex-col items-center gap-3">
                       <Link 
                        href="/signup" 
                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg"
                      >
                        <Lock className="w-5 h-5" /> Create Account to Download
                      </Link>
                      <p className="text-xs text-slate-400">Join 500+ businesses today</p>
                    </div>
                  )}
               </div>

               {/* Table Preview */}
               <div className="overflow-x-auto border rounded-2xl">
                 <table className="w-full text-sm border-collapse">
                   <thead>
                     <tr className="bg-slate-50">
                       <th className="p-4 text-left border-b">Process Step</th>
                       <th className="p-4 text-left border-b">Hazards</th>
                       <th className="p-4 text-left border-b">CCP?</th>
                       <th className="p-4 text-left border-b">Control Measure</th>
                     </tr>
                   </thead>
                   <tbody>
                     {generatedAnalysis.map((item, idx) => (
                       <tr key={idx} className="hover:bg-slate-50/50">
                         <td className="p-4 border-b font-medium">{item.step_name}</td>
                         <td className="p-4 border-b text-slate-600">{item.hazards}</td>
                         <td className="p-4 border-b">
                           {item.is_ccp ? (
                             <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">YES</span>
                           ) : 'No'}
                         </td>
                         <td className="p-4 border-b text-slate-600 text-xs">{item.control_measure}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
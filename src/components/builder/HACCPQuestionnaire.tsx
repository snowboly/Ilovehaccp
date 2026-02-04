/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { HACCPSectionData } from '@/types/haccp';
import { QuestionCard } from './QuestionCard';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface QuestionnaireProps {
  sectionData: HACCPSectionData;
  onComplete: (data: any) => void;
  initialData?: any;
  additionalContext?: any;
  title?: string;
  description?: string | React.ReactNode;
}

export default function HACCPQuestionnaire({ sectionData, onComplete, initialData, additionalContext, title, description }: QuestionnaireProps) {
  const { language } = useLanguage();
  const copy = QUESTIONNAIRE_COPY[language] ?? QUESTIONNAIRE_COPY.en;
  const [answers, setAnswers] = useState<any>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // TRACKING REF: Prevents scrolling when errors are cleared or updated during typing
  const isSubmittingRef = useRef(false);

  // FIX: Handle Scroll & Focus in useEffect dependent on 'errors'
  useEffect(() => {
    // Only run if we just tried to submit and there are errors
    if (isSubmittingRef.current && Object.keys(errors).length > 0) {
      
      // Small timeout ensures DOM is fully painted with error classes
      const timer = setTimeout(() => {
        const firstErrorElement = document.querySelector('.text-red-500');
        
        if (firstErrorElement) {
          // 1. Scroll into view
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // 2. Attempt to focus the nearest input
          // We look for an input/button inside the closest QuestionCard parent or nearby
          const card = firstErrorElement.closest('.bg-white, .bg-slate-50');
          const input = card?.querySelector('input, button, textarea, select') as HTMLElement;
          if (input) {
            input.focus({ preventScroll: true }); // Prevent fighting with scrollIntoView
          }
        }
      }, 100);

      // Reset submission flag
      isSubmittingRef.current = false;
      return () => clearTimeout(timer);
    }
  }, [errors]);

  // Sync state if initialData changes (e.g. when switching steps in a loop)
  useEffect(() => {
    setAnswers(initialData || {});
  }, [initialData]);

  // MOVED UP: Calculate visible questions first so validate() can use it
  const matchesCondition = (condition: any, values: Record<string, any>) => {
    const parentVal = values[condition.questionId];

    if (condition.includes !== undefined) {
      if (Array.isArray(parentVal)) {
        return parentVal.includes(condition.includes);
      }
      return parentVal === condition.includes;
    }

    if (condition.excludes !== undefined) {
      if (Array.isArray(parentVal)) {
        return parentVal.length > 0 && parentVal.some((item: string) => item !== condition.excludes);
      }
      return parentVal !== condition.excludes;
    }

    const requiredVal = condition.value;
    if (Array.isArray(requiredVal)) {
      return requiredVal.includes(parentVal);
    }
    return parentVal === requiredVal;
  };

  const visibleQuestions = sectionData.questions.filter(q => {
    if (q.show_if) {
      if (Array.isArray(q.show_if?.all)) {
        return q.show_if.all.every((condition: any) => matchesCondition(condition, answers));
      }
      return matchesCondition(q.show_if, answers);
    }
    return true;
  });

  const handleAnswerChange = (id: string, value: any) => {
    setAnswers((prev: any) => ({ ...prev, [id]: value }));
    
    // Clear error if present
    if (errors[id]) {
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // CHANGED: Only validate visible questions
    visibleQuestions.forEach(q => {
      // Logic for group/conditional validation
      if (q.required === true) {
        const val = answers[q.id];
        
        // Basic required check
        if (val === undefined || val === null || val === '') {
             newErrors[q.id] = copy.validation.required;
             isValid = false;
        }
        
        // Array check
        if (Array.isArray(val) && val.length === 0) {
            newErrors[q.id] = copy.validation.selectOne;
            isValid = false;
        }

        // PRP Group check
        if (q.type === 'prp_group') {
            if (!val || typeof val.exists !== 'boolean') {
                newErrors[q.id] = copy.validation.selectYesNo;
                isValid = false;
            }
        }
      }

      // Check for conditional requirement: "when_all_hazards_false"
      if (q.id === 'hazard_identification' && answers[q.id]) {
          const groupAnswers = answers[q.id];
          const hazGroup = q.questions?.find(sq => sq.id === 'no_hazards_justification');

          if (hazGroup && hazGroup.required === 'when_all_hazards_false' && hazGroup.show_if_all_false) {
              const allFalse = hazGroup.show_if_all_false.every((key: string) => groupAnswers[key] === false);
              if (allFalse) {
                  const val = groupAnswers[hazGroup.id];
                  if (!val || val === '') {
                      newErrors[q.id] = copy.validation.noHazardsJustification;
                      isValid = false;
                  }
              }
          }
      }

      // Validate process_control_description when Process control is selected (group_per_hazard)
      if (q.id === 'control_measures' && q.type === 'group_per_hazard' && answers[q.id]) {
          const controlMeasuresData = answers[q.id];
          // controlMeasuresData is keyed by hazard type: { bio: {...}, chem: {...}, etc. }
          const hazardTypes = ['bio', 'chem', 'phys', 'allergen'];

          for (const hazType of hazardTypes) {
              const hazardData = controlMeasuresData[hazType];
              if (hazardData) {
                  const appliedControls = hazardData.applied_controls || [];
                  const hasProcessControl = Array.isArray(appliedControls) &&
                      appliedControls.some((c: string) => c.toLowerCase().includes('process control'));

                  if (hasProcessControl) {
                      const description = hazardData.process_control_description;
                      if (!description || description.trim() === '') {
                          const hazardLabel = copy.hazardLabels[hazType as keyof typeof copy.hazardLabels];
                          newErrors[q.id] = copy.validation.processControlRequired.replace('{{hazard}}', hazardLabel);
                          isValid = false;
                          break; // Report first error only
                      }
                  }
              }
          }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    isSubmittingRef.current = true; // Mark intent
    
    if (validate()) {
      isSubmittingRef.current = false; // Valid, so no need to scroll
      onComplete(answers);
    } 
    // If invalid, validate() has called setErrors(), triggering the useEffect above
  };

  const getTitle = (section: string) => {
    return copy.sectionTitles[section] || section;
  };

  const checkIngredientVagueness = (val: string) => {
      if (!val || val.length < 3) return null; // Too short to judge or empty
      if (val.length < 20) return "limited";
      if (val.match(/\b(various|mixed|etc|misc|assorted|generic)\b/i)) return "generic";
      return null;
  };

  const getDynamicWarning = (qId: string, val: any) => {
      if (qId === 'key_ingredients' && typeof val === 'string') {
          const issue = checkIngredientVagueness(val);
          if (issue) {
              return {
                  level: 'assumption' as const,
                  text: copy.warnings.ingredientDetail
              };
          }
      }
      if (qId === 'shelf_life_basis' && (val === 'Assumption (not validated)' || val === 'Suposição (não validada)' || val === 'Suposición (no validada)' || val === 'Hypothèse (non validée)')) {
          return {
              level: 'risk' as const,
              text: copy.warnings.shelfLife
          };
      }

      // High Risk RTE Check
      if (qId === 'cooking_required' || qId === 'storage_conditions') {
          const cooking = qId === 'cooking_required' ? val : answers['cooking_required'];
          const storage = qId === 'storage_conditions' ? val : answers['storage_conditions'];
          
          const isRTE = cooking && (
              cooking.includes('Ready-to-eat') || 
              cooking.includes('Pronto a comer') || 
              cooking.includes('Listo para comer') || 
              cooking.includes('Prêt à consommer')
          );
          
          const isCold = storage && (
              storage.includes('Refrigerated') || storage.includes('Frozen') ||
              storage.includes('Refrigerado') || storage.includes('Congelado') ||
              storage.includes('Réfrigéré') || storage.includes('Congelé')
          );

          if (isRTE && isCold) {
              return {
                  level: 'risk' as const,
                  text: copy.warnings.highRiskRte
              };
          }
      }

      if (qId === 'intended_consumer_group' && (
          val === 'Vulnerable consumers (e.g. infants, elderly, immunocompromised)' ||
          val === 'Mixed consumer groups' ||
          val === 'Consumidores vulneráveis (ex: bebés, idosos, imunocomprometidos)' ||
          val === 'Grupos de consumidores mistos' ||
          val === 'Consumidores vulnerables (ej: lactantes, ancianos, inmunodeprimidos)' ||
          val === 'Consommateurs vulnérables (ex: nourrissons, personnes âgées, immunodéprimés)'
      )) {
          return {
              level: 'risk' as const,
              text: copy.warnings.vulnerableConsumers
          };
      }

      if (qId === 'foreseeable_misuse' && val && (
          val.includes('Possible misuse') ||
          val.includes('Possível mau uso') ||
          val.includes('Posible mal uso') ||
          val.includes('Mauvais usage possible')
      )) {
          return {
              level: 'assumption' as const,
              text: copy.warnings.misuse
          };
      }

      return undefined;
  };

  const fullContext = { ...answers, ...additionalContext };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2 mb-10">
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            {sectionData.section}
        </span>
        <h2 className="text-3xl font-black text-slate-900">
            {title || getTitle(sectionData.section)}
        </h2>
        <div className="text-slate-500 font-medium">
            {description || copy.descriptionFallback}
        </div>
      </div>

      <div className="space-y-6">
        {visibleQuestions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            value={answers[q.id]}
            onChange={handleAnswerChange}
            error={errors[q.id]}
            context={fullContext} 
            customWarning={getDynamicWarning(q.id, answers[q.id])}
          />
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 p-4 flex justify-center z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
            Next Section <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

const QUESTIONNAIRE_COPY: Record<string, {
  validation: {
    required: string;
    selectOne: string;
    selectYesNo: string;
    noHazardsJustification: string;
    processControlRequired: string;
  };
  hazardLabels: {
    bio: string;
    chem: string;
    phys: string;
    allergen: string;
  };
  sectionTitles: Record<string, string>;
  warnings: {
    ingredientDetail: string;
    shelfLife: string;
    highRiskRte: string;
    vulnerableConsumers: string;
    misuse: string;
  };
  descriptionFallback: string;
}> = {
  en: {
    validation: {
      required: 'This field is required.',
      selectOne: 'Please select at least one option.',
      selectYesNo: 'Please select Yes or No.',
      noHazardsJustification: 'Please provide justification for no hazards.',
      processControlRequired: 'Process control description is required for {{hazard}} hazard when Process control is selected.'
    },
    hazardLabels: {
      bio: 'Biological',
      chem: 'Chemical',
      phys: 'Physical',
      allergen: 'Allergen'
    },
    sectionTitles: {
      'Product Description': 'Describe Your Product',
      'Process Flow': 'Map Your Process',
      'Prerequisite Programs': 'Establish Prerequisites',
      'Hazard Analysis': 'Analyze Hazards',
      'CCP Determination': 'Identify Critical Points',
      'CCP Management': 'Manage Critical Points',
      'Verification, Validation, Review & Records': 'Verify & Validate'
    },
    warnings: {
      ingredientDetail: 'Hazard identification relies on the ingredients declared. Limited detail may result in missing hazards.',
      shelfLife: 'Shelf life has not been validated. Use of this HACCP draft without validation may result in unsafe food.',
      highRiskRte: 'High Risk — Chilled / Frozen Ready-to-Eat Product. These products are commonly associated with serious microbiological hazards (e.g. Listeria). Enhanced controls and validation are typically required.',
      vulnerableConsumers: 'Products intended for vulnerable consumers may require additional controls, validation, and regulatory oversight.',
      misuse: 'Increased Risk — Foreseeable Misuse. Misuse scenarios must be considered during hazard analysis.'
    },
    descriptionFallback: 'Please answer accurately to ensure compliance.'
  },



  de: {
    validation: {
      required: 'Dieses Feld ist erforderlich.',
      selectOne: 'Bitte mindestens eine Option auswählen.',
      selectYesNo: 'Bitte Ja oder Nein auswählen.',
      noHazardsJustification: 'Bitte begründen, warum keine Gefahren vorliegen.',
      processControlRequired: 'Eine Prozesskontrollbeschreibung ist für die Gefahr {{hazard}} erforderlich, wenn Prozesskontrolle gewählt ist.'
    },
    hazardLabels: {
      bio: 'Biologisch',
      chem: 'Chemisch',
      phys: 'Physikalisch',
      allergen: 'Allergen'
    },
    sectionTitles: {
      'Product Description': 'Beschreiben Sie Ihr Produkt',
      'Process Flow': 'Prozess abbilden',
      'Prerequisite Programs': 'Voraussetzungen festlegen',
      'Hazard Analysis': 'Gefahrenanalyse',
      'CCP Determination': 'CCPs bestimmen',
      'CCP Management': 'CCPs steuern',
      'Verification, Validation, Review & Records': 'Verifizieren & validieren'
    },
    warnings: {
      ingredientDetail: 'Die Gefahrenidentifikation basiert auf den angegebenen Zutaten. Zu wenig Details können Gefahren übersehen.',
      shelfLife: 'Die Haltbarkeit wurde nicht validiert. Nutzung dieses Entwurfs ohne Validierung kann unsicher sein.',
      highRiskRte: 'Hohes Risiko — gekühltes/gefrorenes verzehrfertiges Produkt. Häufige mikrobiologische Risiken (z. B. Listeria).',
      vulnerableConsumers: 'Produkte für vulnerable Verbraucher erfordern ggf. zusätzliche Kontrollen und Validierung.',
      misuse: 'Erhöhtes Risiko — vorhersehbarer Fehlgebrauch. Muss in der Gefahrenanalyse berücksichtigt werden.'
    },
    descriptionFallback: 'Bitte beantworten Sie die Fragen sorgfältig zur Einhaltung der Vorschriften.'
  },
  it: {
    validation: {
      required: 'Questo campo è obbligatorio.',
      selectOne: 'Seleziona almeno un’opzione.',
      selectYesNo: 'Seleziona Sì o No.',
      noHazardsJustification: 'Fornisci una giustificazione per l’assenza di pericoli.',
      processControlRequired: 'La descrizione del controllo di processo è obbligatoria per il pericolo {{hazard}} quando è selezionato il controllo di processo.'
    },
    hazardLabels: {
      bio: 'Biologico',
      chem: 'Chimico',
      phys: 'Fisico',
      allergen: 'Allergene'
    },
    sectionTitles: {
      'Product Description': 'Descrivi il prodotto',
      'Process Flow': 'Mappa il processo',
      'Prerequisite Programs': 'Stabilisci i prerequisiti',
      'Hazard Analysis': 'Analizza i pericoli',
      'CCP Determination': 'Identifica i punti critici',
      'CCP Management': 'Gestisci i punti critici',
      'Verification, Validation, Review & Records': 'Verifica e valida'
    },
    warnings: {
      ingredientDetail: 'L’identificazione dei pericoli dipende dagli ingredienti dichiarati. Pochi dettagli possono omettere pericoli.',
      shelfLife: 'La shelf life non è stata validata. Usare questa bozza senza validazione può essere rischioso.',
      highRiskRte: 'Alto rischio — prodotto pronto al consumo refrigerato/congelato. Rischi microbiologici seri (ad esempio Listeria).',
      vulnerableConsumers: 'Prodotti per consumatori vulnerabili possono richiedere controlli e validazioni aggiuntive.',
      misuse: 'Rischio aumentato — uso improprio prevedibile. Da considerare nell’analisi dei pericoli.'
    },
    descriptionFallback: 'Rispondi con precisione per garantire la conformità.'
  },
  lt: {
    validation: {
      required: 'Šis laukas privalomas.',
      selectOne: 'Pasirinkite bent vieną parinktį.',
      selectYesNo: 'Pasirinkite Taip arba Ne.',
      noHazardsJustification: 'Pateikite paaiškinimą, jei pavojų nėra.',
      processControlRequired: 'Proceso kontrolės aprašymas privalomas, kai pasirinktas {{hazard}} pavojus ir proceso kontrolė.'
    },
    hazardLabels: {
      bio: 'Biologinis',
      chem: 'Cheminis',
      phys: 'Fizinis',
      allergen: 'Alergenas'
    },
    sectionTitles: {
      'Product Description': 'Aprašykite produktą',
      'Process Flow': 'Nubraižykite procesą',
      'Prerequisite Programs': 'Nustatykite išankstines programas',
      'Hazard Analysis': 'Analizuokite pavojus',
      'CCP Determination': 'Nustatykite CCP',
      'CCP Management': 'Valdykite CCP',
      'Verification, Validation, Review & Records': 'Tikrinkite ir validuokite'
    },
    warnings: {
      ingredientDetail: 'Pavojų identifikavimas priklauso nuo deklaruotų ingredientų. Trūkstant detalių, gali būti praleisti pavojai.',
      shelfLife: 'Tinkamumo laikas nebuvo validuotas. Naudojant šį juodraštį be validavimo, gali kilti rizika.',
      highRiskRte: 'Didelė rizika — atšaldytas/šaldytas paruoštas vartoti produktas. Dažnai siejamas su rimtais mikrobiologiniais pavojais.',
      vulnerableConsumers: 'Produktams, skirtiems pažeidžiamiems vartotojams, gali reikėti papildomų kontrolės priemonių.',
      misuse: 'Padidėjusi rizika — numatomas netinkamas naudojimas. Tai turi būti įvertinta pavojų analizėje.'
    },
    descriptionFallback: 'Atsakykite tiksliai, kad užtikrintumėte atitiktį.'
  }
};

"use client";

import React, { useState, useEffect } from 'react';
import { HACCPSectionData } from '@/types/haccp';
import { QuestionCard } from './QuestionCard';
import { ChevronRight } from 'lucide-react';

interface QuestionnaireProps {
  sectionData: HACCPSectionData;
  onComplete: (data: any) => void;
  initialData?: any;
  additionalContext?: any;
}

export default function HACCPQuestionnaire({ sectionData, onComplete, initialData, additionalContext }: QuestionnaireProps) {
  const [answers, setAnswers] = useState<any>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state if initialData changes (e.g. when switching steps in a loop)
  useEffect(() => {
    setAnswers(initialData || {});
  }, [initialData]);

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

    sectionData.questions.forEach(q => {
      // Logic for group/conditional validation could be expanded here
      if (q.required === true) {
        const val = answers[q.id];
        
        // Basic required check
        if (val === undefined || val === null || val === '') {
             newErrors[q.id] = "This field is required.";
             isValid = false;
        }
        
        // Array check
        if (Array.isArray(val) && val.length === 0) {
            newErrors[q.id] = "Please select at least one option.";
            isValid = false;
        }

        // PRP Group check
        if (q.type === 'prp_group') {
            if (!val || typeof val.exists !== 'boolean') {
                newErrors[q.id] = "Please select Yes or No.";
                isValid = false;
            }
        }
      }

      // Check for conditional requirement: "when_all_hazards_false"
      if (q.id === 'hazard_identification' && answers[q.id]) {
          const groupAnswers = answers[q.id];
          const hazGroup = q.questions?.find(sq => sq.id === 'no_hazards_justification');
          
          if (hazGroup && hazGroup.required === 'when_all_hazards_false' && hazGroup.show_if_all_false) {
              const allFalse = hazGroup.show_if_all_false.every(key => groupAnswers[key] === false);
              if (allFalse) {
                  const val = groupAnswers[hazGroup.id];
                  if (!val || val === '') {
                      // We need to set error on the group or specific field? 
                      // HACCPQuestionnaire handles top-level errors. 
                      // But hazard_identification is a group. 
                      // The error needs to be propagated or handled in QuestionCard.
                      // Current architecture doesn't easily support deep validation errors from top level
                      // UNLESS we flatten keys or QuestionCard handles validation.
                      // For now, let's mark the group as invalid or handle it specially.
                      // Actually, QuestionCard takes `error`.
                      // But the error key matches the top question ID.
                      // I'll stick to top-level validation if possible, but here it's nested.
                      
                      // WORKAROUND: Pass error to the group ID, but formatted?
                      // Or rely on QuestionCard to show it.
                      // Let's set it on the group ID for now.
                      newErrors[q.id] = "Please provide justification for no hazards.";
                      isValid = false;
                  }
              }
          }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      onComplete(answers);
    } else {
        // Scroll to first error
        const firstError = document.querySelector('.text-red-500');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getTitle = (section: string) => {
    const map: Record<string, string> = {
      'Product Description': 'Describe Your Product',
      'Process Flow': 'Map Your Process',
      'Prerequisite Programs': 'Establish Prerequisites',
      'Hazard Analysis': 'Analyze Hazards',
      'CCP Determination': 'Identify Critical Points',
      'CCP Management': 'Manage Critical Points',
      'Verification, Validation, Review & Records': 'Verify & Validate'
    };
    return map[section] || section;
  };

  const fullContext = { ...answers, ...additionalContext };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2 mb-10">
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            {sectionData.section}
        </span>
        <h2 className="text-3xl font-black text-slate-900">
            {getTitle(sectionData.section)}
        </h2>
        <p className="text-slate-500 font-medium">Please answer accurately to ensure compliance.</p>
      </div>

      <div className="space-y-6">
        {sectionData.questions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            value={answers[q.id]}
            onChange={handleAnswerChange}
            error={errors[q.id]}
            context={fullContext} // Pass full section context for smart suggestions
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

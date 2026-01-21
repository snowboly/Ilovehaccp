import React, { useState } from 'react';
import { HACCPQuestion, QuestionType } from '@/types/haccp';
import { Tooltip } from '@/components/ui/Tooltip';
import { createClient } from '@/utils/supabase/client';
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  X,
  UploadCloud,
  Loader2,
  Info,
  AlertTriangle,
  AlertOctagon
} from 'lucide-react';

interface QuestionCardProps {
  question: HACCPQuestion;
  value: any;
  onChange: (id: string, value: any) => void;
  error?: string;
  context?: any;
  customWarning?: { level: 'info' | 'assumption' | 'risk', text: string };
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, value, onChange, error, context, customWarning }) => {
  const supabase = createClient();
  const [isUploading, setIsUploading] = useState(false);
  
  const renderDescription = () => {
    // Priority: Custom Warning > Static Warning > Static Description
    const activeWarning = customWarning || (question.warningLevel ? { level: question.warningLevel, text: question.description || '' } : null);

    if (activeWarning) {
        const styles = {
            info: "bg-emerald-50 text-emerald-800 border-emerald-200",
            assumption: "bg-amber-50 text-amber-800 border-amber-200",
            risk: "bg-red-50 text-red-800 border-red-200"
        };

        const icons = {
            info: <Info className="w-5 h-5 shrink-0 text-emerald-600" />,
            assumption: <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />,
            risk: <AlertOctagon className="w-5 h-5 shrink-0 text-red-600" />
        };

        const titles = {
            info: "Informational",
            assumption: "Assumption / Increased Risk",
            risk: "High Risk / Auditor Attention"
        };

        return (
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${styles[activeWarning.level]} mt-2 animate-in fade-in slide-in-from-top-2`}>
                 {icons[activeWarning.level]}
                 <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider opacity-80">
                        {titles[activeWarning.level]}
                    </p>
                    <div className="text-sm font-medium leading-relaxed opacity-90">
                        {activeWarning.text}
                    </div>
                 </div>
            </div>
        );
    }

    if (question.description) {
        return <p className="text-slate-500 text-sm font-medium">{question.description}</p>;
    }

    return null;
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const file = e.target.files[0];
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
        alert("Logo must be smaller than 2MB.");
        setIsUploading(false);
        return;
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
        const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(filePath, file);

        if (uploadError) {
            console.error(uploadError);
            alert(uploadError.message || "Upload failed. Please try again.");
            return;
        }

        const { data } = supabase.storage.from('logos').getPublicUrl(filePath);
        onChange(question.id, data.publicUrl);
    } catch (err) {
        console.error(err);
        alert("An unexpected error occurred during upload.");
    } finally {
        setIsUploading(false);
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'file_upload':
        return (
            <div className="space-y-4">
                {value ? (
                    <div className="relative w-full max-w-xs aspect-square rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-50 group">
                        <img src={value} alt="Uploaded logo" className="w-full h-full object-contain p-4" />
                        <button
                            onClick={() => onChange(question.id, null)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                        <input 
                            type="file" 
                            accept="image/png, image/jpeg" 
                            onChange={handleFileUpload} 
                            disabled={isUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            ) : (
                                <UploadCloud className="w-8 h-8 text-slate-400" />
                            )}
                            <span className="font-bold text-sm">
                                {isUploading ? "Uploading..." : "Click to upload logo (PNG/JPG)"}
                            </span>
                            <span className="text-xs text-slate-400">Max 2MB. Optional.</span>
                        </div>
                    </div>
                )}
            </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(question.id, e.target.value)}
            className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-blue-600 outline-none font-bold text-slate-700 transition-colors"
            placeholder={question.placeholder || "Type your answer here..."}
          />
        );
      
      case 'multiline_text':
        // SMART INGREDIENT LISTS
        const lists = {
            bakery: ["Flour", "Yeast", "Sugar", "Butter", "Eggs", "Milk", "Water", "Salt", "Seeds", "Jam", "Cream", "Chocolate"],
            meat: ["Beef", "Pork", "Chicken", "Lamb", "Salt", "Spices", "Marinade", "Sausage Casing", "Preservatives", "Breadcrumbs"],
            pizza: ["Flour", "Yeast", "Tomato Sauce", "Mozzarella", "Basil", "Olive Oil", "Pepperoni", "Ham", "Mushrooms", "Onions"],
            dairy: ["Milk", "Cream", "Cultures", "Sugar", "Fruit", "Stabilizers", "Flavorings"],
            default: ["Flour", "Sugar", "Eggs", "Milk", "Butter", "Chicken", "Beef", "Pork", "Fish", "Salt", "Pepper", "Water", "Oil", "Yeast"]
        };

        let activeList = lists.default;
        const pName = context?.product_name?.toLowerCase() || '';

        if (pName.match(/bread|cake|pastry|muffin|bagel|dough|bun|roll|croissant/)) activeList = lists.bakery;
        else if (pName.match(/sausage|burger|meat|steak|pork|beef|chicken|lamb|kebab/)) activeList = lists.meat;
        else if (pName.match(/pizza|calzone|focaccia/)) activeList = lists.pizza;
        else if (pName.match(/yogurt|cheese|milk|cream|ice cream/)) activeList = lists.dairy;

        return (
          <div className="space-y-3">
            <textarea
                value={value || ''}
                onChange={(e) => onChange(question.id, e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-blue-600 outline-none font-bold text-slate-700 min-h-[120px] transition-colors resize-y"
                placeholder={question.placeholder || "Enter details..."}
            />
            {question.id === 'key_ingredients' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Suggested for {pName ? `"${context.product_name}"` : "Product"}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {activeList.map(ing => (
                            <button
                                key={ing}
                                onClick={() => {
                                    const current = value || '';
                                    const newValue = current ? `${current}, ${ing}` : ing;
                                    onChange(question.id, newValue);
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-bold rounded-lg border border-slate-200 hover:border-blue-200 transition-all cursor-pointer"
                            >
                                + {ing}
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div className="flex gap-4">
            <button
              onClick={() => onChange(question.id, true)}
              className={`flex-1 p-4 rounded-xl border-2 font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                value === true 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" /> Yes
            </button>
            <button
              onClick={() => onChange(question.id, false)}
              className={`flex-1 p-4 rounded-xl border-2 font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                value === false 
                  ? 'border-red-500 bg-red-50 text-red-700' 
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <X className="w-5 h-5" /> No
            </button>
          </div>
        );

      case 'single_select':
        return (
          <div className="grid gap-2">
            {question.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => onChange(question.id, opt)}
                className={`w-full text-left p-4 rounded-xl border-2 font-bold transition-all flex justify-between items-center cursor-pointer ${
                  value === opt 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 text-slate-600 hover:border-blue-200'
                }`}
              >
                {opt}
                {value === opt && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              </button>
            ))}
          </div>
        );

      case 'multi_select':
        const selected = Array.isArray(value) ? value : [];
        return (
          <div className="grid gap-2">
            {question.options?.map((opt) => {
              const isSelected = selected.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => {
                    if (opt === 'None') {
                        onChange(question.id, isSelected ? [] : ['None']);
                    } else {
                        const newSelection = isSelected 
                            ? selected.filter((s: string) => s !== opt)
                            : [...selected.filter((s: string) => s !== 'None'), opt];
                        onChange(question.id, newSelection);
                    }
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 font-bold transition-all flex justify-between items-center cursor-pointer ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-slate-200 text-slate-600 hover:border-blue-200'
                  }`}
                >
                  {opt}
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </button>
              );
            })}
          </div>
        );

      case 'repeatable_list':
        const items = Array.isArray(value) ? value : [];
        const commonProcessSteps = [
            "Goods Receiving",
            "Ambient Storage",
            "Chilled Storage",
            "Frozen Storage",
            "Defrosting",
            "Preparation (Raw)",
            "Preparation (RTE)",
            "Cooking / Heat Treatment",
            "Cooling",
            "Reheating",
            "Hot Holding",
            "Cold Display",
            "Packaging / Labelling",
            "Distribution / Sale"
        ];

        const criticalSteps = ["Chilled Storage", "Frozen Storage", "Defrosting", "Cooking / Heat Treatment", "Cooling", "Reheating", "Hot Holding", "Cold Display"];

        const addItem = (prefillName?: string) => {
            const newItem: any = { step_id: crypto.randomUUID() };
            question.item_schema?.fields.forEach(f => {
                if(f.type !== 'hidden_auto_id') newItem[f.id] = f.id === 'step_name' && prefillName ? prefillName : '';
            });
            onChange(question.id, [...items, newItem]);
        };

        return (
          <div className="space-y-4">
            {items.map((item: any, idx: number) => {
                // Determine if this is a "Process Step" row to apply special logic
                const isProcessStep = question.id === 'process_steps';
                const isCritical = isProcessStep && criticalSteps.some(cs => item.step_name === cs);

                return (
                  <div key={idx} className={`p-4 rounded-xl border relative group animate-in fade-in slide-in-from-top-2 ${isCritical ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                    <button
                        onClick={() => {
                            const newItems = [...items];
                            newItems.splice(idx, 1);
                            onChange(question.id, newItems);
                        }}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="space-y-3">
                        {isProcessStep ? (
                            // CUSTOM RENDERER FOR PROCESS STEPS
                            <>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Step Name / Type</label>
                                    <div className="relative">
                                        <select
                                            value={commonProcessSteps.includes(item.step_name) ? item.step_name : "Other"}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const newItems = [...items];
                                                if (val === "Other") {
                                                    newItems[idx] = { ...newItems[idx], step_name: "" }; // Clear to allow typing
                                                } else {
                                                    newItems[idx] = { ...newItems[idx], step_name: val };
                                                }
                                                onChange(question.id, newItems);
                                            }}
                                            className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold bg-white mb-2"
                                        >
                                            <option value="" disabled>Select Step Type</option>
                                            {commonProcessSteps.map(s => <option key={s} value={s}>{s}</option>)}
                                            <option value="Other">Other (Custom)</option>
                                        </select>
                                        {(!commonProcessSteps.includes(item.step_name) && item.step_name !== "" && !commonProcessSteps.includes("Other")) && (
                                            // Handle case where existing data might be custom
                                            <div className="mb-2">
                                                <input
                                                    type="text"
                                                    value={item.step_name}
                                                    onChange={(e) => {
                                                        const newItems = [...items];
                                                        newItems[idx] = { ...newItems[idx], step_name: e.target.value };
                                                        onChange(question.id, newItems);
                                                    }}
                                                    placeholder="Enter custom step name..."
                                                    className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold"
                                                />
                                            </div>
                                        )}
                                        {/* If "Other" selected or empty (and not in list), show text input */}
                                        {(!commonProcessSteps.includes(item.step_name)) && (
                                             <input
                                                type="text"
                                                value={item.step_name}
                                                onChange={(e) => {
                                                    const newItems = [...items];
                                                    newItems[idx] = { ...newItems[idx], step_name: e.target.value };
                                                    onChange(question.id, newItems);
                                                }}
                                                placeholder="Type step name..."
                                                className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className={`text-xs font-bold uppercase mb-1 block flex items-center gap-2 ${isCritical ? 'text-amber-600' : 'text-slate-400'}`}>
                                        {isCritical ? <><AlertTriangle className="w-3 h-3" /> Critical Parameters (Required)</> : "Description / Parameters (Optional)"}
                                    </label>
                                    <input
                                        type="text"
                                        value={item.step_description || ''}
                                        onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[idx] = { ...newItems[idx], step_description: e.target.value };
                                            onChange(question.id, newItems);
                                        }}
                                        className={`w-full p-2 rounded-lg border text-sm font-bold ${isCritical ? 'border-amber-300 bg-amber-50 focus:border-amber-500' : 'border-slate-200'}`}
                                        placeholder={isCritical ? "e.g. 75°C for 2 mins, <5°C" : "e.g. Visual check"}
                                    />
                                </div>
                            </>
                        ) : (
                            // STANDARD RENDERER
                            question.item_schema?.fields.map(field => {
                                if (field.type === 'hidden_auto_id') return null;
                                return (
                                    <div key={field.id}>
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{field.text}</label>
                                        <input
                                            type="text"
                                            value={item[field.id] || ''}
                                            onChange={(e) => {
                                                const newItems = [...items];
                                                newItems[idx] = { ...newItems[idx], [field.id]: e.target.value };
                                                onChange(question.id, newItems);
                                            }}
                                            className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold"
                                        />
                                    </div>
                                );
                            })
                        )}
                    </div>
                  </div>
                );
            })}
            
            <button
                onClick={() => addItem()}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
                <Plus className="w-5 h-5" /> Add Step
            </button>
          </div>
        );
        
      case 'prp_group':
        // Simplified rendering for PRP groups (exists/documented/ref)
        const prpData = value || {}; // Default to empty object to avoid pre-selecting 'No'
        return (
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="font-bold text-slate-700">Does this PRP exist?</span>
                        {question.tooltip && <Tooltip text={question.tooltip} />}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => onChange(question.id, { ...prpData, exists: true })} className={`px-4 py-2 rounded-lg font-bold text-sm border ${prpData.exists === true ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white border-slate-200'}`}>Yes</button>
                        <button onClick={() => onChange(question.id, { ...prpData, exists: false })} className={`px-4 py-2 rounded-lg font-bold text-sm border ${prpData.exists === false ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white border-slate-200'}`}>No</button>
                    </div>
                </div>
                {prpData.exists === true && (
                    <div className="space-y-3 pt-3 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 text-sm">Is it documented?</span>
                            <div className="flex gap-2">
                                <button onClick={() => onChange(question.id, { ...prpData, documented: true })} className={`px-3 py-1.5 rounded-lg font-bold text-xs border ${prpData.documented === true ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white border-slate-200'}`}>Yes</button>
                                <button onClick={() => onChange(question.id, { ...prpData, documented: false })} className={`px-3 py-1.5 rounded-lg font-bold text-xs border ${prpData.documented === false ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white border-slate-200'}`}>No</button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Reference Document (Optional)</label>
                            <input 
                                type="text" 
                                value={prpData.reference || ''} 
                                onChange={(e) => onChange(question.id, { ...prpData, reference: e.target.value })}
                                className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                                placeholder="e.g. SOP-001"
                            />
                        </div>
                    </div>
                )}
            </div>
        );

      case 'group':
        return (
            <div className="space-y-6">
                {question.questions?.map(subQ => {
                    // Logic to hide "No Hazards Justification" if hazards are present
                    if (subQ.show_if_all_false) {
                         const allFalse = subQ.show_if_all_false.every(key => value?.[key] === false);
                         if (!allFalse) return null;
                    }

                    return (
                        <div key={subQ.id} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                            <QuestionCard 
                                question={subQ} 
                                value={value?.[subQ.id]} 
                                onChange={(id, val) => onChange(question.id, { ...value, [id]: val })}
                            />
                        </div>
                    );
                })}
            </div>
        );

      case 'group_per_hazard':
        // Determine identified hazards from context
        const ident = context?.hazard_identification || {};
        const activeHazards = [];
        if (ident.bio_hazards) activeHazards.push({ id: 'bio', name: 'Biological Hazard' });
        if (ident.chem_hazards) activeHazards.push({ id: 'chem', name: 'Chemical Hazard' });
        if (ident.phys_hazards) activeHazards.push({ id: 'phys', name: 'Physical Hazard' });
        if (ident.allergen_hazards) activeHazards.push({ id: 'allergen', name: 'Allergen Hazard' });

        if (activeHazards.length === 0) return <div className="text-slate-400 italic p-4 bg-slate-50 rounded-xl">No hazards identified in previous step.</div>;

        return (
            <div className="space-y-8">
                {activeHazards.map(haz => (
                    <div key={haz.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200">
                            <span className={`w-3 h-3 rounded-full ${
                                haz.id === 'bio' ? 'bg-red-500' : 
                                haz.id === 'chem' ? 'bg-yellow-500' : 
                                haz.id === 'phys' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}></span>
                            <div className="flex flex-col">
                                <h4 className="font-black text-slate-700 uppercase tracking-widest text-sm">
                                    {haz.name} Evaluation
                                </h4>
                                {context?.step_name && (
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                        at {context.step_name}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-6">
                            {question.questions?.map(subQ => (
                                <div key={`${haz.id}_${subQ.id}`} className="border-t border-slate-200 pt-4 first:border-0 first:pt-0">
                                    <QuestionCard 
                                        question={subQ} 
                                        value={value?.[haz.id]?.[subQ.id]} 
                                        onChange={(id, val) => {
                                            const hazardValues = value?.[haz.id] || {};
                                            onChange(question.id, { 
                                                ...value, 
                                                [haz.id]: { ...hazardValues, [id]: val } 
                                            });
                                        }}
                                        context={context} // Pass context down recursively
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );

      default:
        return <p className="text-red-500">Unsupported input type: {question.type}</p>;
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="w-full">
            <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-black text-slate-900 leading-tight">{question.text}</h3>
                {question.tooltip && <Tooltip text={question.tooltip} />}
            </div>
            {renderDescription()}
        </div>
        {question.required && (
            <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shrink-0">Required</span>
        )}
      </div>

      <div className="pt-2">
        {renderInput()}
      </div>

      {/* Conditional Sub-questions */}
      {question.conditional_questions && value === true && (
          <div className="pl-6 border-l-4 border-blue-100 space-y-4 mt-4 animate-in fade-in slide-in-from-top-4">
              {question.conditional_questions.map(subQ => (
                  <div key={subQ.id}>
                      <div className="flex items-center gap-2 mb-2">
                          <label className="block font-bold text-slate-700">{subQ.text}</label>
                          {/* We assume conditional questions can't have tooltips for now, or we extend the interface */}
                      </div>
                      {subQ.type === 'text' && (
                           <input
                            type="text"
                            // Note: This needs complex state handling in parent to merge nested keys. 
                            // For simplicity, we might store this in a separate key or a nested object in the parent value.
                            // Assuming parent handles flattened keys or nested objects based on ID.
                            // Here we just emit a key like "parentID_subID" or leave it to parent logic.
                            onChange={(e) => onChange(`${question.id}_${subQ.id}`, e.target.value)} 
                            className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-600 outline-none font-bold text-sm"
                          />
                      )}
                  </div>
              ))}
          </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-bold animate-pulse">
            <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
    </div>
  );
};

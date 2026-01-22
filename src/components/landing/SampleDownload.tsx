"use client";

import { useEffect, useState } from 'react';

const sampleData = {
  businessName: "The Artisanal Bakery",
  productName: "Sourdough Breads & Pastries",
  productDescription: "Traditional fermented sourdough breads and fresh cream-filled pastries.",
  intendedUse: "General Public including vulnerable groups (children/elderly)",
  storageType: "Ambient and Refrigerated (< 5°C)",
  analysis: [
    { step_name: "Receiving", hazards: "Biological: Pathogens on raw eggs. Physical: Pests.", is_ccp: false, control_measure: "Check supplier logs & packaging integrity." },
    { step_name: "Cold Storage", hazards: "Biological: Growth of Listeria.", is_ccp: true, control_measure: "Daily temperature logs (< 5°C).", critical_limit: "< 5°C" },
    { step_name: "Baking", hazards: "Biological: Survival of pathogens.", is_ccp: true, control_measure: "Check internal temp > 90°C.", critical_limit: "> 90°C" },
    { step_name: "Cooling", hazards: "Biological: Spore germination.", is_ccp: true, control_measure: "Cool to < 10°C in < 2 hours.", critical_limit: "< 2 hours" }
  ],
  fullPlan: {
    executive_summary: "A comprehensive food safety management system for a boutique bakery facility focusing on high-hydration sourdough and cream-based products.",
    prerequisite_programs: [
      { program: "Personal Hygiene", details: "Strict handwashing protocols and protective clothing requirements for all handlers." },
      { program: "Cleaning & Sanitation", details: "Daily deep clean of contact surfaces using food-grade degreasers and sanitizers." },
      { program: "Pest Control", details: "Monthly professional inspection and integrated bait station monitoring." }
    ],
    process_flow_narrative: "Raw materials are received and inspected before storage. Dough is mixed, fermented, and baked to specific core temperatures. Products are cooled rapidly before dispatch.",
    hazard_analysis: [], // Analysis is handled in the top-level property
    ccp_summary: [
        { ccp_step: "Baking", hazard: "Pathogen survival", critical_limit: "90°C internal", monitoring: "Probe core of largest loaf every batch", corrective_action: "Continue baking until target reached" },
        { ccp_step: "Cold Storage", hazard: "Bacterial growth", critical_limit: "< 5°C", monitoring: "Twice daily digital thermometer check", corrective_action: "Move to backup fridge; discard if > 2 hours" }
    ]
  }
};

export default function SampleDownload() {
  const [isClient, setIsClient] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsClient(true), 0);
  }, []);

  if (!isClient) return null;

  return (
    <div className="hidden">
      <button
        id="download-sample-trigger"
        type="button"
        onClick={async () => {
          setIsDownloading(true);
          try {
            const res = await fetch('/api/export/pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lang: 'en',
                fileName: 'Sample_Bakery_HACCP_Plan.pdf',
                data: sampleData
              })
            });

            if (!res.ok) {
              const err = await res.json().catch(() => null);
              console.error(err?.error || 'Sample PDF download failed.');
              return;
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Sample_Bakery_HACCP_Plan.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
          } catch (error) {
            console.error(error);
          } finally {
            setIsDownloading(false);
          }
        }}
        aria-busy={isDownloading}
      >
        Download
      </button>
    </div>
  );
}

/**
 * How to use:
 * import MiniBuilderDemoCard from "@/components/landing/MiniBuilderDemoCard";
 * <MiniBuilderDemoCard />
 */
"use client";

import { useMemo, useState } from "react";
import styles from "./MiniBuilderDemoCard.module.css";

type StepKey = "product" | "process" | "hazards" | "review";

const STEPS: { key: StepKey; label: string }[] = [
  { key: "product", label: "Product" },
  { key: "process", label: "Process" },
  { key: "hazards", label: "Hazards" },
  { key: "review", label: "Review" },
];

const HAZARD_OPTIONS = [
  { id: "bio", label: "Biological" },
  { id: "chem", label: "Chemical" },
  { id: "phys", label: "Physical" },
  { id: "allergen", label: "Allergen" },
];

const DEFAULT_STATE = {
  productName: "Chicken Salad (RTE)",
  processSteps: ["Receive", "Cold store", "Mix", "Pack", "Label"],
  hazards: { bio: true, chem: false, phys: false, allergen: true },
};

export default function MiniBuilderDemoCard() {
  const [activeStep, setActiveStep] = useState<StepKey>("product");
  const [productName, setProductName] = useState(DEFAULT_STATE.productName);
  const [processSteps, setProcessSteps] = useState(DEFAULT_STATE.processSteps);
  const [hazards, setHazards] = useState(DEFAULT_STATE.hazards);
  const [newStep, setNewStep] = useState("");

  const currentIndex = STEPS.findIndex((s) => s.key === activeStep);
  const isReview = activeStep === "review";

  const selectedHazards = useMemo(
    () => HAZARD_OPTIONS.filter((h) => hazards[h.id as keyof typeof hazards]).map((h) => h.label),
    [hazards]
  );

  const completion = {
    product: productName.trim().length > 0,
    process: processSteps.length > 0,
    hazards: selectedHazards.length > 0,
  };

  const handleRemoveStep = (indexToRemove: number) => {
    setProcessSteps((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleNext = () => {
    if (isReview) {
      window.location.href = "/builder";
      return;
    }
    const next = STEPS[Math.min(currentIndex + 1, STEPS.length - 1)].key;
    setActiveStep(next);
  };

  const handleBack = () => {
    const prev = STEPS[Math.max(currentIndex - 1, 0)].key;
    setActiveStep(prev);
  };

  const handleAddStep = () => {
    const trimmed = newStep.trim();
    if (!trimmed) return;
    setProcessSteps((prev) => [...prev, trimmed]);
    setNewStep("");
  };

  const handleReset = () => {
    setActiveStep("product");
    setProductName(DEFAULT_STATE.productName);
    setProcessSteps(DEFAULT_STATE.processSteps);
    setHazards(DEFAULT_STATE.hazards);
    setNewStep("");
  };

  return (
    <section className={styles.card} aria-label="Mini HACCP builder demo">
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>HACCP Drafting Flow</p>
          <h2 className={styles.title}>Mini Builder Demo</h2>
        </div>
        <button className={styles.resetButton} onClick={handleReset} type="button">
          Reset
        </button>
      </header>

      <div className={styles.stepper} role="tablist" aria-label="HACCP demo steps">
        {STEPS.map((step, index) => {
          const isActive = step.key === activeStep;
          return (
            <button
              key={step.key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${step.key}`}
              id={`tab-${step.key}`}
              tabIndex={isActive ? 0 : -1}
              className={`${styles.step} ${isActive ? styles.stepActive : ""}`}
              onClick={() => setActiveStep(step.key)}
              type="button"
            >
              <span className={styles.stepIndex}>{index + 1}</span>
              <span className={styles.stepLabel}>{step.label}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.body}>
        <div className={styles.left}>
          {activeStep === "product" && (
            <div
              role="tabpanel"
              id="panel-product"
              aria-labelledby="tab-product"
              className={styles.panel}
            >
              <label className={styles.label} htmlFor="productName">
                Product name
              </label>
              <input
                id="productName"
                className={styles.input}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Chicken Salad (RTE)"
              />
              <p className={styles.helper}>Keep it clear and inspection-ready.</p>
            </div>
          )}

          {activeStep === "process" && (
            <div
              role="tabpanel"
              id="panel-process"
              aria-labelledby="tab-process"
              className={styles.panel}
            >
              <p className={styles.label}>Process flow</p>
              <div className={styles.chips}>
                {processSteps.map((step, idx) => (
                  <button 
                    key={`${step}-${idx}`} 
                    className={styles.chip}
                    onClick={() => handleRemoveStep(idx)}
                    type="button"
                    title="Remove step"
                  >
                    {step} 
                    <span style={{ opacity: 0.5, fontSize: '1.1em', lineHeight: 1 }}>×</span>
                  </button>
                ))}
              </div>
              <div className={styles.inlineForm}>
                <label className={styles.srOnly} htmlFor="newStep">
                  Add process step
                </label>
                <input
                  id="newStep"
                  className={styles.input}
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  placeholder="Add a step"
                />
                <button className={styles.addButton} type="button" onClick={handleAddStep}>
                  Add
                </button>
              </div>
            </div>
          )}

          {activeStep === "hazards" && (
            <div
              role="tabpanel"
              id="panel-hazards"
              aria-labelledby="tab-hazards"
              className={styles.panel}
            >
              <p className={styles.label}>Potential hazards</p>
              <div className={styles.checkboxGrid}>
                {HAZARD_OPTIONS.map((hazard) => (
                  <label key={hazard.id} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={hazards[hazard.id as keyof typeof hazards]}
                      onChange={(e) =>
                        setHazards((prev) => ({ ...prev, [hazard.id]: e.target.checked }))
                      }
                    />
                    <span>{hazard.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeStep === "review" && (
            <div
              role="tabpanel"
              id="panel-review"
              aria-labelledby="tab-review"
              className={styles.panel}
            >
              <p className={styles.label}>Review status</p>
              <div className={styles.reviewPills}>
                <span className={`${styles.pill} ${completion.product ? styles.pillOk : styles.pillWarn}`}>
                  Product {completion.product ? "✓" : "—"}
                </span>
                <span className={`${styles.pill} ${completion.process ? styles.pillOk : styles.pillWarn}`}>
                  Process {completion.process ? "✓" : "—"}
                </span>
                <span className={`${styles.pill} ${completion.hazards ? styles.pillOk : styles.pillWarn}`}>
                  Hazards {completion.hazards ? "✓" : "—"}
                </span>
              </div>
              <p className={styles.helper}>
                You’re ready to generate a full HACCP draft with critical limits and monitoring logs.
              </p>
            </div>
          )}

          <div className={styles.navRow}>
            <button className={styles.ghostButton} type="button" onClick={handleBack} disabled={currentIndex === 0}>
              Back
            </button>
            <button className={styles.primaryButton} type="button" onClick={handleNext}>
              {isReview ? "Open full builder" : "Next"}
            </button>
          </div>

          <div className={styles.ctaRow}>
            <a className={styles.linkButton} href="/builder">
              Open full builder
            </a>
          </div>
        </div>

        <aside className={styles.preview} aria-live="polite">
          <h3 className={styles.previewTitle}>Live Draft Preview</h3>
          <p className={styles.previewLine}>
            <strong>Product:</strong> {productName || "Not specified"}
          </p>
          <div className={styles.previewBlock}>
            <p className={styles.previewHeading}>Process flow</p>
            <ul className={styles.previewList}>
              {processSteps.map((step, idx) => (
                <li key={`${step}-${idx}`}>{step}</li>
              ))}
            </ul>
          </div>
          <div className={styles.previewBlock}>
            <p className={styles.previewHeading}>Hazards flagged</p>
            <p className={styles.previewLine}>
              {selectedHazards.length > 0 ? selectedHazards.join(", ") : "None selected"}
            </p>
          </div>
          <div className={styles.previewBlock}>
            <p className={styles.previewHeading}>Next steps</p>
            <p className={styles.previewLine}>
              Validate critical limits, confirm CCPs, and schedule verification reviews.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

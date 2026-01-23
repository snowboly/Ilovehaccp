/**
 * How to use:
 * import MiniBuilderDemoCard from "@/components/landing/MiniBuilderDemoCard";
 * <MiniBuilderDemoCard />
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

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

  const openModal = () => {
    lastFocusedRef.current = document.activeElement as HTMLElement;
    setVideoError(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    lastFocusedRef.current?.focus();
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, video, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const timer = setTimeout(() => {
      modalRef.current?.querySelector<HTMLElement>("button, video")?.focus();
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isModalOpen]);

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
                  <span key={`${step}-${idx}`} className={styles.chip}>
                    {step}
                  </span>
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
            <button className={styles.secondaryButton} type="button" onClick={openModal}>
              Watch 20s demo
            </button>
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

      {isModalOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Watch 20 second demo">
          <div className={styles.modal} ref={modalRef}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Mini Builder Walkthrough</h3>
              <button className={styles.modalClose} type="button" onClick={closeModal} aria-label="Close video">
                ×
              </button>
            </div>
            {videoError ? (
              <div className={styles.videoFallback} role="status" aria-live="polite">
                <p className={styles.videoFallbackTitle}>Video temporarily unavailable</p>
                <p className={styles.videoFallbackCopy}>
                  We couldn’t load the 20s demo video just now. Please try again in a moment, or jump straight into
                  the full builder.
                </p>
                <a className={styles.videoFallbackLink} href="/builder">
                  Open full builder
                </a>
              </div>
            ) : (
              <video
                className={styles.video}
                controls
                preload="metadata"
                playsInline
                poster="/demo-poster.svg"
                onError={() => setVideoError(true)}
                onLoadedData={() => setVideoError(false)}
              >
                <source src="/demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

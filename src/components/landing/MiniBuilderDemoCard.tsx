/**
 * How to use:
 * import MiniBuilderDemoCard from "@/components/landing/MiniBuilderDemoCard";
 * <MiniBuilderDemoCard />
 */
"use client";

import { useMemo, useState, useEffect } from "react";
import styles from "./MiniBuilderDemoCard.module.css";
import { useLanguage } from "@/lib/i18n";

type StepKey = "product" | "process" | "hazards" | "review";

export default function MiniBuilderDemoCard() {
  const { language } = useLanguage();
  const copy = MINI_BUILDER_COPY[language] ?? MINI_BUILDER_COPY.en;
  const steps = copy.steps;
  const hazardOptions = copy.hazardOptions;
  const defaultState = copy.defaults;
  const [activeStep, setActiveStep] = useState<StepKey>("product");
  const [productName, setProductName] = useState(defaultState.productName);
  const [processSteps, setProcessSteps] = useState(defaultState.processSteps);
  const [hazards, setHazards] = useState(defaultState.hazards);
  const [newStep, setNewStep] = useState("");

  useEffect(() => {
    setActiveStep("product");
    setProductName(defaultState.productName);
    setProcessSteps(defaultState.processSteps);
    setHazards(defaultState.hazards);
    setNewStep("");
  }, [defaultState.hazards, defaultState.processSteps, defaultState.productName]);

  const currentIndex = steps.findIndex((s) => s.key === activeStep);
  const isReview = activeStep === "review";

  const selectedHazards = useMemo(
    () => hazardOptions.filter((h) => hazards[h.id as keyof typeof hazards]).map((h) => h.label),
    [hazards, hazardOptions]
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
    const next = steps[Math.min(currentIndex + 1, steps.length - 1)].key;
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
    setProductName(defaultState.productName);
    setProcessSteps(defaultState.processSteps);
    setHazards(defaultState.hazards);
    setNewStep("");
  };

  return (
    <section className={styles.card} aria-label={copy.ariaLabel}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>{copy.kicker}</p>
          <h2 className={styles.title}>{copy.title}</h2>
        </div>
        <button className={styles.resetButton} onClick={handleReset} type="button">
          {copy.reset}
        </button>
      </header>

      <div className={styles.stepper} role="tablist" aria-label={copy.stepperLabel}>
        {steps.map((step, index) => {
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
                {copy.productLabel}
              </label>
              <input
                id="productName"
                className={styles.input}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={copy.productPlaceholder}
              />
              <p className={styles.helper}>{copy.productHelper}</p>
            </div>
          )}

          {activeStep === "process" && (
            <div
              role="tabpanel"
              id="panel-process"
              aria-labelledby="tab-process"
              className={styles.panel}
            >
              <p className={styles.label}>{copy.processLabel}</p>
              <div className={styles.chips}>
                {processSteps.map((step, idx) => (
                  <button 
                    key={`${step}-${idx}`} 
                    className={styles.chip}
                    onClick={() => handleRemoveStep(idx)}
                    type="button"
                    title={copy.removeStep}
                  >
                    {step} 
                    <span style={{ opacity: 0.5, fontSize: '1.1em', lineHeight: 1 }}>×</span>
                  </button>
                ))}
              </div>
              <div className={styles.inlineForm}>
                <label className={styles.srOnly} htmlFor="newStep">
                  {copy.addStepLabel}
                </label>
                <input
                  id="newStep"
                  className={styles.input}
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  placeholder={copy.addStepPlaceholder}
                />
                <button className={styles.addButton} type="button" onClick={handleAddStep}>
                  {copy.addStepButton}
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
              <p className={styles.label}>{copy.hazardsLabel}</p>
              <div className={styles.checkboxGrid}>
                {hazardOptions.map((hazard) => (
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
              <p className={styles.label}>{copy.reviewLabel}</p>
              <div className={styles.reviewPills}>
                <span className={`${styles.pill} ${completion.product ? styles.pillOk : styles.pillWarn}`}>
                  {copy.reviewProduct} {completion.product ? "✓" : "—"}
                </span>
                <span className={`${styles.pill} ${completion.process ? styles.pillOk : styles.pillWarn}`}>
                  {copy.reviewProcess} {completion.process ? "✓" : "—"}
                </span>
                <span className={`${styles.pill} ${completion.hazards ? styles.pillOk : styles.pillWarn}`}>
                  {copy.reviewHazards} {completion.hazards ? "✓" : "—"}
                </span>
              </div>
              <p className={styles.helper}>
                {copy.reviewHelper}
              </p>
            </div>
          )}

          <div className={styles.navRow}>
            <button className={styles.ghostButton} type="button" onClick={handleBack} disabled={currentIndex === 0}>
              {copy.back}
            </button>
            <button className={styles.primaryButton} type="button" onClick={handleNext}>
              {isReview ? copy.openBuilder : copy.next}
            </button>
          </div>

          <div className={styles.ctaRow}>
            <a className={styles.linkButton} href="/builder">
              {copy.openBuilder}
            </a>
          </div>
        </div>

        <aside className={styles.preview} aria-live="polite">
          <h3 className={styles.previewTitle}>{copy.previewTitle}</h3>
          <p className={styles.previewLine}>
            <strong>{copy.previewProductLabel}</strong> {productName || copy.previewNotSpecified}
          </p>
          <div className={styles.previewBlock}>
            <p className={styles.previewHeading}>{copy.previewProcessLabel}</p>
            <ul className={styles.previewList}>
              {processSteps.map((step, idx) => (
                <li key={`${step}-${idx}`}>{step}</li>
              ))}
            </ul>
          </div>
          <div className={styles.previewBlock}>
            <p className={styles.previewHeading}>{copy.previewHazardsLabel}</p>
            <p className={styles.previewLine}>
              {selectedHazards.length > 0 ? selectedHazards.join(", ") : copy.previewHazardsNone}
            </p>
          </div>
          <div className={styles.previewBlock}>
            <p className={styles.previewHeading}>{copy.previewNextStepsLabel}</p>
            <p className={styles.previewLine}>
              {copy.previewNextStepsText}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

const MINI_BUILDER_COPY: Record<string, {
  ariaLabel: string;
  kicker: string;
  title: string;
  reset: string;
  stepperLabel: string;
  steps: { key: StepKey; label: string }[];
  hazardOptions: { id: string; label: string }[];
  defaults: {
    productName: string;
    processSteps: string[];
    hazards: { bio: boolean; chem: boolean; phys: boolean; allergen: boolean };
  };
  productLabel: string;
  productPlaceholder: string;
  productHelper: string;
  processLabel: string;
  removeStep: string;
  addStepLabel: string;
  addStepPlaceholder: string;
  addStepButton: string;
  hazardsLabel: string;
  reviewLabel: string;
  reviewProduct: string;
  reviewProcess: string;
  reviewHazards: string;
  reviewHelper: string;
  back: string;
  next: string;
  openBuilder: string;
  previewTitle: string;
  previewProductLabel: string;
  previewNotSpecified: string;
  previewProcessLabel: string;
  previewHazardsLabel: string;
  previewHazardsNone: string;
  previewNextStepsLabel: string;
  previewNextStepsText: string;
}> = {
  en: {
    ariaLabel: "Mini HACCP builder demo",
    kicker: "HACCP Drafting Flow",
    title: "Mini Builder Demo",
    reset: "Reset",
    stepperLabel: "HACCP demo steps",
    steps: [
      { key: "product", label: "Product" },
      { key: "process", label: "Process" },
      { key: "hazards", label: "Hazards" },
      { key: "review", label: "Review" },
    ],
    hazardOptions: [
      { id: "bio", label: "Biological" },
      { id: "chem", label: "Chemical" },
      { id: "phys", label: "Physical" },
      { id: "allergen", label: "Allergen" },
    ],
    defaults: {
      productName: "Chicken Salad (RTE)",
      processSteps: ["Receive", "Cold store", "Mix", "Pack", "Label"],
      hazards: { bio: true, chem: false, phys: false, allergen: true },
    },
    productLabel: "Product name",
    productPlaceholder: "e.g. Chicken Salad (RTE)",
    productHelper: "Keep it clear and inspection-ready.",
    processLabel: "Process flow",
    removeStep: "Remove step",
    addStepLabel: "Add process step",
    addStepPlaceholder: "Add a step",
    addStepButton: "Add",
    hazardsLabel: "Potential hazards",
    reviewLabel: "Review status",
    reviewProduct: "Product",
    reviewProcess: "Process",
    reviewHazards: "Hazards",
    reviewHelper: "You’re ready to generate a full HACCP draft with critical limits and monitoring logs.",
    back: "Back",
    next: "Next",
    openBuilder: "Open full builder",
    previewTitle: "Live Draft Preview",
    previewProductLabel: "Product:",
    previewNotSpecified: "Not specified",
    previewProcessLabel: "Process flow",
    previewHazardsLabel: "Hazards flagged",
    previewHazardsNone: "None selected",
    previewNextStepsLabel: "Next steps",
    previewNextStepsText: "Validate critical limits, confirm CCPs, and schedule verification reviews.",
  },
  es: {
    ariaLabel: "Demostración del mini creador HACCP",
    kicker: "Flujo de redacción HACCP",
    title: "Demo del mini creador",
    reset: "Restablecer",
    stepperLabel: "Pasos de la demo HACCP",
    steps: [
      { key: "product", label: "Producto" },
      { key: "process", label: "Proceso" },
      { key: "hazards", label: "Peligros" },
      { key: "review", label: "Revisión" },
    ],
    hazardOptions: [
      { id: "bio", label: "Biológico" },
      { id: "chem", label: "Químico" },
      { id: "phys", label: "Físico" },
      { id: "allergen", label: "Alérgeno" },
    ],
    defaults: {
      productName: "Ensalada de pollo (RTE)",
      processSteps: ["Recepción", "Refrigeración", "Mezclar", "Empacar", "Etiquetar"],
      hazards: { bio: true, chem: false, phys: false, allergen: true },
    },
    productLabel: "Nombre del producto",
    productPlaceholder: "p. ej. Ensalada de pollo (RTE)",
    productHelper: "Manténlo claro y listo para inspección.",
    processLabel: "Flujo del proceso",
    removeStep: "Eliminar paso",
    addStepLabel: "Añadir paso de proceso",
    addStepPlaceholder: "Añadir un paso",
    addStepButton: "Añadir",
    hazardsLabel: "Peligros potenciales",
    reviewLabel: "Estado de revisión",
    reviewProduct: "Producto",
    reviewProcess: "Proceso",
    reviewHazards: "Peligros",
    reviewHelper: "Estás listo para generar un borrador HACCP completo con límites críticos y registros de monitoreo.",
    back: "Atrás",
    next: "Siguiente",
    openBuilder: "Abrir creador completo",
    previewTitle: "Vista previa del borrador",
    previewProductLabel: "Producto:",
    previewNotSpecified: "No especificado",
    previewProcessLabel: "Flujo del proceso",
    previewHazardsLabel: "Peligros marcados",
    previewHazardsNone: "Ninguno seleccionado",
    previewNextStepsLabel: "Próximos pasos",
    previewNextStepsText: "Valida límites críticos, confirma PCC y programa revisiones de verificación.",
  },
  fr: {
    ariaLabel: "Démo mini créateur HACCP",
    kicker: "Flux de rédaction HACCP",
    title: "Démo mini créateur",
    reset: "Réinitialiser",
    stepperLabel: "Étapes de la démo HACCP",
    steps: [
      { key: "product", label: "Produit" },
      { key: "process", label: "Processus" },
      { key: "hazards", label: "Dangers" },
      { key: "review", label: "Revue" },
    ],
    hazardOptions: [
      { id: "bio", label: "Biologique" },
      { id: "chem", label: "Chimique" },
      { id: "phys", label: "Physique" },
      { id: "allergen", label: "Allergène" },
    ],
    defaults: {
      productName: "Salade de poulet (RTE)",
      processSteps: ["Réception", "Stockage froid", "Mélanger", "Emballer", "Étiqueter"],
      hazards: { bio: true, chem: false, phys: false, allergen: true },
    },
    productLabel: "Nom du produit",
    productPlaceholder: "ex. Salade de poulet (RTE)",
    productHelper: "Soyez clair et prêt pour l’inspection.",
    processLabel: "Flux du processus",
    removeStep: "Supprimer l’étape",
    addStepLabel: "Ajouter une étape",
    addStepPlaceholder: "Ajouter une étape",
    addStepButton: "Ajouter",
    hazardsLabel: "Dangers potentiels",
    reviewLabel: "Statut de revue",
    reviewProduct: "Produit",
    reviewProcess: "Processus",
    reviewHazards: "Dangers",
    reviewHelper: "Vous êtes prêt à générer un brouillon HACCP complet avec limites critiques et journaux.",
    back: "Retour",
    next: "Suivant",
    openBuilder: "Ouvrir le créateur complet",
    previewTitle: "Aperçu du brouillon",
    previewProductLabel: "Produit :",
    previewNotSpecified: "Non spécifié",
    previewProcessLabel: "Flux du processus",
    previewHazardsLabel: "Dangers signalés",
    previewHazardsNone: "Aucun sélectionné",
    previewNextStepsLabel: "Étapes suivantes",
    previewNextStepsText: "Validez les limites critiques, confirmez les CCP et planifiez la vérification.",
  },
  pt: {
    ariaLabel: "Demo do mini construtor HACCP",
    kicker: "Fluxo de redação HACCP",
    title: "Demo do mini construtor",
    reset: "Repor",
    stepperLabel: "Etapas da demo HACCP",
    steps: [
      { key: "product", label: "Produto" },
      { key: "process", label: "Processo" },
      { key: "hazards", label: "Perigos" },
      { key: "review", label: "Revisão" },
    ],
    hazardOptions: [
      { id: "bio", label: "Biológico" },
      { id: "chem", label: "Químico" },
      { id: "phys", label: "Físico" },
      { id: "allergen", label: "Alergénio" },
    ],
    defaults: {
      productName: "Salada de frango (RTE)",
      processSteps: ["Receção", "Arrefecimento", "Misturar", "Embalar", "Rotular"],
      hazards: { bio: true, chem: false, phys: false, allergen: true },
    },
    productLabel: "Nome do produto",
    productPlaceholder: "ex.: Salada de frango (RTE)",
    productHelper: "Seja claro e pronto para inspeção.",
    processLabel: "Fluxo do processo",
    removeStep: "Remover etapa",
    addStepLabel: "Adicionar etapa",
    addStepPlaceholder: "Adicionar uma etapa",
    addStepButton: "Adicionar",
    hazardsLabel: "Perigos potenciais",
    reviewLabel: "Estado da revisão",
    reviewProduct: "Produto",
    reviewProcess: "Processo",
    reviewHazards: "Perigos",
    reviewHelper: "Está pronto para gerar um rascunho HACCP completo com limites críticos e registos.",
    back: "Voltar",
    next: "Seguinte",
    openBuilder: "Abrir construtor completo",
    previewTitle: "Pré-visualização do rascunho",
    previewProductLabel: "Produto:",
    previewNotSpecified: "Não especificado",
    previewProcessLabel: "Fluxo do processo",
    previewHazardsLabel: "Perigos assinalados",
    previewHazardsNone: "Nenhum selecionado",
    previewNextStepsLabel: "Próximos passos",
    previewNextStepsText: "Valide limites críticos, confirme PCC e agende revisões de verificação.",
  },
  de: {
    ariaLabel: "Mini‑HACCP‑Builder‑Demo",
    kicker: "HACCP‑Erstellungsfluss",
    title: "Mini‑Builder‑Demo",
    reset: "Zurücksetzen",
    stepperLabel: "HACCP‑Demo‑Schritte",
    steps: [
      { key: "product", label: "Produkt" },
      { key: "process", label: "Prozess" },
      { key: "hazards", label: "Gefahren" },
      { key: "review", label: "Prüfung" },
    ],
    hazardOptions: [
      { id: "bio", label: "Biologisch" },
      { id: "chem", label: "Chemisch" },
      { id: "phys", label: "Physikalisch" },
      { id: "allergen", label: "Allergen" },
    ],
    defaults: {
      productName: "Hähnchensalat (RTE)",
      processSteps: ["Annahme", "Kühl lagern", "Mischen", "Verpacken", "Kennzeichnen"],
      hazards: { bio: true, chem: false, phys: false, allergen: true },
    },
    productLabel: "Produktname",
    productPlaceholder: "z. B. Hähnchensalat (RTE)",
    productHelper: "Klar und prüfbereit formulieren.",
    processLabel: "Prozessablauf",
    removeStep: "Schritt entfernen",
    addStepLabel: "Prozessschritt hinzufügen",
    addStepPlaceholder: "Schritt hinzufügen",
    addStepButton: "Hinzufügen",
    hazardsLabel: "Mögliche Gefahren",
    reviewLabel: "Prüfstatus",
    reviewProduct: "Produkt",
    reviewProcess: "Prozess",
    reviewHazards: "Gefahren",
    reviewHelper: "Sie sind bereit, einen vollständigen HACCP‑Entwurf mit Grenzwerten und Logs zu erstellen.",
    back: "Zurück",
    next: "Weiter",
    openBuilder: "Vollständigen Builder öffnen",
    previewTitle: "Live‑Entwurfs‑Vorschau",
    previewProductLabel: "Produkt:",
    previewNotSpecified: "Nicht angegeben",
    previewProcessLabel: "Prozessablauf",
    previewHazardsLabel: "Markierte Gefahren",
    previewHazardsNone: "Keine ausgewählt",
    previewNextStepsLabel: "Nächste Schritte",
    previewNextStepsText: "Kritische Grenzwerte prüfen, CCPs bestätigen und Verifizierungen planen.",
  },
  it: {
    ariaLabel: "Demo mini builder HACCP",
    kicker: "Flusso di redazione HACCP",
    title: "Demo mini builder",
    reset: "Reimposta",
    stepperLabel: "Passi demo HACCP",
    steps: [
      { key: "product", label: "Prodotto" },
      { key: "process", label: "Processo" },
      { key: "hazards", label: "Pericoli" },
      { key: "review", label: "Revisione" },
    ],
    hazardOptions: [
      { id: "bio", label: "Biologico" },
      { id: "chem", label: "Chimico" },
      { id: "phys", label: "Fisico" },
      { id: "allergen", label: "Allergene" },
    ],
    defaults: {
      productName: "Insalata di pollo (RTE)",
      processSteps: ["Ricevimento", "Stoccaggio a freddo", "Miscelare", "Confezionare", "Etichettare"],
      hazards: { bio: true, chem: false, phys: false, allergen: true },
    },
    productLabel: "Nome del prodotto",
    productPlaceholder: "es. Insalata di pollo (RTE)",
    productHelper: "Mantienilo chiaro e pronto per l’ispezione.",
    processLabel: "Flusso del processo",
    removeStep: "Rimuovi passaggio",
    addStepLabel: "Aggiungi passaggio",
    addStepPlaceholder: "Aggiungi un passaggio",
    addStepButton: "Aggiungi",
    hazardsLabel: "Pericoli potenziali",
    reviewLabel: "Stato revisione",
    reviewProduct: "Prodotto",
    reviewProcess: "Processo",
    reviewHazards: "Pericoli",
    reviewHelper: "Sei pronto per generare una bozza HACCP completa con limiti critici e registri.",
    back: "Indietro",
    next: "Avanti",
    openBuilder: "Apri builder completo",
    previewTitle: "Anteprima bozza",
    previewProductLabel: "Prodotto:",
    previewNotSpecified: "Non specificato",
    previewProcessLabel: "Flusso del processo",
    previewHazardsLabel: "Pericoli segnalati",
    previewHazardsNone: "Nessuno selezionato",
    previewNextStepsLabel: "Prossimi passi",
    previewNextStepsText: "Valida i limiti critici, conferma i CCP e pianifica le verifiche.",
  },
  lt: {
    ariaLabel: "Mini HACCP kūrėjo demonstracija",
    kicker: "HACCP rengimo eiga",
    title: "Mini kūrėjo demo",
    reset: "Atstatyti",
    stepperLabel: "HACCP demo žingsniai",
    steps: [
      { key: "product", label: "Produktas" },
      { key: "process", label: "Procesas" },
      { key: "hazards", label: "Pavojai" },
      { key: "review", label: "Peržiūra" },
    ],
    hazardOptions: [
      { id: "bio", label: "Biologinis" },
      { id: "chem", label: "Cheminis" },
      { id: "phys", label: "Fizinis" },
      { id: "allergen", label: "Alergenas" },
    ],
    defaults: {
      productName: "Vištienos salotos (RTE)",
      processSteps: ["Priėmimas", "Šaltas laikymas", "Maišyti", "Pakuoti", "Žymėti"],
      hazards: { bio: true, chem: false, phys: false, allergen: true },
    },
    productLabel: "Produkto pavadinimas",
    productPlaceholder: "pvz., Vištienos salotos (RTE)",
    productHelper: "Rašykite aiškiai ir inspekcijai suprantamai.",
    processLabel: "Proceso srautas",
    removeStep: "Pašalinti žingsnį",
    addStepLabel: "Pridėti proceso žingsnį",
    addStepPlaceholder: "Pridėti žingsnį",
    addStepButton: "Pridėti",
    hazardsLabel: "Galimi pavojai",
    reviewLabel: "Peržiūros būsena",
    reviewProduct: "Produktas",
    reviewProcess: "Procesas",
    reviewHazards: "Pavojai",
    reviewHelper: "Esate pasiruošę sugeneruoti pilną HACCP juodraštį su ribomis ir žurnalais.",
    back: "Atgal",
    next: "Kitas",
    openBuilder: "Atidaryti pilną kūrėją",
    previewTitle: "Tiesioginė peržiūra",
    previewProductLabel: "Produktas:",
    previewNotSpecified: "Nenurodyta",
    previewProcessLabel: "Proceso srautas",
    previewHazardsLabel: "Pažymėti pavojai",
    previewHazardsNone: "Nieko nepasirinkta",
    previewNextStepsLabel: "Kiti žingsniai",
    previewNextStepsText: "Patvirtinkite ribas, CCP ir suplanuokite patikrą.",
  },
};

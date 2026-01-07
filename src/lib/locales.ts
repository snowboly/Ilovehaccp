export type Language = 'en' | 'es' | 'fr' | 'pt';

export const translations = {
  en: {
    nav: {
      builder: "HACCP Builder",
      features: "Features",
      resources: "Resources",
      pricing: "Pricing",
      about: "About",
      contact: "Contact",
      login: "Log In",
      getStarted: "Register an account"
    },
    landing: {
      hero: {
        badge: "Rated #1 Food Safety Tool",
        titlePart1: "Create a HACCP Plan in Minutes —",
        titlePart2: "Without Consultants or Spreadsheets",
        subtitle: "Specifically built for restaurants, bakeries, food trucks & small food producers.",
        check1: "Compliant",
        check2: "Custom to your business",
        check3: "Free to start",
        cta: "Build Your Plan Free",
        auditReady: "Audit Ready",
        validated: "Validated Logic",
        compliance: { fda: "FDA Compliant", eu: "EU 852/2004", codex: "Codex CXC 1-1969" }
      },
      audience: {
        title: "Is iLoveHACCP Right for You?",
        subtitle: "We prioritize speed and practical compliance for small to medium food operations.",
        for_title: "Perfect For:",
        for_items: [
          "Small & medium food businesses",
          "Restaurants, bakeries, cafés & food trucks",
          "First-time HACCP plan creation",
          "Businesses preparing for an upcoming inspection"
        ],
        not_for_title: "Not Ideal If:",
        not_for_items: [
          "You require enterprise-grade certification",
          "You have a full-time consultant-managed system"
        ]
      },
      founder: {
        title: "A Note from the Founder",
        text: "I built iLoveHACCP because traditional consulting is too slow and expensive for small businesses. We democratize access to the same high-standard safety systems used by major corporations.",
        role: "Scientific Lead & Founder",
        name: "Dr. Joao"
      },
      features: {
        title: "Why Food Businesses Love Us",
        subtitle: "We prioritize your business outcomes over complex technology.",
        f1_title: "Custom Tailored",
        f1_desc: "Generate a full HACCP plan tailored to your exact process.",
        f2_title: "Simple & Accessible",
        f2_desc: "No food safety expertise required.",
        f3_title: "Inspection Ready",
        f3_desc: "Export-ready documents for inspections."
      },
      howItWorks: {
        badge: "Simple Process",
        title: "How It Works",
        subtitle: "Go from blank page to fully compliant in three simple steps.",
        s1_title: "1. Answer questions",
        s1_desc: "Answer a few questions about your food business and processes.",
        s2_title: "2. Plan generated",
        s2_desc: "We generate your custom HACCP plan automatically using our technology.",
        s3_title: "3. Download & Edit",
        s3_desc: "Download your inspection-ready documents and edit them anytime.",
        cta: "Start Your Plan Now"
      },
      pricing: {
        title: "Choose Your Compliance Level",
        subtitle: "From a quick readiness check to a fully validated professional system.",
        free: {
          title: "Free Plan",
          price: "€0",
          desc: "Complete self-service plan generation.",
          f1: "Full Wizard Access",
          f2: "Complete HACCP Plan",
          f3: "Full Process Flow",
          f4: "No Professional Review",
          cta: "Start Building"
        },
        starter: {
          badge: "Recommended",
          title: "Starter Review",
          price: "€79",
          desc: "Everything in Free + Professional Review.",
          f1: "Everything in Free",
          f2: "Editable Files (Word/Excel)",
          f3: "Basic Professional Review",
          cta: "Get Started"
        },
        review: {
          title: "Expert Review",
          price: "From €99",
          desc: "Refresh an existing HACCP plan.",
          f1: "Full Professional Review",
          f2: "Latest Regulation Update",
          f3: "Detailed Action Report",
          cta: "Book Review"
        },
        enterprise: {
          title: "Strategic Enterprise",
          price: "Custom",
          desc: "For complex, multi-site, or industrial operations.",
          f1: "Full HACCP Plan Review",
          f2: "On-site Audit Options",
          f3: "Dedicated Consultant",
          f4: "Priority Support",
          cta: "Contact for Quote"
        }
      },
      finalCta: {
        title: "Ready to get compliant?",
        btn: "Create Your Free Plan",
        sub: "No credit card required. Cancel anytime."
      }
    },
    hero: {
      title: "HACCP Plans in Minutes.",
      subtitle: "Generate audit-ready HACCP plans in minutes using our free tool",
      cta: "Create Free Plan"
    },
    wizard: {
      title: "Let's Build Your HACCP Plan",
      subtitle: "Answer a few questions and our tool will draft a complete, compliance-ready document.",
      reassurance: "No HACCP knowledge needed. You can skip questions or edit later.",
      start: "Start Builder",
      next: "Next",
      back: "Back",
      add: "Add",
      generating: "Crafting your HACCP plan...",
      generatingDesc: "Our tool is applying standards to your specific business context.",
      download: "Download PDF",
      success: "Your Draft is Ready!",
      step_business: "Business Context",
      step_products: "Product Details",
    },
    pdf: {
      title: "HACCP Plan",
      subtitle: "Food Safety Management System",
      facility: "Facility Name",
      product_scope: "Product Scope",
      date_issue: "Date of Issue",
      standard: "Standard",
      disclaimer: "This document is a generated draft and must be validated by a qualified professional.",
      confidential: "CONFIDENTIAL",
      version: "Version 1.0",
      generated_by: "Generated by ilovehaccp.com - Food Safety Solutions",
      s1_title: "1.0 Plan Overview",
      s1_executive: "1.1 Executive Summary",
      s1_product: "1.2 Product Description",
      s1_process: "1.3 Process Narrative",
      lbl_product_name: "Product Name",
      lbl_description: "Description",
      lbl_intended_use: "Intended Use",
      lbl_storage: "Storage",
      s2_title: "2.0 Prerequisite Programs (PRPs)",
      s2_desc: "Foundation programs in place to control general hygiene hazards.",
      col_program: "Program",
      col_details: "Details & Control",
      s3_title: "3.0 Hazard Analysis (Principle 1 & 2)",
      col_step: "Step",
      col_hazards: "Hazards (B/C/P)",
      col_control: "Control Measure",
      col_ccp: "CCP?",
      val_prerequisite: "Prerequisite",
      s4_title: "4.0 HACCP Control Chart (Principles 3-7)",
      s4_desc: "Detailed control plan for identified Critical Control Points.",
      lbl_hazard: "SIGNIFICANT HAZARD",
      lbl_critical_limit: "Critical Limit",
      lbl_monitoring: "Monitoring",
      lbl_corrective: "Corrective Action",
      msg_no_ccps: "No Critical Control Points (CCPs) identified. Process is controlled via PRPs.",
      sign_prepared: "Prepared By (HACCP Team Leader)",
      sign_approved: "Approved By (Management)",
      tk_title: "Toolkit: Monitoring Logs",
      tk_temp_title: "Appendix A: Temperature Control Log",
      tk_temp_desc: "Use this log to record temperatures for Critical Control Points (e.g., Cooking, Chilled Storage).",
      col_date: "Date",
      col_time: "Time",
      col_item: "Item/Equipment",
      col_temp: "Temp (°C)",
      col_action: "Action",
      col_sign: "Sign",
      msg_corrective: "*Corrective Action Required if Critical Limits are breached. Record actions taken in the 'Action' column.",
      tk_clean_title: "Appendix B: Daily Cleaning Checklist",
      col_task: "Cleaning Task",
      days: { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat_sun: "Sat/Sun" },
      tasks: {
        surfaces: "Surfaces & Preparation Boards",
        cooking: "Cooking Equipment (Ovens/Stoves)",
        fridges: "Fridges & Handles",
        sinks: "Sinks & Taps",
        floors: "Floors & Drains",
        waste: "Waste Bins (Emptied & Cleaned)",
        handwash: "Staff Handwash Stations"
      },
      tk_train_title: "Appendix C: Staff Training Record",
      col_employee: "Employee Name",
      col_train_desc: "Training Description (e.g. HACCP Level 2)"
    }
  },
  es: {
    nav: {
      builder: "Constructor HACCP",
      features: "Características",
      resources: "Recursos",
      pricing: "Precios",
      about: "Sobre nosotros",
      contact: "Contacto",
      login: "Iniciar Sesión",
      getStarted: "Registrar una cuenta"
    },
    landing: {
      hero: {
        badge: "Herramienta #1 de Seguridad Alimentaria",
        titlePart1: "Cree un Plan HACCP en Minutos —",
        titlePart2: "Sin Consultores ni Hojas de Cálculo",
        subtitle: "Diseñado específicamente para restaurantes, panaderías, food trucks y pequeños productores.",
        check1: "Cumple la Normativa",
        check2: "Personalizado para su negocio",
        check3: "Gratis para empezar",
        cta: "Cree su Plan Gratis",
        auditReady: "Listo para Auditoría",
        validated: "Lógica Validada",
        compliance: { fda: "Cumple con FDA", eu: "UE 852/2004", codex: "Codex CXC 1-1969" }
      },
      audience: {
        title: "¿Es iLoveHACCP adecuado para usted?",
        subtitle: "Priorizamos la velocidad y el cumplimiento práctico para pequeñas y medianas empresas alimentarias.",
        for_title: "Perfecto Para:",
        for_items: [
          "Pequeñas y medianas empresas alimentarias",
          "Restaurantes, panaderías, cafés y food trucks",
          "Creación de planes HACCP por primera vez",
          "Negocios que se preparan para una inspección próxima"
        ],
        not_for_title: "No es Ideal Si:",
        not_for_items: [
          "Requiere certificación de nivel empresarial",
          "Tiene un sistema gestionado por un consultor a tiempo completo"
        ]
      },
      founder: {
        title: "Una Nota del Fundador",
        text: "Creé iLoveHACCP porque la consultoría tradicional es demasiado lenta y costosa para las pequeñas empresas. Democratizamos el acceso a los mismos sistemas de seguridad de alto nivel utilizados por las grandes corporaciones.",
        role: "Líder Científico y Fundador",
        name: "Dr. Joao"
      },
      features: {
        title: "Por qué las empresas nos aman",
        subtitle: "Priorizamos los resultados de su negocio sobre la tecnología compleja.",
        f1_title: "A Medida",
        f1_desc: "Genere un plan HACCP completo adaptado a su proceso exacto.",
        f2_title: "Simple y Accesible",
        f2_desc: "No se requiere experiencia en seguridad alimentaria.",
        f3_title: "Listo para Inspección",
        f3_desc: "Documentos listos para exportar para inspecciones."
      },
      howItWorks: {
        badge: "Proceso Simple",
        title: "Cómo Funciona",
        subtitle: "De página en blanco a cumplimiento total en tres pasos simples.",
        s1_title: "1. Responda preguntas",
        s1_desc: "Responda algunas preguntas sobre su negocio y procesos alimentarios.",
        s2_title: "2. Plan generado",
        s2_desc: "Generamos su plan HACCP personalizado automáticamente con nuestra tecnología.",
        s3_title: "3. Descargue y Edite",
        s3_desc: "Descargue sus documentos listos para inspección y edítelos cuando quiera.",
        cta: "Comience su Plan Ahora"
      },
      pricing: {
        title: "Elija su Nivel de Cumplimiento",
        subtitle: "Desde una verificación rápida hasta un sistema profesional totalmente validado.",
        free: {
          title: "Plan Gratuito",
          price: "€0",
          desc: "Generación completa de planes de autoservicio.",
          f1: "Acceso Completo al Asistente",
          f2: "Plan HACCP Completo",
          f3: "Flujo de Proceso Completo",
          f4: "Sin Revisión Profesional",
          cta: "Comenzar"
        },
        starter: {
          badge: "Recomendado",
          title: "Revisión Inicial",
          price: "€79",
          desc: "Todo en Gratis + Revisión Profesional.",
          f1: "Todo en Gratis",
          f2: "Archivos Editables (Word/Excel)",
          f3: "Revisión Profesional Básica",
          cta: "Empezar"
        },
        review: {
          title: "Revisión Experta",
          price: "Desde €99",
          desc: "Actualice un plan HACCP existente.",
          f1: "Revisión Profesional Completa",
          f2: "Actualización de Normativas",
          f3: "Informe Detallado de Acciones",
          cta: "Reservar Revisión"
        },
        enterprise: {
          title: "Empresa Estratégica",
          price: "Personalizado",
          desc: "Para operaciones complejas, multisitio o industriales.",
          f1: "Revisión Completa del Plan",
          f2: "Opciones de Auditoría In Situ",
          f3: "Consultor Dedicado",
          f4: "Soporte Prioritario",
          cta: "Contactar"
        }
      },
      finalCta: {
        title: "¿Listo para cumplir?",
        btn: "Cree su Plan Gratis",
        sub: "No requiere tarjeta de crédito. Cancele cuando quiera."
      }
    },
    hero: {
      title: "Planes HACCP en Minutos.",
      subtitle: "Genere planes HACCP listos para auditoría en minutos con nuestra herramienta gratuita.",
      cta: "Cree su Plan Gratis"
    },
    wizard: {
      title: "Vamos a crear su plan HACCP",
      subtitle: "Responda unas preguntas y nuestra herramienta redactará un documento completo y listo para cumplir.",
      reassurance: "No se necesita experiencia. Puede omitir preguntas o editar después.",
      start: "Iniciar Constructor",
      next: "Siguiente",
      back: "Atrás",
      add: "Añadir",
      generating: "Creando su plan HACCP...",
      generatingDesc: "Nuestra herramienta está aplicando estándares a su contexto empresarial.",
      download: "Descargar PDF",
      success: "¡Su borrador está listo!",
      step_business: "Contexto Empresarial",
      step_products: "Detalles del Producto"
    },
    pdf: {
      title: "Plan HACCP",
      subtitle: "Sistema de Gestión de Seguridad Alimentaria",
      facility: "Nombre de la Instalación",
      product_scope: "Alcance del Producto",
      date_issue: "Fecha de Emisión",
      standard: "Estándar",
      disclaimer: "Este documento es un borrador generado y debe ser validado por un profesional calificado.",
      confidential: "CONFIDENCIAL",
      version: "Versión 1.0",
      generated_by: "Generado por ilovehaccp.com - Soluciones de Seguridad Alimentaria",
      s1_title: "1.0 Resumen del Plan",
      s1_executive: "1.1 Resumen Ejecutivo",
      s1_product: "1.2 Descripción del Producto",
      s1_process: "1.3 Narrativa del Proceso",
      lbl_product_name: "Nombre del Producto",
      lbl_description: "Descripción",
      lbl_intended_use: "Uso Previsto",
      lbl_storage: "Almacenamiento",
      s2_title: "2.0 Programas de Prerrequisitos (PPR)",
      s2_desc: "Programas fundamentales para controlar peligros generales de higiene.",
      col_program: "Programa",
      col_details: "Detalles y Control",
      s3_title: "3.0 Análisis de Peligros (Principio 1 y 2)",
      col_step: "Paso",
      col_hazards: "Peligros (B/Q/F)",
      col_control: "Medida de Control",
      col_ccp: "¿PCC?",
      val_prerequisite: "Prerrequisito",
      s4_title: "4.0 Cuadro de Control HACCP (Princípios 3-7)",
      s4_desc: "Plan de control detallado para los Puntos Críticos de Control identificados.",
      lbl_hazard: "PELIGRO SIGNIFICATIVO",
      lbl_critical_limit: "Límite Crítico",
      lbl_monitoring: "Monitoreo",
      lbl_corrective: "Acción Correctiva",
      msg_no_ccps: "No se identificaron Puntos Críticos de Control (PCC). El proceso se controla mediante PPR.",
      sign_prepared: "Preparado por (Líder del Equipo HACCP)",
      sign_approved: "Aprobado por (Gerencia)",
      tk_title: "Herramientas: Registros de Monitoreo",
      tk_temp_title: "Apéndice A: Registro de Control de Temperatura",
      tk_temp_desc: "Utilice este registro para PCC (ej. Cocción, Almacenamiento en Frío).",
      col_date: "Fecha",
      col_time: "Hora",
      col_item: "Ítem/Equipo",
      col_temp: "Temp (°C)",
      col_action: "Acción",
      col_sign: "Firma",
      msg_corrective: "*Acción Correctiva requerida si se violan los Límites Críticos.",
      tk_clean_title: "Apéndice B: Lista de Limpieza Diaria",
      col_task: "Tarea de Limpieza",
      days: { mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", fri: "Vie", sat_sun: "Sáb/Dom" },
      tasks: {
        surfaces: "Superficies y Tablas de Preparación",
        cooking: "Equipos de Cocina (Hornos/Estufas)",
        fridges: "Refrigeradores y Manijas",
        sinks: "Fregaderos y Grifos",
        floors: "Pisos y Drenajes",
        waste: "Contenedores de Basura (Vaciados y Limpios)",
        handwash: "Estaciones de Lavado de Manos"
      },
      tk_train_title: "Apéndice C: Registro de Capacitación",
      col_employee: "Nombre del Empleado",
      col_train_desc: "Descripción de la Capacitación"
    }
  },
  fr: {
    nav: {
      builder: "Générateur HACCP",
      features: "Fonctionnalités",
      resources: "Ressources",
      pricing: "Tarifs",
      about: "À propos",
      contact: "Contact",
      login: "Connexion",
      getStarted: "Créer un compte"
    },
    landing: {
      hero: {
        badge: "Outil #1 de Sécurité Alimentaire",
        titlePart1: "Créez un Plan HACCP en quelques minutes —",
        titlePart2: "Sans Consultants ni Tableurs",
        subtitle: "Conçu spécifiquement pour les restaurants, boulangeries, food trucks et petits producteurs.",
        check1: "Conforme",
        check2: "Personnalisé pour votre entreprise",
        check3: "Gratuit pour commencer",
        cta: "Créer votre Plan Gratuit",
        auditReady: "Prêt pour Audit",
        validated: "Logique Validée",
        compliance: { fda: "Conforme FDA", eu: "UE 852/2004", codex: "Codex CXC 1-1969" }
      },
      audience: {
        title: "iLoveHACCP est-il fait pour vous ?",
        subtitle: "Nous privilégions la rapidité et la conformité pratique pour les petites et moyennes entreprises alimentaires.",
        for_title: "Parfait Pour :",
        for_items: [
          "Petites et moyennes entreprises alimentaires",
          "Restaurants, boulangeries, cafés et food trucks",
          "Création d'un premier plan HACCP",
          "Entreprises se préparant à une inspection imminente"
        ],
        not_for_title: "Pas Idéal Si :",
        not_for_items: [
          "Vous avez besoin d'une certification de niveau entreprise",
          "Vous avez un système géré par un consultant à plein temps"
        ]
      },
      founder: {
        title: "Le mot du fondateur",
        text: "J'ai créé iLoveHACCP car le conseil traditionnel est trop lent et coûteux pour les petites entreprises. Nous démocratisons l'accès aux mêmes systèmes de sécurité de haut niveau utilisés par les grandes entreprises.",
        role: "Responsable Scientifique & Fondateur",
        name: "Dr. Joao"
      },
      features: {
        title: "Pourquoi les entreprises nous aiment",
        subtitle: "Nous privilégions vos résultats commerciaux plutôt que la technologie complexe.",
        f1_title: "Sur Mesure",
        f1_desc: "Générez un plan HACCP complet adapté à votre processus exact.",
        f2_title: "Simple & Accessible",
        f2_desc: "Aucune expertise en sécurité alimentaire requise.",
        f3_title: "Prêt pour l'Inspection",
        f3_desc: "Documents prêts à l'exportation pour les inspections."
      },
      howItWorks: {
        badge: "Processus Simple",
        title: "Comment ça marche",
        subtitle: "De la page blanche à la conformité totale en trois étapes simples.",
        s1_title: "1. Répondez aux questions",
        s1_desc: "Répondez à quelques questions sur votre entreprise et vos processus.",
        s2_title: "2. Plan généré",
        s2_desc: "Nous générons votre plan HACCP personnalisé automatiquement avec notre technologie.",
        s3_title: "3. Téléchargez & Éditez",
        s3_desc: "Téléchargez vos documents prêts pour l'inspection et modifiez-les à tout moment.",
        cta: "Commencez Votre Plan"
      },
      pricing: {
        title: "Choisissez votre niveau de conformité",
        subtitle: "D'une vérification rapide à un système professionnel entièrement validé.",
        free: {
          title: "Plan Gratuit",
          price: "€0",
          desc: "Génération complète de plans en libre-service.",
          f1: "Accès Complet à l'Assistant",
          f2: "Plan HACCP Complet",
          f3: "Flux de Processus Complet",
          f4: "Pas de Revue Professionnelle",
          cta: "Commencer"
        },
        starter: {
          badge: "Recommandé",
          title: "Revue Initiale",
          price: "€79",
          desc: "Tout dans Gratuit + Revue Professionnelle.",
          f1: "Tout dans Gratuit",
          f2: "Fichiers Editables (Word/Excel)",
          f3: "Revue Professionnelle De Base",
          cta: "Démarrer"
        },
        review: {
          title: "Revue d'Expert",
          price: "À partir de €99",
          desc: "Mise à jour d'un plan existant.",
          f1: "Revue Professionnelle Complète",
          f2: "Mise à jour Réglementaire",
          f3: "Rapport d'Action Détaillé",
          cta: "Réserver"
        },
        enterprise: {
          title: "Entreprise Stratégique",
          price: "Sur Mesure",
          desc: "Pour les opérations complexes, multi-sites ou industrielles.",
          f1: "Revue Complète du Plan",
          f2: "Options d'Audit Sur Site",
          f3: "Consultant Dédié",
          f4: "Support Prioritaire",
          cta: "Contacter"
        }
      },
      finalCta: {
        title: "Prêt à être conforme ?",
        btn: "Créez Votre Plan Gratuit",
        sub: "Pas de carte de crédit requise. Annulez à tout moment."
      }
    },
    hero: {
      title: "Plans HACCP en quelques minutes.",
      subtitle: "Générez des plans HACCP prêts pour l'audit en quelques minutes avec notre outil gratuit.",
      cta: "Créer un plan gratuit"
    },
    wizard: {
      title: "Créons votre plan HACCP",
      subtitle: "Répondez à quelques questions et notre outil rédigera un document complet.",
      reassurance: "Aucune expertise requise. Vous pouvez passer des questions ou éditer plus tard.",
      start: "Démarrer",
      next: "Suivant",
      back: "Retour",
      add: "Ajouter",
      generating: "Création de votre plan HACCP...",
      generatingDesc: "Notre outil applique les normes à votre contexte commercial.",
      download: "Télécharger PDF",
      success: "Votre brouillon est prêt !",
      step_business: "Contexte Commercial",
      step_products: "Détails du Produit"
    },
    pdf: {
      title: "Plan HACCP",
      subtitle: "Système de Gestion de la Sécurité Alimentaire",
      facility: "Nom de l'Établissement",
      product_scope: "Portée du Produit",
      date_issue: "Date d'Émission",
      standard: "Norme",
      disclaimer: "Ce document est un brouillon généré et doit être validé par un professionnel qualifié.",
      confidential: "CONFIDENTIEL",
      version: "Version 1.0",
      generated_by: "Généré par ilovehaccp.com - Solutions de Sécurité Alimentaire",
      s1_title: "1.0 Aperçu du Plan",
      s1_executive: "1.1 Résumé Exécutif",
      s1_product: "1.2 Description du Produit",
      s1_process: "1.3 Description du Processus",
      lbl_product_name: "Nom du Produit",
      lbl_description: "Description",
      lbl_intended_use: "Utilisation Prévue",
      lbl_storage: "Stockage",
      s2_title: "2.0 Programmes Prérequis (PRP)",
      s2_desc: "Programmes fondamentaux pour contrôler les dangers d'hygiène généraux.",
      col_program: "Programme",
      col_details: "Détails et Contrôle",
      s3_title: "3.0 Analyse des Dangers (Principe 1 & 2)",
      col_step: "Étape",
      col_hazards: "Dangers (B/C/P)",
      col_control: "Mesure de Maîtrise",
      col_ccp: "CCP ?",
      val_prerequisite: "Prérequis",
      s4_title: "4.0 Tableau de Contrôle HACCP (Principes 3-7)",
      s4_desc: "Plan de contrôle détaillé pour les Points Critiques de Contrôle identifiés.",
      lbl_hazard: "DANGER SIGNIFICATIF",
      lbl_critical_limit: "Limite Critique",
      lbl_monitoring: "Surveillance",
      lbl_corrective: "Action Corrective",
      msg_no_ccps: "Aucun Point Critique de Contrôle (CCP) identifié. Le processus est contrôlé via les PRP.",
      sign_prepared: "Préparé par (Chef d'Équipe HACCP)",
      sign_approved: "Approuvé par (Direction)",
      tk_title: "Outils : Journaux de Surveillance",
      tk_temp_title: "Annexe A : Journal de Contrôle de Température",
      tk_temp_desc: "Utilisez ce journal pour les CCP (ex. Cuisson, Stockage au Froid).",
      col_date: "Date",
      col_time: "Heure",
      col_item: "Article/Équipement",
      col_temp: "Temp (°C)",
      col_action: "Action",
      col_sign: "Signe",
      msg_corrective: "*Action Corrective requise si les Limites Critiques sont dépassées.",
      tk_clean_title: "Annexe B : Liste de Nettoyage Quotidien",
      col_task: "Tâche de Nettoyage",
      days: { mon: "Lun", tue: "Mar", wed: "Mer", thu: "Jeu", fri: "Ven", sat_sun: "Sam/Dim" },
      tasks: {
        surfaces: "Surfaces et Planches de Préparation",
        cooking: "Équipement de Cuisson (Fours/Cuisinières)",
        fridges: "Réfrigérateurs et Poignées",
        sinks: "Éviers et Robinets",
        floors: "Sols et Drains",
        waste: "Poubelles (Vidées et Nettoyées)",
        handwash: "Stations de Lavage des Mains"
      },
      tk_train_title: "Annexe C : Registre de Formation",
      col_employee: "Nom de l'Employé",
      col_train_desc: "Description de la Formation"
    }
  },
  pt: {
    nav: {
      builder: "Criador HACCP",
      features: "Funcionalidades",
      resources: "Recursos",
      pricing: "Preços",
      about: "Sobre",
      contact: "Contato",
      login: "Entrar",
      getStarted: "Registrar uma conta"
    },
    landing: {
      hero: {
        badge: "Ferramenta #1 de Segurança Alimentar",
        titlePart1: "Crie um Plano HACCP em Minutos —",
        titlePart2: "Sem Consultores ou Planilhas",
        subtitle: "Desenvolvido especificamente para restaurantes, padarias, food trucks e pequenos produtores.",
        check1: "Em Conformidade",
        check2: "Personalizado para o seu negócio",
        check3: "Grátis para começar",
        cta: "Criar Plano Grátis",
        auditReady: "Pronto para Auditoria",
        validated: "Lógica Validada",
        compliance: { fda: "Compatível com FDA", eu: "UE 852/2004", codex: "Codex CXC 1-1969" }
      },
      audience: {
        title: "O iLoveHACCP é ideal para si?",
        subtitle: "Priorizamos a rapidez e a conformidade prática para pequenas e médias operações alimentares.",
        for_title: "Perfeito Para:",
        for_items: [
          "Pequenas e médias empresas alimentares",
          "Restaurantes, padarias, cafés e food trucks",
          "Criação de planos HACCP pela primeira vez",
          "Negócios a preparar-se para uma inspeção próxima"
        ],
        not_for_title: "Não é Ideal Se:",
        not_for_items: [
          "Necessita de certificação de nível empresarial",
          "Tem um sistema gerido por um consultor a tempo inteiro"
        ]
      },
      founder: {
        title: "Uma Nota do Fundador",
        text: "Criei o iLoveHACCP porque a consultoria tradicional é demasiado lenta e cara para as pequenas empresas. Democratizamos o acesso aos mesmos sistemas de segurança de alto padrão usados por grandes corporações.",
        role: "Líder Científico e Fundador",
        name: "Dr. Joao"
      },
      features: {
        title: "Por que as empresas nos amam",
        subtitle: "Priorizamos os resultados do seu negócio sobre tecnologia complexa.",
        f1_title: "Feito à Medida",
        f1_desc: "Gere um plano HACCP completo adaptado ao seu processo exato.",
        f2_title: "Simples & Acessível",
        f2_desc: "Não é necessária experiência em segurança alimentar.",
        f3_title: "Pronto para Inspeção",
        f3_desc: "Documentos prontos para exportar para inspeções."
      },
      howItWorks: {
        badge: "Processo Simples",
        title: "Como Funciona",
        subtitle: "Da página em branco à conformidade total em três etapas simples.",
        s1_title: "1. Responda perguntas",
        s1_desc: "Responda a algumas perguntas sobre o seu negócio e processos alimentares.",
        s2_title: "2. Plano gerado",
        s2_desc: "Geramos o seu plano HACCP personalizado automaticamente com a nossa tecnologia.",
        s3_title: "3. Baixe e Edite",
        s3_desc: "Baixe os seus documentos prontos para inspeção e edite-os a qualquer momento.",
        cta: "Começar Agora"
      },
      pricing: {
        title: "Escolha seu Nível de Conformidade",
        subtitle: "De uma verificação rápida a um sistema profissional totalmente validado.",
        free: {
          title: "Plano Grátis",
          price: "€0",
          desc: "Geração completa de planos self-service.",
          f1: "Acesso Completo ao Assistente",
          f2: "Plano HACCP Completo",
          f3: "Fluxo de Processo Completo",
          f4: "Sem Revisão Profissional",
          cta: "Começar"
        },
        starter: {
          badge: "Recomendado",
          title: "Revisão Inicial",
          price: "€79",
          desc: "Tudo no Grátis + Revisão Profissional.",
          f1: "Tudo no Grátis",
          f2: "Arquivos Editáveis (Word/Excel)",
          f3: "Revisão Profissional Básica",
          cta: "Começar"
        },
        review: {
          title: "Revisão de Especialista",
          price: "Desde €99",
          desc: "Atualize um plano HACCP existente.",
          f1: "Revisão Profissional Completa",
          f2: "Atualização de Regulamentos",
          f3: "Relatório Detalhado",
          cta: "Agendar Revisão"
        },
        enterprise: {
          title: "Empresa Estratégica",
          price: "Personalizado",
          desc: "Para operações complexas, multi-site ou industriais.",
          f1: "Revisão Completa do Plano",
          f2: "Opções de Auditoria In Situ",
          f3: "Consultor Dedicado",
          f4: "Suporte Prioritário",
          cta: "Contatar"
        }
      },
      finalCta: {
        title: "Pronto para estar em conformidade?",
        btn: "Crie Seu Plano Grátis",
        sub: "Sem cartão de crédito. Cancele a qualquer momento."
      }
    },
    hero: {
      title: "Planos HACCP em Minutos.",
      subtitle: "Gere planos HACCP prontos para auditoria em minutos com a nossa ferramenta gratuita.",
      cta: "Criar Plano Grátis"
    },
    wizard: {
      title: "Vamos criar o seu plano HACCP",
      subtitle: "Responda a algumas perguntas e a nossa ferramenta redigirá um documento completo.",
      reassurance: "Não é necessário conhecimento prévio. Pode pular perguntas ou editar depois.",
      start: "Iniciar Criador",
      next: "Próximo",
      back: "Voltar",
      add: "Adicionar",
      generating: "Criando seu plano HACCP...",
      generatingDesc: "A nossa ferramenta está a aplicar padrões ao seu contexto de negócios.",
      download: "Baixar PDF",
      success: "Seu rascunho está pronto!",
      step_business: "Contexto de Negócios",
      step_products: "Detalhes do Produto"
    },
    pdf: {
      title: "Plano HACCP",
      subtitle: "Sistema de Gestão de Segurança Alimentar",
      facility: "Nome da Instalação",
      product_scope: "Escopo do Produto",
      date_issue: "Data de Emissão",
      standard: "Padrão",
      disclaimer: "Este documento é um rascunho gerado e deve ser validado por um profissional qualificado.",
      confidential: "CONFIDENCIAL",
      version: "Versão 1.0",
      generated_by: "Gerado por ilovehaccp.com - Soluções de Segurança Alimentar",
      s1_title: "1.0 Visão Geral do Plano",
      s1_executive: "1.1 Resumo Executivo",
      s1_product: "1.2 Descrição do Produto",
      s1_process: "1.3 Narrativa do Processo",
      lbl_product_name: "Nome do Produto",
      lbl_description: "Descrição",
      lbl_intended_use: "Uso Pretendido",
      lbl_storage: "Armazenamento",
      s2_title: "2.0 Programas de Pré-requisitos (PPR)",
      s2_desc: "Programas fundamentais para controlar perigos gerais de higiene.",
      col_program: "Programa",
      col_details: "Detalhes e Controle",
      s3_title: "3.0 Análise de Perigos (Princípio 1 e 2)",
      col_step: "Etapa",
      col_hazards: "Perigos (B/Q/F)",
      col_control: "Medida de Controle",
      col_ccp: "PCC?",
      val_prerequisite: "Pré-requisito",
      s4_title: "4.0 Tabela de Controle HACCP (Princípios 3-7)",
      s4_desc: "Plano de controle detalhado para os Pontos Críticos de Controle identificados.",
      lbl_hazard: "PERIGO SIGNIFICATIVO",
      lbl_critical_limit: "Limite Crítico",
      lbl_monitoring: "Monitoramento",
      lbl_corrective: "Ação Corretiva",
      msg_no_ccps: "Nenhum Ponto Crítico de Controle (PCC) identificado. O processo é controlado via PPR.",
      sign_prepared: "Preparado por (Líder da Equipe HACCP)",
      sign_approved: "Aprovado por (Gerência)",
      tk_title: "Ferramentas: Registros de Monitoramento",
      tk_temp_title: "Apêndice A: Registro de Controle de Temperatura",
      tk_temp_desc: "Use este registro para PCCs (ex: Cozimento, Armazenamento Refrigerado).",
      col_date: "Data",
      col_time: "Hora",
      col_item: "Item/Equipamento",
      col_temp: "Temp (°C)",
      col_action: "Ação",
      col_sign: "Assinatura",
      msg_corrective: "*Ação Corretiva necessária se os Limites Críticos forem violados.",
      tk_clean_title: "Apéndice B: Lista de Limpeza Diária",
      col_task: "Tarefa de Limpieza",
      days: { mon: "Seg", tue: "Ter", wed: "Qua", thu: "Qui", fri: "Sex", sat_sun: "Sáb/Dom" },
      tasks: {
        surfaces: "Superfícies e Tábuas de Preparação",
        cooking: "Equipamentos de Cozinha (Fornos/Fogões)",
        fridges: "Refrigeradores e Puxadores",
        sinks: "Pias e Torneiras",
        floors: "Pisos e Ralos",
        waste: "Lixeiras (Esvaziadas e Limpas)",
        handwash: "Estações de Lavagem de Mãos"
      },
      tk_train_title: "Apêndice C: Registro de Treinamento",
      col_employee: "Nome do Funcionário",
      col_train_desc: "Descrição do Treinamento"
    }
  }
};
const dictionary = {
    nav: {
      builder: "Generatore HACCP",
      features: "Funzionalità",
      resources: "Risorse",
      pricing: "Prezzi",
      about: "Chi siamo",
      contact: "Contatto",
      login: "Accedi",
      getStarted: "Registrazione",
      articles: "Articoli",
      faqs: "FAQ",
      logout: "Esci",
      signedInAs: "Accesso come",
      loggedInAs: "Connesso come",
      dashboard: "Dashboard",
      settings: "Impostazioni",
      createAccount: "Crea account"
    },
    dashboard: {
      title: "La mia dashboard",
      subtitle: "Gestisci la tua documentazione di sicurezza alimentare",
      backToHome: "Torna alla home",
      createNewPlan: "Crea nuovo piano",
      activeDrafts: "Bozze attive",
      noActiveDrafts: "Nessuna bozza attiva.",
      documentsReviews: "Documenti e revisioni",
      noPlansYet: "Nessun piano generato.",
      missingPlan: "Manca un piano?",
      missingPlanDesc: "Se hai generato un piano prima della registrazione, inserisci l'ID del piano qui sotto per aggiungerlo alla dashboard.",
      pastePlanId: "Incolla ID piano...",
      importPlan: "Importa piano",
      importing: "Importazione...",
      confirmImport: "Conferma importazione",
      confirmImportDesc: "Stai per importare il piano HACCP con ID",
      ensureCorrectId: "Assicurati che sia l'ID corretto prima di procedere.",
      yesImportPlan: "Sì, importa piano",
      tableHeaders: {
        draft: "Bozza",
        business: "Azienda",
        updated: "Aggiornato",
        actions: "Azioni",
        plan: "Piano",
        date: "Data",
        files: "File",
        review: "Revisione",
        summary: "Riepilogo"
      },
      reviewStatus: {
        concluded: "Revisione conclusa",
        inProgress: "Revisione in corso",
        paid: "Pagato",
        notRequested: "Non richiesta",
        inReview: "IN REVISIONE",
        sentByEmail: "Inviato via email"
      },
      viewSummary: "Vedi riepilogo",
      unfinishedDraft: "Bozza incompleta"
    },
    actions: {
      resume: "Riprendi",
      rename: "Rinomina",
      delete: "Elimina",
      confirm: "Conferma",
      cancel: "Annulla",
      import: "Importa",
      export: "Esporta",
      download: "Scarica",
      unlockExport: "Sblocca esportazione",
      requestReview: "Richiedi revisione",
      paid: "PAGATO"
    },
    messages: {
      confirmDeleteDraft: "Sei sicuro di voler eliminare questa bozza? Questa azione non può essere annullata.",
      confirmDeletePlan: "Sei sicuro di voler eliminare questo piano? Questa azione non può essere annullata.",
      draftNameEmpty: "Il nome della bozza non può essere vuoto.",
      enterNewDraftName: "Inserisci un nuovo nome per la bozza:",
      importSuccess: "Piano importato con successo!",
      importFailed: "Importazione fallita.",
      deleteSuccess: "Piano eliminato con successo.",
      deleteFailed: "Eliminazione fallita. Riprova.",
      renameFailed: "Rinomina bozza fallita. Riprova.",
      downloadFailed: "Download fallito",
      checkoutFailed: "Avvio checkout fallito",
      systemError: "Errore di sistema nell'avvio del checkout.",
      cannotDeleteDependencies: "Impossibile eliminare: ha dipendenze attive. Contatta l'assistenza.",
      cannotDeleteReviewInProgress: "Impossibile eliminare mentre la revisione è in corso",
      paymentSuccess: "Pagamento elaborato con successo.",
      reviewRequested: "Revisione richiesta con successo.",
      exportUnlocked: "Esportazione sbloccata con successo."
    },
    footer: {
      description: "La piattaforma di documentazione sulla sicurezza alimentare più avanzata al mondo. Aiutiamo le aziende a semplificare la burocrazia.",
      platform: "Piattaforma",
      haccpBuilder: "Generatore HACCP",
      resourcesTitle: "Risorse",
      haccpExamplePdf: "Esempio di Piano HACCP PDF",
      haccpTemplate: "Modello HACCP",
      euUkRequirements: "Requisiti UE e Regno Unito",
      knowledgeBase: "Knowledge Base",
      complianceFaqs: "FAQ sulla conformità",
      companyLegal: "Azienda e legale",
      contactSupport: "Contatta il supporto",
      privacyPolicy: "Informativa sulla privacy",
      termsOfService: "Termini di servizio",
      cookiePolicy: "Policy sui cookie",
      refundPolicy: "Policy di rimborso",
      allRightsReserved: "Tutti i diritti riservati.",
      disclaimer: "Disclaimer: iLoveHACCP fornisce strumenti software solo a scopo di documentazione. Sebbene i nostri modelli seguano i principi del Regolamento CE 852/2004, non siamo uno studio legale, un ente regolatore o un'agenzia di certificazione. L'uso di questa piattaforma non garantisce l'approvazione dell'ispezione. Verifica sempre il piano finale con l'autorità sanitaria locale o un Environmental Health Officer."
    },
    landing: {
      hero: {
        titlePart1: "Crea un piano HACCP in pochi minuti —",
        titlePart2: "Senza consulenti o fogli di calcolo",
        subtitle: "Crea un piano HACCP in pochi minuti. Strumenti professionali per ristoranti, produttori e catering.",
        check1: "Allineato agli standard",
        check2: "Su misura per la tua attività",
        check3: "Gratis per iniziare",
        cta: "Crea il tuo piano gratis",
        compliance: { standard_1: "EC 852/2004", eu: "Standard FSA UK", codex: "Codex CXC 1-1969" }
      },
      audience: {
        title: "iLoveHACCP fa per te?",
        subtitle: "Diamo priorità alla velocità e all'allineamento pratico per piccole e medie attività alimentari.",
        for_title: "Perfetto per:",
        for_items: [
          "Piccole e medie imprese alimentari",
          "Ristoranti, panetterie, caffè e food truck",
          "Prima creazione di un piano HACCP",
          "Aziende che si preparano a un'ispezione imminente"
        ],
        not_for_title: "Non ideale se:",
        not_for_items: [
          "Hai bisogno di certificazione di livello enterprise",
          "Hai un sistema gestito da un consulente a tempo pieno"
        ]
      },
      founder: {
        title: "Una nota del fondatore",
        text: "Ho creato iLoveHACCP perché la consulenza tradizionale è troppo lenta e costosa per le piccole aziende. Democratizziamo l'accesso a sistemi di sicurezza di alto livello.",
        role: "Responsabile scientifico e fondatore",
        name: "Dr. Joao"
      },
      features: {
        title: "Perché le aziende alimentari ci amano",
        subtitle: "Diamo priorità ai risultati del tuo business rispetto alla tecnologia complessa.",
        f1_title: "Su misura",
        f1_desc: "Genera un piano HACCP completo su misura del tuo processo.",
        f2_title: "Semplice e accessibile",
        f2_desc: "Nessuna competenza in sicurezza alimentare richiesta.",
        f3_title: "Supporto alle ispezioni",
        f3_desc: "Esporta documenti organizzati per le ispezioni."
      },
      howItWorks: {
        badge: "Processo semplice",
        title: "Come funziona",
        subtitle: "Da pagina bianca a bozza di documento in tre semplici passaggi.",
        s1_title: "1. Rispondi alle domande",
        s1_desc: "Rispondi a qualche domanda sulla tua attività e sui processi.",
        s2_title: "2. Piano generato",
        s2_desc: "Generiamo automaticamente il tuo piano HACCP con la nostra tecnologia.",
        s3_title: "3. Scarica e modifica",
        s3_desc: "Scarica i documenti e modificali quando vuoi.",
        cta: "Inizia ora"
      },
      pricing: {
        title: "Scegli il tuo piano",
        subtitle: "Da una bozza gratuita a un export professionale.",
        free: {
          title: "Bozza gratuita",
          price: "€0",
          desc: "Crea e visualizza in anteprima la bozza del tuo piano HACCP.",
          f1: "Generatore HACCP completo",
          f2: "Salvataggio automatico bozza",
          f3: "Checklist di completezza del piano",
          f4: "Download anteprima con filigrana",
          cta: "Inizia",
          note: "Solo bozza — nessun audit o approvazione."
        },
        starter: {
          badge: "Più popolare",
          title: "Export documenti",
          price: "€39",
          desc: "PDF e Word puliti (senza filigrana).",
          f1: "Export PDF + Word",
          f2: "Rimuove la filigrana",
          f3: "Pronto da stampare e condividere",
          f4: "Download immediato",
          cta: "Scarica PDF & Word",
          note: "Solo export documenti — nessuna revisione, audit, verifica o approvazione."
        },
        review: {
          title: "Revisione del piano e feedback",
          price: "€99",
          desc: "Feedback umano sulla bozza del tuo piano HACCP.",
          f1: "Verifica completezza e coerenza",
          f2: "Lacune e sezioni poco chiare evidenziate",
          f3: "Annotazioni dettagliate del revisore",
          f4: "Revisione express 48h",
          cta: "Richiedi revisione",
          note: "Servizio di revisione — nessuna certificazione o approvazione normativa."
        },
        enterprise: {
          title: "Enterprise",
          price: "Personalizzato",
          desc: "Per operazioni complesse, multi-sito o industriali.",
          f1: "Revisione completa del piano",
          f2: "Opzioni di audit in loco",
          f3: "Consulente dedicato",
          f4: "Supporto prioritario",
          cta: "Contatta vendite"
        }
      },
      finalCta: {
        title: "Pronto alla conformità?",
        btn: "Crea il tuo piano gratis"
      }
    },
    hero: {
      title: "Piani HACCP in pochi minuti.",
      subtitle: "Genera piani HACCP professionali in pochi minuti con il nostro strumento gratuito.",
      cta: "Crea piano gratis"
    },
    wizard: {
      title: "Creiamo il tuo piano HACCP",
      subtitle: "Rispondi a qualche domanda e il nostro strumento redigerà un documento completo.",
      reassurance: "Non è richiesta conoscenza HACCP. Puoi saltare domande o modificare dopo.",
      start: "Avvia generatore",
      next: "Avanti",
      back: "Indietro",
      add: "Aggiungi",
      generating: "Creazione del tuo piano HACCP...",
      generatingDesc: "Il nostro strumento applica gli standard al tuo contesto aziendale.",
      download: "Scarica PDF",
      success: "La tua bozza è pronta!",
      step_business: "Contesto aziendale",
      step_products: "Dettagli del prodotto"
    },
    builder_inputs: {
      ingredients: {
        'Raw Meat': 'Carne cruda',
        'Poultry': 'Pollame',
        'Fish': 'Pesce',
        'Eggs': 'Uova',
        'Dairy': 'Latticini',
        'Fresh Produce': 'Prodotti freschi',
        'Dry Goods': 'Prodotti secchi',
        'Frozen Goods': 'Surgelati',
        'Oils & Fats': 'Oli e grassi',
        'Flour': 'Farina',
        'Sugar': 'Zucchero',
        'Yeast': 'Lievito',
        'Butter': 'Burro',
        'Milk': 'Latte',
        'Nuts': 'Frutta secca',
        'Chocolate': 'Cioccolato',
        'Fruit Fillings': 'Ripieni di frutta',
        'Spices': 'Spezie',
        'Raw Beef': 'Manzo crudo',
        'Raw Pork': 'Maiale crudo',
        'Raw Lamb': 'Agnello crudo',
        'Raw Poultry': 'Pollame crudo',
        'Sausage Casings': 'Budelli per salsicce',
        'Marinades': 'Marinature',
        'Salt': 'Sale',
        'Coffee Beans': 'Chicchi di caffè',
        'Syrups': 'Sciroppi',
        'Pastries': 'Pasticceria',
        'Sandwich Fillings': 'Farciture per panini',
        'Salad Greens': 'Verdure per insalata',
        'Tea': 'Tè',
        'Bulk Raw Materials': 'Materie prime sfuse',
        'Additives': 'Additivi',
        'Preservatives': 'Conservanti',
        'Water': 'Acqua',
        'Packaging Material': 'Materiale di imballaggio',
        'Processing Aids': 'Coadiuvanti di processo',
        'Pre-cooked Meals': 'Piatti precotti',
        'Fresh Salads': 'Insalate fresche',
        'Buffet Items': 'Articoli da buffet',
        'Sauces': 'Salse',
        'Desserts': 'Dessert',
        'Raw Red Meat': 'Carne rossa cruda',
        'Raw Fish & Seafood': 'Pesce e frutti di mare crudi',
        'Raw Shellfish': 'Molluschi crudi',
        'Shell Eggs': 'Uova con guscio',
        'Ready-to-Eat (RTE)': 'Pronto da mangiare (RTE)',
        'Baked Goods': 'Prodotti da forno',
        'Grains & Cereals': 'Cereali',
        'Canned / Dry Goods': 'Conserve / prodotti secchi',
        'Beverages': 'Bevande'
      },
      equipment: {
        'Rational Oven': 'Forno Rational',
        'Stove': 'Fornello',
        'Grill': 'Griglia',
        'Deep Fryer': 'Friggitrice',
        'Walk-in Fridge': 'Cella frigorifera',
        'Freezer': 'Congelatore',
        'Dishwasher': 'Lavastoviglie',
        'Sous-vide Circulator': 'Circolatore sous-vide',
        'Vacuum Packer': 'Confezionatrice sottovuoto',
        'Deck Oven': 'Forno a platea',
        'Proofer': 'Camera di lievitazione',
        'Planetary Mixer': 'Impastatrice planetaria',
        'Dough Sheeter': 'Sfogliatrice per impasto',
        'Cooling Racks': 'Griglie di raffreddamento',
        'Spiral Mixer': 'Impastatrice a spirale',
        'Bread Slicer': 'Affettatrice per pane',
        'Industrial Mincer': 'Tritacarne industriale',
        'Sausage Filler': 'Insaccatrice',
        'Slicer': 'Affettatrice',
        'Cold Room': 'Cella fredda',
        'Bone Saw': 'Sega per ossa',
        'Knife Sterilizer': 'Sterilizzatore coltelli',
        'Scales': 'Bilance',
        'Espresso Machine': 'Macchina per espresso',
        'Milk Steamer': 'Lancia vapore',
        'Panini Press': 'Piastra per panini',
        'Display Fridge': 'Vetrina frigo',
        'Bean Grinder': 'Macina caffè',
        'Ice Machine': 'Macchina del ghiaccio',
        'Conveyor System': 'Sistema di trasporto',
        'Industrial Mixer': 'Miscelatore industriale',
        'Metal Detector': 'Metal detector',
        'Filling Machine': 'Macchina riempitrice',
        'Pasteurizer': 'Pastorizzatore',
        'Pallet Jack': 'Transpallet',
        'Lab Testing Kit': 'Kit di test di laboratorio',
        'Portable Burners': 'Fornelli portatili',
        'Insulated Hot Boxes': 'Contenitori termici isolati',
        'Mobile Refrigeration': 'Refrigerazione mobile',
        'Hand Wash Station': 'Postazione lavaggio mani',
        'Blast Chiller': 'Abbattitore',
        'Oven': 'Forno',
        'Prep Tables': 'Tavoli di preparazione',
        'Sink': 'Lavello',
        'Fridge': 'Frigorifero'
      },
      options: {
        'Restaurant': 'Ristorante',
        'Bakery': 'Panetteria',
        'Butcher Shop': 'Macelleria',
        'Cafe / Coffee Shop': 'Caffè / Coffee shop',
        'Food Manufacturer': 'Produttore alimentare',
        'Catering Service': 'Servizio catering',
        'Food Truck / Mobile Unit': 'Food truck / unità mobile',
        'Hotel Kitchen': "Cucina d'hotel",
        'School / Canteen': 'Scuola / Mensa',
        'Hospital Kitchen': 'Cucina ospedaliera',
        'Ghost Kitchen': 'Ghost kitchen',
        'Yes': 'Sì',
        'No': 'No',
        'Short (< 3 days)': 'Breve (< 3 giorni)',
        'Medium (< 1 week)': 'Medio (< 1 settimana)',
        'Long (> 1 week)': 'Lungo (> 1 settimana)',
        'Daily': 'Quotidiano',
        'Weekly': 'Settimanale',
        'Shift-based': 'A turni',
        'Yes, scheduled': 'Sì, programmato',
        'Occasionally': 'Occasionalmente',
        'Yes, digital': 'Sì, digitale',
        'Yes, paper-based': 'Sì, cartaceo',
        'Partial': 'Parziale',
        'Digital (App/Cloud)': 'Digitale (App/Cloud)',
        'Paper-based': 'Cartaceo',
        'Mixed': 'Misto',
        'Minimal': 'Minimale',
        'Corporate': 'Corporate',
        'Modern': 'Moderno',
        'None / No Allergens': 'Nessuno / Senza allergeni',
        'Gluten': 'Glutine',
        'Crustaceans': 'Crostacei',
        'Fish': 'Pesce',
        'Peanuts': 'Arachidi',
        'Soy': 'Soia',
        'Milk': 'Latte',
        'Nuts': 'Frutta secca',
        'Celery': 'Sedano',
        'Mustard': 'Senape',
        'Sesame': 'Sesamo',
        'Eggs': 'Uova'
      },
      process_steps: {
        'Receiving': 'Ricevimento',
        'Storage': 'Stoccaggio',
        'Thawing': 'Scongelamento',
        'Prep': 'Preparazione',
        'Cooking': 'Cottura',
        'Cooling': 'Raffreddamento',
        'Reheating': 'Riscaldamento',
        'Holding': 'Mantenimento caldo',
        'Packaging': 'Confezionamento'
      }
    },
    marketing: {
      wordDocx: {
        metaTitle: "Piano HACCP Word (DOCX) | Modello modificabile",
        metaDescription: "Crea un piano HACCP modificabile in Word (DOCX) per la conformità UE e UK. Personalizza pericoli, CCP e monitoraggi con iLoveHACCP.",
        hero: {
          eyebrow: "Export Word modificabile",
          title: "Piano HACCP Word (DOCX)",
          subtitle: "Genera un piano HACCP conforme ed esportalo come documento Word modificabile che il tuo team può aggiornare."
        },
        ctas: {
          primary: { label: "Crea il mio piano HACCP", href: "/builder" },
          secondary: { label: "Vedi PDF di esempio", href: "/sample-haccp-plan-pdf" }
        },
        highlights: {
          title: "Perché scegliere DOCX",
          items: [
            {
              title: "Completamente modificabile",
              description: "Aggiorna pericoli, CCP e monitoraggi senza ricominciare."
            },
            {
              title: "Struttura pronta per audit",
              description: "Allineata al Reg. CE 852/2004 con sezioni chiare."
            },
            {
              title: "Pronto per il brand",
              description: "Aggiungi loghi, dati del sito e riferimenti SOP in pochi minuti."
            }
          ]
        },
        checklist: {
          title: "Perfetto per audit e aggiornamenti",
          items: [
            "Personalizza limiti critici, monitoraggio e azioni correttive",
            "Traccia le revisioni per la conformità continua",
            "Condividi con manager, chef e auditor",
            "Esporta in PDF quando serve un layout fisso"
          ]
        },
        note: "Serve un layout fisso? Esporta in PDF in qualsiasi momento."
      },
      examplePdf: {
        metaTitle: "Piano HACCP PDF di esempio | Anteprima gratuita",
        metaDescription: "Anteprima di un PDF di esempio con analisi dei pericoli, CCP e registri di monitoraggio. Crea il tuo piano in pochi minuti.",
        hero: {
          eyebrow: "Anteprima gratuita del documento",
          title: "Piano HACCP PDF di esempio",
          subtitle: "Consulta un piano HACCP completo con analisi dei pericoli, CCP e registri di monitoraggio prima di crearne uno tuo."
        },
        ctas: {
          primary: { label: "Apri il PDF di esempio", href: "/sample-haccp-plan-pdf" },
          secondary: { label: "Crea il mio piano HACCP", href: "/builder" }
        },
        highlights: {
          title: "Cosa include l'esempio",
          items: [
            {
              title: "Tabelle di analisi dei pericoli",
              description: "Pericoli biologici, chimici e fisici per ogni fase."
            },
            {
              title: "Determinazione dei CCP",
              description: "Logica dei punti critici e limiti."
            },
            {
              title: "Registri di monitoraggio",
              description: "Checklist giornaliere di temperatura e pulizia."
            }
          ]
        },
        checklist: {
          title: "Usa l'anteprima per",
          items: [
            "Capire la struttura richiesta dagli auditor",
            "Individuare le sezioni da personalizzare",
            "Condividerla con il team prima di generare",
            "Confermare le opzioni Word + PDF"
          ]
        },
        note: "Pronto ad andare oltre l'esempio? Crea un piano su misura."
      },
      restaurants: {
        metaTitle: "HACCP per ristoranti | Piano di sicurezza alimentare",
        metaDescription: "Crea un piano HACCP per ristoranti in linea con il Reg. CE 852/2004. Documenta cottura, raffreddamento, stoccaggio e sanificazione.",
        hero: {
          eyebrow: "Builder HACCP per ristoranti",
          title: "HACCP per ristoranti",
          subtitle: "Crea un piano HACCP per ristoranti che copre cottura, raffreddamento, stoccaggio, allergeni e controlli di sanificazione."
        },
        ctas: {
          primary: { label: "Avvia il piano ristorante", href: "/builder" },
          secondary: { label: "Vedi il modello HACCP", href: "/haccp-template" }
        },
        highlights: {
          title: "Pensato per cucine operative",
          items: [
            {
              title: "Flussi di lavoro dettagliati",
              description: "Mappa ricezione, prep, cottura, raffreddamento e servizio."
            },
            {
              title: "Controlli allergeni e fornitori",
              description: "Documenta fornitori approvati e gestione allergeni."
            },
            {
              title: "Registri di verifica giornalieri",
              description: "Pulizia, temperature e azioni correttive."
            }
          ]
        },
        checklist: {
          title: "Copertura per ristoranti",
          items: [
            "Limiti per mantenimento caldo e freddo",
            "Controlli contro la contaminazione incrociata",
            "Formazione del personale e igiene",
            "Registri e revisioni pronti per audit"
          ]
        },
        note: "Genera una volta e aggiorna quando il menu cambia."
      }
    },
    pdf: {
      title: "Piano HACCP",
      subtitle: "Sistema di gestione della sicurezza alimentare",
      facility: "Nome della struttura",
      product_scope: "Ambito prodotto",
      date_issue: "Data di emissione",
      standard: "Standard",
      disclaimer: "Questo documento è una bozza generata e deve essere convalidata da un professionista qualificato.",
      confidential: "RISERVATO",
      version: "Versione 1.0",
      generated_by: "Generato da ilovehaccp.com - Soluzioni per la sicurezza alimentare",
      s1_title: "Sezione 1 — Team HACCP e ambito",
      s2_title: "Sezione 2 — Descrizione del prodotto",
      s3_title: "Sezione 3 — Diagramma di flusso del processo",
      s4_title: "Sezione 4 — Programmi prerequisiti (PRP)",
      s5_title: "Sezione 5 — Analisi dei pericoli",
      s6_title: "Sezione 6 — Determinazione CCP",
      s7_title: "Sezione 7 — Gestione CCP",
      s7_desc: "I Punti Critici di Controllo (CCP) sono stati determinati con l'albero decisionale del Codex Alimentarius.",
      s8_title: "Sezione 8 — Verifica e validazione",
      s9_title: "Sezione 9 — Registrazioni e revisione",
      s10_title: "Sezione 9 — Registrazioni e revisione",
      lbl_product_name: "Nome del prodotto",
      lbl_description: "Descrizione",
      lbl_ingredients: "Ingredienti principali",
      lbl_shelf_life: "Shelf life",
      lbl_intended_use: "Uso previsto",
      lbl_further_preparation: "Ulteriore preparazione/manipolazione",
      lbl_storage: "Conservazione",
      col_program: "Programma",
      col_details: "Dettagli di controllo",
      col_step: "Fase",
      col_hazards: "Pericoli identificati",
      col_control: "Misure di controllo",
      col_ccp: "CCP?",
      val_prerequisite: "Prerequisito",

      s4_desc: "Piano di controllo dettagliato per i CCP identificati.",
      lbl_hazard: "PERICOLO SIGNIFICATIVO",
      lbl_critical_limit: "Limite critico",
      lbl_monitoring: "Monitoraggio",
      lbl_corrective: "Azione correttiva",
      msg_no_ccps: "Nessun Punto Critico di Controllo (CCP) identificato. Il processo è controllato tramite PRP.",
      sign_prepared: "Preparato da (Responsabile team HACCP)",
      sign_approved: "Approvato da (Direzione)",
      tk_title: "Toolkit: Registri di monitoraggio",
      tk_temp_title: "Appendice A: Registro controllo temperatura",
      tk_temp_desc: "Usa questo registro per i CCP (ad esempio cottura, stoccaggio refrigerato).",
      col_date: "Data",
      col_time: "Ora",
      col_item: "Voce/Attrezzatura",
      col_temp: "Temp (°C)",
      col_action: "Azione",
      col_sign: "Firma",
      msg_corrective: "*Azione correttiva richiesta se i limiti critici vengono superati. Registra le azioni nella colonna 'Azione'.",
      tk_clean_title: "Appendice B: Checklist pulizie giornaliere",
      col_task: "Attività di pulizia",
      days: { mon: "Lun", tue: "Mar", wed: "Mer", thu: "Gio", fri: "Ven", sat_sun: "Sab/Dom" },
      tasks: {
        surfaces: "Superfici e taglieri di preparazione",
        cooking: "Attrezzature di cottura (forni/piani)",
        fridges: "Frigoriferi e maniglie",
        sinks: "Lavelli e rubinetti",
        floors: "Pavimenti e scarichi",
        waste: "Cestini (svuotati e puliti)",
        handwash: "Postazioni lavaggio mani"
      },
      tk_train_title: "Appendice C: Registro formazione",
      col_employee: "Nome dipendente",
      col_train_desc: "Descrizione formazione (ad esempio HACCP livello 2)",
      cover_created_by: "Creato da",
      cover_approved_by: "Approvato da",
      cover_date: "Data",
      cover_version: "Versione",
      lbl_page: "Pagina",
      lbl_of: "di"
    }
  };

export default dictionary;

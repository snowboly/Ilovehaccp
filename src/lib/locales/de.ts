const dictionary = {
    nav: {
      builder: "HACCP-Builder",
      features: "Funktionen",
      resources: "Ressourcen",
      pricing: "Preise",
      about: "Über uns",
      contact: "Kontakt",
      login: "Anmelden",
      getStarted: "Registrierung",
      articles: "Artikel",
      faqs: "FAQs",
      logout: "Abmelden",
      signedInAs: "Angemeldet als",
      loggedInAs: "Eingeloggt als",
      dashboard: "Dashboard",
      settings: "Einstellungen",
      createAccount: "Konto erstellen"
    },
    dashboard: {
      title: "Mein Dashboard",
      subtitle: "Verwalten Sie Ihre Lebensmittelsicherheitsdokumentation",
      backToHome: "Zurück zur Startseite",
      createNewPlan: "Neuen Plan erstellen",
      activeDrafts: "Aktive Entwürfe",
      noActiveDrafts: "Keine aktiven Entwürfe.",
      documentsReviews: "Dokumente & Prüfungen",
      noPlansYet: "Noch keine generierten Pläne.",
      missingPlan: "Plan fehlt?",
      missingPlanDesc: "Wenn Sie vor der Registrierung einen Plan erstellt haben, geben Sie unten die Plan-ID ein, um ihn zu Ihrem Dashboard hinzuzufügen.",
      pastePlanId: "Plan-ID einfügen...",
      importPlan: "Plan importieren",
      importing: "Wird importiert...",
      confirmImport: "Import bestätigen",
      confirmImportDesc: "Sie sind dabei, den HACCP-Plan mit der ID zu importieren",
      ensureCorrectId: "Stellen Sie sicher, dass dies die richtige ID ist, bevor Sie fortfahren.",
      yesImportPlan: "Ja, Plan importieren",
      tableHeaders: {
        draft: "Entwurf",
        business: "Unternehmen",
        updated: "Aktualisiert",
        actions: "Aktionen",
        plan: "Plan",
        date: "Datum",
        files: "Dateien",
        review: "Prüfung",
        summary: "Zusammenfassung"
      },
      reviewStatus: {
        concluded: "Prüfung abgeschlossen",
        inProgress: "Prüfung läuft",
        paid: "Bezahlt",
        notRequested: "Nicht angefordert",
        inReview: "IN PRÜFUNG",
        sentByEmail: "Per E-Mail gesendet"
      },
      viewSummary: "Zusammenfassung ansehen",
      unfinishedDraft: "Unvollständiger Entwurf"
    },
    actions: {
      resume: "Fortsetzen",
      rename: "Umbenennen",
      delete: "Löschen",
      confirm: "Bestätigen",
      cancel: "Abbrechen",
      import: "Importieren",
      export: "Exportieren",
      download: "Herunterladen",
      unlockExport: "Export freischalten",
      requestReview: "Prüfung anfordern",
      paid: "BEZAHLT"
    },
    messages: {
      confirmDeleteDraft: "Möchten Sie diesen Entwurf wirklich löschen? Dies kann nicht rückgängig gemacht werden.",
      confirmDeletePlan: "Möchten Sie diesen Plan wirklich löschen? Dies kann nicht rückgängig gemacht werden.",
      draftNameEmpty: "Entwurfsname darf nicht leer sein.",
      enterNewDraftName: "Neuen Entwurfsnamen eingeben:",
      importSuccess: "Plan erfolgreich importiert!",
      importFailed: "Import fehlgeschlagen.",
      deleteSuccess: "Plan erfolgreich gelöscht.",
      deleteFailed: "Löschen fehlgeschlagen. Bitte versuchen Sie dies noch einmal.",
      renameFailed: "Umbenennen des Entwurfs fehlgeschlagen. Bitte versuchen Sie dies noch einmal.",
      downloadFailed: "Download fehlgeschlagen",
      checkoutFailed: "Checkout konnte nicht gestartet werden",
      systemError: "Systemfehler beim Start des Checkouts.",
      cannotDeleteDependencies: "Kann nicht gelöscht werden: Es bestehen aktive Abhängigkeiten. Bitte kontaktieren Sie den Support.",
      cannotDeleteReviewInProgress: "Löschen nicht möglich, während die Prüfung läuft",
      paymentSuccess: "Zahlung erfolgreich verarbeitet.",
      reviewRequested: "Prüfung erfolgreich angefordert.",
      exportUnlocked: "Export erfolgreich freigeschaltet."
    },
    footer: {
      description: "Die weltweit fortschrittlichste Plattform für Lebensmittelsicherheitsdokumentation. Wir helfen Unternehmen, ihren Papierkram zu vereinfachen.",
      platform: "Plattform",
      haccpBuilder: "HACCP-Builder",
      resourcesTitle: "Ressourcen",
      haccpExamplePdf: "HACCP-Plan Beispiel-PDF",
      haccpTemplate: "HACCP-Vorlage",
      euUkRequirements: "EU- und UK-Anforderungen",
      knowledgeBase: "Wissensdatenbank",
      complianceFaqs: "Compliance-FAQs",
      companyLegal: "Unternehmen & Rechtliches",
      contactSupport: "Support kontaktieren",
      privacyPolicy: "Datenschutzerklärung",
      termsOfService: "Nutzungsbedingungen",
      cookiePolicy: "Cookie-Richtlinie",
      refundPolicy: "Erstattungsrichtlinie",
      allRightsReserved: "Alle Rechte vorbehalten.",
      disclaimer: "Haftungsausschluss: iLoveHACCP stellt Softwaretools ausschließlich zu Dokumentationszwecken bereit. Obwohl unsere Vorlagen an den Prinzipien der Verordnung (EG) 852/2004 ausgerichtet sind, sind wir keine Kanzlei, Aufsichtsbehörde oder Zertifizierungsstelle. Die Nutzung dieser Plattform garantiert keine Inspektionsfreigabe. Prüfen Sie Ihren finalen Plan stets mit Ihrer örtlichen Gesundheitsbehörde oder einem Environmental Health Officer."
    },
    landing: {
      hero: {
        titlePart1: "Erstellen Sie einen HACCP-Plan in Minuten —",
        titlePart2: "Ohne Berater oder Tabellenkalkulationen",
        subtitle: "Erstellen Sie in Minuten einen HACCP-Plan. Professionelle Lebensmittelsicherheits-Tools für Restaurants, Hersteller und Catering.",
        check1: "Entspricht den Standards",
        check2: "Individuell für Ihr Unternehmen",
        check3: "Kostenlos starten",
        cta: "Plan kostenlos erstellen",
        compliance: { standard_1: "EC 852/2004", eu: "UK FSA-Standards", codex: "Codex CXC 1-1969" }
      },
      audience: {
        title: "Ist iLoveHACCP das Richtige für Sie?",
        subtitle: "Wir priorisieren Geschwindigkeit und praxisnahe Ausrichtung für kleine bis mittlere Lebensmittelbetriebe.",
        for_title: "Perfekt für:",
        for_items: [
          "Kleine und mittlere Lebensmittelbetriebe",
          "Restaurants, Bäckereien, Cafés & Food Trucks",
          "Erstmalige Erstellung eines HACCP-Plans",
          "Unternehmen, die sich auf eine bevorstehende Inspektion vorbereiten"
        ],
        not_for_title: "Nicht ideal, wenn:",
        not_for_items: [
          "Sie eine Zertifizierung auf Enterprise-Niveau benötigen",
          "Sie ein System haben, das von einem Vollzeitberater verwaltet wird"
        ]
      },
      founder: {
        title: "Eine Nachricht vom Gründer",
        text: "Ich habe iLoveHACCP entwickelt, weil traditionelle Beratung zu langsam und zu teuer für kleine Unternehmen ist. Wir demokratisieren den Zugang zu Sicherheitsstandards auf hohem Niveau.",
        role: "Wissenschaftlicher Leiter & Gründer",
        name: "Dr. Joao"
      },
      features: {
        title: "Warum Lebensmittelbetriebe uns lieben",
        subtitle: "Wir priorisieren Ihre Geschäftsergebnisse gegenüber komplexer Technologie.",
        f1_title: "Maßgeschneidert",
        f1_desc: "Erstellen Sie einen vollständigen HACCP-Plan, der genau auf Ihren Prozess zugeschnitten ist.",
        f2_title: "Einfach & zugänglich",
        f2_desc: "Keine Lebensmittelsicherheits-Expertise erforderlich.",
        f3_title: "Inspektionsbereit",
        f3_desc: "Exportieren Sie Dokumente, die für Inspektionen organisiert sind."
      },
      howItWorks: {
        badge: "Einfacher Prozess",
        title: "So funktioniert dies",
        subtitle: "Von der leeren Seite zum Dokumententwurf in drei einfachen Schritten.",
        s1_title: "1. Fragen beantworten",
        s1_desc: "Beantworten Sie einige Fragen zu Ihrem Lebensmittelbetrieb und Ihren Prozessen.",
        s2_title: "2. Plan wird erstellt",
        s2_desc: "Wir erstellen Ihren individuellen HACCP-Plan automatisch mit unserer Technologie.",
        s3_title: "3. Download & Bearbeiten",
        s3_desc: "Laden Sie Ihre Dokumente herunter und bearbeiten Sie sie jederzeit.",
        cta: "Jetzt starten"
      },
      pricing: {
        title: "Wählen Sie Ihren Plan",
        subtitle: "Von einer kostenlosen Vorschau bis zum professionellen Dokumentexport.",
        free: {
          title: "Kostenloser Entwurf",
          price: "€0",
          desc: "Erstellen und Vorschau Ihres HACCP-Planentwurfs.",
          f1: "Vollständiger HACCP-Builder",
          f2: "Entwurf wird automatisch gespeichert",
          f3: "Plan-Vollständigkeitscheckliste",
          f4: "Vorschau-Download mit Wasserzeichen",
          cta: "Jetzt starten",
          note: "Nur Entwurf — kein Audit oder Freigabe."
        },
        starter: {
          badge: "Beliebteste Option",
          title: "Dokumentexport",
          price: "€39",
          desc: "Saubere PDF- und Word-Dateien (ohne Wasserzeichen).",
          f1: "PDF- & Word-Export",
          f2: "Entfernt Wasserzeichen",
          f3: "Bereit zum Drucken und Teilen",
          f4: "Sofortiger Download",
          cta: "PDF & Word herunterladen",
          note: "Nur Dokumentexport — keine Prüfung, Audit, Verifizierung oder Freigabe."
        },
        review: {
          title: "Planprüfung & Feedback",
          price: "€99",
          desc: "Menschliches Feedback zu Ihrem HACCP-Planentwurf.",
          f1: "Vollständigkeits- & Konsistenzprüfung",
          f2: "Lücken und unklare Abschnitte markiert",
          f3: "Detaillierte Anmerkungen vom Prüfer",
          f4: "48h Express-Überprüfung",
          cta: "Prüfung anfordern",
          note: "Prüfservice — keine Zertifizierung oder behördliche Freigabe."
        },
        enterprise: {
          title: "Enterprise",
          price: "Individuell",
          desc: "Für komplexe, multinationale oder industrielle Betriebe.",
          f1: "Vollständige Planprüfung",
          f2: "Vor-Ort-Auditoptionen",
          f3: "Dedizierter Berater",
          f4: "Priorisierter Support",
          cta: "Vertrieb kontaktieren"
        }
      },
      finalCta: {
        title: "Bereit für Compliance?",
        btn: "Erstellen Sie Ihren Plan kostenlos"
      }
    },
    hero: {
      title: "HACCP-Pläne in Minuten.",
      subtitle: "Erstellen Sie professionelle HACCP-Pläne in Minuten mit unserem kostenlosen Tool.",
      cta: "Plan kostenlos erstellen"
    },
    wizard: {
      title: "Lassen Sie uns Ihren HACCP-Plan erstellen",
      subtitle: "Beantworten Sie einige Fragen und unser Tool erstellt ein vollständiges Dokument.",
      reassurance: "Kein HACCP-Wissen erforderlich. Sie können Fragen überspringen oder später bearbeiten.",
      start: "Builder starten",
      next: "Weiter",
      back: "Zurück",
      add: "Hinzufügen",
      generating: "Ihr HACCP-Plan wird erstellt...",
      generatingDesc: "Unser Tool wendet Standards auf Ihren Geschäftskontext an.",
      download: "PDF herunterladen",
      success: "Ihr Entwurf ist fertig!",
      step_business: "Geschäftskontext",
      step_products: "Produktdetails"
    },
    builder_inputs: {
      ingredients: {
        'Raw Meat': 'Rohes Fleisch',
        'Poultry': 'Geflügel',
        'Fish': 'Fisch',
        'Eggs': 'Eier',
        'Dairy': 'Milchprodukte',
        'Fresh Produce': 'Frische Produkte',
        'Dry Goods': 'Trockenwaren',
        'Frozen Goods': 'Tiefkühlwaren',
        'Oils & Fats': 'Öle & Fette',
        'Flour': 'Mehl',
        'Sugar': 'Zucker',
        'Yeast': 'Hefe',
        'Butter': 'Butter',
        'Milk': 'Milch',
        'Nuts': 'Nüsse',
        'Chocolate': 'Schokolade',
        'Fruit Fillings': 'Fruchtfüllungen',
        'Spices': 'Gewürze',
        'Raw Beef': 'Rohes Rindfleisch',
        'Raw Pork': 'Rohes Schweinefleisch',
        'Raw Lamb': 'Rohes Lammfleisch',
        'Raw Poultry': 'Rohes Geflügel',
        'Sausage Casings': 'Wursthüllen',
        'Marinades': 'Marinaden',
        'Salt': 'Salz',
        'Coffee Beans': 'Kaffeebohnen',
        'Syrups': 'Sirups',
        'Pastries': 'Gebäck',
        'Sandwich Fillings': 'Sandwichfüllungen',
        'Salad Greens': 'Salatgrün',
        'Tea': 'Tee',
        'Bulk Raw Materials': 'Rohstoffe in Großgebinde',
        'Additives': 'Zusatzstoffe',
        'Preservatives': 'Konservierungsstoffe',
        'Water': 'Wasser',
        'Packaging Material': 'Verpackungsmaterial',
        'Processing Aids': 'Verarbeitungshilfsstoffe',
        'Pre-cooked Meals': 'Vorgekochte Mahlzeiten',
        'Fresh Salads': 'Frische Salate',
        'Buffet Items': 'Buffetartikel',
        'Sauces': 'Saucen',
        'Desserts': 'Desserts',
        'Raw Red Meat': 'Rohes rotes Fleisch',
        'Raw Fish & Seafood': 'Rohfisch & Meeresfrüchte',
        'Raw Shellfish': 'Rohes Schalentier',
        'Shell Eggs': 'Eier in Schale',
        'Ready-to-Eat (RTE)': 'Verzehrfertig (RTE)',
        'Baked Goods': 'Backwaren',
        'Grains & Cereals': 'Getreide & Cerealien',
        'Canned / Dry Goods': 'Konserven / Trockenwaren',
        'Beverages': 'Getränke'
      },
      equipment: {
        'Rational Oven': 'Rational-Ofen',
        'Stove': 'Herd',
        'Grill': 'Grill',
        'Deep Fryer': 'Fritteuse',
        'Walk-in Fridge': 'Kühlraum',
        'Freezer': 'Gefrierschrank',
        'Dishwasher': 'Geschirrspüler',
        'Sous-vide Circulator': 'Sous-vide-Zirkulator',
        'Vacuum Packer': 'Vakuumierer',
        'Deck Oven': 'Etagenofen',
        'Proofer': 'Gärschrank',
        'Planetary Mixer': 'Planetenmischer',
        'Dough Sheeter': 'Teigausroller',
        'Cooling Racks': 'Kühlregale',
        'Spiral Mixer': 'Spiralkneter',
        'Bread Slicer': 'Brotschneidemaschine',
        'Industrial Mincer': 'Industrie-Fleischwolf',
        'Sausage Filler': 'Wurstfüller',
        'Slicer': 'Aufschnittmaschine',
        'Cold Room': 'Kühlraum',
        'Bone Saw': 'Knochensäge',
        'Knife Sterilizer': 'Messerssterilisator',
        'Scales': 'Waagen',
        'Espresso Machine': 'Espressomaschine',
        'Milk Steamer': 'Milchaufschäumer',
        'Panini Press': 'Panini-Presse',
        'Display Fridge': 'Kühlschrankvitrine',
        'Bean Grinder': 'Kaffeemühle',
        'Ice Machine': 'Eismaschine',
        'Conveyor System': 'Fördersystem',
        'Industrial Mixer': 'Industriemischer',
        'Metal Detector': 'Metalldetektor',
        'Filling Machine': 'Abfüllmaschine',
        'Pasteurizer': 'Pasteurisator',
        'Pallet Jack': 'Hubwagen',
        'Lab Testing Kit': 'Labortest-Set',
        'Portable Burners': 'Tragbare Brenner',
        'Insulated Hot Boxes': 'Isolierte Warmhalteboxen',
        'Mobile Refrigeration': 'Mobile Kühlung',
        'Hand Wash Station': 'Handwaschstation',
        'Blast Chiller': 'Schockkühler',
        'Oven': 'Ofen',
        'Prep Tables': 'Vorbereitungstische',
        'Sink': 'Spüle',
        'Fridge': 'Kühlschrank'
      },
      options: {
        'Restaurant': 'Restaurant',
        'Bakery': 'Bäckerei',
        'Butcher Shop': 'Metzgerei',
        'Cafe / Coffee Shop': 'Café / Kaffeebar',
        'Food Manufacturer': 'Lebensmittelhersteller',
        'Catering Service': 'Catering-Service',
        'Food Truck / Mobile Unit': 'Food Truck / Mobile Einheit',
        'Hotel Kitchen': 'Hotelküche',
        'School / Canteen': 'Schule / Kantine',
        'Hospital Kitchen': 'Krankenhausküche',
        'Ghost Kitchen': 'Ghost Kitchen',
        'Yes': 'Ja',
        'No': 'Nein',
        'Short (< 3 days)': 'Kurz (< 3 Tage)',
        'Medium (< 1 week)': 'Mittel (< 1 Woche)',
        'Long (> 1 week)': 'Lang (> 1 Woche)',
        'Daily': 'Täglich',
        'Weekly': 'Wöchentlich',
        'Shift-based': 'Schichtbasiert',
        'Yes, scheduled': 'Ja, geplant',
        'Occasionally': 'Gelegentlich',
        'Yes, digital': 'Ja, digital',
        'Yes, paper-based': 'Ja, papierbasiert',
        'Partial': 'Teilweise',
        'Digital (App/Cloud)': 'Digital (App/Cloud)',
        'Paper-based': 'Papierbasiert',
        'Mixed': 'Gemischt',
        'Minimal': 'Minimalistisch',
        'Corporate': 'Unternehmen',
        'Modern': 'Modern',
        'None / No Allergens': 'Keine / Keine Allergene',
        'Gluten': 'Gluten',
        'Crustaceans': 'Krebstiere',
        'Fish': 'Fisch',
        'Peanuts': 'Erdnüsse',
        'Soy': 'Soja',
        'Milk': 'Milch',
        'Nuts': 'Nüsse',
        'Celery': 'Sellerie',
        'Mustard': 'Senf',
        'Sesame': 'Sesam',
        'Eggs': 'Eier'
      },
      process_steps: {
        'Receiving': 'Wareneingang',
        'Storage': 'Lagerung',
        'Thawing': 'Auftauen',
        'Prep': 'Vorbereitung',
        'Cooking': 'Kochen',
        'Cooling': 'Abkühlen',
        'Reheating': 'Wiedererwärmen',
        'Holding': 'Warmhalten',
        'Packaging': 'Verpackung'
      }
    },
    marketing: {
      wordDocx: {
        metaTitle: "HACCP-Plan Word (DOCX) | Bearbeitbare Vorlage",
        metaDescription: "Erstellen Sie einen bearbeitbaren HACCP-Plan in Word (DOCX) für die EU- und UK-Konformität. Passen Sie Gefahren, CCPs und Überwachungsschritte mit iLoveHACCP an.",
        hero: {
          eyebrow: "Bearbeitbarer Word-Export",
          title: "HACCP-Plan Word (DOCX)",
          subtitle: "Erstellen Sie einen konformen HACCP-Plan und exportieren Sie ihn als bearbeitbares Word-Dokument, das Ihr Team aktualisieren kann."
        },
        ctas: {
          primary: { label: "Meinen HACCP-Plan erstellen", href: "/builder" },
          secondary: { label: "Beispiel-PDF ansehen", href: "/sample-haccp-plan-pdf" }
        },
        highlights: {
          title: "Warum Teams DOCX wählen",
          items: [
            {
              title: "Voll bearbeitbar",
              description: "Gefahren, CCPs und Überwachungsschritte ohne Neustart anpassen."
            },
            {
              title: "Auditgerechte Struktur",
              description: "An EC 852/2004 ausgerichtet, klar für Prüfer gegliedert."
            },
            {
              title: "Markenfähig",
              description: "Logos, Standortdetails und SOP-Verweise in Minuten hinzufügen."
            }
          ]
        },
        checklist: {
          title: "Ideal für Audits und Updates",
          items: [
            "Kritische Grenzwerte, Überwachung und Korrekturmaßnahmen anpassen",
            "Revisionen für laufende Compliance nachverfolgen",
            "Mit Managern, Küchenchefs und Prüfern teilen",
            "Bei Bedarf als PDF mit festem Layout exportieren"
          ]
        },
        note: "Brauchen Sie ein festes Layout? Exportieren Sie jederzeit als PDF."
      },
      examplePdf: {
        metaTitle: "HACCP-Plan Beispiel-PDF | Kostenloser Einblick",
        metaDescription: "Vorschau eines HACCP-Plan-Beispiel-PDFs mit Gefahrenanalyse, CCPs und Überwachungsprotokollen. Erstellen Sie Ihren Plan in Minuten.",
        hero: {
          eyebrow: "Kostenlose Dokumentvorschau",
          title: "HACCP-Plan Beispiel-PDF",
          subtitle: "Sehen Sie einen vollständigen HACCP-Plan mit Gefahrenanalyse, CCPs und Überwachungsprotokollen, bevor Sie Ihren eigenen erstellen."
        },
        ctas: {
          primary: { label: "Beispiel-PDF ansehen", href: "/sample-haccp-plan-pdf" },
          secondary: { label: "Meinen HACCP-Plan erstellen", href: "/builder" }
        },
        highlights: {
          title: "Was das Beispiel enthält",
          items: [
            {
              title: "Gefahrenanalyse-Tabellen",
              description: "Biologische, chemische und physikalische Gefahren je Prozessschritt."
            },
            {
              title: "CCP-Bestimmung",
              description: "Kritische Kontrollpunkte und Grenzwerte im Überblick."
            },
            {
              title: "Überwachungsprotokolle",
              description: "Tägliche Temperatur- und Reinigungslisten."
            }
          ]
        },
        checklist: {
          title: "Nutzen Sie die Vorschau, um",
          items: [
            "Die von Prüfern erwartete Dokumentstruktur zu verstehen",
            "Die Bereiche zu identifizieren, die Sie anpassen",
            "Mit Ihrem Team zu teilen, bevor Sie generieren",
            "Word- und PDF-Exportoptionen zu bestätigen"
          ]
        },
        note: "Bereit für mehr als das Beispiel? Erstellen Sie einen Plan für Ihren Betrieb."
      },
      restaurants: {
        metaTitle: "HACCP für Restaurants | Food-Safety-Plan-Builder",
        metaDescription: "Erstellen Sie einen Restaurant-HACCP-Plan gemäß EC 852/2004. Dokumentieren Sie Kochen, Abkühlen, Lagerung und Hygiene.",
        hero: {
          eyebrow: "Restaurant-HACCP-Builder",
          title: "HACCP für Restaurants",
          subtitle: "Erstellen Sie einen restaurantgerechten HACCP-Plan für Kochen, Abkühlen, Lagerung, Allergene und tägliche Hygienekontrollen."
        },
        ctas: {
          primary: { label: "Restaurantplan starten", href: "/builder" },
          secondary: { label: "HACCP-Vorlage ansehen", href: "/haccp-template" }
        },
        highlights: {
          title: "Für hektische Küchen gebaut",
          items: [
            {
              title: "Schritt-für-Schritt-Abläufe",
              description: "Wareneingang, Vorbereitung, Kochen, Abkühlen und Service abbilden."
            },
            {
              title: "Allergen- & Lieferantenkontrollen",
              description: "Lieferantenfreigaben und Allergenhandling dokumentieren."
            },
            {
              title: "Tägliche Prüfprotokolle",
              description: "Reinigung, Temperatur und Korrekturmaßnahmen."
            }
          ]
        },
        checklist: {
          title: "Restaurantgerechte Abdeckung",
          items: [
            "Grenzwerte für Warm- und Kalthalten",
            "Kontrollen gegen Kreuzkontamination",
            "Mitarbeiterschulung und Hygienechecks",
            "Auditbereite Aufzeichnungen und Reviews"
          ]
        },
        note: "Einmal erstellen und bei Menüänderungen aktuell halten."
      },
      template: {
        metaTitle: "HACCP-Vorlage | Word- & PDF-Export | iLoveHACCP",
        metaDescription: "Erstellen Sie eine HACCP-Vorlage für Ihren Betrieb und exportieren Sie sie als Word oder PDF. Für UK- und EU-Compliance.",
        hero: {
          eyebrow: "Vorlagen-Generator",
          title: "HACCP-Vorlage",
          subtitle: "Erstellen Sie eine praktische HACCP-Vorlage für Ihren Betrieb und exportieren Sie sie in Word und PDF."
        },
        ctas: {
          primary: { label: "Vorlage erstellen", href: "/builder" },
          secondary: { label: "Beispiel-PDF ansehen", href: "/sample-haccp-plan-pdf" }
        },
        highlights: {
          title: "Was enthalten ist",
          items: [
            { title: "Bearbeitbare Struktur", description: "Aktualisieren Sie Gefahren, CCPs und SOPs bei Prozessänderungen." },
            { title: "Compliance-orientiert", description: "Ausgerichtet an EC 852/2004 und UK-Hygieneanforderungen." },
            { title: "Audit-bereit", description: "Klare Abschnitte für Nachweise, Überwachung und Korrekturmaßnahmen." }
          ]
        },
        checklist: {
          title: "Ideal für",
          items: [
            "Vorbereitung auf Inspektionen",
            "Standardisierte Lebensmittelsicherheitsdokumentation",
            "Versionierte HACCP-Nachweise",
            "Teamweite Abstimmung"
          ]
        },
        note: "Rechtlicher Kontext: EU/UK-Anforderungen ansehen."
      },
      euUkRequirements: {
        metaTitle: "EU- & UK-HACCP-Anforderungen | Verordnung 852/2004",
        metaDescription: "Verstehen Sie die HACCP-Anforderungen in EU und UK nach Verordnung 852/2004 und was Inspektoren erwarten.",
        hero: {
          eyebrow: "Regulatorischer Leitfaden",
          title: "EU- & UK-HACCP-Anforderungen",
          subtitle: "Praktischer Überblick über Verordnung 852/2004 und die Nachweise, die bei Kontrollen erwartet werden."
        },
        ctas: {
          primary: { label: "Konformen Plan erstellen", href: "/builder" },
          secondary: { label: "HACCP-Vorlage ansehen", href: "/haccp-template" }
        },
        highlights: {
          title: "Inhalte dieses Leitfadens",
          items: [
            { title: "7 HACCP-Grundsätze", description: "Gefahrenanalyse, CCPs, Grenzwerte, Überwachung, Korrektur, Verifizierung, Dokumentation." },
            { title: "Inspektionsfokus", description: "Was EHOs und Behörden vor Ort typischerweise prüfen." },
            { title: "Praktische Compliance", description: "Wie Sie HACCP-Dokumentation aktuell und verhältnismäßig halten." }
          ]
        },
        checklist: {
          title: "Diese Unterlagen bereithalten",
          items: [
            "Temperaturprotokolle",
            "Reinigungs- und Desinfektionsnachweise",
            "Allergen- und Kreuzkontaminationskontrollen",
            "Schulungs- und Review-Nachweise"
          ]
        },
        note: "Diese Seite dient nur zur Information und ersetzt keine Rechtsberatung."
      },
      faqs: {
        metaTitle: "HACCP-FAQs | Antworten zur Lebensmittelsicherheit",
        metaDescription: "Antworten auf häufige HACCP-Fragen zu Compliance, Inspektionen, Dokumentation und Plattformnutzung.",
        title: "Häufig gestellte Fragen",
        subtitle: "Häufige Fragen zu HACCP-Compliance, unserem Builder und der Lebensmittelsicherheitsdokumentation."
      }
    },
    pdf: {
      title: "HACCP-Plan",
      subtitle: "Lebensmittelsicherheits-Managementsystem",
      facility: "Einrichtungsname",
      product_scope: "Produktumfang",
      date_issue: "Ausgabedatum",
      standard: "Standard",
      disclaimer: "Dieses Dokument ist ein automatisch erstellter Entwurf und muss von einer qualifizierten Fachkraft geprüft werden.",
      confidential: "VERTRAULICH",
      version: "Version 1.0",
      generated_by: "Erstellt von ilovehaccp.com - Lösungen für Lebensmittelsicherheit",
      s1_title: "Abschnitt 1 — HACCP-Team & Geltungsbereich",
      s2_title: "Abschnitt 2 — Produktbeschreibung",
      s3_title: "Abschnitt 3 — Prozessflussdiagramm",
      s4_title: "Abschnitt 4 — Präventivprogramme (PRPs)",
      s5_title: "Abschnitt 5 — Gefahrenanalyse",
      s6_title: "Abschnitt 6 — Bestimmung der CCPs",
      s7_title: "Abschnitt 7 — CCP-Management",
      s7_desc: "Kritische Kontrollpunkte (CCPs) wurden mithilfe des Codex Alimentarius-Entscheidungsbaums bestimmt.",
      s8_title: "Abschnitt 8 — Verifizierung & Validierung",
      s9_title: "Abschnitt 9 — Aufzeichnungen & Überprüfung",
      s10_title: "Abschnitt 9 — Aufzeichnungen & Überprüfung",
      lbl_product_name: "Produktname",
      lbl_description: "Beschreibung",
      lbl_ingredients: "Hauptzutaten",
      lbl_shelf_life: "Haltbarkeit",
      lbl_intended_use: "Verwendungszweck",
      lbl_further_preparation: "Weitere Zubereitung/Handhabung",
      lbl_storage: "Lagerung",
      col_program: "Programm",
      col_details: "Kontrolldetails",
      col_step: "Schritt",
      col_hazards: "Identifizierte Gefahren",
      col_control: "Kontrollmaßnahmen",
      col_ccp: "CCP?",
      val_prerequisite: "Voraussetzung",

      s4_desc: "Detaillierter Kontrollplan für identifizierte kritische Kontrollpunkte.",
      lbl_hazard: "SIGNIFIKANTE GEFAHR",
      lbl_critical_limit: "Kritischer Grenzwert",
      lbl_monitoring: "Überwachung",
      lbl_corrective: "Korrekturmaßnahme",
      msg_no_ccps: "Keine Kritischen Kontrollpunkte (CCPs) identifiziert. Der Prozess wird über PRPs gesteuert.",
      sign_prepared: "Erstellt von (HACCP-Teamleitung)",
      sign_approved: "Freigegeben von (Management)",
      tk_title: "Toolkit: Überwachungsprotokolle",
      tk_temp_title: "Anhang A: Temperaturkontrollprotokoll",
      tk_temp_desc: "Verwenden Sie dieses Protokoll, um Temperaturen für CCPs zu erfassen (z. B. Kochen, gekühlte Lagerung).",
      col_date: "Datum",
      col_time: "Uhrzeit",
      col_item: "Artikel/Equipment",
      col_temp: "Temp (°C)",
      col_action: "Maßnahme",
      col_sign: "Unterschrift",
      msg_corrective: "*Korrekturmaßnahme erforderlich, wenn kritische Grenzwerte überschritten werden. Tragen Sie die Maßnahmen in der Spalte 'Maßnahme' ein.",
      tk_clean_title: "Anhang B: Tägliche Reinigungscheckliste",
      col_task: "Reinigungsaufgabe",
      days: { mon: "Mo", tue: "Di", wed: "Mi", thu: "Do", fri: "Fr", sat_sun: "Sa/So" },
      tasks: {
        surfaces: "Oberflächen & Vorbereitungsbretter",
        cooking: "Kochgeräte (Öfen/Herde)",
        fridges: "Kühlschränke & Griffe",
        sinks: "Spülen & Wasserhähne",
        floors: "Böden & Abflüsse",
        waste: "Abfallbehälter (geleert & gereinigt)",
        handwash: "Handwaschstationen"
      },
      tk_train_title: "Anhang C: Schulungsnachweis",
      col_employee: "Mitarbeitername",
      col_train_desc: "Schulungsbeschreibung (z. B. HACCP Level 2)",
      cover_created_by: "Erstellt von",
      cover_approved_by: "Freigegeben von",
      cover_date: "Datum",
      cover_version: "Version",
      lbl_page: "Seite",
      lbl_of: "von"
    }
  };

export default dictionary;

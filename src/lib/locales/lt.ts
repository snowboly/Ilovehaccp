const dictionary = {
    nav: {
      builder: "HACCP kūrėjas",
      features: "Funkcijos",
      resources: "Ištekliai",
      pricing: "Kainos",
      about: "Apie",
      contact: "Kontaktai",
      login: "Prisijungti",
      getStarted: "Registracija",
      articles: "Straipsniai",
      faqs: "DUK",
      logout: "Atsijungti",
      signedInAs: "Prisijungta kaip",
      loggedInAs: "Prisijungta kaip",
      dashboard: "Skydelis",
      settings: "Nustatymai",
      createAccount: "Sukurti paskyrą"
    },
    dashboard: {
      title: "Mano skydelis",
      subtitle: "Tvarkykite savo maisto saugos dokumentaciją",
      backToHome: "Grįžti į pradžią",
      createNewPlan: "Sukurti naują planą",
      activeDrafts: "Aktyvūs juodraščiai",
      noActiveDrafts: "Nėra aktyvių juodraščių.",
      documentsReviews: "Dokumentai ir peržiūros",
      noPlansYet: "Dar nėra sugeneruotų planų.",
      missingPlan: "Trūksta plano?",
      missingPlanDesc: "Jei planą sugeneravote prieš registruodamiesi, įveskite plano ID žemiau, kad pridėtumėte jį prie skydelio.",
      pastePlanId: "Įklijuoti plano ID...",
      importPlan: "Importuoti planą",
      importing: "Importuojama...",
      confirmImport: "Patvirtinti importą",
      confirmImportDesc: "Jūs ketinate importuoti HACCP planą su ID",
      ensureCorrectId: "Prieš tęsdami įsitikinkite, kad ID teisingas.",
      yesImportPlan: "Taip, importuoti planą",
      tableHeaders: {
        draft: "Juodraštis",
        business: "Verslas",
        updated: "Atnaujinta",
        actions: "Veiksmai",
        plan: "Planas",
        date: "Data",
        files: "Failai",
        review: "Peržiūra",
        summary: "Santrauka"
      },
      reviewStatus: {
        concluded: "Peržiūra baigta",
        inProgress: "Peržiūra vykdoma",
        paid: "Apmokėta",
        notRequested: "Neužsakyta",
        inReview: "PERŽIŪROJE",
        sentByEmail: "Išsiųsta el. paštu"
      },
      viewSummary: "Peržiūrėti santrauką",
      unfinishedDraft: "Nebaigtas juodraštis"
    },
    actions: {
      resume: "Tęsti",
      rename: "Pervadinti",
      delete: "Ištrinti",
      confirm: "Patvirtinti",
      cancel: "Atšaukti",
      import: "Importuoti",
      export: "Eksportuoti",
      download: "Atsisiųsti",
      unlockExport: "Atrakinti eksportą",
      requestReview: "Prašyti peržiūros",
      paid: "APMOKĖTA"
    },
    messages: {
      confirmDeleteDraft: "Ar tikrai norite ištrinti šį juodraštį? Veiksmas negrįžtamas.",
      confirmDeletePlan: "Ar tikrai norite ištrinti šį planą? Veiksmas negrįžtamas.",
      draftNameEmpty: "Juodraščio pavadinimas negali būti tuščias.",
      enterNewDraftName: "Įveskite naują juodraščio pavadinimą:",
      importSuccess: "Planas sėkmingai importuotas!",
      importFailed: "Importavimas nepavyko.",
      deleteSuccess: "Planas sėkmingai ištrintas.",
      deleteFailed: "Ištrinti nepavyko. Bandykite dar kartą.",
      renameFailed: "Nepavyko pervadinti juodraščio. Bandykite dar kartą.",
      downloadFailed: "Atsisiuntimas nepavyko",
      checkoutFailed: "Nepavyko pradėti apmokėjimo",
      systemError: "Sistemos klaida pradedant apmokėjimą.",
      cannotDeleteDependencies: "Ištrinti negalima: yra aktyvių priklausomybių. Susisiekite su pagalba.",
      cannotDeleteReviewInProgress: "Negalima ištrinti, kol vyksta peržiūra",
      paymentSuccess: "Mokėjimas sėkmingai apdorotas.",
      reviewRequested: "Peržiūra sėkmingai paprašyta.",
      exportUnlocked: "Eksportas sėkmingai atrakintas."
    },
    footer: {
      description: "Pažangiausia pasaulyje maisto saugos dokumentacijos platforma. Padedame verslams supaprastinti dokumentus.",
      platform: "Platforma",
      haccpBuilder: "HACCP kūrėjas",
      resourcesTitle: "Ištekliai",
      haccpExamplePdf: "HACCP plano pavyzdys PDF",
      haccpTemplate: "HACCP šablonas",
      euUkRequirements: "ES ir JK reikalavimai",
      knowledgeBase: "Žinių bazė",
      complianceFaqs: "Atitikties DUK",
      companyLegal: "Įmonė ir teisinė informacija",
      contactSupport: "Susisiekti su pagalba",
      privacyPolicy: "Privatumo politika",
      termsOfService: "Paslaugų teikimo sąlygos",
      cookiePolicy: "Slapukų politika",
      refundPolicy: "Grąžinimo politika",
      allRightsReserved: "Visos teisės saugomos.",
      disclaimer: "Atsakomybės apribojimas: iLoveHACCP teikia programinius įrankius tik dokumentacijos tikslais. Nors mūsų šablonai remiasi EB reglamento 852/2004 principais, mes nesame advokatų kontora, reguliavimo institucija ar sertifikavimo agentūra. Naudojimasis platforma negarantuoja inspekcijos patvirtinimo. Visada patikrinkite galutinį planą su vietos sveikatos institucija arba aplinkos sveikatos pareigūnu."
    },
    landing: {
      hero: {
        titlePart1: "Sukurkite HACCP planą per kelias minutes —",
        titlePart2: "Be konsultantų ar skaičiuoklių",
        subtitle: "Sukurkite HACCP planą per kelias minutes. Profesionalūs maisto saugos įrankiai restoranams, gamintojams ir maitinimui.",
        check1: "Atitinka standartus",
        check2: "Pritaikyta jūsų verslui",
        check3: "Nemokamai pradėti",
        cta: "Sukurti planą nemokamai",
        compliance: { standard_1: "EC 852/2004", eu: "UK FSA standartai", codex: "Codex CXC 1-1969" }
      },
      audience: {
        title: "Ar iLoveHACCP tinka jums?",
        subtitle: "Pirmenybę teikiame greičiui ir praktiniam suderinamumui mažoms ir vidutinėms maisto įmonėms.",
        for_title: "Puikiai tinka:",
        for_items: [
          "Mažoms ir vidutinėms maisto įmonėms",
          "Restoranams, kepykloms, kavinėms ir maisto furgonams",
          "Pirmą kartą kuriant HACCP planą",
          "Verslams, besiruošiantiems artėjančiai patikrai"
        ],
        not_for_title: "Neidealus, jei:",
        not_for_items: [
          "Reikalinga įmonės lygio sertifikacija",
          "Turite sistemą, kurią valdo visą darbo dieną dirbantis konsultantas"
        ]
      },
      founder: {
        title: "Žinutė iš įkūrėjo",
        text: "Sukūriau iLoveHACCP, nes tradicinės konsultacijos yra per lėtos ir per brangios mažoms įmonėms. Mes demokratizuojame prieigą prie aukštų saugos standartų.",
        role: "Mokslinis vadovas ir įkūrėjas",
        name: "Dr. Joao"
      },
      features: {
        title: "Kodėl maisto verslai mus mėgsta",
        subtitle: "Pirmenybę teikiame jūsų verslo rezultatams, o ne sudėtingai technologijai.",
        f1_title: "Pritaikyta",
        f1_desc: "Sugeneruokite pilną HACCP planą, pritaikytą jūsų procesui.",
        f2_title: "Paprasta ir prieinama",
        f2_desc: "Maisto saugos kompetencija nereikalinga.",
        f3_title: "Parama patikroms",
        f3_desc: "Eksportuokite dokumentus, sutvarkytus patikroms."
      },
      howItWorks: {
        badge: "Paprastas procesas",
        title: "Kaip tai veikia",
        subtitle: "Nuo tuščio lapo iki dokumento juodraščio per tris paprastus žingsnius.",
        s1_title: "1. Atsakykite į klausimus",
        s1_desc: "Atsakykite į kelis klausimus apie savo verslą ir procesus.",
        s2_title: "2. Planas sugeneruojamas",
        s2_desc: "Mes automatiškai sugeneruojame jūsų HACCP planą naudodami mūsų technologiją.",
        s3_title: "3. Atsisiųskite ir redaguokite",
        s3_desc: "Atsisiųskite dokumentus ir redaguokite bet kada.",
        cta: "Pradėti dabar"
      },
      pricing: {
        title: "Pasirinkite planą",
        subtitle: "Nuo nemokamos peržiūros iki profesionalaus dokumentų eksporto.",
        free: {
          title: "Nemokamas juodraštis",
          price: "€0",
          desc: "Sukurkite ir peržiūrėkite HACCP plano juodraštį.",
          f1: "Pilnas HACCP kūrėjas",
          f2: "Automatinis juodraščio išsaugojimas",
          f3: "Plano išsamumo kontrolinis sąrašas",
          f4: "Peržiūros atsisiuntimas su vandens ženklu",
          cta: "Pradėti",
          note: "Tik juodraštis — be audito ar patvirtinimo."
        },
        starter: {
          badge: "Populiariausias",
          title: "Dokumentų eksportas",
          price: "€39",
          desc: "Švarūs PDF ir Word failai (be vandens ženklo).",
          f1: "PDF + Word eksportas",
          f2: "Pašalina vandens ženklą",
          f3: "Paruošta spausdinti ir dalintis",
          f4: "Atsisiuntimas iš karto",
          cta: "Atsisiųsti PDF ir Word",
          note: "Tik dokumentų eksportas — be peržiūros, audito, patvirtinimo ar verifikavimo."
        },
        review: {
          title: "Plano peržiūra ir grįžtamasis ryšys",
          price: "€99",
          desc: "Žmogiškas grįžtamasis ryšys apie HACCP plano juodraštį.",
          f1: "Išsamumo ir nuoseklumo patikra",
          f2: "Pažymėtos spragos ir neaiškios dalys",
          f3: "Išsamios pastabos iš peržiūrėtojo",
          f4: "48 val. greitoji peržiūra",
          cta: "Prašyti peržiūros",
          note: "Peržiūros paslauga — be sertifikavimo ar reguliavimo patvirtinimo."
        },
        enterprise: {
          title: "Enterprise",
          price: "Individualu",
          desc: "Sudėtingoms, kelių vietų ar pramoninėms operacijoms.",
          f1: "Pilna plano peržiūra",
          f2: "Vietinės audito galimybės",
          f3: "Skirtas konsultantas",
          f4: "Prioritetinė pagalba",
          cta: "Susisiekti su pardavimais"
        }
      },
      finalCta: {
        title: "Pasiruošę atitikčiai?",
        btn: "Sukurti planą nemokamai"
      }
    },
    hero: {
      title: "HACCP planai per kelias minutes.",
      subtitle: "Sugeneruokite profesionalius HACCP planus per kelias minutes su mūsų nemokamu įrankiu.",
      cta: "Sukurti planą nemokamai"
    },
    wizard: {
      title: "Sukurkime jūsų HACCP planą",
      subtitle: "Atsakykite į kelis klausimus ir mūsų įrankis parengs pilną dokumentą.",
      reassurance: "HACCP žinių nereikia. Galite praleisti klausimus arba redaguoti vėliau.",
      start: "Pradėti kūrėją",
      next: "Kitas",
      back: "Atgal",
      add: "Pridėti",
      generating: "Kuriamas jūsų HACCP planas...",
      generatingDesc: "Mūsų įrankis taiko standartus jūsų verslo kontekstui.",
      download: "Atsisiųsti PDF",
      success: "Jūsų juodraštis paruoštas!",
      step_business: "Verslo kontekstas",
      step_products: "Produkto detalės"
    },
    builder_inputs: {
      ingredients: {
        'Raw Meat': 'Žalia mėsa',
        'Poultry': 'Paukštiena',
        'Fish': 'Žuvis',
        'Eggs': 'Kiaušiniai',
        'Dairy': 'Pieno produktai',
        'Fresh Produce': 'Švieži produktai',
        'Dry Goods': 'Sausi produktai',
        'Frozen Goods': 'Šaldyti produktai',
        'Oils & Fats': 'Aliejai ir riebalai',
        'Flour': 'Miltai',
        'Sugar': 'Cukrus',
        'Yeast': 'Mielės',
        'Butter': 'Sviestas',
        'Milk': 'Pienas',
        'Nuts': 'Riešutai',
        'Chocolate': 'Šokoladas',
        'Fruit Fillings': 'Vaisių įdarai',
        'Spices': 'Prieskoniai',
        'Raw Beef': 'Žalia jautiena',
        'Raw Pork': 'Žalia kiauliena',
        'Raw Lamb': 'Žalia aviena',
        'Raw Poultry': 'Žalia paukštiena',
        'Sausage Casings': 'Dešrų apvalkalai',
        'Marinades': 'Marinatai',
        'Salt': 'Druska',
        'Coffee Beans': 'Kavos pupelės',
        'Syrups': 'Sirupai',
        'Pastries': 'Kepiniai',
        'Sandwich Fillings': 'Sumuštinių įdarai',
        'Salad Greens': 'Salotų lapai',
        'Tea': 'Arbata',
        'Bulk Raw Materials': 'Birios žaliavos',
        'Additives': 'Priedai',
        'Preservatives': 'Konservantai',
        'Water': 'Vanduo',
        'Packaging Material': 'Pakuočių medžiagos',
        'Processing Aids': 'Perdirbimo pagalbinės medžiagos',
        'Pre-cooked Meals': 'Iš anksto paruošti patiekalai',
        'Fresh Salads': 'Šviežios salotos',
        'Buffet Items': 'Bufeto patiekalai',
        'Sauces': 'Padažai',
        'Desserts': 'Desertai',
        'Raw Red Meat': 'Žalia raudona mėsa',
        'Raw Fish & Seafood': 'Žalia žuvis ir jūros gėrybės',
        'Raw Shellfish': 'Žali moliuskai',
        'Shell Eggs': 'Kiaušiniai su lukštu',
        'Ready-to-Eat (RTE)': 'Paruošta vartoti (RTE)',
        'Baked Goods': 'Kepiniai',
        'Grains & Cereals': 'Grūdai ir kruopos',
        'Canned / Dry Goods': 'Konservuoti / sausi produktai',
        'Beverages': 'Gėrimai'
      },
      equipment: {
        'Rational Oven': 'Rational orkaitė',
        'Stove': 'Viryklė',
        'Grill': 'Grilis',
        'Deep Fryer': 'Gruzdintuvė',
        'Walk-in Fridge': 'Šaldymo kamera',
        'Freezer': 'Šaldiklis',
        'Dishwasher': 'Indaplovė',
        'Sous-vide Circulator': 'Sous-vide cirkuliatorius',
        'Vacuum Packer': 'Vakuuminė pakavimo mašina',
        'Deck Oven': 'Aukštų krosnis',
        'Proofer': 'Kildinimo kamera',
        'Planetary Mixer': 'Planetarinė maišyklė',
        'Dough Sheeter': 'Tešlos ploninimo mašina',
        'Cooling Racks': 'Aušinimo lentynos',
        'Spiral Mixer': 'Spiralinė maišyklė',
        'Bread Slicer': 'Duonos pjaustyklė',
        'Industrial Mincer': 'Pramoninis mėsmalis',
        'Sausage Filler': 'Dešrų kimšimo mašina',
        'Slicer': 'Pjaustyklė',
        'Cold Room': 'Šaldymo patalpa',
        'Bone Saw': 'Kaulų pjūklas',
        'Knife Sterilizer': 'Peilių sterilizatorius',
        'Scales': 'Svarstyklės',
        'Espresso Machine': 'Espreso aparatas',
        'Milk Steamer': 'Pieno garintuvas',
        'Panini Press': 'Panini presas',
        'Display Fridge': 'Vitrininis šaldytuvas',
        'Bean Grinder': 'Kavos malūnėlis',
        'Ice Machine': 'Ledo aparatas',
        'Conveyor System': 'Konvejerinė sistema',
        'Industrial Mixer': 'Pramoninė maišyklė',
        'Metal Detector': 'Metalo detektorius',
        'Filling Machine': 'Užpildymo mašina',
        'Pasteurizer': 'Pasterizatorius',
        'Pallet Jack': 'Palečių vežimėlis',
        'Lab Testing Kit': 'Laboratorinių testų rinkinys',
        'Portable Burners': 'Nešiojami degikliai',
        'Insulated Hot Boxes': 'Izoliuotos šilumos dėžės',
        'Mobile Refrigeration': 'Mobilus šaldymas',
        'Hand Wash Station': 'Rankų plovimo stotis',
        'Blast Chiller': 'Greito aušinimo įrenginys',
        'Oven': 'Orkaitė',
        'Prep Tables': 'Paruošimo stalai',
        'Sink': 'Kriauklė',
        'Fridge': 'Šaldytuvas'
      },
      options: {
        'Restaurant': 'Restoranas',
        'Bakery': 'Kepykla',
        'Butcher Shop': 'Mėsinė',
        'Cafe / Coffee Shop': 'Kavinė / Coffee shop',
        'Food Manufacturer': 'Maisto gamintojas',
        'Catering Service': 'Maitinimo paslaugos',
        'Food Truck / Mobile Unit': 'Maisto furgonas / mobili įranga',
        'Hotel Kitchen': 'Viešbučio virtuvė',
        'School / Canteen': 'Mokykla / valgykla',
        'Hospital Kitchen': 'Ligoninės virtuvė',
        'Ghost Kitchen': 'Ghost kitchen',
        'Yes': 'Taip',
        'No': 'Ne',
        'Short (< 3 days)': 'Trumpas (< 3 dienos)',
        'Medium (< 1 week)': 'Vidutinis (< 1 savaitė)',
        'Long (> 1 week)': 'Ilgas (> 1 savaitė)',
        'Daily': 'Kasdien',
        'Weekly': 'Kas savaitę',
        'Shift-based': 'Pamaininis',
        'Yes, scheduled': 'Taip, suplanuota',
        'Occasionally': 'Kartais',
        'Yes, digital': 'Taip, skaitmeninis',
        'Yes, paper-based': 'Taip, popierinis',
        'Partial': 'Dalinė',
        'Digital (App/Cloud)': 'Skaitmeninis (programa/debesis)',
        'Paper-based': 'Popierinis',
        'Mixed': 'Mišrus',
        'Minimal': 'Minimalistinis',
        'Corporate': 'Korporatyvinis',
        'Modern': 'Modernus',
        'None / No Allergens': 'Nėra / be alergenų',
        'Gluten': 'Glutenas',
        'Crustaceans': 'Vėžiagyviai',
        'Fish': 'Žuvis',
        'Peanuts': 'Žemės riešutai',
        'Soy': 'Soja',
        'Milk': 'Pienas',
        'Nuts': 'Riešutai',
        'Celery': 'Salierai',
        'Mustard': 'Garstyčios',
        'Sesame': 'Sezamas',
        'Eggs': 'Kiaušiniai'
      },
      process_steps: {
        'Receiving': 'Priėmimas',
        'Storage': 'Sandėliavimas',
        'Thawing': 'Atšildymas',
        'Prep': 'Paruošimas',
        'Cooking': 'Gaminimas',
        'Cooling': 'Aušinimas',
        'Reheating': 'Pakartotinis šildymas',
        'Holding': 'Laikymas šiltai',
        'Packaging': 'Pakavimas'
      }
    },
    marketing: {
      wordDocx: {
        metaTitle: "HACCP planas Word (DOCX) | Redaguojamas šablonas",
        metaDescription: "Sukurkite redaguojamą HACCP planą Word (DOCX) formatu ES ir JK atitikčiai. Pritaikykite pavojus, KKP ir stebėseną su iLoveHACCP.",
        hero: {
          eyebrow: "Redaguojamas Word eksportas",
          title: "HACCP planas Word (DOCX)",
          subtitle: "Sukurkite atitinkantį HACCP planą ir eksportuokite kaip redaguojamą Word dokumentą."
        },
        ctas: {
          primary: { label: "Sukurti mano HACCP planą", href: "/builder" },
          secondary: { label: "Peržiūrėti pavyzdinį PDF", href: "/sample-haccp-plan-pdf" }
        },
        highlights: {
          title: "Kodėl komandos renkasi DOCX",
          items: [
            {
              title: "Pilnai redaguojamas",
              description: "Atnaujinkite pavojus, KKP ir stebėsenos žingsnius nepradėdami iš naujo."
            },
            {
              title: "Paruošta auditui struktūra",
              description: "Suderinta su EB 852/2004 ir aiškiai sugrupuota auditoriams."
            },
            {
              title: "Paruošta prekės ženklui",
              description: "Greitai pridėkite logotipus, vietos duomenis ir SOP nuorodas."
            }
          ]
        },
        checklist: {
          title: "Puikiai tinka auditams ir atnaujinimams",
          items: [
            "Pritaikykite kritines ribas, stebėseną ir korekcinius veiksmus",
            "Sekite versijas nuolatinei atitikčiai",
            "Dalinkitės su vadovais, virtuvės šefais ir auditoriais",
            "Prireikus eksportuokite į PDF su fiksuotu išdėstymu"
          ]
        },
        note: "Reikia fiksuoto išdėstymo? Bet kada eksportuokite į PDF."
      },
      examplePdf: {
        metaTitle: "HACCP plano pavyzdinis PDF | Nemokama peržiūra",
        metaDescription: "Peržiūrėkite HACCP plano pavyzdinį PDF su pavojų analize, KKP ir stebėsenos žurnalais. Sukurkite savo planą per kelias minutes.",
        hero: {
          eyebrow: "Nemokama dokumento peržiūra",
          title: "HACCP plano pavyzdinis PDF",
          subtitle: "Peržiūrėkite pilną HACCP planą su pavojų analize, KKP ir stebėsenos žurnalais prieš kurdami savo."
        },
        ctas: {
          primary: { label: "Peržiūrėti pavyzdinį PDF", href: "/sample-haccp-plan-pdf" },
          secondary: { label: "Sukurti mano HACCP planą", href: "/builder" }
        },
        highlights: {
          title: "Kas įtraukta į pavyzdį",
          items: [
            {
              title: "Pavojų analizės lentelės",
              description: "Biologiniai, cheminiai ir fiziniai pavojai kiekviename žingsnyje."
            },
            {
              title: "KKP nustatymas",
              description: "Kritinių kontrolės taškų logika ir ribos."
            },
            {
              title: "Stebėsenos žurnalai",
              description: "Kasdieniai temperatūros ir valymo kontroliniai sąrašai."
            }
          ]
        },
        checklist: {
          title: "Peržiūra padės",
          items: [
            "Suprasti auditoriams reikalingą dokumento struktūrą",
            "Nustatyti skyrius, kuriuos pritaikysite",
            "Pasidalyti su komanda prieš generuojant",
            "Patvirtinti Word ir PDF eksporto galimybes"
          ]
        },
        note: "Norite daugiau nei pavyzdys? Sukurkite planą pagal savo veiklą."
      },
      restaurants: {
        metaTitle: "HACCP restoranams | Maisto saugos plano kūrimas",
        metaDescription: "Sukurkite HACCP planą restoranui pagal EB 852/2004. Dokumentuokite gaminimą, vėsinimą, laikymą ir sanitariją.",
        hero: {
          eyebrow: "Restoranų HACCP kūrimas",
          title: "HACCP restoranams",
          subtitle: "Sukurkite restoranui pritaikytą HACCP planą, apimantį gaminimą, vėsinimą, laikymą, alergenus ir kasdienę sanitariją."
        },
        ctas: {
          primary: { label: "Pradėti restorano planą", href: "/builder" },
          secondary: { label: "Peržiūrėti HACCP šabloną", href: "/haccp-template" }
        },
        highlights: {
          title: "Sukurta užimtoms virtuvėms",
          items: [
            {
              title: "Procesų eiga žingsnis po žingsnio",
              description: "Priėmimas, paruošimas, gaminimas, vėsinimas ir aptarnavimas."
            },
            {
              title: "Alergenų ir tiekėjų kontrolė",
              description: "Dokumentuokite patvirtintus tiekėjus ir alergenų tvarkymą."
            },
            {
              title: "Kasdieniai patikros žurnalai",
              description: "Valymas, temperatūros ir korekciniai veiksmai."
            }
          ]
        },
        checklist: {
          title: "Restoranui reikalinga aprėptis",
          items: [
            "Karšto ir šalto laikymo ribos",
            "Kryžminės taršos kontrolė",
            "Personalo mokymai ir higienos patikros",
            "Auditui paruošti įrašai ir peržiūros"
          ]
        },
        note: "Sukurkite kartą ir atnaujinkite, kai keičiasi meniu."
      },
      template: {
        metaTitle: "HACCP šablonas | Word ir PDF eksportas | iLoveHACCP",
        metaDescription: "Sukurkite HACCP šabloną savo verslui ir eksportuokite į Word arba PDF. Pritaikyta ES ir JK atitikčiai.",
        hero: {
          eyebrow: "Šablonų generatorius",
          title: "HACCP šablonas",
          subtitle: "Sukurkite praktinį HACCP šabloną savo veiklai ir eksportuokite į Word bei PDF."
        },
        ctas: {
          primary: { label: "Kurti šabloną", href: "/builder" },
          secondary: { label: "Peržiūrėti pavyzdinį PDF", href: "/sample-haccp-plan-pdf" }
        },
        highlights: {
          title: "Ką gaunate",
          items: [
            { title: "Redaguojama struktūra", description: "Atnaujinkite rizikas, CCP ir SOP keičiantis procesams." },
            { title: "Atitiktis", description: "Sudaryta pagal EC 852/2004 ir JK higienos lūkesčius." },
            { title: "Paruošta auditui", description: "Aiškios skiltys įrašams, stebėsenai ir korekciniams veiksmams." }
          ]
        },
        checklist: {
          title: "Geriausiai tinka",
          items: [
            "Pasiruošimui patikroms",
            "Maisto saugos dokumentacijos standartizavimui",
            "HACCP versijų valdymui",
            "Plano dalijimuisi su komanda"
          ]
        },
        note: "Reikia teisinių gairių? Žr. ES/JK reikalavimus."
      },
      euUkRequirements: {
        metaTitle: "ES ir JK HACCP reikalavimai | Reglamentas 852/2004",
        metaDescription: "Supraskite ES ir JK HACCP reikalavimus pagal Reglamentą 852/2004 ir ko tikisi inspektoriai.",
        hero: {
          eyebrow: "Reglamentavimo gidas",
          title: "ES ir JK HACCP reikalavimai",
          subtitle: "Praktinė 852/2004 reglamento ir patikrose reikalaujamų įrašų apžvalga."
        },
        ctas: {
          primary: { label: "Kurti atitinkantį planą", href: "/builder" },
          secondary: { label: "Peržiūrėti HACCP šabloną", href: "/haccp-template" }
        },
        highlights: {
          title: "Gide aptariama",
          items: [
            { title: "7 HACCP principai", description: "Rizikų analizė, CCP, ribos, stebėsena, korekcijos, patikra, dokumentai." },
            { title: "Patikrų lūkesčiai", description: "Ką dažniausiai tikrina vietos institucijos." },
            { title: "Praktinė atitiktis", description: "Kaip dokumentaciją išlaikyti aktualią ir proporcingą." }
          ]
        },
        checklist: {
          title: "Turėkite paruošta",
          items: [
            "Temperatūrų stebėsenos žurnalus",
            "Valymo ir dezinfekcijos įrašus",
            "Alergenų ir kryžminės taršos kontrolę",
            "Mokymų ir peržiūrų įrodymus"
          ]
        },
        note: "Šis puslapis informacinis ir nepakeičia profesionalios teisinės konsultacijos."
      },
      faqs: {
        metaTitle: "HACCP DUK | Atsakymai apie maisto saugą",
        metaDescription: "Atsakymai į dažniausius HACCP klausimus apie atitiktį, patikras, dokumentaciją ir platformos naudojimą.",
        title: "Dažniausiai užduodami klausimai",
        subtitle: "Dažni klausimai apie HACCP atitiktį, mūsų kūrimo įrankį ir maisto saugos dokumentaciją."
      }
    },
    pdf: {
      title: "HACCP planas",
      subtitle: "Maisto saugos valdymo sistema",
      facility: "Įstaigos pavadinimas",
      product_scope: "Produkto apimtis",
      date_issue: "Išdavimo data",
      standard: "Standartas",
      disclaimer: "Šis dokumentas yra sugeneruotas juodraštis ir turi būti patvirtintas kvalifikuoto specialisto.",
      confidential: "KONFIDENCIALU",
      version: "Versija 1.0",
      generated_by: "Sugeneruota ilovehaccp.com - maisto saugos sprendimai",
      s1_title: "1 skyrius — HACCP komanda ir apimtis",
      s2_title: "2 skyrius — Produkto aprašymas",
      s3_title: "3 skyrius — Proceso srauto diagrama",
      s4_title: "4 skyrius — Privalomosios programos (PRP)",
      s5_title: "5 skyrius — Pavojų analizė",
      s6_title: "6 skyrius — CCP nustatymas",
      s7_title: "7 skyrius — CCP valdymas",
      s7_desc: "Kritiniai kontrolės taškai (CCP) nustatyti naudojant Codex Alimentarius sprendimų medį.",
      s8_title: "8 skyrius — Patikra ir validavimas",
      s9_title: "9 skyrius — Įrašai ir peržiūra",
      s10_title: "9 skyrius — Įrašai ir peržiūra",
      lbl_product_name: "Produkto pavadinimas",
      lbl_description: "Aprašymas",
      lbl_ingredients: "Pagrindiniai ingredientai",
      lbl_shelf_life: "Tinkamumo laikas",
      lbl_intended_use: "Numatomas naudojimas",
      lbl_further_preparation: "Papildomas paruošimas / tvarkymas",
      lbl_storage: "Laikymas",
      col_program: "Programa",
      col_details: "Kontrolės detalės",
      col_step: "Žingsnis",
      col_hazards: "Nustatyti pavojai",
      col_control: "Kontrolės priemonės",
      col_ccp: "CCP?",
      val_prerequisite: "Privalomasis reikalavimas",

      s4_desc: "Išsamus kontrolės planas nustatytiems CCP.",
      lbl_hazard: "REIKŠMINGAS PAVOJUS",
      lbl_critical_limit: "Kritinis limitas",
      lbl_monitoring: "Stebėsena",
      lbl_corrective: "Koreguojantis veiksmas",
      msg_no_ccps: "Kritinių kontrolės taškų (CCP) nenustatyta. Procesas valdomas per PRP.",
      sign_prepared: "Parengė (HACCP komandos vadovas)",
      sign_approved: "Patvirtino (vadovybė)",
      tk_title: "Priemonių rinkinys: stebėsenos žurnalai",
      tk_temp_title: "Priedas A: Temperatūros kontrolės žurnalas",
      tk_temp_desc: "Naudokite šį žurnalą CCP temperatūroms fiksuoti (pvz., gaminimas, šaldytas laikymas).",
      col_date: "Data",
      col_time: "Laikas",
      col_item: "Produktas/įranga",
      col_temp: "Temp (°C)",
      col_action: "Veiksmas",
      col_sign: "Parašas",
      msg_corrective: "*Koreguojantis veiksmas reikalingas, jei pažeidžiami kritiniai limitai. Įrašykite veiksmus stulpelyje „Veiksmas“.",
      tk_clean_title: "Priedas B: Kasdienio valymo kontrolinis sąrašas",
      col_task: "Valymo užduotis",
      days: { mon: "Pr", tue: "An", wed: "Tr", thu: "Kt", fri: "Pn", sat_sun: "Št/Sk" },
      tasks: {
        surfaces: "Paviršiai ir paruošimo lentos",
        cooking: "Gaminimo įranga (orkaitės/viryklės)",
        fridges: "Šaldytuvai ir rankenos",
        sinks: "Kriauklės ir čiaupai",
        floors: "Grindys ir nuotekos",
        waste: "Atliekų dėžės (ištuštintos ir išvalytos)",
        handwash: "Rankų plovimo stotys"
      },
      tk_train_title: "Priedas C: Darbuotojų mokymų įrašas",
      col_employee: "Darbuotojo vardas",
      col_train_desc: "Mokymų aprašymas (pvz., HACCP 2 lygis)",
      cover_created_by: "Sukurta",
      cover_approved_by: "Patvirtinta",
      cover_date: "Data",
      cover_version: "Versija",
      lbl_page: "Puslapis",
      lbl_of: "iš"
    }
  };

export default dictionary;

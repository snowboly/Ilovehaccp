const dictionary = {
    nav: {
      builder: "HACCP Builder",
      features: "Features",
      resources: "Resources",
      pricing: "Pricing",
      about: "About",
      contact: "Contact",
      login: "Log In",
      getStarted: "Registration",
      articles: "Articles",
      faqs: "FAQs",
      logout: "Log Out",
      signedInAs: "Signed in as",
      loggedInAs: "Logged in as",
      dashboard: "Dashboard",
      settings: "Settings",
      createAccount: "Create Account"
    },
    dashboard: {
      title: "My Dashboard",
      subtitle: "Manage your food safety documentation",
      backToHome: "Back to Home",
      createNewPlan: "Create New Plan",
      activeDrafts: "Active Drafts",
      noActiveDrafts: "No active drafts.",
      documentsReviews: "Documents & Reviews",
      noPlansYet: "No generated plans yet.",
      missingPlan: "Missing a plan?",
      missingPlanDesc: "If you generated a plan before signing up, enter the Plan ID below to add it to your dashboard.",
      pastePlanId: "Paste Plan ID...",
      importPlan: "Import Plan",
      importing: "Importing...",
      confirmImport: "Confirm Import",
      confirmImportDesc: "You are about to import HACCP plan ID",
      ensureCorrectId: "Ensure this is the correct ID before proceeding.",
      yesImportPlan: "Yes, Import Plan",
      tableHeaders: {
        draft: "Draft",
        business: "Business",
        updated: "Updated",
        actions: "Actions",
        plan: "Plan",
        date: "Date",
        files: "Files",
        review: "Review",
        summary: "Summary"
      },
      reviewStatus: {
        concluded: "Review concluded",
        inProgress: "Review in progress",
        paid: "Paid",
        notRequested: "Not requested",
        inReview: "IN REVIEW",
        sentByEmail: "Sent by email"
      },
      viewSummary: "View summary",
      unfinishedDraft: "Unfinished Draft"
    },
    actions: {
      resume: "Resume",
      rename: "Rename",
      delete: "Delete",
      confirm: "Confirm",
      cancel: "Cancel",
      import: "Import",
      export: "Export",
      download: "Download",
      unlockExport: "Unlock export",
      requestReview: "Request review",
      paid: "PAID"
    },
    messages: {
      confirmDeleteDraft: "Are you sure you want to delete this draft? This cannot be undone.",
      confirmDeletePlan: "Are you sure you want to delete this plan? This cannot be undone.",
      draftNameEmpty: "Draft name cannot be empty.",
      enterNewDraftName: "Enter a new draft name:",
      importSuccess: "Plan imported successfully!",
      importFailed: "Import failed.",
      deleteSuccess: "Plan deleted successfully.",
      deleteFailed: "Failed to delete. Please try again.",
      renameFailed: "Failed to rename draft. Please try again.",
      downloadFailed: "Failed to download",
      checkoutFailed: "Failed to start checkout",
      systemError: "System error starting checkout.",
      cannotDeleteDependencies: "Cannot delete: It has active dependencies. Please contact support.",
      cannotDeleteReviewInProgress: "Cannot delete while review is in progress",
      paymentSuccess: "Payment processed successfully.",
      reviewRequested: "Review requested successfully.",
      exportUnlocked: "Export unlocked successfully."
    },
    footer: {
      description: "The world's most advanced food safety documentation platform. Helping businesses simplify their paperwork.",
      platform: "Platform",
      haccpBuilder: "HACCP Builder",
      resourcesTitle: "Resources",
      haccpExamplePdf: "HACCP Plan Example PDF",
      haccpTemplate: "HACCP Template",
      euUkRequirements: "EU & UK Requirements",
      knowledgeBase: "Knowledge Base",
      complianceFaqs: "Compliance FAQs",
      companyLegal: "Company & Legal",
      contactSupport: "Contact Support",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      cookiePolicy: "Cookie Policy",
      refundPolicy: "Refund Policy",
      allRightsReserved: "All rights reserved.",
      disclaimer: "Disclaimer: iLoveHACCP provides software tools for documentation purposes only. While our templates are guided by EC Regulation 852/2004 principles, we are not a law firm, regulatory body, or certification agency. Use of this platform does not guarantee inspection approval. Always verify your final plan with your local health authority or an Environmental Health Officer."
    },
    landing: {
      hero: {
        titlePart1: "Create a HACCP Plan in Minutes —",
        titlePart2: "Without Consultants or Spreadsheets",
        subtitle: "Create a HACCP plan in minutes. Professional food safety tools for restaurants, manufacturers, and catering.",
        check1: "Aligns with Standards",
        check2: "Custom to your business",
        check3: "Free to start",
        cta: "Build Your Plan Free",
        compliance: { standard_1: "EC 852/2004", eu: "UK FSA Standards", codex: "Codex CXC 1-1969" }
      },
      audience: {
        title: "Is iLoveHACCP Right for You?",
        subtitle: "We prioritize speed and practical alignment for small to medium food operations.",
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
        text: "I built iLoveHACCP because traditional consulting is too slow and expensive for small businesses. We democratize access to high-standard safety systems.",
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
        f3_title: "Inspection Support",
        f3_desc: "Export documents organized for inspections."
      },
      howItWorks: {
        badge: "Simple Process",
        title: "How It Works",
        subtitle: "From blank page to document draft in three simple steps.",
        s1_title: "1. Answer questions",
        s1_desc: "Answer a few questions about your food business and processes.",
        s2_title: "2. Plan generated",
        s2_desc: "We generate your custom HACCP plan automatically using our technology.",
        s3_title: "3. Download & Edit",
        s3_desc: "Download your documents and edit them anytime.",
        cta: "Start Your Plan Now"
      },
      pricing: {
        title: "Choose Your Plan",
        subtitle: "From a free preview to professional document export.",
        free: {
          title: "Free Draft",
          price: "€0",
          desc: "Build and preview your HACCP plan draft.",
          f1: "Full HACCP Builder",
          f2: "Draft autosave",
          f3: "Plan completeness checklist",
          f4: "Watermarked preview download",
          cta: "Start building",
          note: "Draft only — not an audit or approval."
        },
        starter: {
          badge: "Most Popular",
          title: "Document Export",
          price: "€39",
          desc: "Get clean PDF + Word files (no watermark).",
          f1: "PDF + Word export",
          f2: "Removes watermark",
          f3: "Ready to print and share",
          f4: "Instant download",
          cta: "Download PDF & Word",
          note: "Document export only — no review, audit, verification, or approval."
        },
        review: {
          title: "Plan Review & Feedback",
          price: "€99",
          desc: "Human feedback on your HACCP plan draft.",
          f1: "Completeness & consistency check",
          f2: "Gaps and unclear sections flagged",
          f3: "Written feedback & suggested edits",
          f4: "Notes on critical limits (where relevant)",
          cta: "Request review",
          note: "Advisory feedback only. Not an official audit, certification, regulatory approval, or guarantee of inspection outcome. Responsibility remains with the food business operator."
        },
      },
      finalCta: {
        title: "Ready to start?",
        btn: "Create Your Free Plan"
      }
    },
    hero: {
      title: "HACCP Plans in Minutes.",
      subtitle: "Generate professional HACCP plans in minutes using our free tool",
      cta: "Create Free Plan"
    },
    wizard: {
      title: "Let's Build Your HACCP Plan",
      subtitle: "Answer a few questions and our tool will draft a complete, standard-aligned document.",
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
    builder_inputs: {
      ingredients: {
        'Raw Meat': 'Raw Meat',
        'Poultry': 'Poultry',
        'Fish': 'Fish',
        'Eggs': 'Eggs',
        'Dairy': 'Dairy',
        'Fresh Produce': 'Fresh Produce',
        'Dry Goods': 'Dry Goods',
        'Frozen Goods': 'Frozen Goods',
        'Oils & Fats': 'Oils & Fats',
        'Flour': 'Flour',
        'Sugar': 'Sugar',
        'Yeast': 'Yeast',
        'Butter': 'Butter',
        'Milk': 'Milk',
        'Nuts': 'Nuts',
        'Chocolate': 'Chocolate',
        'Fruit Fillings': 'Fruit Fillings',
        'Spices': 'Spices',
        'Raw Beef': 'Raw Beef',
        'Raw Pork': 'Raw Pork',
        'Raw Lamb': 'Raw Lamb',
        'Raw Poultry': 'Raw Poultry',
        'Sausage Casings': 'Sausage Casings',
        'Marinades': 'Marinades',
        'Salt': 'Salt',
        'Coffee Beans': 'Coffee Beans',
        'Syrups': 'Syrups',
        'Pastries': 'Pastries',
        'Sandwich Fillings': 'Sandwich Fillings',
        'Salad Greens': 'Salad Greens',
        'Tea': 'Tea',
        'Bulk Raw Materials': 'Bulk Raw Materials',
        'Additives': 'Additives',
        'Preservatives': 'Preservatives',
        'Water': 'Water',
        'Packaging Material': 'Packaging Material',
        'Processing Aids': 'Processing Aids',
        'Pre-cooked Meals': 'Pre-cooked Meals',
        'Fresh Salads': 'Fresh Salads',
        'Buffet Items': 'Buffet Items',
        'Sauces': 'Sauces',
        'Desserts': 'Desserts',
        'Raw Red Meat': 'Raw Red Meat',
        'Raw Fish & Seafood': 'Raw Fish & Seafood',
        'Raw Shellfish': 'Raw Shellfish',
        'Shell Eggs': 'Shell Eggs',
        'Ready-to-Eat (RTE)': 'Ready-to-Eat (RTE)',
        'Baked Goods': 'Baked Goods',
        'Grains & Cereals': 'Grains & Cereals',
        'Canned / Dry Goods': 'Canned / Dry Goods',
        'Beverages': 'Beverages'
      },
      equipment: {
        'Rational Oven': 'Rational Oven',
        'Stove': 'Stove',
        'Grill': 'Grill',
        'Deep Fryer': 'Deep Fryer',
        'Walk-in Fridge': 'Walk-in Fridge',
        'Freezer': 'Freezer',
        'Dishwasher': 'Dishwasher',
        'Sous-vide Circulator': 'Sous-vide Circulator',
        'Vacuum Packer': 'Vacuum Packer',
        'Deck Oven': 'Deck Oven',
        'Proofer': 'Proofer',
        'Planetary Mixer': 'Planetary Mixer',
        'Dough Sheeter': 'Dough Sheeter',
        'Cooling Racks': 'Cooling Racks',
        'Spiral Mixer': 'Spiral Mixer',
        'Bread Slicer': 'Bread Slicer',
        'Industrial Mincer': 'Industrial Mincer',
        'Sausage Filler': 'Sausage Filler',
        'Slicer': 'Slicer',
        'Cold Room': 'Cold Room',
        'Bone Saw': 'Bone Saw',
        'Knife Sterilizer': 'Knife Sterilizer',
        'Scales': 'Scales',
        'Espresso Machine': 'Espresso Machine',
        'Milk Steamer': 'Milk Steamer',
        'Panini Press': 'Panini Press',
        'Display Fridge': 'Display Fridge',
        'Bean Grinder': 'Bean Grinder',
        'Ice Machine': 'Ice Machine',
        'Conveyor System': 'Conveyor System',
        'Industrial Mixer': 'Industrial Mixer',
        'Metal Detector': 'Metal Detector',
        'Filling Machine': 'Filling Machine',
        'Pasteurizer': 'Pasteurizer',
        'Pallet Jack': 'Pallet Jack',
        'Lab Testing Kit': 'Lab Testing Kit',
        'Portable Burners': 'Portable Burners',
        'Insulated Hot Boxes': 'Insulated Hot Boxes',
        'Mobile Refrigeration': 'Mobile Refrigeration',
        'Hand Wash Station': 'Hand Wash Station',
        'Blast Chiller': 'Blast Chiller',
        'Oven': 'Oven',
        'Prep Tables': 'Prep Tables',
        'Sink': 'Sink',
        'Fridge': 'Fridge'
      },
      options: {
        'Restaurant': 'Restaurant',
        'Bakery': 'Bakery',
        'Butcher Shop': 'Butcher Shop',
        'Cafe / Coffee Shop': 'Cafe / Coffee Shop',
        'Food Manufacturer': 'Food Manufacturer',
        'Catering Service': 'Catering Service',
        'Food Truck / Mobile Unit': 'Food Truck / Mobile Unit',
        'Hotel Kitchen': 'Hotel Kitchen',
        'School / Canteen': 'School / Canteen',
        'Hospital Kitchen': 'Hospital Kitchen',
        'Ghost Kitchen': 'Ghost Kitchen',
        'Yes': 'Yes',
        'No': 'No',
        'Short (< 3 days)': 'Short (< 3 days)',
        'Medium (< 1 week)': 'Medium (< 1 week)',
        'Long (> 1 week)': 'Long (> 1 week)',
        'Daily': 'Daily',
        'Weekly': 'Weekly',
        'Shift-based': 'Shift-based',
        'Yes, scheduled': 'Yes, scheduled',
        'Occasionally': 'Occasionally',
        'Yes, digital': 'Yes, digital',
        'Yes, paper-based': 'Yes, paper-based',
        'Partial': 'Partial',
        'Digital (App/Cloud)': 'Digital (App/Cloud)',
        'Paper-based': 'Paper-based',
        'Mixed': 'Mixed',
        'Minimal': 'Minimal',
        'Corporate': 'Corporate',
        'Modern': 'Modern',
        'None / No Allergens': 'None / No Allergens',
        'Gluten': 'Gluten',
        'Crustaceans': 'Crustaceans',
        'Fish': 'Fish',
        'Peanuts': 'Peanuts',
        'Soy': 'Soy',
        'Milk': 'Milk',
        'Nuts': 'Nuts',
        'Celery': 'Celery',
        'Mustard': 'Mustard',
        'Sesame': 'Sesame',
        'Eggs': 'Eggs'
      },
      process_steps: {
        'Receiving': 'Receiving',
        'Storage': 'Storage',
        'Thawing': 'Thawing',
        'Prep': 'Prep',
        'Cooking': 'Cooking',
        'Cooling': 'Cooling',
        'Reheating': 'Reheating',
        'Holding': 'Holding',
        'Packaging': 'Packaging'
      }
    },
    marketing: {
      wordDocx: {
        metaTitle: "HACCP Plan Word (DOCX) | Editable Template",
        metaDescription: "Generate an editable HACCP plan in Word (DOCX) for EU & UK compliance. Customize hazards, CCPs, and monitoring steps with iLoveHACCP.",
        hero: {
          eyebrow: "Editable Word Export",
          title: "HACCP Plan Word (DOCX)",
          subtitle: "Generate a compliant HACCP plan and export it as an editable Word document your team can update."
        },
        ctas: {
          primary: { label: "Create my HACCP plan", href: "/builder" },
          secondary: { label: "View sample PDF", href: "/sample-haccp-plan-pdf" }
        },
        highlights: {
          title: "Why teams choose DOCX",
          items: [
            {
              title: "Fully editable",
              description: "Update hazards, CCPs, and monitoring steps without starting over."
            },
            {
              title: "Audit-ready structure",
              description: "Aligned to EC 852/2004 with clear sections for auditors."
            },
            {
              title: "Brand-ready",
              description: "Add logos, site details, and SOP references in minutes."
            }
          ]
        },
        checklist: {
          title: "Perfect for audits and updates",
          items: [
            "Customize critical limits, monitoring, and corrective actions",
            "Track revisions for ongoing compliance",
            "Share with managers, chefs, and auditors",
            "Export to PDF whenever you need a fixed layout"
          ]
        },
        note: "Need a fixed layout instead? Export a PDF anytime."
      },
      examplePdf: {
        metaTitle: "HACCP Plan Example PDF | Free Preview",
        metaDescription: "Preview a sample HACCP plan PDF with hazard analysis, CCPs, and monitoring logs. Generate your own plan in minutes with iLoveHACCP.",
        hero: {
          eyebrow: "Free Document Preview",
          title: "HACCP Plan Example PDF",
          subtitle: "Preview a complete HACCP plan with hazard analysis, CCPs, and monitoring logs before you build your own."
        },
        ctas: {
          primary: { label: "Preview the sample PDF", href: "/sample-haccp-plan-pdf" },
          secondary: { label: "Build my HACCP plan", href: "/builder" }
        },
        highlights: {
          title: "What the sample includes",
          items: [
            {
              title: "Hazard analysis tables",
              description: "See biological, chemical, and physical hazards mapped to each step."
            },
            {
              title: "CCP determination",
              description: "Review critical control point logic and limits."
            },
            {
              title: "Monitoring logs",
              description: "Daily temperature and cleaning checklists included."
            }
          ]
        },
        checklist: {
          title: "Use the preview to",
          items: [
            "Understand the document structure required by auditors",
            "Identify the sections you’ll customize",
            "Share with your team before generating",
            "Confirm Word + PDF export options"
          ]
        },
        note: "Ready to go beyond the sample? Build a plan tailored to your operation."
      },
      restaurants: {
        metaTitle: "HACCP for Restaurants | Food Safety Plan Builder",
        metaDescription: "Build a restaurant HACCP plan aligned with EC 852/2004. Document cooking, cooling, storage, and sanitation controls.",
        hero: {
          eyebrow: "Restaurant HACCP Builder",
          title: "HACCP for Restaurants",
          subtitle: "Create a restaurant-ready HACCP plan covering cooking, cooling, storage, allergens, and daily sanitation checks."
        },
        ctas: {
          primary: { label: "Start restaurant plan", href: "/builder" },
          secondary: { label: "See HACCP template", href: "/haccp-template" }
        },
        highlights: {
          title: "Built for busy kitchens",
          items: [
            {
              title: "Line-by-line workflows",
              description: "Map receiving, prep, cooking, cooling, and service steps."
            },
            {
              title: "Allergen & supplier controls",
              description: "Document supplier approvals and allergen handling."
            },
            {
              title: "Daily verification logs",
              description: "Cleaning, temperature, and corrective action records."
            }
          ]
        },
        checklist: {
          title: "Restaurant-ready coverage",
          items: [
            "Hot and cold holding limits",
            "Cross-contamination controls",
            "Staff training and hygiene checks",
            "Audit-ready records and reviews"
          ]
        },
        note: "Generate once, then keep it current as menus change."
      }
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
      s1_title: "Section 1 — HACCP Team & Scope",
      s2_title: "Section 2 — Product Description",
      s3_title: "Section 3 — Process Flow Diagram",
      s4_title: "Section 4 — Prerequisite Programs (PRPs)",
      s5_title: "Section 5 — Hazard Analysis",
      s6_title: "Section 6 — CCP Determination",
      s7_title: "Section 7 — CCP Management",
      s7_desc: "Critical Control Points (CCPs) were determined using the Codex Alimentarius Decision Tree.",
      s8_title: "Section 8 — Verification & Validation",
      s9_title: "Section 9 — Records & Review",
      s10_title: "Section 9 — Records & Review",
      lbl_product_name: "Product Name",
      lbl_description: "Description",
      lbl_ingredients: "Main Ingredients",
      lbl_shelf_life: "Shelf Life",
      lbl_intended_use: "Intended Use",
      lbl_further_preparation: "Further Preparation/Handling",
      lbl_storage: "Storage",
      col_program: "Program",
      col_details: "Control Details",
      col_step: "Step",
      col_hazards: "Hazards Identified",
      col_control: "Control Measures",
      col_ccp: "CCP?",
      val_prerequisite: "Prerequisite",

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
      col_train_desc: "Training Description (e.g. HACCP Level 2)",
      cover_created_by: "Created by",
      cover_approved_by: "Approved by",
      cover_date: "Date",
      cover_version: "Version",
      lbl_page: "Page",
      lbl_of: "of"
    }
  };

export default dictionary;

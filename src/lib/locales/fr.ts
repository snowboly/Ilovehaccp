import en from './en';

const dictionary = {
  ...en,
  nav: {
    ...en.nav,
    resources: 'Ressources',
    pricing: 'Tarifs',
    about: 'À propos',
    contact: 'Contact',
    login: 'Se connecter',
    getStarted: 'Inscription',
    dashboard: 'Tableau de bord',
    settings: 'Paramètres',
    createAccount: 'Créer un compte',
  },
  footer: {
    ...en.footer,
    resourcesTitle: 'Ressources',
    complianceFaqs: 'FAQ conformité',
    companyLegal: 'Entreprise et mentions légales',
    contactSupport: 'Contacter le support',
  },
  landing: {
    ...en.landing,
    hero: {
      ...en.landing.hero,
      titlePart1: 'Créez un plan HACCP en quelques minutes —',
      titlePart2: 'Sans consultants ni tableurs',
      subtitle: 'Créez un plan HACCP en quelques minutes. Outils professionnels de sécurité alimentaire pour restaurants, fabricants et traiteurs.',
      cta: 'Créer mon plan gratuitement',
    },
  },
  marketing: {
    ...en.marketing,
    examplePdf: {
      ...en.marketing.examplePdf,
      metaTitle: 'Exemple de plan HACCP PDF | Aperçu gratuit',
      metaDescription: 'Consultez un exemple de plan HACCP en PDF avec analyse des dangers, CCP et registres de suivi.',
      hero: {
        ...en.marketing.examplePdf.hero,
        eyebrow: 'Aperçu gratuit du document',
        title: 'Exemple de plan HACCP PDF',
        subtitle: 'Consultez un plan HACCP complet avec analyse des dangers, CCP et registres avant de créer le vôtre.',
      },
      ctas: {
        primary: { label: "Voir l'exemple PDF", href: '/sample-haccp-plan-pdf' },
        secondary: { label: 'Créer mon plan HACCP', href: '/builder' },
      },
      highlights: {
        title: "Ce que l'exemple contient",
        items: [
          { title: 'Tableaux d’analyse des dangers', description: 'Dangers biologiques, chimiques et physiques par étape.' },
          { title: 'Détermination des CCP', description: 'Logique des points critiques de contrôle et limites critiques.' },
          { title: 'Registres de suivi', description: 'Contrôles quotidiens de température et de nettoyage inclus.' },
        ],
      },
      checklist: {
        title: "Utilisez l’aperçu pour",
        items: [
          'Comprendre la structure attendue en audit',
          'Identifier les sections à personnaliser',
          'Partager avec votre équipe avant génération',
          'Confirmer les options d’export Word + PDF',
        ],
      },
      note: 'Prêt à aller plus loin ? Créez un plan adapté à votre activité.',
    },
    template: {
      ...en.marketing.template,
      metaTitle: 'Modèle HACCP | Export Word & PDF | iLoveHACCP',
      metaDescription: 'Générez un modèle HACCP pour votre activité alimentaire et exportez-le en Word ou PDF.',
      hero: {
        ...en.marketing.template.hero,
        eyebrow: 'Générateur de modèle',
        title: 'Modèle HACCP',
        subtitle: 'Créez un modèle HACCP pratique adapté à votre activité, puis exportez en Word et PDF.',
      },
      ctas: {
        primary: { label: 'Générer mon modèle', href: '/builder' },
        secondary: { label: "Voir l'exemple PDF", href: '/sample-haccp-plan-pdf' },
      },
      highlights: {
        title: 'Ce que vous obtenez',
        items: [
          { title: 'Structure modifiable', description: 'Mettez à jour dangers, CCP et SOP à mesure que le process évolue.' },
          { title: 'Orienté conformité', description: 'Aligné avec le règlement CE 852/2004 et les attentes d’hygiène au Royaume-Uni.' },
          { title: 'Prêt pour audit', description: 'Sections claires pour registres, suivi et actions correctives.' },
        ],
      },
      checklist: {
        title: 'Idéal pour',
        items: [
          'Préparer les inspections',
          'Standardiser la documentation de sécurité alimentaire',
          'Conserver des versions de vos enregistrements HACCP',
          'Partager les plans avec votre équipe',
        ],
      },
      note: 'Besoin du contexte légal ? Consultez le guide des exigences UE/Royaume-Uni.',
    },
    euUkRequirements: {
      ...en.marketing.euUkRequirements,
      metaTitle: 'Exigences HACCP UE & Royaume-Uni | Règlement 852/2004',
      metaDescription: 'Comprenez les exigences HACCP dans l’UE et au Royaume-Uni selon le règlement 852/2004.',
      hero: {
        ...en.marketing.euUkRequirements.hero,
        eyebrow: 'Guide réglementaire',
        title: 'Exigences HACCP UE & Royaume-Uni',
        subtitle: 'Vue pratique du règlement 852/2004 et des registres attendus lors des inspections.',
      },
      ctas: {
        primary: { label: 'Créer un plan conforme', href: '/builder' },
        secondary: { label: 'Voir le modèle HACCP', href: '/haccp-template' },
      },
      highlights: {
        title: 'Ce guide couvre',
        items: [
          { title: '7 principes HACCP', description: 'Analyse des dangers, CCP, limites, surveillance, corrections, vérification, enregistrements.' },
          { title: 'Attentes en inspection', description: 'Ce que vérifient généralement les inspecteurs et autorités locales.' },
          { title: 'Conformité pratique', description: 'Comment garder une documentation HACCP proportionnée et à jour.' },
        ],
      },
      checklist: {
        title: 'À préparer',
        items: [
          'Registres de suivi des températures',
          'Registres de nettoyage et de désinfection',
          'Contrôles allergènes et contamination croisée',
          'Preuves de formation du personnel et de revue',
        ],
      },
      note: 'Cette page est informative et ne remplace pas un conseil juridique professionnel.',
    },
    faqs: {
      ...en.marketing.faqs,
      metaTitle: 'FAQ HACCP | Réponses sécurité alimentaire',
      metaDescription: 'Réponses aux questions fréquentes sur le HACCP, les inspections, la documentation et la plateforme.',
      title: 'Questions fréquentes',
      subtitle: 'Questions courantes sur la conformité HACCP, notre générateur et la documentation de sécurité alimentaire.',
    },
  },
};

export default dictionary;

export type Language = 'en' | 'es' | 'fr' | 'pt';

export const translations = {
  en: {
    nav: {
      builder: "Builder",
      features: "Features",
      resources: "Resources",
      pricing: "Pricing",
      login: "Log In",
      getStarted: "Get Started"
    },
    hero: {
      title: "HACCP Plans Done in Minutes.",
      subtitle: "Stop wrestling with Word documents. Our AI consultant generates audit-ready food safety plans tailored to your menu.",
      cta: "Build Your Plan Free"
    },
    wizard: {
      title: "Let's Build Your HACCP Plan",
      subtitle: "Answer a few questions and our AI will draft a complete, compliance-ready document.",
      start: "Start Builder",
      next: "Next",
      back: "Back",
      add: "Add",
      generating: "Crafting your HACCP plan...",
      generatingDesc: "Our AI is applying standards to your specific business context.",
      download: "Download PDF",
      success: "Your Draft is Ready!",
      step_business: "Business Context",
      step_products: "Product Details",
      // ... Add mapped keys for questions dynamically or use a fallback
    }
  },
  es: {
    nav: {
      builder: "Constructor",
      features: "Características",
      resources: "Recursos",
      pricing: "Precios",
      login: "Iniciar Sesión",
      getStarted: "Empezar"
    },
    hero: {
      title: "Planes HACCP en Minutos.",
      subtitle: "Deje de luchar con documentos de Word. Nuestra IA genera planes de seguridad alimentaria listos para auditoría.",
      cta: "Crear Plan Gratis"
    },
    wizard: {
      title: "Vamos a crear su plan HACCP",
      subtitle: "Responda unas preguntas y nuestra IA redactará un documento completo y listo para cumplir.",
      start: "Iniciar Constructor",
      next: "Siguiente",
      back: "Atrás",
      add: "Añadir",
      generating: "Creando su plan HACCP...",
      generatingDesc: "Nuestra IA está aplicando estándares a su contexto empresarial.",
      download: "Descargar PDF",
      success: "¡Su borrador está listo!",
      step_business: "Contexto Empresarial",
      step_products: "Detalles del Producto"
    }
  },
  fr: {
    nav: {
      builder: "Générateur",
      features: "Fonctionnalités",
      resources: "Ressources",
      pricing: "Tarifs",
      login: "Connexion",
      getStarted: "Commencer"
    },
    hero: {
      title: "Plans HACCP en quelques minutes.",
      subtitle: "Arrêtez de lutter avec des documents Word. Notre IA génère des plans de sécurité alimentaire prêts pour l'audit.",
      cta: "Créer un plan gratuit"
    },
    wizard: {
      title: "Créons votre plan HACCP",
      subtitle: "Répondez à quelques questions et notre IA rédigera un document complet.",
      start: "Démarrer",
      next: "Suivant",
      back: "Retour",
      add: "Ajouter",
      generating: "Création de votre plan HACCP...",
      generatingDesc: "Notre IA applique les normes à votre contexte commercial.",
      download: "Télécharger PDF",
      success: "Votre brouillon est prêt !",
      step_business: "Contexte Commercial",
      step_products: "Détails du Produit"
    }
  },
  pt: {
    nav: {
      builder: "Criador",
      features: "Funcionalidades",
      resources: "Recursos",
      pricing: "Preços",
      login: "Entrar",
      getStarted: "Começar"
    },
    hero: {
      title: "Planos HACCP em Minutos.",
      subtitle: "Pare de lutar com documentos Word. Nossa IA gera planos de segurança alimentar prontos para auditoria.",
      cta: "Criar Plano Grátis"
    },
    wizard: {
      title: "Vamos criar o seu plano HACCP",
      subtitle: "Responda a algumas perguntas e nossa IA redigirá um documento completo.",
      start: "Iniciar Criador",
      next: "Próximo",
      back: "Voltar",
      add: "Adicionar",
      generating: "Criando seu plano HACCP...",
      generatingDesc: "Nossa IA está aplicando padrões ao seu contexto de negócios.",
      download: "Baixar PDF",
      success: "Seu rascunho está pronto!",
      step_business: "Contexto de Negócios",
      step_products: "Detalhes do Produto"
    }
  }
};

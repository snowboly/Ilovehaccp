import en from './en';

const dictionary = {
  ...en,
  nav: {
    ...en.nav,
    resources: 'Recursos',
    pricing: 'Precios',
    about: 'Acerca de',
    contact: 'Contacto',
    login: 'Iniciar sesión',
    getStarted: 'Registro',
    dashboard: 'Panel',
    settings: 'Configuración',
    createAccount: 'Crear cuenta',
  },
  footer: {
    ...en.footer,
    resourcesTitle: 'Recursos',
    complianceFaqs: 'Preguntas frecuentes de cumplimiento',
    companyLegal: 'Empresa y legal',
    contactSupport: 'Contactar soporte',
  },
  landing: {
    ...en.landing,
    hero: {
      ...en.landing.hero,
      titlePart1: 'Crea un plan HACCP en minutos —',
      titlePart2: 'Sin consultores ni hojas de cálculo',
      subtitle: 'Crea un plan HACCP en minutos. Herramientas profesionales de seguridad alimentaria para restaurantes, fabricantes y catering.',
      cta: 'Crear plan gratis',
    },
  },
  marketing: {
    ...en.marketing,
    examplePdf: {
      ...en.marketing.examplePdf,
      metaTitle: 'Ejemplo de Plan HACCP en PDF | Vista previa gratuita',
      metaDescription: 'Visualiza un ejemplo de plan HACCP en PDF con análisis de peligros, PCC y registros de monitoreo.',
      hero: {
        ...en.marketing.examplePdf.hero,
        eyebrow: 'Vista previa gratuita del documento',
        title: 'Ejemplo de Plan HACCP en PDF',
        subtitle: 'Revisa un plan HACCP completo con análisis de peligros, PCC y registros antes de crear el tuyo.',
      },
      ctas: {
        primary: { label: 'Ver el PDF de ejemplo', href: '/sample-haccp-plan-pdf' },
        secondary: { label: 'Crear mi plan HACCP', href: '/builder' },
      },
      highlights: {
        title: 'Qué incluye la muestra',
        items: [
          { title: 'Tablas de análisis de peligros', description: 'Peligros biológicos, químicos y físicos mapeados por etapa.' },
          { title: 'Determinación de PCC', description: 'Lógica de puntos críticos de control y límites críticos.' },
          { title: 'Registros de monitoreo', description: 'Incluye controles diarios de temperatura y limpieza.' },
        ],
      },
      checklist: {
        title: 'Usa la vista previa para',
        items: [
          'Entender la estructura esperada por los auditores',
          'Identificar las secciones que personalizarás',
          'Compartirla con tu equipo antes de generar',
          'Confirmar opciones de exportación Word + PDF',
        ],
      },
      note: '¿Listo para ir más allá de la muestra? Crea un plan adaptado a tu operación.',
    },
    template: {
      ...en.marketing.template,
      metaTitle: 'Plantilla HACCP | Exportación Word y PDF | iLoveHACCP',
      metaDescription: 'Genera una plantilla HACCP para tu negocio alimentario y expórtala a Word o PDF.',
      hero: {
        ...en.marketing.template.hero,
        eyebrow: 'Generador de plantillas',
        title: 'Plantilla HACCP',
        subtitle: 'Crea una plantilla HACCP práctica para tu operación y expórtala en Word y PDF.',
      },
      ctas: {
        primary: { label: 'Generar mi plantilla', href: '/builder' },
        secondary: { label: 'Ver PDF de ejemplo', href: '/sample-haccp-plan-pdf' },
      },
      highlights: {
        title: 'Qué obtienes',
        items: [
          { title: 'Estructura editable', description: 'Actualiza peligros, PCC y POE a medida que evoluciona tu proceso.' },
          { title: 'Enfoque en cumplimiento', description: 'Alineado con el Reglamento 852/2004 y requisitos del Reino Unido.' },
          { title: 'Listo para auditorías', description: 'Secciones claras para registros, monitoreo y acciones correctivas.' },
        ],
      },
      checklist: {
        title: 'Ideal para',
        items: [
          'Preparar inspecciones',
          'Estandarizar la documentación de seguridad alimentaria',
          'Mantener versiones de registros HACCP',
          'Compartir planes con tu equipo',
        ],
      },
      note: '¿Necesitas contexto legal? Consulta la guía de requisitos UE/Reino Unido.',
    },
    euUkRequirements: {
      ...en.marketing.euUkRequirements,
      metaTitle: 'Requisitos HACCP UE y Reino Unido | Reglamento 852/2004',
      metaDescription: 'Entiende los requisitos HACCP en la UE y el Reino Unido según el Reglamento 852/2004.',
      hero: {
        ...en.marketing.euUkRequirements.hero,
        eyebrow: 'Guía regulatoria',
        title: 'Requisitos HACCP UE y Reino Unido',
        subtitle: 'Resumen práctico del Reglamento 852/2004 y de los registros esperados durante inspecciones.',
      },
      ctas: {
        primary: { label: 'Crear un plan conforme', href: '/builder' },
        secondary: { label: 'Ver plantilla HACCP', href: '/haccp-template' },
      },
      highlights: {
        title: 'Qué cubre esta guía',
        items: [
          { title: '7 principios HACCP', description: 'Análisis de peligros, PCC, límites, monitoreo, acciones correctivas, verificación y registros.' },
          { title: 'Expectativas de inspección', description: 'Lo que suelen revisar inspectores y autoridades locales.' },
          { title: 'Cumplimiento práctico', description: 'Cómo mantener tu documentación HACCP proporcional y actualizada.' },
        ],
      },
      checklist: {
        title: 'Ten esto preparado',
        items: [
          'Registros de monitoreo de temperatura',
          'Registros de limpieza y saneamiento',
          'Controles de alérgenos y contaminación cruzada',
          'Evidencia de formación y revisión del personal',
        ],
      },
      note: 'Esta página es informativa y no sustituye asesoramiento legal profesional.',
    },
    faqs: {
      ...en.marketing.faqs,
      metaTitle: 'FAQs HACCP | Preguntas sobre seguridad alimentaria',
      metaDescription: 'Respuestas a preguntas comunes sobre HACCP, inspecciones, documentación y uso de la plataforma.',
      title: 'Preguntas frecuentes',
      subtitle: 'Preguntas habituales sobre cumplimiento HACCP, nuestro generador y documentación de seguridad alimentaria.',
    },
  },
};

export default dictionary;

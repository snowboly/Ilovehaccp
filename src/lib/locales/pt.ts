import en from './en';

const dictionary = {
  ...en,
  nav: {
    ...en.nav,
    resources: 'Recursos',
    pricing: 'Preços',
    about: 'Sobre',
    contact: 'Contacto',
    login: 'Entrar',
    getStarted: 'Registo',
    faqs: 'FAQs',
    dashboard: 'Painel',
    settings: 'Definições',
    createAccount: 'Criar conta',
  },
  footer: {
    ...en.footer,
    resourcesTitle: 'Recursos',
    complianceFaqs: 'FAQs de conformidade',
    companyLegal: 'Empresa e legal',
    contactSupport: 'Contactar suporte',
  },
  landing: {
    ...en.landing,
    hero: {
      ...en.landing.hero,
      titlePart1: 'Crie um plano HACCP em minutos —',
      titlePart2: 'Sem consultores nem folhas de cálculo',
      subtitle: 'Crie um plano HACCP em minutos. Ferramentas profissionais de segurança alimentar para restaurantes, produção e catering.',
      cta: 'Criar plano grátis',
    },
  },
  marketing: {
    ...en.marketing,
    examplePdf: {
      ...en.marketing.examplePdf,
      metaTitle: 'Exemplo de Plano HACCP PDF | Pré-visualização grátis',
      metaDescription: 'Veja um exemplo de plano HACCP em PDF com análise de perigos, PCC e registos de monitorização.',
      hero: {
        ...en.marketing.examplePdf.hero,
        eyebrow: 'Pré-visualização gratuita do documento',
        title: 'Exemplo de Plano HACCP PDF',
        subtitle: 'Veja um plano HACCP completo com análise de perigos, PCC e registos antes de criar o seu.',
      },
      ctas: {
        primary: { label: 'Ver exemplo em PDF', href: '/sample-haccp-plan-pdf' },
        secondary: { label: 'Criar o meu plano HACCP', href: '/builder' },
      },
      highlights: {
        title: 'O que o exemplo inclui',
        items: [
          { title: 'Tabelas de análise de perigos', description: 'Perigos biológicos, químicos e físicos mapeados por etapa.' },
          { title: 'Determinação de PCC', description: 'Lógica de pontos críticos de controlo e limites críticos.' },
          { title: 'Registos de monitorização', description: 'Listas diárias de temperatura e limpeza incluídas.' },
        ],
      },
      checklist: {
        title: 'Use a pré-visualização para',
        items: [
          'Compreender a estrutura esperada em auditorias',
          'Identificar as secções a personalizar',
          'Partilhar com a sua equipa antes de gerar',
          'Confirmar opções de exportação Word + PDF',
        ],
      },
      note: 'Pronto para ir além do exemplo? Crie um plano adaptado ao seu negócio.',
    },
    template: {
      ...en.marketing.template,
      metaTitle: 'Modelo HACCP | Exportação Word e PDF | iLoveHACCP',
      metaDescription: 'Gere um modelo HACCP para o seu negócio alimentar e exporte para Word ou PDF.',
      hero: {
        ...en.marketing.template.hero,
        eyebrow: 'Gerador de modelo',
        title: 'Modelo HACCP',
        subtitle: 'Crie um modelo HACCP prático para a sua operação e exporte para Word e PDF.',
      },
      ctas: {
        primary: { label: 'Gerar o meu modelo', href: '/builder' },
        secondary: { label: 'Ver exemplo em PDF', href: '/sample-haccp-plan-pdf' },
      },
      highlights: {
        title: 'O que recebe',
        items: [
          { title: 'Estrutura editável', description: 'Atualize perigos, PCC e POPs conforme o processo evolui.' },
          { title: 'Foco em conformidade', description: 'Alinhado com o Regulamento 852/2004 e requisitos no Reino Unido.' },
          { title: 'Pronto para auditoria', description: 'Secções claras para registos, monitorização e ações corretivas.' },
        ],
      },
      checklist: {
        title: 'Melhor para',
        items: [
          'Preparar inspeções',
          'Padronizar documentação de segurança alimentar',
          'Manter versões de registos HACCP',
          'Partilhar planos com a equipa',
        ],
      },
      note: 'Precisa de contexto legal? Veja o guia de requisitos UE/RU.',
    },
    euUkRequirements: {
      ...en.marketing.euUkRequirements,
      metaTitle: 'Requisitos HACCP na UE e RU | Regulamento 852/2004',
      metaDescription: 'Entenda os requisitos HACCP na UE e Reino Unido sob o Regulamento 852/2004.',
      hero: {
        ...en.marketing.euUkRequirements.hero,
        eyebrow: 'Guia regulatório',
        title: 'Requisitos HACCP na UE e RU',
        subtitle: 'Visão prática do Regulamento 852/2004 e dos registos exigidos em inspeções.',
      },
      ctas: {
        primary: { label: 'Criar plano em conformidade', href: '/builder' },
        secondary: { label: 'Ver modelo HACCP', href: '/haccp-template' },
      },
      highlights: {
        title: 'Abordado neste guia',
        items: [
          { title: '7 princípios HACCP', description: 'Análise de perigos, PCC, limites, monitorização, correções, verificação e registos.' },
          { title: 'Expectativas de inspeção', description: 'O que os inspetores e autoridades locais normalmente verificam.' },
          { title: 'Conformidade prática', description: 'Como manter documentação HACCP proporcional e atualizada.' },
        ],
      },
      checklist: {
        title: 'Tenha isto preparado',
        items: [
          'Registos de monitorização de temperatura',
          'Registos de limpeza e higienização',
          'Controlos de alergénios e contaminação cruzada',
          'Evidências de formação da equipa e revisão',
        ],
      },
      note: 'Esta página é informativa e não substitui aconselhamento jurídico profissional.',
    },
    faqs: {
      ...en.marketing.faqs,
      metaTitle: 'FAQs HACCP | Perguntas de segurança alimentar',
      metaDescription: 'Respostas a perguntas frequentes sobre HACCP, inspeções, documentação e utilização da plataforma.',
      title: 'Perguntas frequentes',
      subtitle: 'Dúvidas comuns sobre conformidade HACCP, o builder e documentação de segurança alimentar.',
    },
  },
};

export default dictionary;

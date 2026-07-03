export type Lang = 'es' | 'en'

const es = {
  nav: {
    services: 'Servicios',
    arenadesk: 'ArenaDesk',
    projects: 'Proyectos',
    process: 'Proceso',
    contact: 'Contacto',
    cta: 'Hablemos',
    menuOpen: 'Abrir menú',
    menuClose: 'Cerrar menú',
    langLabel: 'Cambiar idioma',
  },
  hero: {
    status: 'EN LÍNEA — SAN VITO, COSTA RICA',
    title: 'Hola, humano.',
    typed:
      'Soy la interfaz de TyT. Detrás de mí hay personas reales que construyen sitios, sistemas y automatización para empresas como la tuya. Dime qué necesitas — o empieza por aquí.',
    avatarAlt:
      'Asistente de TyT: figura de traje con un monitor vintage por cabeza y dos ojos rojos brillantes en la pantalla',
    pills: {
      quote: 'Cotizar un proyecto',
      work: 'Ver nuestro trabajo',
      arenadesk: 'Conocer ArenaDesk',
      talk: 'Hablar con nosotros',
    },
    scroll: 'desliza',
  },
  services: {
    label: 'Servicios',
    title: 'Cuatro problemas. Cuatro soluciones.',
    intro: 'Cada servicio ataca un problema concreto. Si el tuyo está aquí, lo tachamos.',
    buildLabel: 'Construimos',
    resultLabel: 'Resultado',
    items: [
      {
        name: 'Desarrollo web',
        problem: 'Tu web actual no genera nada.',
        build: 'Un sitio rápido, claro y hecho para convertir.',
        result: 'Consultas que llegan solas.',
      },
      {
        name: 'Automatización',
        problem: 'Tu equipo pierde horas en tareas repetitivas.',
        build: 'Flujos que conectan tus herramientas y trabajan solos.',
        result: 'Horas recuperadas cada semana.',
      },
      {
        name: 'Sistemas internos',
        problem: 'Tu operación vive en hojas de cálculo.',
        build: 'Plataformas con roles, datos y control de verdad.',
        result: 'Una sola fuente de verdad.',
      },
      {
        name: 'Consultoría técnica',
        problem: 'Tecnología comprada sin rumbo.',
        build: 'Un diagnóstico honesto y una hoja de ruta ejecutable.',
        result: 'Decisiones con criterio técnico.',
      },
    ],
  },
  arenadesk: {
    label: 'Producto',
    title: 'ArenaDesk. Tu gimnasio, bajo control.',
    copy: 'Miembros, pagos, asistencia y clases en un solo panel. Marca blanca, listo para operar desde el día uno.',
    cta: 'Solicitar una demo',
    note: 'Software propio de TyT',
  },
  projects: {
    label: 'Proyectos',
    title: 'Trabajo real, en producción.',
    hint: 'Cinco encargos reales. Cero plantillas.',
    visit: 'Visitar sitio',
    live: 'En línea',
    items: [
      {
        name: 'Savia',
        tag: 'Web corporativa',
        outcome: 'Presencia digital para asesores en sostenibilidad.',
      },
      {
        name: 'JC Tours',
        tag: 'Turismo',
        outcome: 'Catálogo de tours con reservas directas, sin intermediarios.',
      },
      {
        name: 'BIONIC Centro de Acopio',
        tag: 'Sistema interno',
        outcome: 'Control operativo digital para un centro de reciclaje.',
      },
      {
        name: 'AZ Inmuebles',
        tag: 'Plataforma inmobiliaria',
        outcome: 'Catálogo de propiedades autoadministrable en Coto Brus.',
      },
      {
        name: 'HumanaMente',
        tag: 'Presencia digital',
        outcome: 'Sitio profesional para un consultorio psicológico.',
      },
    ],
  },
  process: {
    label: 'Proceso',
    title: 'Así trabajamos.',
    manifesto: 'No somos proveedores. Somos el aliado que se queda.',
    steps: [
      { name: 'Escuchar', desc: 'Entendemos tu negocio antes de proponer nada.' },
      { name: 'Diagnosticar', desc: 'Encontramos dónde se pierde tiempo y dinero.' },
      { name: 'Construir', desc: 'Entregas cortas. Avances que puedes ver.' },
      { name: 'Automatizar', desc: 'Lo repetitivo lo hacen las máquinas.' },
      { name: 'Acompañar', desc: 'Nos quedamos después del lanzamiento.' },
    ],
  },
  contact: {
    label: 'Contacto',
    title: 'Cuéntanos qué necesitas.',
    pitch: 'Hablas directo con quien construye. Respuesta en menos de 24 horas, sin compromiso y sin jerga.',
    name: 'Nombre',
    namePh: 'Tu nombre',
    reach: 'Email o WhatsApp',
    reachPh: 'nombre@empresa.com',
    message: 'Mensaje',
    messagePh: 'Qué quieres construir, mejorar o automatizar',
    send: 'Enviar',
    sending: 'Enviando…',
    success: 'Recibido',
    successNote: 'Gracias. Te escribimos en menos de 24 horas.',
    mailtoNote: 'Se abrió tu cliente de correo para enviarnos el mensaje directo.',
    error: 'No se pudo enviar. Escríbenos directo:',
    required: 'Completa este campo',
    or: 'o directo:',
  },
  footer: {
    tagline: 'Software a la medida, hecho en San Vito, Costa Rica.',
    location: 'San Vito, Costa Rica',
    coords: '8.8203° N, 82.9708° W',
    localTime: 'Hora local',
    nav: 'Índice',
    reach: 'Contacto',
    rights: 'Todos los derechos reservados.',
  },
  a11y: {
    skip: 'Saltar al contenido',
  },
}

export type Dict = typeof es

const en: Dict = {
  nav: {
    services: 'Services',
    arenadesk: 'ArenaDesk',
    projects: 'Work',
    process: 'Process',
    contact: 'Contact',
    cta: "Let's talk",
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    langLabel: 'Switch language',
  },
  hero: {
    status: 'ONLINE — SAN VITO, COSTA RICA',
    title: 'Hello, human.',
    typed:
      "I'm TyT's interface. Behind me there are real people building websites, systems and automation for companies like yours. Tell me what you need — or start here.",
    avatarAlt:
      'TyT assistant: a suited figure with a vintage monitor for a head and two glowing red eyes on the screen',
    pills: {
      quote: 'Get a quote',
      work: 'See our work',
      arenadesk: 'Meet ArenaDesk',
      talk: 'Talk to us',
    },
    scroll: 'scroll',
  },
  services: {
    label: 'Services',
    title: 'Four problems. Four solutions.',
    intro: "Each service attacks one concrete problem. If yours is here, we cross it out.",
    buildLabel: 'We build',
    resultLabel: 'Result',
    items: [
      {
        name: 'Web development',
        problem: "Your current site generates nothing.",
        build: 'A fast, clear site built to convert.',
        result: 'Inquiries that arrive on their own.',
      },
      {
        name: 'Automation',
        problem: 'Your team loses hours to repetitive tasks.',
        build: 'Flows that connect your tools and work alone.',
        result: 'Hours recovered every week.',
      },
      {
        name: 'Internal systems',
        problem: 'Your operation lives in spreadsheets.',
        build: 'Platforms with roles, data and real control.',
        result: 'A single source of truth.',
      },
      {
        name: 'Technical consulting',
        problem: 'Technology bought without direction.',
        build: 'An honest diagnosis and an executable roadmap.',
        result: 'Decisions with technical judgment.',
      },
    ],
  },
  arenadesk: {
    label: 'Product',
    title: 'ArenaDesk. Your gym, under control.',
    copy: 'Members, payments, attendance and classes in one panel. White label, ready to operate from day one.',
    cta: 'Request a demo',
    note: "TyT's own software",
  },
  projects: {
    label: 'Work',
    title: 'Real work, in production.',
    hint: 'Five real commissions. Zero templates.',
    visit: 'Visit site',
    live: 'Live',
    items: [
      {
        name: 'Savia',
        tag: 'Corporate site',
        outcome: 'Digital presence for sustainability advisors.',
      },
      {
        name: 'JC Tours',
        tag: 'Tourism',
        outcome: 'Tour catalog with direct bookings, no middlemen.',
      },
      {
        name: 'BIONIC Centro de Acopio',
        tag: 'Internal system',
        outcome: 'Digital operations control for a recycling center.',
      },
      {
        name: 'AZ Inmuebles',
        tag: 'Real estate platform',
        outcome: 'Self-managed property catalog in Coto Brus.',
      },
      {
        name: 'HumanaMente',
        tag: 'Digital presence',
        outcome: 'Professional site for a psychology practice.',
      },
    ],
  },
  process: {
    label: 'Process',
    title: 'How we work.',
    manifesto: "We are not vendors. We are the ally that stays.",
    steps: [
      { name: 'Listen', desc: 'We understand your business before proposing anything.' },
      { name: 'Diagnose', desc: 'We find where time and money leak.' },
      { name: 'Build', desc: 'Short deliveries. Progress you can see.' },
      { name: 'Automate', desc: 'Machines handle the repetitive.' },
      { name: 'Stay', desc: 'We remain after launch.' },
    ],
  },
  contact: {
    label: 'Contact',
    title: 'Tell us what you need.',
    pitch: 'You talk directly with the people who build. Reply within 24 hours, no commitment, no jargon.',
    name: 'Name',
    namePh: 'Your name',
    reach: 'Email or WhatsApp',
    reachPh: 'name@company.com',
    message: 'Message',
    messagePh: 'What you want to build, improve or automate',
    send: 'Send',
    sending: 'Sending…',
    success: 'Received',
    successNote: 'Thanks. We will write you within 24 hours.',
    mailtoNote: 'Your email client opened to send us the message directly.',
    error: "Couldn't send. Write to us directly:",
    required: 'Fill in this field',
    or: 'or directly:',
  },
  footer: {
    tagline: 'Custom software, made in San Vito, Costa Rica.',
    location: 'San Vito, Costa Rica',
    coords: '8.8203° N, 82.9708° W',
    localTime: 'Local time',
    nav: 'Index',
    reach: 'Contact',
    rights: 'All rights reserved.',
  },
  a11y: {
    skip: 'Skip to content',
  },
}

export const dictionaries: Record<Lang, Dict> = { es, en }

/** Datos que no dependen del idioma */
export const CONTACT = {
  email: 'tomas@tytsoftware.com',
  whatsapp: '+506 7042 7226',
  whatsappUrl: 'https://wa.me/50670427226',
  instagram: 'https://www.instagram.com/tytsoftware/',
  instagramHandle: '@tytsoftware',
} as const

export const PROJECT_META = [
  { url: 'https://saviasacr.com', image: '/projects/savia.png' },
  { url: 'https://jctourscr.com', image: null },
  { url: null, image: null },
  { url: 'https://azinmueblescr.com', image: '/projects/az-inmuebles.png' },
  { url: null, image: '/projects/humanamente.png' },
] as const

export interface Settings {
  email: string;
  phone1: string;
  phone2: string;
  phone3: string;
  address: string;
  foundedYear: number;
  introYouTube: string;
  aboutYouTube: string;
  aboutExperience: string;
  aboutImpact: string;
  mapEmbed: string;
  logo: string;
  favicon: string;
  heroBg: string;
  aboutImg1: string;
  aboutImg2: string;
}

export interface Technique {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface WhyCard {
  id: string;
  section: string;
  icon: string;
  items: string[];
  prev: string;
  next: string;
}

export interface Counter {
  id: string;
  label: string;
  value: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  facebook: string;
  instagram: string;
  linkedin: string;
}

export interface Client {
  id: string;
  name: string;
  logo: string;
}

export interface SiteContent {
  settings: Settings;
  techniques: Technique[];
  services: Service[];
  whyCards: WhyCard[];
  counters: Counter[];
  courses: Course[];
  team: TeamMember[];
  clients: Client[];
}

export function buildCounters(
  settings: Pick<Settings, 'foundedYear'>,
  courses: unknown[],
  clients: unknown[],
  team: unknown[],
): Counter[] {
  const thisYear = new Date().getFullYear();
  const founded = settings.foundedYear || thisYear;
  const years = Math.max(thisYear - founded + 1, 1);
  return [
    { id: 'clients', label: 'Clientes', value: clients.length },
    { id: 'courses', label: 'Cursos', value: courses.length },
    { id: 'years', label: 'Años de Servicio', value: years },
    { id: 'employees', label: 'Empleados Comprometidos', value: team.length },
  ];
}

export const DEFAULT_EMAIL = 'info@sinergiaocupacional.com';

export const fallbackContent: SiteContent = {
  settings: {
    email: DEFAULT_EMAIL,
    phone1: '+52 (899) 922-2737',
    phone2: '+52 (899) 922-4111',
    phone3: '+52 (899) 959-0599',
    address: 'Juárez Nte. #1335, Zona Centro, Reynosa Tamaulipas. C.P. 88500',
    foundedYear: 1990,
    introYouTube: 'https://www.youtube.com/embed/AsTib0V-YMw?autoplay=1&mute=1&rel=0',
    aboutYouTube:
      'https://www.youtube.com/embed/OTEdPtbCfl8?autoplay=1&mute=1&rel=0',
    aboutExperience:
      'Durante estos 36 años se han llegado a atender a mas del 60% de la industria de exportación de la región, en los servicios ya descritos. Presidente fundador del Comité de Salud de la asociación de maquiladoras de la Ciudad de Reynosa INDEX -antes RAMMAC-, y Vicepresidente en el Comité MASS (Medio Ambiente Salud y Seguridad) de INDEX por 10 años.',
    aboutImpact:
      'Alcance de servicios principalmente en la Ciudad de Reynosa Tamaulipas. Territorialmente, se otorgan servicios en las siguientes ciudades: Rio Bravo, Matamoros, Cd. Victoria, McAllen Texas, Monterrey, Mazatlan, Los Mochis, Gudalajara, CDMX, Ciudad del Carmen y Merida.',
    mapEmbed:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3583.0825795163987!2d-98.27881188463034!3d26.09622288348606!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x866508cfd28eb56f%3A0xaa0405e35348177e!2sCalle%20Benito%20Ju%C3%A1rez%201335%2C%20Reynosa%2C%20Tamps.!5e0!3m2!1sen!2smx!4v1585689550328!5m2!1sen!2smx',
    logo: '/img/logo2.jpg',
    favicon: '/favicon.png',
    heroBg: '/img/intro-bg2.png',
    aboutImg1: '/img/dandocurso.jpg',
    aboutImg2: '/img/exposicion.jpg',
  },

  techniques: [
    {
      id: 'expositiva',
      icon: 'lightbulb',
      title: 'Técnica Expositiva',
      description:
        'Esta técnica consiste en la exposición oral, por parte del instructor, de los temas de clase; se aplica en la enseñanza de todas las disciplinas y en todos los niveles, por lo que es la más común.',
    },
    {
      id: 'demostrativa',
      icon: 'bicycle',
      title: 'Técnica Demostrativa',
      description:
        'La demostración es un procedimientos deductivo, es un instrumento para comprobar la veracidad de afirmaciones verbales. La demostración puede ser Intelectual cuando se cotejan pruebas y razonamientos, Experimental cuando se reproducen fenómenos o experiencias, Documental cuando se reúnen textos comprobatorios y Operacional cuando se reproducen las acciones y procesos.',
    },
    {
      id: 'dialogo',
      icon: 'heartbeat',
      title: 'Técnica Diálogo-Discusión',
      description:
        'El diálogo tiene un fin constructivo, amplio y educativo en el que el participante reflexiona acerca de los temas que se están abordando y externa sus propios conceptos en el camino de construir claridad. Incluso, durante el diálogo los estudiantes pueden llegar a elaborar nuevas proposiciones.',
    },
  ],

  services: [
    {
      id: 'servicio-medico',
      icon: 'medkit',
      title: 'Servicio Médico',
      description: 'Para empresas maquiladoras mayormente.',
    },
    {
      id: 'examenes',
      icon: 'clipboard-check',
      title: 'Realización de Exámenes',
      description: 'Audiometrías y Espirometrías.',
    },
    {
      id: 'capacitacion',
      icon: 'clipboard',
      title: 'Capacitación',
      description: 'Capacitación en Salud, Seguridad Ocupacional y Desarrollo Humano.',
    },
  ],

  whyCards: [
    {
      id: 'why1',
      section: 'why1',
      icon: 'diamond',
      items: [
        '30 años de experiencia al servicio educativo de la comunidad fronteriza del Noreste de México.',
        'Instructores certificados en impartición de cursos de manera presencial grupal, por el CONOCER – Consejo Nacional de Normalización y Certificación de Competencias Laborales.',
        'Instructores certificados en diseño de cursos, por el CONOCER.',
      ],
      prev: 'Anterior',
      next: 'Siguiente',
    },
    {
      id: 'why2',
      section: 'why2',
      icon: 'language',
      items: [
        'Entrenamientos Lúdicos, “Cursos Dinámicos con Juegos Interactivos que incentivan el Aprendizaje y Trabajo en Equipo”.',
        'La didáctica de nuestros cursos, incluyen el realce positivo de actitudes personales.',
        'Oferta de cursos renovados e innovados constantemente.',
        'Catálogo de Cursos, avalados por la STPS.',
      ],
      prev: 'Anterior',
      next: 'Siguiente',
    },
    {
      id: 'why3',
      section: 'why3',
      icon: 'object-group',
      items: [
        'Efectivas Técnicas de Instrucción: Técnica Expositiva, Técnica Demostrativa y Técnica Diálogo Discusión.',
        'Oferta de alineaciones y proceso de certificación por el CONOCER, para específicas competencias laborales.',
        'Equipo de audiómetros, requeridos para pruebas de audiometías, calibrados bajo las normas oficiales.',
        'Nuestros cursos técnicos (vehículos industriales) incluyen una licencia en PVC con vigencia bi-anual.',
      ],
      prev: 'Anterior',
      next: 'Siguiente',
    },
  ],

  counters: [
    { id: 'clients', label: 'Clientes', value: 20 },
    { id: 'courses', label: 'Cursos', value: 6 },
    { id: 'years', label: 'Años de Servicio', value: 37 },
    { id: 'employees', label: 'Empleados Comprometidos', value: 5 },
  ],

  courses: [
    {
      id: 'montacargas',
      title: 'Montacargas',
      description: '3 niveles (principiante, intermedio y avanzado)',
      image: '/images/forklift.jpg',
    },
    {
      id: 'autoliderazgo-1',
      title: 'Autoliderazgo en Seguridad para CSH Parte 1',
      description: 'Herramientas de Liderazgo, Equipo y Comunicación',
      image: '/images/autoliderazgo.jpg',
    },
    {
      id: 'autoliderazgo-2',
      title: 'Autoliderazgo en Seguridad para CSH Parte 2',
      description: 'Mapa de Riesgos e Investigación Accidentes',
      image: '/images/part2.jpg',
    },
    {
      id: 'csh',
      title: 'Formación y Funciones de la CSH',
      description: 'Comisión de Seguridad e Higiene',
      image: '/images/comision.png',
    },
    {
      id: 'supervisores',
      title: 'Autoliderazgo en Seguridad para Supervisores',
      description: 'compromiso y conciencia',
      image: '/images/supervision.png',
    },
    {
      id: 'pnl',
      title: 'Herramientas de PNL para Servicio al Cliente.',
      description: 'Herramientas de Programación Neurolingüística',
      image: '/images/pnl.jpg',
    },
  ],

  team: [
    {
      id: 'gerardo',
      name: 'Gerardo Garcia González',
      role: 'Director de SINERGIA Ocupacional',
      photo: '/images/doc.jpg',
      facebook: '',
      instagram: '',
      linkedin: 'https://www.linkedin.com/in/gerardo-garcia-50ba9522/',
    },
    {
      id: 'ricardo',
      name: 'Ricardo González Durán',
      role: 'Gerente de Calidad y Operaciones',
      photo: '/images/RGD.jpg',
      facebook: 'https://www.facebook.com/Sinergia-Ocupacional-1433001093605899/',
      instagram: '',
      linkedin: 'https://www.linkedin.com/in/gonzalez-ricardo-6621b476/',
    },
    {
      id: 'alfredo',
      name: 'Alfredo Jiménez',
      role: '',
      photo: '/images/alfredo.jpg',
      facebook: '',
      instagram: '',
      linkedin: '',
    },
    {
      id: 'diana',
      name: 'Diana Ramirez',
      role: '',
      photo: '/images/diana.jpg',
      facebook: 'https://www.facebook.com/Sinergia-Ocupacional-1433001093605899/',
      instagram: '',
      linkedin: '',
    },
    {
      id: 'juan',
      name: 'Juan Manuel Viterio García',
      role: 'Gerente de Administración',
      photo: '/images/JMV.jpg',
      facebook: 'https://www.facebook.com/Sinergia-Ocupacional-1433001093605899/',
      instagram: '',
      linkedin: '',
    },
  ],

  clients: [
    { id: 'corning', name: 'Corning', logo: '/images/customers/corning.png' },
    { id: 'landis', name: 'Landis Gyr', logo: '/images/customers/landis.jpg' },
    { id: 'vertiv', name: 'Vertiv', logo: '/images/customers/vertiv.png' },
    {
      id: 'johnsoncontrols',
      name: 'Johnson Controls',
      logo: '/images/customers/johnsoncontrols.png',
    },
    { id: 'artron', name: 'Artron', logo: '/images/customers/artron.jpg' },
    { id: 'eaton', name: 'Eaton', logo: '/images/customers/Eaton.webp' },
    { id: 'trw', name: 'TRW', logo: '/images/customers/TRW.jpg' },
    { id: 'panasonic', name: 'Panasonic', logo: '/images/customers/Panasonic.png' },
    { id: 'ti', name: 'Texas Instruments', logo: '/images/customers/TI.jpg' },
    { id: 'kimball', name: 'Kimball', logo: '/images/customers/Kimball.jpg' },
    { id: 'nibco', name: 'NIBCO', logo: '/images/customers/nibco.png' },
    { id: 'nidec', name: 'Nidec', logo: '/images/customers/nidec.jpg' },
    { id: 'overly', name: 'Overly Door', logo: '/images/customers/logo-overly.jpg' },
    { id: 'denso', name: 'Denso', logo: '/images/customers/denso.png' },
    { id: 'emerson', name: 'Emerson', logo: '/images/customers/emerson.jpg' },
    {
      id: 'alps',
      name: 'ALPS Logistics',
      logo: '/images/customers/alps-logistics-co.jpeg',
    },
    { id: 'itw', name: 'ITW', logo: '/images/customers/ITW.jpg' },
    {
      id: 'mavericks',
      name: 'Mavericks Electronics',
      logo: '/images/customers/MavericksElectronics.jpg',
    },
    { id: 'hydro', name: 'Hydro', logo: '/images/customers/Hydro.jpg' },
    { id: 'copeland', name: 'Copeland', logo: '/images/customers/copeland.png' },
  ],
};
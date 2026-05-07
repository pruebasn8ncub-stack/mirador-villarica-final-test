export const PROYECTO = {
  nombre: 'Mirador de Villarrica',
  desarrolladora: 'Terra Segura Inmobiliaria',
  ubicacion: 'Lago Colico, Región de La Araucanía',
  totalParcelas: 94,
  superficieTotal: '80 hectáreas',
  rangoTamanios: 'Desde 5.000 m² hasta 1 hectárea',
  estadoLegal: 'SAG aprobado · Roles listos · Inscripción inmediata',
  precioContado: '$14.490.000',
  precioCredito: '$17.490.000',
  reserva: '$500.000',
  brochureUrl: '/brochure/mirador-villarrica-brochure.pdf',
  tour360Url: 'https://lanube360.com/mirador-de-villarrica/',
  masterPlanOficialUrl: 'https://miradordevillarrica.cl/imagenes/Plano%20Comercial_Mirador%20de%20Villarica.jpg',
};

export const DIEGO = {
  nombre: 'Diego Cavagnaro',
  whatsapp: '+56 9 4032 9987',
  whatsappRaw: '56940329987',
  email: 'diego@terrasegura.cl',
  oficina: 'Av Las Condes 7700, Oficina 205A, Santiago',
  horario: 'Lunes a viernes, 9:00 a 19:00 hrs',
};

export const DISTANCIAS: Array<{
  lugar: string;
  tiempo: string;
  km?: string;
}> = [
  { lugar: 'Cunco', tiempo: '20 min', km: '20 km' },
  { lugar: 'Lago Colico', tiempo: '20 min', km: '20 km' },
  { lugar: 'Villarrica centro', tiempo: '55 min', km: '60 km' },
  { lugar: 'Temuco', tiempo: '55 min', km: '60 km' },
  { lugar: 'Pucón', tiempo: '1 h 25 min', km: '85 km' },
  { lugar: 'Aeropuerto Araucanía', tiempo: '45 min' },
];

export const GALERIA = [
  { src: '/assets/banner-volcan.jpg', alt: 'Vista aérea del proyecto con Volcán Villarrica al fondo', width: 1600, height: 1200 },
  { src: '/assets/imagen1.jpg', alt: 'Acceso y caminos internos del proyecto', width: 1600, height: 2133 },
  { src: '/assets/galeria1.jpg', alt: 'Entorno natural del proyecto — Mirador de Villarrica', width: 1600, height: 1200 },
  { src: '/assets/galeria5-atardecer.jpg', alt: 'Atardecer en Mirador de Villarrica', width: 1600, height: 1200 },
  { src: '/assets/galeria2.jpg', alt: 'Vista general del proyecto', width: 1600, height: 1200 },
  { src: '/assets/galeria3.jpg', alt: 'Bosque nativo en Mirador de Villarrica', width: 1600, height: 1200 },
  { src: '/assets/galeria6.jpg', alt: 'Panorámica del terreno — Colico', width: 1600, height: 1200 },
  { src: '/assets/lagocolico.jpg', alt: 'Lago Colico a 20 minutos del proyecto', width: 1600, height: 924 },
  { src: '/assets/galeria7.jpg', alt: 'Parcela con vista al entorno natural', width: 1600, height: 1200 },
];

export const PROCESO_COMPRA = [
  {
    numero: 1,
    titulo: 'Reunión virtual',
    descripcion: 'Te conectamos con el equipo Terra Segura para resolver todas tus dudas.',
  },
  {
    numero: 2,
    titulo: 'Reserva',
    descripcion: 'Con $500.000 reservas tu parcela. Cubre gastos operacionales (notaría, CBR, abogados, certificados).',
  },
  {
    numero: 3,
    titulo: 'Promesa de compraventa',
    descripcion: 'Firma digital con clave única + pago del pie (Webpay, transferencia o vale vista).',
  },
  {
    numero: 4,
    titulo: 'Escritura',
    descripcion: 'Escritura de compraventa sin costo notarial adicional.',
  },
  {
    numero: 5,
    titulo: 'Entrega',
    descripcion: 'Inscripción en el Conservador de Bienes Raíces a nombre del comprador.',
  },
];

export const CARACTERISTICAS = [
  { icon: 'Droplet', titulo: 'Agua', detalle: 'Pozo (cada propietario hace el suyo)' },
  { icon: 'Zap', titulo: 'Luz', detalle: 'Postación eléctrica en la entrada del proyecto' },
  { icon: 'Route', titulo: 'Caminos internos', detalle: 'Estabilizados · Aptos para todo tipo de vehículos' },
  { icon: 'Shield', titulo: 'Acceso', detalle: 'Portón de entrada al proyecto' },
  { icon: 'FileCheck2', titulo: 'Legal', detalle: 'Inscripción en el Conservador la misma semana de la escritura' },
  { icon: 'Mountain', titulo: 'Entorno', detalle: 'Bosque nativo · Vistas al volcán y al lago' },
];

export const TERRA_SEGURA = {
  oficina: 'Av. Las Condes 7700, Oficina 205A · Santiago',
  sitio: 'https://terrasegura.cl/',
  pilares: [
    {
      icon: 'ShieldCheck',
      titulo: 'Seguridad legal',
      detalle:
        'Roles propios, planos SAG aprobados y escrituras inscritas en el Conservador. Cero promesas largas.',
    },
    {
      icon: 'Compass',
      titulo: 'Experiencia',
      detalle:
        'Equipo experto en finanzas e inversión inmobiliaria, con proyectos desde Aysén hasta Valparaíso.',
    },
    {
      icon: 'GraduationCap',
      titulo: 'Educación al cliente',
      detalle:
        'Acompañamos cada compra con asesoría legal, financiera y de uso del terreno. Compras sin letra chica.',
    },
  ],
};

export const PROYECTOS_TERRA_SEGURA: Array<{
  slug: string;
  nombre: string;
  region: string;
  comuna: string;
  estado: 'Este proyecto' | 'En venta' | 'Nuevo' | 'Próximamente';
  precioDesde: string;
  descripcion: string;
  image: string;
  href: string;
}> = [
  {
    slug: 'mirador-villarrica',
    nombre: 'Mirador de Villarrica',
    region: 'La Araucanía',
    comuna: 'Lago Colico',
    estado: 'Este proyecto',
    precioDesde: '$14.490.000',
    descripcion:
      '94 parcelas sobre 80 ha de bosque nativo, entre el volcán y el lago. SAG aprobado y roles listos.',
    image: '/assets/banner-volcan.jpg',
    href: '#top',
  },
  {
    slug: 'mirador-curacavi',
    nombre: 'Mirador de Curacaví',
    region: 'Región Metropolitana',
    comuna: 'Curacaví',
    estado: 'En venta',
    precioDesde: '$34.990.000',
    descripcion:
      'Parcelas desde 5.000 m² a una hora de Santiago, en armonía con la naturaleza. SAG aprobado y crédito directo.',
    image: '/assets/proyectos/mirador-curacavi.jpg',
    href: 'https://miradordecuracavi.cl/',
  },
  {
    slug: 'altos-limache',
    nombre: 'Altos de Limache',
    region: 'Valparaíso',
    comuna: 'Limache',
    estado: 'En venta',
    precioDesde: '$32.990.000',
    descripcion:
      'Menos de 40 parcelas de 5.000 m² con acceso directo a la ruta. A 1 h 20 de Santiago, vistas al valle.',
    image: '/assets/proyectos/altos-limache.jpg',
    href: 'https://portalterreno.cl/proyecto/2173',
  },
  {
    slug: 'valle-bucalemu',
    nombre: 'Valle Bucalemu',
    region: 'O’Higgins',
    comuna: 'Bucalemu',
    estado: 'Nuevo',
    precioDesde: '$14.490.000',
    descripcion:
      'Parcelas planas a 10 minutos de la playa, con caminos terminados, portón y roles listos para escriturar.',
    image: '/assets/proyectos/valle-bucalemu.jpg',
    href: 'https://vallebucalemu.cl/',
  },
  {
    slug: 'mirador-osorno',
    nombre: 'Mirador de Osorno',
    region: 'Los Lagos',
    comuna: 'Osorno',
    estado: 'En venta',
    precioDesde: '$11.990.000',
    descripcion:
      '62 parcelas de 5.000 m² y 10.000 m² a 40 minutos de Osorno, a 9 km del Río Bueno.',
    image: '/assets/proyectos/mirador-osorno.png',
    href: 'https://portalterreno.cl/proyecto/2166',
  },
  {
    slug: 'altos-osorno',
    nombre: 'Altos de Osorno',
    region: 'Los Lagos',
    comuna: 'San Juan de la Costa',
    estado: 'En venta',
    precioDesde: '$11.990.000',
    descripcion:
      '62 parcelas en entorno prístino, a 30 minutos de Osorno. Caminos listos, roles disponibles en junio 2026.',
    image: '/assets/proyectos/altos-osorno.jpg',
    href: 'https://altosdeosorno.cl/',
  },
  {
    slug: 'ribera-rio-palena',
    nombre: 'Ribera Río Palena',
    region: 'Aysén',
    comuna: 'Cisnes',
    estado: 'En venta',
    precioDesde: '$19.990.000',
    descripcion:
      '15 macrolotes a orillas del Río Palena y la Carretera Austral, con bosques milenarios. Roles y SAG aprobados.',
    image: '/assets/proyectos/ribera-palena.png',
    href: 'https://portalterreno.cl/proyecto/2164',
  },
];

export const LUGARES_CERCANOS: Array<{
  titulo: string;
  descripcion: string;
  tiempo: string;
}> = [
  {
    titulo: 'Lago Colico',
    descripcion: 'Uno de los lagos más limpios del sur de Chile, ideal para deportes náuticos.',
    tiempo: '20 min',
  },
  {
    titulo: 'Villarrica y Pucón',
    descripcion: 'Polos turísticos consolidados: termas, deportes de aventura, gastronomía.',
    tiempo: '55 min – 1h 25 min',
  },
  {
    titulo: 'Aeropuerto de la Araucanía',
    descripcion: 'Vuelo directo Santiago–Temuco (1:20 h). A 45 minutos del proyecto.',
    tiempo: '45 min',
  },
  {
    titulo: 'Temuco',
    descripcion: 'Capital regional. Comercio, salud y conectividad completa.',
    tiempo: '55 min',
  },
];

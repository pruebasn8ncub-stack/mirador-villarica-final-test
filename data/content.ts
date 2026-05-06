export const PROYECTO = {
  nombre: 'Mirador de Villarrica',
  desarrolladora: 'Terra Segura Inmobiliaria',
  ubicacion: 'Colico, Región de La Araucanía',
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
  { icon: 'FileCheck2', titulo: 'Legal', detalle: 'SAG aprobado · Roles listos · CBR inmediato' },
  { icon: 'Mountain', titulo: 'Entorno', detalle: 'Bosque nativo · Vistas al volcán y al lago' },
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

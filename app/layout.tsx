import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { PROYECTO, DIEGO } from '@/data/content';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const SITE_URL = 'https://mirador-villarrica-chatbot.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${PROYECTO.nombre} — Parcelas en Colico, Araucanía | Terra Segura`,
    template: `%s | ${PROYECTO.nombre}`,
  },
  description: `${PROYECTO.totalParcelas} parcelas desde 5.000 m² entre el volcán y el lago, en Colico, Región de La Araucanía. SAG aprobado, roles listos, caminos estabilizados. Desde ${PROYECTO.precioContado} contado o crédito directo desde ${PROYECTO.precioCredito}.`,
  keywords: [
    'parcelas Villarrica', 'parcelas Colico', 'parcelas Araucanía',
    'Mirador de Villarrica', 'Terra Segura', 'inversión sur de Chile',
    'parcelación SAG aprobada', 'crédito directo parcelas',
  ],
  authors: [{ name: 'Terra Segura Inmobiliaria' }],
  creator: 'Terra Segura Inmobiliaria',
  publisher: 'Terra Segura Inmobiliaria',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${PROYECTO.nombre} — Tu pedazo de sur entre el volcán y el lago`,
    description: `${PROYECTO.totalParcelas} parcelas desde 5.000 m² en Colico, Araucanía. Desde ${PROYECTO.precioContado}. SAG aprobado, crédito directo.`,
    url: SITE_URL,
    siteName: PROYECTO.nombre,
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PROYECTO.nombre} — Terra Segura`,
    description: `${PROYECTO.totalParcelas} parcelas en Colico, Araucanía. Desde ${PROYECTO.precioContado}.`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#1a3d2e',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'RealEstateAgent',
      name: 'Terra Segura Inmobiliaria',
      url: SITE_URL,
      telephone: DIEGO.whatsapp,
      email: DIEGO.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Av Las Condes 7700, Oficina 205A',
        addressLocality: 'Las Condes',
        addressRegion: 'Región Metropolitana',
        addressCountry: 'CL',
      },
      sameAs: [
        'https://instagram.com/terra.segura',
        'https://facebook.com/profile.php?id=61578113903295',
        'https://youtube.com/@PortalTerrenocom',
      ],
    },
    {
      '@type': 'Place',
      name: PROYECTO.nombre,
      description: `Parcelación de ${PROYECTO.superficieTotal} con ${PROYECTO.totalParcelas} parcelas desde 5.000 m².`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Colico',
        addressRegion: 'La Araucanía',
        addressCountry: 'CL',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -39.0833,
        longitude: -71.9667,
      },
    },
    {
      '@type': 'Offer',
      name: `Parcela ${PROYECTO.nombre}`,
      description: 'Parcela rural con rol propio, SAG aprobado y factibilidad de servicios.',
      priceCurrency: 'CLP',
      price: '14490000',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Terra Segura Inmobiliaria' },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans bg-crema text-bosque-900 antialiased">
        {children}
        <ChatWidget />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { ChatWidget } from '@/components/chat/ChatWidget';

export const metadata: Metadata = {
  title: 'Mirador de Villarrica — Parcelas en Colico, Araucanía | Terra Segura',
  description:
    '94 parcelas desde 5.000 m² en Colico, Región de La Araucanía. SAG aprobado, roles listos, caminos estabilizados. Desde $14.490.000 contado.',
  openGraph: {
    title: 'Mirador de Villarrica — Terra Segura',
    description: '94 parcelas desde $14.490.000 en Colico, Araucanía.',
    type: 'website',
    locale: 'es_CL',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CL">
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}

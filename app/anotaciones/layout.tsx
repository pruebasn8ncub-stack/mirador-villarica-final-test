import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de anotaciones',
  robots: { index: false, follow: false },
};

export default function AnotacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bosque-50/40 text-bosque-900">{children}</div>
  );
}

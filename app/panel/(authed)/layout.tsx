import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/feedback/auth';
import { PanelShell } from './PanelShell';

export const metadata: Metadata = {
  title: 'Panel de control',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAuthed()) {
    redirect('/panel/login?from=/panel');
  }
  return <PanelShell>{children}</PanelShell>;
}

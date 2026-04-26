import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/feedback/auth';
import { AnnotationsClient } from './AnnotationsClient';

export const dynamic = 'force-dynamic';

export default function AnotacionesPage() {
  if (!isAuthed()) {
    redirect('/anotaciones/login?from=/anotaciones');
  }
  return <AnnotationsClient />;
}

import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/feedback/auth';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  if (isAuthed()) {
    redirect(searchParams.from || '/anotaciones');
  }
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2 text-bosque-700">
          <span className="inline-block h-2 w-2 rounded-full bg-mostaza" />
          <span className="text-[11px] font-semibold uppercase tracking-eyebrow">
            Mirador · Panel interno
          </span>
        </div>
        <h1 className="font-display text-3xl font-medium tracking-display text-bosque-900">
          Anotaciones de brokers
        </h1>
        <p className="mt-2 text-sm text-bosque-700">
          Acceso restringido. Ingresa tus credenciales para revisar el feedback
          guardado por el equipo de ventas.
        </p>
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-card ring-1 ring-bosque-100">
          <LoginForm redirectTo={searchParams.from || '/anotaciones'} />
        </div>
        <p className="mt-4 text-center text-[11px] text-bosque-500">
          Default: <span className="font-mono">admin</span> /{' '}
          <span className="font-mono">admin</span>
        </p>
      </div>
    </main>
  );
}

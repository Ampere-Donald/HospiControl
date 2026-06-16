import Link from 'next/link';
import { ArrowLeft, Construction, type LucideIcon } from 'lucide-react';

/** Page générique pour les modules pas encore développés (phases suivantes). */
export function ComingSoon({
  title,
  phase,
  description,
  icon: Icon = Construction,
}: {
  title: string;
  phase: number;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
          <Icon className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-xl font-bold text-slate-800">{title}</h1>
        <span className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
          Disponible en Phase {phase}
        </span>
        <p className="mt-4 text-sm text-slate-500">{description}</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}

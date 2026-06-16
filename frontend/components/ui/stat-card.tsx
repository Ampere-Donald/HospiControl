import type { LucideIcon } from 'lucide-react';

/** Carte statistique réutilisable (barres de stats des écrans). */
export function StatCard({
  icon: Icon,
  value,
  label,
  hint,
  tint = 'bg-brand-light text-brand',
  hintClass = 'text-slate-400',
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  hint?: string;
  tint?: string;
  hintClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tint}`}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <p className="mt-3 text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
      {hint && <p className={`mt-0.5 text-[11px] font-medium ${hintClass}`}>{hint}</p>}
    </div>
  );
}

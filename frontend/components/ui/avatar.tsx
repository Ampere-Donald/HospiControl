export type AvatarTone = 'brand' | 'slate' | 'blue' | 'amber';

const TONES: Record<AvatarTone, string> = {
  brand: 'bg-brand-light text-brand',
  slate: 'bg-slate-100 text-slate-500',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
};

/** Pastille d'initiales réutilisable. */
export function Avatar({
  initials,
  tone = 'brand',
  className = 'h-9 w-9 text-xs',
}: {
  initials: string;
  tone?: AvatarTone;
  className?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${TONES[tone]} ${className}`}
    >
      {initials}
    </span>
  );
}

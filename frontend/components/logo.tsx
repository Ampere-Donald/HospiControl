/** Symbole HospiControl : croix médicale teal (deux tons) + cœur central. */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Croix arrière (teal clair, légèrement décalée -> effet de profondeur) */}
      <g transform="translate(-1.6,-1.6)" opacity="0.55">
        <rect x="18" y="5" width="12" height="38" rx="6" fill="#5cc2b1" />
        <rect x="5" y="18" width="38" height="12" rx="6" fill="#5cc2b1" />
      </g>
      {/* Croix avant (teal de marque) */}
      <rect x="18" y="6" width="12" height="36" rx="6" fill="#0e8a78" />
      <rect x="6" y="18" width="36" height="12" rx="6" fill="#0e8a78" />
      {/* Cœur central */}
      <path
        d="M24 31s-7.5-5.5-7.5-10.2c0-2.3 1.8-4.1 4-4.1 1.4 0 2.7.7 3.5 1.9.8-1.2 2.1-1.9 3.5-1.9 2.2 0 4 1.8 4 4.1C31.5 25.5 24 31 24 31z"
        fill="#ffffff"
      />
    </svg>
  );
}

/** Logo complet : symbole + texte « HospiControl » (+ baseline optionnelle). */
export function Logo({
  className = '',
  markClass = 'h-9 w-9',
  textClass = 'text-2xl',
  baseline = false,
}: {
  className?: string;
  markClass?: string;
  textClass?: string;
  baseline?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markClass} />
      <div className="leading-none">
        <span className={`font-bold tracking-tight ${textClass}`}>
          <span className="text-brand">Hospi</span>
          <span className="text-slate-800">Control</span>
        </span>
        {baseline && (
          <p className="mt-1 text-xs font-medium text-slate-400">
            Carnet médical numérique
          </p>
        )}
      </div>
    </div>
  );
}

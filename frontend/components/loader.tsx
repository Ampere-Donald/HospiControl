import { LogoMark } from './logo';

/** Écran de chargement plein écran (transitions d'authentification). */
export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <LogoMark className="h-12 w-12" />
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand" />
    </div>
  );
}

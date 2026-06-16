'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CircleX,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { redirectForRole } from '@/lib/roles';
import { Logo } from '@/components/logo';
import { FullScreenLoader } from '@/components/loader';

/** Comptes de démonstration (cf. seed) — pré-remplis via les puces de rôle. */
const DEMO = {
  SUPER_ADMIN: { email: 'admin@carnet-medical.cm', motDePasse: 'Admin1234!' },
  ADMIN_HOPITAL: { email: 'admin@hopital-a.cm', motDePasse: 'Admin1234!' },
  MEDECIN: { email: 'medecin@hopital-a.cm', motDePasse: 'Medecin1234!' },
  ACCUEIL: { email: 'accueil@hopital-a.cm', motDePasse: 'Accueil1234!' },
} as const;

const roleChips = [
  { key: 'SUPER_ADMIN', label: 'Super admin', icon: ShieldCheck, cls: 'border-teal-100 bg-teal-50 text-teal-700 hover:bg-teal-100' },
  { key: 'ADMIN_HOPITAL', label: 'Admin hôpital', icon: Building2, cls: 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  { key: 'MEDECIN', label: 'Médecin', icon: Stethoscope, cls: 'border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { key: 'ACCUEIL', label: 'Accueil', icon: UserRound, cls: 'border-orange-100 bg-orange-50 text-orange-700 hover:bg-orange-100' },
] as const;

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Déjà connecté -> on file vers l'espace correspondant au rôle.
  useEffect(() => {
    if (!loading && user) router.replace(redirectForRole(user.role));
  }, [user, loading, router]);

  if (loading || user) return <FullScreenLoader />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const connecte = await login(email.trim(), motDePasse);
      router.replace(redirectForRole(connecte.role));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Connexion impossible. Vérifiez que l'API est démarrée.",
      );
      setSubmitting(false);
    }
  }

  function prefill(role: keyof typeof DEMO) {
    setEmail(DEMO[role].email);
    setMotDePasse(DEMO[role].motDePasse);
    setError('');
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-grid">
      {/* Bande sombre décorative (gauche) */}
      <aside className="absolute inset-y-0 left-0 hidden w-20 overflow-hidden bg-gradient-to-b from-brand-deep to-brand-forest lg:block">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
        <span className="absolute top-1/2 -right-5 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-dashed border-accent/70 bg-brand-deep text-accent">
          <Lock className="h-4 w-4" />
        </span>
      </aside>

      {/* Carte de connexion centrée */}
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-xl shadow-slate-200/60">
            {/* En-tête / logo */}
            <div className="flex flex-col items-center text-center">
              <Logo markClass="h-11 w-11" textClass="text-[27px]" />
              <p className="mt-1.5 text-sm font-medium text-slate-400">
                Carnet médical numérique
              </p>
              <span className="mt-4 h-1 w-10 rounded-full bg-accent/70" />
              <h1 className="mt-4 text-lg font-semibold text-slate-800">
                Connectez-vous à votre espace
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Accédez à la plateforme en toute sécurité
              </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-600">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Entrez votre email"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-600">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand accent-brand focus:ring-brand"
                  />
                  Se souvenir de moi
                </label>
                <button type="button" className="text-sm font-medium text-brand hover:text-brand-dark">
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Lock className="h-4 w-4" />
                {submitting ? 'Connexion…' : 'Se connecter'}
              </button>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
                  <CircleX className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </form>

            {/* Accès par rôle (pré-remplissage démo) */}
            <div className="mt-7">
              <div className="relative flex items-center justify-center">
                <span className="absolute inset-x-0 top-1/2 h-px bg-slate-100" />
                <span className="relative bg-white px-3 text-xs font-medium text-slate-400">
                  Accès par rôle
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {roleChips.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => prefill(r.key)}
                    title={`Pré-remplir : ${DEMO[r.key].email}`}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${r.cls}`}
                  >
                    <r.icon className="h-3.5 w-3.5" />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

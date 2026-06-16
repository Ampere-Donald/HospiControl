'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ClipboardList,
  FolderOpen,
  Lock,
  Search,
  ShieldCheck,
  UserSearch,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  formatTelephone,
  normaliserTelephone,
  telephoneValide,
} from '@/lib/telephone';
import type { RecherchePatient } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ConsentementCard } from '@/components/consentement-card';

const PRINCIPES = [
  {
    icon: ShieldCheck,
    titre: 'Toujours vos données',
    detail: 'Votre hôpital voit en permanence ce qu’il a lui-même créé.',
  },
  {
    icon: Lock,
    titre: 'Le reste sur consentement',
    detail:
      'L’historique des autres établissements n’apparaît qu’avec l’accord du patient.',
  },
  {
    icon: Check,
    titre: 'Révocable à tout moment',
    detail: 'La révocation retire l’accès immédiatement.',
  },
];

export default function ConsentementsPage() {
  const { user } = useAuth();
  const [tel, setTel] = useState('');
  const [resultat, setResultat] = useState<RecherchePatient | null>(null);
  const [recherche, setRecherche] = useState(false);

  const cle = normaliserTelephone(tel);
  const valide = telephoneValide(cle);

  async function rechercher() {
    if (!valide) return;
    setRecherche(true);
    setResultat(null);
    try {
      setResultat(
        await apiFetch<RecherchePatient>(
          `/patients/recherche?telephone=${encodeURIComponent(cle)}`,
        ),
      );
    } catch {
      setResultat(null);
    } finally {
      setRecherche(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Consentements"
        subtitle="Gérez l’accès de votre hôpital à l’historique partagé d’un patient."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Recherche */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Téléphone du patient
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && rechercher()}
                  placeholder="+237 699 11 22 33"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <button
                onClick={rechercher}
                disabled={!valide || recherche}
                className="flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
                {recherche ? 'Recherche…' : 'Rechercher'}
              </button>
            </div>
            {tel && (
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-slate-400">Clé normalisée :</span>
                <code className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                  {cle || '—'}
                </code>
                {valide ? (
                  <span className="flex items-center gap-1 font-medium text-emerald-600">
                    <Check className="h-3.5 w-3.5" /> Valide
                  </span>
                ) : (
                  <span className="text-amber-600">Numéro incomplet</span>
                )}
              </div>
            )}
          </div>

          {/* Résultat */}
          {recherche ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400 shadow-sm">
              Recherche en cours…
            </div>
          ) : resultat?.trouve && resultat.patient ? (
            <>
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                <Avatar
                  initials={`${resultat.patient.prenom[0] ?? ''}${resultat.patient.nom[0] ?? ''}`.toUpperCase()}
                  className="h-14 w-14 text-lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-800">
                      {resultat.patient.prenom} {resultat.patient.nom}
                    </h3>
                    <Badge tone="teal" dot>
                      Patient partagé
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {formatTelephone(resultat.patient.telephone)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/patients/${resultat.patient.id}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <FolderOpen className="h-4 w-4" /> Fiche
                  </Link>
                  {user?.role === 'MEDECIN' && (
                    <Link
                      href={`/patients/${resultat.patient.id}/carnet`}
                      className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
                    >
                      <ClipboardList className="h-4 w-4" /> Carnet
                    </Link>
                  )}
                </div>
              </div>

              <ConsentementCard patientId={resultat.patient.id} />
            </>
          ) : resultat && !resultat.trouve ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <UserSearch className="h-7 w-7" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-800">
                Aucun patient trouvé
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Aucun dossier ne correspond au numéro{' '}
                <strong>{resultat.cle}</strong>.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-10 text-center text-sm text-slate-400">
              Recherchez un patient par téléphone pour gérer son consentement de
              partage.
            </div>
          )}
        </div>

        {/* Panneau explicatif */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold text-slate-800">
            <ShieldCheck className="h-4 w-4 text-brand" /> Règle de partage
          </h3>
          <div className="mt-4 space-y-4">
            {PRINCIPES.map((p) => (
              <div key={p.titre} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                  <p.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{p.titre}</p>
                  <p className="text-xs text-slate-400">{p.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  ChevronRight,
  ClipboardList,
  Pill,
  Search,
  ShieldCheck,
  ShieldOff,
  Stethoscope,
  Users,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatTelephone } from '@/lib/telephone';
import type { DashboardData } from '@/lib/types';
import { FullScreenLoader } from '@/components/loader';

function initiales(prenom: string, nom: string) {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
}
function dateCourte(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR');
}
function heure(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [chargement, setChargement] = useState(true);

  const charger = useCallback(async () => {
    try {
      setData(await apiFetch<DashboardData>('/dashboard'));
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  if (chargement || !data) return <FullScreenLoader />;

  const salutation = user
    ? user.role === 'MEDECIN'
      ? `Dr ${user.nom}`
      : user.prenom
    : '';
  const s = data.stats;
  const stats = [
    { icon: Users, label: 'Patients', value: s.totalPatients, hint: 'Dossiers globaux', tint: 'bg-emerald-50 text-emerald-600' },
    { icon: ClipboardList, label: 'Consultations', value: s.consultations, hint: `${s.consultationsAujourdhui} aujourd’hui`, tint: 'bg-amber-50 text-amber-600' },
    { icon: Pill, label: 'Prescriptions', value: s.prescriptions, hint: 'Votre hôpital', tint: 'bg-teal-50 text-teal-600' },
    { icon: ShieldCheck, label: 'Consentements actifs', value: s.consentementsActifs, hint: 'Partages autorisés', tint: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-5 xl:col-span-2">
          {/* Carte de bienvenue */}
          <div className="flex items-center justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                <Stethoscope className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Bonjour {salutation}</h1>
                <p className="text-sm text-slate-400">Voici un aperçu de votre activité aujourd’hui.</p>
              </div>
            </div>
            <svg viewBox="0 0 200 40" className="hidden h-10 w-40 text-brand/40 sm:block" aria-hidden="true">
              <polyline points="0,20 28,20 40,8 50,34 62,20 92,20 104,4 116,36 128,20 200,20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>

          {/* Recherche patient -> hub patients */}
          <form
            onSubmit={(e) => { e.preventDefault(); router.push('/patients'); }}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Rechercher un patient par téléphone" className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20" />
            </div>
            <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
              <Search className="h-4 w-4" /> Rechercher
            </button>
          </form>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((st) => (
              <div key={st.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${st.tint}`}>
                  <st.icon className="h-[18px] w-[18px]" />
                </span>
                <p className="mt-3 text-2xl font-bold text-slate-800">{st.value}</p>
                <p className="text-xs text-slate-400">{st.label}</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">{st.hint}</p>
              </div>
            ))}
          </div>

          {/* Patients récents */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-800">Patients récents</h2>
              <Link href="/patients" className="text-sm font-medium text-brand hover:text-brand-dark">Voir tous</Link>
            </div>
            {data.patientsRecents.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">Aucun patient enregistré pour le moment.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {data.patientsRecents.map((p) => (
                  <Link key={p.id} href={`/patients/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-semibold text-brand">{initiales(p.prenom, p.nom)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-700">{p.prenom} {p.nom}</p>
                      <p className="text-xs text-slate-400">{formatTelephone(p.telephone)}</p>
                    </div>
                    <div className="hidden text-right md:block">
                      <p className="text-xs text-slate-500">{dateCourte(p.createdAt)}</p>
                      {p.origine && <p className="text-xs text-slate-400">{p.origine}</p>}
                    </div>
                    <span className="hidden items-center gap-1 text-xs font-medium text-emerald-600 sm:flex">
                      <BadgeCheck className="h-4 w-4" /> Identité vérifiée
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">
          {/* Consentements (stats) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-brand" /> Consentements
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 p-3">
                <ShieldCheck className="mx-auto h-5 w-5 text-emerald-600" />
                <p className="mt-1 text-lg font-bold text-slate-800">{s.consentementsActifs}</p>
                <p className="text-[11px] text-slate-400">Autorisés</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <ShieldOff className="mx-auto h-5 w-5 text-rose-600" />
                <p className="mt-1 text-lg font-bold text-slate-800">{s.consentementsRevoques}</p>
                <p className="text-[11px] text-slate-400">Révoqués</p>
              </div>
            </div>
          </div>

          {/* Accès inter-hôpitaux (consentements de cet hôpital) */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-800">Accès inter-hôpitaux</h2>
              <Link href="/consentements" className="text-sm font-medium text-brand hover:text-brand-dark">Gérer</Link>
            </div>
            {data.consentements.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">Aucun partage enregistré pour votre hôpital.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {data.consentements.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">{initiales(c.patient.prenom, c.patient.nom)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-700">{c.patient.prenom} {c.patient.nom}</p>
                      <p className="text-xs text-slate-400">{formatTelephone(c.patient.telephone)}</p>
                    </div>
                    <span className={`text-xs font-semibold ${c.statut === 'AUTORISE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {c.statut === 'AUTORISE' ? 'Autorisé' : 'Révoqué'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consultations récentes */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-800">Consultations récentes</h2>
            </div>
            {data.consultationsRecentes.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">Aucune consultation enregistrée.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {data.consultationsRecentes.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="w-10 shrink-0 text-xs font-medium text-slate-400">{heure(c.date)}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-[11px] font-semibold text-brand">{initiales(c.patient.prenom, c.patient.nom)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-700">{c.patient.prenom} {c.patient.nom}</p>
                      <p className="truncate text-xs text-slate-400">{c.motif}</p>
                    </div>
                    <span className="text-[11px] text-slate-400">{dateCourte(c.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

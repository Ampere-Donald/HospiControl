'use client';

import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Clock,
  ClipboardList,
  MoreVertical,
  Pill,
  Search,
  Share2,
  ShieldCheck,
  Stethoscope,
  Users,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

/*
 * NB : hormis le nom de l'utilisateur connecté (et sa structure dans la barre du
 * haut), les chiffres et listes ci-dessous sont des DONNÉES DE DÉMONSTRATION.
 * Ils seront branchés sur l'API réelle aux phases 3 (patients), 4 (consultations)
 * et 5 (consentements).
 */

const stats = [
  { icon: Users, label: 'Patients du jour', value: '24', hint: '↑ 12% vs hier', hintClass: 'text-emerald-600', tint: 'bg-emerald-50 text-emerald-600' },
  { icon: ClipboardList, label: 'Consultations', value: '8', hint: 'Aujourd’hui', hintClass: 'text-slate-400', tint: 'bg-amber-50 text-amber-600' },
  { icon: Pill, label: 'Prescriptions', value: '5', hint: 'En attente', hintClass: 'text-slate-400', tint: 'bg-teal-50 text-teal-600' },
  { icon: Share2, label: 'Référés', value: '3', hint: 'Ce mois', hintClass: 'text-slate-400', tint: 'bg-blue-50 text-blue-600' },
];

const patients = [
  { initiales: 'AK', nom: 'Assamba Kevin', tel: '699 11 22 33', date: '15/06/2026', medecin: 'Dr Paul Mbarga' },
  { initiales: 'ML', nom: 'Mekam Lydia', tel: '672 45 67 89', date: '14/06/2026', medecin: 'Dr Paul Mbarga' },
  { initiales: 'TN', nom: 'Tchoua Nathan', tel: '656 78 90 12', date: '14/06/2026', medecin: 'Dr Paul Mbarga' },
  { initiales: 'BD', nom: 'Bello Daniel', tel: '693 21 34 56', date: '13/06/2026', medecin: 'Dr Paul Mbarga' },
  { initiales: 'EN', nom: 'Ewodo Nadia', tel: '655 00 11 22', date: '12/06/2026', medecin: 'Dr Paul Mbarga' },
];

const acces = [
  { initiales: 'AK', nom: 'Assamba Kevin', tel: '699 11 22 33', hopital: 'Hôpital B', ville: 'Yaoundé', statut: 'Accès autorisé', detail: 'Actif', tone: 'emerald' },
  { initiales: 'ML', nom: 'Mekam Lydia', tel: '672 45 67 89', hopital: 'Hôpital C', ville: 'Douala', statut: 'En attente', detail: 'Demande envoyée', tone: 'amber' },
  { initiales: 'TN', nom: 'Tchoua Nathan', tel: '656 78 90 12', hopital: 'Hôpital D', ville: 'Bafoussam', statut: 'Refusé', detail: 'Par le patient', tone: 'rose' },
];

const consultations = [
  { heure: '08:00', initiales: 'AK', nom: 'Assamba Kevin', motif: 'Douleur thoracique', statut: 'Terminée', tone: 'emerald', icon: CheckCircle2 },
  { heure: '09:30', initiales: 'ML', nom: 'Mekam Lydia', motif: 'Suivi de grossesse', statut: 'Terminée', tone: 'emerald', icon: CheckCircle2 },
  { heure: '11:00', initiales: 'TN', nom: 'Tchoua Nathan', motif: 'Fièvre - Céphalées', statut: 'En cours', tone: 'blue', icon: Clock },
  { heure: '14:00', initiales: 'BD', nom: 'Bello Daniel', motif: 'Hypertension', statut: 'À venir', tone: 'slate', icon: Clock },
  { heure: '15:30', initiales: 'EN', nom: 'Ewodo Nadia', motif: 'Contrôle général', statut: 'À venir', tone: 'slate', icon: Clock },
];

const toneClasses: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  blue: 'bg-blue-50 text-blue-600',
  slate: 'bg-slate-100 text-slate-500',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const salutation =
    user?.role === 'MEDECIN' ? `Dr ${user.nom}` : (user?.prenom ?? '');

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
                <h1 className="text-xl font-bold text-slate-800">
                  Bonjour {salutation}
                </h1>
                <p className="text-sm text-slate-400">
                  Voici un aperçu de votre activité aujourd’hui.
                </p>
              </div>
            </div>
            <svg viewBox="0 0 200 40" className="hidden h-10 w-40 text-brand/40 sm:block" aria-hidden="true">
              <polyline
                points="0,20 28,20 40,8 50,34 62,20 92,20 104,4 116,36 128,20 200,20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Recherche patient */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un patient"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Par téléphone
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
            <button
              type="submit"
              className="flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.tint}`}>
                  <s.icon className="h-[18px] w-[18px]" />
                </span>
                <p className="mt-3 text-2xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
                <p className={`mt-0.5 text-[11px] font-medium ${s.hintClass}`}>{s.hint}</p>
              </div>
            ))}
          </div>

          {/* Patients récents */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-800">Patients récents</h2>
              <button className="text-sm font-medium text-brand hover:text-brand-dark">Voir tous</button>
            </div>
            <div className="divide-y divide-slate-50">
              {patients.map((p) => (
                <div key={p.nom} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-semibold text-brand">
                    {p.initiales}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">{p.nom}</p>
                    <p className="text-xs text-slate-400">{p.tel}</p>
                  </div>
                  <div className="hidden text-right md:block">
                    <p className="text-xs text-slate-500">{p.date}</p>
                    <p className="text-xs text-slate-400">{p.medecin}</p>
                  </div>
                  <span className="hidden items-center gap-1 text-xs font-medium text-emerald-600 sm:flex">
                    <BadgeCheck className="h-4 w-4" />
                    Identité vérifiée
                  </span>
                  <button className="text-slate-300 hover:text-slate-500" aria-label="Actions">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">
          {/* Consentements */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                <ShieldCheck className="h-4 w-4 text-brand" />
                Consentements
              </h2>
              <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500">
                Tous les hôpitaux
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <ConsentStat icon={CheckCircle2} value="12" label="Actifs" tone="emerald" />
              <ConsentStat icon={Clock} value="3" label="En attente" tone="amber" />
              <ConsentStat icon={XCircle} value="1" label="Refusé" tone="rose" />
            </div>
          </div>

          {/* Accès inter-hôpitaux */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-800">Accès inter-hôpitaux</h2>
              <button className="text-sm font-medium text-brand hover:text-brand-dark">Voir tout</button>
            </div>
            <div className="divide-y divide-slate-50">
              {acces.map((a) => (
                <div key={a.nom} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                    {a.initiales}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">{a.nom}</p>
                    <p className="text-xs text-slate-400">{a.hopital} · {a.ville}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${a.tone === 'emerald' ? 'text-emerald-600' : a.tone === 'amber' ? 'text-amber-600' : 'text-rose-600'}`}>
                      {a.statut}
                    </p>
                    <p className="text-[11px] text-slate-400">{a.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consultations du jour */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-800">Consultations du jour</h2>
              <button className="text-sm font-medium text-brand hover:text-brand-dark">Voir tout</button>
            </div>
            <div className="divide-y divide-slate-50">
              {consultations.map((c) => (
                <div key={c.heure} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-10 shrink-0 text-xs font-medium text-slate-400">{c.heure}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-[11px] font-semibold text-brand">
                    {c.initiales}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">{c.nom}</p>
                    <p className="truncate text-xs text-slate-400">{c.motif}</p>
                  </div>
                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${toneClasses[c.tone]}`}>
                    <c.icon className="h-3 w-3" />
                    {c.statut}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsentStat({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof CheckCircle2;
  value: string;
  label: string;
  tone: 'emerald' | 'amber' | 'rose';
}) {
  const color =
    tone === 'emerald' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-600' : 'text-rose-600';
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <Icon className={`mx-auto h-5 w-5 ${color}`} />
      <p className="mt-1 text-lg font-bold text-slate-800">{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  );
}

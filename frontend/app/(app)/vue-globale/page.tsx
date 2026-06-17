'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  History,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import type { JournalAcces } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { FullScreenLoader } from '@/components/loader';
import { JournalList } from '@/components/journal-list';

interface StatsPlateforme {
  hopitaux: number;
  hopitauxActifs: number;
  hopitauxInactifs: number;
  patients: number;
  consultations: number;
  consentementsActifs: number;
}

export default function VueGlobalePage() {
  const [stats, setStats] = useState<StatsPlateforme | null>(null);
  const [journal, setJournal] = useState<JournalAcces[]>([]);

  useEffect(() => {
    apiFetch<StatsPlateforme>('/stats/plateforme').then(setStats).catch(() => {});
    apiFetch<JournalAcces[]>('/journal').then(setJournal).catch(() => {});
  }, []);

  if (!stats) return <FullScreenLoader />;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title="Vue globale"
        subtitle="Supervision de toute la plateforme HospiControl."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={Building2} value={stats.hopitaux} label="Hôpitaux" hint={`${stats.hopitauxActifs} actifs`} />
        <StatCard icon={Users} value={stats.patients} label="Patients" hint="Dossiers globaux" tint="bg-emerald-50 text-emerald-600" />
        <StatCard icon={ClipboardList} value={stats.consultations} label="Consultations" hint="Toutes structures" tint="bg-amber-50 text-amber-600" />
        <StatCard icon={ShieldCheck} value={stats.consentementsActifs} label="Consentements actifs" hint="Partages autorisés" tint="bg-blue-50 text-blue-600" />
        <StatCard icon={CheckCircle2} value={stats.hopitauxActifs} label="Hôpitaux actifs" tint="bg-emerald-50 text-emerald-600" />
        <StatCard icon={XCircle} value={stats.hopitauxInactifs} label="Hôpitaux inactifs" tint="bg-slate-100 text-slate-500" />
      </div>

      {/* Journal d'accès (traçabilité — modèle Estonie) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <History className="h-4 w-4 text-brand" />
          <h2 className="font-semibold text-slate-800">Journal d’accès</h2>
          <span className="text-xs text-slate-400">— qui a consulté quoi, quand</span>
        </div>
        <JournalList entries={journal} vide="Aucun accès enregistré sur la plateforme pour le moment." />
      </div>
    </div>
  );
}

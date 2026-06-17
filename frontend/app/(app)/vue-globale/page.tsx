'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  Globe,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { FullScreenLoader } from '@/components/loader';

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

  useEffect(() => {
    apiFetch<StatsPlateforme>('/stats/plateforme')
      .then(setStats)
      .catch(() => {});
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

      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-400">
        <Globe className="mx-auto h-6 w-6 text-slate-300" />
        <p className="mt-2">
          Le <strong>journal d&apos;accès</strong> (qui a consulté quel dossier, quand) s&apos;affichera ici.
        </p>
      </div>
    </div>
  );
}

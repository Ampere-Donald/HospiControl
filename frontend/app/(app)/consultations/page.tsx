'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Pill } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { FullScreenLoader } from '@/components/loader';

interface MaConsultation {
  id: string;
  patientId: string;
  date: string;
  motif: string;
  diagnostic?: string | null;
  prescriptions: { id: string }[];
  patient?: { id: string; nom: string; prenom: string; telephone: string };
}

export default function MesConsultationsPage() {
  const [consultations, setConsultations] = useState<MaConsultation[] | null>(null);

  const charger = useCallback(async () => {
    setConsultations(await apiFetch<MaConsultation[]>('/consultations/mes'));
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  if (!consultations) return <FullScreenLoader />;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="Mes consultations"
        subtitle="Les consultations que vous avez créées."
      />

      {consultations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-10 text-center text-sm text-slate-400">
          Aucune consultation pour le moment. Ouvrez le carnet d’un patient pour en créer une.
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map((c) => (
            <Link
              key={c.id}
              href={`/patients/${c.patientId}/carnet`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-brand"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {new Date(c.date).toLocaleDateString('fr-FR')}
                </span>
                {c.patient && (
                  <span className="text-xs text-slate-400">
                    {c.patient.prenom} {c.patient.nom}
                  </span>
                )}
              </div>
              <p className="mt-1 font-semibold text-slate-800">{c.motif}</p>
              {c.diagnostic && <p className="text-sm text-slate-500">{c.diagnostic}</p>}
              {c.prescriptions.length > 0 && (
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <Pill className="h-3.5 w-3.5" /> {c.prescriptions.length} prescription(s)
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

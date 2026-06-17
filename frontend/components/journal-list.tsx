import {
  AlertTriangle,
  Clock,
  Eye,
  ShieldCheck,
  ShieldOff,
  type LucideIcon,
} from 'lucide-react';
import type { JournalAcces, TypeAcces } from '@/lib/types';

const TYPE: Record<TypeAcces, { label: string; icon: LucideIcon; cls: string }> = {
  LECTURE_CARNET: { label: 'Lecture du carnet', icon: Eye, cls: 'bg-blue-50 text-blue-600' },
  DEMANDE_ACCES: { label: 'Demande d’accès', icon: Clock, cls: 'bg-amber-50 text-amber-600' },
  CONSENTEMENT_AUTORISE: { label: 'Consentement autorisé', icon: ShieldCheck, cls: 'bg-emerald-50 text-emerald-600' },
  CONSENTEMENT_REVOQUE: { label: 'Consentement révoqué', icon: ShieldOff, cls: 'bg-rose-50 text-rose-600' },
  ACCES_URGENCE: { label: 'Accès d’urgence (bris de glace)', icon: AlertTriangle, cls: 'bg-rose-50 text-rose-600' },
};

function quand(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Liste réutilisable du journal d'accès (Vue globale super admin + espace patient). */
export function JournalList({
  entries,
  showPatient = true,
  vide = 'Aucun accès enregistré pour le moment.',
}: {
  entries: JournalAcces[];
  showPatient?: boolean;
  vide?: string;
}) {
  if (entries.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-slate-400">{vide}</p>;
  }
  return (
    <div className="divide-y divide-slate-50">
      {entries.map((e) => {
        const t = TYPE[e.type];
        const acteur = e.acteurEstPatient
          ? 'Le patient'
          : e.acteurUtilisateur
            ? `${e.acteurUtilisateur.role === 'MEDECIN' ? 'Dr ' : ''}${e.acteurUtilisateur.prenom} ${e.acteurUtilisateur.nom}`
            : 'Système';
        return (
          <div key={e.id} className="flex items-start gap-3 px-5 py-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.cls}`}>
              <t.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-700">{t.label}</p>
              <p className="truncate text-xs text-slate-400">
                {acteur}
                {e.hopital ? ` · ${e.hopital.nom}` : ''}
                {showPatient && e.patient ? ` · ${e.patient.prenom} ${e.patient.nom}` : ''}
                {e.motif ? ` · « ${e.motif} »` : ''}
              </p>
            </div>
            <span className="shrink-0 text-[11px] text-slate-400">{quand(e.createdAt)}</span>
          </div>
        );
      })}
    </div>
  );
}

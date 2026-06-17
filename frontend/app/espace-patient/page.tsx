'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Calendar,
  Check,
  Droplet,
  History,
  Loader2,
  LogOut,
  Phone,
  ShieldCheck,
  ShieldOff,
  User,
  X,
} from 'lucide-react';
import { clearPatientToken, getPatientToken, patientFetch } from '@/lib/patient';
import { formatTelephone } from '@/lib/telephone';
import type { JournalAcces, Patient, StatutConsentement } from '@/lib/types';
import { Logo } from '@/components/logo';
import { FullScreenLoader } from '@/components/loader';
import { JournalList } from '@/components/journal-list';
import { Badge, type Tone } from '@/components/ui/badge';

interface ConsentementPatient {
  id: string;
  statut: StatutConsentement;
  dateModification: string;
  hopital: { id: string; nom: string; ville: string };
}

const STATUT: Record<StatutConsentement, { label: string; tone: Tone; phrase: string }> = {
  EN_ATTENTE: { label: 'Demande en attente', tone: 'amber', phrase: 'souhaite accéder à votre carnet.' },
  AUTORISE: { label: 'Accès autorisé', tone: 'emerald', phrase: 'peut consulter votre carnet.' },
  REFUSE: { label: 'Refusé', tone: 'rose', phrase: 'n’a pas accès (vous avez refusé).' },
  REVOQUE: { label: 'Accès retiré', tone: 'rose', phrase: 'n’a plus accès (vous avez révoqué).' },
};

export default function EspacePatientPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consentements, setConsentements] = useState<ConsentementPatient[]>([]);
  const [journal, setJournal] = useState<JournalAcces[]>([]);
  const [chargement, setChargement] = useState(true);
  const [invalide, setInvalide] = useState(false);
  const [envoi, setEnvoi] = useState('');

  const charger = useCallback(async () => {
    try {
      const [p, c, j] = await Promise.all([
        patientFetch<Patient>('/espace-patient/moi'),
        patientFetch<ConsentementPatient[]>('/espace-patient/consentements'),
        patientFetch<JournalAcces[]>('/espace-patient/journal'),
      ]);
      setPatient(p);
      setConsentements(c);
      setJournal(j);
    } catch {
      setInvalide(true);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    if (!getPatientToken()) {
      setInvalide(true);
      setChargement(false);
      return;
    }
    void charger();
  }, [charger]);

  async function decider(
    hopitalId: string,
    decision: 'AUTORISE' | 'REFUSE' | 'REVOQUE',
  ) {
    setEnvoi(hopitalId + decision);
    try {
      await patientFetch(`/espace-patient/consentements/${hopitalId}`, {
        method: 'PATCH',
        body: JSON.stringify({ decision }),
      });
      await charger();
    } finally {
      setEnvoi('');
    }
  }

  function deconnexion() {
    clearPatientToken();
    router.replace('/login');
  }

  if (chargement) return <FullScreenLoader />;

  if (invalide || !patient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grid px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <Logo className="justify-center" />
          <h1 className="mt-5 text-lg font-semibold text-slate-800">Lien invalide ou expiré</h1>
          <p className="mt-2 text-sm text-slate-500">
            Ce lien d&apos;accès à votre espace n&apos;est plus valable. Demandez à
            l&apos;accueil de votre hôpital de vous en renvoyer un.
          </p>
          <Link href="/login" className="mt-5 inline-block text-sm font-medium text-brand hover:text-brand-dark">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid">
      {/* Barre du haut */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo markClass="h-8 w-8" textClass="text-xl" />
            <span className="hidden text-sm text-slate-400 sm:inline">· Mon espace santé</span>
          </div>
          <button
            onClick={deconnexion}
            className="flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            <LogOut className="h-4 w-4" /> Quitter
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bonjour {patient.prenom} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">
            Vous contrôlez <strong>qui accède à votre carnet médical</strong>.
          </p>
        </div>

        {/* Identité */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-slate-800">
            <User className="h-4 w-4 text-brand" /> Mes informations
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Info icon={User} label="Nom" valeur={`${patient.prenom} ${patient.nom}`} />
            <Info icon={Phone} label="Téléphone" valeur={formatTelephone(patient.telephone)} />
            <Info icon={Calendar} label="Date de naissance" valeur={patient.dateNaissance ? new Date(patient.dateNaissance).toLocaleDateString('fr-FR') : '—'} />
            <Info icon={Droplet} label="Groupe sanguin" valeur={patient.groupeSanguin ?? '—'} />
          </dl>
        </div>

        {/* Consentements */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <ShieldCheck className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-slate-800">Qui peut accéder à mon carnet</h2>
          </div>
          {consentements.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">
              Aucun hôpital n&apos;a encore demandé l&apos;accès à votre carnet.
            </p>
          ) : (
            <div className="divide-y divide-slate-50">
              {consentements.map((c) => {
                const s = STATUT[c.statut];
                const enCours = (d: string) => envoi === c.hopital.id + d;
                return (
                  <div key={c.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-700">{c.hopital.nom}</p>
                        <Badge tone={s.tone} dot>{s.label}</Badge>
                      </div>
                      <p className="text-sm text-slate-400">
                        {c.hopital.ville} — {s.phrase}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {c.statut === 'AUTORISE' ? (
                        <button
                          onClick={() => decider(c.hopital.id, 'REVOQUE')}
                          disabled={!!envoi}
                          className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-60"
                        >
                          {enCours('REVOQUE') ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
                          Révoquer
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => decider(c.hopital.id, 'AUTORISE')}
                            disabled={!!envoi}
                            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                          >
                            {enCours('AUTORISE') ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Autoriser
                          </button>
                          {c.statut === 'EN_ATTENTE' && (
                            <button
                              onClick={() => decider(c.hopital.id, 'REFUSE')}
                              disabled={!!envoi}
                              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                            >
                              {enCours('REFUSE') ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                              Refuser
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Journal d'accès */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <History className="h-4 w-4 text-brand" />
            <h2 className="font-semibold text-slate-800">Qui a consulté mon carnet</h2>
          </div>
          <JournalList entries={journal} showPatient={false} vide="Personne n’a encore consulté votre carnet." />
        </div>

        <p className="pb-6 text-center text-xs text-slate-400">
          HospiControl — vos données de santé, sous votre contrôle.
        </p>
      </main>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  valeur,
}: {
  icon: typeof User;
  label: string;
  valeur: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700">{valeur}</p>
      </div>
    </div>
  );
}

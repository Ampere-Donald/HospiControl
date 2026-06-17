'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calendar,
  ClipboardList,
  Droplet,
  KeyRound,
  MapPin,
  Pencil,
  User,
  XCircle,
} from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { calculerAge, formatTelephone } from '@/lib/telephone';
import type { Patient } from '@/lib/types';
import { FullScreenLoader } from '@/components/loader';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SlideOver } from '@/components/ui/slide-over';
import { Field, SelectField } from '@/components/ui/field';
import { ConsentementCard } from '@/components/consentement-card';

const SEXE_OPTIONS = [
  { value: '', label: '— Non précisé —' },
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
];
const GROUPE_OPTIONS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
  (g) => ({ value: g, label: g || '— Non précisé —' }),
);

export default function FichePatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [chargement, setChargement] = useState(true);
  const [introuvable, setIntrouvable] = useState(false);

  const [ouvert, setOuvert] = useState(false);
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    dateNaissance: '',
    sexe: '',
    groupeSanguin: '',
    adresse: '',
    cni: '',
  });
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  // Modification de l'identité réservée à l'accueil (cohérent avec le back).
  const peutModifier = user?.role === 'ACCUEIL';
  const estMedecin = user?.role === 'MEDECIN';

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      setPatient(await apiFetch<Patient>(`/patients/${id}`));
    } catch {
      setIntrouvable(true);
    } finally {
      setChargement(false);
    }
  }, [id]);

  useEffect(() => {
    void charger();
  }, [charger]);

  if (chargement) return <FullScreenLoader />;
  if (introuvable || !patient) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        Patient introuvable.{' '}
        <Link href="/patients" className="font-medium text-brand">
          Retour aux patients
        </Link>
      </div>
    );
  }

  function ouvrirEdition() {
    if (!patient) return;
    setForm({
      prenom: patient.prenom,
      nom: patient.nom,
      dateNaissance: patient.dateNaissance ? patient.dateNaissance.slice(0, 10) : '',
      sexe: patient.sexe ?? '',
      groupeSanguin: patient.groupeSanguin ?? '',
      adresse: patient.adresse ?? '',
      cni: patient.cni ?? '',
    });
    setErreur('');
    setOuvert(true);
  }

  async function enregistrer() {
    setErreur('');
    setEnvoi(true);
    try {
      await apiFetch(`/patients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          prenom: form.prenom,
          nom: form.nom,
          dateNaissance: form.dateNaissance || undefined,
          sexe: form.sexe || undefined,
          groupeSanguin: form.groupeSanguin || undefined,
          adresse: form.adresse || undefined,
          cni: form.cni || undefined,
        }),
      });
      setOuvert(false);
      await charger();
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Enregistrement impossible.');
    } finally {
      setEnvoi(false);
    }
  }

  const age = calculerAge(patient.dateNaissance);
  const champ = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link
        href="/patients"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux patients
      </Link>

      {/* En-tête patient */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <Avatar initials={`${patient.prenom[0] ?? ''}${patient.nom[0] ?? ''}`.toUpperCase()} className="h-16 w-16 text-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">{patient.prenom} {patient.nom}</h1>
            <Badge tone="teal" dot>Patient partagé</Badge>
          </div>
          <p className="text-sm text-slate-500">{formatTelephone(patient.telephone)}</p>
        </div>
        <div className="flex gap-2">
          {peutModifier && (
            <button
              onClick={ouvrirEdition}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" /> Modifier
            </button>
          )}
          {estMedecin && (
            <Link
              href={`/patients/${id}/carnet`}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              <ClipboardList className="h-4 w-4" /> Ouvrir le carnet
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Identité */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-slate-800">
            <User className="h-4 w-4 text-brand" /> Identité
          </h2>
          <dl className="mt-4 space-y-3">
            <Info icon={Calendar} label="Date de naissance" valeur={patient.dateNaissance ? `${new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}${age !== null ? ` (${age} ans)` : ''}` : '—'} />
            <Info icon={User} label="Sexe" valeur={patient.sexe ? (patient.sexe === 'M' ? 'Masculin' : 'Féminin') : '—'} />
            <Info icon={Droplet} label="Groupe sanguin" valeur={patient.groupeSanguin ?? '—'} />
            <Info icon={MapPin} label="Adresse" valeur={patient.adresse ?? '—'} />
            <Info icon={BadgeCheck} label="CNI" valeur={patient.cni ?? '—'} />
          </dl>
        </div>

        {/* Identité globale */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-slate-800">
            <KeyRound className="h-4 w-4 text-brand" /> Identité globale
          </h2>
          <dl className="mt-4 space-y-3">
            <Info icon={KeyRound} label="Clé carnet (téléphone)" valeur={patient.telephone} />
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">Identité vérifiée</span>
            </div>
            <Info icon={ClipboardList} label="Origine du dossier" valeur={patient.hopitalCreateur?.nom ?? '—'} />
            <Info icon={Calendar} label="Créé le" valeur={new Date(patient.createdAt).toLocaleDateString('fr-FR')} />
          </dl>
        </div>
      </div>

      {/* Consentement de partage inter-hôpitaux (cœur Phase 5) */}
      <ConsentementCard patientId={id} />

      {/* Carnet médical */}
      {estMedecin ? (
        <Link
          href={`/patients/${id}/carnet`}
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-brand"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
            <ClipboardList className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800">Carnet médical</h3>
            <p className="text-sm text-slate-400">Antécédents, consultations et prescriptions.</p>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-300" />
        </Link>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center">
          <h3 className="font-semibold text-slate-700">Carnet médical</h3>
          <p className="mt-1 text-sm text-slate-400">Consultable par les médecins.</p>
        </div>
      )}

      {/* Slide-over édition */}
      <SlideOver
        open={ouvert}
        onClose={() => setOuvert(false)}
        title="Modifier les informations"
        subtitle="Le téléphone (identifiant global) n’est pas modifiable"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setOuvert(false)}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              onClick={enregistrer}
              disabled={envoi}
              className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {envoi ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom" required value={form.prenom} onChange={(v) => champ('prenom', v)} />
            <Field label="Nom" required value={form.nom} onChange={(v) => champ('nom', v)} />
          </div>
          <Field label="Date de naissance" type="date" value={form.dateNaissance} onChange={(v) => champ('dateNaissance', v)} />
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Sexe" value={form.sexe} onChange={(v) => champ('sexe', v)} options={SEXE_OPTIONS} />
            <SelectField label="Groupe sanguin" value={form.groupeSanguin} onChange={(v) => champ('groupeSanguin', v)} options={GROUPE_OPTIONS} />
          </div>
          <Field label="Adresse" value={form.adresse} onChange={(v) => champ('adresse', v)} />
          <Field label="CNI (optionnel)" value={form.cni} onChange={(v) => champ('cni', v)} />

          {erreur && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              <XCircle className="h-4 w-4 shrink-0" />
              {erreur}
            </div>
          )}
        </div>
      </SlideOver>
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

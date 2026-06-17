'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Database,
  FolderOpen,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  UserSearch,
  XCircle,
} from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  calculerAge,
  formatTelephone,
  normaliserTelephone,
  telephoneValide,
} from '@/lib/telephone';
import type { Patient, RecherchePatient } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { SlideOver } from '@/components/ui/slide-over';
import { Field, SelectField } from '@/components/ui/field';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const FORM_VIDE = {
  telephone: '',
  nom: '',
  prenom: '',
  dateNaissance: '',
  sexe: '',
  groupeSanguin: '',
  adresse: '',
  cni: '',
};

const SEXE_OPTIONS = [
  { value: '', label: '— Non précisé —' },
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
];

const GROUPE_OPTIONS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
  (g) => ({ value: g, label: g || '— Non précisé —' }),
);

const REGISTRE = [
  { icon: ShieldCheck, titre: 'Aucun cloisonnement', detail: "Le patient est partagé entre tous les établissements affiliés." },
  { icon: Database, titre: 'Données unifiées', detail: 'Un seul dossier par patient, identifié par son téléphone.' },
  { icon: Lock, titre: 'Accès contrôlé', detail: "L'historique d'un autre hôpital reste soumis au consentement." },
  { icon: RefreshCw, titre: 'Synchronisation continue', detail: 'Toute mise à jour est immédiatement visible partout.' },
];

export default function PatientsPage() {
  const router = useRouter();
  const { user } = useAuth();
  // L'enregistrement d'un patient est un acte d'accueil : seul ce rôle le voit.
  const estAccueil = user?.role === 'ACCUEIL';

  const [tel, setTel] = useState('');
  const [resultat, setResultat] = useState<RecherchePatient | null>(null);
  const [recherche, setRecherche] = useState(false);

  const [ouvert, setOuvert] = useState(false);
  const [form, setForm] = useState(FORM_VIDE);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  // Contrôle anti-doublon en direct sur le champ téléphone du formulaire.
  const [doublon, setDoublon] = useState<{
    etat: 'idle' | 'checking' | 'existe' | 'libre';
    patient?: Patient;
  }>({ etat: 'idle' });

  const champ = (k: keyof typeof FORM_VIDE, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const cle = normaliserTelephone(tel);
  const valide = telephoneValide(cle);

  const rechercher = useCallback(
    async (valeur?: string) => {
      const t = valeur ?? tel;
      const c = normaliserTelephone(t);
      if (!telephoneValide(c)) return;
      setRecherche(true);
      setResultat(null);
      try {
        const r = await apiFetch<RecherchePatient>(
          `/patients/recherche?telephone=${encodeURIComponent(c)}`,
        );
        setResultat(r);
        if (typeof window !== 'undefined')
          sessionStorage.setItem('patients_tel', t);
      } catch {
        setResultat(null);
      } finally {
        setRecherche(false);
      }
    },
    [tel],
  );

  // Restaure la dernière recherche quand on revient sur la page.
  useEffect(() => {
    const stored =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('patients_tel')
        : null;
    if (stored) {
      setTel(stored);
      void rechercher(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Vérifie en direct si le numéro saisi correspond déjà à un dossier : on garde
  // ainsi la garantie « un patient = un téléphone » tout en rendant la création visible.
  useEffect(() => {
    if (!ouvert) {
      setDoublon({ etat: 'idle' });
      return;
    }
    const c = normaliserTelephone(form.telephone);
    if (!telephoneValide(c)) {
      setDoublon({ etat: 'idle' });
      return;
    }
    setDoublon({ etat: 'checking' });
    const timer = setTimeout(async () => {
      try {
        const r = await apiFetch<RecherchePatient>(
          `/patients/recherche?telephone=${encodeURIComponent(c)}`,
        );
        setDoublon(
          r.trouve && r.patient
            ? { etat: 'existe', patient: r.patient }
            : { etat: 'libre' },
        );
      } catch {
        setDoublon({ etat: 'idle' });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [form.telephone, ouvert]);

  function ouvrirCreation() {
    setForm({ ...FORM_VIDE, telephone: tel || cle });
    setErreur('');
    setOuvert(true);
  }

  async function creer() {
    setErreur('');
    if (doublon.etat === 'existe') {
      setErreur('Ce numéro correspond déjà à un patient existant.');
      return;
    }
    if (!form.telephone || !form.nom || !form.prenom) {
      setErreur('Téléphone, nom et prénom sont requis.');
      return;
    }
    setEnvoi(true);
    try {
      const cree = await apiFetch<Patient>('/patients', {
        method: 'POST',
        body: JSON.stringify({
          telephone: form.telephone,
          nom: form.nom,
          prenom: form.prenom,
          dateNaissance: form.dateNaissance || undefined,
          sexe: form.sexe || undefined,
          groupeSanguin: form.groupeSanguin || undefined,
          adresse: form.adresse || undefined,
          cni: form.cni || undefined,
        }),
      });
      router.push(`/patients/${cree.id}`);
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Création impossible.');
      setEnvoi(false);
    }
  }

  const cleSaisie = normaliserTelephone(form.telephone);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Patients"
        subtitle="Recherchez un patient par téléphone — dossier global, partagé entre les hôpitaux."
        action={
          estAccueil ? (
            <button
              onClick={ouvrirCreation}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
            >
              <UserPlus className="h-4 w-4" />
              Nouveau patient
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Colonne principale */}
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
                onClick={() => rechercher()}
                disabled={!valide || recherche}
                className="flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
                {recherche ? 'Recherche…' : 'Rechercher'}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              💡 Le format est libre :{' '}
              <code className="rounded bg-slate-100 px-1 font-medium text-slate-600">+237 699 11 22 33</code>{' '}
              ={' '}
              <code className="rounded bg-slate-100 px-1 font-medium text-slate-600">699112233</code>.
            </p>
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
            <PatientTrouve patient={resultat.patient} onOuvrir={() => router.push(`/patients/${resultat.patient!.id}`)} />
          ) : resultat && !resultat.trouve ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <UserSearch className="h-7 w-7" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-800">Aucun patient trouvé</h3>
              {estAccueil ? (
                <>
                  <p className="mt-1 text-sm text-slate-400">
                    Aucun dossier ne correspond au numéro <strong>{resultat.cle}</strong>. Vous pouvez le créer.
                  </p>
                  <button
                    onClick={ouvrirCreation}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
                  >
                    <UserPlus className="h-4 w-4" />
                    Créer un patient
                  </button>
                </>
              ) : (
                <p className="mt-1 text-sm text-slate-400">
                  Aucun dossier ne correspond au numéro <strong>{resultat.cle}</strong>. Demandez à l’accueil d’enregistrer ce patient.
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-10 text-center text-sm text-slate-400">
              Saisissez un numéro de téléphone puis lancez la recherche.
            </div>
          )}
        </div>

        {/* Panneau « Registre partage global » */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold text-slate-800">
            <Database className="h-4 w-4 text-brand" />
            Registre partage global
          </h3>
          <div className="mt-4 space-y-4">
            {REGISTRE.map((r) => (
              <div key={r.titre} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                  <r.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{r.titre}</p>
                  <p className="text-xs text-slate-400">{r.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide-over création */}
      <SlideOver
        open={ouvert}
        onClose={() => setOuvert(false)}
        title="Créer un patient"
        subtitle="Nouveau dossier global, identifié par le téléphone"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setOuvert(false)}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              onClick={creer}
              disabled={envoi}
              className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {envoi ? 'Enregistrement…' : 'Enregistrer le patient'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Field label="Téléphone" required value={form.telephone} onChange={(v) => champ('telephone', v)} placeholder="+237 699 11 22 33" />
            {form.telephone && (
              <p className="mt-1.5 text-xs text-slate-400">
                Clé normalisée : <code className="font-semibold text-slate-600">{cleSaisie || '—'}</code>
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom" required value={form.prenom} onChange={(v) => champ('prenom', v)} placeholder="Jean Pierre" />
            <Field label="Nom" required value={form.nom} onChange={(v) => champ('nom', v)} placeholder="Nguoa" />
          </div>
          <Field label="Date de naissance" type="date" value={form.dateNaissance} onChange={(v) => champ('dateNaissance', v)} />
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Sexe" value={form.sexe} onChange={(v) => champ('sexe', v)} options={SEXE_OPTIONS} />
            <SelectField label="Groupe sanguin" value={form.groupeSanguin} onChange={(v) => champ('groupeSanguin', v)} options={GROUPE_OPTIONS} />
          </div>
          <Field label="Adresse" value={form.adresse} onChange={(v) => champ('adresse', v)} placeholder="Quartier, ville" />
          <Field label="CNI (optionnel)" value={form.cni} onChange={(v) => champ('cni', v)} placeholder="N° de carte d'identité" />

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

function PatientTrouve({
  patient,
  onOuvrir,
}: {
  patient: Patient;
  onOuvrir: () => void;
}) {
  const age = calculerAge(patient.dateNaissance);
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3 text-sm font-medium text-emerald-600">
        <Check className="h-4 w-4" /> Patient trouvé
      </div>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <Avatar initials={`${patient.prenom[0] ?? ''}${patient.nom[0] ?? ''}`.toUpperCase()} className="h-14 w-14 text-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-800">{patient.prenom} {patient.nom}</h3>
            <Badge tone="teal" dot>Patient partagé</Badge>
          </div>
          <p className="text-sm text-slate-500">{formatTelephone(patient.telephone)}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
            {age !== null && <span>{age} ans</span>}
            {patient.sexe && <span>{patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>}
            {patient.groupeSanguin && <span>Groupe {patient.groupeSanguin}</span>}
            {patient.hopitalCreateur && <span>Origine : {patient.hopitalCreateur.nom}</span>}
          </div>
        </div>
        <button
          onClick={onOuvrir}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          <FolderOpen className="h-4 w-4" />
          Ouvrir le dossier
        </button>
      </div>
    </div>
  );
}

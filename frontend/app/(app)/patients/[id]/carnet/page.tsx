'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ClipboardList,
  HeartPulse,
  Lock,
  Pill,
  Plus,
  ShieldCheck,
  Stethoscope,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatTelephone } from '@/lib/telephone';
import type { Carnet, Patient, TypeAntecedent } from '@/lib/types';
import { FullScreenLoader } from '@/components/loader';
import { Avatar } from '@/components/ui/avatar';
import { Badge, type Tone } from '@/components/ui/badge';
import { SlideOver } from '@/components/ui/slide-over';
import { Field, SelectField } from '@/components/ui/field';

const TYPE_ANT: Record<TypeAntecedent, { label: string; tone: Tone }> = {
  MEDICAL: { label: 'Médical', tone: 'blue' },
  CHIRURGICAL: { label: 'Chirurgical', tone: 'amber' },
  FAMILIAL: { label: 'Familial', tone: 'slate' },
  ALLERGIE: { label: 'Allergie', tone: 'rose' },
};

const TYPE_OPTIONS = [
  { value: 'MEDICAL', label: 'Médical' },
  { value: 'CHIRURGICAL', label: 'Chirurgical' },
  { value: 'FAMILIAL', label: 'Familial' },
  { value: 'ALLERGIE', label: 'Allergie' },
];

function dateLongue(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function CarnetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [carnet, setCarnet] = useState<Carnet | null>(null);
  const [chargement, setChargement] = useState(true);

  const [consOuvert, setConsOuvert] = useState(false);
  const [consForm, setConsForm] = useState({ motif: '', diagnostic: '', notes: '' });
  const [prescriptions, setPrescriptions] = useState<
    { medicament: string; posologie: string; duree: string }[]
  >([]);

  const [antOuvert, setAntOuvert] = useState(false);
  const [antForm, setAntForm] = useState({ type: 'MEDICAL', description: '', date: '' });

  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const [urgence, setUrgence] = useState(false);
  const [urgenceOuvert, setUrgenceOuvert] = useState(false);
  const [urgenceMotif, setUrgenceMotif] = useState('');

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const [p, c] = await Promise.all([
        apiFetch<Patient>(`/patients/${id}`),
        apiFetch<Carnet>(`/patients/${id}/carnet`),
      ]);
      setPatient(p);
      setCarnet(c);
    } finally {
      setChargement(false);
    }
  }, [id]);

  useEffect(() => {
    if (user && user.role !== 'MEDECIN') router.replace(`/patients/${id}`);
  }, [user, id, router]);

  useEffect(() => {
    if (user?.role === 'MEDECIN') void charger();
  }, [charger, user]);

  if (!user || user.role !== 'MEDECIN') return <FullScreenLoader />;
  if (chargement || !patient || !carnet) return <FullScreenLoader />;

  function ouvrirConsultation() {
    setConsForm({ motif: '', diagnostic: '', notes: '' });
    setPrescriptions([]);
    setErreur('');
    setConsOuvert(true);
  }

  function ouvrirAntecedent() {
    setAntForm({ type: 'MEDICAL', description: '', date: '' });
    setErreur('');
    setAntOuvert(true);
  }

  async function enregistrerConsultation() {
    setErreur('');
    if (!consForm.motif.trim()) {
      setErreur('Le motif est requis.');
      return;
    }
    setEnvoi(true);
    try {
      await apiFetch(`/patients/${id}/consultations`, {
        method: 'POST',
        body: JSON.stringify({
          motif: consForm.motif,
          diagnostic: consForm.diagnostic || undefined,
          notes: consForm.notes || undefined,
          prescriptions: prescriptions
            .filter((p) => p.medicament.trim() && p.posologie.trim())
            .map((p) => ({
              medicament: p.medicament,
              posologie: p.posologie,
              duree: p.duree || undefined,
            })),
        }),
      });
      setConsOuvert(false);
      await charger();
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Enregistrement impossible.');
    } finally {
      setEnvoi(false);
    }
  }

  async function enregistrerAntecedent() {
    setErreur('');
    if (!antForm.description.trim()) {
      setErreur('La description est requise.');
      return;
    }
    setEnvoi(true);
    try {
      await apiFetch(`/patients/${id}/antecedents`, {
        method: 'POST',
        body: JSON.stringify({
          type: antForm.type,
          description: antForm.description,
          date: antForm.date || undefined,
        }),
      });
      setAntOuvert(false);
      await charger();
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Enregistrement impossible.');
    } finally {
      setEnvoi(false);
    }
  }

  async function activerUrgence() {
    if (!urgenceMotif.trim()) {
      setErreur('Le motif est obligatoire.');
      return;
    }
    setEnvoi(true);
    setErreur('');
    try {
      const c = await apiFetch<Carnet>(`/patients/${id}/carnet/urgence`, {
        method: 'POST',
        body: JSON.stringify({ motif: urgenceMotif }),
      });
      setCarnet(c);
      setUrgence(true);
      setUrgenceOuvert(false);
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Accès impossible.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link
        href={`/patients/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la fiche
      </Link>

      {/* En-tête patient */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <Avatar initials={`${patient.prenom[0] ?? ''}${patient.nom[0] ?? ''}`.toUpperCase()} className="h-14 w-14 text-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">Carnet — {patient.prenom} {patient.nom}</h1>
            <Badge tone="teal" dot>Patient partagé</Badge>
          </div>
          <p className="text-sm text-slate-500">{formatTelephone(patient.telephone)}</p>
        </div>
      </div>

      {/* Bandeau : urgence (rouge) / partage autorisé (vert) / sinon ambre + bris de glace */}
      {urgence ? (
        <div className="flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Accès d’urgence activé (bris de glace).</strong> Vous voyez le carnet
            <strong> complet</strong> sans consentement. Cet accès est <strong>tracé</strong> et le patient en
            sera informé.
          </span>
        </div>
      ) : carnet.partageAutorise ? (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Partage autorisé.</strong> Vous voyez l’historique complet du patient, y compris les données
            créées par les <strong>autres établissements</strong> (signalées « Partagé »).
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-start gap-2">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Vous voyez uniquement les données de <strong>votre hôpital</strong>. L’accès à l’historique des
              autres établissements nécessite le <strong>consentement du patient</strong>.
            </span>
          </span>
          <button
            onClick={() => {
              setUrgenceMotif('');
              setErreur('');
              setUrgenceOuvert(true);
            }}
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
          >
            <AlertTriangle className="h-4 w-4" /> Accès d’urgence
          </button>
        </div>
      )}

      {/* Antécédents */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-slate-800">
            <HeartPulse className="h-4 w-4 text-brand" /> Antécédents & allergies
          </h2>
          <button
            onClick={ouvrirAntecedent}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </div>
        {carnet.antecedents.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">Aucun antécédent enregistré.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {carnet.antecedents.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                <Badge tone={TYPE_ANT[a.type].tone}>{TYPE_ANT[a.type].label}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-700">{a.description}</p>
                  <p className="text-xs text-slate-400">
                    {a.date ? dateLongue(a.date) : dateLongue(a.createdAt)}
                    {!a.estPropreHopital && a.hopitalCreateur && ` · ${a.hopitalCreateur.nom}`}
                  </p>
                </div>
                {carnet.partageAutorise &&
                  (a.estPropreHopital ? (
                    <Badge tone="slate">Votre hôpital</Badge>
                  ) : (
                    <Badge tone="teal">Partagé</Badge>
                  ))}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Consultations */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-slate-800">
            <Stethoscope className="h-4 w-4 text-brand" /> Consultations
          </h2>
          <button
            onClick={ouvrirConsultation}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" /> Nouvelle consultation
          </button>
        </div>
        {carnet.consultations.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">Aucune consultation enregistrée.</p>
        ) : (
          <div className="space-y-4 p-5">
            {carnet.consultations.map((c) => (
              <article key={c.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{dateLongue(c.date)}</span>
                    {carnet.partageAutorise &&
                      (c.estPropreHopital ? (
                        <Badge tone="slate">Votre hôpital</Badge>
                      ) : (
                        <Badge tone="teal">Partagé</Badge>
                      ))}
                  </div>
                  <span className="text-xs text-slate-400">
                    {c.medecin ? `Dr ${c.medecin.nom}` : ''}{c.hopital ? ` · ${c.hopital.nom}` : ''}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-slate-800">{c.motif}</p>
                {c.diagnostic && (
                  <p className="mt-1 text-sm text-slate-600"><span className="text-slate-400">Diagnostic :</span> {c.diagnostic}</p>
                )}
                {c.notes && (
                  <p className="mt-1 text-sm text-slate-500"><span className="text-slate-400">Notes :</span> {c.notes}</p>
                )}
                {c.prescriptions.length > 0 && (
                  <div className="mt-3 space-y-1.5 rounded-lg bg-slate-50 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <Pill className="h-3.5 w-3.5" /> Prescriptions
                    </p>
                    {c.prescriptions.map((p) => (
                      <div key={p.id} className="flex flex-wrap gap-x-2 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">{p.medicament}</span>
                        <span className="text-slate-400">— {p.posologie}</span>
                        {p.duree && <span className="text-slate-400">· {p.duree}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Slide-over : nouvelle consultation */}
      <SlideOver
        open={consOuvert}
        onClose={() => setConsOuvert(false)}
        title="Nouvelle consultation"
        subtitle="Rattachée à votre hôpital"
        width="max-w-lg"
        footer={
          <div className="flex gap-3">
            <button onClick={() => setConsOuvert(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Annuler</button>
            <button onClick={enregistrerConsultation} disabled={envoi} className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
              {envoi ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Motif" required value={consForm.motif} onChange={(v) => setConsForm((f) => ({ ...f, motif: v }))} placeholder="Douleur thoracique" />
          <Field label="Diagnostic" value={consForm.diagnostic} onChange={(v) => setConsForm((f) => ({ ...f, diagnostic: v }))} placeholder="Suspicion d’angine" />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Notes</label>
            <textarea
              value={consForm.notes}
              onChange={(e) => setConsForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Observations, recommandations…"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {/* Prescriptions dynamiques */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                <Pill className="h-4 w-4" /> Prescriptions
              </label>
              <button
                onClick={() => setPrescriptions((p) => [...p, { medicament: '', posologie: '', duree: '' }])}
                className="flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark"
              >
                <Plus className="h-3.5 w-3.5" /> Ajouter
              </button>
            </div>
            {prescriptions.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 px-3 py-3 text-center text-xs text-slate-400">
                Aucun médicament. Cliquez « Ajouter » pour en saisir.
              </p>
            ) : (
              <div className="space-y-2">
                {prescriptions.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2">
                    <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
                      <input value={p.medicament} onChange={(e) => setPrescriptions((arr) => arr.map((x, j) => (j === i ? { ...x, medicament: e.target.value } : x)))} placeholder="Médicament" className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand" />
                      <input value={p.posologie} onChange={(e) => setPrescriptions((arr) => arr.map((x, j) => (j === i ? { ...x, posologie: e.target.value } : x)))} placeholder="Posologie" className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand" />
                      <input value={p.duree} onChange={(e) => setPrescriptions((arr) => arr.map((x, j) => (j === i ? { ...x, duree: e.target.value } : x)))} placeholder="Durée" className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand" />
                    </div>
                    <button onClick={() => setPrescriptions((arr) => arr.filter((_, j) => j !== i))} className="mt-1 text-slate-400 hover:text-rose-600" aria-label="Retirer">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {erreur && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              <XCircle className="h-4 w-4 shrink-0" /> {erreur}
            </div>
          )}
        </div>
      </SlideOver>

      {/* Slide-over : nouvel antécédent */}
      <SlideOver
        open={antOuvert}
        onClose={() => setAntOuvert(false)}
        title="Ajouter un antécédent"
        footer={
          <div className="flex gap-3">
            <button onClick={() => setAntOuvert(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Annuler</button>
            <button onClick={enregistrerAntecedent} disabled={envoi} className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
              {envoi ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <SelectField label="Type" required value={antForm.type} onChange={(v) => setAntForm((f) => ({ ...f, type: v }))} options={TYPE_OPTIONS} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Description <span className="text-rose-500">*</span></label>
            <textarea
              value={antForm.description}
              onChange={(e) => setAntForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Ex. Allergie à la pénicilline"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <Field label="Date (optionnel)" type="date" value={antForm.date} onChange={(v) => setAntForm((f) => ({ ...f, date: v }))} />

          {erreur && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" /> {erreur}
            </div>
          )}
        </div>
      </SlideOver>

      {/* Slide-over : accès d'urgence (bris de glace) */}
      <SlideOver
        open={urgenceOuvert}
        onClose={() => setUrgenceOuvert(false)}
        title="Accès d’urgence"
        subtitle="Bris de glace — patient hors d’état de consentir"
        footer={
          <div className="flex gap-3">
            <button onClick={() => setUrgenceOuvert(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Annuler</button>
            <button onClick={activerUrgence} disabled={envoi} className="flex-1 rounded-lg bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
              {envoi ? 'Accès…' : 'Confirmer l’accès d’urgence'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Réservé aux situations vitales où le patient ne peut pas donner son consentement.
              Cet accès est <strong>tracé au journal</strong> (qui, quand, motif) et le patient en sera informé.
            </span>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Motif de l’urgence <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={urgenceMotif}
              onChange={(e) => setUrgenceMotif(e.target.value)}
              rows={3}
              placeholder="Ex. Patient inconscient admis aux urgences ; antécédents et allergies nécessaires."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            />
          </div>
          {erreur && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              <XCircle className="h-4 w-4 shrink-0" /> {erreur}
            </div>
          )}
        </div>
      </SlideOver>
    </div>
  );
}

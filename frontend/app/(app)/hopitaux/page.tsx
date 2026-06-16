'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  Copy,
  Pencil,
  Plus,
  Power,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { redirectForRole } from '@/lib/roles';
import type { CreateHopitalResponse, HopitalListItem } from '@/lib/types';
import { FullScreenLoader } from '@/components/loader';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { SlideOver } from '@/components/ui/slide-over';

const FORM_VIDE = {
  nom: '',
  ville: '',
  type: '',
  telephone: '',
  adminNomComplet: '',
  adminEmail: '',
  adminTelephone: '',
};

export default function HopitauxPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [hopitaux, setHopitaux] = useState<HopitalListItem[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState<'tous' | 'actif' | 'inactif'>('tous');

  // Panneau latéral
  const [ouvert, setOuvert] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string | null>(null);
  const [etape, setEtape] = useState<1 | 2 | 'succes'>(1);
  const [form, setForm] = useState(FORM_VIDE);
  const [motDePasseTemp, setMotDePasseTemp] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  const champ = (k: keyof typeof FORM_VIDE, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      setHopitaux(await apiFetch<HopitalListItem[]>('/hopitaux'));
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') router.replace(redirectForRole(user.role));
  }, [user, router]);

  useEffect(() => {
    void charger();
  }, [charger]);

  if (!user) return null;
  if (user.role !== 'SUPER_ADMIN') return <FullScreenLoader />;

  function ouvrirCreation() {
    setMode('create');
    setEditId(null);
    setForm(FORM_VIDE);
    setEtape(1);
    setErreur('');
    setOuvert(true);
  }

  function ouvrirEdition(h: HopitalListItem) {
    setMode('edit');
    setEditId(h.id);
    setForm({
      ...FORM_VIDE,
      nom: h.nom,
      ville: h.ville,
      type: h.type ?? '',
      telephone: h.telephone ?? '',
    });
    setErreur('');
    setOuvert(true);
  }

  async function soumettre() {
    setErreur('');
    if (mode === 'edit') {
      setEnvoi(true);
      try {
        await apiFetch(`/hopitaux/${editId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            nom: form.nom,
            ville: form.ville,
            type: form.type || null,
            telephone: form.telephone || null,
          }),
        });
        setOuvert(false);
        await charger();
      } catch (e) {
        setErreur(e instanceof ApiError ? e.message : 'Erreur.');
      } finally {
        setEnvoi(false);
      }
      return;
    }

    // mode create
    if (etape === 1) {
      if (!form.nom || !form.ville || !form.adminNomComplet || !form.adminEmail) {
        setErreur('Renseignez le nom, la ville et les informations de l’admin.');
        return;
      }
      setEtape(2);
      return;
    }

    setEnvoi(true);
    try {
      const res = await apiFetch<CreateHopitalResponse>('/hopitaux', {
        method: 'POST',
        body: JSON.stringify({
          nom: form.nom,
          ville: form.ville,
          type: form.type || undefined,
          telephone: form.telephone || undefined,
          admin: {
            nomComplet: form.adminNomComplet,
            email: form.adminEmail,
            telephone: form.adminTelephone || undefined,
          },
        }),
      });
      setMotDePasseTemp(res.adminMotDePasseTemporaire);
      setEtape('succes');
      await charger();
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Erreur lors de la création.');
    } finally {
      setEnvoi(false);
    }
  }

  async function basculerActif(h: HopitalListItem) {
    if (h.actif) {
      if (!confirm(`Désactiver « ${h.nom} » ?`)) return;
      await apiFetch(`/hopitaux/${h.id}/desactiver`, { method: 'PATCH' });
    } else {
      await apiFetch(`/hopitaux/${h.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ actif: true }),
      });
    }
    await charger();
  }

  const filtres = hopitaux.filter((h) => {
    if (filtre === 'actif' && !h.actif) return false;
    if (filtre === 'inactif' && h.actif) return false;
    if (recherche && !`${h.nom} ${h.ville}`.toLowerCase().includes(recherche.toLowerCase()))
      return false;
    return true;
  });

  const nbActifs = hopitaux.filter((h) => h.actif).length;
  const nbAdmins = hopitaux.filter((h) => h.utilisateurs.length > 0).length;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Hôpitaux"
        subtitle="Gérez les établissements affiliés à la plateforme."
      />

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Building2} value={hopitaux.length} label="Hôpitaux" hint="Total" />
        <StatCard icon={CheckCircle2} value={nbActifs} label="Actifs" tint="bg-emerald-50 text-emerald-600" />
        <StatCard icon={XCircle} value={hopitaux.length - nbActifs} label="Inactifs" tint="bg-slate-100 text-slate-500" />
        <StatCard icon={ShieldCheck} value={nbAdmins} label="Admins hôpital" tint="bg-blue-50 text-blue-600" />
      </div>

      {/* Barre d'outils */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un hôpital"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <select
          value={filtre}
          onChange={(e) => setFiltre(e.target.value as typeof filtre)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-brand"
        >
          <option value="tous">Tous les statuts</option>
          <option value="actif">Actifs</option>
          <option value="inactif">Inactifs</option>
        </select>
        <button
          onClick={ouvrirCreation}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          Nouvel hôpital
        </button>
      </div>

      {/* Tableau */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:grid">
          <div className="col-span-5">Nom</div>
          <div className="col-span-2">Ville</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-2">Admin</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {chargement ? (
          <div className="px-5 py-10 text-center text-sm text-slate-400">Chargement…</div>
        ) : filtres.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-400">Aucun hôpital.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtres.map((h) => {
              const admin = h.utilisateurs[0];
              return (
                <div
                  key={h.id}
                  className="grid grid-cols-2 items-center gap-3 px-5 py-3 md:grid-cols-12"
                >
                  <div className="col-span-2 flex items-center gap-3 md:col-span-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700">{h.nom}</p>
                      <p className="truncate text-xs text-slate-400">
                        {h.type || 'Établissement'} · {h._count.utilisateurs} utilisateur(s)
                      </p>
                    </div>
                  </div>
                  <div className="hidden text-sm text-slate-600 md:col-span-2 md:block">{h.ville}</div>
                  <div className="md:col-span-2">
                    <Badge tone={h.actif ? 'emerald' : 'slate'} dot>
                      {h.actif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <div className="hidden truncate text-sm text-slate-600 md:col-span-2 md:block">
                    {admin ? `${admin.prenom} ${admin.nom}` : '—'}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1 md:col-span-1">
                    <button
                      onClick={() => ouvrirEdition(h)}
                      title="Modifier"
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-brand"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => basculerActif(h)}
                      title={h.actif ? 'Désactiver' : 'Activer'}
                      className={`rounded-lg p-2 hover:bg-slate-50 ${h.actif ? 'text-slate-400 hover:text-rose-600' : 'text-slate-400 hover:text-emerald-600'}`}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Panneau création / édition */}
      <SlideOver
        open={ouvert}
        onClose={() => setOuvert(false)}
        title={mode === 'edit' ? "Modifier l'hôpital" : 'Nouvel hôpital'}
        subtitle={
          mode === 'edit'
            ? undefined
            : etape === 'succes'
              ? 'Hôpital créé'
              : `Étape ${etape} sur 2`
        }
        footer={
          etape === 'succes' ? (
            <button
              onClick={() => setOuvert(false)}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Terminer
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => (mode === 'create' && etape === 2 ? setEtape(1) : setOuvert(false))}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                {mode === 'create' && etape === 2 ? 'Retour' : 'Annuler'}
              </button>
              <button
                onClick={soumettre}
                disabled={envoi}
                className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {mode === 'edit'
                  ? envoi
                    ? 'Enregistrement…'
                    : 'Enregistrer'
                  : etape === 1
                    ? 'Suivant'
                    : envoi
                      ? 'Création…'
                      : "Créer l'hôpital"}
              </button>
            </div>
          )
        }
      >
        {etape === 'succes' ? (
          <SuccesCreation
            email={form.adminEmail}
            motDePasse={motDePasseTemp}
          />
        ) : mode === 'edit' || etape === 1 ? (
          <div className="space-y-5">
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Informations de l’hôpital
              </p>
              <Field label="Nom de l'hôpital" required value={form.nom} onChange={(v) => champ('nom', v)} placeholder="Hôpital Central de…" />
              <Field label="Ville" required value={form.ville} onChange={(v) => champ('ville', v)} placeholder="Yaoundé" />
              <Field label="Type" value={form.type} onChange={(v) => champ('type', v)} placeholder="public, clinique privée…" />
              <Field label="Téléphone" value={form.telephone} onChange={(v) => champ('telephone', v)} placeholder="+237…" />
            </section>

            {mode === 'create' && (
              <section className="space-y-3 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Administrateur de l’hôpital
                </p>
                <Field label="Nom complet" required value={form.adminNomComplet} onChange={(v) => champ('adminNomComplet', v)} placeholder="Marie Dupont" />
                <Field label="Email" required type="email" value={form.adminEmail} onChange={(v) => champ('adminEmail', v)} placeholder="admin@hopital.cm" />
                <Field label="Téléphone" value={form.adminTelephone} onChange={(v) => champ('adminTelephone', v)} placeholder="+237…" />
                <p className="text-xs text-slate-400">
                  Un mot de passe temporaire sera généré et affiché à l’étape suivante.
                </p>
              </section>
            )}

            {erreur && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                <XCircle className="h-4 w-4 shrink-0" />
                {erreur}
              </div>
            )}
          </div>
        ) : (
          <Recapitulatif form={form} erreur={erreur} />
        )}
      </SlideOver>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-600">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </div>
  );
}

function Recapitulatif({ form, erreur }: { form: typeof FORM_VIDE; erreur: string }) {
  const ligne = (label: string, valeur: string) => (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-700">{valeur || '—'}</span>
    </div>
  );
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Vérifiez les informations avant de créer l’hôpital.</p>
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Hôpital</p>
        {ligne('Nom', form.nom)}
        {ligne('Ville', form.ville)}
        {ligne('Type', form.type)}
        {ligne('Téléphone', form.telephone)}
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Administrateur</p>
        {ligne('Nom complet', form.adminNomComplet)}
        {ligne('Email', form.adminEmail)}
        {ligne('Téléphone', form.adminTelephone)}
      </div>
      {erreur && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          <XCircle className="h-4 w-4 shrink-0" />
          {erreur}
        </div>
      )}
    </div>
  );
}

function SuccesCreation({ email, motDePasse }: { email: string; motDePasse: string }) {
  const [copie, setCopie] = useState(false);
  async function copier() {
    await navigator.clipboard.writeText(motDePasse);
    setCopie(true);
    setTimeout(() => setCopie(false), 1500);
  }
  return (
    <div className="space-y-4 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-7 w-7" />
      </span>
      <div>
        <h3 className="text-lg font-bold text-slate-800">Hôpital créé</h3>
        <p className="mt-1 text-sm text-slate-500">
          Communiquez ces identifiants à l’administrateur. Le mot de passe ne sera plus affiché.
        </p>
      </div>
      <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left">
        <div>
          <p className="text-xs text-slate-400">Email</p>
          <p className="text-sm font-medium text-slate-700">{email}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Mot de passe temporaire</p>
          <div className="flex items-center justify-between gap-2">
            <code className="text-sm font-semibold text-brand">{motDePasse}</code>
            <button
              onClick={copier}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-white"
            >
              <Copy className="h-3.5 w-3.5" />
              {copie ? 'Copié' : 'Copier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

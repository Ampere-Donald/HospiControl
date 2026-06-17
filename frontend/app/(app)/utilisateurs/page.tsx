'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Pencil,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { roleLabel, useAuth } from '@/lib/auth';
import { redirectForRole } from '@/lib/roles';
import type { Role, Utilisateur } from '@/lib/types';
import { FullScreenLoader } from '@/components/loader';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Avatar } from '@/components/ui/avatar';
import { Badge, type Tone } from '@/components/ui/badge';
import { SlideOver } from '@/components/ui/slide-over';
import { Field, SelectField } from '@/components/ui/field';
import { useToast } from '@/components/ui/toast';

const FORM_VIDE = {
  nomComplet: '',
  email: '',
  role: 'MEDECIN' as Role,
  motDePasse: '',
};

function roleTone(role: Role): Tone {
  if (role === 'MEDECIN') return 'blue';
  if (role === 'ACCUEIL') return 'amber';
  return 'teal';
}

export default function UtilisateursPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [filtreRole, setFiltreRole] = useState<'tous' | Role>('tous');

  const [ouvert, setOuvert] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  const champ = (k: keyof typeof FORM_VIDE, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      setUsers(await apiFetch<Utilisateur[]>('/utilisateurs'));
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role !== 'ADMIN_HOPITAL') router.replace(redirectForRole(user.role));
  }, [user, router]);

  useEffect(() => {
    void charger();
  }, [charger]);

  if (!user) return null;
  if (user.role !== 'ADMIN_HOPITAL') return <FullScreenLoader />;

  function ouvrirCreation() {
    setEditId(null);
    setForm(FORM_VIDE);
    setErreur('');
    setOuvert(true);
  }

  function ouvrirEdition(u: Utilisateur) {
    setEditId(u.id);
    setForm({
      nomComplet: `${u.prenom} ${u.nom}`.trim(),
      email: u.email,
      role: u.role,
      motDePasse: '',
    });
    setErreur('');
    setOuvert(true);
  }

  async function soumettre() {
    setErreur('');
    if (!form.nomComplet || !form.email) {
      setErreur('Le nom complet et l’email sont requis.');
      return;
    }
    if (!editId && form.motDePasse.length < 6) {
      setErreur('Le mot de passe temporaire doit contenir au moins 6 caractères.');
      return;
    }
    setEnvoi(true);
    try {
      if (editId) {
        await apiFetch(`/utilisateurs/${editId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            nomComplet: form.nomComplet,
            email: form.email,
            role: form.role,
            ...(form.motDePasse ? { motDePasse: form.motDePasse } : {}),
          }),
        });
      } else {
        await apiFetch('/utilisateurs', {
          method: 'POST',
          body: JSON.stringify({
            nomComplet: form.nomComplet,
            email: form.email,
            role: form.role,
            motDePasse: form.motDePasse,
          }),
        });
      }
      setOuvert(false);
      await charger();
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Erreur lors de l’enregistrement.');
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer(u: Utilisateur) {
    if (!confirm(`Supprimer ${u.prenom} ${u.nom} ?`)) return;
    try {
      await apiFetch(`/utilisateurs/${u.id}`, { method: 'DELETE' });
      toast('Utilisateur supprimé.', 'success');
      await charger();
    } catch (e) {
      toast(
        e instanceof ApiError ? e.message : 'Suppression impossible.',
        'error',
      );
    }
  }

  const filtres = users.filter((u) => {
    if (filtreRole !== 'tous' && u.role !== filtreRole) return false;
    if (
      recherche &&
      !`${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(recherche.toLowerCase())
    )
      return false;
    return true;
  });

  const total = users.length;
  const nbMedecins = users.filter((u) => u.role === 'MEDECIN').length;
  const nbAccueil = users.filter((u) => u.role === 'ACCUEIL').length;
  const pct = (n: number) => (total ? `${Math.round((n / total) * 100)}%` : '0%');

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Utilisateurs"
        subtitle="Gérez les comptes utilisateurs de votre hôpital."
      />

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} value={total} label="Utilisateurs" hint="Total" />
        <StatCard icon={Stethoscope} value={nbMedecins} label="Médecins" hint={pct(nbMedecins)} tint="bg-blue-50 text-blue-600" />
        <StatCard icon={UserRound} value={nbAccueil} label="Accueil" hint={pct(nbAccueil)} tint="bg-amber-50 text-amber-600" />
        <StatCard icon={UserCheck} value={total} label="Comptes actifs" tint="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Barre d'outils */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un utilisateur"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <select
          value={filtreRole}
          onChange={(e) => setFiltreRole(e.target.value as typeof filtreRole)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-brand"
        >
          <option value="tous">Tous les rôles</option>
          <option value="MEDECIN">Médecins</option>
          <option value="ACCUEIL">Accueil</option>
          <option value="ADMIN_HOPITAL">Administrateurs</option>
        </select>
        <button
          onClick={ouvrirCreation}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          Ajouter utilisateur
        </button>
      </div>

      {/* Tableau */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:grid">
          <div className="col-span-4">Nom</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Rôle</div>
          <div className="col-span-2">Ajouté le</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {chargement ? (
          <div className="px-5 py-10 text-center text-sm text-slate-400">Chargement…</div>
        ) : filtres.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-400">Aucun utilisateur.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtres.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-2 items-center gap-3 px-5 py-3 md:grid-cols-12"
              >
                <div className="col-span-2 flex items-center gap-3 md:col-span-4">
                  <Avatar initials={`${u.prenom[0] ?? ''}${u.nom[0] ?? ''}`.toUpperCase()} tone={u.role === 'MEDECIN' ? 'blue' : u.role === 'ACCUEIL' ? 'amber' : 'brand'} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {u.prenom} {u.nom}
                      {u.id === user.id && <span className="ml-1 text-xs text-slate-400">(vous)</span>}
                    </p>
                    <p className="truncate text-xs text-slate-400 md:hidden">{u.email}</p>
                  </div>
                </div>
                <div className="hidden truncate text-sm text-slate-600 md:col-span-3 md:block">{u.email}</div>
                <div className="md:col-span-2">
                  <Badge tone={roleTone(u.role)}>{roleLabel(u.role)}</Badge>
                </div>
                <div className="hidden text-sm text-slate-500 md:col-span-2 md:block">
                  {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1 md:col-span-1">
                  <button
                    onClick={() => ouvrirEdition(u)}
                    title="Modifier"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-brand"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {u.id !== user.id && u.role !== 'ADMIN_HOPITAL' && (
                    <button
                      onClick={() => supprimer(u)}
                      title="Supprimer"
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panneau création / édition */}
      <SlideOver
        open={ouvert}
        onClose={() => setOuvert(false)}
        title={editId ? 'Modifier l’utilisateur' : 'Créer un utilisateur'}
        subtitle={editId ? undefined : 'Médecin ou agent d’accueil de votre hôpital'}
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => setOuvert(false)}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              onClick={soumettre}
              disabled={envoi}
              className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {envoi ? 'Enregistrement…' : editId ? 'Enregistrer' : 'Créer l’utilisateur'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Nom complet" required value={form.nomComplet} onChange={(v) => champ('nomComplet', v)} placeholder="Patrick Nkeng" />
          <Field label="Email" required type="email" value={form.email} onChange={(v) => champ('email', v)} placeholder="utilisateur@hopital.cm" />
          <SelectField
            label="Rôle"
            required
            value={form.role}
            onChange={(v) => champ('role', v)}
            options={[
              { value: 'MEDECIN', label: 'Médecin' },
              { value: 'ACCUEIL', label: 'Accueil' },
            ]}
          />
          <div>
            <Field
              label={editId ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe temporaire'}
              required={!editId}
              type="text"
              value={form.motDePasse}
              onChange={(v) => champ('motDePasse', v)}
              placeholder={editId ? 'Laisser vide pour ne pas changer' : 'Au moins 6 caractères'}
            />
            {!editId && (
              <p className="mt-1.5 text-xs text-slate-400">
                Le mot de passe temporaire devra être changé par l’utilisateur à la première connexion.
              </p>
            )}
          </div>

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

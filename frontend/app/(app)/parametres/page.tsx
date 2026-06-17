'use client';

import { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { roleLabel, useAuth } from '@/lib/auth';
import { PageHeader } from '@/components/ui/page-header';
import { Field } from '@/components/ui/field';

export default function ParametresPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ ancien: '', nouveau: '', confirmer: '' });
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);

  if (!user) return null;
  const forceChangement = Boolean(user.mustChangePassword);

  async function changer() {
    setErreur('');
    setSucces(false);
    if (form.nouveau.length < 6) {
      setErreur('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (form.nouveau !== form.confirmer) {
      setErreur('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setEnvoi(true);
    try {
      await apiFetch('/auth/mot-de-passe', {
        method: 'PATCH',
        body: JSON.stringify({
          ancienMotDePasse: form.ancien,
          nouveauMotDePasse: form.nouveau,
        }),
      });
      setSucces(true);
      setForm({ ancien: '', nouveau: '', confirmer: '' });
      // Si c'était un changement forcé (1ère connexion), on recharge pour rafraîchir
      // l'état d'auth (mustChangePassword = false) et atterrir sur son espace.
      if (forceChangement) {
        setTimeout(() => window.location.assign('/'), 1000);
      }
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Changement impossible.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Paramètres" subtitle="Votre compte et vos préférences." />

      {forceChangement && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Pour votre sécurité, <strong>changez votre mot de passe temporaire</strong> avant de continuer.
          </span>
        </div>
      )}

      {/* Profil */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-800">Mon compte</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-slate-400">Nom</dt>
            <dd className="font-medium text-slate-700">{user.prenom} {user.nom}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Email</dt>
            <dd className="font-medium text-slate-700">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Rôle</dt>
            <dd className="font-medium text-slate-700">{roleLabel(user.role)}</dd>
          </div>
          {user.hopital && (
            <div>
              <dt className="text-xs text-slate-400">Hôpital</dt>
              <dd className="font-medium text-slate-700">{user.hopital.nom}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Changement de mot de passe */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold text-slate-800">
          <KeyRound className="h-4 w-4 text-brand" /> Changer mon mot de passe
        </h2>
        <div className="mt-4 space-y-4">
          <Field label="Mot de passe actuel" type="password" value={form.ancien} onChange={(v) => setForm((f) => ({ ...f, ancien: v }))} />
          <Field label="Nouveau mot de passe" type="password" value={form.nouveau} onChange={(v) => setForm((f) => ({ ...f, nouveau: v }))} placeholder="Au moins 6 caractères" />
          <Field label="Confirmer le nouveau mot de passe" type="password" value={form.confirmer} onChange={(v) => setForm((f) => ({ ...f, confirmer: v }))} />

          {erreur && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              <XCircle className="h-4 w-4 shrink-0" /> {erreur}
            </div>
          )}
          {succes && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> Mot de passe mis à jour.
            </div>
          )}

          <button
            onClick={changer}
            disabled={envoi}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {envoi ? 'Enregistrement…' : 'Mettre à jour'}
          </button>
        </div>
      </div>

      {/* Hôpital (admin) */}
      {user.role === 'ADMIN_HOPITAL' && user.hopital && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-slate-800">
            <Building2 className="h-4 w-4 text-brand" /> Mon hôpital
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-slate-400">Nom</dt>
              <dd className="font-medium text-slate-700">{user.hopital.nom}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Ville</dt>
              <dd className="font-medium text-slate-700">{user.hopital.ville}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

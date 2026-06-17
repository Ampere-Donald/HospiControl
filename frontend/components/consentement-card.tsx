'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Loader2,
  Send,
  ShieldCheck,
  ShieldOff,
  UserCheck,
} from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { ConsentementStatut, StatutConsentement } from '@/lib/types';
import { Badge, type Tone } from '@/components/ui/badge';

interface DemandeResponse {
  statut: StatutConsentement;
  email: string | null;
  lienMagique: string;
}

const STATUT: Record<StatutConsentement, { label: string; tone: Tone }> = {
  AUTORISE: { label: 'Autorisé par le patient', tone: 'emerald' },
  EN_ATTENTE: { label: 'En attente du patient', tone: 'amber' },
  REFUSE: { label: 'Refusé par le patient', tone: 'rose' },
  REVOQUE: { label: 'Révoqué', tone: 'rose' },
};

/**
 * Bloc 1 — gestion du consentement. L'hôpital ne s'auto-autorise plus : il
 * DEMANDE l'accès, le patient décide via un lien magique. Présentiel en secours.
 * ACCUEIL / ADMIN agissent ; MEDECIN voit le statut (lecture seule).
 */
export function ConsentementCard({
  patientId,
  onChange,
}: {
  patientId: string;
  onChange?: () => void;
}) {
  const { user } = useAuth();
  const [statut, setStatut] = useState<ConsentementStatut | null>(null);
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState('');
  const [erreur, setErreur] = useState('');
  const [demande, setDemande] = useState<DemandeResponse | null>(null);
  const [copie, setCopie] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur('');
    try {
      setStatut(
        await apiFetch<ConsentementStatut>(`/patients/${patientId}/consentement`),
      );
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Statut indisponible.');
    } finally {
      setChargement(false);
    }
  }, [patientId]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const peutGerer = user?.role === 'ACCUEIL' || user?.role === 'ADMIN_HOPITAL';
  const st = statut?.statut ?? null;
  const autorise = st === 'AUTORISE';
  const hopitalNom = user?.hopital?.nom ?? 'votre hôpital';

  async function action(
    chemin: string,
    methode: 'POST' | 'PATCH',
    cle: string,
  ): Promise<unknown> {
    setEnvoi(cle);
    setErreur('');
    try {
      const r = await apiFetch(`/patients/${patientId}/consentement${chemin}`, {
        method: methode,
      });
      await charger();
      onChange?.();
      return r;
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Action impossible.');
      return null;
    } finally {
      setEnvoi('');
    }
  }

  async function demander() {
    setDemande(null);
    const r = (await action('/demander', 'POST', 'demander')) as DemandeResponse | null;
    if (r) setDemande(r);
  }

  const lienComplet =
    demande && typeof window !== 'undefined'
      ? `${window.location.origin}${demande.lienMagique}`
      : '';

  async function copier() {
    try {
      await navigator.clipboard.writeText(lienComplet);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      /* clipboard indisponible */
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold text-slate-800">
          <ShieldCheck className="h-4 w-4 text-brand" /> Consentement de partage
        </h2>
        {!chargement &&
          (st ? (
            <Badge tone={STATUT[st].tone} dot>
              {STATUT[st].label}
            </Badge>
          ) : (
            <Badge tone="slate" dot>
              Non demandé
            </Badge>
          ))}
      </div>

      <p className="mt-2 text-sm text-slate-500">
        C&apos;est le <strong className="text-slate-700">patient</strong> qui
        décide si <strong className="text-slate-700">{hopitalNom}</strong> peut
        consulter l&apos;historique créé par les autres établissements. Demandez
        son accord — il recevra un lien pour autoriser depuis son espace.
      </p>

      {/* Lien magique généré (mode simulé = email affiché ici) */}
      {demande && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
            <Send className="h-3.5 w-3.5" /> Lien à transmettre au patient
            {demande.email ? ` (email : ${demande.email})` : ' (pas d’email — donnez-le-lui)'}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 truncate rounded-md bg-white px-2 py-1.5 text-[11px] text-slate-600">
              {lienComplet}
            </code>
            <button
              onClick={copier}
              className="flex shrink-0 items-center gap-1 rounded-md bg-amber-600 px-2 py-1.5 text-[11px] font-medium text-white hover:bg-amber-700"
            >
              {copie ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copie ? 'Copié' : 'Copier'}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-amber-600">
            Mode démo : l&apos;email n&apos;est pas réellement envoyé. Le patient
            ouvre ce lien pour autoriser/refuser lui-même.
          </p>
        </div>
      )}

      {statut?.dateModification && (
        <p className="mt-2 text-xs text-slate-400">
          Dernière mise à jour :{' '}
          {new Date(statut.dateModification).toLocaleString('fr-FR')}
        </p>
      )}

      <div className="mt-4">
        {peutGerer ? (
          <div className="flex flex-wrap gap-2">
            {autorise ? (
              <button
                onClick={() => action('/revoquer', 'PATCH', 'revoquer')}
                disabled={!!envoi}
                className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-60"
              >
                {envoi === 'revoquer' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
                Révoquer l&apos;accès
              </button>
            ) : (
              <button
                onClick={demander}
                disabled={!!envoi}
                className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                {envoi === 'demander' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Demander l&apos;accès au patient
              </button>
            )}

            {!autorise && (
              <button
                onClick={() => action('/presentiel', 'POST', 'presentiel')}
                disabled={!!envoi}
                title="Le patient n'a pas d'email : consentement attesté en face à face"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                {envoi === 'presentiel' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                Consentement présentiel
              </button>
            )}
          </div>
        ) : (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Le consentement est demandé par l&apos;accueil et accordé par le
            patient. Vous en voyez le statut dans le carnet.
          </p>
        )}
      </div>

      {erreur && <p className="mt-3 text-sm text-rose-600">{erreur}</p>}
    </div>
  );
}

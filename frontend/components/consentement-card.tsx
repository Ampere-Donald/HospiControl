'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { ConsentementStatut } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

/**
 * Carte de gestion du consentement de partage inter-hôpitaux (cœur Phase 5).
 * - ACCUEIL / ADMIN_HOPITAL : peuvent autoriser ou révoquer.
 * - MEDECIN : lecture seule (la saisie est faite par l'accueil).
 * Le consentement porte sur le couple (patient, hôpital connecté).
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
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

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
  const autorise = statut?.autorise ?? false;
  const hopitalNom = user?.hopital?.nom ?? 'votre hôpital';

  async function agir(action: 'autoriser' | 'revoquer') {
    setEnvoi(true);
    setErreur('');
    try {
      await apiFetch(
        `/patients/${patientId}/consentement${action === 'revoquer' ? '/revoquer' : ''}`,
        { method: action === 'revoquer' ? 'PATCH' : 'POST' },
      );
      await charger();
      onChange?.();
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Action impossible.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold text-slate-800">
          <ShieldCheck className="h-4 w-4 text-brand" /> Consentement de partage
        </h2>
        {!chargement &&
          (autorise ? (
            <Badge tone="emerald" dot>
              Autorisé
            </Badge>
          ) : statut?.statut === 'REVOQUE' ? (
            <Badge tone="rose" dot>
              Révoqué
            </Badge>
          ) : (
            <Badge tone="slate" dot>
              Non défini
            </Badge>
          ))}
      </div>

      <p className="mt-2 text-sm text-slate-500">
        Détermine si <strong className="text-slate-700">{hopitalNom}</strong> peut
        consulter l&apos;historique du carnet créé par les{' '}
        <strong className="text-slate-700">autres établissements</strong>. Vos
        propres données restent toujours visibles.
      </p>

      {statut?.dateModification && (
        <p className="mt-2 text-xs text-slate-400">
          Dernière modification :{' '}
          {new Date(statut.dateModification).toLocaleString('fr-FR')}
        </p>
      )}

      <div className="mt-4">
        {peutGerer ? (
          autorise ? (
            <button
              onClick={() => agir('revoquer')}
              disabled={envoi}
              className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-60"
            >
              {envoi ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldOff className="h-4 w-4" />
              )}
              Révoquer l&apos;accès
            </button>
          ) : (
            <button
              onClick={() => agir('autoriser')}
              disabled={envoi}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {envoi ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Autoriser le partage
            </button>
          )
        ) : (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            La gestion du consentement est assurée par l&apos;accueil de
            l&apos;hôpital.
          </p>
        )}
      </div>

      {erreur && <p className="mt-3 text-sm text-rose-600">{erreur}</p>}
    </div>
  );
}

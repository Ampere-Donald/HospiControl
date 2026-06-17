'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Presentation,
  ScrollText,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';

interface Etape {
  numero: number;
  titre: string;
  acteur: string;
  icon: LucideIcon;
  description: string;
  lien?: { label: string; href: string };
}

const ETAPES: Etape[] = [
  {
    numero: 1,
    titre: 'L’accueil enregistre le patient',
    acteur: 'Accueil — Hôpital A',
    icon: UserPlus,
    description:
      'Le patient est créé une seule fois pour toute la plateforme, identifié par son téléphone (format libre) et, si possible, sa CNI. Aucun doublon entre hôpitaux.',
    lien: { label: 'Aller aux patients', href: '/patients' },
  },
  {
    numero: 2,
    titre: 'Le médecin A documente le carnet',
    acteur: 'Médecin — Hôpital A',
    icon: Stethoscope,
    description:
      'Consultations, diagnostics, prescriptions et antécédents sont saisis. Ces données appartiennent à l’Hôpital A (badge « Votre hôpital »).',
    lien: { label: 'Voir un carnet', href: '/patients' },
  },
  {
    numero: 3,
    titre: 'L’Hôpital B demande l’accès',
    acteur: 'Accueil — Hôpital B',
    icon: Mail,
    description:
      'L’Hôpital B ne voit rien de l’historique de A. L’accueil clique « Demander l’accès » : un lien magique est envoyé au patient (mode démo : le lien s’affiche à l’écran).',
  },
  {
    numero: 4,
    titre: 'Le patient autorise depuis son espace',
    acteur: 'Patient (espace personnel)',
    icon: ShieldCheck,
    description:
      'Le patient ouvre le lien, voit qui demande l’accès et décide : Autoriser ou Refuser. C’est LUI qui contrôle son dossier, pas l’hôpital.',
  },
  {
    numero: 5,
    titre: 'L’Hôpital B voit l’historique partagé',
    acteur: 'Médecin — Hôpital B',
    icon: ScrollText,
    description:
      'Une fois autorisé, le médecin B voit le carnet complet (badge « Partagé »). Chaque lecture est tracée au journal d’accès. Le patient peut révoquer à tout moment.',
  },
];

const COMPTES = [
  {
    groupe: 'Plateforme',
    tone: 'blue' as const,
    items: [{ role: 'Super admin', email: 'admin@carnet-medical.cm', mdp: 'Admin1234!' }],
  },
  {
    groupe: 'Hôpital A — Yaoundé',
    tone: 'teal' as const,
    items: [
      { role: 'Accueil', email: 'accueil@hopital-a.cm', mdp: 'Accueil1234!' },
      { role: 'Médecin', email: 'medecin@hopital-a.cm', mdp: 'Medecin1234!' },
      { role: 'Admin', email: 'admin@hopital-a.cm', mdp: 'Admin1234!' },
    ],
  },
  {
    groupe: 'Hôpital B — Douala',
    tone: 'amber' as const,
    items: [
      { role: 'Accueil', email: 'accueil@hopital-b.cm', mdp: 'Accueil1234!' },
      { role: 'Médecin', email: 'medecin@hopital-b.cm', mdp: 'Medecin1234!' },
      { role: 'Admin', email: 'admin@hopital-b.cm', mdp: 'Admin1234!' },
    ],
  },
];

export default function DemoGuideePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        title="Démo guidée"
        subtitle="Le fil conducteur de la soutenance : consentement contrôlé par le patient, partage tracé entre hôpitaux."
        action={
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1.5 text-sm font-semibold text-brand">
            <Presentation className="h-4 w-4" /> Mode présentation
          </span>
        }
      />

      {/* Avant / Après consentement */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          L’idée en une image — Avant / Après consentement
        </h2>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
          {/* Avant */}
          <div className="flex flex-col rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800">Avant consentement</h3>
            </div>
            <p className="mt-2 text-sm text-amber-700">
              L’Hôpital B ne voit <strong>que ses propres données</strong>. L’historique des autres
              établissements reste verrouillé.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Badge tone="slate">Votre hôpital</Badge> Consultations de l’Hôpital B
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <XCircle className="h-4 w-4 text-amber-500" /> Historique Hôpital A — masqué
              </li>
            </ul>
          </div>

          {/* Flèche */}
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-1 text-brand">
              <ShieldCheck className="h-6 w-6" />
              <ArrowRight className="hidden h-6 w-6 md:block" />
              <span className="text-[11px] font-semibold text-slate-400 md:hidden">↓</span>
              <span className="text-center text-[11px] font-medium text-slate-400">
                Le patient<br />autorise
              </span>
            </div>
          </div>

          {/* Après */}
          <div className="flex flex-col rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-emerald-800">Après consentement</h3>
            </div>
            <p className="mt-2 text-sm text-emerald-700">
              L’Hôpital B voit l’<strong>historique complet</strong>. Chaque accès est tracé et
              révocable par le patient.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Badge tone="slate">Votre hôpital</Badge> Consultations de l’Hôpital B
              </li>
              <li className="flex items-center gap-2">
                <Badge tone="teal">Partagé</Badge> Historique de l’Hôpital A
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Scénario en 5 étapes */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Le scénario en 5 étapes
        </h2>
        <div className="space-y-3">
          {ETAPES.map((e) => {
            const Icon = e.icon;
            return (
              <div
                key={e.numero}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-start"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {e.numero}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Icon className="h-4 w-4 text-brand" />
                    <h3 className="font-semibold text-slate-800">{e.titre}</h3>
                    <Badge tone="slate">{e.acteur}</Badge>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-500">{e.description}</p>
                  {e.lien && (
                    <Link
                      href={e.lien.href}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark"
                    >
                      {e.lien.label} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Points clés à souligner */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> À souligner devant le jury
        </h2>
        <ul className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            Le <strong>patient</strong> contrôle son dossier (lien magique, sans mot de passe).
          </li>
          <li className="flex items-start gap-2">
            <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            Chaque accès est <strong>tracé</strong> (journal : qui, quand, motif).
          </li>
          <li className="flex items-start gap-2">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <strong>Accès d’urgence</strong> possible (bris de glace), motif obligatoire et tracé.
          </li>
          <li className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
            Identité <strong>unique</strong> du patient sur toute la plateforme (téléphone + CNI).
          </li>
        </ul>
      </section>

      {/* Comptes de démonstration */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Comptes de démonstration
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {COMPTES.map((c) => (
            <div key={c.groupe} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Badge tone={c.tone} dot>
                  {c.groupe}
                </Badge>
              </div>
              <ul className="space-y-3">
                {c.items.map((it) => (
                  <li key={it.email} className="text-sm">
                    <p className="font-medium text-slate-700">{it.role}</p>
                    <p className="font-mono text-xs text-slate-500">{it.email}</p>
                    <p className="font-mono text-xs text-slate-400">{it.mdp}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Patient démo : <span className="font-medium text-slate-500">Jean Pierre Nguoa</span> —
          téléphone <span className="font-mono">699112233</span>.
        </p>
      </section>
    </div>
  );
}

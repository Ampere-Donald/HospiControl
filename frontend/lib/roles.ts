import {
  Building2,
  ClipboardList,
  Globe,
  HeartPulse,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from './types';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface RoleConfig {
  /** Page d'atterrissage après connexion. */
  redirect: string;
  /** Entrées de menu visibles pour ce rôle. */
  nav: NavItem[];
}

/*
 * Source unique de l'expérience par rôle (cf. maquette « Navigation par rôle »).
 * La redirection post-connexion ET la sidebar en découlent.
 */
export const ROLE_CONFIG: Record<Role, RoleConfig> = {
  SUPER_ADMIN: {
    redirect: '/hopitaux',
    nav: [
      { label: 'Hôpitaux', href: '/hopitaux', icon: Building2 },
      { label: 'Vue globale', href: '/vue-globale', icon: Globe },
      { label: 'Paramètres', href: '/parametres', icon: Settings },
    ],
  },
  ADMIN_HOPITAL: {
    redirect: '/utilisateurs',
    nav: [
      { label: 'Utilisateurs', href: '/utilisateurs', icon: Users },
      { label: 'Patients', href: '/patients', icon: HeartPulse },
      { label: 'Carnet médical', href: '/carnet', icon: ClipboardList },
      { label: 'Paramètres', href: '/parametres', icon: Settings },
    ],
  },
  MEDECIN: {
    redirect: '/dashboard',
    nav: [
      { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Patients', href: '/patients', icon: Users },
      { label: 'Consultations', href: '/consultations', icon: ClipboardList },
      { label: 'Consentements', href: '/consentements', icon: ShieldCheck },
    ],
  },
  ACCUEIL: {
    redirect: '/dashboard',
    nav: [
      { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Patients', href: '/patients', icon: Users },
      { label: 'Consultations', href: '/consultations', icon: ClipboardList },
    ],
  },
};

export function redirectForRole(role: Role): string {
  return ROLE_CONFIG[role]?.redirect ?? '/dashboard';
}

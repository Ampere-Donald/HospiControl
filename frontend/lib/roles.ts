import {
  Building2,
  ClipboardList,
  Globe,
  LayoutDashboard,
  Presentation,
  Settings,
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
 * - L'admin est administratif (pas d'accès clinique : ni Patients, ni Carnet).
 * - Le médecin ne gère pas le consentement (saisi par l'accueil) : il en voit le statut dans le carnet.
 */
export const ROLE_CONFIG: Record<Role, RoleConfig> = {
  SUPER_ADMIN: {
    redirect: '/hopitaux',
    nav: [
      { label: 'Hôpitaux', href: '/hopitaux', icon: Building2 },
      { label: 'Vue globale', href: '/vue-globale', icon: Globe },
      { label: 'Démo guidée', href: '/demo-guidee', icon: Presentation },
      { label: 'Paramètres', href: '/parametres', icon: Settings },
    ],
  },
  ADMIN_HOPITAL: {
    redirect: '/utilisateurs',
    nav: [
      { label: 'Utilisateurs', href: '/utilisateurs', icon: Users },
      { label: 'Paramètres', href: '/parametres', icon: Settings },
    ],
  },
  MEDECIN: {
    redirect: '/dashboard',
    nav: [
      { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Patients', href: '/patients', icon: Users },
      { label: 'Mes consultations', href: '/consultations', icon: ClipboardList },
    ],
  },
  ACCUEIL: {
    redirect: '/dashboard',
    nav: [
      { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Patients', href: '/patients', icon: Users },
    ],
  },
};

export function redirectForRole(role: Role): string {
  return ROLE_CONFIG[role]?.redirect ?? '/dashboard';
}

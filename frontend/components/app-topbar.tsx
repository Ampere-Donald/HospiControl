'use client';

import { useRouter } from 'next/navigation';
import { Building2, ChevronDown, LogOut, Menu } from 'lucide-react';
import { displayName, initials, roleLabel, useAuth } from '@/lib/auth';
import type { User } from '@/lib/types';

export function AppTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const structure =
    user.role === 'SUPER_ADMIN'
      ? 'Toutes les structures'
      : (user.hopital?.nom ?? 'Hôpital');

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-100 bg-white/90 px-4 backdrop-blur sm:px-6">
      {/* Menu (mobile) */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sélecteur de structure */}
      <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
        <Building2 className="h-4 w-4 text-brand" />
        <span className="max-w-[14rem] truncate">{structure}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      <div className="flex-1" />

      {/* Utilisateur */}
      <UserBadge user={user} />

      {/* Déconnexion */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Déconnexion</span>
      </button>
    </header>
  );
}

function UserBadge({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
          {initials(user)}
        </span>
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-slate-800">{displayName(user)}</p>
        <p className="text-xs font-medium text-brand">{roleLabel(user.role)}</p>
      </div>
    </div>
  );
}

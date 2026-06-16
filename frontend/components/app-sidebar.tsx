'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { Logo } from './logo';
import { roleLabel, useAuth } from '@/lib/auth';
import { ROLE_CONFIG } from '@/lib/roles';

export function AppSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;
  const nav = ROLE_CONFIG[user.role]?.nav ?? [];

  return (
    <>
      {/* Voile sombre sur mobile quand le menu est ouvert */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-slate-100 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-100 px-5">
          <Logo markClass="h-8 w-8" textClass="text-xl" />
        </div>

        {/* Navigation (selon le rôle) */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
            {roleLabel(user.role)}
          </p>
          <div className="space-y-1">
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-light text-brand'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Pied : statut sécurité + version */}
        <div className="border-t border-slate-100 p-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Accès sécurisé
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Chiffrement actif
            </div>
          </div>
          <p className="mt-3 px-1 text-[11px] text-slate-400">HospiControl © 2026</p>
          <p className="px-1 text-[11px] text-slate-300">v1.0.0</p>
        </div>
      </aside>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { FullScreenLoader } from '@/components/loader';
import { AppSidebar } from '@/components/app-sidebar';
import { AppTopbar } from '@/components/app-topbar';

/** Layout des pages protégées : redirige vers /login si non authentifié. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    // Forcer le changement du mot de passe temporaire à la 1ère connexion.
    if (user.mustChangePassword && pathname !== '/parametres') {
      router.replace('/parametres');
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) return <FullScreenLoader />;

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

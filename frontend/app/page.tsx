'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { redirectForRole } from '@/lib/roles';
import { FullScreenLoader } from '@/components/loader';

/** Page racine : redirige vers l'espace du rôle ou la connexion. */
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? redirectForRole(user.role) : '/login');
  }, [user, loading, router]);

  return <FullScreenLoader />;
}

'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setPatientToken } from '@/lib/patient';
import { FullScreenLoader } from '@/components/loader';

/** Atterrissage du lien magique : on mémorise le jeton patient puis on entre dans l'espace. */
export default function LienMagiquePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();

  useEffect(() => {
    setPatientToken(token);
    router.replace('/espace-patient');
  }, [token, router]);

  return <FullScreenLoader />;
}

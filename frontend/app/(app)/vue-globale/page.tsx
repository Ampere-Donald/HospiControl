import { Globe } from 'lucide-react';
import { ComingSoon } from '@/components/coming-soon';

export default function VueGlobalePage() {
  return (
    <ComingSoon
      title="Vue globale"
      phase={6}
      icon={Globe}
      description="Supervision de toute la plateforme : activité agrégée de tous les hôpitaux."
    />
  );
}

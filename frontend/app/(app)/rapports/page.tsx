import { BarChart3 } from 'lucide-react';
import { ComingSoon } from '@/components/coming-soon';

export default function RapportsPage() {
  return (
    <ComingSoon
      title="Rapports"
      phase={6}
      icon={BarChart3}
      description="Statistiques et exports de l'activité de l'hôpital."
    />
  );
}

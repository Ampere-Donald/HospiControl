import { Settings } from 'lucide-react';
import { ComingSoon } from '@/components/coming-soon';

export default function ParametresPage() {
  return (
    <ComingSoon
      title="Paramètres"
      phase={6}
      icon={Settings}
      description="Préférences du compte et configuration de l'établissement."
    />
  );
}

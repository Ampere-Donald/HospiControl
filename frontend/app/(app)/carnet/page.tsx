import { HeartPulse } from 'lucide-react';
import { ComingSoon } from '@/components/coming-soon';

export default function CarnetPage() {
  return (
    <ComingSoon
      title="Carnet médical"
      phase={4}
      icon={HeartPulse}
      description="Historique chronologique du patient : antécédents, consultations et prescriptions."
    />
  );
}

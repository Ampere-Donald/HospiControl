import { Pill } from 'lucide-react';
import { ComingSoon } from '@/components/coming-soon';

export default function PrescriptionsPage() {
  return (
    <ComingSoon
      title="Prescriptions"
      phase={4}
      icon={Pill}
      description="Ajout de médicaments (nom, posologie, durée) aux consultations."
    />
  );
}

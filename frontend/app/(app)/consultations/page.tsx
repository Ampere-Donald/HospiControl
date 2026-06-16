import { ClipboardList } from 'lucide-react';
import { ComingSoon } from '@/components/coming-soon';

export default function ConsultationsPage() {
  return (
    <ComingSoon
      title="Consultations"
      phase={4}
      icon={ClipboardList}
      description="Création de consultations (motif, diagnostic, notes) rattachées à votre hôpital."
    />
  );
}

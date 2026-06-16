/**
 * Découpe un nom complet en prénom + nom.
 * « Marie Dupont » -> { prenom: 'Marie', nom: 'Dupont' }
 * « Jean Paul Mbarga » -> { prenom: 'Jean', nom: 'Paul Mbarga' }
 */
export function decouperNomComplet(nomComplet: string): {
  prenom: string;
  nom: string;
} {
  const parts = nomComplet.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { prenom: '', nom: '' };
  if (parts.length === 1) return { prenom: parts[0], nom: parts[0] };
  return { prenom: parts[0], nom: parts.slice(1).join(' ') };
}

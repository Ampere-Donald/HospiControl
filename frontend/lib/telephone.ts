/** Normalise un numéro camerounais en clé unique (chiffres, sans indicatif 237). */
export function normaliserTelephone(input: string): string {
  let d = (input ?? '').replace(/\D/g, '');
  if (d.startsWith('237')) d = d.slice(3);
  return d;
}

/** Clé valide = au moins 8 chiffres (numéro local camerounais = 9). */
export function telephoneValide(cle: string): boolean {
  return cle.length >= 8 && cle.length <= 12;
}

/** Affiche « +237 699 11 22 33 » à partir d'une clé / saisie. */
export function formatTelephone(valeur: string): string {
  const d = normaliserTelephone(valeur);
  if (!d) return '—';
  const groupes = d.replace(/(\d{3})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4');
  return `+237 ${groupes}`;
}

/** Âge en années à partir d'une date ISO. */
export function calculerAge(dateISO?: string | null): number | null {
  if (!dateISO) return null;
  const naissance = new Date(dateISO);
  if (Number.isNaN(naissance.getTime())) return null;
  const diff = Date.now() - naissance.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

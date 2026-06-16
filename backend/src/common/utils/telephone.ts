/**
 * Normalise un numéro de téléphone camerounais en clé unique.
 * Ne garde que les chiffres et retire l'indicatif pays 237.
 * « +237 699 11 22 33 » -> « 699112233 », « 699112233 » -> « 699112233 ».
 */
export function normaliserTelephone(input: string): string {
  let chiffres = (input ?? '').replace(/\D/g, '');
  if (chiffres.startsWith('237')) chiffres = chiffres.slice(3);
  return chiffres;
}

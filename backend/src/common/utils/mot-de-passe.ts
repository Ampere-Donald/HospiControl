import { randomBytes } from 'crypto';

// Alphabet sans caractères ambigus (pas de I, O, 0, 1).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Génère un mot de passe temporaire lisible, ex. « Hopi-7F3K9Q ». */
export function genererMotDePasseTemporaire(): string {
  const bytes = randomBytes(6);
  let suffixe = '';
  for (const b of bytes) suffixe += ALPHABET[b % ALPHABET.length];
  return `Hopi-${suffixe}`;
}

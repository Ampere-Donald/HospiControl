// Auth patient (espace-patient) — séparée de l'auth du personnel.
// Le jeton vient du lien magique (JWT rôle PATIENT) et est stocké à part.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const PATIENT_TOKEN_KEY = 'hospicontrol_patient_token';

export function getPatientToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PATIENT_TOKEN_KEY);
}

export function setPatientToken(token: string): void {
  if (typeof window !== 'undefined') localStorage.setItem(PATIENT_TOKEN_KEY, token);
}

export function clearPatientToken(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(PATIENT_TOKEN_KEY);
}

/** Fetch authentifié avec le jeton patient (espace-patient). */
export async function patientFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getPatientToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = 'Une erreur est survenue.';
    try {
      const data = await res.json();
      if (data?.message) {
        message = Array.isArray(data.message)
          ? data.message.join(' ')
          : String(data.message);
      }
    } catch {
      /* pas de corps JSON */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

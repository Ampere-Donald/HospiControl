'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { apiFetch, clearToken, getToken, setToken } from './api';
import type { LoginResponse, Role, User } from './types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, motDePasse: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Au chargement : si un token existe, on récupère l'utilisateur (et on valide le token).
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    apiFetch<User>('/auth/me')
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, motDePasse: string) => {
    const res = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, motDePasse }),
    });
    setToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>.');
  return ctx;
}

export function roleLabel(role: Role | string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super administrateur';
    case 'ADMIN_HOPITAL':
      return 'Administrateur';
    case 'MEDECIN':
      return 'Médecin';
    case 'ACCUEIL':
      return 'Accueil';
    default:
      return String(role);
  }
}

/** « Dr Paul Mbarga » pour un médecin, « Paul Mbarga » sinon. */
export function displayName(user: User): string {
  const base = `${user.prenom} ${user.nom}`.trim();
  return user.role === 'MEDECIN' ? `Dr ${base}` : base;
}

export function initials(user: User): string {
  return `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase();
}

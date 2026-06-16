import { Role } from '@prisma/client';

/** Forme de l'utilisateur authentifié attaché à req.user par la JwtStrategy. */
export interface AuthUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  hopitalId: string | null;
}

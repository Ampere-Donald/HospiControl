import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marque une route comme publique : elle échappe au JwtAuthGuard global.
 * Exemple : POST /auth/login.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

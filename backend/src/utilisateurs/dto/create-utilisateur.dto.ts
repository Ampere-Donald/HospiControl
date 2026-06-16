import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUtilisateurDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom complet est requis.' })
  nomComplet: string;

  @IsEmail({}, { message: 'Email invalide.' })
  email: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  // Un admin d'hôpital ne peut créer que des médecins ou des agents d'accueil.
  @IsIn(['MEDECIN', 'ACCUEIL'], {
    message: 'Le rôle doit être MEDECIN ou ACCUEIL.',
  })
  role: Role;

  @IsString()
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères.',
  })
  motDePasse: string;
}

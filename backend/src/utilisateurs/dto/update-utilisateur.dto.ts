import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUtilisateurDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nomComplet?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email invalide.' })
  email?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsIn(['MEDECIN', 'ACCUEIL'])
  role?: Role;

  @IsOptional()
  @IsString()
  @MinLength(6)
  motDePasse?: string;
}

import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Sexe } from '@prisma/client';

// Le téléphone (identifiant global) n'est pas modifiable ici.
export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nom?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  prenom?: string;

  @IsOptional()
  @IsDateString()
  dateNaissance?: string;

  @IsOptional()
  @IsIn(['M', 'F'])
  sexe?: Sexe;

  @IsOptional()
  @IsString()
  groupeSanguin?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsString()
  cni?: string;
}

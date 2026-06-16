import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Sexe } from '@prisma/client';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty({ message: 'Le téléphone est requis.' })
  telephone: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis.' })
  nom: string;

  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis.' })
  prenom: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date de naissance invalide.' })
  dateNaissance?: string;

  @IsOptional()
  @IsIn(['M', 'F'], { message: 'Sexe invalide.' })
  sexe?: Sexe;

  @IsOptional()
  @IsString()
  groupeSanguin?: string;

  @IsOptional()
  @IsString()
  adresse?: string;
}

import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

/** Admin créé en même temps que l'hôpital. */
class AdminInitialDto {
  @IsString()
  @IsNotEmpty({ message: "Le nom complet de l'admin est requis." })
  nomComplet: string;

  @IsEmail({}, { message: "L'email de l'admin est invalide." })
  email: string;

  @IsOptional()
  @IsString()
  telephone?: string;
}

export class CreateHopitalDto {
  @IsString()
  @IsNotEmpty({ message: "Le nom de l'hôpital est requis." })
  nom: string;

  @IsString()
  @IsNotEmpty({ message: 'La ville est requise.' })
  ville: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @ValidateNested()
  @Type(() => AdminInitialDto)
  admin: AdminInitialDto;
}

import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TypeAntecedent } from '@prisma/client';

export class CreateAntecedentDto {
  @IsIn(['MEDICAL', 'CHIRURGICAL', 'FAMILIAL', 'ALLERGIE'], {
    message: "Type d'antécédent invalide.",
  })
  type: TypeAntecedent;

  @IsString()
  @IsNotEmpty({ message: 'La description est requise.' })
  description: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}

import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreatePrescriptionDto } from './create-prescription.dto';

export class CreateConsultationDto {
  @IsString()
  @IsNotEmpty({ message: 'Le motif est requis.' })
  motif: string;

  @IsOptional()
  @IsString()
  diagnostic?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionDto)
  prescriptions?: CreatePrescriptionDto[];
}

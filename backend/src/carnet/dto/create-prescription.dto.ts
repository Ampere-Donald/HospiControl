import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePrescriptionDto {
  @IsString()
  @IsNotEmpty({ message: 'Le médicament est requis.' })
  medicament: string;

  @IsString()
  @IsNotEmpty({ message: 'La posologie est requise.' })
  posologie: string;

  @IsOptional()
  @IsString()
  duree?: string;
}

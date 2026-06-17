import { IsNotEmpty, IsString } from 'class-validator';

export class AccesUrgenceDto {
  @IsString()
  @IsNotEmpty({ message: 'Le motif de l’accès d’urgence est obligatoire.' })
  motif: string;
}

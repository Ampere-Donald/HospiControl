import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  ancienMotDePasse: string;

  @IsString()
  @MinLength(6, {
    message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.',
  })
  nouveauMotDePasse: string;
}

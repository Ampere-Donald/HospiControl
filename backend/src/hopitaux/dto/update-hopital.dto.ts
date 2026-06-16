import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateHopitalDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nom?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ville?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}

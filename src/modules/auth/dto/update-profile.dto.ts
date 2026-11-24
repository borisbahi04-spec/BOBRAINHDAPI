import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/** Champs modifiables par l'utilisateur connecté sur son propre profil */
export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Nom' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @ApiPropertyOptional({ description: 'Prénoms' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  firstName?: string;

  @ApiPropertyOptional({ description: 'E-mail' })
  @IsOptional()
  @IsEmail({}, { message: 'E-mail invalide' })
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({ description: 'Téléphone' })
  @IsOptional()
  @IsString()
  @Matches(/^$|^\+?[0-9 ().-]{6,30}$/, { message: 'Téléphone invalide' })
  phoneNumber?: string;
}

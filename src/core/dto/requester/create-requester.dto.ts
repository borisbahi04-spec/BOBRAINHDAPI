import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PriorityEnum } from 'src/core/definitions/enums';

/** Un ou plusieurs tickets : AY-0001 ou AY-0001, AZ-1234 */
export const TICKET_PATTERN =
  /^\s*[A-Za-z]{2}-\d{4,12}(\s*,\s*[A-Za-z]{2}-\d{4,12})*\s*$/;

export class CreateRequesterDto {
  @ApiProperty({ example: 'AY-0001, AZ-1234' })
  @IsNotEmpty({ message: 'Le ticket est obligatoire' })
  @IsString()
  @MaxLength(255)
  @Matches(TICKET_PATTERN, {
    message: 'Format de ticket invalide (ex : AY-0001 ou AY-0001, AZ-1234)',
  })
  ticket: string;

  @ApiProperty({ enum: PriorityEnum, default: PriorityEnum.Normal })
  @IsOptional()
  @IsEnum(PriorityEnum, { message: 'Priorité invalide' })
  priority?: PriorityEnum;

  @ApiProperty({ description: 'Station' })
  @IsNotEmpty({ message: 'La station est obligatoire' })
  @IsUUID('all', { message: 'Station invalide' })
  stationId: string;

  @ApiProperty({ description: 'Type de requête' })
  @IsNotEmpty({ message: 'Le type de requête est obligatoire' })
  @IsUUID('all', { message: 'Type de requête invalide' })
  requesttypeId: string;

  @ApiPropertyOptional({ description: "Agent labo ayant commis l'erreur (facultatif)" })
  @IsOptional()
  @IsUUID('all', { message: 'Agent labo invalide' })
  labAgentId?: string | null;

  @ApiPropertyOptional({
    description:
      "Opératrice concernée (facultatif ; si absent : l'utilisatrice connectée si elle est opératrice, null = aucune)",
  })
  @IsOptional()
  @IsUUID('all', { message: 'Opératrice invalide' })
  operatorId?: string | null;

  @ApiProperty({ description: 'Description du problème' })
  @IsNotEmpty({ message: 'La description du problème est obligatoire' })
  @IsString()
  @MinLength(10, {
    message: 'La description du problème doit contenir au moins 10 caractères',
  })
  @MaxLength(5000)
  description: string;

  @ApiProperty({ description: 'Correction à réaliser' })
  @IsNotEmpty({ message: 'La correction à réaliser est obligatoire' })
  @IsString()
  @MinLength(5, {
    message: 'La correction à réaliser doit contenir au moins 5 caractères',
  })
  @MaxLength(5000)
  correction: string;
}

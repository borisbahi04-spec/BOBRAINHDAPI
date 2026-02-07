import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Station } from 'src/core/entities/station/station';

export class CreateStationDto extends PickType(Station, [
  'displayName',
  'description',
  'isActive',
] as const) {
  @ApiPropertyOptional({ description: `est actives` })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ description: `Numéro de téléphone` })
  @IsOptional()
  @IsString()
  phoneNumber: string;
}

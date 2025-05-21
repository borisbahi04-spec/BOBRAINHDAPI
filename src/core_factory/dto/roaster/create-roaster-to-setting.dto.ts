import { ApiProperty, PickType } from '@nestjs/swagger';
import { RoasterToSetting } from 'src/core_factory/entities/roaster/roaster-to-setting.entity';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RoasterToSettingToCoocleaSpeed } from 'src/core_factory/entities/roaster/roaster-to-setting-to-coocleaspeed.entity';
import { RoasterToSettingToCylinderTemperature } from 'src/core_factory/entities/roaster/roaster-to-setting-to-cylindertemperature.entity copy';
import { RoasterToSettingToDirectSteam } from 'src/core_factory/entities/roaster/roaster-to-setting-to-directsteam.entity';

export class CreateRoasterToSettingDto extends PickType(RoasterToSetting, [
  'branchId',
  'roasterId',
] as const) {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateRoasterToSettingToCoocleaSpeedDto)
  @ApiProperty({
    type: () => [CreateRoasterToSettingToCoocleaSpeedDto],
    description: `parametres de la coocleaSpeeds`,
  })
  roasterToSettingToCoocleaSpeeds: CreateRoasterToSettingToCoocleaSpeedDto[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateRoasterToSettingToCylinderTemperatureDto)
  @ApiProperty({
    type: () => [CreateRoasterToSettingToCylinderTemperatureDto],
    description: `parametres de la CylinderTemperature`,
  })
  roasterToSettingToCylinderTemperatures: CreateRoasterToSettingToCylinderTemperatureDto[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateRoasterToSettingToDirectSteamDto)
  @ApiProperty({
    type: () => [CreateRoasterToSettingToDirectSteamDto],
    description: `parametres de la DirectSteam`,
  })
  roasterToSettingToDirectSteams: CreateRoasterToSettingToDirectSteamDto[];
}

export class CreateRoasterToSettingToCoocleaSpeedDto extends PickType(
  RoasterToSettingToCoocleaSpeed,
  ['value', 'roastertosettingId', 'coocleaspeedId', 'branchId'] as const,
) {}

export class CreateRoasterToSettingToCylinderTemperatureDto extends PickType(
  RoasterToSettingToCylinderTemperature,
  ['value', 'roastertosettingId', 'cylindertemperatureId', 'branchId'] as const,
) {}

export class CreateRoasterToSettingToDirectSteamDto extends PickType(
  RoasterToSettingToDirectSteam,
  ['value', 'roastertosettingId', 'directsteamId', 'branchId'] as const,
) {}

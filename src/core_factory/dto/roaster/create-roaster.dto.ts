import { ApiProperty, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { RoasterToSettingToCoocleaSpeed } from 'src/core_factory/entities/roaster/roaster-to-setting-to-coocleaspeed.entity';
import { RoasterToSetting } from 'src/core_factory/entities/roaster/roaster-to-setting.entity';
import { Roaster } from 'src/core_factory/entities/roaster/roaster.entity';

export class CreateRoasterDto extends PickType(Roaster, [
  'reference',
  'date',
  'shiftId',
  'stackId',
  'branchId',
  'sizeId',
  'input',
  'time',
] as const) {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateRoasterToSettingDto)
  @ApiProperty({
    type: () => [CreateRoasterToSettingDto],
    description: `paramettres de la cuisson`,
  })
  roasterToSettings: CreateRoasterToSettingDto[];
  @IsArray()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateRoasterToSettingToCoocleaSpeedDto)
  @ApiProperty({
    type: () => [CreateRoasterToSettingToCoocleaSpeedDto],
    description: `parametres de la cuisson`,
  })
  roasterToSettingToCoocleaSpeeds: CreateRoasterToSettingToCoocleaSpeedDto[];
}

export class CreateRoasterToSettingDto extends PickType(RoasterToSetting, [
  'pression',
  'branchId',
  'roasterId',
] as const) {}

export class CreateRoasterToSettingToCoocleaSpeedDto extends PickType(
  RoasterToSettingToCoocleaSpeed,
  ['value', 'roastertosetting_id', 'coocleaspeed_id', 'branchId'] as const,
) {}

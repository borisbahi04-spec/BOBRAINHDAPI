import { ApiProperty, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Roaster } from 'src/core_factory/entities/roaster/roaster.entity';
import { CreateRoasterToSettingDto } from './create-roaster-to-setting.dto';
import { RoasterToHumidityBeforeCooking } from 'src/core_factory/entities/roaster/roaster-to-humidity-before-cooking.entity';
import { RoasterToHumidityAfterCooking } from 'src/core_factory/entities/roaster/roaster-to-humidity-after-cooking.entity';
import { RoasterToHumidityAfterCooling } from 'src/core_factory/entities/roaster/roaster-to-humidity-after-cooling.entity';

export class CreateRoasterDto extends PickType(Roaster, [
  'reference',
  'date',
  'shiftId',
  'equipmentId',
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
    description: `parametres de la cuisson`,
  })
  roasterToSettings: CreateRoasterToSettingDto[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateRoasterToHumidityBeforeCookingDto)
  @ApiProperty({
    type: () => [CreateRoasterToHumidityBeforeCookingDto],
    description: `Humidity Avant la cuisson`,
  })
  roasterToHumidityBeforeCookings: CreateRoasterToHumidityBeforeCookingDto[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateRoasterToHumidityAfterCookingDto)
  @ApiProperty({
    type: () => [CreateRoasterToHumidityAfterCookingDto],
    description: `Humidity Après la cuisson`,
  })
  roasterToHumidityAfterCookings: CreateRoasterToHumidityAfterCookingDto[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateRoasterToHumidityAfterCoolingDto)
  @ApiProperty({
    type: () => [CreateRoasterToHumidityAfterCoolingDto],
    description: `Humidity Après la cooling`,
  })
  roasterToHumidityAfterCoolings: CreateRoasterToHumidityAfterCoolingDto[];
}

export class CreateRoasterToHumidityAfterCookingDto extends PickType(
  RoasterToHumidityAfterCooking,
  ['value', 'roasterId', 'cashewStageId', 'shiftId', 'branchId'] as const,
) {
  @IsOptional()
  date: Date;
}

export class CreateRoasterToHumidityBeforeCookingDto extends PickType(
  RoasterToHumidityBeforeCooking,
  ['value', 'roasterId', 'cashewStageId', 'shiftId', 'branchId'] as const,
) {
  @IsOptional()
  date: Date;
}

export class CreateRoasterToHumidityAfterCoolingDto extends PickType(
  RoasterToHumidityAfterCooling,
  ['value', 'roasterId', 'cashewStageId', 'shiftId', 'branchId'] as const,
) {
  @IsOptional()
  date: Date;
}

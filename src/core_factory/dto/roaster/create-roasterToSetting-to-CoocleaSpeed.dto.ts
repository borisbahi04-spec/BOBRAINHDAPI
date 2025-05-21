import { PickType } from '@nestjs/swagger';
import { RoasterToSettingToCoocleaSpeed } from 'src/core_factory/entities/roaster/roaster-to-setting-to-coocleaspeed.entity';

export class CreateRoasterToSettingToCoocleaSpeedDto extends PickType(
  RoasterToSettingToCoocleaSpeed,
  ['value', 'roastertosettingId', 'coocleaspeedId', 'branchId'] as const,
) {}

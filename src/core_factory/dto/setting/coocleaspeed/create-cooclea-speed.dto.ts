import { PickType } from '@nestjs/swagger';
import { CoocleaSpeed } from 'src/core_factory/entities/setting/cooclea-speed.entity';
export class CreateCoocleaSpeedDto extends PickType(CoocleaSpeed, [
  'displayName',
] as const) {}

import { PickType } from '@nestjs/swagger';
import { CylinderTemperature } from 'src/core_factory/entities/setting/cylinder-temperature.entity';
export class CreateCylinderTemperatureDto extends PickType(
  CylinderTemperature,
  ['displayName'] as const,
) {}

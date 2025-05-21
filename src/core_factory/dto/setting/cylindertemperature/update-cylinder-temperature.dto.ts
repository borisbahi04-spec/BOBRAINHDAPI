import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCylinderTemperatureDto } from './create-cylinder-temperature.dto';

export class UpdateCylinderTemperatureDto extends PartialType(
  OmitType(CreateCylinderTemperatureDto, [] as const),
) {}

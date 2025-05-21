import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCoocleaSpeedDto } from './create-cooclea-speed.dto';

export class UpdateCoocleaSpeedDto extends PartialType(
  OmitType(CreateCoocleaSpeedDto, [] as const),
) {}

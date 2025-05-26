import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCashewStageDto } from './create-cashew-stage.dto';

export class UpdateCashewStageDto extends PartialType(
  OmitType(CreateCashewStageDto, [] as const),
) {}

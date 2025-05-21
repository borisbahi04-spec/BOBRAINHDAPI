import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSizeDto } from './create-size.dto';

export class UpdateSizeDto extends PartialType(
  OmitType(CreateSizeDto, [] as const),
) {}

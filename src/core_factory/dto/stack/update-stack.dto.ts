import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateStackDto } from './create-stack.dto';

export class UpdateStackDto extends PartialType(
  OmitType(CreateStackDto, [] as const),
) {}

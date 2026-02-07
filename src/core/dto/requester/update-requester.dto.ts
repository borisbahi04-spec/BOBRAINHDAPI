import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRequesterDto } from './create-requester.dto';

export class UpdateRequesterDto extends PartialType(
  OmitType(CreateRequesterDto, [] as const),
) {}

import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRoasterDto } from './create-roaster.dto';

export class UpdateRoasterDto extends PartialType(
  OmitType(CreateRoasterDto, [] as const),
) {}

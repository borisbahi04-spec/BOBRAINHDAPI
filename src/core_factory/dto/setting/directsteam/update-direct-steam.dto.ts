import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateDirectSteamDto } from './create-direct-steam.dto';

export class UpdateDirectSteamDto extends PartialType(
  OmitType(CreateDirectSteamDto, [] as const),
) {}

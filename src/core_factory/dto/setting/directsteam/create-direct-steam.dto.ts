import { PickType } from '@nestjs/swagger';
import { DirectSteam } from 'src/core_factory/entities/setting/direct-steam.entity';
export class CreateDirectSteamDto extends PickType(DirectSteam, [
  'displayName',
] as const) {}

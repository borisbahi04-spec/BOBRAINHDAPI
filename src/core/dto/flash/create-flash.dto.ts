import { PickType } from '@nestjs/swagger';
import { Flash } from 'src/core/entities/flash/flash.entity';

export class CreateFlashDto extends PickType(Flash, [
  'sentWeight',
  'computerUser',
  'computerName',
  'userProfile',
  'station',
] as const) {}

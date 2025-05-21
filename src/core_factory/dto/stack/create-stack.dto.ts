import { PickType } from '@nestjs/swagger';
import { Stack } from 'src/core_factory/entities/roaster/stack.entity';
export class CreateStackDto extends PickType(Stack, [
  'displayName',
  'branchId',
] as const) {}

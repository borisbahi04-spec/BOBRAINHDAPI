import { PickType } from '@nestjs/swagger';
import { Shift } from 'src/core_factory/entities/setting/shift.entity';
export class CreateShiftDto extends PickType(Shift, ['value'] as const) {}

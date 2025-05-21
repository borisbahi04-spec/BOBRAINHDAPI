import { PickType } from '@nestjs/swagger';
import { Size } from 'src/core_factory/entities/setting/size.entity';
export class CreateSizeDto extends PickType(Size, ['displayName'] as const) {}

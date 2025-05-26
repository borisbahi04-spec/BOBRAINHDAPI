import { PickType } from '@nestjs/swagger';
import { CashewStage } from 'src/core_factory/entities/setting/cashew-stage.entity';
export class CreateCashewStageDto extends PickType(CashewStage, [
  'displayName',
] as const) {}

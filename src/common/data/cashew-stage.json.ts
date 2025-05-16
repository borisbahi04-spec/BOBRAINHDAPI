import { CashewStageEnum } from 'src/core_factory/definitions/enums';
import { CreateCashewStageDto } from 'src/core_factory/dto/setting/create-cashew-stage.dto';
import { CashewStage } from 'src/core_factory/entities/setting/cashew-stage.entity';

// Default users
export const getDefaultCashewStages = () => {
  return <CreateCashewStageDto[]>(<any>[
    {
      displayName: CashewStageEnum.RCN,
      description: 'Produit non transformé, encore dans sa coque',
    },
    {
      displayName: CashewStageEnum.SHELLED,
      description: 'Indique si la coque est enlevée ou quantité obtenue',
    },
    {
      displayName: CashewStageEnum.KERNEL,
      description: `Partie comestible, poids ou quantité d’amande`,
    },
    {
      displayName: CashewStageEnum.BORMA,
      description: `Amande séchée`,
    },
  ]);
};

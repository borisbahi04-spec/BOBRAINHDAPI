import {
  SizeLevelEnum,
  SizeNameEnum,
} from 'src/core_factory/definitions/enums';
import { CreateSizeDto } from 'src/core_factory/dto/setting/create-size.dto';

// Default users
export const getDefaultSizes = () => {
  return <CreateSizeDto[]>[
    //level1
    {
      displayName: SizeNameEnum.N18,
      level: SizeLevelEnum.level1,
    },
    {
      displayName: SizeNameEnum.N1820,
      level: SizeLevelEnum.level1,
    },
    {
      displayName: SizeNameEnum.N2022,
      level: SizeLevelEnum.level1,
    },
    {
      displayName: SizeNameEnum.N2224,
      level: SizeLevelEnum.level1,
    },
    {
      displayName: SizeNameEnum.N24,
      level: SizeLevelEnum.level1,
    },
  ];
};

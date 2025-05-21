import { CoocleaSpeedEnum } from 'src/core_factory/definitions/enums';
import { CreateCoocleaSpeedDto } from 'src/core_factory/dto/setting/coocleaspeed/create-cooclea-speed.dto';

// Default users
export const getDefaultCoocleaSpeeds = () => {
  return <CreateCoocleaSpeedDto[]>[
    {
      displayName: CoocleaSpeedEnum.C1COOCLEASPEED,
    },
    {
      displayName: CoocleaSpeedEnum.C2COOCLEASPEED,
    },
    {
      displayName: CoocleaSpeedEnum.C3COOCLEASPEED,
    },
    {
      displayName: CoocleaSpeedEnum.C4COOCLEASPEED,
    },
  ];
};

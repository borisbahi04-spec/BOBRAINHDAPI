import { DirectSteamEnum } from 'src/core_factory/definitions/enums';
import { CreateDirectSteamDto } from 'src/core_factory/dto/setting/directsteam/create-direct-steam.dto';

// Default users
export const getDefaultDirectSteams = () => {
  return <CreateDirectSteamDto[]>[
    {
      displayName: DirectSteamEnum.D1DIRECTSTEAM,
    },
    {
      displayName: DirectSteamEnum.D2DIRECTSTEAM,
    },
    {
      displayName: DirectSteamEnum.D3DIRECTSTEAM,
    },
    {
      displayName: DirectSteamEnum.D4DIRECTSTEAM,
    },
  ];
};

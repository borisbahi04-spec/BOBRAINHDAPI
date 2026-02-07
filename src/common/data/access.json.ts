import { AbilitySubjectEnum } from '../../core/definitions/enums';
import { EntityType, PermissionsType } from '../../core/definitions/types';
import { CreateAccessDto } from '../../core/dto/user/create-access.dto';

// Default Front accesss
export const getDefaultAccesss = () => {
  return <CreateAccessDto[]>[
    // Administrateur
    {
      name: 'default',
      entity: <EntityType>{
        [AbilitySubjectEnum.User]: false,
        [AbilitySubjectEnum.Branch]: false,
        [AbilitySubjectEnum.Requester]: false,
        [AbilitySubjectEnum.Department]: false,
        [AbilitySubjectEnum.Role]: false,
      },
      permissions: <PermissionsType>{
        create: false,
        read: false,
        edit: false,
        delete: false,
        stream: false,
        approval: false,
        treated: false,
        cancel: false,
        close: false,
      },
    },
  ];
};

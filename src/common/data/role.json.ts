import { RolePermissionsType } from '../../core/definitions/types';
import { CreateRoleDto } from '../../core/dto/user/create-role.dto';

// Default Front roles
export const getDefaultRoles = () => {
  return <CreateRoleDto[]>[
    // Administrateur
    {
      name: 'admin',
      displayName: 'Administrateur',
      isActive: true,
      description: 'Administrateur',
      adminPermission: true,
      isForOperator: false,
      sendRequesterEmail: true,
      permissions: <RolePermissionsType>{},
    },
    {
      name: 'supervisor',
      displayName: 'Supervisor',
      isActive: true,
      description: 'Supervisor',
      adminPermission: false,
      sendRequesterEmail: true,
      isForOperator: false,
      permissions: <RolePermissionsType>{},
    },

    // Gestionnaire de vente
    {
      name: 'manager',
      displayName: 'Gestionnaire ',
      isActive: true,
      description: 'Gestionnaire ',
      adminPermission: false,
      isForOperator: false,
      sendRequesterEmail: true,
      permissions: <RolePermissionsType>{},
    },
    {
      name: 'operator',
      displayName: 'Gestionnaire ',
      isActive: true,
      description: 'Gestionnaire ',
      adminPermission: false,
      sendRequesterEmail: false,
      isForOperator: true,
      permissions: <RolePermissionsType>{},
    },

    // Gestionnaire de vente
    {
      name: 'guest',
      displayName: 'Guest',
      isActive: true,
      description: 'Guest',
      adminPermission: false,
      sendRequesterEmail: false,
      isForOperator:false,
      permissions: <RolePermissionsType>{},
    },
  ];
};

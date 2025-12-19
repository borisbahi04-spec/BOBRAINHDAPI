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
      permissions: <RolePermissionsType>{},
    },
    {
      name: 'owner',
      displayName: 'Administrateur',
      isActive: true,
      description: 'Administrateur',
      adminPermission: true,
      permissions: <RolePermissionsType>{},
    },

    // Gestionnaire de vente
    {
      name: 'manager',
      displayName: 'Gestionnaire ',
      isActive: true,
      description: 'Gestionnaire ',
      adminPermission: false,
      permissions: <RolePermissionsType>{},
    },

    // Gestionnaire de vente
    {
      name: 'guest',
      displayName: 'Guest',
      isActive: true,
      description: 'Guest',
      adminPermission: false,
      permissions: <RolePermissionsType>{},
    },
  ];
};

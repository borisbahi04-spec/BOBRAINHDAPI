/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Role } from '../../entities/user/role.entity';
import {
  getDefaultBranches,
  getDefaultAccesss,
  getDefaultRoles,
  getDefaultUsers,
} from 'src/common';
import { Branch } from '../../entities/subsidiary/branch.entity';
import { User } from '../../entities/user/user.entity';
import { Access } from 'src/core/entities/user/access.entity';
import { AccessTypeEnum } from 'src/core/definitions/enums';
import { Setting } from 'src/core/entities/setting/setting.entity';
import { getDefaultSettings } from 'src/common/data/setting.json';
import { Station } from 'src/core/entities/station/station';
import { getDefaultStations } from 'src/common/data/station.json';
import { getDefaultRequestTypes } from 'src/common/data/requesttype.json';
import { RequestType } from 'src/core/entities/requester/request-type';
import { Department } from 'src/core/entities/user/department.entity';
import { getDefaultDepartments } from 'src/common/data/department.json';

@Injectable()
export class DefaultDataService {
  async createDefaultData() {
    const branches = await this.createBranchesDefaultData();
    const acccess = await this.createAccessDefaultData();
    const roles = await this.createRolesDefaultData();
    const users = await this.createUsersDefaultData();
    const stations = await this.createStationsDefaultData();
    const requestTypes = await this.createRequestTypesDefaultData();
    const departments = await this.createDepartmentsDefaultData();
    return {
      branches: branches.length,
      acccess: acccess.length,
      roles: roles.length,
      users: users.length,
      stations: stations.length,
      requestTypes: requestTypes.length,
      departments: departments.length,
    };
  }

  async createBranchesDefaultData(): Promise<Branch[]> {
    const defaultBranches = getDefaultBranches();
    const branches: Branch[] = [];
    let exists: number;
    for (const dto of defaultBranches) {
      exists = await Branch.countBy({ displayName: dto.displayName });
      if (exists <= 0) {
        branches.push(await Branch.save(dto as Branch));
      }
    }
    return branches;
  }

   async createDepartmentsDefaultData(): Promise<Department[]> {
    const defaultDepartments = getDefaultDepartments();
    const departments: Department[] = [];
    let exists: number;
    for (const dto of defaultDepartments) {
      exists = await Department.countBy({ displayName: dto.displayName });
      if (exists <= 0) {
        departments.push(await Department.save(dto as any));
      }
    }
    return departments;
  }



  async createSettingsDefaultData(): Promise<Setting[]> {
    const defaultSettings = getDefaultSettings();
    const settings: Setting[] = [];
    let exists: number;
    for (const dto of defaultSettings) {
      exists = await Setting.countBy({
        name: dto.name,
        displayName: dto.displayName,
      });
      if (exists <= 0) {
        settings.push(await Setting.save(dto as Setting));
      }
    }
    return settings;
  }

  private async createAccessDefaultData(): Promise<Access[]> {
    const defaultAccess = getDefaultAccesss();
    const access: Access[] = [];
    let exists: number;
    for (const dto of defaultAccess) {
      exists = await Access.countBy({ name: dto.name });
      if (exists <= 0) {
        access.push(await Access.save(dto as Access));
      }
    }
    return access;
  }

  private async createRolesDefaultData(): Promise<Role[]> {
    const defaultRoles = getDefaultRoles();
    const roles: Role[] = [];
    let exists: number;

    for (const dto of defaultRoles) {
     
      exists = await Role.countBy({ name: dto.name });

      if (exists <= 0) {
        roles.push(await Role.save(dto as any));
      }
    }
    return roles;
  }

  /**
   * Crée les utilisateurs par défaut définis dans le .env (APP_DEFAULT_USER_<n>_*),
   * uniquement si la table user est vide (premier démarrage).
   */
  private async createUsersDefaultData(): Promise<User[]> {
    const defaultUsers = getDefaultUsers();
    const branches = await Branch.findBy({});
    const existing = await User.count();
    if (existing > 0 || branches.length <= 0 || defaultUsers.length === 0) {
      return [];
    }

    const created: User[] = [];
    for (const dto of defaultUsers) {
      if ((await User.countBy({ username: dto.username })) > 0) continue;

      const role =
        (await Role.findOneBy({ name: dto.roleName })) ??
        (await Role.findOneBy({ name: AccessTypeEnum.admin }));
      if (!role) {
        console.warn(`*** [DefaultUsers] rôle "${dto.roleName}" introuvable : "${dto.username}" ignoré`);
        continue;
      }

      if (process.env.NODE_ENV === 'production' && (dto.newPassword.length < 8 || dto.newPassword === dto.username)) {
        console.warn(`*** [DefaultUsers] mot de passe faible pour "${dto.username}" : changez-le dès la première connexion`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { roleName, newPassword, ...fields } = dto;
      const user = User.create(fields as any) as unknown as User;
      await user.setNewPassword(newPassword);
      user.roleId = role.id;
      user.branchId = branches[0].id;
      created.push(await User.save(user));
      console.log(`*** [DefaultUsers] utilisateur "${dto.username}" créé (rôle ${role.name})`);
    }
    return created;
  }

    async createStationsDefaultData(): Promise<Station[]> {
    const defaultStations = getDefaultStations();
    const stations: Station[] = [];
    let exists: number;
    for (const dto of defaultStations) {
      exists = await Station.countBy({ displayName: dto.displayName });
      if (exists <= 0) {
        stations.push(await Station.save(dto as Station));
      }
    }
    return stations;
  }


   async createRequestTypesDefaultData(): Promise<RequestType[]> {
    const defaultRequestTypes = getDefaultRequestTypes();
    const requestTypes: RequestType[] = [];
    let exists: number;
    for (const dto of defaultRequestTypes) {
      exists = await RequestType.countBy({ displayName: dto.displayName });
      if (exists <= 0) {
        requestTypes.push(await RequestType.save(dto as RequestType));
      }
    }
    return requestTypes;
  }


  

}

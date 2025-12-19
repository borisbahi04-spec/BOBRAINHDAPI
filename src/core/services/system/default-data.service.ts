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
import { isEmpty } from 'lodash';
import { Access } from 'src/core/entities/user/access.entity';
import { AccessTypeEnum } from 'src/core/definitions/enums';
import { Setting } from 'src/core/entities/setting/setting.entity';
import { getDefaultSettings } from 'src/common/data/setting.json';

@Injectable()
export class DefaultDataService {
  async createDefaultData() {
    const branches = await this.createBranchesDefaultData();
    const acccess = await this.createAccessDefaultData();
    const roles = await this.createRolesDefaultData();
    const users = await this.createUsersDefaultData();

    return {
      branches: branches.length,
      acccess: acccess.length,
      roles: roles.length,
      users: users.length,
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

  private async createUsersDefaultData(): Promise<User[]> {
    const defaultUsers = getDefaultUsers();
    let exists: number;
    const branches = await Branch.findBy({});
    const roles = await Role.findBy({ name: AccessTypeEnum.owner });

    const users: User[] = await User.findBy({});
    if (users.length > 0 || branches.length <= 0 || roles.length <= 0) {
      return [];
    }

    let user: User;
    for (const dto of defaultUsers) {
      exists = await User.countBy({ username: dto.username });
      if (exists <= 0) {
        user = User.create(dto);

        if (!isEmpty(dto.newPassword)) {
          await user.setNewPassword(dto.newPassword);
        }
        if(dto.username=="admin"){
          user.roleId=roles[0].id;
        }else{
        const roles = await Role.findBy({ name: AccessTypeEnum.admin });
         user.roleId=roles[0].id;
        }
        users.push(
          await User.save({
            ...user,
            branchId: branches[0].id,
            //roleId: roles[0].id,
          }),
        );
      }
    }
    return users;
  }
}

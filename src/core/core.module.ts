import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// Do this for dependencies import caution.
import { AuthUser } from './entities/session/auth-user.entity';
// find file relave path for dependencies import caution
import { AccessRequestHistory } from './entities/session/access-request-history.entity';
import { AuthLog } from './entities/session/auth-log.entity';
import { Role } from './entities/user/role.entity';
import { UserController } from './controllers/user/user.controller';
import { RoleController } from './controllers/user/role.controller';
import { BranchController } from './controllers/subsidiary/branch.controller';
import { UserService } from './services/user/user.service';
import { AuthLogService } from './services/session/auth-log.service';
import { RoleService } from './services/user/role.service';
import { AuthUserService } from './services/session/auth-user.service';
import { Branch } from './entities/subsidiary/branch.entity';
import { BranchService } from './services/subsidiary/branch.service';
import { User } from './entities/user/user.entity';
import { DefaultDataService } from './services/system/default-data.service';
import { ModuleRef } from '@nestjs/core';
import { AccessService } from './services/user/access.service';
import { AccessController } from './controllers/user/access.controller';
import { ConfigService } from './services/system/config.service';
import { RunInTransactionService } from './services/transaction/runInTransaction.service';
import { Access } from './entities/user/access.entity';
import { BranchToUser } from './entities/subsidiary/branch-to-user.entity';
import { Flash } from './entities/flash/flash.entity';
import { FlashService } from './services/flash/flash.service';
import { FlashController } from './controllers/flash/flash.controller';
import { FlashSubscriber } from './services/flash/flash.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccessRequestHistory,
      Access,
      AuthLog,
      AuthUser,
      User,
      Role,
      Branch,
      BranchToUser,
      Flash,
    ]),
  ],
  controllers: [
    UserController,
    RoleController,
    AccessController,
    BranchController,
    FlashController,
  ],
  providers: [
    RunInTransactionService,
    UserService,
    AuthUserService,
    AuthLogService,
    RoleService,
    AccessService,
    BranchService,
    ConfigService,
    DefaultDataService,
    FlashService,
    FlashSubscriber,
  ],
  exports: [
    TypeOrmModule,
    UserService,
    AuthUserService,
    AuthLogService,
    RunInTransactionService,
    FlashService,
  ],
})
export class CoreModule implements OnApplicationBootstrap {
  constructor(private moduleRef: ModuleRef) {}

  async onApplicationBootstrap() {
    console.log(`*** [${CoreModule.name}][onApplicationBootstrap] start`);
    const defaultDataService = this.moduleRef.get(DefaultDataService);
    defaultDataService
      .createDefaultData()
      .then((result) => {
        console.log(
          `*** [${CoreModule.name}][onApplicationBootstrap] default data created =>`,
          result,
        );
      })
      .catch((error) => {
        console.error(
          `*** [${CoreModule.name}][onApplicationBootstrap] default data creating failed`,
          error,
        );
      });
  }
}

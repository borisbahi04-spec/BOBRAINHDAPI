import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { Request } from 'express';
import { AuthUser } from 'src/core/entities/session/auth-user.entity';

const INVALID_CREDENTIALS = `Nom d'utilisateur ou mot de passe incorrect`;
const ACCOUNT_EXPIRED = `Votre compte est expiré`;
const ACCOUNT_DISABLED = `Votre compte est désactivé`;

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private moduleRef: ModuleRef) {
    super({
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    username: string,
    password: string,
  ): Promise<any> {
    const contextId = ContextIdFactory.getByRequest(request);
    const authService = await this.moduleRef.resolve(AuthService, contextId);
    try {
      const authUser: AuthUser = await authService.validateUser(
        username,
        password,
      );
      if (!authUser) {
        throw new UnauthorizedException({
          code: 'INVALID_CREDENTIALS',
          message: INVALID_CREDENTIALS,
          fields: { username: [INVALID_CREDENTIALS] },
        });
      }

      if (!authUser.isActive) {
        throw new ForbiddenException({
          code: 'ACCOUNT_DISABLED',
          message: ACCOUNT_DISABLED,
        });
      }

      /*if (authUser.expiredAt && authUser.expiredAt < new Date()) {
        throw new ForbiddenException({
          code: 'ACCOUNT_EXPIRED',
          message: ACCOUNT_EXPIRED,
        });
      }
      if (!(await user.checkPassword(password))) {
        throw new UnauthorizedException({
          code: 'INVALID_CREDENTIALS',
          message: INVALID_CREDENTIALS,
          fields: { password: [INVALID_CREDENTIALS] },
        });
      }*/
      return authUser;
    } catch (exception) {
      throw exception;
    }
  }
}

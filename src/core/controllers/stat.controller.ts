import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiAuthJwtHeader } from '../../modules/auth/decorators/api-auth-jwt-header.decorator';
import { ApiRequestIssuerHeader } from '../../modules/auth/decorators/api-request-issuer-header.decorator';
import { CustomApiErrorResponse } from '@app/nestjs';
import { ApiTags } from '@nestjs/swagger';
import { RequesterQueryDto } from '../dto/stat/total-stat.dto';
import { StatService } from '../services/stat.service';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { AuthUser } from '../entities/session/auth-user.entity';

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('stat')
@Controller('stat')
export class StatController {
  constructor(private service: StatService) {}
  @Get('interventions')
  @HttpCode(HttpStatus.OK)
  async getDashboard(
    @CurrentUser() authUser: AuthUser,
    @Query() dto: RequesterQueryDto,
  ): Promise<any> {
    // ✅ RÈGLE MÉTIER : opérateur → seulement ses requesters
    if (authUser?.role?.isForOperator) {
      dto.userId = authUser.userId;
    }
    const requester = { ...dto, branchId: authUser.branchId };

    return this.service.getDashboardStats(requester);
  }
}

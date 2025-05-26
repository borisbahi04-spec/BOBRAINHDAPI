import {
  ApiSearchOneParamOptions,
  ApiSearchOneQueryFilter,
  ApiSearchParamOptions,
  ApiSearchQueryFilter,
  CustomApiErrorResponse,
  CustomApiPaginatedResponse,
  Paginated,
} from '@app/nestjs';
import { buildFilterFromApiSearchParams } from '@app/typeorm';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuthJwtHeader } from 'src/modules/auth/decorators/api-auth-jwt-header.decorator';
import { ApiRequestIssuerHeader } from 'src/modules/auth/decorators/api-request-issuer-header.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';

import {
  AbilityActionEnum,
  AbilitySubjectEnum,
} from 'src/core/definitions/enums';
import { CashewStage } from 'src/core_factory/entities/setting/cashew-stage.entity';
import { CreateCashewStageDto } from 'src/core_factory/dto/setting/cashewstage/create-cashew-stage.dto';
import { UpdateCashewStageDto } from 'src/core_factory/dto/setting/cashewstage/update-cashew-stage.dto';
import { AuthUser } from 'src/core/entities/session/auth-user.entity';
import { CashewStageService } from 'src/core_factory/services/setting/cashewstage/cashew-stage.service';

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('cashewstage')
@Controller('cashewstage')
export class CashewStageController {
  constructor(private service: CashewStageService) {}
  @ApiSearchQueryFilter()
  @CustomApiPaginatedResponse(CashewStage)
  @Get()
  async findPaginated(
    @CurrentUser() authUser: AuthUser,
    @Query() query?: any,
  ): Promise<Paginated<CashewStage>> {
    // Permission check
    await authUser?.throwUnlessCan(
      AbilityActionEnum.read,
      AbilitySubjectEnum.CashewStage,
    );

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchParamOptions,
      {
        textFilterFields: ['displayName'],
      },
    );

    return this.service.readPaginatedListRecord(options);
  }

  /**
   * Get cashewstage by id
   */
  @ApiSearchOneQueryFilter()
  @Get(':cashewstageId')
  async findOne(
    @Param('cashewstageId', ParseUUIDPipe) id: string,
    @Query() query?: any,
  ): Promise<CashewStage> {
    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: id ?? '' },
    });
  }

  /**
   * Create cashewstage
   */
  @ApiSearchOneQueryFilter()
  @Post()
  async create(
    @Body() dto: CreateCashewStageDto,
    @Query() query?: any,
  ): Promise<CashewStage> {
    const cashewstage = await this.service.createRecord(dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: cashewstage.id },
    });
  }

  /**
   * Update cashewstage
   */
  @ApiSearchOneQueryFilter()
  @Patch(':cashewstageId')
  async update(
    @Param('cashewstageId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCashewStageDto,
    @Query() query?: any,
  ): Promise<CashewStage> {
    const cashewstage = await this.service.updateRecord({ id: id ?? '' }, dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: cashewstage.id ?? '' },
    });
  }

  /**
   * Remove cashewstage
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':cashewstageId')
  async remove(@Param('cashewstageId', ParseUUIDPipe) id: string) {
    await this.service.deleteRecord({ id: id ?? '' });
    return;
  }
}

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
import {
  AbilityActionEnum,
  AbilitySubjectEnum,
  RequesterStatusEnum,
} from 'src/core/definitions/enums';
import { CreateRequesterDto } from 'src/core/dto/requester/create-requester.dto';
import { UpdateRequesterDto } from 'src/core/dto/requester/update-requester.dto';
import { Requester } from 'src/core/entities/requester/requester.entity';
import { AuthUser } from 'src/core/entities/session/auth-user.entity';
import { RequesterService } from 'src/core/services/requester/requester.service';

import { ApiAuthJwtHeader } from 'src/modules/auth/decorators/api-auth-jwt-header.decorator';
import { ApiRequestIssuerHeader } from 'src/modules/auth/decorators/api-request-issuer-header.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { FindManyOptions } from 'typeorm';

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('requester')
@Controller('requester')
export class RequesterController {
  constructor(private service: RequesterService) {}

  /**
   * Get paginated requester list
   */
  @ApiSearchQueryFilter()
  @CustomApiPaginatedResponse(Requester)
  @Get()
  async findAll(
    @CurrentUser() authUser: AuthUser,
    @Query() query?: any,
  ): Promise<Paginated<Requester>> {
    // Permission check
    await authUser?.throwUnlessCan(
      AbilityActionEnum.read,
      AbilitySubjectEnum.Requester,
    );
    const options: FindManyOptions = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchParamOptions,
      {
        textFilterFields: ['reference', 'ticket', 'title', 'description'],
      },
    );
    // ✅ RÈGLE MÉTIER : opérateur → seulement ses requesters
    if (authUser?.role?.isForOperator) {
      options.where = {
        ...(options.where ?? {}),
        createdBy: { userId: authUser.userId }, // ou requester.user.id selon ton modèle
      };
    }
    return this.service.readPaginatedListRecord(options);
  }

  /**
   * Get one requester by id
   */
  @ApiSearchOneQueryFilter()
  @Get(':requesterId')
  async findOne(
    @Param('requesterId', ParseUUIDPipe) id: string,
    @Query() query?: any,
  ): Promise<Requester> {
    const params: ApiSearchOneParamOptions = query as ApiSearchOneParamOptions;
    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      params,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: id ?? '' },
    });
  }

  /**
   * Create requester
   */
  @ApiSearchOneQueryFilter()
  @Post()
  async create(
    @Body() dto: CreateRequesterDto,
    @Query() query?: any,
  ): Promise<Requester> {
    const requester = await this.service.createRecord(dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: requester.id },
    });
  }

  /**
   * Update requester
   */
  @ApiSearchOneQueryFilter()
  @Patch(':requesterId')
  async update(
    @Param('requesterId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequesterDto,
    @Query() query?: any,
  ): Promise<Requester> {
    const requester = await this.service.updateRecord({ id: id ?? '' }, dto);
    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );
    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: requester.id },
    });
  }

  /**
   * Update requester
   */
  @ApiSearchOneQueryFilter()
  @Post(':requesterId/statusupdate/:status')
  async changestatus(
    @Param('requesterId', ParseUUIDPipe) id: string,
    @Param('status') status: RequesterStatusEnum,
    @Query() query?: any,
  ): Promise<Requester> {
    const requester = await this.service.changeStatus({ id: id ?? '' }, status);
    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );
    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: requester.id },
    });
  }

  /**
   * Remove requester
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':requesterId')
  async remove(@Param('requesterId', ParseUUIDPipe) id: string) {
    await this.service.deleteRecord({ id: id ?? '' });
  }
}

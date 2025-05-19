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
import { RoasterService } from 'src/core_factory/services/roaster/roaster.service';
import { Roaster } from 'src/core_factory/entities/roaster/roaster.entity';
import { AuthUser } from 'src/core/entities/session/auth-user.entity';
import { CreateRoasterDto } from 'src/core_factory/dto/roaster/create-roaster.dto';
import { UpdateRoasterDto } from 'src/core_factory/dto/roaster/update-roaster.dto';

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('roaster')
@Controller('roaster')
export class RoasterController {
  constructor(private service: RoasterService) {}

  /**
   * Get paginated roaster list
   */
  @ApiSearchQueryFilter()
  @CustomApiPaginatedResponse(Roaster)
  @Get()
  async findPaginated(
    @CurrentUser() authUser: AuthUser,
    @Query() query?: any,
  ): Promise<Paginated<Roaster>> {
    // Permission check
    await authUser?.throwUnlessCan(
      AbilityActionEnum.read,
      AbilitySubjectEnum.Product,
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
   * Get roaster by id
   */
  @ApiSearchOneQueryFilter()
  @Get(':roasterId')
  async findOne(
    @Param('roasterId', ParseUUIDPipe) id: string,
    @Query() query?: any,
  ): Promise<Roaster> {
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
   * Create roaster
   */
  @ApiSearchOneQueryFilter()
  @Post()
  async create(
    @Body() dto: CreateRoasterDto,
    @Query() query?: any,
  ): Promise<Roaster> {
    const roaster = await this.service.createRecord(dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: roaster.id },
    });
  }

  /**
   * Update roaster
   */
  @ApiSearchOneQueryFilter()
  @Patch(':roasterId')
  async update(
    @Param('roasterId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoasterDto,
    @Query() query?: any,
  ): Promise<Roaster> {
    const roaster = await this.service.updateRecord({ id: id ?? '' }, dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: roaster.id ?? '' },
    });
  }

  /**
   * Remove roaster
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':roasterId')
  async remove(@Param('roasterId', ParseUUIDPipe) id: string) {
    await this.service.deleteRecord({ id: id ?? '' });
    return;
  }
}

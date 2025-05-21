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
import { AuthUser } from 'src/core/entities/session/auth-user.entity';
import { DirectSteamService } from 'src/core_factory/services/setting/directsteam/direct-steam.service';
import { DirectSteam } from 'src/core_factory/entities/setting/direct-steam.entity';
import { UpdateDirectSteamDto } from 'src/core_factory/dto/setting/directsteam/update-direct-steam.dto';
import { CreateDirectSteamDto } from 'src/core_factory/dto/setting/directsteam/create-direct-steam.dto';

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('directsteam')
@Controller('directsteam')
export class DirectSteamController {
  constructor(private service: DirectSteamService) {}
  @ApiSearchQueryFilter()
  @CustomApiPaginatedResponse(DirectSteam)
  @Get()
  async findPaginated(
    @CurrentUser() authUser: AuthUser,
    @Query() query?: any,
  ): Promise<Paginated<DirectSteam>> {
    // Permission check
    await authUser?.throwUnlessCan(
      AbilityActionEnum.read,
      AbilitySubjectEnum.DirectSteam,
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
   * Get directsteam by id
   */
  @ApiSearchOneQueryFilter()
  @Get(':directsteamId')
  async findOne(
    @Param('directsteamId', ParseUUIDPipe) id: string,
    @Query() query?: any,
  ): Promise<DirectSteam> {
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
   * Create directsteam
   */
  @ApiSearchOneQueryFilter()
  @Post()
  async create(
    @Body() dto: CreateDirectSteamDto,
    @Query() query?: any,
  ): Promise<DirectSteam> {
    const directsteam = await this.service.createRecord(dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: directsteam.id },
    });
  }

  /**
   * Update directsteam
   */
  @ApiSearchOneQueryFilter()
  @Patch(':directsteamId')
  async update(
    @Param('directsteamId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDirectSteamDto,
    @Query() query?: any,
  ): Promise<DirectSteam> {
    const directsteam = await this.service.updateRecord({ id: id ?? '' }, dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: directsteam.id ?? '' },
    });
  }

  /**
   * Remove directsteam
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':directsteamId')
  async remove(@Param('directsteamId', ParseUUIDPipe) id: string) {
    await this.service.deleteRecord({ id: id ?? '' });
    return;
  }
}

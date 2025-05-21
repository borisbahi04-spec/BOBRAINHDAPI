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
import { CoocleaSpeed } from 'src/core_factory/entities/setting/cooclea-speed.entity';
import { CreateCoocleaSpeedDto } from 'src/core_factory/dto/setting/coocleaspeed/create-cooclea-speed.dto';
import { UpdateCoocleaSpeedDto } from 'src/core_factory/dto/setting/coocleaspeed/update-cooclea-speed.dto';
import { AuthUser } from 'src/core/entities/session/auth-user.entity';
import { CoocleaSpeedService } from 'src/core_factory/services/setting/coocleaspeed/cooclea-speed.service';

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('coocleaspeed')
@Controller('coocleaspeed')
export class CoocleaSpeedController {
  constructor(private service: CoocleaSpeedService) {}
  @ApiSearchQueryFilter()
  @CustomApiPaginatedResponse(CoocleaSpeed)
  @Get()
  async findPaginated(
    @CurrentUser() authUser: AuthUser,
    @Query() query?: any,
  ): Promise<Paginated<CoocleaSpeed>> {
    // Permission check
    await authUser?.throwUnlessCan(
      AbilityActionEnum.read,
      AbilitySubjectEnum.CoocleaSpeed,
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
   * Get coocleaspeed by id
   */
  @ApiSearchOneQueryFilter()
  @Get(':coocleaspeedId')
  async findOne(
    @Param('coocleaspeedId', ParseUUIDPipe) id: string,
    @Query() query?: any,
  ): Promise<CoocleaSpeed> {
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
   * Create coocleaspeed
   */
  @ApiSearchOneQueryFilter()
  @Post()
  async create(
    @Body() dto: CreateCoocleaSpeedDto,
    @Query() query?: any,
  ): Promise<CoocleaSpeed> {
    const coocleaspeed = await this.service.createRecord(dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: coocleaspeed.id },
    });
  }

  /**
   * Update coocleaspeed
   */
  @ApiSearchOneQueryFilter()
  @Patch(':coocleaspeedId')
  async update(
    @Param('coocleaspeedId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCoocleaSpeedDto,
    @Query() query?: any,
  ): Promise<CoocleaSpeed> {
    const coocleaspeed = await this.service.updateRecord({ id: id ?? '' }, dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: coocleaspeed.id ?? '' },
    });
  }

  /**
   * Remove coocleaspeed
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':coocleaspeedId')
  async remove(@Param('coocleaspeedId', ParseUUIDPipe) id: string) {
    await this.service.deleteRecord({ id: id ?? '' });
    return;
  }
}

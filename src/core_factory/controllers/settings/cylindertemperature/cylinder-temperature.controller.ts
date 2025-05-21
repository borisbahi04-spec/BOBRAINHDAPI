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
import { CylinderTemperature } from 'src/core_factory/entities/setting/cylinder-temperature.entity';
import { CylinderTemperatureService } from 'src/core_factory/services/setting/cylindertemperature/cylinder-temperature.service';
import { CreateCylinderTemperatureDto } from 'src/core_factory/dto/setting/cylindertemperature/create-cylinder-temperature.dto';
import { UpdateCylinderTemperatureDto } from 'src/core_factory/dto/setting/cylindertemperature/update-cylinder-temperature.dto';

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('cylindertemperature')
@Controller('cylindertemperature')
export class CylinderTemperatureController {
  constructor(private service: CylinderTemperatureService) {}
  @ApiSearchQueryFilter()
  @CustomApiPaginatedResponse(CylinderTemperature)
  @Get()
  async findPaginated(
    @CurrentUser() authUser: AuthUser,
    @Query() query?: any,
  ): Promise<Paginated<CylinderTemperature>> {
    // Permission check
    await authUser?.throwUnlessCan(
      AbilityActionEnum.read,
      AbilitySubjectEnum.CylinderTemperature,
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
   * Get cylindertemperature by id
   */
  @ApiSearchOneQueryFilter()
  @Get(':cylindertemperatureId')
  async findOne(
    @Param('cylindertemperatureId', ParseUUIDPipe) id: string,
    @Query() query?: any,
  ): Promise<CylinderTemperature> {
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
   * Create cylindertemperature
   */
  @ApiSearchOneQueryFilter()
  @Post()
  async create(
    @Body() dto: CreateCylinderTemperatureDto,
    @Query() query?: any,
  ): Promise<CylinderTemperature> {
    const cylindertemperature = await this.service.createRecord(dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: cylindertemperature.id },
    });
  }

  /**
   * Update cylindertemperature
   */
  @ApiSearchOneQueryFilter()
  @Patch(':cylindertemperatureId')
  async update(
    @Param('cylindertemperatureId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCylinderTemperatureDto,
    @Query() query?: any,
  ): Promise<CylinderTemperature> {
    const cylindertemperature = await this.service.updateRecord(
      { id: id ?? '' },
      dto,
    );

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: cylindertemperature.id ?? '' },
    });
  }

  /**
   * Remove cylindertemperature
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':cylindertemperatureId')
  async remove(@Param('cylindertemperatureId', ParseUUIDPipe) id: string) {
    await this.service.deleteRecord({ id: id ?? '' });
    return;
  }
}

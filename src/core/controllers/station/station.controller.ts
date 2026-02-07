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
import { FindManyOptions } from 'typeorm';
import { Station } from 'src/core/entities/station/station';
import { StationService } from 'src/core/services/station/station.service';
import { CreateStationDto } from 'src/core/dto/station/create-station.dto';
import { UpdateStationDto } from 'src/core/dto/station/update-station.dto';

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('station')
@Controller('station')
export class StationController {
  constructor(private service: StationService) {}

  /**
   * Get paginated station list
   */
  @ApiSearchQueryFilter()
  @CustomApiPaginatedResponse(Station)
  @Get()
  async findAll(@Query() query?: any): Promise<Paginated<Station>> {
    const options: FindManyOptions = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchParamOptions,
      {
        textFilterFields: ['name', 'displayName'],
      },
    );

    return this.service.readPaginatedListRecord(options);
  }

  /**
   * Get one station by id
   */
  @ApiSearchOneQueryFilter()
  @Get(':stationId')
  async findOne(
    @Param('stationId', ParseUUIDPipe) id: string,
    @Query() query?: any,
  ): Promise<Station> {
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
   * Create station
   */
  @ApiSearchOneQueryFilter()
  @Post()
  async create(
    @Body() dto: CreateStationDto,
    @Query() query?: any,
  ): Promise<Station> {
    const station = await this.service.createRecord(dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: station.id },
    });
  }

  /**
   * Update station
   */
  @ApiSearchOneQueryFilter()
  @Patch(':stationId')
  async update(
    @Param('stationId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStationDto,
    @Query() query?: any,
  ): Promise<Station> {
    const station = await this.service.updateRecord({ id: id ?? '' }, dto);
    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );
    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: station.id },
    });
  }

  /**
   * Remove station
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':stationId')
  async remove(@Param('stationId', ParseUUIDPipe) id: string) {
    await this.service.deleteRecord({ id: id ?? '' });
  }
}

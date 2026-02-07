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
import { CreateRequestTypeDto } from 'src/core/dto/requesttype/create-request-type.dto';
import { UpdateRequestTypeDto } from 'src/core/dto/requesttype/update-request-type.dto';
import { RequestType } from 'src/core/entities/requester/request-type';
import { RequestTypeService } from 'src/core/services/requester/request-type.service';
import { ApiAuthJwtHeader } from 'src/modules/auth/decorators/api-auth-jwt-header.decorator';
import { ApiRequestIssuerHeader } from 'src/modules/auth/decorators/api-request-issuer-header.decorator';
import { FindManyOptions } from 'typeorm';

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('requesttype')
@Controller('requesttype')
export class RequestTypeController {
  constructor(private service: RequestTypeService) {}

  /**
   * Get paginated requestType list
   */
  @ApiSearchQueryFilter()
  @CustomApiPaginatedResponse(RequestType)
  @Get()
  async findAll(@Query() query?: any): Promise<Paginated<RequestType>> {
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
   * Get one requestType by id
   */
  @ApiSearchOneQueryFilter()
  @Get(':requestTypeId')
  async findOne(
    @Param('requestTypeId', ParseUUIDPipe) id: string,
    @Query() query?: any,
  ): Promise<RequestType> {
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
   * Create requestType
   */
  @ApiSearchOneQueryFilter()
  @Post()
  async create(
    @Body() dto: CreateRequestTypeDto,
    @Query() query?: any,
  ): Promise<RequestType> {
    const requestType = await this.service.createRecord(dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: requestType.id },
    });
  }

  /**
   * Update requestType
   */
  @ApiSearchOneQueryFilter()
  @Patch(':requestTypeId')
  async update(
    @Param('requestTypeId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequestTypeDto,
    @Query() query?: any,
  ): Promise<RequestType> {
    const requestType = await this.service.updateRecord({ id: id ?? '' }, dto);
    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );
    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: requestType.id },
    });
  }

  /**
   * Remove requestType
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':requestTypeId')
  async remove(@Param('requestTypeId', ParseUUIDPipe) id: string) {
    await this.service.deleteRecord({ id: id ?? '' });
  }
}

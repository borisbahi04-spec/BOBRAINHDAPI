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
import { Size } from 'src/core_factory/entities/setting/size.entity';
import { AuthUser } from 'src/core/entities/session/auth-user.entity';
import { SizeService } from 'src/core_factory/services/setting/size/size.service';
import { CreateSizeDto } from 'src/core_factory/dto/setting/create-size.dto';
import { UpdateSizeDto } from 'src/core_factory/dto/setting/size/update-size.dto';

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('size')
@Controller('size')
export class SizeController {
  constructor(private service: SizeService) {}
  @ApiSearchQueryFilter()
  @CustomApiPaginatedResponse(Size)
  @Get()
  async findPaginated(
    @CurrentUser() authUser: AuthUser,
    @Query() query?: any,
  ): Promise<Paginated<Size>> {
    // Permission check
    await authUser?.throwUnlessCan(
      AbilityActionEnum.read,
      AbilitySubjectEnum.Size,
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
   * Get size by id
   */
  @ApiSearchOneQueryFilter()
  @Get(':sizeId')
  async findOne(
    @Param('sizeId', ParseUUIDPipe) id: string,
    @Query() query?: any,
  ): Promise<Size> {
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
   * Create size
   */
  @ApiSearchOneQueryFilter()
  @Post()
  async create(
    @Body() dto: CreateSizeDto,
    @Query() query?: any,
  ): Promise<Size> {
    const size = await this.service.createRecord(dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: size.id },
    });
  }

  /**
   * Update size
   */
  @ApiSearchOneQueryFilter()
  @Patch(':sizeId')
  async update(
    @Param('sizeId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSizeDto,
    @Query() query?: any,
  ): Promise<Size> {
    const size = await this.service.updateRecord({ id: id ?? '' }, dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: size.id ?? '' },
    });
  }

  /**
   * Remove size
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':sizeId')
  async remove(@Param('sizeId', ParseUUIDPipe) id: string) {
    await this.service.deleteRecord({ id: id ?? '' });
    return;
  }
}

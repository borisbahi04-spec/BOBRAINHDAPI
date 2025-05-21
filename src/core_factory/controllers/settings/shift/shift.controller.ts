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
import { ShiftService } from 'src/core_factory/services/setting/shift/shift.service';
import { Shift } from 'src/core_factory/entities/setting/shift.entity';
import { AuthUser } from 'src/core/entities/session/auth-user.entity';
import { CreateShiftDto } from 'src/core_factory/dto/setting/shift/create-shift.dto';
import { UpdateShiftDto } from 'src/core_factory/dto/setting/shift/update-shift.dto';

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('shift')
@Controller('shift')
export class ShiftController {
  constructor(private service: ShiftService) {}
  @ApiSearchQueryFilter()
  @CustomApiPaginatedResponse(Shift)
  @Get()
  async findPaginated(
    @CurrentUser() authUser: AuthUser,
    @Query() query?: any,
  ): Promise<Paginated<Shift>> {
    // Permission check
    await authUser?.throwUnlessCan(
      AbilityActionEnum.read,
      AbilitySubjectEnum.Shift,
    );

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchParamOptions,
      {
        textFilterFields: ['value'],
      },
    );

    return this.service.readPaginatedListRecord(options);
  }

  /**
   * Get shift by id
   */
  @ApiSearchOneQueryFilter()
  @Get(':shiftId')
  async findOne(
    @Param('shiftId', ParseUUIDPipe) id: string,
    @Query() query?: any,
  ): Promise<Shift> {
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
   * Create shift
   */
  @ApiSearchOneQueryFilter()
  @Post()
  async create(
    @Body() dto: CreateShiftDto,
    @Query() query?: any,
  ): Promise<Shift> {
    const shift = await this.service.createRecord(dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: shift.id },
    });
  }

  /**
   * Update shift
   */
  @ApiSearchOneQueryFilter()
  @Patch(':shiftId')
  async update(
    @Param('shiftId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShiftDto,
    @Query() query?: any,
  ): Promise<Shift> {
    const shift = await this.service.updateRecord({ id: id ?? '' }, dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: shift.id ?? '' },
    });
  }

  /**
   * Remove shift
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':shiftId')
  async remove(@Param('shiftId', ParseUUIDPipe) id: string) {
    await this.service.deleteRecord({ id: id ?? '' });
    return;
  }
}

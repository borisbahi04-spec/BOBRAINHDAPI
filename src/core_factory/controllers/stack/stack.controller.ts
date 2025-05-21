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
import { StackService } from 'src/core_factory/services/stack/stack.service';
import { Stack } from 'src/core_factory/entities/roaster/stack.entity';
import { CreateStackDto } from 'src/core_factory/dto/stack/create-stack.dto';
import { UpdateStackDto } from 'src/core_factory/dto/stack/update-stack.dto';
import { AuthUser } from 'src/core/entities/session/auth-user.entity';

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('stack')
@Controller('stack')
export class StackController {
  constructor(private service: StackService) {}
  @ApiSearchQueryFilter()
  @CustomApiPaginatedResponse(Stack)
  @Get()
  async findPaginated(
    @CurrentUser() authUser: AuthUser,
    @Query() query?: any,
  ): Promise<Paginated<Stack>> {
    // Permission check
    await authUser?.throwUnlessCan(
      AbilityActionEnum.read,
      AbilitySubjectEnum.Stack,
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
   * Get stack by id
   */
  @ApiSearchOneQueryFilter()
  @Get(':stackId')
  async findOne(
    @Param('stackId', ParseUUIDPipe) id: string,
    @Query() query?: any,
  ): Promise<Stack> {
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
   * Create stack
   */
  @ApiSearchOneQueryFilter()
  @Post()
  async create(
    @Body() dto: CreateStackDto,
    @Query() query?: any,
  ): Promise<Stack> {
    const stack = await this.service.createRecord(dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: stack.id },
    });
  }

  /**
   * Update stack
   */
  @ApiSearchOneQueryFilter()
  @Patch(':stackId')
  async update(
    @Param('stackId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStackDto,
    @Query() query?: any,
  ): Promise<Stack> {
    const stack = await this.service.updateRecord({ id: id ?? '' }, dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: stack.id ?? '' },
    });
  }

  /**
   * Remove stack
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':stackId')
  async remove(@Param('stackId', ParseUUIDPipe) id: string) {
    await this.service.deleteRecord({ id: id ?? '' });
    return;
  }
}

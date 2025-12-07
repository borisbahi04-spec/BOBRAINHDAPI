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
import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuthJwtHeader } from 'src/modules/auth/decorators/api-auth-jwt-header.decorator';
import { ApiRequestIssuerHeader } from 'src/modules/auth/decorators/api-request-issuer-header.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { AbilityActionEnum, AbilitySubjectEnum } from '../../definitions/enums';
import { AuthUser } from '../../entities/session/auth-user.entity';
import { UserService } from '../../services/user/user.service';
import { FlashService } from 'src/core/services/flash/flash.service';
import { Flash } from 'src/core/entities/flash/flash.entity';

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('flash')
@Controller('flash')
export class FlashController {
  constructor(
    private service: FlashService,
    private userService: UserService,
  ) {}

  /**
   * Get paginated flash list
   */
  @ApiSearchQueryFilter()
  @CustomApiPaginatedResponse(Flash)
  @Get()
  async findPaginated(
    @CurrentUser() authUser: AuthUser,
    @Query() query?: any,
  ): Promise<Paginated<Flash>> {
    // Permission check
    await authUser?.throwUnlessCan(
      AbilityActionEnum.read,
      AbilitySubjectEnum.Flash,
    );

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchParamOptions,
      {
        textFilterFields: ['displayName', 'email', 'phoneNumber', 'city'],
      },
    );

    // Apply auth user flash filter
    /*options.where = merge(
      options?.where,
      await this.service.getFilterByAuthUserFlash(),
    );*/

    return this.service.readPaginatedListRecord(options);
  }

  /**
   * Get paginated flash list for select
   */
  @ApiSearchQueryFilter()
  @Get('/sendweight/:station')
  async findReadOneWeight(
    @CurrentUser() authUser: AuthUser,
    @Param('station') station: string,
  ): Promise<Flash> {
    await authUser?.throwUnlessCan(
      AbilityActionEnum.read,
      AbilitySubjectEnum.Flash,
    );

    console.log('Station reçue:', station);
    return this.service.readOneWeight({ station });
  }

  /**
   * Get one flash by id
   */
  @ApiSearchOneQueryFilter()
  @Get(':flashId')
  async findOne(
    @CurrentUser() authUser: AuthUser,
    @Param('flashId', ParseUUIDPipe) id: string,
    @Query() query?: any,
  ): Promise<Flash> {
    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );
    const flash = await this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: id ?? '' },
    });

    // Permission check
    await authUser?.throwUnlessCan(AbilityActionEnum.read, flash);

    return flash;
  }

  /**
   * Create flash
   */
  /* @ApiSearchOneQueryFilter()
  @Post()
  async create(
    @Body() dto: CreateFlashDto,
    @Query() query?: any,
  ): Promise<Flash> {
    const flash = await this.service.createRecord(dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: flash.id },
    });
  }*/

  /**
   * Update flash
   */
  /* @ApiSearchOneQueryFilter()
  @Patch(':flashId')
  async update(
    @Param('flashId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFlashDto,
    @Query() query?: any,
  ): Promise<Flash> {
    const flash = await this.service.updateRecord({ id: id ?? '' }, dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: flash.id },
    });
  }*/
}

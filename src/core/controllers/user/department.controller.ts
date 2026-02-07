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
import { Department } from '../../entities/user/department.entity';
import { DepartmentService } from '../../services/user/department.service';
import { CreateDepartmentDto } from '../../dto/user/create-department.dto';
import { UpdateDepartmentDto } from '../../dto/user/update-department.dto';
import { FindManyOptions } from 'typeorm';

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('department')
@Controller('department')
export class DepartmentController {
  constructor(private service: DepartmentService) {}

  /**
   * Get paginated department list
   */
  @ApiSearchQueryFilter()
  @CustomApiPaginatedResponse(Department)
  @Get()
  async findAll(@Query() query?: any): Promise<Paginated<Department>> {
    const options: FindManyOptions = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchParamOptions,
      {
        textFilterFields: ['displayName'],
      },
    );

    return this.service.readPaginatedListRecord(options);
  }

  /**
   * Get one department by id
   */
  @ApiSearchOneQueryFilter()
  @Get(':departmentId')
  async findOne(
    @Param('departmentId', ParseUUIDPipe) id: string,
    @Query() query?: any,
  ): Promise<Department> {
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
   * Create department
   */
  @ApiSearchOneQueryFilter()
  @Post()
  async create(
    @Body() dto: CreateDepartmentDto,
    @Query() query?: any,
  ): Promise<Department> {
    const department = await this.service.createRecord(dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: department.id },
    });
  }

  /**
   * Update department
   */
  @ApiSearchOneQueryFilter()
  @Patch(':departmentId')
  async update(
    @Param('departmentId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
    @Query() query?: any,
  ): Promise<Department> {
    const department = await this.service.updateRecord({ id: id ?? '' }, dto);
    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );
    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: department.id },
    });
  }

  /**
   * Remove department
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':departmentId')
  async remove(@Param('departmentId', ParseUUIDPipe) id: string) {
    await this.service.deleteRecord({ id: id ?? '' });
  }
}

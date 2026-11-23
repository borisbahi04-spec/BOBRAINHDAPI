import {
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
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { FindManyOptions, FindOptionsWhere, Like } from 'typeorm';
import { CreateLabAgentDto } from 'src/core/dto/labagent/create-lab-agent.dto';
import { UpdateLabAgentDto } from 'src/core/dto/labagent/update-lab-agent.dto';
import { LabAgent } from 'src/core/entities/requester/lab-agent.entity';
import { LabAgentService } from 'src/core/services/requester/lab-agent.service';
import { ApiAuthJwtHeader } from 'src/modules/auth/decorators/api-auth-jwt-header.decorator';
import { ApiRequestIssuerHeader } from 'src/modules/auth/decorators/api-request-issuer-header.decorator';

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('labagent')
@Controller('labagent')
export class LabAgentController {
  constructor(private service: LabAgentService) {}

  /**
   * Liste paginée des agents labo.
   * `q` : recherche plein texte (matricule, nom, prénoms)
   * `active` : true | false (optionnel)
   */
  @ApiSearchQueryFilter()
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'active', required: false })
  @CustomApiPaginatedResponse(LabAgent)
  @Get()
  async findAll(@Query() query?: any): Promise<Paginated<LabAgent>> {
    const { q, active, ...rest } = query ?? {};
    const options: FindManyOptions<LabAgent> = buildFilterFromApiSearchParams(
      this.service.repository,
      rest as ApiSearchParamOptions,
    );

    const base: FindOptionsWhere<LabAgent> = {};
    if (active === 'true' || active === true) base.isActive = true;
    if (active === 'false' || active === false) base.isActive = false;

    const term = String(q ?? '').trim();
    if (term) {
      const like = Like(`%${term}%`);
      options.where = [
        { ...base, matricule: like },
        { ...base, lastName: like },
        { ...base, firstName: like },
      ];
    } else if (Object.keys(base).length) {
      options.where = base;
    }
    options.order = { lastName: 'ASC', firstName: 'ASC' };

    return this.service.readPaginatedListRecord(options);
  }

  @ApiSearchOneQueryFilter()
  @Get(':labAgentId')
  async findOne(@Param('labAgentId', ParseUUIDPipe) id: string) {
    return this.service.readOneRecord({ where: { id } });
  }

  @Post()
  async create(@Body() dto: CreateLabAgentDto) {
    const agent = await this.service.createRecord(dto);
    return this.service.readOneRecord({ where: { id: agent.id } });
  }

  @Patch(':labAgentId')
  async update(
    @Param('labAgentId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLabAgentDto,
  ) {
    await this.service.updateLabAgent(id, dto);
    return this.service.readOneRecord({ where: { id } });
  }

  @Delete(':labAgentId')
  async remove(@Param('labAgentId', ParseUUIDPipe) id: string) {
    return this.service.removeLabAgent(id);
  }
}

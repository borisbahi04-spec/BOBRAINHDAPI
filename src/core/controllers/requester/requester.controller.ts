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
  Res,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { RequesterPdfService } from 'src/core/services/requester/requester-pdf.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  AbilityActionEnum,
  AbilitySubjectEnum,
  RequesterStatusEnum,
} from 'src/core/definitions/enums';
import { CreateRequesterDto } from 'src/core/dto/requester/create-requester.dto';
import { UpdateRequesterDto } from 'src/core/dto/requester/update-requester.dto';
import { Requester } from 'src/core/entities/requester/requester.entity';
import { AuthUser } from 'src/core/entities/session/auth-user.entity';
import { RequesterService } from 'src/core/services/requester/requester.service';

import { ApiAuthJwtHeader } from 'src/modules/auth/decorators/api-auth-jwt-header.decorator';
import { ApiRequestIssuerHeader } from 'src/modules/auth/decorators/api-request-issuer-header.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { FindManyOptions, FindOptionsWhere, Raw } from 'typeorm';

/** Champs couverts par la recherche texte des demandes */
const TEXT_FILTER_FIELDS = ['reference', 'ticket', 'description', 'correction'];
/** Séparateur de la recherche multiple (ex : AY-00023|AY-00001) */
const MULTI_SEPARATOR = '|';
const MAX_TERMS = 30;

/**
 * Retire du paramètre `where` le terme de recherche texte s'il contient « | »
 * et renvoie la liste des termes (nettoyés, dédoublonnés).
 */
function extractMultiTerms(query: any): { query: any; terms: string[] } {
  if (!query?.where) return { query, terms: [] };
  let where: any[];
  try {
    where = typeof query.where === 'string' ? JSON.parse(query.where) : query.where;
  } catch {
    return { query, terms: [] };
  }
  if (!Array.isArray(where)) return { query, terms: [] };

  let terms: string[] = [];
  const rest = where.filter((p) => {
    const isText = p && !p.attribute && !p.type && typeof p.value === 'string';
    if (isText && p.value.includes(MULTI_SEPARATOR)) {
      terms = p.value
        .split(MULTI_SEPARATOR)
        .map((t: string) => t.trim())
        .filter(Boolean);
      return false;
    }
    return true;
  });
  terms = Array.from(new Set(terms)).slice(0, MAX_TERMS);
  return { query: { ...query, where: JSON.stringify(rest) }, terms };
}

/** (champ1 LIKE t1 OR champ2 LIKE t1 …) OR (champ1 LIKE t2 …) — valeurs paramétrées */
function multiTermCondition(terms: string[]): FindOptionsWhere<Requester> {
  const params: Record<string, string> = {};
  terms.forEach((t, i) => (params[`multiTerm${i}`] = `%${t}%`));
  return {
    reference: Raw((alias: string) => {
      const prefix = alias.split('.')[0];
      return (
        '(' +
        terms
          .map((_, i) =>
            TEXT_FILTER_FIELDS.map((f) => `${prefix}.${f} LIKE :multiTerm${i}`).join(' OR '),
          )
          .join(' OR ') +
        ')'
      );
    }, params),
  } as FindOptionsWhere<Requester>;
}

@ApiAuthJwtHeader()
@ApiRequestIssuerHeader()
@CustomApiErrorResponse()
@ApiTags('requester')
@Controller('requester')
export class RequesterController {
  constructor(
    private service: RequesterService,
    private pdfService: RequesterPdfService,
  ) {}

  /**
   * Get paginated requester list
   */
  @ApiSearchQueryFilter()
  @CustomApiPaginatedResponse(Requester)
  @Get()
  async findAll(
    @CurrentUser() authUser: AuthUser,
    @Query() query?: any,
  ): Promise<Paginated<Requester>> {
    // Permission check
    await authUser?.throwUnlessCan(
      AbilityActionEnum.read,
      AbilitySubjectEnum.Requester,
    );
    // Recherche multiple : « AY-00023|AY-00001 » => demandes contenant l'un OU l'autre terme.
    const { query: cleanQuery, terms } = extractMultiTerms(query);

    const options: FindManyOptions<Requester> = buildFilterFromApiSearchParams(
      this.service.repository,
      cleanQuery as ApiSearchParamOptions,
      {
        textFilterFields: TEXT_FILTER_FIELDS,
      },
    );

    if (terms.length) {
      const condition = multiTermCondition(terms);
      const current = options.where
        ? Array.isArray(options.where)
          ? options.where
          : [options.where]
        : [{}];
      options.where = current.map((w) => ({
        ...(w as object),
        ...condition,
      })) as FindOptionsWhere<Requester>[];
    }

    // Tri par défaut : plus récentes d'abord
    if (!options.order || Object.keys(options.order).length === 0) {
      options.order = { createdAt: 'DESC' };
    }

    // ✅ RÈGLE MÉTIER : une opératrice voit les demandes qu'elle a créées
    //    ET celles qui la concernent (créées par une collègue pour elle).
    if (authUser?.role?.isForOperator) {
      const scopes: FindOptionsWhere<Requester>[] = [
        { createdBy: { userId: authUser.userId } },
        { operatorId: authUser.userId },
      ];
      const current = options.where
        ? Array.isArray(options.where)
          ? options.where
          : [options.where]
        : [{}];
      // (A OR B) AND (scope1 OR scope2) => produit cartésien
      options.where = current.flatMap((w) =>
        scopes.map((scope) => ({ ...(w as object), ...scope })),
      ) as FindOptionsWhere<Requester>[];
    }

    return this.service.readPaginatedListRecord(options);
  }

  /**
   * Opératrices sélectionnables (rôle opérateur, actives)
   */
  @ApiQuery({ name: 'q', required: false })
  @Get('lookups/operators')
  async lookupOperators(@Query('q') q?: string, @Query('limit') limit?: number) {
    return this.service.searchOperators(q, limit);
  }

  /**
   * Agents labo sélectionnables (actifs par défaut)
   */
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'all', required: false })
  @Get('lookups/lab-agents')
  async lookupLabAgents(
    @Query('q') q?: string,
    @Query('all') all?: string,
    @Query('limit') limit?: number,
  ) {
    return this.service.searchLabAgents(q, all === 'true', limit);
  }

  /**
   * PDF de la demande, généré côté serveur (impression / téléchargement).
   * ?lang=fr|en  ?download=1 pour forcer le téléchargement
   */
  @ApiQuery({ name: 'lang', required: false })
  @ApiQuery({ name: 'download', required: false })
  @Get(':requesterId/pdf')
  async pdf(
    @CurrentUser() authUser: AuthUser,
    @Param('requesterId', ParseUUIDPipe) id: string,
    @Res() res: Response,
    @Query('lang') lang?: string,
    @Query('download') download?: string,
  ) {
    const requester = await this.service.repository.findOne({
      where: { id },
      relations: {
        requesttype: true,
        station: true,
        branch: true,
        labAgent: true,
        operator: true,
        createdBy: true,
        approvedBy: true,
        rejectedBy: true,
        treatedBy: true,
        closedBy: true,
        cancelledBy: true,
      },
    });
    if (!requester) throw new NotFoundException('Demande non trouvée');

    // Une opératrice n'imprime que ses demandes ou celles créées pour elle (ADR-0006)
    if (
      authUser?.role?.isForOperator &&
      requester.createdBy?.userId !== authUser.userId &&
      requester.operatorId !== authUser.userId
    ) {
      throw new ForbiddenException('Accès refusé');
    }

    const buffer = await this.pdfService.render(requester, {
      lang,
      printedBy: authUser?.username,
    });
    const filename = `DEMANDE-${requester.reference ?? id}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': String(buffer.length),
      'Content-Disposition': `${download === '1' ? 'attachment' : 'inline'}; filename="${filename}"`,
      'Cache-Control': 'no-store',
    });
    res.end(buffer);
  }

  /**
   * Get one requester by id
   */
  @ApiSearchOneQueryFilter()
  @Get(':requesterId')
  async findOne(
    @Param('requesterId', ParseUUIDPipe) id: string,
    @Query() query?: any,
  ): Promise<Requester> {
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
   * Create requester
   */
  @ApiSearchOneQueryFilter()
  @Post()
  async create(
    @Body() dto: CreateRequesterDto,
    @Query() query?: any,
  ): Promise<Requester> {
    const requester = await this.service.createRecord(dto);

    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );

    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: requester.id },
    });
  }

  /**
   * Update requester
   */
  @ApiSearchOneQueryFilter()
  @Patch(':requesterId')
  async update(
    @Param('requesterId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequesterDto,
    @Query() query?: any,
  ): Promise<Requester> {
    const requester = await this.service.updateRequester(id, dto);
    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );
    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: requester.id },
    });
  }

  /**
   * Update requester
   */
  @ApiSearchOneQueryFilter()
  @Post(':requesterId/statusupdate/:status')
  async changestatus(
    @Param('requesterId', ParseUUIDPipe) id: string,
    @Param('status') status: RequesterStatusEnum,
    @Query() query?: any,
  ): Promise<Requester> {
    const requester = await this.service.changeStatus({ id: id ?? '' }, status);
    const options = buildFilterFromApiSearchParams(
      this.service.repository,
      query as ApiSearchOneParamOptions,
    );
    
    return this.service.readOneRecord({
      ...options,
      where: { ...options?.where, id: requester.id },
    });
  }

  /**
   * Remove requester
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':requesterId')
  async remove(@Param('requesterId', ParseUUIDPipe) id: string) {
    await this.service.deleteRecord({ id: id ?? '' });
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedService, isUniqueConstraint } from '@app/typeorm';
import { AbstractService } from '../abstract.service';
import { RequestType } from 'src/core/entities/requester/request-type';
import { CreateRequestTypeDto } from 'src/core/dto/requesttype/create-request-type.dto';

@Injectable()
export class RequestTypeService extends AbstractService<RequestType> {
  public NOT_FOUND_MESSAGE = `Rôle non trouvé`;

  constructor(
    @InjectRepository(RequestType)
    private _repository: Repository<RequestType>,
    protected paginatedService: PaginatedService<RequestType>,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  get repository(): Repository<RequestType> {
    return this._repository;
  }

  async createRecord(dto: CreateRequestTypeDto) {
    // Check unique name
    if (dto.displayName) {
      await isUniqueConstraint(
        'displayName',
        RequestType,
        { displayName: dto.displayName },
        { message: `La requestType "${dto.displayName}" est déjà utilisé` },
      );
    }

    return await super.createRecord(dto);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedService } from '@app/typeorm';
import { REQUEST } from '@nestjs/core';
import { Roaster } from 'src/core_factory/entities/roaster/roaster.entity';
import { AbstractService } from 'src/core/services/abstract.service';
import { CreateRoasterDto } from 'src/core_factory/dto/roaster/create-roaster.dto';
import { UpdateRoasterDto } from 'src/core_factory/dto/roaster/update-roaster.dto';

@Injectable()
export class RoasterService extends AbstractService<Roaster> {
  public NOT_FOUND_MESSAGE = `Client non trouvé`;

  constructor(
    @InjectRepository(Roaster)
    private _repository: Repository<Roaster>,
    protected paginatedService: PaginatedService<Roaster>,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  async createRecord(dto: CreateRoasterDto): Promise<Roaster> {
    return super.createRecord({ ...dto });
  }

  async updateRecord(
    optionsWhere: FindOptionsWhere<Roaster>,
    dto: UpdateRoasterDto,
  ) {
    return await super.updateRecord(optionsWhere, {
      ...dto,
    });
  }

  get repository(): Repository<Roaster> {
    return this._repository;
  }
}

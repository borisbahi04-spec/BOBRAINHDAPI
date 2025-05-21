import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedService } from '@app/typeorm';
import { REQUEST } from '@nestjs/core';
import { AbstractService } from 'src/core/services/abstract.service';
import { UpdateDirectSteamDto } from 'src/core_factory/dto/setting/directsteam/update-direct-steam.dto';
import { CreateDirectSteamDto } from 'src/core_factory/dto/setting/directsteam/create-direct-steam.dto';
import { DirectSteam } from 'src/core_factory/entities/setting/direct-steam.entity';

@Injectable()
export class DirectSteamService extends AbstractService<DirectSteam> {
  public NOT_FOUND_MESSAGE = `Client non trouvé`;

  constructor(
    @InjectRepository(DirectSteam)
    private _repository: Repository<DirectSteam>,
    protected paginatedService: PaginatedService<DirectSteam>,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  async createRecord(
    dto: CreateDirectSteamDto,
  ): Promise<DirectSteam> {
    return super.createRecord({ ...dto });
  }

  async updateRecord(
    optionsWhere: FindOptionsWhere<DirectSteam>,
    dto: UpdateDirectSteamDto,
  ) {
    return await super.updateRecord(optionsWhere, {
      ...dto,
    });
  }

  get repository(): Repository<DirectSteam> {
    return this._repository;
  }
}

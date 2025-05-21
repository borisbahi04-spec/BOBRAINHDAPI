import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedService } from '@app/typeorm';
import { REQUEST } from '@nestjs/core';
import { AbstractService } from 'src/core/services/abstract.service';
import { CoocleaSpeed } from 'src/core_factory/entities/setting/cooclea-speed.entity';
import { UpdateCoocleaSpeedDto } from 'src/core_factory/dto/setting/coocleaspeed/update-cooclea-speed.dto';
import { CreateCoocleaSpeedDto } from 'src/core_factory/dto/setting/coocleaspeed/create-cooclea-speed.dto';

@Injectable()
export class CoocleaSpeedService extends AbstractService<CoocleaSpeed> {
  public NOT_FOUND_MESSAGE = `Client non trouvé`;

  constructor(
    @InjectRepository(CoocleaSpeed)
    private _repository: Repository<CoocleaSpeed>,
    protected paginatedService: PaginatedService<CoocleaSpeed>,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  async createRecord(dto: CreateCoocleaSpeedDto): Promise<CoocleaSpeed> {
    return super.createRecord({ ...dto });
  }

  async updateRecord(
    optionsWhere: FindOptionsWhere<CoocleaSpeed>,
    dto: UpdateCoocleaSpeedDto,
  ) {
    return await super.updateRecord(optionsWhere, {
      ...dto,
    });
  }

  get repository(): Repository<CoocleaSpeed> {
    return this._repository;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedService } from '@app/typeorm';
import { REQUEST } from '@nestjs/core';
import { AbstractService } from 'src/core/services/abstract.service';
import { CashewStage } from 'src/core_factory/entities/setting/cashew-stage.entity';
import { UpdateCashewStageDto } from 'src/core_factory/dto/setting/cashewstage/update-cashew-stage.dto';
import { CreateCashewStageDto } from 'src/core_factory/dto/setting/cashewstage/create-cashew-stage.dto';

@Injectable()
export class CashewStageService extends AbstractService<CashewStage> {
  public NOT_FOUND_MESSAGE = `Client non trouvé`;

  constructor(
    @InjectRepository(CashewStage)
    private _repository: Repository<CashewStage>,
    protected paginatedService: PaginatedService<CashewStage>,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  async createRecord(dto: CreateCashewStageDto): Promise<CashewStage> {
    return super.createRecord({ ...dto });
  }

  async updateRecord(
    optionsWhere: FindOptionsWhere<CashewStage>,
    dto: UpdateCashewStageDto,
  ) {
    return await super.updateRecord(optionsWhere, {
      ...dto,
    });
  }

  get repository(): Repository<CashewStage> {
    return this._repository;
  }
}

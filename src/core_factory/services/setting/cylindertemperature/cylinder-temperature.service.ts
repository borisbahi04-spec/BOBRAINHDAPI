import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedService } from '@app/typeorm';
import { REQUEST } from '@nestjs/core';
import { AbstractService } from 'src/core/services/abstract.service';
import { UpdateCylinderTemperatureDto } from 'src/core_factory/dto/setting/cylindertemperature/update-cylinder-temperature.dto';
import { CreateCylinderTemperatureDto } from 'src/core_factory/dto/setting/cylindertemperature/create-cylinder-temperature.dto';
import { CylinderTemperature } from 'src/core_factory/entities/setting/cylinder-temperature.entity';

@Injectable()
export class CylinderTemperatureService extends AbstractService<CylinderTemperature> {
  public NOT_FOUND_MESSAGE = `Client non trouvé`;

  constructor(
    @InjectRepository(CylinderTemperature)
    private _repository: Repository<CylinderTemperature>,
    protected paginatedService: PaginatedService<CylinderTemperature>,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  async createRecord(
    dto: CreateCylinderTemperatureDto,
  ): Promise<CylinderTemperature> {
    return super.createRecord({ ...dto });
  }

  async updateRecord(
    optionsWhere: FindOptionsWhere<CylinderTemperature>,
    dto: UpdateCylinderTemperatureDto,
  ) {
    return await super.updateRecord(optionsWhere, {
      ...dto,
    });
  }

  get repository(): Repository<CylinderTemperature> {
    return this._repository;
  }
}

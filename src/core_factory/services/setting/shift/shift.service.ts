import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedService } from '@app/typeorm';
import { REQUEST } from '@nestjs/core';
import { AbstractService } from 'src/core/services/abstract.service';
import { Shift } from 'src/core_factory/entities/setting/shift.entity';
import { UpdateShiftDto } from 'src/core_factory/dto/setting/shift/update-shift.dto';
import { CreateShiftDto } from 'src/core_factory/dto/setting/shift/create-shift.dto';

@Injectable()
export class ShiftService extends AbstractService<Shift> {
  public NOT_FOUND_MESSAGE = `Client non trouvé`;

  constructor(
    @InjectRepository(Shift)
    private _repository: Repository<Shift>,
    protected paginatedService: PaginatedService<Shift>,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  async createRecord(dto: CreateShiftDto): Promise<Shift> {
    return super.createRecord({ ...dto });
  }

  async updateRecord(
    optionsWhere: FindOptionsWhere<Shift>,
    dto: UpdateShiftDto,
  ) {
    return await super.updateRecord(optionsWhere, {
      ...dto,
    });
  }

  get repository(): Repository<Shift> {
    return this._repository;
  }
}

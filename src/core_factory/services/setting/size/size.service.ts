import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedService } from '@app/typeorm';
import { REQUEST } from '@nestjs/core';
import { AbstractService } from 'src/core/services/abstract.service';
import { Size } from 'src/core_factory/entities/setting/size.entity';
import { UpdateSizeDto } from 'src/core_factory/dto/setting/size/update-size.dto';
import { CreateSizeDto } from 'src/core_factory/dto/setting/size/create-size.dto';

@Injectable()
export class SizeService extends AbstractService<Size> {
  public NOT_FOUND_MESSAGE = `Client non trouvé`;

  constructor(
    @InjectRepository(Size)
    private _repository: Repository<Size>,
    protected paginatedService: PaginatedService<Size>,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  async createRecord(dto: CreateSizeDto): Promise<Size> {
    return super.createRecord({ ...dto });
  }

  async updateRecord(optionsWhere: FindOptionsWhere<Size>, dto: UpdateSizeDto) {
    return await super.updateRecord(optionsWhere, {
      ...dto,
    });
  }

  get repository(): Repository<Size> {
    return this._repository;
  }
}

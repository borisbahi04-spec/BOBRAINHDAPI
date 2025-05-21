import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedService } from '@app/typeorm';
import { REQUEST } from '@nestjs/core';
import { AbstractService } from 'src/core/services/abstract.service';
import { Stack } from 'src/core_factory/entities/roaster/stack.entity';
import { UpdateStackDto } from 'src/core_factory/dto/stack/update-stack.dto';
import { CreateStackDto } from 'src/core_factory/dto/stack/create-stack.dto';

@Injectable()
export class StackService extends AbstractService<Stack> {
  public NOT_FOUND_MESSAGE = `Stack non trouvé`;

  constructor(
    @InjectRepository(Stack)
    private _repository: Repository<Stack>,
    protected paginatedService: PaginatedService<Stack>,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  async createRecord(dto: CreateStackDto): Promise<Stack> {
    return super.createRecord({ ...dto });
  }

  async updateRecord(
    optionsWhere: FindOptionsWhere<Stack>,
    dto: UpdateStackDto,
  ) {
    return await super.updateRecord(optionsWhere, {
      ...dto,
    });
  }

  get repository(): Repository<Stack> {
    return this._repository;
  }
}

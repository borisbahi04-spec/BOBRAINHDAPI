import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../entities/user/department.entity';
import { PaginatedService, isUniqueConstraint } from '@app/typeorm';
import { AbstractService } from '../abstract.service';
import { CreateDepartmentDto } from 'src/core/dto/user/create-department.dto';

@Injectable()
export class DepartmentService extends AbstractService<Department> {
  public NOT_FOUND_MESSAGE = `Rôle non trouvé`;

  constructor(
    @InjectRepository(Department)
    private _repository: Repository<Department>,
    protected paginatedService: PaginatedService<Department>,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  get repository(): Repository<Department> {
    return this._repository;
  }

  async createRecord(dto: CreateDepartmentDto) {
    // Check unique name
    if (dto.displayName) {
      await isUniqueConstraint(
        'displayName',
        Department,
        { displayName: dto.displayName },
        { message: `Le code "${dto.displayName}" est déjà utilisé` },
      );
    }

    return await super.createRecord(dto);
  }
}

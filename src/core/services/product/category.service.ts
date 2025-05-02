import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../../entities/product/category.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  PaginatedService,
  isUniqueConstraint,
  isUniqueConstraintUpdate,
} from '@app/typeorm';
import { REQUEST } from '@nestjs/core';
import { AbstractService } from '../abstract.service';
import { UpdateCategoryDto } from 'src/core/dto/product/update-category.dto';

@Injectable()
export class CategoryService extends AbstractService<Category> {
  public NOT_FOUND_MESSAGE = `Marque non trouvée`;

  constructor(
    @InjectRepository(Category)
    private _repository: Repository<Category>,
    protected paginatedService: PaginatedService<Category>,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  async createRecord(dto: any): Promise<Category> {
    // Check unique displayName
    if (dto.displayName) {
      await isUniqueConstraint(
        'displayName',
        Category,
        { displayName: dto.displayName },
        {
          message: `Le nom "${dto.displayName}" est déjà utilisée`,
        },
      );
    }
    return await super.createRecord({ ...dto });
  }

  async updateRecord(
    optionsWhere: FindOptionsWhere<Category>,
    dto: UpdateCategoryDto,
  ) {
    // Check unique displayName
    if (dto.displayName) {
      await isUniqueConstraintUpdate(
        'displayName',
        Category,
        { displayName: dto.displayName, id: optionsWhere.id },
        { message: `Le nom "${dto.displayName}" est déjà utilisé` },
      );
    }

    return await super.updateRecord(optionsWhere, {
      ...dto,
    });
  }

  get repository(): Repository<Category> {
    return this._repository;
  }
}

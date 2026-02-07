import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedService, isUniqueConstraint } from '@app/typeorm';
import { AbstractService } from '../abstract.service';
import { Station } from 'src/core/entities/station/station';
import { CreateStationDto } from 'src/core/dto/station/create-station.dto';

@Injectable()
export class StationService extends AbstractService<Station> {
  public NOT_FOUND_MESSAGE = `Rôle non trouvé`;

  constructor(
    @InjectRepository(Station)
    private _repository: Repository<Station>,
    protected paginatedService: PaginatedService<Station>,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  get repository(): Repository<Station> {
    return this._repository;
  }

  async createRecord(dto: CreateStationDto) {
    // Check unique name
    if (dto.displayName) {
      await isUniqueConstraint(
        'displayName',
        Station,
        { displayName: dto.displayName },
        { message: `La station "${dto.displayName}" est déjà utilisée` },
      );
    }

    return await super.createRecord(dto);
  }
}

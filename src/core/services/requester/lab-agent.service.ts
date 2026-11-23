import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { PaginatedService } from '@app/typeorm';
import { AbstractService } from '../abstract.service';
import { LabAgent } from 'src/core/entities/requester/lab-agent.entity';
import { CreateLabAgentDto } from 'src/core/dto/labagent/create-lab-agent.dto';
import { UpdateLabAgentDto } from 'src/core/dto/labagent/update-lab-agent.dto';

@Injectable()
export class LabAgentService extends AbstractService<LabAgent> {
  public NOT_FOUND_MESSAGE = `Agent labo non trouvé`;

  constructor(
    @InjectRepository(LabAgent)
    private _repository: Repository<LabAgent>,
    protected paginatedService: PaginatedService<LabAgent>,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  get repository(): Repository<LabAgent> {
    return this._repository;
  }

  private normalize<T extends Partial<CreateLabAgentDto>>(dto: T): T {
    return {
      ...dto,
      ...(dto.matricule !== undefined && {
        matricule: dto.matricule.trim().toUpperCase(),
      }),
      ...(dto.lastName !== undefined && {
        lastName: dto.lastName.trim().toUpperCase(),
      }),
      ...(dto.firstName !== undefined && { firstName: dto.firstName?.trim() }),
      ...(dto.phoneNumber !== undefined && {
        phoneNumber: dto.phoneNumber?.trim(),
      }),
    };
  }

  private async assertUniqueMatricule(matricule: string, excludeId?: string) {
    const where: FindOptionsWhere<LabAgent> = { matricule };
    if (excludeId) where.id = Not(excludeId);
    const exists = await this._repository.exist({ where, withDeleted: true });
    if (exists) {
      throw new BadRequestException(
        `Le matricule "${matricule}" est déjà attribué à un autre agent`,
      );
    }
  }

  async createRecord(dto: CreateLabAgentDto) {
    const data = this.normalize(dto);
    await this.assertUniqueMatricule(data.matricule);
    return await super.createRecord(data);
  }

  async updateLabAgent(id: string, dto: UpdateLabAgentDto) {
    const data = this.normalize(dto);
    if (data.matricule) await this.assertUniqueMatricule(data.matricule, id);
    return await super.updateRecord({ id }, data);
  }

  /** Suppression : désactivation si l'agent est déjà lié à des demandes. */
  async removeLabAgent(id: string) {
    const agent = await this._repository.findOne({
      where: { id },
      relations: { requesters: true },
    });
    if (!agent) throw new BadRequestException(this.NOT_FOUND_MESSAGE);
    if (agent.requesters?.length) {
      agent.isActive = false;
      await this._repository.save(agent);
      return { deactivated: true };
    }
    await super.deleteRecord({ id });
    return { deleted: true };
  }
}

import { PaginatedService } from '@app/typeorm';
import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { AbstractService } from '../abstract.service';
import { Flash } from 'src/core/entities/flash/flash.entity';
import { CreateFlashDto } from 'src/core/dto/flash/create-flash.dto';
import { Socket } from 'socket.io-client';

@Injectable()
//implements OnModuleInit
export class FlashService extends AbstractService<Flash> {
  public NOT_FOUND_MESSAGE = `Flash non trouvée`;
  private socket: Socket;
  private authUser: any;

  constructor(
    @InjectRepository(Flash) private _repository: Repository<Flash>,
    protected paginatedService: PaginatedService<Flash>,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  private async initAuthUser() {
    this.authUser = await super.checkSessionBranch();
  }

  /*async onModuleInit() {
    this.socket = io('ws://localhost:3335', {
      transports: ['websocket'],
      auth: { token: await this.initAuthUser() },
      reconnection: true,
      reconnectionAttempts: Infinity, // ♻️ essaie indéfiniment
      reconnectionDelay: 2000, // ⏳ délai avant nouvelle tentative
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connecté au WebSocket ERP');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Déconnecté du WebSocket ERP');
    });

    this.socket.on('connect_error', (err) => {
      console.error('⚠️ Erreur de connexion WebSocket ERP :', err.message);
    });
  }*/

  get repository(): Repository<Flash> {
    return this._repository;
  }

  sendToERP(data: any) {
    this.socket.emit('forwarded-message', { status: 'success', data });
  }

  async readOneWeight(options?: any) {
    const entity = await this.repository.findOneBy(options);
    if (!entity) {
      throw new BadRequestException(this.NOT_FOUND_MESSAGE);
    }
    if (!entity.frame) {
      throw new BadRequestException(
        `Aucun poids disponible pour la station ${entity.station}`,
      );
    }
    const newData = {
      weight: entity.sentWeight,
      trame: entity.frame,
      date: entity.createdAt,
      ...entity,
    };

    return newData as any;
  }

  async createRecord(dto: CreateFlashDto) {
    return await super.createRecord(dto);
  }

  async create(dto: CreateFlashDto): Promise<Flash> {
    const flash = this._repository.create(dto);
    const saved = await this._repository.save(flash);
    return saved;
  }

  async getFilterByAuthUserFlash(): Promise<FindOptionsWhere<Flash>> {
    const authUser = await super.checkSessionBranch();
    if (!(await authUser.can('manage', 'all'))) {
      return {
        id: authUser.targetBranchId,
      };
    }

    return {};
  }
}

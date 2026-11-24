/* eslint-disable prettier/prettier */
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { PaginatedService } from '@app/typeorm';
import { AbstractService } from '../abstract.service';
import { CreateRequesterDto } from 'src/core/dto/requester/create-requester.dto';
import { UpdateRequesterDto } from 'src/core/dto/requester/update-requester.dto';
import { REQUEST_AUTH_USER_KEY } from 'src/modules/auth/definitions/constants';
import { AuthUser } from 'src/core/entities/session/auth-user.entity';
import { PriorityEnum, RequesterStatusEnum } from 'src/core/definitions/enums';
import { Requester } from 'src/core/entities/requester/requester.entity';
import { LabAgent } from 'src/core/entities/requester/lab-agent.entity';
import { User } from 'src/core/entities/user/user.entity';
import { MailerSenderService } from 'src/mailer/services/mailer.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { Logger4jsService } from '@app/nestjs';
import { MailOptions } from 'src/core/definitions/interfaces';
import { MAIL_ACTION_CONFIG } from 'src/core/definitions/constants';

type DateFields = 'approvedAt' | 'rejectedAt' | 'cancelledAt' | 'closedAt' | 'treatedAt';
type UserFields = 'approvedById' | 'rejectedById' | 'cancelledById' | 'treatedById' | 'closedById';

const STATUS_META: Partial<Record<RequesterStatusEnum, { dateField: DateFields; userField: UserFields }>> = {
  [RequesterStatusEnum.Approved]: { dateField: 'approvedAt', userField: 'approvedById' },
  [RequesterStatusEnum.Rejected]: { dateField: 'rejectedAt', userField: 'rejectedById' },
  [RequesterStatusEnum.Cancelled]: { dateField: 'cancelledAt', userField: 'cancelledById' },
  [RequesterStatusEnum.Closed]: { dateField: 'closedAt', userField: 'closedById' },
  [RequesterStatusEnum.Treated]: { dateField: 'treatedAt', userField: 'treatedById' },
};

export const REQUESTER_TRANSITIONS: Record<RequesterStatusEnum, RequesterStatusEnum[]> = {
  [RequesterStatusEnum.Open]: [
    RequesterStatusEnum.Approved,
    RequesterStatusEnum.Rejected,
    RequesterStatusEnum.Cancelled,
  ],
  [RequesterStatusEnum.Approved]: [RequesterStatusEnum.Treated, RequesterStatusEnum.Cancelled],
  [RequesterStatusEnum.Treated]: [RequesterStatusEnum.Closed],
  [RequesterStatusEnum.Rejected]: [],
  [RequesterStatusEnum.Cancelled]: [],
  [RequesterStatusEnum.Closed]: [],
};

const DETAIL_RELATIONS = {
  requesttype: true,
  station: true,
  branch: true,
  labAgent: true,
  operator: true,
  createdBy: true,
  approvedBy: true,
  rejectedBy: true,
  treatedBy: true,
  closedBy: true,
  cancelledBy: true,
};

@Injectable()
export class RequesterService extends AbstractService<Requester> {
  public NOT_FOUND_MESSAGE = `Demande non trouvée`;

  constructor(
    @InjectRepository(Requester)
    private _repository: Repository<Requester>,
    protected paginatedService: PaginatedService<Requester>,
    protected mailerSenderService: MailerSenderService,
    protected userService: UserService,
    protected configService: ConfigService,
    protected logger: Logger4jsService,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  get repository(): Repository<Requester> {
    return this._repository;
  }

  private get authUser(): AuthUser {
    return this.request[REQUEST_AUTH_USER_KEY] as AuthUser;
  }

  private get labAgentRepository(): Repository<LabAgent> {
    return this._repository.manager.getRepository(LabAgent);
  }

  private get userRepository(): Repository<User> {
    return this._repository.manager.getRepository(User);
  }

  private getBaseUrl(): string {
    const protocol = this.request.headers['x-forwarded-proto'] ?? this.request.protocol;
    const host = this.request.headers['x-forwarded-host'] ?? this.request.get('host');
    return `${protocol}://${host}`;
  }

  /* ----------------------------------------------------------------------- */
  /*                               NORMALISATION                             */
  /* ----------------------------------------------------------------------- */

  /** "ay-0001 ,az-1234" -> "AY-0001, AZ-1234" (sans doublons) */
  static normalizeTicket(ticket: string): string {
    const parts = String(ticket ?? '')
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);
    return Array.from(new Set(parts)).join(', ');
  }

  private async assertLabAgent(labAgentId: string, currentId?: string) {
    const agent = await this.labAgentRepository.findOneBy({ id: labAgentId });
    if (!agent) throw new BadRequestException(`Agent labo introuvable`);
    // un agent désactivé reste accepté s'il était déjà rattaché à la demande
    if (!agent.isActive && agent.id !== currentId) {
      throw new BadRequestException(`L'agent labo "${agent.displayName}" est désactivé`);
    }
  }

  private async assertOperator(operatorId: string) {
    // Une opératrice ne peut désigner qu'elle-même
    const authUser = this.authUser;
    if (authUser?.role?.isForOperator && operatorId !== authUser.userId) {
      throw new BadRequestException(`Vous ne pouvez désigner que vous-même comme opératrice`);
    }
    const operator = await this.userRepository.findOne({
      where: { id: operatorId },
      relations: { role: true },
    });
    if (!operator || !operator.isActive) {
      throw new BadRequestException(`Opératrice introuvable ou inactive`);
    }
    if (!operator.role?.isForOperator) {
      throw new BadRequestException(
        `L'utilisateur "${operator.username}" n'a pas un rôle d'opératrice`,
      );
    }
  }

  /**
   * Opératrice (facultative) :
   *  - champ absent  -> l'utilisatrice connectée si son rôle est opérateur
   *  - null / vide   -> aucune opératrice
   */
  private resolveOperatorId(operatorId?: string | null): string | null {
    if (operatorId) return operatorId;
    if (operatorId === undefined && this.authUser?.role?.isForOperator) return this.authUser.userId;
    return null;
  }

  /* ----------------------------------------------------------------------- */
  /*                                   CRUD                                  */
  /* ----------------------------------------------------------------------- */

  async createRecord(dto: CreateRequesterDto): Promise<Requester> {
    const authUser = this.authUser;
    const operatorId = this.resolveOperatorId(dto.operatorId);

    if (dto.labAgentId) await this.assertLabAgent(dto.labAgentId);
    if (operatorId) await this.assertOperator(operatorId);

    const requester = this._repository.create({
      ticket: RequesterService.normalizeTicket(dto.ticket),
      priority: dto.priority ?? PriorityEnum.Normal,
      stationId: dto.stationId,
      requesttypeId: dto.requesttypeId,
      labAgentId: dto.labAgentId || null,
      operatorId,
      description: dto.description.trim(),
      correction: dto.correction.trim(),
      status: RequesterStatusEnum.Open,
      branchId: authUser?.branchId,
    });

    const saved = await super.createRecord(requester);
    await this.notify(saved.id, RequesterStatusEnum.Open);
    return saved;
  }

  async updateRequester(id: string, dto: UpdateRequesterDto): Promise<Requester> {
    const entity = await this._repository.findOneBy({ id });
    if (!entity) throw new BadRequestException(this.NOT_FOUND_MESSAGE);

    if (entity.status !== RequesterStatusEnum.Open) {
      throw new BadRequestException(
        `Seules les demandes au statut "Open" peuvent être modifiées (statut actuel : ${entity.status})`,
      );
    }

    if (dto.labAgentId) await this.assertLabAgent(dto.labAgentId, entity.labAgentId);
    // opératrice inchangée : pas de contrôle (demande existante)
    if (dto.operatorId && dto.operatorId !== entity.operatorId) await this.assertOperator(dto.operatorId);

    const data: Partial<Requester> = {
      ...(dto.ticket !== undefined && { ticket: RequesterService.normalizeTicket(dto.ticket) }),
      ...(dto.priority !== undefined && { priority: dto.priority }),
      ...(dto.stationId !== undefined && { stationId: dto.stationId }),
      ...(dto.requesttypeId !== undefined && { requesttypeId: dto.requesttypeId }),
      // null / '' => on retire l'agent ou l'opératrice (champs facultatifs)
      ...(dto.labAgentId !== undefined && { labAgentId: dto.labAgentId || null }),
      ...(dto.operatorId !== undefined && { operatorId: dto.operatorId || null }),
      ...(dto.description !== undefined && { description: dto.description.trim() }),
      ...(dto.correction !== undefined && { correction: dto.correction.trim() }),
    };

    return super.updateRecord({ id }, data);
  }

  async changeStatus(optionsWhere: FindOptionsWhere<Requester>, toStatus: RequesterStatusEnum) {
    if (!Object.values(RequesterStatusEnum).includes(toStatus)) {
      throw new BadRequestException(`Statut inconnu : ${toStatus}`);
    }

    const entity = await this.repository.findOneBy(optionsWhere);
    if (!entity) throw new BadRequestException(this.NOT_FOUND_MESSAGE);

    const fromStatus = entity.status as RequesterStatusEnum;
    if (fromStatus === toStatus) {
      throw new BadRequestException(`Le ticket est déjà au statut ${toStatus}`);
    }

    const allowed = REQUESTER_TRANSITIONS[fromStatus] ?? [];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(`Transition interdite : ${fromStatus} → ${toStatus}`);
    }

    const meta = STATUS_META[toStatus];
    if (meta) {
      (entity as any)[meta.dateField] = new Date();
      (entity as any)[meta.userField] = this.authUser?.id;
    }
    entity.status = toStatus;

    // 1. on enregistre d'abord, 2. on notifie avec les données à jour
    const saved = await this.repository.save(entity);
    await this.notify(saved.id, toStatus);
    return saved;
  }

  /* ----------------------------------------------------------------------- */
  /*                                 LOOKUPS                                 */
  /* ----------------------------------------------------------------------- */

  /** Opératrices actives (rôle isForOperator) — pour le formulaire et les filtres */
  async searchOperators(q?: string, limit = 20) {
    const term = String(q ?? '').trim();
    const base: FindOptionsWhere<User> = { isActive: true, role: { isForOperator: true } };
    // Une opératrice ne voit qu'elle-même dans la liste
    if (this.authUser?.role?.isForOperator) base.id = this.authUser.userId;
    const where: FindOptionsWhere<User>[] = term
      ? [
          { ...base, username: Like(`%${term}%`) },
          { ...base, firstName: Like(`%${term}%`) },
          { ...base, lastName: Like(`%${term}%`) },
        ]
      : [base];

    const users = await this.userRepository.find({
      where,
      relations: { role: true },
      order: { lastName: 'ASC', firstName: 'ASC' },
      take: Math.min(Number(limit) || 20, 100),
    });

    return users.map((u) => ({
      id: u.id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      displayName: [u.lastName, u.firstName].filter(Boolean).join(' ') || u.username,
    }));
  }

  /** Agents labo (actifs par défaut) */
  async searchLabAgents(q?: string, includeInactive = false, limit = 20) {
    const term = String(q ?? '').trim();
    const base: FindOptionsWhere<LabAgent> = includeInactive ? {} : { isActive: true };
    const where: FindOptionsWhere<LabAgent>[] = term
      ? [
          { ...base, matricule: Like(`%${term}%`) },
          { ...base, lastName: Like(`%${term}%`) },
          { ...base, firstName: Like(`%${term}%`) },
        ]
      : [base];

    return this.labAgentRepository.find({
      where,
      order: { lastName: 'ASC', firstName: 'ASC' },
      take: Math.min(Number(limit) || 20, 100),
    });
  }

  /* ----------------------------------------------------------------------- */
  /*                                   MAIL                                  */
  /* ----------------------------------------------------------------------- */

  private async notify(id: string, status: RequesterStatusEnum) {
    const mailConfig = MAIL_ACTION_CONFIG[status];
    if (!mailConfig) return;
    try {
      const recipients = await this.userService.getMailRecipients();
      if (!recipients.length) return;
      const requester = await this.readOneById(id);
      await this.sendMail({
        recipients,
        subject: requester?.reference ? `${mailConfig.subject} - ${requester.reference}` : mailConfig.subject,
        template: mailConfig.template,
        payload: this.buildMailPayload(requester),
      });
    } catch (error) {
      // l'échec d'envoi d'un mail ne doit jamais bloquer la demande
      this.logger?.error?.(`[RequesterService] mail error: ${error?.message ?? error}`);
    }
  }

  private formatDate(date?: Date | string | null): string {
    return date ? new Date(date).toLocaleString('fr-FR') : '';
  }

  /** Libellés / couleurs utilisés par les templates e-mail */
  private static readonly MAIL_STATUS_UI: Record<string, { label: string; color: string; bg: string; intro: string; action: string }> = {
    Open: { label: 'nouvelle', color: '#174E26', bg: '#EEF5EF', intro: "Une nouvelle demande d'intervention a été enregistrée.", action: 'Créée par' },
    Approved: { label: 'approuvée', color: '#236A36', bg: '#EEF5EF', intro: 'La demande ci-dessous a été approuvée et peut être traitée.', action: 'Approuvée par' },
    Treated: { label: 'traitée', color: '#5C7F2A', bg: '#F3F9EA', intro: 'La correction demandée a été réalisée.', action: 'Traitée par' },
    Closed: { label: 'clôturée', color: '#374151', bg: '#F3F4F6', intro: 'La demande ci-dessous est désormais clôturée.', action: 'Clôturée par' },
    Rejected: { label: 'rejetée', color: '#B91C1C', bg: '#FEF2F2', intro: "La demande ci-dessous a été rejetée.", action: 'Rejetée par' },
    Cancelled: { label: 'annulée', color: '#A86A0B', bg: '#FEF6E7', intro: 'La demande ci-dessous a été annulée.', action: 'Annulée par' },
  };

  private static readonly MAIL_PRIORITY_UI: Record<string, { label: string; color: string; bg: string }> = {
    Normal: { label: 'Normale', color: '#4B5563', bg: '#F3F4F6' },
    Important: { label: 'Importante', color: '#A86A0B', bg: '#FEF6E7' },
    Urgent: { label: 'Urgente', color: '#B91C1C', bg: '#FEF2F2' },
  };

  private buildMailPayload(r: Requester) {
    const st = RequesterService.MAIL_STATUS_UI[r.status] ?? RequesterService.MAIL_STATUS_UI.Open;
    const pr = RequesterService.MAIL_PRIORITY_UI[r.priority] ?? RequesterService.MAIL_PRIORITY_UI.Normal;
    const actionMap: Record<string, [any, any]> = {
      Open: [r.createdBy, r.createdAt],
      Approved: [r.approvedBy, r.approvedAt],
      Treated: [r.treatedBy, r.treatedAt],
      Closed: [r.closedBy, r.closedAt],
      Rejected: [r.rejectedBy, r.rejectedAt],
      Cancelled: [r.cancelledBy, r.cancelledAt],
    };
    const [actor, actionDate] = actionMap[r.status] ?? actionMap.Open;
    const operator = r.operator
      ? [r.operator.lastName, r.operator.firstName].filter(Boolean).join(' ') || r.operator.username
      : '';
    return {
      requesterName: r.createdBy?.userData?.username ?? r.createdBy?.username ?? '',
      reference: r.reference,
      ticket: r.ticket,
      status: r.status,
      description: r.description,
      correction: r.correction,
      labAgent: r.labAgent ? `${r.labAgent.displayName} (${r.labAgent.matricule})` : '',
      operator,
      priority: r.priority,
      requestType: r.requesttype?.displayName,
      station: r.station?.displayName,
      branch: r.branch?.displayName,
      closedBy: r.closedBy?.username,
      closedAt: this.formatDate(r.closedAt),
      cancelledBy: r.cancelledBy?.username,
      cancelledAt: this.formatDate(r.cancelledAt),
      treatedBy: r.treatedBy?.username,
      treatedAt: this.formatDate(r.treatedAt),
      approvedBy: r.approvedBy?.username,
      approvedAt: this.formatDate(r.approvedAt),
      rejectedBy: r.rejectedBy?.username,
      rejectedAt: this.formatDate(r.rejectedAt),
      createdBy: r.createdBy?.username,
      createdAt: this.formatDate(r.createdAt),
      url: `${this.getBaseUrl()}/requester/preview/${r.id}`,
      year: new Date().getFullYear(),
      statusLabel: st.label,
      statusColor: st.color,
      statusBg: st.bg,
      statusIntro: st.intro,
      actionLabel: st.action,
      actionBy: actor?.userData?.username ?? actor?.username ?? '',
      actionAt: this.formatDate(actionDate),
      priorityLabel: pr.label,
      priorityColor: pr.color,
      priorityBg: pr.bg,
      isUrgent: r.priority === 'Urgent',
    };
  }

  private async sendMail(options: MailOptions): Promise<void> {
    await this.mailerSenderService.sendEmails(
      options.recipients,
      options.subject,
      options.template,
      options.payload,
    );
  }

  private async readOneById(id: string): Promise<Requester> {
    return this.repository.findOne({ where: { id }, relations: DETAIL_RELATIONS });
  }
}

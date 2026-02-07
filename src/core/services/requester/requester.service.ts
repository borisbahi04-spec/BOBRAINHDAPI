/* eslint-disable prettier/prettier */
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { PaginatedService } from '@app/typeorm';
import { AbstractService } from '../abstract.service';
import { CreateRequesterDto } from 'src/core/dto/requester/create-requester.dto';
import { REQUEST_AUTH_USER_KEY } from 'src/modules/auth/definitions/constants';
import { AuthUser } from 'src/core/entities/session/auth-user.entity';
import { RequesterStatusEnum } from 'src/core/definitions/enums';
import { Requester } from 'src/core/entities/requester/requester.entity';
import { MailerSenderService } from 'src/mailer/services/mailer.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { Logger4jsService } from '@app/nestjs';
import { MailOptions } from 'src/core/definitions/interfaces';
import { MAIL_ACTION_CONFIG } from 'src/core/definitions/constants';


type DateFields =
  | 'approvedAt'
  | 'rejectedAt'
  | 'cancelledAt'
  | 'closedAt'
  | 'treatedAt';

type UserFields =
  | 'approvedById'
  | 'rejectedById'
  | 'cancelledById'
  | 'treatedById'
  | 'closedById';






const STATUS_META: Partial<
  Record<
    RequesterStatusEnum,
    {
      dateField: DateFields;
      userField: UserFields;
    }
  >
> = {
  [RequesterStatusEnum.Approved]: {
    dateField: 'approvedAt',
    userField: 'approvedById',
  },
  [RequesterStatusEnum.Rejected]: {
    dateField: 'rejectedAt',
    userField: 'rejectedById',
  },
  [RequesterStatusEnum.Cancelled]: {
    dateField: 'cancelledAt',
    userField: 'cancelledById',
  },
  [RequesterStatusEnum.Closed]: {
    dateField: 'closedAt',
    userField: 'closedById',
  },
  [RequesterStatusEnum.Treated]: {
    dateField: 'treatedAt',
    userField: 'treatedById',
  },
};

const REQUESTER_TRANSITIONS: Record<
  RequesterStatusEnum,
  RequesterStatusEnum[]
> = {
  [RequesterStatusEnum.Open]: [
    RequesterStatusEnum.Approved,
    RequesterStatusEnum.Rejected,
    RequesterStatusEnum.Cancelled,
  ],

  [RequesterStatusEnum.Approved]: [
    RequesterStatusEnum.Treated,
    RequesterStatusEnum.Cancelled,
  ],

  [RequesterStatusEnum.Treated]: [RequesterStatusEnum.Closed],

  [RequesterStatusEnum.Rejected]: [],
  [RequesterStatusEnum.Cancelled]: [],
  [RequesterStatusEnum.Closed]: [],
};

@Injectable()
export class RequesterService extends AbstractService<Requester> {
  public NOT_FOUND_MESSAGE = `Requester non trouvé`;

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

  
  private getBaseUrl(): string {
  const protocol =
    this.request.headers['x-forwarded-proto'] ?? this.request.protocol;

  const host =
    this.request.headers['x-forwarded-host'] ?? this.request.get('host');

  return `${protocol}://${host}`;
}

  get repository(): Repository<Requester> {
    return this._repository;
  }

  async createRecord(dto: CreateRequesterDto): Promise<Requester> {
  const authUser = this.request[REQUEST_AUTH_USER_KEY] as AuthUser;

  const requester = this._repository.create({
    ...dto,
    branchId: authUser.branchId,
  });

  const savedRequester = await super.createRecord(requester);
  const requesterWithRelations= await this.readOneById(savedRequester.id);
  const recipients = await this.userService.getMailRecipients();
  if (recipients.length === 0) return savedRequester;

  const payload = this.buildRequesterCreatedMailPayload(requesterWithRelations);
  await this.sendRequesterCreatedEmail({
    recipients,
    subject:MAIL_ACTION_CONFIG.Open.subject,
    template: MAIL_ACTION_CONFIG.Open.template,
    payload,
  });

  return savedRequester;
}
  async changeStatus(
    optionsWhere: FindOptionsWhere<Requester>,
    toStatus: RequesterStatusEnum,
  ) {
    const entity = await this.repository.findOneBy(optionsWhere);
    if (!entity) {
      throw new BadRequestException(this.NOT_FOUND_MESSAGE);
    }

    const authUser = this.request[REQUEST_AUTH_USER_KEY] as AuthUser;
    const fromStatus = entity.status;

    // 🔒 Interdire changement identique
    if (fromStatus === toStatus) {
      throw new BadRequestException(`Le ticket est déjà au statut ${toStatus}`);
    }

    // 🔁 Vérification des transitions
    const allowedTransitions = REQUESTER_TRANSITIONS[fromStatus];
    if (!allowedTransitions.includes(toStatus)) {
      throw new BadRequestException(
        `Transition interdite : ${fromStatus} → ${toStatus}`,
      );
    }

    // 🕒 Remplissage automatique des métadonnées
    const meta = STATUS_META[toStatus];
    if (meta) {
      entity[meta.dateField] = new Date();
      entity[meta.userField] = authUser?.id;
    }

    entity.status = toStatus;
    console.log('mailConfig888',toStatus)

    const requesterWithRelations= await this.readOneById(entity.id);
    const recipients = await this.userService.getMailRecipients();
    if (recipients.length === 0) return entity;
    // 📧 ENVOI MAIL SELON LE STATUT
    const mailConfig = MAIL_ACTION_CONFIG[toStatus];
    if (mailConfig) {
      const payload = this.buildRequesterCreatedMailPayload(requesterWithRelations);
      await this.sendRequesterCreatedEmail({
        recipients,
        subject: mailConfig.subject,
        template: mailConfig.template,
        payload,
      });
    }
    return await this.repository.save(entity);
  }



private buildRequesterCreatedMailPayload(requester: Requester) {
    return {
      requesterName: `${requester.createdBy?.userData?.firstName ?? ''} ${
        requester.createdBy?.userData?.lastName ?? ''
      }`.trim(),
      reference: requester.reference,
      ticket: requester.ticket,
      title: requester.title,
      status:requester.status,
      description: requester.description,
      priority: requester.priority,
      requestType: requester.requesttype?.displayName,
      station: requester.station?.displayName,
      branch: requester.branch?.displayName,
      closedBy: requester.closedBy?.username,
      closedAt: new Date(requester.closedAt).toLocaleString('fr-FR'),
      cancelledBy: requester.cancelledBy?.username,
      cancelledAt: new Date(requester.cancelledAt).toLocaleString('fr-FR'),
      treatedBy: requester.treatedBy?.username,
      treatedAt: new Date(requester.treatedAt).toLocaleString('fr-FR'),
      approvedBy:requester.approvedBy?.username,
      approvedAt: new Date(requester.approvedAt).toLocaleString('fr-FR'),
      createdBy: requester.createdBy?.username,
      createdAt: new Date(requester.createdAt).toLocaleString('fr-FR'),
      url: `${this.getBaseUrl()}/requester/preview/${requester.id}`,
      year: new Date().getFullYear(),
    };
  }

private async sendRequesterCreatedEmail(
  options: MailOptions,
): Promise<void> {
  await this.mailerSenderService.sendEmails(
    options.recipients,
    options.subject,
    options.template,
    options.payload,
  );
}



private async readOneById(id:string): Promise<any> {
    return  await this.repository.findOne({
  where: { id: id },
  relations: {
    requesttype: true,
    station: true,
    branch: true,
    createdBy:true,
    approvedBy:true,
    treatedBy:true,
    closedBy:true,
    cancelledBy:true
  },
});
}

}

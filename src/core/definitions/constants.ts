import { RequesterStatusEnum } from './enums';

export const MAIL_ACTION_CONFIG: Partial<
  Record<RequesterStatusEnum, { subject: string; template: string }>
> = {
  [RequesterStatusEnum.Open]: {
    subject: "BOBRAIN HELPKDESK - NOUVELLE DEMANDE D'INTERVENTION",
    template: 'requester-created',
  },

  [RequesterStatusEnum.Approved]: {
    subject: 'BOBRAIN HELPKDESK - DEMANDE APPROUVÉE',
    template: 'requester-status',
  },

  [RequesterStatusEnum.Cancelled]: {
    subject: 'BOBRAIN HELPKDESK - DEMANDE ANNULÉE',
    template: 'requester-status',
  },

  [RequesterStatusEnum.Treated]: {
    subject: 'BOBRAIN HELPKDESK - DEMANDE TRAITÉE',
    template: 'requester-status',
  },
  [RequesterStatusEnum.Rejected]: {
    subject: 'BOBRAIN HELPKDESK - DEMANDE REJETÉE',
    template: 'requester-status',
  },
  [RequesterStatusEnum.Closed]: {
    subject: 'BOBRAIN HELPKDESK - DEMANDE CLOTRUEE',
    template: 'requester-status',
  },
  
};

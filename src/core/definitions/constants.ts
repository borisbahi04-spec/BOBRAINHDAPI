import { RequesterStatusEnum } from './enums';

export const MAIL_ACTION_CONFIG: Partial<
  Record<RequesterStatusEnum, { subject: string; template: string }>
> = {
  [RequesterStatusEnum.Open]: {
    subject: "BOBRAIN HELPDESK - NOUVELLE DEMANDE D'INTERVENTION",
    template: 'requester-created',
  },

  [RequesterStatusEnum.Approved]: {
    subject: 'BOBRAIN HELPDESK - DEMANDE APPROUVÉE',
    template: 'requester-status',
  },

  [RequesterStatusEnum.Cancelled]: {
    subject: 'BOBRAIN HELPDESK - DEMANDE ANNULÉE',
    template: 'requester-status',
  },

  [RequesterStatusEnum.Treated]: {
    subject: 'BOBRAIN HELPDESK - DEMANDE TRAITÉE',
    template: 'requester-status',
  },
  [RequesterStatusEnum.Rejected]: {
    subject: 'BOBRAIN HELPDESK - DEMANDE REJETÉE',
    template: 'requester-status',
  },
  [RequesterStatusEnum.Closed]: {
    subject: 'BOBRAIN HELPDESK - DEMANDE CLÔTURÉE',
    template: 'requester-status',
  },
  
};

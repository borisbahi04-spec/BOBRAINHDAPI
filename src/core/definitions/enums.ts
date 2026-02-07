export enum LocaleProductTypeEnum {
  // Monture
  eyeglassFrame = 'Monture',
  // Verre (lentille)
  eyeglassLens = 'Verre',
  // Autres
  other = 'Autres',
}

export enum ProductTypeEnum {
  // Monture
  eyeglassFrame = 'eyeglass_frame',
  // Verre (lentille)
  eyeglassLens = 'eyeglass_lens',
  // Autres
  other = 'other',
}
export enum StatTotalCountEntityTypeEnum {
  Requester = 'Requester',
  Sale = 'Sale',
  PendingRequester = 'PendingRequester',
}

export enum StatTotalEntityTypeEnum {
  Consult = 'Consult',
  Sale = 'Sale',
}

export enum StatTimeEnum {
  monthly = 'monthly',
  yearly = 'yearly',
}

export enum StatProductTypeTimeEnum {
  lastXDays = 'lastXDays',
  currentMonth = 'currentMonth',
  lastMonth = 'lastMonth',
  currentYear = 'currentYear',
  lastYear = 'lastYear',
}


export enum DashboardQueryDtoEnum {
  lastYear = 'lastYear',
  currentYear = 'currentYear',
  lastMonth = 'lastMonth',
  currentMonth = 'currentMonth',
  last28Days = 'last28Days',
}

export enum StatBranchTimeEnum {
  lastXDays = 'lastXDays',
  currentMonth = 'currentMonth',
  lastMonth = 'lastMonth',
  currentYear = 'currentYear',
  lastYear = 'lastYear',
}

export enum StatInsuranceCompanyTimeEnum {
  lastXDays = 'lastXDays',
  currentMonth = 'currentMonth',
  lastMonth = 'lastMonth',
  currentYear = 'currentYear',
  lastYear = 'lastYear',
}



export enum YesNoActionEnum {
  yes = 'yes',
  no = 'no',
}

export enum AbilitySubjectEnum {
  all = 'all',
  User = 'User',
  Branch = 'Branch',
  Role = 'Role',
  Requester = 'Requester',
  Department = 'Department',
  Setting = 'Setting',
  AuthUser = 'AuthUser',
}

export enum MailAction {
  CREATED = 'CREATED',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
  PROCESSED = 'PROCESSED',
}

export enum RequesterStatusEnum {
  Open = 'Open',
  Approved = 'Approved',
  Treated = 'Treated',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled',
  Closed = 'Closed',
}

export enum AbilityActionEnum {
  admin = 'admin',
  manage = 'manage',
  read = 'read',
  create = 'create',
  edit = 'edit',
  delete = 'delete',
  stream = 'stream',
  approval = 'approval',
  cancel = 'cancel',
  close = 'close',
}
export enum userTypeEnum {
  OPERATEUR = 'OPERATOR',
  OTHER = 'OTHER',
}

export enum AccessTypeEnum {
  // Owner
  owner = 'owner',
  supervisor = 'supervisor',
  // Manager
  manager = 'manager',
  admin = 'admin',

  guest = 'guest',
}

export enum StatusFlashEnum {
  SERIAL_CONNECTED = 'SERIAL_CONNECTED',
  SERIAL_DISCONNECTED = 'SERIAL_DISCONNECTED',
  DISPLAY_ON = 'DISPLAY_ON',
  DISPLAY_OFF = 'DISPLAY_OFF',
  SERVICE_SHUTDOWN = 'SERVICE_SHUTDOWN',
  WEIGHT_OK = 'WEIGHT_OK',
  WEIGHT_NOT_OK = 'WEIGHT_NOT_OK',
}

export enum StationEnum {
  AY1 = 'AY1',
  AY2 = 'AY2',
  AD1 = 'AD1',
  AD2 = 'AD2',
  EB1 = 'EB1',
  EB2 = 'EB2',
}

export enum PriorityEnum {
  Normal = 'Normal',
  Important = 'Important',
  Urgent = 'Urgent',
}



export enum AuthLogAuthMethodEnum {
  local = 'local',
  jwt = 'jwt',
}

/**
 * Consultation *******************************
 */

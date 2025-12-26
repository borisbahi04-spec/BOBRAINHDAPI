export enum YesNoActionEnum {
  yes = 'yes',
  no = 'no',
}

export enum AbilitySubjectEnum {
  all = 'all',
  User = 'User',
  Branch = 'Branch',
  Role = 'Role',
  Flash = 'Flash',
  Setting = 'Setting',
  AuthUser = 'AuthUser',
}

export enum AbilityActionEnum {
  admin = 'admin',
  manage = 'manage',
  read = 'read',
  create = 'create',
  edit = 'edit',
  delete = 'delete',
  stream = 'stream',
}
export enum userTypeEnum {
  OPERATEUR = 'OPERATOR',
  OTHER = 'OTHER',
}

export enum AccessTypeEnum {
  // Owner
  owner = 'owner',
  admin = 'admin',
  // Manager
  manager = 'manager',

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

export enum AuthLogAuthMethodEnum {
  local = 'local',
  jwt = 'jwt',
}

/**
 * Consultation *******************************
 */

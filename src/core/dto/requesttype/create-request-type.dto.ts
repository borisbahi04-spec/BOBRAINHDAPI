import { PickType } from '@nestjs/swagger';
import { RequestType } from 'src/core/entities/requester/request-type';

export class CreateRequestTypeDto extends PickType(RequestType, [
  'displayName',
  'description',
] as const) {}

import { PickType } from '@nestjs/swagger';
import { LabAgent } from 'src/core/entities/requester/lab-agent.entity';

export class CreateLabAgentDto extends PickType(LabAgent, [
  'matricule',
  'lastName',
  'firstName',
  'phoneNumber',
  'isActive',
] as const) {}

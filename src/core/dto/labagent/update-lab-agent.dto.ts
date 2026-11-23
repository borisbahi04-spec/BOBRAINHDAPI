import { PartialType } from '@nestjs/swagger';
import { CreateLabAgentDto } from './create-lab-agent.dto';

export class UpdateLabAgentDto extends PartialType(CreateLabAgentDto) {}

import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateDepartmentDto } from './create-department.dto';

export class UpdateDepartmentDto extends PartialType(
  OmitType(CreateDepartmentDto, [] as const),
) {}

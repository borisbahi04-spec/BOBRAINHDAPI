import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Department } from 'src/core/entities/user/department.entity';

export class CreateDepartmentDto extends PickType(Department, [
  'displayName',
  'description',
] as const) {
  @ApiPropertyOptional({ description: `est actives` })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ description: `Numéro de téléphone` })
  @IsOptional()
  @IsString()
  phoneNumber: string;
}

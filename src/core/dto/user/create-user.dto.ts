import { User } from '../../entities/user/user.entity';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { BranchToUser } from 'src/core/entities/subsidiary/branch-to-user.entity';
import { userTypeEnum } from 'src/core/definitions/enums';

export class CreateUserDto extends PickType(User, [
  'username',
  'email',
  'phoneNumber',
  'branchId',
  'departmentId',
  'roleId',
] as const) {
  @ApiPropertyOptional({ minLength: 3, description: `Nom` })
  @IsOptional()
  @IsString()
  firstName: string;
  @ApiPropertyOptional({ minLength: 3, description: `Prenom` })
  @IsOptional()
  @IsString()
  lastName: string;
  @ApiPropertyOptional({ minLength: 3, description: `Email` })
  @IsOptional()
  @IsString()
  email: string;
  @ApiPropertyOptional({ description: `Departement` })
  @IsOptional()
  @IsString()
  departementId: string;
  @ApiPropertyOptional({ description: `type` })
  @IsOptional()
  @IsString()
  type: userTypeEnum;

  @ApiPropertyOptional({ description: `est actives` })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ minLength: 3, description: `Mot de passe` })
  @IsOptional()
  @IsString()
  @MinLength(3)
  newPassword: string;
}

export class CreateUserToBranchDto extends PickType(BranchToUser, [
  'branchId',
] as const) {}

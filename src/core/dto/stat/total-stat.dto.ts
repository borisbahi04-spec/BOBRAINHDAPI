import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  DashboardQueryDtoEnum,
  StatTotalCountEntityTypeEnum,
  StatTotalEntityTypeEnum,
} from '../../definitions/enums';

export class TotalStatQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  branchId?: string;

  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional({ type: 'integer' })
  year?: number;

  @ApiPropertyOptional({
    enum: StatTotalEntityTypeEnum,
    enumName: 'StatTotalEntityTypeEnum',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  entityType?: StatTotalEntityTypeEnum[];
}

export class TotalCountStatQueryDto extends PickType(TotalStatQueryDto, [
  'branchId',
  'year',
] as const) {
  @ApiPropertyOptional({
    enum: StatTotalCountEntityTypeEnum,
    enumName: 'StatTotalCountEntityTypeEnum',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  entityType?: StatTotalCountEntityTypeEnum[];
}

export class SaleTotalByProductTypeQueryDto extends PickType(
  TotalStatQueryDto,
  ['branchId'] as const,
) {}

export class SaleTotalByInsuranceCompanyQueryDto extends PickType(
  TotalStatQueryDto,
  ['branchId'] as const,
) {}

export class SaleTotalByYearAndMonthQueryDto extends PickType(
  TotalStatQueryDto,
  ['branchId', 'year'] as const,
) {
  @IsNumberString()
  @IsOptional()
  @ApiPropertyOptional({ type: 'string' })
  month?: string;
}

export class TotalStatResponseDto {
  @ApiProperty()
  stats: number;

  @ApiProperty()
  title: string;
}

export class RequesterQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(DashboardQueryDtoEnum)
  period?: DashboardQueryDtoEnum;

  // 🔥 OBLIGATOIRE
  @IsOptional()
  @IsString()
  where?: string;
}

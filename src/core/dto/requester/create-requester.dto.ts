import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PriorityEnum, RequesterStatusEnum } from 'src/core/definitions/enums';
import { Requester } from 'src/core/entities/requester/requester.entity';

export class CreateRequesterDto extends PickType(Requester, [
  'title',
  'description',
  'requesttypeId',
  'stationId',
  'ticket',
  //'branchId',
] as const) {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: true })
  priority: PriorityEnum;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: true })
  status: RequesterStatusEnum;
}

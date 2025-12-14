import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StationEnum } from 'src/core/definitions/enums';
import { Flash } from 'src/core/entities/flash/flash.entity';

export class CreateFlashDto extends PickType(Flash, [
  'sentWeight',
  'computerUser',
  'computerName',
  'userProfile',
] as const) {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  station: StationEnum;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  frame: string;
}

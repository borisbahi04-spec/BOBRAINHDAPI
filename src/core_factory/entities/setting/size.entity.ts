import { Column, Entity, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import {
  SizeLevelEnum,
  SizeNameEnum,
} from 'src/core_factory/definitions/enums';
//import { OptionToTax } from './option-to-tax.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class Size extends CoreEntity {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: `nom du grade` })
  @Index()
  @Column({ name: 'display_name' })
  displayName: SizeNameEnum;

  @IsNotEmpty()
  @IsString()
  @Column({ name: 'level' })
  level: SizeLevelEnum;

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

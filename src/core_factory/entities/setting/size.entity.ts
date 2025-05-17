import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import {
  SizeLevelEnum,
  SizeNameEnum,
} from 'src/core_factory/definitions/enums';
import { Roaster } from '../roaster/roaster.entity';
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

  @ApiProperty({ required: false, type: () => [Roaster] })
  @OneToMany(() => Roaster, (roaster) => roaster.size, {
    cascade: true,
  })
  roasters: Roaster[];

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

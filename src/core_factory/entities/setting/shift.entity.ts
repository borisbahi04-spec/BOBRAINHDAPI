import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { Roaster } from '../roaster/roaster.entity';
//import { OptionToTax } from './option-to-tax.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class Shift extends CoreEntity {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: `noumero du shift` })
  @Index()
  @Column({ name: 'value' })
  value: number;

  @ApiProperty({ required: false, type: () => [Roaster] })
  @OneToMany(() => Roaster, (roaster) => roaster.shift, {
    cascade: true,
  })
  roasters: Roaster[];

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

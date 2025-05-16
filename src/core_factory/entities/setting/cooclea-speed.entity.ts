import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { RoasterToSettingToCoocleaSpeed } from '../roaster/roaster-to-setting-to-coocleaspeed.entity';
import { CoocleaSpeedEnum } from 'src/core_factory/definitions/enums';
//import { OptionToTax } from './option-to-tax.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class CoocleaSpeed extends CoreEntity {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: `nom du cooclea speed` })
  @Index()
  @Column({ name: 'display_name' })
  displayName: CoocleaSpeedEnum;

  @ApiProperty({
    required: false,
    type: () => [RoasterToSettingToCoocleaSpeed],
  })
  @OneToMany(
    () => RoasterToSettingToCoocleaSpeed,
    (roasterToSettingToCoocleaSpeed) =>
      roasterToSettingToCoocleaSpeed.coocleaSpeed,
    {
      cascade: true,
    },
  )
  roasterToSettingToCoocleaSpeeds: RoasterToSettingToCoocleaSpeed[];

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

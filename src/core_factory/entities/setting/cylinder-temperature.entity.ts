import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { RoasterToSettingToCylinderTemperature } from '../roaster/roaster-to-setting-to-cylindertemperature.entity copy';
import { CylinderTemperatureEnum } from 'src/core_factory/definitions/enums';
//import { OptionToTax } from './option-to-tax.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class CylinderTemperature extends CoreEntity {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: `nom du cooclea speed` })
  @Index()
  @Column({ name: 'display_name' })
  displayName: CylinderTemperatureEnum;

  @ApiProperty({
    required: false,
    type: () => [RoasterToSettingToCylinderTemperature],
  })
  @OneToMany(
    () => RoasterToSettingToCylinderTemperature,
    (roasterToSettingToCylinderTemperature) =>
      roasterToSettingToCylinderTemperature.cylinderTemperature,
    {
      cascade: true,
    },
  )
  roasterToSettingToCylinderTemperatures: RoasterToSettingToCylinderTemperature[];

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

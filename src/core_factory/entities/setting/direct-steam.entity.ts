import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { DirectSteamEnum } from 'src/core_factory/definitions/enums';
import { RoasterToSettingToDirectSteam } from '../roaster/roaster-to-setting-to-directsteam.entity';
//import { OptionToTax } from './option-to-tax.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class DirectSteam extends CoreEntity {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: `nom du cooclea speed` })
  @Index()
  @Column({ name: 'display_name' })
  displayName: DirectSteamEnum;

  @ApiProperty({
    required: false,
    type: () => [RoasterToSettingToDirectSteam],
  })
  @OneToMany(
    () => RoasterToSettingToDirectSteam,
    (roasterToSettingToDirectSteam) =>
      roasterToSettingToDirectSteam.directSteam,
    {
      cascade: true,
    },
  )
  roasterToSettingToDirectSteams: RoasterToSettingToDirectSteam[];

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

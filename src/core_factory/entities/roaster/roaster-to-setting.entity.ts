import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { PressionInBarEnum } from 'src/core_factory/definitions/enums';
import { Branch } from 'src/core/entities/subsidiary/branch.entity';
import { Roaster } from './roaster.entity';
import { RoasterToSettingToCoocleaSpeed } from './roaster-to-setting-to-coocleaspeed.entity';
import { RoasterToSettingToCylinderTemperature } from './roaster-to-setting-to-cylindertemperature.entity copy';
import { RoasterToSettingToDirectSteam } from './roaster-to-setting-to-directsteam.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class RoasterToSetting extends CoreEntity {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    required: true,
    description: `Pression en Bar`,
  })
  @Column({ name: 'pression', nullable: false })
  pression: PressionInBarEnum;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'roaster_id', type: 'uuid', nullable: false })
  roaster_id: string;

  @ApiProperty({ required: false, type: () => Roaster })
  @ManyToOne(() => Roaster, (roaster) => roaster.roasterToSettings, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'roaster_id' })
  roaster: Roaster;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'branch_id', type: 'uuid', nullable: false })
  branchId: string;

  @ApiProperty({ required: false, type: () => Branch })
  @ManyToOne(() => Branch, (branch) => branch.roasters, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ApiProperty({
    required: false,
    type: () => [RoasterToSettingToCoocleaSpeed],
  })
  @OneToMany(
    () => RoasterToSettingToCoocleaSpeed,
    (roasterToSettingToCoocleaSpeed) =>
      roasterToSettingToCoocleaSpeed.roasterToSetting,
    {
      cascade: true,
    },
  )
  roasterToSettingToCoocleaSpeeds: RoasterToSettingToCoocleaSpeed[];

  @ApiProperty({
    required: false,
    type: () => [RoasterToSettingToCylinderTemperature],
  })
  @OneToMany(
    () => RoasterToSettingToCylinderTemperature,
    (roasterToSettingToCylinderTemperature) =>
      roasterToSettingToCylinderTemperature.roasterToSetting,
    {
      cascade: true,
    },
  )
  roasterToSettingToCylinderTemperatures: RoasterToSettingToCylinderTemperature[];

  @ApiProperty({
    required: false,
    type: () => [RoasterToSettingToDirectSteam],
  })
  @OneToMany(
    () => RoasterToSettingToDirectSteam,
    (roasterToSettingToDirectSteam) =>
      roasterToSettingToDirectSteam.roasterToSetting,
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

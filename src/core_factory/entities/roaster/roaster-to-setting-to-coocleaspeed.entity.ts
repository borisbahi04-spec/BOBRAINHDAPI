// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { Branch } from 'src/core/entities/subsidiary/branch.entity';
import { RoasterToSetting } from './roaster-to-setting.entity';
import { CoocleaSpeed } from '../setting/cooclea-speed.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class RoasterToSettingToCoocleaSpeed extends CoreEntity {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: `valeur du CylinderTemperature` })
  @Column({ name: 'value', default: 0 })
  value: number;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: `roastertosetting du CylinderTemperature` })
  @Column({ name: 'roastertosetting_id', type: 'uuid', nullable: false })
  roastertosettingId: string;

  @ApiProperty({ required: false, type: () => RoasterToSetting })
  @ManyToOne(
    () => RoasterToSetting,
    (roasterTosetting) => roasterTosetting.roasterToSettingToCoocleaSpeeds,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      orphanedRowAction: 'delete',
    },
  )
  @JoinColumn({ name: 'roastertosetting_id' })
  roasterToSetting: RoasterToSetting;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'coocleaspeed_id', type: 'uuid', nullable: false })
  coocleaspeedId: string;

  @ApiProperty({ required: false, type: () => CoocleaSpeed })
  @ManyToOne(
    () => CoocleaSpeed,
    (coocleaSpeed) => coocleaSpeed.roasterToSettingToCoocleaSpeeds,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      orphanedRowAction: 'delete',
    },
  )
  @JoinColumn({ name: 'coocleaspeed_id' })
  coocleaSpeed: CoocleaSpeed;

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

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

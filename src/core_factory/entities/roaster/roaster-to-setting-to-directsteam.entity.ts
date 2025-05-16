import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { Branch } from 'src/core/entities/subsidiary/branch.entity';
import { RoasterToSetting } from './roaster-to-setting.entity';
import { DirectSteam } from '../setting/direct-steam.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class RoasterToSettingToDirectSteam extends CoreEntity {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: `valeur du DirectSteam` })
  @Column({ name: 'value', default: 0 })
  value: number;
  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'roastertosetting_id', type: 'uuid', nullable: false })
  roastertosetting_id: string;

  @ApiProperty({ required: false, type: () => RoasterToSetting })
  @ManyToOne(
    () => RoasterToSetting,
    (roasterTosetting) => roasterTosetting.roasterToSettingToDirectSteams,
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
  @Column({ name: 'directsteam_id', type: 'uuid', nullable: false })
  directsteam_id: string;

  @ApiProperty({ required: false, type: () => DirectSteam })
  @ManyToOne(
    () => DirectSteam,
    (directSteam) => directSteam.roasterToSettingToDirectSteams,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      orphanedRowAction: 'delete',
    },
  )
  @JoinColumn({ name: 'directsteam_id' })
  directSteam: DirectSteam;

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

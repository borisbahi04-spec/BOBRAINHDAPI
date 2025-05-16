import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { Branch } from 'src/core/entities/subsidiary/branch.entity';
import { RoasterToSetting } from './roaster-to-setting.entity';
import { CylinderTemperature } from '../setting/cylinder-temperature.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class RoasterToSettingToCylinderTemperature extends CoreEntity {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: `valeur du CylinderTemperature` })
  @Column({ name: 'value', default: 0 })
  value: number;
  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'roastertosetting_id', type: 'uuid', nullable: false })
  roastertosetting_id: string;

  @ApiProperty({ required: false, type: () => RoasterToSetting })
  @ManyToOne(
    () => RoasterToSetting,
    (roasterTosetting) =>
      roasterTosetting.roasterToSettingToCylinderTemperatures,
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
  @Column({ name: 'cylindertemperature_id', type: 'uuid', nullable: false })
  cylindertemperature_id: string;

  @ApiProperty({ required: false, type: () => CylinderTemperature })
  @ManyToOne(
    () => CylinderTemperature,
    (cylinderTemperature) =>
      cylinderTemperature.roasterToSettingToCylinderTemperatures,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      orphanedRowAction: 'delete',
    },
  )
  @JoinColumn({ name: 'cylindertemperature_id' })
  cylinderTemperature: CylinderTemperature;

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

  /*
  @ApiProperty({
    required: false,
    type: () => [RoasterToHumidityBeforeCooking],
  })
  @OneToMany(
    () => RoasterToHumidityBeforeCooking,
    (roasterToHumidityBeforeHumidity) =>
      roasterToHumidityBeforeHumidity.roaster,
    {
      cascade: true,
    },
  )
  roasterToHumidityBeforeCookings: RoasterToHumidityBeforeCooking[];

  @ApiProperty({ required: false, type: () => [RoasterToHumidityAfterCooking] })
  @OneToMany(
    () => RoasterToHumidityAfterCooking,
    (roasterToHumidityAfterCooking) => roasterToHumidityAfterCooking.roaster,
    {
      cascade: true,
    },
  )
  roasterToHumidityAfterCookings: RoasterToHumidityAfterCooking[];

  @ApiProperty({ required: false, type: () => [RoasterToHumidityAfterCooling] })
  @OneToMany(
    () => RoasterToHumidityAfterCooling,
    (roasterToHumidityAfterCooling) => roasterToHumidityAfterCooling.roaster,
    {
      cascade: true,
    },
  )
  roasterToHumidityAfterCoolings: RoasterToHumidityAfterCooling[];
*/
  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

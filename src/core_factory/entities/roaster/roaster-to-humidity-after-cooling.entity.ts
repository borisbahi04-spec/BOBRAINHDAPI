import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CashewStage } from '../setting/cashew-stage.entity';
import { Branch } from 'src/core/entities/subsidiary/branch.entity';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { Roaster } from './roaster.entity';
import { Shift } from '../setting/shift.entity';

/**
 * Relationship table {branch, product} with custom properties
 */
@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class RoasterToHumidityAfterCooling extends CoreEntity {
  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ description: `Date` })
  @Column({
    name: 'roastertohumaftercool_date',
    type: 'datetime',
    nullable: true,
    default: () => '(CURRENT_DATE)',
  })
  date: Date;

  @IsOptional()
  @IsInt()
  @ApiProperty({ required: false, description: `Valeur de l'humidité %` })
  @Column({
    name: 'value',
    type: 'integer',
    unsigned: true,
    default: 0,
  })
  value: number;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'shift_id', type: 'uuid', nullable: false })
  shiftId: string;

  @ApiProperty({ required: false, type: () => Shift })
  @ManyToOne(() => Shift, (shift) => shift.roasterToHumidityAfterCoolings, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'roaster_id', type: 'uuid', nullable: false })
  roaster_id: string;

  @ApiProperty({ required: false, type: () => Roaster })
  @ManyToOne(
    () => Roaster,
    (roaster) => roaster.roasterToHumidityAfterCoolings,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      orphanedRowAction: 'delete',
    },
  )
  @JoinColumn({ name: 'roaster_id' })
  roaster: Roaster;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'branch_id', type: 'uuid', nullable: false })
  branchId: string;

  @ApiProperty({ required: false, type: () => Branch })
  @ManyToOne(() => Branch, (branch) => branch.roasterToHumidityAfterCoolings, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'cashew_stage_id', type: 'uuid', nullable: false })
  cashewStageId: string;

  @ApiProperty({ required: false, type: () => CashewStage })
  @ManyToOne(
    () => CashewStage,
    (cashewStage) => cashewStage.roasterToHumidityAfterCoolings,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      orphanedRowAction: 'delete',
    },
  )
  @JoinColumn({ name: 'cashew_stage_id' })
  cashewStage: CashewStage;
}

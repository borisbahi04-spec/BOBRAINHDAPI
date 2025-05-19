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
import { Shift } from '../setting/shift.entity';

/**
 * Relationship table {branch, product} with custom properties
 */
@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class QapeelingToPeeledKernel extends CoreEntity {
  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ description: `Date` })
  @Column({
    name: 'qapeeling_to_peeled_kernel_date',
    type: 'datetime',
    nullable: true,
    default: () => '(CURRENT_DATE)',
  })
  date: Date;

  @IsOptional()
  @IsInt()
  @ApiProperty({ required: false, description: `Poids en g` })
  @Column({
    name: 'quantity',
    type: 'integer',
    unsigned: true,
    default: 0,
  })
  quantity: number;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'shift_id', type: 'uuid', nullable: false })
  shiftId: string;

  @ApiProperty({ required: false, type: () => Shift })
  @ManyToOne(() => Shift, (shift) => shift.qapeelingToPeeledKernels, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'branch_id', type: 'uuid', nullable: false })
  branchId: string;

  @ApiProperty({ required: false, type: () => Branch })
  @ManyToOne(() => Branch, (branch) => branch.qapeelingToPeeledKernels, {
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
    (cashewStage) => cashewStage.qapeelingToPeeledKernels,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      orphanedRowAction: 'delete',
    },
  )
  @JoinColumn({ name: 'cashew_stage_id' })
  cashewStage: CashewStage;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CashewStage } from '../setting/cashew-stage.entity';
import { Branch } from 'src/core/entities/subsidiary/branch.entity';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { Shift } from '../setting/shift.entity';
import { Qacyclone } from './qacyclone.entity';
import { instanceToPlain } from 'class-transformer';

/**
 * Relationship table {branch, product} with custom properties
 */
@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class QacycloneToKernel extends CoreEntity {
  @IsOptional()
  @IsInt()
  @ApiProperty({ required: false, description: `Valeur  %` })
  @Column({
    name: 'value',
    type: 'integer',
    unsigned: true,
    default: 0,
  })
  value: number;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'qacyclone_id', type: 'uuid', nullable: false })
  qacyclone_id: string;

  @ApiProperty({ required: false, type: () => Qacyclone })
  @ManyToOne(() => Qacyclone, (qacyclone) => qacyclone.qacycloneToKernels, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'qacyclone_id' })
  qacyclone: Qacyclone;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'shift_id', type: 'uuid', nullable: false })
  shiftId: string;

  @ApiProperty({ required: false, type: () => Shift })
  @ManyToOne(() => Shift, (shift) => shift.qacycloneToKernels, {
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
  @ManyToOne(() => Branch, (branch) => branch.qacycloneToKernels, {
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
    (cashewStage) => cashewStage.qacycloneToKernels,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      orphanedRowAction: 'delete',
    },
  )
  @JoinColumn({ name: 'cashew_stage_id' })
  cashewStage: CashewStage;

  toJSON() {
    return instanceToPlain(this);
  }
}

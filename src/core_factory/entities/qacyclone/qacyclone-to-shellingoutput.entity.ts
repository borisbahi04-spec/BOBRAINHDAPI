import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Branch } from 'src/core/entities/subsidiary/branch.entity';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { Shift } from '../setting/shift.entity';
import { Qacyclone } from './qacyclone.entity';
import { instanceToPlain } from 'class-transformer';
import { QashellingOutput } from '../qashelling/qashelling-output.entity';

/**
 * Relationship table {branch, product} with custom properties
 */
@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class QacycloneToShellingOutput extends CoreEntity {
  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'qacyclone_id', type: 'uuid', nullable: false })
  qacyclone_id: string;

  @ApiProperty({ required: false, type: () => Qacyclone })
  @ManyToOne(
    () => Qacyclone,
    (qacyclone) => qacyclone.qacycloneToShellingOutputs,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      orphanedRowAction: 'delete',
    },
  )
  @JoinColumn({ name: 'qacyclone_id' })
  qacyclone: Qacyclone;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'shift_id', type: 'uuid', nullable: false })
  shiftId: string;

  @ApiProperty({ required: false, type: () => Shift })
  @ManyToOne(() => Shift, (shift) => shift.qacycloneToShellingOutputs, {
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
  @ManyToOne(() => Branch, (branch) => branch.qacycloneToShellingOutputs, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'qashellingoutput_id', type: 'uuid', nullable: false })
  qashellingoutputId: string;

  @ApiProperty({ required: false, type: () => QashellingOutput })
  @ManyToOne(
    () => QashellingOutput,
    (qashellingOutput) => qashellingOutput.qacycloneToShellingOutputs,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      orphanedRowAction: 'delete',
    },
  )
  @JoinColumn({ name: 'qashellingoutput_id' })
  qashellingoutput: QashellingOutput;

  toJSON() {
    return instanceToPlain(this);
  }
}

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { Shift } from '../setting/shift.entity';
import { Branch } from 'src/core/entities/subsidiary/branch.entity';
import { QashellingOutput } from './qashelling-output.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class QashellingOutputToNetCount extends CoreEntity {
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
  @Column({ name: 'qashellingoutput_id', type: 'uuid', nullable: false })
  qashelling_id: string;

  @ApiProperty({ required: false, type: () => QashellingOutput })
  @ManyToOne(
    () => QashellingOutput,
    (qashellingoutput) => qashellingoutput.qashellingOutputToNetCounts,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      orphanedRowAction: 'delete',
    },
  )
  @JoinColumn({ name: 'qashellingoutput_id' })
  qashellingoutput: QashellingOutput;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'shift_id', type: 'uuid', nullable: false })
  shiftId: string;

  @ApiProperty({ required: false, type: () => Shift })
  @ManyToOne(() => Shift, (shift) => shift.qashellingOutputToNetCounts, {
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
  @ManyToOne(() => Branch, (branch) => branch.qashellingOutputToNetCounts, {
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

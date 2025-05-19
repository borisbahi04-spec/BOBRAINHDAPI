import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { Shift } from '../setting/shift.entity';
import { Branch } from 'src/core/entities/subsidiary/branch.entity';
import { QashellingOutput } from './qashelling-output.entity';
import { Qapeeling } from '../qapeeling/qapeeling.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class QashellingOutputToLotNumber extends CoreEntity {
  @IsNotEmpty()
  @ApiProperty({ required: false, description: `Nom du lot number` })
  @Column({
    name: 'display_name',
  })
  displayName: string;

  @IsOptional()
  @IsInt()
  @ApiProperty({ required: false, description: `quantity  du lot %` })
  @Column({
    name: 'quantity',
    type: 'integer',
    unsigned: true,
    default: 0,
  })
  quantity: number;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'qashellingoutput_id', type: 'uuid', nullable: false })
  qashelling_id: string;

  @ApiProperty({ required: false, type: () => QashellingOutput })
  @ManyToOne(
    () => QashellingOutput,
    (qashellingoutput) => qashellingoutput.qashellingOutputToLotNumbers,
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
  @ManyToOne(() => Shift, (shift) => shift.qashellingOutputToLotNumbers, {
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
  @ManyToOne(() => Branch, (branch) => branch.qashellingOutputToLotNumbers, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ApiProperty({
    required: false,
    type: () => [Qapeeling],
  })
  @OneToMany(
    () => Qapeeling,
    (qapeeling) => qapeeling.qashellingOutputToLotNumber,
    {
      cascade: true,
    },
  )
  qapeelings: Qapeeling[];

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

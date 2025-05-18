import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { Roaster } from '../roaster/roaster.entity';
import { QashellingStatusEnum } from 'src/core_factory/definitions/enums';
import { Shift } from '../setting/shift.entity';
import { Branch } from 'src/core/entities/subsidiary/branch.entity';
import { QashellingOutputToKernel } from './qashelling-output-to-kernel.entity';
import { QashellingOutputToNetCount } from './qashelling-output-to-netcount.entity';
import { QashellingOutputToLotNumber } from './qashelling-output-to-lotnumber.entity';
import { QaimpactorToShellingOutput } from '../qaimpactor/qaimpactor-to-shelling-output.entity';
import { QacycloneToShellingOutput } from '../qacyclone/qacyclone-to-shellingoutput.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class QashellingOutput extends CoreEntity {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: `Référence` })
  @Index()
  @Column()
  reference: string;

  @IsNotEmpty()
  @IsIn(Object.values(QashellingStatusEnum))
  @ApiProperty({
    enum: QashellingStatusEnum,
    enumName: 'QashellingStatusEnum',
    default: QashellingStatusEnum.pending,
    description: `Status`,
  })
  @Column({
    name: 'qashellingoutput_status',
    default: QashellingStatusEnum.pending,
  })
  status: QashellingStatusEnum;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ description: `Date de la qashellingoutputs ` })
  @Column({
    name: 'qashellingoutput_date',
    type: 'datetime',
    nullable: true,
    default: () => '(CURRENT_DATE)',
  })
  date: Date;

  @IsNotEmpty()
  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'roaster_id', type: 'uuid', nullable: false })
  roaster_id: string;

  @ApiProperty({ required: false, type: () => Roaster })
  @ManyToOne(() => Roaster, (roaster) => roaster.qashellings, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'roaster_id' })
  roaster: Roaster;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'shift_id', type: 'uuid', nullable: false })
  shiftId: string;

  @ApiProperty({ required: false, type: () => Shift })
  @ManyToOne(() => Shift, (shift) => shift.qashellings, {
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
  @ManyToOne(() => Branch, (branch) => branch.qashellings, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ApiProperty({
    required: false,
    type: () => [QashellingOutputToKernel],
  })
  @OneToMany(
    () => QashellingOutputToKernel,
    (qashellingOutputToKernel) => qashellingOutputToKernel.qashellingoutput,
    {
      cascade: true,
    },
  )
  qashellingOutputToKernels: QashellingOutputToKernel[];

  @ApiProperty({
    required: false,
    type: () => [QashellingOutputToNetCount],
  })
  @OneToMany(
    () => QashellingOutputToNetCount,
    (qashellingOutputToNetCount) => qashellingOutputToNetCount.qashellingoutput,
    {
      cascade: true,
    },
  )
  qashellingOutputToNetCounts: QashellingOutputToNetCount[];

  @ApiProperty({
    required: false,
    type: () => [QashellingOutputToLotNumber],
  })
  @OneToMany(
    () => QashellingOutputToLotNumber,
    (qashellingOutputToLotNumber) =>
      qashellingOutputToLotNumber.qashellingoutput,
    {
      cascade: true,
    },
  )
  qashellingOutputToLotNumbers: QashellingOutputToLotNumber[];

  @ApiProperty({
    required: false,
    type: () => [QaimpactorToShellingOutput],
  })
  @OneToMany(
    () => QaimpactorToShellingOutput,
    (qaimpactorToShellingOutput) => qaimpactorToShellingOutput.qashellingoutput,
    {
      cascade: true,
    },
  )
  qaimpactorToShellingOutputs: QaimpactorToShellingOutput[];

  @ApiProperty({
    required: false,
    type: () => [QacycloneToShellingOutput],
  })
  @OneToMany(
    () => QacycloneToShellingOutput,
    (qacycloneToShellingOutput) => qacycloneToShellingOutput.qashellingoutput,
    {
      cascade: true,
    },
  )
  qacycloneToShellingOutputs: QacycloneToShellingOutput[];
  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

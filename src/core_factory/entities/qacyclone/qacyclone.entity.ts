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
import { Equipment } from 'src/core/entities/setting/equipment.entity';
import { QacycloneStatusEnum } from 'src/core_factory/definitions/enums';
import { Shift } from '../setting/shift.entity';
import { Branch } from 'src/core/entities/subsidiary/branch.entity';
import { QacycloneToKernel } from './qacyclone-to-kernel.entity';
import { QacycloneToShellingOutput } from './qacyclone-to-shellingoutput.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class Qacyclone extends CoreEntity {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: `Référence` })
  @Index()
  @Column()
  reference: string;

  @IsNotEmpty()
  @IsIn(Object.values(QacycloneStatusEnum))
  @ApiProperty({
    enum: QacycloneStatusEnum,
    enumName: 'QacycloneStatusEnum',
    default: QacycloneStatusEnum.pending,
    description: `Status`,
  })
  @Column({ name: 'qacyclone_status', default: QacycloneStatusEnum.pending })
  status: QacycloneStatusEnum;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ description: `Date de la qacyclone` })
  @Column({
    name: 'qacyclone_date',
    type: 'datetime',
    nullable: true,
    default: () => '(CURRENT_DATE)',
  })
  date: Date;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'shift_id', type: 'uuid', nullable: false })
  shiftId: string;

  @ApiProperty({ required: false, type: () => Shift })
  @ManyToOne(() => Shift, (shift) => shift.qacyclones, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'equipment_id', type: 'uuid', nullable: false })
  equipment_id: string;

  @ApiProperty({ required: false, type: () => Equipment })
  @ManyToOne(() => Equipment, (equipment) => equipment.qacyclones, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'branch_id', type: 'uuid', nullable: false })
  branchId: string;

  @ApiProperty({ required: false, type: () => Branch })
  @ManyToOne(() => Branch, (branch) => branch.qacyclones, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ApiProperty({
    required: false,
    type: () => [QacycloneToKernel],
  })
  @OneToMany(
    () => QacycloneToKernel,
    (qacycloneToKernel) => qacycloneToKernel.qacyclone,
    {
      cascade: true,
    },
  )
  qacycloneToKernels: QacycloneToKernel[];

  @ApiProperty({
    required: false,
    type: () => [QacycloneToShellingOutput],
  })
  @OneToMany(
    () => QacycloneToShellingOutput,
    (qacycloneToShellingOutput) => qacycloneToShellingOutput.qacyclone,
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

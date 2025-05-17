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
import { Equipment } from 'src/core/entities/setting/equipment.entity';
import { QashellingStatusEnum } from 'src/core_factory/definitions/enums';
import { Shift } from '../setting/shift.entity';
import { Branch } from 'src/core/entities/subsidiary/branch.entity';
import { QashellingToPercentageOfKernel } from './qashelling-to-percentage-of-kernel.entity';
import { QashellingToPercentageOfUnscooped } from './qashelling-to-percentage-of-unscooped.entity';
import { QashellingToHumidity } from './qashelling-to-humidity.entity';
import { QashellingToKernel } from './qashelling-to-kernel.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class Qashelling extends CoreEntity {
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
  @Column({ name: 'qashelling_status', default: QashellingStatusEnum.pending })
  status: QashellingStatusEnum;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ description: `Date de la qashelling` })
  @Column({
    name: 'qashelling_date',
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
  @Column({ name: 'equipment_id', type: 'uuid', nullable: false })
  equipment_id: string;

  @ApiProperty({ required: false, type: () => Equipment })
  @ManyToOne(() => Equipment, (equipment) => equipment.qashellings, {
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
  @ManyToOne(() => Branch, (branch) => branch.qashellings, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ApiProperty({
    required: false,
    type: () => [QashellingToPercentageOfKernel],
  })
  @OneToMany(
    () => QashellingToPercentageOfKernel,
    (qashellingToPercentageOfKernel) =>
      qashellingToPercentageOfKernel.qashelling,
    {
      cascade: true,
    },
  )
  qashellingToPercentageOfKernels: QashellingToPercentageOfKernel[];

  @ApiProperty({
    required: false,
    type: () => [QashellingToPercentageOfUnscooped],
  })
  @OneToMany(
    () => QashellingToPercentageOfUnscooped,
    (qashellingToPercentageOfUnscooped) =>
      qashellingToPercentageOfUnscooped.qashelling,
    {
      cascade: true,
    },
  )
  qashellingToPercentageOfUnscoopeds: QashellingToPercentageOfUnscooped[];

  @ApiProperty({
    required: false,
    type: () => [QashellingToHumidity],
  })
  @OneToMany(
    () => QashellingToHumidity,
    (qashellingToHumidity) => qashellingToHumidity.qashelling,
    {
      cascade: true,
    },
  )
  qashellingToHumidities: QashellingToHumidity[];

  @ApiProperty({
    required: false,
    type: () => [QashellingToKernel],
  })
  @OneToMany(
    () => QashellingToKernel,
    (qashellingToKernel) => qashellingToKernel.qashelling,
    {
      cascade: true,
    },
  )
  qashellingToKernels: QashellingToKernel[];

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

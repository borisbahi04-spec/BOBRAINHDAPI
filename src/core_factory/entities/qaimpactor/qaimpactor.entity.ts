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
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { Equipment } from 'src/core/entities/setting/equipment.entity';
import { QaimpactorStatusEnum } from 'src/core_factory/definitions/enums';
import { Shift } from '../setting/shift.entity';
import { Branch } from 'src/core/entities/subsidiary/branch.entity';
import { QaimpactorToFirstOutput } from './qaimpactor-to-firstoutput.entity';
import { QaimpactorToSecondOutput } from './qaimpactor-to-second-output.entity';
import { QaimpactorToShellingOutput } from './qaimpactor-to-shelling-output.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class Qaimpactor extends CoreEntity {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: `Référence` })
  @Index()
  @Column()
  reference: string;

  @IsOptional()
  @IsInt()
  @ApiProperty({ required: false, description: `input  %` })
  @Column({
    name: 'input',
    type: 'integer',
    unsigned: true,
    default: 0,
  })
  input: number;

  @IsNotEmpty()
  @IsIn(Object.values(QaimpactorStatusEnum))
  @ApiProperty({
    enum: QaimpactorStatusEnum,
    enumName: 'QaimpactorStatusEnum',
    default: QaimpactorStatusEnum.pending,
    description: `Status`,
  })
  @Column({ name: 'qaimpactor_status', default: QaimpactorStatusEnum.pending })
  status: QaimpactorStatusEnum;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ description: `Date de la qaimpactor` })
  @Column({
    name: 'qaimpactor_date',
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
  @ManyToOne(() => Shift, (shift) => shift.qaimpactors, {
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
  @ManyToOne(() => Equipment, (equipment) => equipment.qaimpactors, {
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
  @ManyToOne(() => Branch, (branch) => branch.qaimpactors, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ApiProperty({
    required: false,
    type: () => [QaimpactorToFirstOutput],
  })
  @OneToMany(
    () => QaimpactorToFirstOutput,
    (qaimpactorToFirstOutput) => qaimpactorToFirstOutput.qaimpactor,
    {
      cascade: true,
    },
  )
  qaimpactorToFirstOutputs: QaimpactorToFirstOutput[];

  @ApiProperty({
    required: false,
    type: () => [QaimpactorToSecondOutput],
  })
  @OneToMany(
    () => QaimpactorToSecondOutput,
    (qaimpactorToSecondOutput) => qaimpactorToSecondOutput.qaimpactor,
    {
      cascade: true,
    },
  )
  qaimpactorToSecondOutputs: QaimpactorToSecondOutput[];

  @ApiProperty({
    required: false,
    type: () => [QaimpactorToShellingOutput],
  })
  @OneToMany(
    () => QaimpactorToShellingOutput,
    (qaimpactorToShellingOutput) => qaimpactorToShellingOutput.qaimpactor,
    {
      cascade: true,
    },
  )
  qaimpactorToShellings: QaimpactorToShellingOutput[];

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

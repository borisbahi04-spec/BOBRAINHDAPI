import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
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
import { QapeelingStatusEnum } from 'src/core_factory/definitions/enums';
import { Shift } from '../setting/shift.entity';
import { Branch } from 'src/core/entities/subsidiary/branch.entity';
import { QashellingOutputToLotNumber } from '../qashelling/qashelling-output-to-lotnumber.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class Qapeeling extends CoreEntity {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: `Référence` })
  @Index()
  @Column()
  reference: string;

  @IsOptional()
  @IsInt()
  @ApiProperty({ required: false, description: `input moisture %` })
  @Column({
    name: 'input_moisture',
    type: 'integer',
    unsigned: true,
    default: 0,
  })
  inputMoisture: number;

  @IsOptional()
  @IsInt()
  @ApiProperty({ required: false, description: `Temps de prelèvement` })
  @Column({
    name: 'sampling_time',
    type: 'integer',
    unsigned: true,
    default: 0,
  })
  samplingTime: number;

  @IsOptional()
  @IsInt()
  @ApiProperty({ required: false, description: `Pression` })
  @Column({
    name: 'pression',
    type: 'integer',
    unsigned: true,
    default: 0,
  })
  pression: number;

  @IsNotEmpty()
  @IsIn(Object.values(QapeelingStatusEnum))
  @ApiProperty({
    enum: QapeelingStatusEnum,
    enumName: 'QapeelingStatusEnum',
    default: QapeelingStatusEnum.pending,
    description: `Status`,
  })
  @Column({ name: 'qapeeling_status', default: QapeelingStatusEnum.pending })
  status: QapeelingStatusEnum;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ description: `Date de la qapeeling` })
  @Column({
    name: 'qapeeling_date',
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
  @ManyToOne(() => Shift, (shift) => shift.qapeelings, {
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
  @ManyToOne(() => Equipment, (equipment) => equipment.qapeelings, {
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
  @ManyToOne(() => Branch, (branch) => branch.qapeelings, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @IsUUID()
  @IsNotEmpty()
  @Column({
    name: 'qashellingOutputToLotNumber_id',
    type: 'uuid',
    nullable: false,
  })
  qashellingOutputToLotNumberId: string;

  @ApiProperty({ required: false, type: () => QashellingOutputToLotNumber })
  @ManyToOne(
    () => QashellingOutputToLotNumber,
    (qashellingOutputToLotNumber) => qashellingOutputToLotNumber.qapeelings,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      orphanedRowAction: 'delete',
    },
  )
  @JoinColumn({ name: 'qashellingOutputToLotNumber_id' })
  qashellingOutputToLotNumber: QashellingOutputToLotNumber;

  /*
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
  qaimpactorToShellings: QaimpactorToShellingOutput[];*/

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

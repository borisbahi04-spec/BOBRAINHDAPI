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
import { RoasterStatusEnum } from 'src/core_factory/definitions/enums';
import { Branch } from 'src/core/entities/subsidiary/branch.entity';
import { Stack } from './stack.entity';
import { RoasterToHumidityAfterCooking } from './roaster-to-humidity-after-cooking.entity';
import { RoasterToHumidityAfterCooling } from './roaster-to-humidity-after-cooling.entity';
import { RoasterToHumidityBeforeCooking } from './roaster-to-humidity-before-cooking.entity';
import { RoasterToSetting } from './roaster-to-setting.entity';
import { Shift } from '../setting/shift.entity';
import { Qashelling } from '../qashelling/qashelling.entity';
import { Size } from '../setting/size.entity';
import { size } from 'lodash';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class Roaster extends CoreEntity {
  @IsNotEmpty()
  @IsIn(Object.values(RoasterStatusEnum))
  @ApiProperty({
    enum: RoasterStatusEnum,
    enumName: 'RoasterStatusEnum',
    default: RoasterStatusEnum.pending,
    description: `Status`,
  })
  @Column({ name: 'roaster_status', default: RoasterStatusEnum.pending })
  status: RoasterStatusEnum;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: `Référence` })
  @Index()
  @Column()
  reference: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ description: `Date de la roaster` })
  @Column({
    name: 'roaster_date',
    type: 'datetime',
    nullable: true,
    default: () => '(CURRENT_DATE)',
  })
  date: Date;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    required: true,
    description: `Quantité d'entrée RCN`,
  })
  @Column({
    type: 'integer',
    unsigned: true,
  })
  input: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    required: true,
    description: `Temps ecoulé en min`,
  })
  @Column({
    name: 'roaster_time',
    type: 'integer',
    unsigned: true,
  })
  time: number;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'size_id', type: 'uuid', nullable: false })
  sizeId: string;

  @ApiProperty({ required: false, type: () => Size })
  @ManyToOne(() => Shift, (size) => size.roasters, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'size_id' })
  size: Size;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'shift_id', type: 'uuid', nullable: false })
  shiftId: string;

  @ApiProperty({ required: false, type: () => Shift })
  @ManyToOne(() => Shift, (shift) => shift.roasters, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'stack_id', type: 'uuid', nullable: false })
  stackId: string;

  @ApiProperty({ required: false, type: () => Stack })
  @ManyToOne(() => Stack, (stack) => stack.roasters, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'stack_id' })
  stack: Stack;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'branch_id', type: 'uuid', nullable: false })
  branchId: string;

  @ApiProperty({ required: false, type: () => Branch })
  @ManyToOne(() => Branch, (branch) => branch.roasters, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ApiProperty({
    required: false,
    type: () => [RoasterToHumidityBeforeCooking],
  })
  @OneToMany(
    () => RoasterToHumidityBeforeCooking,
    (roasterToHumidityBeforeHumidity) =>
      roasterToHumidityBeforeHumidity.roaster,
    {
      cascade: true,
    },
  )
  roasterToHumidityBeforeCookings: RoasterToHumidityBeforeCooking[];

  @ApiProperty({ required: false, type: () => [RoasterToHumidityAfterCooking] })
  @OneToMany(
    () => RoasterToHumidityAfterCooking,
    (roasterToHumidityAfterCooking) => roasterToHumidityAfterCooking.roaster,
    {
      cascade: true,
    },
  )
  roasterToHumidityAfterCookings: RoasterToHumidityAfterCooking[];

  @ApiProperty({ required: false, type: () => [RoasterToHumidityAfterCooling] })
  @OneToMany(
    () => RoasterToHumidityAfterCooling,
    (roasterToHumidityAfterCooling) => roasterToHumidityAfterCooling.roaster,
    {
      cascade: true,
    },
  )
  roasterToHumidityAfterCoolings: RoasterToHumidityAfterCooling[];

  @ApiProperty({ required: false, type: () => [RoasterToSetting] })
  @OneToMany(
    () => RoasterToSetting,
    (roasterToSetting) => roasterToSetting.roaster,
    {
      cascade: true,
    },
  )
  roasterToSettings: RoasterToSetting[];

  @ApiProperty({ required: false, type: () => [Qashelling] })
  @OneToMany(() => Qashelling, (qashelling) => qashelling.roaster, {
    cascade: true,
  })
  qashellings: Qashelling[];

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

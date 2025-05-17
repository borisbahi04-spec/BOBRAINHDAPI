import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { SizeNameEnum } from 'src/core_factory/definitions/enums';
import { RoasterToHumidityBeforeCooking } from '../roaster/roaster-to-humidity-before-cooking.entity';
import { RoasterToHumidityAfterCooking } from '../roaster/roaster-to-humidity-after-cooking.entity';
import { RoasterToHumidityAfterCooling } from '../roaster/roaster-to-humidity-after-cooling.entity';
import { QashellingToPercentageOfKernel } from '../qashelling/qashelling-to-percentage-of-kernel.entity';
import { QashellingToPercentageOfUnscooped } from '../qashelling/qashelling-to-percentage-of-unscooped.entity';
import { QashellingToHumidity } from '../qashelling/qashelling-to-humidity.entity';
import { QashellingOutputToKernel } from '../qashelling/qashelling-output-to-kernel.entity';
import { QashellingToKernel } from '../qashelling/qashelling-to-kernel.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class CashewStage extends CoreEntity {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: `nom du grade` })
  @Index()
  @Column({ name: 'display_name' })
  displayName: SizeNameEnum;

  @IsString()
  @ApiProperty({ description: `description du grade` })
  @Column({ name: 'description', nullable: true })
  description: string;

  @ApiProperty({
    required: false,
    type: () => [RoasterToHumidityBeforeCooking],
  })
  @OneToMany(
    () => RoasterToHumidityBeforeCooking,
    (roasterToHumidityBeforeCooking) =>
      roasterToHumidityBeforeCooking.cashewStage,
    {
      cascade: true,
    },
  )
  roasterToHumidityBeforeCookings: RoasterToHumidityBeforeCooking[];

  @ApiProperty({ required: false, type: () => [RoasterToHumidityAfterCooking] })
  @OneToMany(
    () => RoasterToHumidityAfterCooking,
    (roasterToHumidityAfterCooking) =>
      roasterToHumidityAfterCooking.cashewStage,
    {
      cascade: true,
    },
  )
  roasterToHumidityAfterCookings: RoasterToHumidityAfterCooking[];

  @ApiProperty({ required: false, type: () => [RoasterToHumidityAfterCooling] })
  @OneToMany(
    () => RoasterToHumidityAfterCooling,
    (roasterToHumidityAfterCooling) =>
      roasterToHumidityAfterCooling.cashewStage,
    {
      cascade: true,
    },
  )
  roasterToHumidityAfterCoolings: RoasterToHumidityAfterCooling[];
  @ApiProperty({
    required: false,
    type: () => [QashellingToPercentageOfKernel],
  })
  @OneToMany(
    () => QashellingToPercentageOfKernel,
    (qashellingToPercentageOfKernel) =>
      qashellingToPercentageOfKernel.cashewStage,
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
      qashellingToPercentageOfUnscooped.cashewStage,
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
    (qashellingToHumidity) => qashellingToHumidity.cashewStage,
    {
      cascade: true,
    },
  )
  qashellingToHumidities: QashellingToHumidity[];

  @ApiProperty({
    required: false,
    type: () => [QashellingOutputToKernel],
  })
  @OneToMany(
    () => QashellingOutputToKernel,
    (qashellingOutputToKernel) => qashellingOutputToKernel.cashewStage,
    {
      cascade: true,
    },
  )
  qashellingOutputToKernels: QashellingOutputToKernel[];

  @ApiProperty({
    required: false,
    type: () => [QashellingToKernel],
  })
  @OneToMany(
    () => QashellingToKernel,
    (qashellingToKernel) => qashellingToKernel.cashewStage,
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

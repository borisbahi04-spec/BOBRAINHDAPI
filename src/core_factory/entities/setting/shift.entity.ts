import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { Roaster } from '../roaster/roaster.entity';
import { RoasterToHumidityAfterCooking } from '../roaster/roaster-to-humidity-after-cooking.entity';
import { RoasterToHumidityAfterCooling } from '../roaster/roaster-to-humidity-after-cooling.entity';
import { RoasterToHumidityBeforeCooking } from '../roaster/roaster-to-humidity-before-cooking.entity';
import { Qashelling } from '../qashelling/qashelling.entity';
import { QashellingToPercentageOfKernel } from '../qashelling/qashelling-to-percentage-of-kernel.entity';
import { QashellingToPercentageOfUnscooped } from '../qashelling/qashelling-to-percentage-of-unscooped.entity';
import { QashellingToHumidity } from '../qashelling/qashelling-to-humidity.entity';
import { QashellingOutputToKernel } from '../qashelling/qashelling-output-to-kernel.entity';
import { QashellingToKernel } from '../qashelling/qashelling-to-kernel.entity';
import { QashellingOutputToNetCount } from '../qashelling/qashelling-output-to-netcount.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class Shift extends CoreEntity {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: `noumero du shift` })
  @Index()
  @Column({ name: 'value' })
  value: number;

  @ApiProperty({ required: false, type: () => [Roaster] })
  @OneToMany(() => Roaster, (roaster) => roaster.shift, {
    cascade: true,
  })
  roasters: Roaster[];

  @ApiProperty({ required: false, type: () => [RoasterToHumidityAfterCooking] })
  @OneToMany(
    () => RoasterToHumidityAfterCooking,
    (roasterToHumidityAfterCooking) => roasterToHumidityAfterCooking.shift,
    {
      cascade: true,
    },
  )
  roasterToHumidityAfterCookings: RoasterToHumidityAfterCooking[];

  @ApiProperty({ required: false, type: () => [RoasterToHumidityAfterCooling] })
  @OneToMany(
    () => RoasterToHumidityAfterCooling,
    (roasterToHumidityAfterCooling) => roasterToHumidityAfterCooling.shift,
    {
      cascade: true,
    },
  )
  roasterToHumidityAfterCoolings: RoasterToHumidityAfterCooling[];

  @ApiProperty({
    required: false,
    type: () => [RoasterToHumidityBeforeCooking],
  })
  @OneToMany(
    () => RoasterToHumidityBeforeCooking,
    (roasterToHumidityBeforeCooking) => roasterToHumidityBeforeCooking.shift,
    {
      cascade: true,
    },
  )
  roasterToHumidityBeforeCookings: RoasterToHumidityBeforeCooking[];

  @ApiProperty({
    required: false,
    type: () => [Qashelling],
  })
  @OneToMany(() => Qashelling, (qashelling) => qashelling.shift, {
    cascade: true,
  })
  qashellings: Qashelling[];

  @ApiProperty({
    required: false,
    type: () => [QashellingToPercentageOfKernel],
  })
  @OneToMany(
    () => QashellingToPercentageOfKernel,
    (qashellingToPercentageOfKernel) => qashellingToPercentageOfKernel.shift,
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
      qashellingToPercentageOfUnscooped.shift,
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
    (qashellingToHumidity) => qashellingToHumidity.shift,
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
    (qashellingOutputToKernel) => qashellingOutputToKernel.shift,
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
    (qashellingToKernel) => qashellingToKernel.shift,
    {
      cascade: true,
    },
  )
  qashellingToKernels: QashellingToKernel[];

  @ApiProperty({
    required: false,
    type: () => [QashellingOutputToNetCount],
  })
  @OneToMany(
    () => QashellingOutputToNetCount,
    (qashellingOutputToNetCount) => qashellingOutputToNetCount.shift,
    {
      cascade: true,
    },
  )
  qashellingOutputToNetCounts: QashellingOutputToNetCount[];

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

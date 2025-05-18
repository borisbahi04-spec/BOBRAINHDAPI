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
import { QacycloneToKernel } from '../qacyclone/qacyclone-to-kernel.entity';
import { QacycloneToShellingOutput } from '../qacyclone/qacyclone-to-shellingoutput.entity';
import { Qacyclone } from '../qacyclone/qacyclone.entity';
import { Qaimpactor } from '../qaimpactor/qaimpactor.entity';
import { QaimpactorToFirstOutput } from '../qaimpactor/qaimpactor-to-firstoutput.entity';
import { QaimpactorToSecondOutput } from '../qaimpactor/qaimpactor-to-second-output.entity';
import { QashellingOutputToLotNumber } from '../qashelling/qashelling-output-to-lotnumber.entity';
import { QaimpactorToShellingOutput } from '../qaimpactor/qaimpactor-to-shelling-output.entity';

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

  @ApiProperty({
    required: false,
    type: () => [QacycloneToKernel],
  })
  @OneToMany(
    () => QacycloneToKernel,
    (qacycloneToKernel) => qacycloneToKernel.shift,
    {
      cascade: true,
    },
  )
  qacycloneToKernels: QacycloneToKernel[];

  @ApiProperty({
    required: false,
    type: () => [Qacyclone],
  })
  @OneToMany(() => Qacyclone, (qacyclone) => qacyclone.shift, {
    cascade: true,
  })
  qacyclones: Qacyclone[];

  @ApiProperty({
    required: false,
    type: () => [Qaimpactor],
  })
  @OneToMany(() => Qaimpactor, (qaimpactor) => qaimpactor.shift, {
    cascade: true,
  })
  qaimpactors: Qaimpactor[];

  @ApiProperty({
    required: false,
    type: () => [QaimpactorToFirstOutput],
  })
  @OneToMany(
    () => QaimpactorToFirstOutput,
    (qaimpactorToFirstOutput) => qaimpactorToFirstOutput.shift,
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
    (qaimpactorToSecondOutput) => qaimpactorToSecondOutput.shift,
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
    (qaimpactorToShellingOutput) => qaimpactorToShellingOutput.shift,
    {
      cascade: true,
    },
  )
  qaimpactorToShellingOutputs: QaimpactorToShellingOutput[];

  @ApiProperty({
    required: false,
    type: () => [QashellingOutputToLotNumber],
  })
  @OneToMany(
    () => QashellingOutputToLotNumber,
    (qashellingOutputToLotNumber) => qashellingOutputToLotNumber.shift,
    {
      cascade: true,
    },
  )
  qashellingOutputToLotNumbers: QashellingOutputToLotNumber[];

  @ApiProperty({
    required: false,
    type: () => [QacycloneToShellingOutput],
  })
  @OneToMany(
    () => QacycloneToShellingOutput,
    (qacycloneToShellingOutput) => qacycloneToShellingOutput.shift,
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

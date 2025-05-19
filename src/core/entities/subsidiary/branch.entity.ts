import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { CoreEntity } from '../base/core.entity';
import { User } from '../user/user.entity';
import { BranchToProduct } from './branch-to-product.entity';
//import { Order } from '../supply/order.entity';
import { BranchToUser } from './branch-to-user.entity';
import { BranchToModifier } from './branch-to-modifier.entity';
import { BranchToTax } from './branch-to-tax.entity';
import { BranchToDining } from './branch-to-dining.entity';
import { Department } from '../setting/department.entity';
import { Order } from '../stockmanagement/order.entity';
import { Reception } from '../stockmanagement/reception.entity';
import { Production } from '../stockmanagement/production.entity';
import { Selling } from '../selling/selling.entity';
import { Delivery } from '../selling/delivery.entity';
import { Stack } from 'src/core_factory/entities/roaster/stack.entity';
import { Roaster } from 'src/core_factory/entities/roaster/roaster.entity';
import { RoasterToHumidityAfterCooking } from 'src/core_factory/entities/roaster/roaster-to-humidity-after-cooking.entity';
import { RoasterToHumidityAfterCooling } from 'src/core_factory/entities/roaster/roaster-to-humidity-after-cooling.entity';
import { RoasterToHumidityBeforeCooking } from 'src/core_factory/entities/roaster/roaster-to-humidity-before-cooking.entity';
import { Qashelling } from 'src/core_factory/entities/qashelling/qashelling.entity';
import { QashellingToPercentageOfKernel } from 'src/core_factory/entities/qashelling/qashelling-to-percentage-of-kernel.entity';
import { instanceToPlain } from 'class-transformer';
import { QashellingToPercentageOfUnscooped } from 'src/core_factory/entities/qashelling/qashelling-to-percentage-of-unscooped.entity';
import { QashellingToHumidity } from 'src/core_factory/entities/qashelling/qashelling-to-humidity.entity';
import { QashellingOutputToKernel } from 'src/core_factory/entities/qashelling/qashelling-output-to-kernel.entity';
import { QashellingToKernel } from 'src/core_factory/entities/qashelling/qashelling-to-kernel.entity';
import { QashellingOutputToNetCount } from 'src/core_factory/entities/qashelling/qashelling-output-to-netcount.entity';
import { QacycloneToKernel } from 'src/core_factory/entities/qacyclone/qacyclone-to-kernel.entity';
import { QacycloneToShellingOutput } from 'src/core_factory/entities/qacyclone/qacyclone-to-shellingoutput.entity';
import { Qacyclone } from 'src/core_factory/entities/qacyclone/qacyclone.entity';
import { Qaimpactor } from 'src/core_factory/entities/qaimpactor/qaimpactor.entity';
import { QaimpactorToFirstOutput } from 'src/core_factory/entities/qaimpactor/qaimpactor-to-firstoutput.entity';
import { QaimpactorToSecondOutput } from 'src/core_factory/entities/qaimpactor/qaimpactor-to-second-output.entity';
import { QashellingOutputToLotNumber } from 'src/core_factory/entities/qashelling/qashelling-output-to-lotnumber.entity';
import { QaimpactorToShellingOutput } from 'src/core_factory/entities/qaimpactor/qaimpactor-to-shelling-output.entity';
import { Qapeeling } from 'src/core_factory/entities/qapeeling/qapeeling.entity';
import { QapeelingToInputKernel } from 'src/core_factory/entities/qapeeling/qapeeling-to-input-kernel.entity';
import { QapeelingToPeeledKernel } from 'src/core_factory/entities/qapeeling/qapeeling-to-peeled-kernel.entity';
import { QapeelingToUnpeeledKernel } from 'src/core_factory/entities/qapeeling/qapeeling-to-unpeeled-kernel.entity';
import { QapeelingToTestaKernel } from 'src/core_factory/entities/qapeeling/qapeeling-to-testa-kernel.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class Branch extends CoreEntity {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: `Nom` })
  @Column({ name: 'display_name' })
  displayName: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, description: `Actif` })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: `Téléphone` })
  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ required: false, description: `Email` })
  @Column({ nullable: true })
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: `Adresse` })
  @Column({ nullable: true })
  address: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: `Ville` })
  @Column({ nullable: true })
  city: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, description: `Maison mère`, default: false })
  @Column({ nullable: true, default: false })
  isParentCompany: boolean;

  @ApiProperty({ required: false, type: () => [User] })
  @OneToMany(() => User, (user) => user.branch)
  users: User[];

  @ApiProperty({ required: false, type: () => [Delivery] })
  @OneToMany(() => Delivery, (delivery) => delivery.branch, {
    cascade: true,
  })
  deliverys: Delivery[];

  @ApiProperty({ required: false, type: () => [BranchToProduct] })
  @OneToMany(() => BranchToProduct, (banchToProduct) => banchToProduct.branch, {
    cascade: true,
  })
  branchToProducts: BranchToProduct[];

  @ApiProperty({ required: false, type: () => [BranchToUser] })
  @OneToMany(() => BranchToUser, (branchToUser) => branchToUser.branch, {
    cascade: true,
  })
  branchToUsers: BranchToUser[];

  @ApiProperty({ required: false, type: () => [BranchToModifier] })
  @OneToMany(
    () => BranchToModifier,
    (branchToModifier) => branchToModifier.modifier,
    {
      cascade: true,
    },
  )
  branchToModifiers: BranchToModifier[];

  @ApiProperty({ required: false, type: () => [BranchToTax] })
  @OneToMany(() => BranchToTax, (branchToTax) => branchToTax.tax, {
    cascade: true,
  })
  branchToTaxs: BranchToTax[];

  @ApiProperty({ required: false, type: () => [BranchToDining] })
  @OneToMany(() => BranchToDining, (branchToDining) => branchToDining.dining, {
    cascade: true,
  })
  branchToDinings: BranchToDining[];

  @ApiProperty({ required: false, type: () => [Department] })
  @OneToMany(() => Department, (department) => department.branch, {
    cascade: true,
  })
  departments: Department[];

  @ApiProperty({ required: false, type: () => [Order] })
  @OneToMany(() => Order, (order) => order.branch, {
    cascade: true,
  })
  orders: Order[];

  @ApiProperty({ required: false, type: () => [Stack] })
  @OneToMany(() => Stack, (stack) => stack.branch, {
    cascade: true,
  })
  stacks: Stack[];

  @ApiProperty({ required: false, type: () => [Roaster] })
  @OneToMany(() => Stack, (roaster) => roaster.branch, {
    cascade: true,
  })
  roasters: Roaster[];

  @ApiProperty({ required: false, type: () => [Selling] })
  @OneToMany(() => Selling, (selling) => selling.branch, {
    cascade: true,
  })
  sellings: Selling[];

  @ApiProperty({ required: false, type: () => [Reception] })
  @OneToMany(() => Reception, (reception) => reception.branch, {
    cascade: true,
  })
  receptions: Reception[];

  @ApiProperty({ required: false, type: () => [Production] })
  @OneToMany(() => Production, (production) => production.branch, {
    cascade: true,
  })
  productions: Production[];

  @ApiProperty({
    required: false,
    type: () => [RoasterToHumidityBeforeCooking],
  })
  @OneToMany(
    () => RoasterToHumidityBeforeCooking,
    (roasterToBeforeHumidity) => roasterToBeforeHumidity.branch,
    {
      cascade: true,
    },
  )
  roasterToHumidityBeforeCookings: RoasterToHumidityBeforeCooking[];

  @ApiProperty({ required: false, type: () => [RoasterToHumidityAfterCooking] })
  @OneToMany(
    () => RoasterToHumidityAfterCooking,
    (roasterToHumidityAfterCooking) => roasterToHumidityAfterCooking.branch,
    {
      cascade: true,
    },
  )
  roasterToHumidityAfterCookings: RoasterToHumidityAfterCooking[];

  @ApiProperty({ required: false, type: () => [RoasterToHumidityAfterCooling] })
  @OneToMany(
    () => RoasterToHumidityAfterCooling,
    (roasterToHumidityAfterCooling) => roasterToHumidityAfterCooling.branch,
    {
      cascade: true,
    },
  )
  roasterToHumidityAfterCoolings: RoasterToHumidityAfterCooling[];

  @ApiProperty({ required: false, type: () => [Qashelling] })
  @OneToMany(() => Qashelling, (qashelling) => qashelling.branch, {
    cascade: true,
  })
  qashellings: Qashelling[];

  @ApiProperty({
    required: false,
    type: () => [QashellingToPercentageOfKernel],
  })
  @OneToMany(
    () => QashellingToPercentageOfKernel,
    (qashellingToPercentageOfKernel) => qashellingToPercentageOfKernel.branch,
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
      qashellingToPercentageOfUnscooped.branch,
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
    (qashellingToHumidity) => qashellingToHumidity.branch,
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
    (qashellingOutputToKernel) => qashellingOutputToKernel.branch,
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
    (qashellingToKernel) => qashellingToKernel.branch,
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
    (qashellingOutputToNetCount) => qashellingOutputToNetCount.branch,
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
    (qacycloneToKernel) => qacycloneToKernel.branch,
    {
      cascade: true,
    },
  )
  qacycloneToKernels: QacycloneToKernel[];

  @ApiProperty({
    required: false,
    type: () => [Qacyclone],
  })
  @OneToMany(() => Qacyclone, (qacyclone) => qacyclone.branch, {
    cascade: true,
  })
  qacyclones: Qacyclone[];

  @ApiProperty({
    required: false,
    type: () => [Qaimpactor],
  })
  @OneToMany(() => Qaimpactor, (qaimpactor) => qaimpactor.branch, {
    cascade: true,
  })
  qaimpactors: Qaimpactor[];

  @ApiProperty({
    required: false,
    type: () => [Qapeeling],
  })
  @OneToMany(() => Qapeeling, (qapeeling) => qapeeling.branch, {
    cascade: true,
  })
  qapeelings: Qapeeling[];

  @ApiProperty({
    required: false,
    type: () => [QaimpactorToFirstOutput],
  })
  @OneToMany(
    () => QaimpactorToFirstOutput,
    (qaimpactorToFirstOutput) => qaimpactorToFirstOutput.branch,
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
    (qaimpactorToSecondOutput) => qaimpactorToSecondOutput.branch,
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
    (qaimpactorToShellingOutput) => qaimpactorToShellingOutput.branch,
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
    (qashellingOutputToLotNumber) => qashellingOutputToLotNumber.branch,
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
    (qacycloneToShellingOutput) => qacycloneToShellingOutput.branch,
    {
      cascade: true,
    },
  )
  qacycloneToShellingOutputs: QacycloneToShellingOutput[];

  @ApiProperty({
    required: false,
    type: () => [QapeelingToInputKernel],
  })
  @OneToMany(
    () => QapeelingToInputKernel,
    (qapeelingToInputKernel) => qapeelingToInputKernel.branch,
    {
      cascade: true,
    },
  )
  qapeelingToInputKernels: QapeelingToInputKernel[];

  @ApiProperty({
    required: false,
    type: () => [QapeelingToPeeledKernel],
  })
  @OneToMany(
    () => QapeelingToPeeledKernel,
    (qapeelingToPeeledKernel) => qapeelingToPeeledKernel.branch,
    {
      cascade: true,
    },
  )
  qapeelingToPeeledKernels: QapeelingToPeeledKernel[];

  @ApiProperty({
    required: false,
    type: () => [QapeelingToUnpeeledKernel],
  })
  @OneToMany(
    () => QapeelingToUnpeeledKernel,
    (qapeelingToUnpeeledKernel) => qapeelingToUnpeeledKernel.branch,
    {
      cascade: true,
    },
  )
  qapeelingToUnpeeledKernels: QapeelingToUnpeeledKernel[];

  @ApiProperty({
    required: false,
    type: () => [QapeelingToTestaKernel],
  })
  @OneToMany(
    () => QapeelingToTestaKernel,
    (qapeelingToTestaKernel) => qapeelingToTestaKernel.branch,
    {
      cascade: true,
    },
  )
  qapeelingToTestaKernels: QapeelingToTestaKernel[];

  toJSON() {
    return instanceToPlain(this);
  }
}

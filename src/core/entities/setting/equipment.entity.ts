import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CoreEntity } from '../base/core.entity';
import { instanceToPlain } from 'class-transformer';
import { EquipmentType } from './equipment-type.entity';
import { Section } from './section.entity';
import { SellingToProduct } from '../selling/selling-to-product.entity';
import { DeliveryToProduct } from '../selling/delivery-to-product.entity';
import { Qashelling } from 'src/core_factory/entities/qashelling/qashelling.entity';
import { Qacyclone } from 'src/core_factory/entities/qacyclone/qacyclone.entity';
import { Qaimpactor } from 'src/core_factory/entities/qaimpactor/qaimpactor.entity';
import { Qapeeling } from 'src/core_factory/entities/qapeeling/qapeeling.entity';
import { Roaster } from 'src/core_factory/entities/roaster/roaster.entity';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class Equipment extends CoreEntity {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: `Nom` })
  @Index()
  @Column({ name: 'display_name' })
  displayName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ required: false })
  @Column({ name: 'equipmenttype_id', type: 'uuid', nullable: true })
  equipmenttypeId: string;

  @ApiProperty({
    type: () => EquipmentType,
    description: `Type de l'equipement destination`,
  })
  @ManyToOne(() => EquipmentType, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'equipmenttype_id' })
  equipmentType: EquipmentType;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ required: false })
  @Column({ name: 'section_id', type: 'uuid', nullable: true })
  sectionId: string;
  @ApiProperty({
    type: () => Section,
    description: `la section a laquelle appartient lequipement`,
  })
  @ManyToOne(() => Section, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @ApiProperty({ required: false, type: () => [SellingToProduct] })
  @OneToMany(
    () => SellingToProduct,
    (sellingToProduct) => sellingToProduct.equipment,
    {
      cascade: true,
    },
  )
  sellingToProducts: SellingToProduct[];

  @ApiProperty({ required: false, type: () => [DeliveryToProduct] })
  @OneToMany(
    () => DeliveryToProduct,
    (deliveryToProduct) => deliveryToProduct.equipment,
    {
      cascade: true,
    },
  )
  deliveryToProducts: DeliveryToProduct[];

  @ApiProperty({ required: false, type: () => [Qashelling] })
  @OneToMany(() => Qashelling, (qashelling) => qashelling.equipment, {
    cascade: true,
  })
  qashellings: Qashelling[];

  @ApiProperty({
    required: false,
    type: () => [Qacyclone],
  })
  @OneToMany(() => Qacyclone, (qacyclone) => qacyclone.equipment, {
    cascade: true,
  })
  qacyclones: Qacyclone[];

  @ApiProperty({
    required: false,
    type: () => [Qaimpactor],
  })
  @OneToMany(() => Qaimpactor, (qaimpactor) => qaimpactor.equipment, {
    cascade: true,
  })
  qaimpactors: Qaimpactor[];

  @ApiProperty({
    required: false,
    type: () => [Qapeeling],
  })
  @OneToMany(() => Qapeeling, (qapeeling) => qapeeling.equipment, {
    cascade: true,
  })
  qapeelings: Qapeeling[];

  @ApiProperty({
    required: false,
    type: () => [Roaster],
  })
  @OneToMany(() => Roaster, (roaster) => roaster.equipment, {
    cascade: true,
  })
  roasters: Roaster[];

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

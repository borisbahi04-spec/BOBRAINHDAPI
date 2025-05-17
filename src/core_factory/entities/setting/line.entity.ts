import { Column, Entity, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { instanceToPlain } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { CoreEntity } from 'src/core/entities/base/core.entity';
import { SizeNameEnum } from 'src/core_factory/definitions/enums';

@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class Line extends CoreEntity {
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

 /* @ApiProperty({
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
  roasterToHumidityBeforeCookings: RoasterToHumidityBeforeCooking[];*/



  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

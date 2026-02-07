import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { CoreEntity } from '../base/core.entity';
import { instanceToPlain } from 'class-transformer';
import { Requester } from './requester.entity';
@Entity({
  orderBy: { createdAt: 'DESC', updatedAt: 'DESC' },
})
export class RequestType extends CoreEntity {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: `Nom` })
  @Column({ name: 'display_name' })
  displayName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ required: false, type: () => [Requester] })
  @OneToMany(() => Requester, (requester) => requester.requesttype)
  requesters: Requester[];


  toJSON() {
    return instanceToPlain(this);
  }
}

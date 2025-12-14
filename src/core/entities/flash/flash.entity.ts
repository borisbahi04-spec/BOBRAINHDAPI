import { Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CoreEntity } from '../base/core.entity';
import { instanceToPlain } from 'class-transformer';
import { Entity } from 'typeorm';

@Entity()
export class Flash extends CoreEntity {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: `Référence` })
  @Index()
  @Column()
  reference: string;

  @IsString()
  @ApiProperty({ description: `ticket BC` })
  @Column({ nullable: true })
  ticket: string;

  @IsNumber()
  @ApiProperty({ description: `input validate from BC` })
  @Column({ name: 'input_from_bc', nullable: true })
  inputFromBc: number;

  @IsNumber()
  @ApiProperty({ description: `output validate from BC` })
  @Column({ name: 'output_from_bc', nullable: true })
  outputFromBc: number;

  @IsNumber()
  @ApiProperty({ description: `weight sent to  BC` })
  @Column({ name: 'sent_weight', nullable: true })
  sentWeight: number;

  @IsString()
  @ApiProperty({ description: `computer user CL` })
  @Column({ name: 'computer_user', nullable: true })
  computerUser: string;

  @IsString()
  @ApiProperty({ description: `frame CL` })
  @Column({ name: 'frame', nullable: true })
  frame: string;

  @IsString()
  @ApiProperty({ description: `Station CL` })
  @Column({ name: 'station', nullable: true })
  station: string;

  @IsString()
  @ApiProperty({ description: `user name CL` })
  @Column({ name: 'user_name', nullable: true })
  userName: string;

  @IsString()
  @ApiProperty({ description: `computer user CL` })
  @Column({ name: 'computer_name', nullable: true })
  computerName: string;

  @IsString()
  @ApiProperty({ description: `computer user profile CL` })
  @Column({ name: 'user_profile', nullable: true })
  userProfile: string;

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

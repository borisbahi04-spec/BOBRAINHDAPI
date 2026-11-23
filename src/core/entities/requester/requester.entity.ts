import {
  Column,
  CreateDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CoreEntity } from '../base/core.entity';
import { instanceToPlain } from 'class-transformer';
import { Entity } from 'typeorm';
import { Station } from '../station/station';
import { RequestType } from './request-type';
import { PriorityEnum, RequesterStatusEnum } from 'src/core/definitions/enums';
import { Branch } from '../subsidiary/branch.entity';
import { AuthUser } from '../session/auth-user.entity';
import { LabAgent } from './lab-agent.entity';
import { User } from '../user/user.entity';

@Entity()
export class Requester extends CoreEntity {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: `Référence` })
  @Index()
  @Column()
  reference: string;

  @IsString()
  @ApiProperty({ description: `ticket` })
  @Column({ nullable: false })
  ticket: string;

  @IsString()
  @ApiProperty({ description: `priority` })
  @Column({ nullable: true, default: PriorityEnum.Normal })
  priority: string;

  /**
   * @deprecated Champ conservé pour l'historique (n'est plus saisi).
   */
  @IsOptional()
  @IsString()
  @ApiProperty({ description: `Ancien titre (déprécié)`, required: false })
  @Column({ nullable: true })
  title: string;

  @IsString()
  @ApiProperty({ description: `Description du problème`, required: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @IsString()
  @ApiProperty({ description: `Correction à réaliser`, required: true })
  @Column({ name: 'correction', type: 'text', nullable: true })
  correction: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({ description: `Agent labo ayant commis l'erreur` })
  @Index()
  @Column({ name: 'lab_agent_id', type: 'uuid', nullable: true })
  labAgentId: string;

  @ApiPropertyOptional({ type: () => LabAgent })
  @ManyToOne(() => LabAgent, (agent) => agent.requesters, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'lab_agent_id' })
  labAgent: LabAgent;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({ description: `Opératrice concernée` })
  @Index()
  @Column({ name: 'operator_id', type: 'uuid', nullable: true })
  operatorId: string;

  @ApiPropertyOptional({ type: () => User })
  @ManyToOne(() => User, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'operator_id' })
  operator: User;

  @IsString()
  @ApiProperty({ description: `Statut` })
  @Column({ name: 'status', nullable: true, default: RequesterStatusEnum.Open })
  status: string;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'station_id', type: 'uuid', nullable: true })
  stationId: string;

  @ApiProperty({ type: 'object', description: `Station` })
  @ManyToOne(() => Station, (station) => station.requesters, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'requesttype_id', type: 'uuid', nullable: true })
  requesttypeId: string;

  @ApiProperty({ type: 'object', description: `requesttype` })
  @ManyToOne(() => RequestType, (requesttype) => requesttype.requesters, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'requesttype_id' })
  requesttype: RequestType;

  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId: string;

  @ApiProperty({ type: 'object', description: `Succursale` })
  @ManyToOne(() => Branch, (branch) => branch.users, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ApiProperty({
    description: 'La date dapprobation ',
    required: false,
  })
  @CreateDateColumn({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @ApiPropertyOptional()
  @Column({
    name: 'approved_by_id',
    nullable: true,
    type: 'uuid',
  })
  @IsOptional()
  approvedById: string;

  @ApiPropertyOptional({ type: 'object' })
  @ManyToOne(() => AuthUser, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: AuthUser;

  @ApiProperty({
    description: 'La date de rejet',
    required: false,
  })
  @CreateDateColumn({ name: 'rejected_at', nullable: true })
  rejectedAt: Date;

  @ApiPropertyOptional()
  @Column({
    name: 'rejected_by_id',
    nullable: true,
    type: 'uuid',
  })
  @IsOptional()
  rejectedById: string;

  @ApiPropertyOptional({ type: 'object' })
  @ManyToOne(() => AuthUser, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'rejected_by_id' })
  rejectedBy: AuthUser;

  @ApiProperty({
    description: 'La date dapprobation ',
    required: false,
  })
  @CreateDateColumn({ name: 'cancelled_at', nullable: true })
  cancelledAt: Date;

  @ApiPropertyOptional()
  @Column({
    name: 'cancelled_by_id',
    nullable: true,
    type: 'uuid',
  })
  @IsOptional()
  cancelledById: string;

  @ApiPropertyOptional({ type: 'object' })
  @ManyToOne(() => AuthUser, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'cancelled_by_id' })
  cancelledBy: AuthUser;

  @ApiProperty({
    description: 'La date de traitement',
    required: false,
  })
  @CreateDateColumn({ name: 'treated_at', nullable: true })
  treatedAt: Date;

  @ApiPropertyOptional()
  @Column({
    name: 'treated_by_id',
    nullable: true,
    type: 'uuid',
  })
  @IsOptional()
  treatedById: string;

  @ApiPropertyOptional({ type: 'object' })
  @ManyToOne(() => AuthUser, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'treated_by_id' })
  treatedBy: AuthUser;

  @ApiPropertyOptional()
  @Column({
    name: 'closed_by_id',
    nullable: true,
    type: 'uuid',
  })
  @IsOptional()
  closedById: string;

  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

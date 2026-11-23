import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { instanceToPlain } from 'class-transformer';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { CoreEntity } from '../base/core.entity';
import { Requester } from './requester.entity';

/**
 * Agent de laboratoire.
 * Personne pouvant être à l'origine d'une erreur ayant donné lieu
 * à une demande d'intervention. N'a pas besoin de compte helpdesk.
 */
@Entity({
  name: 'lab_agent',
  orderBy: { lastName: 'ASC', firstName: 'ASC' },
})
export class LabAgent extends CoreEntity {
  @IsNotEmpty({ message: 'Le matricule est obligatoire' })
  @IsString()
  @Length(2, 30, { message: 'Le matricule doit contenir entre 2 et 30 caractères' })
  @Matches(/^[A-Za-z0-9._-]+$/, {
    message: 'Le matricule ne doit contenir que lettres, chiffres, ".", "_" ou "-"',
  })
  @ApiProperty({ description: 'Matricule (unique)' })
  @Index({ unique: true })
  @Column({ name: 'matricule', length: 30 })
  matricule: string;

  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @IsString()
  @Length(2, 80)
  @ApiProperty({ description: 'Nom' })
  @Column({ name: 'last_name', length: 80 })
  lastName: string;

  @IsOptional()
  @IsString()
  @Length(0, 120)
  @ApiProperty({ description: 'Prénoms', required: false })
  @Column({ name: 'first_name', length: 120, nullable: true })
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  @ApiProperty({ description: 'Téléphone', required: false })
  @Column({ name: 'phone_number', length: 30, nullable: true })
  phoneNumber: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Actif', required: false, default: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ required: false, type: () => [Requester] })
  @OneToMany(() => Requester, (requester) => requester.labAgent)
  requesters: Requester[];

  get displayName(): string {
    return [this.lastName, this.firstName].filter(Boolean).join(' ');
  }

  toJSON() {
    return { ...instanceToPlain(this), displayName: this.displayName };
  }
}

import { Column, Index } from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  AbilityTuple,
  CanParameters,
  createMongoAbility,
  RawRule,
} from '@casl/ability';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import _ from 'lodash';
import {
  RolePermissionsType,
  RoleFieldPermissionsType,
} from '../../definitions/types';
import { CoreEntity } from '../base/core.entity';
import { Exclude, instanceToPlain } from 'class-transformer';
import { AbilityActionEnum, AbilitySubjectEnum } from '../../definitions/enums';
import { Entity } from 'typeorm';

@Entity()
export class Role extends CoreEntity {
  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  private _abilityRules: RawRule[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: `Code`, uniqueItems: true })
  @Index()
  @Column()
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: `Nom` })
  @Column({ name: 'display_name' })
  displayName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, description: `Actif` })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  @Column({ name: 'admin_permission', nullable: true, default: false })
  adminPermission: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  @Column({ name: 'send_requester_email', nullable: true, default: false })
  sendRequesterEmail: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  @Column({ name: 'is_for_operator', nullable: true, default: false })
  isForOperator: boolean;

  @IsOptional()
  @ApiProperty({ required: false })
  @Column({ type: 'simple-json', nullable: true })
  permissions: RolePermissionsType;

  /**
   * Methods *******************************************
   */
  async can(...args: CanParameters<AbilityTuple>) {
    return (await this.buildAbility()).can(...args);
  }

  async cannot(...args: CanParameters<AbilityTuple>) {
    return (await this.buildAbility()).cannot(...args);
  }

  async buildAbilityRules() {
    if (!_.isEmpty(this._abilityRules)) return this._abilityRules;
    let rules: RawRule[] = [];
    let rule: RawRule;
    for (const [key, value] of Object.entries(
      this?.permissions ?? ({} as RolePermissionsType),
    )) {
      if (value === true) {
        rules.push({ action: AbilitySubjectEnum.all, subject: key } as RawRule);
      } else {
        if (_.isPlainObject(value)) {
          for (const [actionKey, actionValue] of Object.entries(value)) {
            if (actionValue === true) {
              rule = { action: actionKey, subject: key } as RawRule;
              //rule = this.applyFieldPermissions(rule, this.permissions);
              rules.push(rule);
            }
            rule = null;
          }
        }
      }
    }
    rules = this.applyPermission(rules, this.adminPermission);
    console.log('sdsdsdsd1', rules);
    this._abilityRules = rules;

    return rules;
  }

  async buildAbility(rules?: RawRule[]) {
    console.log('sdsdsdsd565', await this.buildAbilityRules());
    return createMongoAbility(
      rules ?? ((await this.buildAbilityRules()) as any),
    );
  }

  private applyFieldPermissions(
    rule: RawRule,
    fieldPermissions: RoleFieldPermissionsType,
  ) {
    if (_.isEmpty(fieldPermissions)) return rule;

    if (!_.isEmpty(fieldPermissions[String(rule.subject)]?.read)) {
      if (~[AbilityActionEnum.read].indexOf(rule.action as any)) {
        rule.fields = _.concat(
          rule.fields ?? [],
          fieldPermissions[String(rule.subject)]?.read ?? [],
        );
      }
    }

    if (!_.isEmpty(fieldPermissions[String(rule.subject)]?.edit)) {
      if (
        ~[AbilityActionEnum.create, AbilityActionEnum.edit].indexOf(
          rule.action as any,
        )
      ) {
        rule.fields = _.concat(
          rule.fields ?? [],
          fieldPermissions[String(rule.subject)]?.edit ?? [],
        );
      }
    }

    return rule;
  }

  private applyPermission(rules: RawRule[], adminPermission: boolean) {
    if (adminPermission !== true) {
      rules.push(
        {
          subject: AbilitySubjectEnum.Requester,
          action: AbilityActionEnum.read,
        },
        {
          subject: AbilitySubjectEnum.Branch,
          action: AbilityActionEnum.read,
        },
      );
      return rules;
    }

    rules.push({
      subject: AbilitySubjectEnum.all,
      action: AbilityActionEnum.manage,
    });

    return rules;
  }

  private applyAdminPermission(rules: RawRule[], adminPermission: boolean) {
    if (adminPermission !== true) return rules;

    rules.push({
      subject: AbilitySubjectEnum.all,
      action: AbilityActionEnum.manage,
    });

    return rules;
  }

  private applyGuestPermission(rules: RawRule[], guestPermission: boolean) {
    if (guestPermission !== true) return rules;

    rules.push({
      subject: AbilitySubjectEnum.all,
      action: AbilityActionEnum.read,
    });

    return rules;
  }
  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

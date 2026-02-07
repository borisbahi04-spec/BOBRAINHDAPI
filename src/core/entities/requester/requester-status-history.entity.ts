import { Column, ManyToOne } from 'typeorm';
import { CoreEntity } from '../base/core.entity';
import { instanceToPlain } from 'class-transformer';
import { Entity } from 'typeorm';
import { RequesterStatusEnum } from 'src/core/definitions/enums';
import { User } from '../user/user.entity';
import { Requester } from './requester.entity';

@Entity()
export class RequesterStatusHistory extends CoreEntity {
  @ManyToOne(() => Requester, { onDelete: 'CASCADE' })
  requester: Requester;

  @Column({
    type: 'enum',
    enum: RequesterStatusEnum,
  })
  fromStatus: RequesterStatusEnum;

  @Column({
    type: 'enum',
    enum: RequesterStatusEnum,
  })
  toStatus: RequesterStatusEnum;

  @ManyToOne(() => User)
  actionBy: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  actionAt: Date;

  @Column({ type: 'text', nullable: true })
  comment: string;
  toJSON() {
    return instanceToPlain(this);
  }
  // END Methods **************************************
}

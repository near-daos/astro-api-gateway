import { Column, Entity, ObjectIdColumn } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class Account extends BaseEntity {
  @ObjectIdColumn({ unique: true })
  id: string;

  // @Column()
  // kycApproved: boolean;
}

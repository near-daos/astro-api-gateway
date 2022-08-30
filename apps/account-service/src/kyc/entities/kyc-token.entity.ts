import { Column, Entity, ObjectIdColumn } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';

@Entity()
export class KYCToken extends BaseEntity {
  @ObjectIdColumn({ unique: true, generated: false })
  _id: string;

  @Column()
  tokenId: string;
}

import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common';

@Entity()
export class Token extends BaseEntity {
  @Column()
  token: string;
}

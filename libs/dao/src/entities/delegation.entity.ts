import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Dao } from './dao.entity';

@Entity()
export class Delegation {
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @Column()
  daoId: string;

  @ManyToOne(() => Dao, (dao) => dao.delegations)
  @JoinColumn({ name: 'dao_id' })
  dao: Dao;

  @Column()
  accountId: string;

  @Column({ type: 'bigint' })
  balance: string;

  @Column({ nullable: true, type: 'jsonb' })
  delegators: Record<string, any>;
}

import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Dao {
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @Column()
  amount: string;

  @Column()
  bond: string;

  @Column()
  purpose: string;

  @Column()
  votePeriod: string;

  @Column("text", { array: true })
  members: string[];

  @Column()
  numberOfProposals: number;

  @Column()
  numberOfMembers: number;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}

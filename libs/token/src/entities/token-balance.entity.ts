import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Token } from './token.entity';

@Entity()
export class TokenBalance {
  @ApiProperty()
  @PrimaryColumn({ type: 'text', unique: true })
  id: string;

  @ApiProperty()
  @Column()
  tokenId: string;

  @ManyToOne(() => Token, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'token_id' })
  token: Token;

  @ApiProperty()
  @Column()
  accountId: string;

  @ApiProperty()
  @Column()
  balance: string;
}

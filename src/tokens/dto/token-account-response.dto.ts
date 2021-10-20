import { ApiProperty } from '@nestjs/swagger';
import { TransactionInfo } from 'src/common/dto/TransactionInfo';
import { Token } from '../entities/token.entity';

export class TokenAccountResponseDto extends TransactionInfo implements Token {
  @ApiProperty()
  decimals: number;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  referenceHash: string;

  @ApiProperty()
  spec: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  isArchived: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  id: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  totalSupply: string;

  @ApiProperty()
  tokenId: string;

  @ApiProperty()
  balance: string;
}

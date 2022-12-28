import { ApiProperty } from '@nestjs/swagger';
import { NearTransactionActionKind } from '@sputnik-v2/near-api';

export class DaoFundsTokenReceiptDto {
  @ApiProperty()
  daoId: string;

  @ApiProperty()
  receiptId: string;

  @ApiProperty()
  indexInReceipt: number;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  receiverId: string;

  @ApiProperty()
  tokenId: string;

  @ApiProperty()
  kind: NearTransactionActionKind;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  deposit?: string;

  @ApiProperty()
  methodName?: string;

  @ApiProperty()
  args?: any;

  @ApiProperty()
  transactionHash: string;

  @ApiProperty()
  updateTransactionHash?: string;

  @ApiProperty()
  createTimestamp: string;

  @ApiProperty()
  updateTimestamp?: string;

  @ApiProperty()
  createdAt?: number;

  @ApiProperty()
  updatedAt?: number;

  @ApiProperty()
  isArchived?: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { NearTransactionActionKind } from '@sputnik-v2/near-api';

export class DaoFundsReceiptDto {
  @ApiProperty()
  daoId: string;

  @ApiProperty()
  receiptId: string;

  @ApiProperty()
  indexInReceipt: number;

  @ApiProperty()
  predecessorId: string;

  @ApiProperty()
  receiverId: string;

  @ApiProperty()
  kind: NearTransactionActionKind;

  @ApiProperty()
  deposit: string;

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

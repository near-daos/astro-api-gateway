import { ApiProperty } from '@nestjs/swagger';

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
  amount: string;

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

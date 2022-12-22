import { ApiProperty } from '@nestjs/swagger';

export class TreasuryTokenReceiptActionDto {
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

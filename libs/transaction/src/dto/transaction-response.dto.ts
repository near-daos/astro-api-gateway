import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from '@sputnik-v2/common';
import { Transaction } from '@sputnik-v2/near-indexer/entities';

export class TransactionResponse extends BaseResponse<Transaction> {
  @ApiProperty({ type: [Transaction] })
  data: Transaction[];
}

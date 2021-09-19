import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/common/dto/BaseResponse';
import { Transaction } from 'src/near';

export class TransactionResponse extends BaseResponse<Transaction> {
  @ApiProperty({ type: [Transaction] })
  data: Transaction[];
}

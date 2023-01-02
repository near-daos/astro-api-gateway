import { Module } from '@nestjs/common';
import { DaoFundsTokenReceiptService } from '@sputnik-v2/dao-funds/dao-funds-token-receipt.service';
import { DynamodbModule } from '@sputnik-v2/dynamodb';
import { DaoFundsReceiptService } from './dao-funds-receipt.service';

@Module({
  imports: [DynamodbModule],
  providers: [DaoFundsReceiptService, DaoFundsTokenReceiptService],
  exports: [DaoFundsReceiptService, DaoFundsTokenReceiptService],
})
export class DaoFundsModule {}

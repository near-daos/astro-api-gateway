import { Module } from '@nestjs/common';
import { DynamodbModule } from '@sputnik-v2/dynamodb';
import { TreasuryTokenReceiptActionService } from '@sputnik-v2/treasury/treasury-token-receipt-action.service';
import { TreasuryReceiptActionService } from './treasury-receipt-action.service';

@Module({
  imports: [DynamodbModule],
  providers: [TreasuryReceiptActionService, TreasuryTokenReceiptActionService],
  exports: [TreasuryReceiptActionService, TreasuryTokenReceiptActionService],
})
export class TreasuryModule {}

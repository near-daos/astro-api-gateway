import { Module } from '@nestjs/common';

import { AggregatorService } from './aggregator.service';
import { NearModule } from 'apps/api/src/near/near.module';
import { KYCModule } from '../kyc';

@Module({
  imports: [NearModule, KYCModule],
  providers: [AggregatorService],
  exports: [AggregatorService],
})
export class AggregatorModule {}

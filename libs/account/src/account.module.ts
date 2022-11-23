import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotifiClientModule } from '@sputnik-v2/notifi-client';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags/feature-flags.module';
import { DynamodbModule } from '@sputnik-v2/dynamodb/dynamodb.module';
import { OtpModule } from '@sputnik-v2/otp';

import { Account } from './entities';
import { AccountService } from './account.service';
import { NearApiModule } from '@sputnik-v2/near-api';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    NotifiClientModule,
    OtpModule,
    NearApiModule,
    FeatureFlagsModule,
    DynamodbModule,
  ],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}

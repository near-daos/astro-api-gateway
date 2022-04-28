import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotifiClientModule } from '@sputnik-v2/notifi-client';
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
  ],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}

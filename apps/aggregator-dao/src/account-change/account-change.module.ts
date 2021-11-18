import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountChange } from '@sputnik-v2/near-indexer';

import { AccountChangeService } from './account-change.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountChange])],
  providers: [AccountChangeService],
  exports: [AccountChangeService],
})
export class AccountChangeModule {}

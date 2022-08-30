import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DB_CONNECTION } from '../common/constants';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Account } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Account], DB_CONNECTION)],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/Account.entity';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { NearSlimModule } from 'src/near/near-slim.module';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), NearSlimModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}

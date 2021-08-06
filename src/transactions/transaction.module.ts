import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/near/entities/transaction.entity';
import { TransactionAction } from 'src/near/entities/transaction-action.entity';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionAction])
  ],
  providers: [TransactionService],
  exports: [TransactionService]
})
export class TransactionModule {}

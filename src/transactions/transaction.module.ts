import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction, TransactionAction } from 'src/near';
import { TransactionService } from './transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionAction])
  ],
  providers: [TransactionService],
  exports: [TransactionService]
})
export class TransactionModule {}

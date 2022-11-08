import { Module } from '@nestjs/common';
import { DaoDynamoService, DaoStatsDynamoService } from './services';
import { DynamodbService } from './dynamodb.service';

@Module({
  providers: [DynamodbService, DaoDynamoService, DaoStatsDynamoService],
  exports: [DynamodbService, DaoDynamoService, DaoStatsDynamoService],
})
export class DynamodbModule {}

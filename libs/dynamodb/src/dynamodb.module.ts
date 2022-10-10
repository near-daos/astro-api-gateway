import { Module } from '@nestjs/common';
import { DynamodbService } from './dynamodb.service';

@Module({
  providers: [DynamodbService],
  exports: [DynamodbService],
})
export class DynamodbModule {}

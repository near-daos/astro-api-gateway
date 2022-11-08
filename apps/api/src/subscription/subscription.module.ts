import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription, SubscriptionService } from '@sputnik-v2/subscription';
import { DynamodbModule } from '@sputnik-v2/dynamodb';

import { NearModule } from '../near/near.module';
import { SubscriptionsController } from './subscription.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    NearModule,
    DynamodbModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

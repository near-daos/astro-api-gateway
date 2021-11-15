import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription, SubscriptionService } from '@sputnik-v2/subscription';

import { NearModule } from '../near/near.module';
import { SubscriptionsController } from './subscription.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription]), NearModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

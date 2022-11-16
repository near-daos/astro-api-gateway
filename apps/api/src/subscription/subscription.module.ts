import { Module } from '@nestjs/common';
import { NearApiModule } from '@sputnik-v2/near-api';
import { SubscriptionModule as SubscriptionModuleLib } from '@sputnik-v2/subscription';

import { SubscriptionsController } from './subscription.controller';

@Module({
  imports: [NearApiModule, SubscriptionModuleLib],
  controllers: [SubscriptionsController],
})
export class SubscriptionModule {}

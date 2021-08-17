import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { nearProvider } from 'src/config/near';
import { Subscription } from './entities/subscription.entity';
import { NotificationsApiController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription])],
  controllers: [NotificationsApiController],
  providers: [SubscriptionService, nearProvider],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

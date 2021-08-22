import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NearModule } from 'src/near/near.module';
import { Subscription } from './entities/subscription.entity';
import { NotificationsApiController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription]), NearModule],
  controllers: [NotificationsApiController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

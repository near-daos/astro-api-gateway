import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NEAR_INDEXER_DB_CONNECTION } from 'src/common/constants';
import { TypeOrmConfigService } from 'src/config';
import { NearModule } from 'src/near/near.module';
import { Subscription } from './entities/subscription.entity';
import { NotificationsApiController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    TypeOrmModule.forRootAsync({
      name: NEAR_INDEXER_DB_CONNECTION,
      useClass: TypeOrmConfigService,
    }),
    NearModule
  ],
  controllers: [NotificationsApiController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

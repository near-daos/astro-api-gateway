import { Module } from '@nestjs/common';
import { NearApiModule } from '@sputnik-v2/near-api';
import { NotificationModule as NotificationModuleLib } from '@sputnik-v2/notification';
import { DaoModule } from '@sputnik-v2/dao';

import { NotificationController } from './notification.controller';

@Module({
  imports: [DaoModule, NearApiModule, NotificationModuleLib],
  controllers: [NotificationController],
})
export class NotificationModule {}

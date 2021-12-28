import { Module } from '@nestjs/common';

import { NotificationModule } from '@sputnik-v2/notification';
import { ProposalModule } from '@sputnik-v2/proposal';
import { DaoModule } from '@sputnik-v2/dao';

import { NotificationHandlerService } from './notification-handler.service';

@Module({
  imports: [NotificationModule, ProposalModule, DaoModule],
  providers: [NotificationHandlerService],
  exports: [NotificationHandlerService],
})
export class NotificationHandlerModule {}

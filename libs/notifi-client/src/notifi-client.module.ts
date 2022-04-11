import { Module } from '@nestjs/common';
import { NotifiClientService } from './notifi-client.service';

@Module({
  providers: [NotifiClientService],
  exports: [NotifiClientService],
})
export class NotifiClientModule {}

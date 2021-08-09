import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { NotificationsApiController } from './notifications-api.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  controllers: [NotificationsApiController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsApiModule {}

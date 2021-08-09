import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import configuration, { TypeOrmConfigService, validationSchema } from '../config';
import { Token } from './entities/token.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
      validationSchema,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature([Token])
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

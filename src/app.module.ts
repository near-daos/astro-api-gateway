import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';

import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './notifications/notifications.module';

import configuration, {
  TypeOrmConfigService,
  validationSchema,
} from './config';
import { NearService } from './near/near.service';
import { DaoModule } from './daos/dao.module';
import { AggregatorService } from './aggregator/aggregator.service';

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
    ScheduleModule.forRoot(),
    NotificationsModule,
    DaoModule
  ],
  controllers: [AppController],
  providers: [NearService, AggregatorService],
})
export class AppModule {}

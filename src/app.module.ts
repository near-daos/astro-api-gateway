import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';

import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './notifications/notifications.module';

import configuration, {
  CacheConfigService,
  TypeOrmConfigService,
  validationSchema
} from './config';
import { SputnikDaoService } from './sputnikdao/sputnik.service';
import { DaoModule } from './daos/dao.module';
import { AggregatorService } from './aggregator/aggregator.service';
import { ProposalModule } from './proposals/proposal.module';
import { SearchModule } from './search/search.module';
import { NearModule } from './near/near.module';
import { NEAR_INDEXER_DB_CONNECTION } from './common/constants';

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
    TypeOrmModule.forRootAsync({
      name: NEAR_INDEXER_DB_CONNECTION,
      useClass: TypeOrmConfigService,
    }),
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    ScheduleModule.forRoot(),
    DaoModule,
    ProposalModule,
    SearchModule,
    NotificationsModule,
    NearModule
  ],
  controllers: [AppController],
  providers: [SputnikDaoService, AggregatorService],
})
export class AppModule {}

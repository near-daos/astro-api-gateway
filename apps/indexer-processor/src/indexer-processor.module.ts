import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpCacheModule } from '@sputnik-v2/cache';

import configuration, {
  TypeOrmConfigService,
  validate,
} from '@sputnik-v2/config/indexer-processor-config';
import { IndexerProcessorValidationSchema } from '@sputnik-v2/config/validation';
import { ErrorTrackerModule } from '@sputnik-v2/error-tracker';
import { NearApiModule } from '@sputnik-v2/near-api';
import { TransactionHandlerModule } from '@sputnik-v2/transaction-handler';
import { LoggerModule, Params } from 'nestjs-pino';

import { IndexerProcessorCommonService } from './indexer-processor-common.service';
import { IndexerProcessorErrorHandlerService } from './indexer-processor-error-handler.service';
import { IndexerProcessorService } from './indexer-processor.service';

import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Params => {
        return {
          pinoHttp: {
            level: configService.get('logLevel'),
          },
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
      validate: (config) => validate(IndexerProcessorValidationSchema, config),
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    RedisModule,
    TransactionHandlerModule,
    ErrorTrackerModule,
    HttpCacheModule,
    NearApiModule,
  ],
  providers: [
    IndexerProcessorService,
    IndexerProcessorCommonService,
    IndexerProcessorErrorHandlerService,
  ],
})
export class IndexerProcessorModule {}

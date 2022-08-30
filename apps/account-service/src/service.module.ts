import { LoggerModule, Params } from 'nestjs-pino';

import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';

import configuration, {
  CacheConfigService,
  TypeOrmConfigService,
  validate,
} from './config/account-service-config';
import { AccountServiceValidationSchema } from './config/validation/validation.schema';
import { AccountModule } from './account/account.module';
import { IndexerProcessorModule } from './indexer-processor/indexer-processor.module';
import { DB_CONNECTION } from './common/constants';
import { AggregatorModule } from './aggregator/aggregator.module';

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
      validate: (config) => validate(AccountServiceValidationSchema, config),
      envFilePath: ['.env.local', '.env'],
    }),
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      name: DB_CONNECTION,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => {
        return {
          ttl: configService.get('account-service.rateTtl'),
          limit: configService.get('account-service.rateLimit'),
        };
      },
    }),
    AccountModule,
    IndexerProcessorModule,
    AggregatorModule,
  ],
  controllers: [],
  providers: [],
})
export class ServiceModule {}

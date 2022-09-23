import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { LoggerModule, Params } from 'nestjs-pino';

import configuration, {
  TypeOrmConfigService,
  validate,
} from '@sputnik-v2/config/draft-config';
import { DraftValidationSchema } from '@sputnik-v2/config/validation';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';
import { WebsocketGateway, WebsocketModule } from '@sputnik-v2/websocket';
import { DraftProposalModule as DraftProposalModuleLib } from '@sputnik-v2/draft-proposal';

import { DraftProposalModule } from './draft-proposal/draft-proposal.module';
import { DraftCommentModule } from './draft-comment/draft-comment.module';
import { DraftController } from './draft.controller';

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
      validate: (config) => validate(DraftValidationSchema, config),
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      name: DRAFT_DB_CONNECTION,
      useClass: TypeOrmConfigService,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => {
        return {
          ttl: configService.get('draft.rateTtl'),
          limit: configService.get('draft.rateLimit'),
        };
      },
    }),
    WebsocketModule,
    DraftProposalModule,
    DraftCommentModule,
    DraftProposalModuleLib,
  ],
  controllers: [DraftController],
  providers: [WebsocketGateway],
})
export class DraftModule {}

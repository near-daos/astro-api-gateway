import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import configuration, {
  TypeOrmConfigService,
  validate,
} from '@sputnik-v2/config/draft-config';
import { DraftValidationSchema } from '@sputnik-v2/config/validation';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';

import { DraftProposalModule } from './draft-proposal/draft-proposal.module';
import { DraftCommentModule } from './draft-comment/draft-comment.module';
import { DraftHashtagModule } from './draft-hashtag/draft-hashtag.module';

@Module({
  imports: [
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
    TypeOrmModule.forRootAsync({
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
    DraftProposalModule,
    DraftCommentModule,
    DraftHashtagModule,
  ],
  controllers: [],
  providers: [],
})
export class DraftModule {}

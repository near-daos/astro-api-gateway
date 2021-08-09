import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import configuration, {
  CacheConfigService,
  TypeOrmConfigService,
  validationSchema
} from './config';
import { DaoModule } from './daos/dao.module';
import { NotificationsApiModule } from './notifications/notifications-api.module';
import { ProposalModule } from './proposals/proposal.module';
import { SearchModule } from './search/search.module';
import { TransactionModule } from './transactions/transaction.module';

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
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
    DaoModule,
    ProposalModule,
    SearchModule,
    TransactionModule,
    NotificationsApiModule
  ],
  controllers: [AppController]
})
export class AppModule {}

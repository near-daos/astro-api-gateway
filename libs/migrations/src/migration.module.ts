import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalModule } from '@sputnik-v2/proposal';
import { NearIndexerModule } from '@sputnik-v2/near-indexer';
import { NearApiModule } from '@sputnik-v2/near-api';
import { SputnikDaoService } from '@sputnik-v2/sputnikdao';
import migrationScripts from './scripts';
import { ConfigModule } from '@nestjs/config';
import configuration, {
  TypeOrmConfigService,
} from '@sputnik-v2/config/aggregator-dao-config';
import { Dao } from '@sputnik-v2/dao';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forFeature([Dao]),
    ProposalModule,
    NearIndexerModule,
    NearApiModule,
  ],
  providers: [SputnikDaoService, ...migrationScripts],
})
export class MigrationModule {}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Dao } from 'src/daos/entities/dao.entity';
import { Proposal } from 'src/proposals/entities/proposal.entity';

import { Token } from '../notifications';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('database.host'),
      port: this.configService.get('database.port'),
      username: this.configService.get('database.user'),
      password: this.configService.get('database.password'),
      database: this.configService.get('database.name'),
      entities: [Token, Dao, Proposal],
      synchronize: true,
      migrationsTableName: 'migration_table',
      migrations: ['migration/*.js'],
      cli: {
        migrationsDir: 'migration',
      },
    };
  }
}

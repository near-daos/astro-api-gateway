import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createTypeOrmOptions(name: string): TypeOrmModuleOptions {
    const {
      type,
      host,
      port,
      username,
      password,
      database,
      entities,
      synchronize,
      migrationsTableName,
      migrations,
      cli,
      namingStrategy
    } = this.configService.get(`db_${name || 'default'}`);

    return {
      name,
      type,
      host,
      port,
      username,
      password,
      database,
      entities,
      synchronize,
      migrationsTableName,
      migrations,
      cli,
      namingStrategy
    };
  }
}

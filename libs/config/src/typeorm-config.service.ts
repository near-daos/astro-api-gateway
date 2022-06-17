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
      url,
      cli,
      ssl,
      sslCert,
      sslValidate,
      namingStrategy,
      logging,
    } = this.configService.get(`db_${name || 'default'}`);

    return {
      name,
      type,
      host,
      port,
      ssl,
      sslCert,
      sslValidate,
      username,
      password,
      database,
      entities,
      synchronize,
      migrationsTableName,
      migrations,
      url,
      cli,
      namingStrategy,
      logging,
    };
  }
}

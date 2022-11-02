import { getConnection } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import { DRAFT_DB_CONNECTION } from '@sputnik-v2/common';
import { MigrationModule } from '.';
import migrationScripts from './scripts';

export default class MigrationRunner {
  async bootstrap(): Promise<void> {
    const app = await NestFactory.createApplicationContext(MigrationModule);

    const targetMigrations = (process.env.DATABASE_MIGRATIONS_LIST || '').split(
      ',',
    );

    for (const migration of targetMigrations) {
      const script = migrationScripts.find(
        (script) => script.name === migration,
      );

      if (!script) {
        throw new Error(`Invalid migration script: ${script}`);
      }

      await app.get(script).migrate();
    }

    await app.close();

    // TODO: force close draft connection since nestjs does not
    await getConnection(DRAFT_DB_CONNECTION).close();
  }
}

new MigrationRunner().bootstrap();

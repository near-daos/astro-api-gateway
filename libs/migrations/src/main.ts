import { NestFactory } from '@nestjs/core';
import { parseJSON } from '@sputnik-v2/utils';
import { Migration, MigrationModule } from '.';
import migrationScripts from './scripts';

export default class MigrationRunner {
  async bootstrap(): Promise<void> {
    const app = await NestFactory.createApplicationContext(MigrationModule);

    const targetMigrations = (process.env.DATABASE_MIGRATIONS_LIST || '').split(
      ',',
    );
    const targetOptions = parseJSON(
      process.env.DATABASE_MIGRATIONS_OPTIONS || '{}',
    );

    for (const migrationName of targetMigrations) {
      const script = migrationScripts.find(
        (script) => script.name === migrationName,
      );

      if (!script) {
        throw new Error(`Invalid migration: ${migrationName}`);
      }

      const migration: Migration = app.get(script);
      await migration.migrate(targetOptions);
    }

    await app.close();
  }
}

new MigrationRunner().bootstrap();

import { NestFactory } from '@nestjs/core';
import { MigrationModule } from '.';
import migrationScripts from './scripts';

export default class MigrationRunner {
  async bootstrap(): Promise<void> {
    const app = await NestFactory.create(MigrationModule);

    const targetMigrations = (process.env.DATABASE_MIGRATIONS_LIST || '').split(
      ',',
    );

    if (!targetMigrations.length) {
      return;
    }

    for (const migration of targetMigrations) {
      const script = migrationScripts.find(
        (script) => script.name === migration,
      );

      if (!script) {
        continue;
      }

      await app.get(script.name).migrate();
    }
  }
}

new MigrationRunner().bootstrap();

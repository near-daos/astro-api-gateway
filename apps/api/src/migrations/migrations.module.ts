import { Module } from '@nestjs/common';

import { MigrationModule as MigrationModuleLib } from '@sputnik-v2/migrations/migration.module';
import { MigrationsController } from './migrations.controller';

@Module({
  imports: [MigrationModuleLib],
  controllers: [MigrationsController],
})
export class MigrationsModule {}

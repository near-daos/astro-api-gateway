import { Module } from '@nestjs/common';

import { AccountModule } from '@sputnik-v2/account';
import { NearApiModule } from '@sputnik-v2/near-api';
import { MigrationModule as MigrationModuleLib } from '@sputnik-v2/migrations/migration.module';
import { MigrationsController } from './migrations.controller';

@Module({
  imports: [MigrationModuleLib, NearApiModule, AccountModule],
  controllers: [MigrationsController],
})
export class MigrationsModule {}

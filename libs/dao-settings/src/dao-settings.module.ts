import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoModule } from '@sputnik-v2/dao';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags';

import { DaoSettingsService } from './dao-settings.service';
import { DaoSettings } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([DaoSettings]),
    DaoModule,
    FeatureFlagsModule,
  ],
  providers: [DaoSettingsService],
  exports: [DaoSettingsService],
})
export class DaoSettingsModule {}

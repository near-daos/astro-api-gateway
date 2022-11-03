import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamodbModule } from '@sputnik-v2/dynamodb';
import { FeatureFlagsModule } from '@sputnik-v2/feature-flags';

import { DaoSettingsService } from './dao-settings.service';
import { DaoSettings } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([DaoSettings]),
    DynamodbModule,
    FeatureFlagsModule,
  ],
  providers: [DaoSettingsService],
  exports: [DaoSettingsService],
})
export class DaoSettingsModule {}

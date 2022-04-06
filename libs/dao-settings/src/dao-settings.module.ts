import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DaoSettingsService } from './dao-settings.service';
import { DaoSettings } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([DaoSettings])],
  providers: [DaoSettingsService],
  exports: [DaoSettingsService],
})
export class DaoSettingsModule {}

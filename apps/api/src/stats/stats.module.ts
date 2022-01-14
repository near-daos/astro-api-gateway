import { Module } from '@nestjs/common';

import { StatsModule as StatsLibModule } from '@sputnik-v2/stats';

import { StatsController } from './stats.controller';

@Module({
  imports: [StatsLibModule],
  controllers: [StatsController],
})
export class StatsModule {}

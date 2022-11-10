import { Module } from '@nestjs/common';
import { DaoStatsModule } from '@sputnik-v2/stats/dao-stats.module';
import { StatsController } from './stats.controller';

@Module({
  imports: [DaoStatsModule],
  controllers: [StatsController],
})
export class StatsModule {}

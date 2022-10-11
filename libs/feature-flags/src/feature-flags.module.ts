import { Module } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';

@Module({
  providers: [FeatureFlagsService],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}

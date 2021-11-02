import { Module } from '@nestjs/common';

import { nearProvider } from 'src/config/near';

import { NearApiService } from './near-api.service';

@Module({
  providers: [NearApiService, nearProvider],
  exports: [NearApiService, nearProvider],
})
export class NearApiModule {}

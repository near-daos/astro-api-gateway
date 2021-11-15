import { Module } from '@nestjs/common';
import { nearProvider } from '@sputnik-v2/config/near';
import { nearApiProvider } from '@sputnik-v2/config/near-api';

import { NearApiService } from './near-api.service';

@Module({
  providers: [NearApiService, nearProvider, nearApiProvider],
  exports: [NearApiService, nearProvider, nearApiProvider],
})
export class NearApiModule {}

import { Module } from '@nestjs/common';

import { nearProvider } from 'src/config/near';
import { nearApiProvider } from 'src/config/near-api';

import { NearApiService } from './near-api.service';

@Module({
  providers: [NearApiService, nearProvider, nearApiProvider],
  exports: [NearApiService, nearProvider, nearApiProvider],
})
export class NearApiModule {}

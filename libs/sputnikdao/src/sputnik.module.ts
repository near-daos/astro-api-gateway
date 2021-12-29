import { Module } from '@nestjs/common';

import { NearApiModule } from '@sputnik-v2/near-api';

import { SputnikService } from './sputnik.service';

@Module({
  imports: [NearApiModule],
  providers: [SputnikService],
  exports: [SputnikService],
})
export class SputnikModule {}

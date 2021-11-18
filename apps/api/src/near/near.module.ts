import { Module } from '@nestjs/common';
import { nearProvider } from '@sputnik-v2/config/near';
import { nearTokenFactoryProvider } from '@sputnik-v2/config/near-token-factory';
import { nearApiProvider } from '@sputnik-v2/config/near-api';

@Module({
  imports: [],
  providers: [nearProvider, nearApiProvider, nearTokenFactoryProvider],
  exports: [nearProvider, nearApiProvider, nearTokenFactoryProvider],
})
export class NearModule {}

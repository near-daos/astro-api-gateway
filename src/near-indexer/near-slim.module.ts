import { Module } from '@nestjs/common';
import { nearProvider } from 'src/config/near';
import { nearTokenFactoryProvider } from 'src/config/near-token-factory';
import { nearApiProvider } from 'src/config/near-api';

@Module({
  imports: [],
  providers: [nearProvider, nearApiProvider, nearTokenFactoryProvider],
  exports: [nearProvider, nearApiProvider, nearTokenFactoryProvider],
})
export class NearSlimModule {}

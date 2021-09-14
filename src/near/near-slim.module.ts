import { Module } from '@nestjs/common';
import { nearProvider } from 'src/config/near';
import { nearTokenFactoryProvider } from 'src/config/near-token-factory';
import { nearSputnikProvider } from 'src/config/sputnik';

@Module({
  imports: [],
  providers: [nearProvider, nearSputnikProvider, nearTokenFactoryProvider],
  exports: [nearProvider, nearSputnikProvider, nearTokenFactoryProvider],
})
export class NearSlimModule {}

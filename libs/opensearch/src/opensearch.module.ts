import { OpensearchModule } from 'nestjs-opensearch';

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { OpensearchService } from './opensearch.service';

@Module({
  imports: [
    OpensearchModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService) => ({
        node: configService.get('opensearch').node,
      }),
    }),
  ],
  controllers: [],
  providers: [OpensearchService],
  exports: [OpensearchService],
})
export class OpenSearchModule {}

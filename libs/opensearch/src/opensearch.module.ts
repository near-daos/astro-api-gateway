import { OpensearchModule } from 'nestjs-opensearch';

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { OpensearchService } from './opensearch.service';

@Module({
  imports: [
    OpensearchModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService) => {
        const { node, username, password } = configService.get('opensearch');

        return {
          node,
          auth: {
            username,
            password,
          },
        };
      },
    }),
  ],
  controllers: [],
  providers: [OpensearchService],
  exports: [OpensearchService],
})
export class OpenSearchModule {}

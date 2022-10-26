import { Dao } from '@sputnik-v2/dao';

import { BaseOpensearchDto } from './base-opensearch.dto';

export class DaoOpensearchDto extends BaseOpensearchDto {
  public static getMappings(): any {
    const { mappings } = super.getMappings();
    const { properties } = mappings;

    return {
      mappings: {
        ...mappings,
        properties: {
          ...properties,
          // using type 'long' since timestamp in NEAR is in nanos so there will be no
          // typecasting possible in Opensearch while re-indexing
          createTimestamp: { type: 'long' },
          name: { type: 'text' },
          totalDaoFunds: { type: 'float' },
          totalProposalCount: { type: 'integer' },
          numberOfMembers: { type: 'integer' },
          status: { type: 'keyword' },
        },
      },
    };
  }
}

export function mapDaoToOpensearchDto(dao: Dao): DaoOpensearchDto {
  const { metadata, accountIds } = dao;

  const dto: DaoOpensearchDto = {
    ...dao,
    name: metadata?.displayName,
    accounts: [...new Set(accountIds)].join(' '),
    indexedBy: 'astro-api',
  };

  return dto;
}

import { Dao } from '@sputnik-v2/dao';

import { BaseOpensearchDto } from './base-opensearch.dto';

export class DaoOpensearchDto extends BaseOpensearchDto {
  public static getMappings(): any {
    const mappings = super.getMappings();
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
        },
      },
    };
  }
}

export function mapDaoToOpensearchDto(dao: Dao): DaoOpensearchDto {
  const { id, accountIds } = dao;

  const dto: DaoOpensearchDto = {
    ...dao,
    name: id,
    accounts: [...new Set(accountIds)].join(' '),
  };

  return dto;
}

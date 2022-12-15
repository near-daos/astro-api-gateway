import { BaseOpensearchDto } from './base-opensearch.dto';

export class DaoStatsOpensearchDto extends BaseOpensearchDto {
  public static getMappings(): any {
    const { mappings } = super.getMappings();
    const { properties } = mappings;

    return {
      mappings: {
        ...mappings,
        properties: {
          ...properties,
          daoId: { type: 'keyword' },
          timestamp: { type: 'long' },
        },
      },
    };
  }
}

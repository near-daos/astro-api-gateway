import { BaseOpensearchDto } from './base-opensearch.dto';

export class AccountOpensearchDto extends BaseOpensearchDto {
  public static getMappings(): any {
    const { mappings } = super.getMappings();
    const { properties } = mappings;

    return {
      mappings: {
        ...mappings,
        properties: {
          ...properties,
          accountId: { type: 'keyword' },
        },
      },
    };
  }
}

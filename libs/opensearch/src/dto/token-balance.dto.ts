import { BaseOpensearchDto } from './base-opensearch.dto';

export class TokenPriceOpensearchDto extends BaseOpensearchDto {
  public static getMappings(): any {
    const { mappings } = super.getMappings();
    const { properties } = mappings;

    return {
      mappings: {
        ...mappings,
        properties: {
          ...properties,
          tokenId: { type: 'keyword' },
          name: { type: 'text' },
          symbol: { type: 'text' },
          price: { type: 'keyword' },
          creatingTimeStamp: { type: 'long' },
        },
      },
    };
  }
}

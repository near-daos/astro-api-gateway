import { BaseOpensearchDto } from './base-opensearch.dto';

export class AccountNotificationOpensearchDto extends BaseOpensearchDto {
  public static getMappings(): any {
    const { mappings } = super.getMappings();
    const { properties } = mappings;

    return {
      mappings: {
        ...mappings,
        properties: {
          ...properties,
          daoId: { type: 'keyword' },
          accountId: { type: 'keyword' },
          isRead: { type: 'boolean' },
          isArchived: { type: 'boolean' },
        },
      },
    };
  }
}

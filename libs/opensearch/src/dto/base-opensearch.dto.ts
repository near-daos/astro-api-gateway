export class BaseOpensearchDto {
  id: string;
  name: string;
  description: string;
  accounts: string;
  indexedBy?: string;

  // add custom mapping for each downstream class
  public static getMappings(): any {
    return {
      mappings: {
        dynamic: false,
        properties: {
          id: { type: 'keyword' },
          description: { type: 'text' },
          accounts: { type: 'text' },
          createTimestamp: { type: 'keyword' },
          creatingTimeStamp: { type: 'keyword' },
        },
      },
    };
  }
}

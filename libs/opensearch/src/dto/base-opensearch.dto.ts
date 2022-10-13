export class BaseOpensearchDto {
  id: string;
  name: string;
  description: string;
  accounts: string;

  // add custom mapping for each downstream class
  public static getMappings(): any {
    return {
      mappings: {
        dynamic: false,
        properties: {
          id: { type: 'text' },
          description: { type: 'text' },
          accounts: { type: 'text' },
        },
      },
    };
  }
}

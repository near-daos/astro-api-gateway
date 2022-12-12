export class AccountOpensearchDto {
  public static getMappings(): any {
    return {
      mappings: {
        dynamic: false,
        properties: {
          accountId: { type: 'keyword' },
        },
      },
    };
  }
}

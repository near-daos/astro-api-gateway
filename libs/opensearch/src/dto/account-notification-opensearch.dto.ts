export class AccountNotificationOpensearchDto {
  public static getMappings(): any {
    return {
      mappings: {
        dynamic: false,
        properties: {
          daoId: { type: 'keyword' },
          accountId: { type: 'keyword' },
        },
      },
    };
  }
}

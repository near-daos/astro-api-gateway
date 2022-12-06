export class DaoStatsOpensearchDto {
  daoId: string;
  timestamp: number;

  public static getMappings(): any {
    return {
      mappings: {
        dynamic: false,
        properties: {
          daoId: { type: 'keyword' },
          timestamp: { type: 'long' },
          creatingTimeStamp: { type: 'long' },
        },
      },
    };
  }
}

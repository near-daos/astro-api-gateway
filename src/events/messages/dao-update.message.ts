export class DaoUpdateMessage {
  daoIds: string[];

  constructor(daoIds: string[]) {
    this.daoIds = daoIds;
  }
}

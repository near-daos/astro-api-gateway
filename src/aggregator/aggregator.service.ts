import { Injectable } from "@nestjs/common";
import { DaoService } from "src/daos/dao.service";
import { NearService } from "src/near/near.service";
import { isNotNull } from "src/utils/guards";

@Injectable()
export class AggregatorService {
  constructor(
    private readonly nearService: NearService,
    private readonly daoService: DaoService
  ) { }

  public async aggregate(): Promise<void> {
    //TODO: Add generic logger
    console.log('Aggregating NEAR API DAO...');
    const daos = await this.nearService.getDaoList();

    console.log('Persisting aggregated data...');
    daos.filter(dao => isNotNull(dao)).map(dao => this.daoService.create(dao));

    console.log('Finished DAO aggregation.');
  }
}

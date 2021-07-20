import { Injectable } from "@nestjs/common";
import { DaoService } from "src/daos/dao.service";
import { NearService } from "src/near/near.service";
import { ProposalService } from "src/proposals/proposal.service";
import { isNotNull } from "src/utils/guards";

@Injectable()
export class AggregatorService {
  constructor(
    private readonly nearService: NearService,
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService
  ) { }

  public async aggregate(): Promise<void> {
    //TODO: Add generic logger
    console.log('Aggregating DAOs...');
    const daoIds = await this.nearService.getDaoIds();
    const daos = await this.nearService.getDaoList(daoIds);

    console.log('Persisting aggregated DAOs...');
    await Promise.all(daos.filter(dao => isNotNull(dao)).map(dao => this.daoService.create(dao)));
    console.log('Finished DAO aggregation.');

    console.log('Aggregating Proposals...');
    const proposalsByDao = await Promise.all(daoIds.map(daoId => this.nearService.getProposals(daoId)));

    console.log('Persisting aggregated Proposals...');
    await Promise.all(proposalsByDao.map(proposals => proposals.map(proposal => this.proposalService.create(proposal))));
    console.log('Finished Proposals aggregation.');
  }
}

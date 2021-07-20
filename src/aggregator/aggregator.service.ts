import { Injectable, Logger } from "@nestjs/common";
import { DaoService } from "src/daos/dao.service";
import { NearService } from "src/near/near.service";
import { ProposalService } from "src/proposals/proposal.service";
import { isNotNull } from "src/utils/guards";
import PromisePool from '@supercharge/promise-pool';

@Injectable()
export class AggregatorService {
  private readonly logger = new Logger(AggregatorService.name);

  constructor(
    private readonly nearService: NearService,
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService
  ) { }

  public async aggregate(): Promise<void> {
    this.logger.log('Aggregating DAOs...');
    const daoIds = await this.nearService.getDaoIds();
    const daos = await this.nearService.getDaoList(daoIds);

    this.logger.log('Persisting aggregated DAOs...');
    await Promise.all(daos.filter(dao => isNotNull(dao)).map(dao => this.daoService.create(dao)));
    this.logger.log('Finished DAO aggregation.');

    this.logger.log('Aggregating Proposals...');
    const proposalsByDao = await this.nearService.getProposals(daoIds);

    this.logger.log('Persisting aggregated Proposals...');
    await Promise.all(proposalsByDao.map(proposals => proposals.map(proposal => this.proposalService.create(proposal))));
    this.logger.log('Finished Proposals aggregation.');
  }
}

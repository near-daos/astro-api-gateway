import { Injectable, Logger } from "@nestjs/common";
import { DaoService } from "src/daos/dao.service";
import { SputnikDaoService } from "src/sputnikdao/sputnik.service";
import { ProposalService } from "src/proposals/proposal.service";
import { isNotNull } from "src/utils/guards";

@Injectable()
export class AggregatorService {
  private readonly logger = new Logger(AggregatorService.name);

  constructor(
    private readonly sputnikDaoService: SputnikDaoService,
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService
  ) { }

  public async aggregate(): Promise<void> {
    this.logger.log('Aggregating DAOs...');
    const daoIds = await this.sputnikDaoService.getDaoIds();
    const daos = await this.sputnikDaoService.getDaoList(daoIds);

    this.logger.log('Persisting aggregated DAOs...');
    await Promise.all(daos.filter(dao => isNotNull(dao)).map(dao => this.daoService.create(dao)));
    this.logger.log('Finished DAO aggregation.');

    this.logger.log('Aggregating Proposals...');
    const proposals = await this.sputnikDaoService.getProposals(daoIds);

    this.logger.log('Persisting aggregated Proposals...');
    await Promise.all(proposals.map(proposal => this.proposalService.create(proposal)));
    this.logger.log('Finished Proposals aggregation.');
  }
}

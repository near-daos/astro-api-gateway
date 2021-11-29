import { Injectable, Logger } from '@nestjs/common';
import { ProposalService } from '@sputnik-v2/proposal';
import { SputnikDaoService } from '@sputnik-v2/sputnikdao';
import { isNotNull } from '@sputnik-v2/utils';
import { Migration } from '..';

@Injectable()
export class ProposalPurgeMigration implements Migration {
  private readonly logger = new Logger(ProposalPurgeMigration.name);

  constructor(
    private readonly proposalService: ProposalService,
    private readonly sputnikDaoService: SputnikDaoService,
  ) {}

  public async migrate(): Promise<void> {
    this.logger.log('Starting Removed Proposal migration...');

    this.logger.log('Collecting dao ids...');
    const daoIds = await this.sputnikDaoService.getDaoIds();
    console.log(daoIds);

    this.logger.log(`Retrieving DAOs...`);
    const daos = await this.sputnikDaoService.getDaoList(daoIds);
    this.logger.log(`Retrieved DAOs: ${daos.length}`);

    this.logger.log(`Retrieving Proposals...`);
    const proposals = await this.sputnikDaoService.getProposals(daoIds);
    this.logger.log(`Retrieved Proposals: ${proposals.length}`);

    this.logger.log('Purging removed DAOs...');
    await this.proposalService.purgeRemovedProposals(
      proposals,
      daos.filter((dao) => isNotNull(dao)),
    );
  }
}

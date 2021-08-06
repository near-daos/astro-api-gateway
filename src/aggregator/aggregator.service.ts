import { Injectable, Logger } from "@nestjs/common";
import { DaoService } from "src/daos/dao.service";
import { SputnikDaoService } from "src/sputnikdao/sputnik.service";
import { ProposalService } from "src/proposals/proposal.service";
import { isNotNull } from "src/utils/guards";
import { NearService } from "src/near/near.service";
import { TransactionService } from "src/transactions/transaction.service";
import { ConfigService } from "@nestjs/config";
import { Transaction } from "src/near/entities/transaction.entity";
import { CreateDaoDto } from "src/daos/dto/dao.dto";
import { Account } from "src/near/entities/account.entity";
import { CreateProposalDto } from "src/proposals/dto/proposal.dto";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class AggregatorService {
  private readonly logger = new Logger(AggregatorService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly sputnikDaoService: SputnikDaoService,
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService,
    private readonly nearService: NearService,
    private readonly transactionService: TransactionService
  ) { }

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async aggregate(): Promise<void> {
    this.logger.log('Scheduling Data Aggregation...');

    this.logger.log('Collecting DAO IDs...');
    const daoIds = await this.sputnikDaoService.getDaoIds();

    this.logger.log('Checking data relevance...')
    const [ tx, nearTx ] = await Promise.all([
      this.transactionService.lastTransaction(),
      this.nearService.lastTransaction(daoIds)
    ]);

    if (tx && nearTx && tx.transactionHash === nearTx.transactionHash) {
      return this.logger.log('Data is up to date. Skipping data aggregation.');
    }

    const { contractName } = this.configService.get('near');

    const accounts: Account[] = await this.nearService.findAccountsByContractName(contractName);
    const transactions: Transaction[] = await this.nearService.findTransactionsByReceiverAccountIds(daoIds);

    this.logger.log('Aggregating data...');
    const [ daos, proposals ] = await Promise.all([
      this.sputnikDaoService.getDaoList(daoIds),
      this.sputnikDaoService.getProposals(daoIds)
    ])

    const enrichedDaos = this.enrichDaos(daos, accounts, transactions);

    this.logger.log('Persisting aggregated DAOs...');
    await Promise.all(enrichedDaos.filter(dao => isNotNull(dao)).map(dao => this.daoService.create(dao)));
    this.logger.log('Finished DAO aggregation.');

    const enrichedProposals = this.enrichProposals(proposals, transactions);

    this.logger.log('Persisting aggregated Proposals...');
    await Promise.all(enrichedProposals.map(proposal => this.proposalService.create(proposal)));
    this.logger.log('Finished Proposals aggregation.');

    this.logger.log('Persisting aggregated Transactions...');
    await Promise.all(transactions.map(transaction => this.transactionService.create(transaction)));
  }

  private enrichDaos(daos: CreateDaoDto[], accounts: Account[], transactions: Transaction[]): CreateDaoDto[] {
    const daoTxHashes = accounts.reduce((acc, { accountId, receipt }) =>
      ({ ...acc, [accountId]: receipt.originatedFromTransactionHash }), {});

    const signersByAccountId = transactions.reduce((acc, cur) =>
      ({ ...acc, [cur.receiverAccountId]: [ ...(acc[cur.receiverAccountId] || []), cur.signerAccountId ] }), {});

    return daos.map(dao => ({
      ...dao,
      txHash: daoTxHashes[dao.id],
      numberOfMembers: (new Set(signersByAccountId[dao.id])).size
    }));
  }

  private enrichProposals(proposals: CreateProposalDto[], transactions: Transaction[]): CreateProposalDto[] {
    const transactionsByAccountId = transactions
      .filter(({ transactionAction }) => (transactionAction.args as any).method_name == 'add_proposal')
      .reduce((acc, cur) =>
        ({ ...acc, [cur.receiverAccountId]: [ ...(acc[cur.receiverAccountId ] || []), cur] }), {});

    return proposals.map(proposal => ({
      ...proposal,
      txHash: transactionsByAccountId[proposal.daoId][proposal.id].transactionHash
    }))
  }
}

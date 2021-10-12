import { Injectable, Logger } from '@nestjs/common';
import { DaoService } from 'src/daos/dao.service';
import { ProposalService } from 'src/proposals/proposal.service';
import { SputnikDaoService } from 'src/sputnikdao/sputnik.service';
import { ConfigService } from '@nestjs/config';
import { btoaJSON } from 'src/utils';
import { isNotNull } from 'src/utils/guards';
import { castProposalKind } from 'src/proposals/dto/proposal.dto';
import { TokenFactoryService } from 'src/token-factory/token-factory.service';
import { TokenService } from 'src/tokens/token.service';
import { CacheService } from 'src/cache/service/cache.service';

@Injectable()
export class SputnikTransactionService {
  private readonly logger = new Logger(SputnikTransactionService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly sputnikDaoService: SputnikDaoService,
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService,
    private readonly tokenFactoryService: TokenFactoryService,
    private readonly tokenService: TokenService,
    private readonly cacheService: CacheService,
  ) {}

  public async unfoldTransaction(
    transactionHash: string,
    accountId: string,
  ): Promise<any> {
    // the approximate block timestamp in microseconds - the same way as it's done in indexer
    const txTimestamp = new Date().getTime() * 1000 * 1000;

    const { contractName } = this.configService.get('near');

    const txStatus = await this.sputnikDaoService.getTxStatus(
      transactionHash,
      accountId,
    );
    const { transaction } = txStatus;
    const { hash, receiver_id, signer_id, actions } = transaction;

    const daoIds = [];
    const proposalDaoIds = [];
    const tokenIds = [];

    const proposalTxArgs = [];

    actions
      .filter((action) => action.FunctionCall)
      .map(({ FunctionCall }) => {
        const { method_name } = FunctionCall;
        const { name, proposal = {}, args } = btoaJSON(FunctionCall.args) || {};
        const { metadata } = args || {};

        if ('create' === method_name) {
          if (name) {
            daoIds.push(`${name}.${contractName}`);
          }
        } else if ('add_proposal' === method_name) {
          proposalDaoIds.push(receiver_id);

          proposalTxArgs.push(proposal);
        } else if ('create_token' === method_name && metadata) {
          tokenIds.push(metadata.symbol);
        }
      });

    const [daos, proposals, tokens] = await Promise.all([
      daoIds ? this.sputnikDaoService.getDaoList(daoIds) : [],
      proposalDaoIds ? this.sputnikDaoService.getProposals(proposalDaoIds) : [],
      tokenIds ? this.tokenFactoryService.getTokens(tokenIds) : [],
    ]);

    const enrichedDaos = daos.map((dao) => ({
      ...dao,
      transactionHash: hash,
      createTimestamp: txTimestamp,
    }));

    if (enrichedDaos.length) {
      this.logger.log('Storing DAOs from wallet callback...');
      await Promise.all(
        enrichedDaos
          .filter((dao) => isNotNull(dao))
          .map((dao) => this.daoService.create(dao)),
      );
      this.logger.log('Successfully stored DAOs.');
    }

    const enrichedProposals = proposals
      .filter((proposal) => {
        const { id, daoId, description, kind, proposer } = proposal;

        const proposalTx = proposalTxArgs.find(
          ({ description: txDescription, kind: txKind }) =>
            description === txDescription &&
            kind.equals(castProposalKind(txKind)) &&
            signer_id === proposer,
        );

        return proposalTx;
      })
      .map((proposal) => ({
        ...proposal,
        transactionHash: hash,
        createTimestamp: txTimestamp,
      }));

    if (enrichedProposals.length) {
      this.logger.log('Storing Proposals from wallet callback...');
      await Promise.all(
        enrichedProposals.map((proposal) =>
          this.proposalService.create(proposal),
        ),
      );
      this.logger.log('Successfully stored Proposals.');
    }

    const enrichedTokens = tokens.map((token) => ({
      ...token,
      transactionHash: hash,
      createTimestamp: txTimestamp,
    }));

    if (enrichedTokens.length) {
      this.logger.log('Storing Tokens from wallet callback...');
      await Promise.all(
        enrichedTokens.map((token) => this.tokenService.create(token)),
      );
      this.logger.log('Successfully stored Tokens.');
    }

    this.logger.log(`Clearing cache on wallet callback.`);
    await this.cacheService.clearCache();
  }
}

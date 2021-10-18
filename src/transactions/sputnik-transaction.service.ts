import { Injectable, Logger } from '@nestjs/common';
import { DaoService } from 'src/daos/dao.service';
import { ProposalService } from 'src/proposals/proposal.service';
import { SputnikDaoService } from 'src/sputnikdao/sputnik.service';
import { ConfigService } from '@nestjs/config';
import { btoaJSON } from 'src/utils';
import { isNotNull } from 'src/utils/guards';
import { castProposalKind, ProposalDto } from 'src/proposals/dto/proposal.dto';
import { TokenFactoryService } from 'src/token-factory/token-factory.service';
import { TokenService } from 'src/tokens/token.service';
import { CacheService } from 'src/cache/service/cache.service';
import { SputnikDaoDto } from '../daos/dto/dao-sputnik.dto';

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
    const txStatus = await this.sputnikDaoService.getTxStatus(
      transactionHash,
      accountId,
    );
    const { transaction } = txStatus;

    const { actions } = transaction;

    // the approximate block timestamp in microseconds - the same way as it's done in indexer
    const txTimestamp = new Date().getTime() * 1000 * 1000;

    const filteredActions = actions.filter((action) => action.FunctionCall);

    await this.processActions(filteredActions, transaction, txTimestamp);

    this.logger.log(`Clearing cache on wallet callback.`);
    await this.cacheService.clearCache();
  }

  private async handleUpdateProposal(
    args: string,
    transaction: any,
    txTimestamp: number,
  ) {
    const { id: proposalId } = btoaJSON(args);
    const { hash, receiver_id } = transaction;

    const proposal = await this.sputnikDaoService.getProposal(
      receiver_id,
      proposalId,
    );

    this.logger.log('Storing updated Proposal from wallet callback...');

    await this.proposalService.create({
      ...proposal,
      transactionHash: hash,
      createTimestamp: txTimestamp,
    });
  }

  private async handleNewDao(
    functionCallArgs: string,
    transaction: any,
    txTimestamp: number,
  ) {
    const daoIds = [];
    const { contractName } = this.configService.get('near');
    const { name } = btoaJSON(functionCallArgs);

    if (name) {
      daoIds.push(`${name}.${contractName}`);
    }

    const daos = await this.sputnikDaoService.getDaoList(daoIds);

    await this.enrichDaos(daos, transaction, txTimestamp);
  }

  private async handleNewToken(
    functionCallArgs: string,
    transaction: any,
    txTimestamp: number,
  ) {
    const { args } = btoaJSON(functionCallArgs);
    const { metadata } = args || {};
    const tokenIds = [];

    if (metadata) {
      tokenIds.push(metadata.symbol);
    }

    const tokens = await this.tokenFactoryService.getTokens(tokenIds);

    await this.enrichTokens(tokens, transaction, txTimestamp);
  }

  private async handleNewProposal(
    functionCallArgs: string,
    transaction: any,
    txTimestamp: number,
  ) {
    const { proposal } = btoaJSON(functionCallArgs);
    const { receiver_id } = transaction;
    const proposalTxArgs = [];
    const proposalDaoIds = [];

    proposalDaoIds.push(receiver_id);
    proposalTxArgs.push(proposal);

    const proposals = await this.sputnikDaoService.getProposals(proposalDaoIds);
    await this.enrichProposals(
      proposals,
      proposalTxArgs,
      transaction,
      txTimestamp,
    );
  }

  private async enrichDaos(
    daos: SputnikDaoDto[],
    transaction: any,
    txTimestamp: number,
  ) {
    const { hash } = transaction;

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
  }

  private async enrichProposals(
    proposals: ProposalDto[],
    proposalTxArgs: any[],
    transaction: any,
    txTimestamp: number,
  ) {
    const { hash, signer_id } = transaction;
    const enrichedProposals = proposals
      .filter((proposal) => {
        const { description, kind, proposer } = proposal;

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
  }

  private async enrichTokens(
    tokens: any[],
    transaction: any,
    txTimestamp: number,
  ) {
    const { hash } = transaction;

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
  }

  private async processActions(
    actions: any[],
    transaction: any,
    txTimestamp: number,
  ) {
    for (const action of actions) {
      const { FunctionCall } = action;

      const { method_name, args } = FunctionCall;

      switch (method_name) {
        case 'create': {
          await this.handleNewDao(args, transaction, txTimestamp);
          break;
        }
        case 'act_proposal': {
          await this.handleUpdateProposal(args, transaction, txTimestamp);
          break;
        }
        case 'add_proposal': {
          await this.handleNewProposal(args, transaction, txTimestamp);
          break;
        }
        case 'create_token': {
          await this.handleNewToken(args, transaction, txTimestamp);
          break;
        }
      }
    }
  }
}

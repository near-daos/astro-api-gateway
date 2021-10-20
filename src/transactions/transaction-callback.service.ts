import { Injectable, Logger } from '@nestjs/common';
import { DaoService } from 'src/daos/dao.service';
import { ProposalService } from 'src/proposals/proposal.service';
import { SputnikDaoService } from 'src/sputnikdao/sputnik.service';
import { ConfigService } from '@nestjs/config';
import { btoaJSON } from 'src/utils';
import { castProposalKind, ProposalDto } from 'src/proposals/dto/proposal.dto';
import { TokenFactoryService } from 'src/token-factory/token-factory.service';
import { TokenService } from 'src/tokens/token.service';
import { CacheService } from 'src/cache/service/cache.service';

@Injectable()
export class TransactionCallbackService {
  private readonly logger = new Logger(TransactionCallbackService.name);

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

    const [dao, proposal] = await Promise.all([
      this.sputnikDaoService.getDaoById(receiver_id),
      this.sputnikDaoService.getProposal(receiver_id, proposalId),
    ]);

    const enrichedProposal = {
      ...proposal,
      transactionHash: hash,
      createTimestamp: txTimestamp,
    };

    this.logger.log(
      `Storing updated Proposal from wallet callback: ${proposal.id}`,
    );
    await this.proposalService.create(enrichedProposal);
    this.logger.log(`Successfully updated Proposal: ${proposal.id}`);

    const enrichedDao = {
      ...dao,
      updateTransactionHash: hash,
      updateTimestamp: txTimestamp,
    };

    this.logger.log(
      `Storing updated DAO from Proposal wallet callback: ${dao.id}`,
    );
    await this.daoService.create(enrichedDao);
    this.logger.log(`Successfully updated DAO: ${dao.id}`);
  }

  private async handleNewDao(
    functionCallArgs: string,
    transaction: any,
    txTimestamp: number,
  ) {
    const { hash } = transaction;
    const { contractName } = this.configService.get('near');
    const { name } = btoaJSON(functionCallArgs);

    const dao = await this.sputnikDaoService.getDaoById(
      `${name}.${contractName}`,
    );

    const enrichedDao = {
      ...dao,
      transactionHash: hash,
      createTimestamp: txTimestamp,
    };

    this.logger.log(`Storing new DAO from wallet callback: ${dao.id}`);
    await this.daoService.create(enrichedDao);
    this.logger.log(`Successfully stored new DAO: ${dao.id}`);
  }

  private async handleNewToken(
    functionCallArgs: string,
    transaction: any,
    txTimestamp: number,
  ) {
    const { hash } = transaction;
    const { args } = btoaJSON(functionCallArgs);
    const { metadata } = args || {};

    const token = await this.tokenFactoryService.getToken(metadata.symbol);

    const enrichedToken = {
      ...token,
      transactionHash: hash,
      createTimestamp: txTimestamp,
    };

    this.logger.log('Storing Tokens from wallet callback...');
    this.tokenService.create(enrichedToken);
  }

  private async handleNewProposal(
    functionCallArgs: string,
    transaction: any,
    txTimestamp: number,
  ) {
    const { proposal } = btoaJSON(functionCallArgs);
    const { receiver_id, hash } = transaction;
    const proposalTxArgs = [proposal];

    const [dao, proposals] = await Promise.all([
      this.sputnikDaoService.getDaoById(receiver_id),
      this.sputnikDaoService.getProposals([receiver_id]),
    ]);

    const enrichedProposals = this.enrichProposals(
      proposals,
      proposalTxArgs,
      transaction,
      txTimestamp,
    );

    if (enrichedProposals.length) {
      this.logger.log('Storing Proposals from wallet callback...');
      await Promise.all(
        enrichedProposals.map((proposal) =>
          this.proposalService.create(proposal),
        ),
      );
      this.logger.log('Successfully stored Proposals.');
    }

    const enrichedDao = {
      ...dao,
      updateTransactionHash: hash,
      updateTimestamp: txTimestamp,
    };

    this.logger.log(
      `Storing updated DAO from Proposal wallet callback: ${dao.id}`,
    );
    await this.daoService.create(enrichedDao);
    this.logger.log(`Successfully updated DAO: ${dao.id}`);
  }

  private enrichProposals(
    proposals: ProposalDto[],
    proposalTxArgs: any[],
    transaction: any,
    txTimestamp: number,
  ): ProposalDto[] {
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

    return enrichedProposals;
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

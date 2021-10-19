import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Account, Receipt } from 'src/near';
import { NearService } from 'src/near/near.service';
import { ExecutionOutcomeStatus } from 'src/near/types/execution-outcome-status';
import { SputnikDaoService } from 'src/sputnikdao/sputnik.service';
import { TokenService } from 'src/tokens/token.service';
import { Repository } from 'typeorm';
import { DaoTokenResponseDto } from './dto/dao-token-response.dto';
import { Dao } from './entities/dao.entity';

@Injectable()
export class DaoNearService {
  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
    private readonly configService: ConfigService,
    private readonly nearService: NearService,
    private readonly sputnikDaoService: SputnikDaoService,
    private readonly tokenService: TokenService,
  ) {}

  async processTransactionCallback(transactionHash: string): Promise<any> {
    const { contractName } = this.configService.get('near');

    const receipt: Receipt =
      await this.nearService.findReceiptByTransactionHashAndPredecessor(
        transactionHash,
        contractName,
      );

    const { receiptId, originatedFromTransaction } = receipt || {};
    if (
      !originatedFromTransaction ||
      originatedFromTransaction.status !==
        ExecutionOutcomeStatus.SuccessReceiptId
    ) {
      return;
    }

    const account: Account = await this.nearService.findAccountByReceiptId(
      receiptId,
    );
    if (!account) {
      return;
    }

    // Assuming that Dao has been created successfully - changing status to DaoStatus.Success
    return this.daoRepository.save({
      id: account.accountId,
      transactionHash: originatedFromTransaction.transactionHash,
    });
  }

  async getTokensByDao(daoId: string): Promise<DaoTokenResponseDto[]> {
    const { tokenFactoryContractName } = this.configService.get('near');
    const tokenIds = await this.nearService.findLikelyTokens(daoId);

    const [tokens, balances] = await Promise.all([
      this.tokenService.findByIds(
        tokenIds.map((id) =>
          id.substring(0, id.indexOf(`.${tokenFactoryContractName}`)),
        ),
      ),
      Promise.all(
        tokenIds.map((token) =>
          this.sputnikDaoService.getFTBalance(token, daoId),
        ),
      ),
    ]);

    return tokens.map((token) => {
      const tokenIdx = tokenIds.indexOf(
        `${token.id}.${tokenFactoryContractName}`,
      );

      return {
        ...token,
        tokenId: tokenIds[tokenIdx],
        balance: balances[tokenIdx],
      };
    });
  }
}

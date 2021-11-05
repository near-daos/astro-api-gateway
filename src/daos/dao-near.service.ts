import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Account, Receipt } from 'src/near-indexer';
import { NearIndexerService } from 'src/near-indexer/near-indexer.service';
import { ExecutionOutcomeStatus } from 'src/near-indexer/types/execution-outcome-status';
import { Repository } from 'typeorm';
import { Dao } from './entities/dao.entity';

@Injectable()
export class DaoNearService {
  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
    private readonly configService: ConfigService,
    private readonly nearIndexerService: NearIndexerService,
  ) {}

  async processTransactionCallback(transactionHash: string): Promise<any> {
    const { contractName } = this.configService.get('near');

    const receipt: Receipt =
      await this.nearIndexerService.findReceiptByTransactionHashAndPredecessor(
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

    const account: Account = await this.nearIndexerService.findAccountByReceiptId(
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
}

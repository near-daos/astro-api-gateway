import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Account, Receipt } from 'src/near';
import { NearService } from 'src/near/near.service';
import { ExecutionOutcomeStatus } from 'src/near/types/execution-outcome-status';
import { Repository } from 'typeorm';
import { Dao } from './entities/dao.entity';
import { DaoStatus } from './types/dao-status';

@Injectable()
export class DaoNearService {
  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
    private readonly configService: ConfigService,
    private readonly nearService: NearService,
  ) {}

  async processTransactionCallback(transactionHash: string): Promise<any> {
    const { contractName } = this.configService.get('near');

    const receipt: Receipt =
      await this.nearService.findReceiptByTransactionHashAndPredecessor(
        transactionHash,
        contractName,
      );

    const {
      receiptId,
      originatedFromTransactionHash,
      originatedFromTransaction,
    } = receipt || {};
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
      status: DaoStatus.Success,
      transactionHash: originatedFromTransactionHash,
    });
  }
}

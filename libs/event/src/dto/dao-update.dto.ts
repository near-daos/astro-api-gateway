import { DaoDto } from '@sputnik-v2/dao/dto';
import { TransactionAction } from '@sputnik-v2/transaction-handler';

export class DaoUpdateDto {
  dao: DaoDto;
  txAction: TransactionAction;
}

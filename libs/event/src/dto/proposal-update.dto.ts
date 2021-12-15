import { ProposalDto } from '@sputnik-v2/proposal';
import { TransactionAction } from '@sputnik-v2/transaction-handler';

export class ProposalUpdateDto {
  proposal: ProposalDto;
  txAction: TransactionAction;
}

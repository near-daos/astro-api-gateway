import camelcaseKeys from 'camelcase-keys';
import {
  btoaJSON,
  buildProposalId,
  calcProposalVotePeriodEnd,
} from '@sputnik-v2/utils';
import { Dao } from '@sputnik-v2/dao';
import {
  Action,
  buildProposalAction,
  castProposalKind,
  ProposalActionDto,
  ProposalDto,
} from '@sputnik-v2/proposal';
import { Transaction } from '@sputnik-v2/near-indexer';

function castProposalVoteActions(
  id: string,
  txs: Transaction[],
): ProposalActionDto[] {
  return txs
    .filter(
      ({ transactionAction }) =>
        transactionAction.args.method_name == 'act_proposal',
    )
    .map(
      ({
        transactionAction,
        signerAccountId: accountId,
        transactionHash,
        blockTimestamp,
      }) => {
        const action = btoaJSON(
          transactionAction.args.args_base64 as string,
        )?.action;

        return buildProposalAction(
          id,
          { accountId, transactionHash, blockTimestamp },
          action,
        );
      },
    );
}

export function castProposal(
  dao: Dao,
  txs: Transaction[],
  proposal,
): ProposalDto {
  const id = buildProposalId(dao.id, proposal.id);
  const kind = castProposalKind(proposal.kind);
  const filteredTxs = txs.filter((tx) => tx.transactionAction.args.args_base64);
  const proposalTxs = filteredTxs.filter(
    (tx) => btoaJSON(String(tx.transactionAction.args.args_base64))?.id === id,
  );
  const txData = filteredTxs.find((tx) => {
    const { signerAccountId, transactionAction } = tx;
    const txProposal = btoaJSON(
      String(transactionAction.args.args_base64),
    )?.proposal;
    return (
      transactionAction.args.method_name == 'add_proposal' &&
      proposal.description === txProposal?.description &&
      kind.equals(castProposalKind(txProposal?.kind)) &&
      signerAccountId === proposal.proposer
    );
  });
  const txUpdateData = proposalTxs[proposalTxs.length - 1] || txData;
  const actions = castProposalVoteActions(id, proposalTxs);

  if (txData) {
    actions.unshift(
      buildProposalAction(
        id,
        {
          ...txData,
          accountId: proposal.proposer,
        },
        Action.AddProposal,
      ),
    );
  }

  return {
    ...camelcaseKeys(proposal),
    id,
    proposalId: proposal.id,
    daoId: dao.id,
    dao: { id: dao.id },
    kind,
    type: kind.kind.type,
    votePeriodEnd: calcProposalVotePeriodEnd(
      { submissionTime: proposal.submissionTime },
      dao,
    ),
    actions,
    transactionHash: txData?.transactionHash,
    createTimestamp: txData?.blockTimestamp,
    updateTransactionHash: txUpdateData?.transactionHash,
    updateTimestamp: txUpdateData?.blockTimestamp,
  };
}

import camelcaseKeys from 'camelcase-keys';
import { Vote } from 'src/sputnikdao/types/vote';
import { ProposalStatus } from '../types/proposal-status';
import { ProposalType } from '../types/proposal-type';
import {
  ProposalKind,
  ProposalKindChangeConfig,
  ProposalKindFunctionCall,
} from './proposal-kind.dto';

export class ProposalDto {
  id: number;
  daoId: string;
  proposer: string;
  description: string;
  status: ProposalStatus;
  submission_time: number;
  kind: ProposalKindDto;
  vote_counts: { [key: string]: number[] };
  votes: {
    [key: string]: Vote;
  };
  transactionHash: string;
  updateTransactionHash: string;
  createTimestamp: number;
  updateTimestamp: number;
}

export class ProposalKindDto {
  public kind: ProposalKind;

  constructor(kind: ProposalKind) {
    this.kind = kind;
  }

  equals(kindWrapper: ProposalKindDto | null): boolean {
    const { kind } = kindWrapper || {};

    if (this.kind.type === ProposalType.ChangeConfig) {
      const { config } = this.kind;
      const {
        metadata: thisMetadata,
        name: thisName,
        purpose: thisPurpose,
      } = config;
      const { metadata, name, purpose } = (kind as ProposalKindChangeConfig)
        ?.config;

      return (
        thisMetadata === metadata &&
        thisName === name &&
        thisPurpose === purpose
      );
    } else if (this.kind.type === ProposalType.FunctionCall) {
      const { receiverId: thisReceiverId, actions: thisActions } = this
        .kind as ProposalKindFunctionCall;
      const { receiverId, actions } = this.kind;

      const actionsEqLength = thisActions.filter(
        (
          {
            methodName: thisMethodName,
            args: thisArgs,
            deposit: thisDeposit,
            gas: thisGas,
          },
          i,
        ) => {
          const { methodName, args, deposit, gas } = actions[i] || {};

          return (
            thisMethodName === methodName &&
            thisArgs === args &&
            thisDeposit === deposit &&
            thisGas === gas
          );
        },
      );

      return (
        thisReceiverId === receiverId &&
        actions.length === actionsEqLength.length
      );
    }

    //TODO: Populate for other Proposal kinds!!!

    return false;
  }
}

export function castKind(kind: unknown): ProposalKindDto | null {
  if (!kind) {
    return null;
  }

  const kindType = Object.keys(ProposalType).find((key) =>
    kind.hasOwnProperty(key),
  );

  return new ProposalKindDto({
    type: kindType,
    ...camelcaseKeys(kind[kindType], { deep: true }),
  });
}

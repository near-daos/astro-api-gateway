import { SputnikDaoProposalKind } from '@sputnik-v2/near-api';
import camelcaseKeys from 'camelcase-keys';
import { PolicyDtoV1 } from '@sputnik-v2/dao';
import { TransactionInfo } from '@sputnik-v2/common';
import { Vote } from '@sputnik-v2/sputnikdao/types';

import {
  ProposalPolicyLabel,
  ProposalStatus,
  ProposalType,
  ProposalVoteStatus,
} from '../types';
import {
  isProposalKind,
  ProposalKind,
  ProposalKindAddBounty,
  ProposalKindAddMemberToRole,
  ProposalKindAddRemoveMemberFromRole,
  ProposalKindBountyDone,
  ProposalKindChangeConfig,
  ProposalKindChangePolicy,
  ProposalKindFunctionCall,
  ProposalKindSetStakingContract,
  ProposalKindTransfer,
  ProposalKindUpgradeRemote,
  ProposalKindUpgradeSelf,
} from './proposal-kind.dto';
import { ProposalActionDto } from './proposal-action.dto';

export class ProposalDto extends TransactionInfo {
  id: string;
  proposalId: number;
  daoId: string;
  bountyDoneId?: string;
  bountyClaimId?: string;
  proposer: string;
  description: string;
  status: ProposalStatus;
  submissionTime: string;
  kind: ProposalKindDto;
  type: ProposalType;
  policyLabel?: ProposalPolicyLabel;
  voteStatus: ProposalVoteStatus;
  voteCounts: Record<string, number[]>;
  votes: Record<string, Vote>;
  actions: ProposalActionDto[];
  votePeriodEnd: string;
  failure?: Record<string, any>;
}

export class ProposalKindDto {
  public kind: ProposalKind;
  public type: ProposalType;

  constructor(kind: ProposalKind) {
    this.kind = kind;
    this.type = kind.type;
  }

  equals(kindWrapper: ProposalKindDto | null): boolean {
    const { type: thisType } = this.kind;

    const { kind } = kindWrapper || {};
    const { type } = kind || {};

    if (
      ProposalType.ChangeConfig === thisType &&
      ProposalType.ChangeConfig === type
    ) {
      const { config } = this.kind as ProposalKindChangeConfig;
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
    } else if (
      ProposalType.FunctionCall === thisType &&
      ProposalType.FunctionCall === type
    ) {
      const { receiverId: thisReceiverId, actions: thisActions } = this
        .kind as ProposalKindFunctionCall;
      const { receiverId, actions } = kind as ProposalKindFunctionCall;

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
          const { methodName, args, deposit, gas } = actions?.[i] || {};

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
        actions?.length === actionsEqLength.length
      );
    } else if (
      ProposalType.ChangePolicy === thisType &&
      ProposalType.ChangePolicy === type
    ) {
      const thisPolicy = (this.kind as ProposalKindChangePolicy)?.policy as
        | PolicyDtoV1
        | [];
      const { policy } = kind as ProposalKindChangePolicy;

      if (policy instanceof Array) {
        return (
          (thisPolicy as []).length === policy.length &&
          (thisPolicy as []).every((v, i) => v === policy[i])
        );
      }

      const {
        bountyBond: thisBountyBond,
        bountyForgivenessPeriod: thisBountyForgivenessPeriod,
        proposalBond: thisProposalBond,
        proposalPeriod: thisProposalPeriod,
      } = thisPolicy as PolicyDtoV1;

      const {
        bountyBond,
        bountyForgivenessPeriod,
        proposalBond,
        proposalPeriod,
      } = policy || {}; //TODO: revise this!!!

      //TODO: compare defaultVotePolicy and roles
      return (
        thisBountyBond === bountyBond &&
        thisBountyForgivenessPeriod === bountyForgivenessPeriod &&
        thisProposalBond === proposalBond &&
        thisProposalPeriod === proposalPeriod
      );
    } else if (
      ProposalType.AddMemberToRole === thisType &&
      ProposalType.AddMemberToRole === type
    ) {
      const { memberId: thisMemberId, role: thisRole } = this
        .kind as ProposalKindAddMemberToRole;
      const { memberId, role } = kind as ProposalKindAddMemberToRole;

      return thisMemberId === memberId && thisRole === role;
    } else if (
      ProposalType.RemoveMemberFromRole === thisType &&
      ProposalType.RemoveMemberFromRole === type
    ) {
      const { memberId: thisMemberId, role: thisRole } = this
        .kind as ProposalKindAddRemoveMemberFromRole;
      const { memberId, role } = kind as ProposalKindAddRemoveMemberFromRole;

      return thisMemberId === memberId && thisRole === role;
    } else if (
      ProposalType.UpgradeSelf === thisType &&
      ProposalType.UpgradeSelf === type
    ) {
      const { hash: thisHash } = this.kind as ProposalKindUpgradeSelf;
      const { hash } = kind as ProposalKindUpgradeSelf;

      return thisHash === hash;
    } else if (
      ProposalType.UpgradeRemote === thisType &&
      ProposalType.UpgradeRemote === type
    ) {
      const {
        hash: thisHash,
        methodName: thisMethodName,
        receiverId: thisReceiverId,
      } = this.kind as ProposalKindUpgradeRemote;
      const { hash, methodName, receiverId } =
        kind as ProposalKindUpgradeRemote;

      return (
        thisHash === hash &&
        thisMethodName === methodName &&
        thisReceiverId === receiverId
      );
    } else if (
      ProposalType.Transfer === thisType &&
      ProposalType.Transfer === type
    ) {
      const {
        amount: thisAmount,
        msg: thisMsg,
        receiverId: thisReceiverId,
        tokenId: thisTokenId,
      } = this.kind as ProposalKindTransfer;
      const { amount, msg, receiverId, tokenId } = kind as ProposalKindTransfer;

      return (
        thisAmount === amount &&
        thisMsg == msg &&
        thisReceiverId === receiverId &&
        thisTokenId === tokenId
      );
    } else if (
      ProposalType.SetStakingContract === thisType &&
      ProposalType.SetStakingContract === type
    ) {
      const { stakingId: thisStakingId } = this
        .kind as ProposalKindSetStakingContract;
      const { stakingId } = kind as ProposalKindSetStakingContract;

      return thisStakingId === stakingId;
    } else if (
      ProposalType.AddBounty === thisType &&
      ProposalType.AddBounty === type
    ) {
      const { bounty } = this.kind as ProposalKindAddBounty;
      const {
        amount: thisAmount,
        description: thisDescription,
        maxDeadline: thisMaxDeadline,
        times: thisTimes,
        token: thisToken,
      } = bounty || {};
      const { amount, description, maxDeadline, times, token } =
        (kind as ProposalKindAddBounty)?.bounty || {};

      return (
        thisAmount === amount &&
        thisDescription === description &&
        thisMaxDeadline === maxDeadline &&
        thisTimes === times &&
        thisToken === token
      );
    } else if (
      ProposalType.BountyDone === thisType &&
      ProposalType.BountyDone === type
    ) {
      const { bountyId: thisBountyId, receiverId: thisReceiverId } = this
        .kind as ProposalKindBountyDone;
      const { bountyId, receiverId } = kind as ProposalKindBountyDone;

      return thisBountyId === bountyId && thisReceiverId === receiverId;
    } else if (this.kind.type === ProposalType.Vote) {
      return true;
    }

    return false;
  }
}

export function castProposalKind(
  kind: ProposalKind | SputnikDaoProposalKind,
): ProposalKindDto | null {
  if (!kind) {
    return null;
  }

  if (isProposalKind(kind)) {
    return new ProposalKindDto(kind);
  }

  if (kind === ProposalType.Vote) {
    return new ProposalKindDto({ type: ProposalType.Vote });
  }

  const type = Object.keys(ProposalType).find((key) =>
    kind.hasOwnProperty(key),
  );

  return new ProposalKindDto({
    type,
    ...camelcaseKeys(kind[type], { deep: true }),
  });
}

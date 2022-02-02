import camelcaseKeys from 'camelcase-keys';
import { PolicyDto } from '@sputnik-v2/dao';
import { TransactionInfo } from '@sputnik-v2/common';
import { Vote } from '@sputnik-v2/sputnikdao/types';

import { ProposalStatus, ProposalType } from '../types';

import {
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
  submissionTime: number;
  kind: ProposalKindDto;
  type?: ProposalType;
  voteCounts: { [key: string]: number[] };
  votes: {
    [key: string]: Vote;
  };
  actions: ProposalActionDto[];
  votePeriodEnd: number;
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
        | PolicyDto
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
      } = thisPolicy as PolicyDto;

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

export function castProposalKind(kind: unknown): ProposalKindDto | null {
  if (!kind) {
    return null;
  }

  if (kind === ProposalType.Vote) {
    return new ProposalKindDto({ type: ProposalType.Vote });
  }

  if (kind.hasOwnProperty('type')) {
    return new ProposalKindDto(kind as ProposalKindChangePolicy);
  }

  const type = Object.keys(ProposalType).find((key) =>
    kind.hasOwnProperty(key),
  );

  return new ProposalKindDto({
    type,
    ...camelcaseKeys(kind[type], { deep: true }),
  });
}

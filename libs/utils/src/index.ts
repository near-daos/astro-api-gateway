import Decimal from 'decimal.js';

import { DaoDto } from '@sputnik-v2/dao/dto';
import { Dao, Role, RoleKindType } from '@sputnik-v2/dao/entities';
import {
  ProposalType,
  ProposalPermissions,
  ProposalTypeToPolicyLabel,
} from '@sputnik-v2/proposal/types';
import { Proposal } from '@sputnik-v2/proposal/entities';
import { ProposalDto } from '@sputnik-v2/proposal/dto';
import { BaseResponse, PROPOSAL_DESC_SEPARATOR } from '@sputnik-v2/common';

export const formatTimestamp = (timestamp: number): string => {
  const seconds = Number(timestamp / 1e9);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay = d > 0 ? d + (d === 1 ? ' day, ' : ' days, ') : '';
  const hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : '';
  const mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : '';
  const sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '';

  return (dDisplay + hDisplay + mDisplay + sDisplay).replace(/,\s*$/, '');
};

export const convertDuration = (duration: number): Date => {
  const utcSeconds = duration / 1e9;
  const epoch = new Date(0);

  epoch.setUTCSeconds(utcSeconds);

  return epoch;
};

export const getBlockTimestamp = (date = new Date()): number => {
  // the approximate block timestamp in microseconds - the same way as it's done in indexer
  return date.getTime() * 1000000;
};

export const buildProposalId = (daoId: string, proposalId: number): string => {
  return `${daoId}-${proposalId}`;
};

export const buildProposalActionId = (
  proposalId: string,
  accountId: string,
  action: string,
): string => {
  return `${proposalId}-${accountId}-${action}`;
};

export const buildDaoId = (name: string, contractName: string): string => {
  return `${name}.${contractName}`;
};

export const buildBountyId = (daoId: string, bountyId: string): string => {
  return `${daoId}-${bountyId}`;
};

export const buildBountyClaimId = (
  daoId: string,
  bountyId: string,
  bountyClaimId: number,
): string => {
  return `${daoId}-${bountyId}-${bountyClaimId}`;
};

export const buildRoleId = (daoId: string, name: string): string => {
  return `${daoId}-${name}`;
};

export const buildSubscriptionId = (
  daoId: string,
  accountId: string,
): string => {
  return `${daoId}-${accountId}`;
};

export const buildNotificationId = (txHash: string, type: string): string => {
  return `${type.toLowerCase()}-${txHash.toLowerCase()}`;
};

export const buildAccountNotificationId = (
  accountId: string,
  notificationId: string,
): string => {
  return `${accountId}-${notificationId}`;
};

export const buildAccountNotificationSettingsId = (
  accountId: string,
  daoId?: string,
): string => {
  return `${accountId}-${daoId || 'all'}`;
};

export const buildTokenBalanceId = (tokenId: string, accountId: string) => {
  return `${tokenId}-${accountId}`;
};

export const buildNFTTokenId = (ownerId: string, tokenId: string) => {
  return `${ownerId}-${tokenId}`;
};

export const buildCommentReportId = (
  commentId: number,
  accountId: string,
): string => {
  return `${commentId}-${accountId.toLowerCase()}`;
};

export const buildDaoStatsId = (daoId: string, timestamp: number): string => {
  return `${daoId}-${timestamp}`;
};

export const buildTemplateId = (daoId: string): string => {
  return `${daoId}-${Date.now()}`;
};

export const buildDelegationId = (daoId: string, accountId: string): string => {
  return `${daoId}-${accountId}`;
};

export const decodeBase64 = (b: string) => {
  return Buffer.from(b, 'base64').toString('utf-8');
};

export const btoaJSON = (b: string) => {
  try {
    return JSON.parse(decodeBase64(b));
  } catch (e) {}
};

export const calcProposalVotePeriodEnd = (
  proposal: Proposal | ProposalDto | { submissionTime: number },
  dao: Dao | DaoDto,
): number => {
  try {
    return Decimal.sum(
      new Decimal(proposal.submissionTime),
      new Decimal(dao?.policy?.proposalPeriod),
    ).toNumber();
  } catch (e) {}
};

export function isNotNull<T>(arg: T): arg is Exclude<T, null> {
  return arg !== null;
}

export function paginate<T>(
  data: T[],
  limit: number,
  offset: number,
  total: number,
): BaseResponse<T> {
  const page = limit ? Math.floor(offset / limit) + 1 : 1;
  const pageCount = limit && total ? Math.ceil(total / limit) : 1;
  return {
    data,
    page,
    pageCount,
    count: data.length,
    total,
  };
}

export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const calculateClaimEndTime = (
  startTime = '0',
  deadline = '0',
): string => {
  return (BigInt(startTime) + BigInt(deadline)).toString();
};

export const calculateFunds = (amount, price, decimals): number => {
  const value = Number(BigInt(amount) / BigInt(10) ** BigInt(decimals));
  return value > 0 && price > 0 ? value * price : 0;
};

export const getGrowth = (current: number, prev?: number) => {
  return typeof prev === 'number'
    ? Math.round(((current - prev) / (current || 1)) * 10000) / 100
    : 0;
};

export const buildLikeContractName = (contractName: string) => {
  return `%.${contractName}`;
};

export const filterProposalDesc = (description = '') => {
  const separationIndex = description.indexOf(PROPOSAL_DESC_SEPARATOR);
  return separationIndex !== -1
    ? description.slice(0, separationIndex)
    : description;
};

export const getAccountPermissions = (
  roles: Role[],
  type?: ProposalType,
  accountId?: string,
  accountBalance?: bigint,
): ProposalPermissions => {
  if (!accountId) {
    return {
      isCouncil: false,
      canApprove: false,
      canReject: false,
      canDelete: false,
      canAdd: false,
    };
  }
  const council = roles.find((role) => role.name.toLowerCase() === 'council');
  const permissions = roles.reduce((roles, role) => {
    if (
      role.kind === RoleKindType.Everyone ||
      (role.kind === RoleKindType.Group &&
        role.accountIds.includes(accountId)) ||
      (role.kind === RoleKindType.Member && accountBalance >= role.balance)
    ) {
      return [...roles, ...role.permissions];
    }
    return roles;
  }, []);

  return {
    isCouncil: council?.accountIds
      ? council.accountIds.includes(accountId)
      : false,
    canApprove: checkPermissions(type, 'VoteApprove', permissions),
    canReject: checkPermissions(type, 'VoteReject', permissions),
    canDelete: checkPermissions(type, 'VoteRemove', permissions),
    canAdd: checkPermissions(type, 'AddProposal', permissions),
  };
};

export const checkPermissions = (
  type: ProposalType,
  permission: string,
  permissions: string[],
): boolean => {
  const policyLabel = ProposalTypeToPolicyLabel[type];
  return (
    permissions.includes('*:*') ||
    permissions.includes(`*:${permission}`) ||
    permissions.includes(`${policyLabel}:${permission}`)
  );
};

export const parseJSON = (s: string) => {
  try {
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
};

export const getChunkCount = (total: BigInt, chunkSize: number): number => {
  return (Number(total) - (Number(total) % chunkSize)) / chunkSize + 1;
};

export const stringToBoolean = (value?: string): boolean | undefined => {
  return typeof value === 'string' ? value === 'true' : undefined;
};

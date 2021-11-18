import Decimal from 'decimal.js';

import { DaoDto, Dao } from '@sputnik-v2/dao';
import { ProposalDto, Proposal } from '@sputnik-v2/proposal';

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

export const getBlockTimestamp = (date = new Date()) => {
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

export const buildNFTTokenId = (ownerId: string, tokenId: string) => {
  return `${ownerId}-${tokenId}`;
};

export const btoaJSON = (b: string) => {
  try {
    return JSON.parse(Buffer.from(b, 'base64').toString('utf-8'));
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

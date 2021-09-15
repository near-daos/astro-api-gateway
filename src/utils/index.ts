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

export const buildProposalId = (daoId: string, proposalId: string): string => {
  return `${daoId}-${proposalId}`;
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

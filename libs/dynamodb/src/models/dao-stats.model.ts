import { DaoStats } from '@sputnik-v2/stats';
import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType, PartialEntity } from '../types';

export class DaoStatsModel extends BaseModel {
  id: string;
  timestamp: number; // milliseconds
  amount: string;
  totalDaoFunds: number;
  transactionsCount: number;
  bountyCount: number;
  nftCount: number;
  activeProposalCount: number;
  totalProposalCount: number;
}

export function mapDaoStatsToDaoStatsModel(
  stats: Partial<DaoStats>,
): PartialEntity<DaoStatsModel> {
  return {
    partitionId: stats.daoId,
    entityId: buildEntityId(DynamoEntityType.DaoStats, stats.id),
    entityType: DynamoEntityType.DaoStats,
    isArchived: !!stats.isArchived,
    createdAt: stats.createdAt ? stats.createdAt.getTime() : undefined,
    updatedAt: stats.updatedAt ? stats.updatedAt.getTime() : undefined,
    id: stats.id,
    timestamp: stats.timestamp,
    amount: stats.amount,
    totalDaoFunds: stats.totalDaoFunds,
    transactionsCount: stats.transactionsCount,
    bountyCount: stats.bountyCount,
    nftCount: stats.nftCount,
    activeProposalCount: stats.activeProposalCount,
    totalProposalCount: stats.totalProposalCount,
  };
}

export function mapDaoStatsModelToDaoStats(
  stats: PartialEntity<DaoStatsModel>,
): Partial<DaoStats> {
  return {
    id: stats.id,
    daoId: stats.partitionId,
    timestamp: stats.timestamp,
    amount: stats.amount,
    totalDaoFunds: stats.totalDaoFunds,
    transactionsCount: stats.transactionsCount,
    bountyCount: stats.bountyCount,
    nftCount: stats.nftCount,
    activeProposalCount: stats.activeProposalCount,
    totalProposalCount: stats.totalProposalCount,
    isArchived: !!stats.isArchived,
    createdAt: stats.createdAt ? new Date(stats.createdAt) : undefined,
    updatedAt: stats.updatedAt ? new Date(stats.updatedAt) : undefined,
  };
}

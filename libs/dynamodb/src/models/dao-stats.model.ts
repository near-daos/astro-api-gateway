import { DaoStats } from '@sputnik-v2/stats';
import { buildEntityId } from '@sputnik-v2/utils';
import { BaseModel } from './base.model';
import { DynamoEntityType } from '../types';

export class DaoStatsModel extends BaseModel {
  id: string;
  timestamp: number;
  totalDaoFunds: number;
  transactionsCount: number;
  bountyCount: number;
  nftCount: number;
  activeProposalCount: number;
  totalProposalCount: number;
}

export function mapDaoStatsToDaoStatsModel(stats: DaoStats): DaoStatsModel {
  return {
    partitionId: stats.daoId,
    entityId: buildEntityId(DynamoEntityType.DaoStats, stats.id),
    entityType: DynamoEntityType.DaoStats,
    isArchived: stats.isArchived,
    processingTimeStamp: Date.now(),
    id: stats.id,
    timestamp: stats.timestamp,
    totalDaoFunds: stats.totalDaoFunds,
    transactionsCount: stats.transactionsCount,
    bountyCount: stats.bountyCount,
    nftCount: stats.nftCount,
    activeProposalCount: stats.activeProposalCount,
    totalProposalCount: stats.totalProposalCount,
    createTimestamp: stats.createdAt.getTime(),
  };
}

export function mapDaoStatsModelToDaoStats(stats: DaoStatsModel): DaoStats {
  return {
    id: stats.id,
    daoId: stats.partitionId,
    timestamp: stats.timestamp,
    totalDaoFunds: stats.totalDaoFunds,
    transactionsCount: stats.transactionsCount,
    bountyCount: stats.bountyCount,
    nftCount: stats.nftCount,
    activeProposalCount: stats.activeProposalCount,
    totalProposalCount: stats.totalProposalCount,
    isArchived: stats.isArchived,
    createdAt: new Date(stats.createTimestamp),
    updatedAt: new Date(stats.createTimestamp),
  };
}

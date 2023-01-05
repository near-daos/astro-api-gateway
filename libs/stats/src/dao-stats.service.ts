import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DaoDynamoService } from '@sputnik-v2/dao';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';

import { DaoService } from '@sputnik-v2/dao';
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';
import { buildDaoStatsId, getGrowth } from '@sputnik-v2/utils';

import { DaoStatsDynamoService } from './dao-stats-dynamo.service';
import {
  DaoStatsDto,
  DaoStatsStateDto,
  ProposalStatsEntryDto,
  StatsEntryDto,
  StatsStateDto,
} from './dto';
import { DaoStats } from './entities';
import { DaoStatsEntryFields } from './types';

@Injectable()
export class DaoStatsService {
  constructor(
    @InjectRepository(DaoStats)
    private readonly daoStatsRepository: Repository<DaoStats>,
    private readonly daoService: DaoService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly daoDynamoService: DaoDynamoService,
    private readonly daoStatsDynamoService: DaoStatsDynamoService,
  ) {}

  async useDynamoDB() {
    return this.featureFlagsService.check(FeatureFlags.DaoStatsDynamo);
  }

  async create(daoStatsDto: DaoStatsDto): Promise<DaoStats> {
    const daoStats = this.daoStatsRepository.create(daoStatsDto);

    await this.daoStatsRepository.save(daoStats);
    await this.daoStatsDynamoService.saveDaoStats(daoStats);

    return daoStats;
  }

  async getDaoStats(daoId: string): Promise<DaoStatsDto> {
    const timestamp = DateTime.now().startOf('day').toMillis();
    const dao = await this.daoService.findById(daoId);

    if (!dao) {
      throw new NotFoundException();
    }

    return {
      id: buildDaoStatsId(dao.id, timestamp),
      daoId,
      timestamp,
      totalDaoFunds: dao.totalDaoFunds,
      totalProposalCount: dao.totalProposalCount,
      activeProposalCount: dao.activeProposalCount,
      bountyCount: dao.bountyCount,
      nftCount: dao.nftCount,
    };
  }

  async getLastDaoStats(
    daoId: string,
    timestamp?: number,
  ): Promise<Partial<DaoStats>> {
    if (!timestamp) {
      timestamp = DateTime.now().minus({ day: 1 }).startOf('day').toMillis();
    }

    if (await this.useDynamoDB()) {
      return this.daoStatsDynamoService.getDaoStats(daoId, timestamp);
    } else {
      return this.daoStatsRepository.findOne({
        where: { daoId, timestamp },
        order: { timestamp: 'DESC' },
      });
    }
  }

  async getDaoStatsState(
    daoStats: DaoStatsDto,
    previousDaoStats: Partial<DaoStats>,
  ): Promise<DaoStatsStateDto> {
    return {
      daoId: daoStats.daoId,
      timestamp: daoStats.timestamp,
      totalDaoFunds: this.getStatsState(
        daoStats.totalDaoFunds,
        previousDaoStats?.totalDaoFunds,
      ),
      totalProposalCount: this.getStatsState(
        daoStats.totalProposalCount,
        previousDaoStats?.totalProposalCount,
      ),
      activeProposalCount: this.getStatsState(
        daoStats.activeProposalCount,
        previousDaoStats?.activeProposalCount,
      ),
      bountyCount: this.getStatsState(
        daoStats.bountyCount,
        previousDaoStats?.bountyCount,
      ),
      nftCount: this.getStatsState(
        daoStats.nftCount,
        previousDaoStats?.nftCount,
      ),
    };
  }

  async getDaoStatsEntries(
    daoId: string,
    field: DaoStatsEntryFields,
  ): Promise<StatsEntryDto[]> {
    const currentDaoStats = await this.getDaoStats(daoId);

    let daoStats: Partial<DaoStats>[];

    if (await this.useDynamoDB()) {
      daoStats = await this.daoStatsDynamoService.queryDaoStats(daoId, {
        ProjectionExpression: '#timestamp, #field',
        ExpressionAttributeNames: {
          '#timestamp': 'timestamp',
          '#field': field,
        },
      });
    } else {
      daoStats = await this.daoStatsRepository
        .createQueryBuilder('stats')
        .select(['stats.timestamp', `stats.${field}`])
        .where('stats.daoId = :daoId', { daoId })
        .andWhere(`stats.${field} is not NULL`)
        .orderBy('stats.timestamp', 'ASC')
        .getMany();
    }

    return [...daoStats, currentDaoStats].map((stats) => ({
      timestamp: Number(stats.timestamp),
      value: stats[field] || 0,
    }));
  }

  async getDaoStatsProposalEntries(
    daoId: string,
  ): Promise<ProposalStatsEntryDto[]> {
    const currentDaoStats = await this.getDaoStats(daoId);

    let daoStats: Partial<DaoStats>[];

    if (await this.useDynamoDB()) {
      daoStats = await this.daoStatsDynamoService.queryDaoStats(daoId, {
        ProjectionExpression:
          '#timestamp, activeProposalCount, totalProposalCount',
        ExpressionAttributeNames: {
          '#timestamp': 'timestamp',
        },
      });
    } else {
      daoStats = await this.daoStatsRepository
        .createQueryBuilder('stats')
        .select([
          'stats.timestamp',
          'stats.activeProposalCount',
          'stats.totalProposalCount',
        ])
        .where('stats.daoId = :daoId', { daoId })
        .orderBy('stats.timestamp', 'ASC')
        .getMany();
    }

    return [...daoStats, currentDaoStats].map((stats) => ({
      timestamp: Number(stats.timestamp),
      total: stats.totalProposalCount,
      active: stats.activeProposalCount,
    }));
  }

  getStatsState(currentValue?: number, previousValue?: number): StatsStateDto {
    return {
      value: currentValue || 0,
      growth: getGrowth(currentValue, previousValue),
    };
  }
}

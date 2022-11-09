import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BountyService } from '@sputnik-v2/bounty';
import { DateTime } from 'luxon';

import { Dao, DaoService } from '@sputnik-v2/dao';
import {
  DaoDynamoService,
  DaoModel,
  DaoStatsDynamoService,
} from '@sputnik-v2/dynamodb';
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';
import { NFTTokenService } from '@sputnik-v2/token';
import { buildDaoStatsId, getGrowth } from '@sputnik-v2/utils';

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
    private readonly bountyService: BountyService,
    private readonly nftTokenService: NFTTokenService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly daoDynamoService: DaoDynamoService,
    private readonly daoStatsDynamoService: DaoStatsDynamoService,
  ) {}

  async useDynamoDB() {
    return this.featureFlagsService.check(FeatureFlags.DaoStatsDynamo);
  }

  async create(daoStatsDto: DaoStatsDto): Promise<DaoStats> {
    const daoStats = this.daoStatsRepository.create(daoStatsDto);

    if (await this.useDynamoDB()) {
      await this.daoStatsDynamoService.saveDaoStats(daoStats);
      await this.daoStatsRepository.save(daoStats);
    } else {
      await this.daoStatsRepository.save(daoStats);
    }

    return daoStats;
  }

  async getDaoStats(daoId: string): Promise<DaoStatsDto> {
    const timestamp = DateTime.now().startOf('day').toMillis();
    const useDynamoDB = await this.useDynamoDB();

    let dao: Dao | DaoModel;

    if (useDynamoDB) {
      dao = await this.daoDynamoService.getDao(daoId);
    } else {
      dao = await this.daoService.findById(daoId);
    }

    if (!dao) {
      throw new NotFoundException();
    }

    // TODO: get stats from dynamodb
    const bountyCount = await this.bountyService.getDaoActiveBountiesCount(
      daoId,
    );
    // TODO: get stats from dynamodb
    const nftCount = await this.nftTokenService.getAccountTokenCount(daoId);

    return {
      id: buildDaoStatsId(dao.id, timestamp),
      daoId,
      timestamp,
      totalDaoFunds: dao.totalDaoFunds,
      totalProposalCount: dao.totalProposalCount,
      activeProposalCount: dao.activeProposalCount,
      bountyCount,
      nftCount,
    };
  }

  async getLastDaoStats(daoId: string, timestamp?: number): Promise<DaoStats> {
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
    previousDaoStats: DaoStatsDto,
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

    let daoStats: DaoStats[];

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

    let daoStats: DaoStats[];

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

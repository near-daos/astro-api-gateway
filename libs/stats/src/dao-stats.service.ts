import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';

import { DaoService } from '@sputnik-v2/dao';
import { BountyService } from '@sputnik-v2/bounty';
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
  ) {}

  async create(daoStats: DaoStatsDto): Promise<DaoStats> {
    return this.daoStatsRepository.save(daoStats);
  }

  async getDaoStats(daoId: string): Promise<DaoStatsDto> {
    const timestamp = Date.now();
    const dao = await this.daoService.findById(daoId);

    if (!dao) {
      throw new NotFoundException();
    }

    const bountyCount = await this.bountyService.getDaoActiveBountiesCount(
      daoId,
    );
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

  async getLastDaoStats(
    daoId: string,
    untilTimestamp: number,
  ): Promise<DaoStats> {
    return this.daoStatsRepository.findOne({
      where: { daoId, timestamp: LessThan(untilTimestamp) },
      order: { timestamp: 'DESC' },
    });
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
    const daoStats = await this.daoStatsRepository
      .createQueryBuilder('stats')
      .select(['stats.timestamp', `stats.${field}`])
      .where('stats.daoId = :daoId', { daoId })
      .andWhere(`stats.${field} is not NULL`)
      .orderBy('stats.timestamp', 'ASC')
      .getMany();

    return [...daoStats, currentDaoStats].map((stats) => ({
      timestamp: Number(stats.timestamp),
      value: stats[field],
    }));
  }

  async getDaoStatsProposalEntries(
    daoId: string,
  ): Promise<ProposalStatsEntryDto[]> {
    const currentDaoStats = await this.getDaoStats(daoId);
    const daoStats = await this.daoStatsRepository
      .createQueryBuilder('stats')
      .select([
        'stats.timestamp',
        'stats.activeProposalCount',
        'stats.totalProposalCount',
      ])
      .where('stats.daoId = :daoId', { daoId })
      .orderBy('stats.timestamp', 'ASC')
      .getMany();

    return [...daoStats, currentDaoStats].map((stats) => ({
      timestamp: Number(stats.timestamp),
      total: stats.totalProposalCount,
      active: stats.activeProposalCount,
    }));
  }

  getStatsState(currentValue: number, previousValue?: number): StatsStateDto {
    return {
      value: currentValue,
      growth: getGrowth(currentValue, previousValue),
    };
  }
}

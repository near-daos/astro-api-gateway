import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Not, Repository } from 'typeorm';
import { NearApiService } from '@sputnik-v2/near-api';
import { BaseResponseDto, Order } from '@sputnik-v2/common';
import { Dao } from '@sputnik-v2/dao/entities';
import { FeatureFlags, FeatureFlagsService } from '@sputnik-v2/feature-flags';
import {
  DaoModel,
  DynamodbService,
  DynamoEntityType,
  PartialEntity,
  TokenBalanceModel,
  TokenPriceModel,
} from '@sputnik-v2/dynamodb';

import { Token, TokenBalance } from './entities';
import {
  castTokenResponse,
  TokenDto,
  TokenResponse,
  TokensRequest,
} from './dto';
import { castToken, castTokenBalance } from './types';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(TokenBalance)
    private readonly tokenBalanceRepository: Repository<TokenBalance>,
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
    private readonly nearApiService: NearApiService,
    private readonly dynamodbService: DynamodbService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  async useDynamoDB() {
    return this.featureFlagsService.check(FeatureFlags.TokenDynamo);
  }

  async create(tokenDto: TokenDto): Promise<Token> {
    return this.tokenRepository.save(tokenDto);
  }

  async createMultiple(tokenDto: TokenDto[]): Promise<Token[]> {
    return this.tokenRepository.save(tokenDto);
  }

  async loadTokenById(tokenId: string, timestamp: number) {
    const contract = this.nearApiService.getContract('fToken', tokenId);
    const metadata = await contract.ft_metadata();
    const totalSupply = await contract.ft_total_supply();
    await this.create(castToken(tokenId, metadata, totalSupply, timestamp));
  }

  async loadBalanceById(tokenId: string, accountId: string, timestamp: number) {
    const contract = this.nearApiService.getContract('fToken', tokenId);
    const metadata = await contract.ft_metadata();
    const totalSupply = await contract.ft_total_supply();
    const balance = await contract.ft_balance_of({ account_id: accountId });

    await this.dynamodbService.saveTokenBalanceToDao({
      ...castTokenBalance(tokenId, accountId, balance),
      token: castToken(tokenId, metadata, totalSupply, timestamp) as Token,
    });
    await this.tokenBalanceRepository.save(
      castTokenBalance(tokenId, accountId, balance),
    );
  }

  async lastToken(): Promise<Token> {
    return this.tokenRepository.findOne({
      where: { updateTimestamp: Not(IsNull()) },
      order: { updateTimestamp: 'DESC' },
    });
  }

  async getAll(): Promise<Token[]> {
    return this.tokenRepository.find();
  }

  async getMany(
    params: TokensRequest,
  ): Promise<BaseResponseDto<TokenResponse>> {
    const {
      limit = 10,
      offset = 0,
      search,
      orderBy,
      order = Order.DESC,
    } = params;
    const where = [];

    if (search) {
      const searchQuery = ILike(`%${search}%`);
      where.push({ symbol: searchQuery });
      where.push({ name: searchQuery });
    }

    const [data, total] = await this.tokenRepository.findAndCount({
      select: ['id', 'totalSupply', 'decimals', 'icon', 'symbol', 'price'],
      where,
      order: orderBy ? { [orderBy]: order } : {},
      take: limit,
      skip: offset,
    });

    return {
      limit,
      offset,
      total,
      data: data.map(castTokenResponse),
    };
  }

  async getNearToken(): Promise<
    TokenResponse | PartialEntity<TokenPriceModel>
  > {
    if (await this.useDynamoDB()) {
      return this.dynamodbService.getItemByType<TokenPriceModel>(
        'NEAR',
        DynamoEntityType.TokenPrice,
        'NEAR',
      );
    } else {
      return this.tokenRepository.findOne(
        { id: 'NEAR' },
        {
          select: ['id', 'totalSupply', 'decimals', 'icon', 'symbol', 'price'],
        },
      );
    }
  }

  async getNearBalance(daoId: string): Promise<string | undefined> {
    return (
      await this.daoRepository
        .createQueryBuilder('dao')
        .select(['dao.amount'])
        .where(`dao.id = :daoId`, { daoId })
        .getOne()
    )?.amount.toString();
  }

  async tokenBalancesByAccount(
    accountId: string,
  ): Promise<Array<TokenBalance | TokenBalanceModel>> {
    if (await this.useDynamoDB()) {
      return (
        (
          await this.dynamodbService.getItemByType<DaoModel>(
            accountId,
            DynamoEntityType.Dao,
            accountId,
          )
        )?.tokens || []
      );
    } else {
      return this.tokenBalanceRepository.find({
        where: { accountId },
        relations: ['token'],
      });
    }
  }

  async tokensByAccount(accountId: string): Promise<TokenResponse[]> {
    const tokenBalances = await this.tokenBalanceRepository
      .createQueryBuilder('tokenBalance')
      .leftJoinAndSelect('tokenBalance.token', 'token')
      .select([
        'token.id',
        'token.totalSupply',
        'token.decimals',
        'token.icon',
        'token.symbol',
        'token.price',
        'tokenBalance.balance',
      ])
      .where(`tokenBalance.accountId = :accountId`, { accountId })
      .getMany();
    const tokens = tokenBalances.map(({ balance, token }) => ({
      ...token,
      tokenId: token.id,
      balance: balance,
    }));
    const nearToken = (await this.getNearToken()) as TokenResponse;
    nearToken.balance = await this.getNearBalance(accountId);
    nearToken.tokenId = '';

    return [nearToken, ...tokens];
  }
}

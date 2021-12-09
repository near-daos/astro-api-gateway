import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { NearApiService } from '@sputnik-v2/near-api';

import { Token, TokenBalance } from './entities';
import { TokenDto, TokenBalanceDto, TokenResponse } from './dto';

@Injectable()
export class TokenService extends TypeOrmCrudService<Token> {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(TokenBalance)
    private readonly tokenBalanceRepository: Repository<TokenBalance>,
    private readonly nearApiService: NearApiService,
  ) {
    super(tokenRepository);
  }

  async create(tokenDto: TokenDto): Promise<Token> {
    return this.tokenRepository.save(tokenDto);
  }

  async createMultiple(tokenDto: TokenDto[]): Promise<Token[]> {
    return this.tokenRepository.save(tokenDto);
  }

  async createBalance(tokenBalanceDto: TokenBalanceDto): Promise<TokenBalance> {
    return this.tokenBalanceRepository.save(tokenBalanceDto);
  }

  async lastToken(): Promise<Token> {
    return this.tokenRepository.findOne({
      where: { updateTimestamp: Not(IsNull()) },
      order: { updateTimestamp: 'DESC' },
    });
  }

  async getMany(req: CrudRequest): Promise<TokenResponse | Token[]> {
    const tokenResponse = await super.getMany(req);

    const tokens =
      tokenResponse instanceof Array ? tokenResponse : tokenResponse.data;

    (tokenResponse as TokenResponse).data = tokens.map((token) => ({
      ...token,
      tokenId: token.id,
    }));

    return tokenResponse;
  }

  async getNearToken(): Promise<Token> {
    return this.tokenRepository.findOne({ id: 'NEAR' });
  }

  async findTokenBalancesByDaoIds(daoIds: string[]): Promise<TokenBalance[]> {
    return this.tokenBalanceRepository
      .createQueryBuilder('tokenBalance')
      .leftJoinAndSelect('tokenBalance.token', 'token')
      .where(`tokenBalance.accountId = ANY(ARRAY[:...daoIds])`, { daoIds })
      .getMany();
  }

  async tokensByAccount(accountId: string): Promise<Token[]> {
    const tokenBalances = await this.tokenBalanceRepository
      .createQueryBuilder('tokenBalance')
      .leftJoinAndSelect('tokenBalance.token', 'token')
      .where(`tokenBalance.accountId = :accountId`, { accountId })
      .getMany();
    const tokens = tokenBalances.map(({ balance, token }) => ({
      ...token,
      tokenId: token.id,
      balance: balance,
    }));

    const nearToken = await this.getNearToken();
    nearToken.balance = await this.nearApiService.getAccountAmount(accountId);
    nearToken.tokenId = '';

    return [nearToken, ...tokens];
  }
}

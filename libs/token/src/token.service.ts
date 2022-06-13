import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { NearApiService } from '@sputnik-v2/near-api';

import { Token, TokenBalance } from './entities';
import { TokenDto, TokenBalanceDto, TokenResponse } from './dto';
import { castToken, castTokenBalance } from '@sputnik-v2/token/types';

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

  async loadTokenById(tokenId: string, timestamp?: number) {
    const contract = this.nearApiService.getContract('fToken', tokenId);
    const metadata = await contract.ft_metadata();
    const totalSupply = await contract.ft_total_supply();
    await this.create(castToken(tokenId, metadata, totalSupply, timestamp));
  }

  async loadBalanceById(tokenId: string, accountId: string) {
    const contract = this.nearApiService.getContract('fToken', tokenId);
    const balance = await contract.ft_balance_of({ account_id: accountId });
    await this.createBalance(castTokenBalance(tokenId, accountId, balance));
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

  async tokenBalancesByAccount(accountId: string): Promise<TokenBalance[]> {
    return this.tokenBalanceRepository.find({
      where: { accountId },
      relations: ['token'],
    });
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
    nearToken.balance = await this.nearApiService
      .getAccountAmount(accountId)
      .catch(() => {
        throw new BadRequestException(`Account ${accountId} does not exist`);
      });
    nearToken.tokenId = '';

    return [nearToken, ...tokens];
  }
}

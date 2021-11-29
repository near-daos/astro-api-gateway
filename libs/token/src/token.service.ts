import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { CrudRequest } from '@nestjsx/crud';

import { Token, TokenBalance } from './entities';
import { TokenDto, TokenBalanceDto, TokenResponse } from './dto';

@Injectable()
export class TokenService extends TypeOrmCrudService<Token> {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(TokenBalance)
    private readonly tokenBalanceRepository: Repository<TokenBalance>,
  ) {
    super(tokenRepository);
  }

  async create(tokenDto: TokenDto): Promise<Token> {
    return this.tokenRepository.save(tokenDto);
  }

  async createBalance(tokenBalanceDto: TokenBalanceDto): Promise<TokenBalance> {
    return this.tokenBalanceRepository.save(tokenBalanceDto);
  }

  async lastToken(): Promise<Token> {
    return this.tokenRepository.findOne({
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
}

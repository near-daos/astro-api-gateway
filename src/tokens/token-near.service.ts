import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';
import { NearService } from 'src/near/near.service';
import { SputnikDaoService } from 'src/sputnikdao/sputnik.service';
import { ConfigService } from '@nestjs/config';
import PromisePool from '@supercharge/promise-pool';

@Injectable()
export class TokenNearService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly configService: ConfigService,
    private readonly nearService: NearService,
    private readonly sputnikDaoService: SputnikDaoService,
  ) {}

  async tokensByAccount(accountId: string): Promise<Token[]> {
    const { tokenFactoryContractName } = this.configService.get('near');
    const tokenIds = await this.nearService.findLikelyTokens(accountId);
    if (!tokenIds?.length) {
      return [];
    }

    const tokens = await this.findByIds(
      tokenIds.map((id) =>
        id.substring(0, id.indexOf(`.${tokenFactoryContractName}`)),
      ),
    );

    const { results: balances, errors } = await PromisePool.withConcurrency(2)
      .for(tokenIds)
      .process(
        async (token) =>
          await this.sputnikDaoService.getFTBalance(token, accountId),
      );

    return tokens.map((token) => {
      const tokenIdx = tokenIds.indexOf(
        `${token.id}.${tokenFactoryContractName}`,
      );

      return {
        ...token,
        tokenId: tokenIds[tokenIdx],
        balance: balances?.[tokenIdx],
      };
    });
  }

  private async findByIds(ids: string[]): Promise<Token[]> {
    return this.tokenRepository
      .createQueryBuilder('token')
      .where('token.id = ANY(ARRAY[:...ids])', { ids })
      .getMany();
  }
}

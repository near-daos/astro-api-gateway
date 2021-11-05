import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { ConfigService } from '@nestjs/config';

import { Token } from './entities';
import { TokenDto, TokenResponse } from './dto';

@Injectable()
export class TokenService extends TypeOrmCrudService<Token> {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly configService: ConfigService,
  ) {
    super(tokenRepository);
  }

  async create(tokenDto: TokenDto): Promise<Token> {
    const { decimals, icon, name, reference, referenceHash, spec, symbol } =
      tokenDto?.metadata;

    return this.tokenRepository.save({
      ...tokenDto,
      // from token-factory sources: let token_id = args.metadata.symbol.to_ascii_lowercase();
      id: symbol.toLowerCase(),
      decimals,
      icon,
      name,
      reference,
      referenceHash,
      spec,
      symbol,
    });
  }

  async getMany(req: CrudRequest): Promise<TokenResponse | Token[]> {
    const { tokenFactoryContractName } = this.configService.get('near');

    const tokenResponse = await super.getMany(req);

    const tokens =
      tokenResponse instanceof Array ? tokenResponse : tokenResponse.data;

    (tokenResponse as TokenResponse).data = tokens.map((token) => ({
      ...token,
      tokenId: `${token.id}.${tokenFactoryContractName}`,
    }));

    return tokenResponse;
  }
}

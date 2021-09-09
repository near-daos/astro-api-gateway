import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';
import { TokenResponse } from './dto/token-response.dto';
import { TokenDto } from './dto/token.dto';

@Injectable()
export class TokenService extends TypeOrmCrudService<Token> {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {
    super(tokenRepository);
  }

  async create(tokenDto: TokenDto): Promise<Token> {
    const { decimals, icon, name, reference, referenceHash, spec, symbol } =
      tokenDto?.metadata;

    return this.tokenRepository.save({
      ...tokenDto,
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
    return super.getMany(req);
  }
}

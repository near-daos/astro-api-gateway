import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';
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

  async findByIds(ids: string[]): Promise<Token[]> {
    return this.tokenRepository
      .createQueryBuilder('token')
      .where('token.id = ANY(ARRAY[:...ids])', { ids })
      .getMany();
  }
}

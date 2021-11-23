import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Migration } from '..';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from '@sputnik-v2/token';
import { Repository } from 'typeorm';

@Injectable()
export class TokenIdsMigration implements Migration {
  private readonly logger = new Logger(TokenIdsMigration.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  public async migrate(): Promise<void> {
    const { tokenFactoryContractName } = this.configService.get('near');

    this.logger.log('Starting Token Ids migration...');

    this.logger.log('Collecting FT tokens...');
    const tokens = await this.tokenRepository.find();
    const oldTokens = tokens.filter((token) => {
      return token.id.toLowerCase() === String(token.symbol).toLowerCase();
    });

    this.logger.log(`Old Tokens found: ${oldTokens.length}`);

    this.logger.log('Updating ids for old tokens...');
    const updatedTokens = oldTokens.map((token) => ({
      ...token,
      id: `${token.symbol.toLowerCase()}.${tokenFactoryContractName}`,
    }));

    this.logger.log('Saving new Tokens with updated ids...');
    await this.tokenRepository.save(updatedTokens);

    this.logger.log('Purging old Tokens...');
    await this.tokenRepository.remove(oldTokens);
  }
}

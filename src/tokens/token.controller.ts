import { Controller, Get, UseFilters, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  ParsedRequest,
  CrudRequest,
  CrudRequestInterceptor,
} from '@nestjsx/crud';

import { HttpCacheInterceptor } from 'src/common';
import { EntityQuery } from 'src/common/dto/EntityQuery';
import { TokenService } from './token.service';
import { TokenResponse } from './dto/token-response.dto';
import { Token } from './entities/token.entity';
import { QueryFailedErrorFilter } from 'src/common/filters/query-failed-error.filter';
import { NFTTokenCrudRequestInterceptor } from './interceptors/nft-token-crud.interceptor';
import { NFTToken } from './entities/nft-token.entity';
import { NFTTokenResponse } from './dto/nft-token-response.dto';
import { NFTTokenService } from './nft-token.service';

@ApiTags('Token')
@Controller('/tokens')
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly nftTokenService: NFTTokenService,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'List of aggregated Fungible Tokens',
    type: TokenResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseInterceptors(HttpCacheInterceptor, CrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @ApiQuery({ type: EntityQuery })
  @Get('/')
  async tokens(
    @ParsedRequest() query: CrudRequest,
  ): Promise<Token[] | TokenResponse> {
    return await this.tokenService.getMany(query);
  }

  @ApiResponse({
    status: 200,
    description: 'List of aggregated Non-Fungible Tokens',
    type: TokenResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseInterceptors(HttpCacheInterceptor, NFTTokenCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @ApiQuery({ type: EntityQuery })
  @Get('/nfts')
  async nfts(
    @ParsedRequest() query: CrudRequest,
  ): Promise<NFTToken[] | NFTTokenResponse> {
    return await this.nftTokenService.getMany(query);
  }
}

import {
  Controller,
  Get,
  Param,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ParsedRequest,
  CrudRequest,
  CrudRequestInterceptor,
} from '@nestjsx/crud';
import {
  HttpCacheInterceptor,
  EntityQuery,
  QueryFailedErrorFilter,
  FindAccountParams,
} from '@sputnik-v2/common';
import {
  TokenService,
  TokenResponse,
  Token,
  NFTToken,
  NFTTokenResponse,
  NFTTokenService,
  NFTTokenDto,
} from '@sputnik-v2/token';

import { NFTTokenCrudRequestInterceptor } from './interceptors/nft-token-crud.interceptor';
import { TokenNearService } from './token-near.service';

@ApiTags('Token')
@Controller('/tokens')
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly nftTokenService: NFTTokenService,
    private readonly tokenNearService: TokenNearService,
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

  @ApiParam({
    name: 'accountId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of Fungible Tokens by Account',
    type: Token,
  })
  @ApiBadRequestResponse({ description: 'Invalid Dao ID' })
  @Get('/account-tokens/:accountId')
  async tokensByDao(
    @Param() { accountId }: FindAccountParams,
  ): Promise<Token[]> {
    return await this.tokenService.tokensByAccount(accountId);
  }

  @ApiResponse({
    status: 200,
    description: 'List of aggregated Non-Fungible Tokens',
    type: NFTTokenResponse,
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

  @ApiParam({
    name: 'accountId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of Non-Fungible Tokens by Account',
    type: NFTTokenDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid Dao ID' })
  @Get('/nfts/account-nfts/:accountId')
  async nftsByDao(
    @Param() { accountId }: FindAccountParams,
  ): Promise<NFTTokenDto[]> {
    return await this.tokenNearService.nftsByAccount(accountId);
  }
}

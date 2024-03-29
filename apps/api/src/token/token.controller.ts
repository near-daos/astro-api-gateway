import {
  Controller,
  Get,
  Param,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ParsedRequest, CrudRequest } from '@nestjsx/crud';
import { Span } from 'nestjs-ddtrace';

import {
  HttpCacheInterceptor,
  EntityQuery,
  QueryFailedErrorFilter,
  FindAccountParams,
  FindOneParams,
  ValidAccountGuard,
  BaseResponseDto,
} from '@sputnik-v2/common';
import {
  TokenService,
  TokenResponse,
  Token,
  NFTToken,
  NFTTokenResponse,
  NFTTokenService,
  TokensRequest,
} from '@sputnik-v2/token';
import { AssetsNftEvent } from '@sputnik-v2/near-indexer';

import { NFTTokenCrudRequestInterceptor } from './interceptors/nft-token-crud.interceptor';
import { TokensPageResponseDto } from './dto/tokens-page-response.dto';

@Span()
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
    type: TokensPageResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseInterceptors(HttpCacheInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @Get('/')
  async tokens(
    @Query() query: TokensRequest,
  ): Promise<BaseResponseDto<TokenResponse>> {
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
  @ApiNotFoundResponse({
    description: 'Account does not exist',
  })
  @UseGuards(ValidAccountGuard)
  @Get('/account-tokens/:accountId')
  async tokensByDao(
    @Param() { accountId }: FindAccountParams,
  ): Promise<TokenResponse[]> {
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
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of Non-Fungible Token Events',
    type: AssetsNftEvent,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'No NFT found',
  })
  @UseInterceptors(HttpCacheInterceptor, NFTTokenCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @Get('/nfts/:id/events')
  async nftEvents(@Param() { id }: FindOneParams): Promise<AssetsNftEvent[]> {
    return await this.nftTokenService.getTokenEvents(id);
  }
}

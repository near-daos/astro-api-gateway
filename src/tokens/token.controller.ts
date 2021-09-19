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

@ApiTags('Token')
@Controller('/tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

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
}

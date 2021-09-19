import {
  Controller,
  Get,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ParsedRequest, CrudRequest } from '@nestjsx/crud';

import { HttpCacheInterceptor } from 'src/common';
import { TransactionResponse } from './dto/transaction-response.dto';
import { QueryFailedErrorFilter } from 'src/common/filters/query-failed-error.filter';
import { Transaction } from 'src/near';
import { TransactionService } from './transaction.service';
import { TransactionQuery } from 'src/common/dto/TransactionQuery';
import { TransactionCrudRequestInterceptor } from './interceptors/transaction-crud.interceptor';
import { TransferCrudRequestInterceptor } from './interceptors/transfer-crud.interceptor';

@ApiTags('Transactions')
@Controller('/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiResponse({
    status: 200,
    description: 'List of aggregated Transactions',
    type: TransactionResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseInterceptors(HttpCacheInterceptor, TransactionCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @ApiQuery({ type: TransactionQuery })
  @Get('/')
  async transactions(
    @ParsedRequest() query: CrudRequest,
  ): Promise<Transaction[] | TransactionResponse> {
    return await this.transactionService.getMany(query);
  }

  @ApiResponse({
    status: 200,
    description: 'List of aggregated Transactions of kind TRANSFER',
    type: TransactionResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseInterceptors(HttpCacheInterceptor, TransferCrudRequestInterceptor)
  @UseFilters(new QueryFailedErrorFilter())
  @ApiQuery({ type: TransactionQuery })
  @Get('/transfers')
  async transfers(
    @ParsedRequest() query: CrudRequest,
  ): Promise<Transaction[] | TransactionResponse> {
    return await this.transactionService.getMany(query);
  }
}

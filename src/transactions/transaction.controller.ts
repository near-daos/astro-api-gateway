import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { ParsedRequest, CrudRequest } from '@nestjsx/crud';

import { HttpCacheInterceptor } from 'src/common';
import { TransactionResponse } from './dto/transaction-response.dto';
import { QueryFailedErrorFilter } from 'src/common/filters/query-failed-error.filter';
import { Transaction } from 'src/near';
import { TransactionService } from './transaction.service';
import { TransactionQuery } from 'src/common/dto/TransactionQuery';
import { TransactionCrudRequestInterceptor } from './interceptors/transaction-crud.interceptor';
import { TransferCrudRequestInterceptor } from './interceptors/transfer-crud.interceptor';
import { WalletCallbackParams } from 'src/common/dto/WalletCallbackParams';
import { ConfigService } from '@nestjs/config';
import { SputnikTransactionService } from './sputnik-transaction.service';

@ApiTags('Transactions')
@Controller('/transactions')
export class TransactionController {
  constructor(
    private readonly configService: ConfigService,
    private readonly transactionService: TransactionService,
    private readonly sputnikTransactionService: SputnikTransactionService,
  ) {}

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

  @Get('/wallet/callback/:accountId')
  async success(
    @Param() { accountId },
    @Query() callback: WalletCallbackParams,
    @Res() res: Response,
  ): Promise<any> {
    const { walletCallbackUrl } = this.configService.get('api');
    const { transactionHashes, errorCode } = callback;

    if (errorCode) {
      //TODO: handle error callback - not so much info there
      // errorCode: 'userRejected'
      // errorMessage: 'User%20rejected%20transaction'

      res.status(200).send();

      return;
    }

    if (transactionHashes && transactionHashes.length) {
      await Promise.all(
        transactionHashes
          .split(',')
          .map((hash) =>
            this.sputnikTransactionService.unfoldTransaction(hash, accountId),
          ),
      );
    }

    if (walletCallbackUrl) {
      res.redirect(walletCallbackUrl);

      return;
    }

    res.status(200).send();
  }
}

import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  Res,
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
import { Response } from 'express';
import querystring, { ParsedUrlQueryInput } from 'querystring';
import { ConfigService } from '@nestjs/config';
import { ParsedRequest, CrudRequest } from '@nestjsx/crud';
import {
  HttpCacheInterceptor,
  QueryFailedErrorFilter,
  TransactionQuery,
  WalletCallbackParams,
  FindAccountParams,
  NearDBConnectionErrorFilter,
} from '@sputnik-v2/common';
import {
  TransactionResponse,
  TransactionService,
} from '@sputnik-v2/transaction';
import {
  Receipt,
  Transaction,
  NearIndexerService,
} from '@sputnik-v2/near-indexer';

import { TransactionCrudRequestInterceptor } from './interceptors/transaction-crud.interceptor';
import { TransferCrudRequestInterceptor } from './interceptors/transfer-crud.interceptor';

@ApiTags('Transactions')
@Controller('/transactions')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly transactionService: TransactionService,
    private readonly nearIndexerService: NearIndexerService,
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

  @ApiResponse({
    status: 200,
    description: 'List of Receipts by Account',
    type: Receipt,
  })
  @ApiParam({
    name: 'accountId',
    type: String,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @UseInterceptors(HttpCacheInterceptor)
  @UseFilters(new NearDBConnectionErrorFilter())
  @Get('/receipts/account-receipts/:accountId')
  async receiptsByAccount(
    @Param() { accountId }: FindAccountParams,
  ): Promise<Receipt[]> {
    return await this.nearIndexerService.receiptsByAccount(accountId);
  }

  @Get('/wallet/callback/:accountId')
  async success(
    @Param() { accountId },
    @Query() callbackParams: WalletCallbackParams,
    @Res() res: Response,
  ): Promise<any> {
    const { walletCallbackUrl } = this.configService.get('api');
    const { transactionHashes, errorCode } = callbackParams;
    const queryString = querystring.stringify(
      callbackParams as any as ParsedUrlQueryInput,
    );

    if (errorCode) {
      res.redirect(`${walletCallbackUrl}?${queryString}`);

      return;
    }

    if (transactionHashes && transactionHashes.length) {
      try {
        await Promise.all(
          transactionHashes
            .split(',')
            .map((hash) =>
              this.transactionService.walletCallback(hash, accountId),
            ),
        );
      } catch (e) {
        this.logger.error(e);
      }
    }

    if (walletCallbackUrl) {
      res.redirect(`${walletCallbackUrl}?${queryString}`);

      return;
    }

    res.status(200).send();
  }
}

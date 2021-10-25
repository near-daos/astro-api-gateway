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

import { ParsedRequest, CrudRequest } from '@nestjsx/crud';

import { HttpCacheInterceptor } from 'src/common';
import { TransactionResponse } from './dto/transaction-response.dto';
import { QueryFailedErrorFilter } from 'src/common/filters/query-failed-error.filter';
import { Receipt, Transaction } from 'src/near';
import { TransactionService } from './transaction.service';
import { TransactionQuery } from 'src/common/dto/TransactionQuery';
import { TransactionCrudRequestInterceptor } from './interceptors/transaction-crud.interceptor';
import { TransferCrudRequestInterceptor } from './interceptors/transfer-crud.interceptor';
import { WalletCallbackParams } from 'src/common/dto/WalletCallbackParams';
import { ConfigService } from '@nestjs/config';
import { TransactionCallbackService } from './transaction-callback.service';
import { FindAccountParams } from 'src/common/dto/FindAccountParams';
import { NearService } from 'src/near/near.service';
import { NearDBConnectionErrorFilter } from 'src/common/filters/near-db-connection-error.filter';

@ApiTags('Transactions')
@Controller('/transactions')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly transactionService: TransactionService,
    private readonly transactionCallbackService: TransactionCallbackService,
    private readonly nearService: NearService,
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
    return await this.nearService.receiptsByAccount(accountId);
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
              this.transactionCallbackService.unfoldTransaction(
                hash,
                accountId,
              ),
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

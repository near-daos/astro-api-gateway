import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  DaoFundsReceiptDto,
  DaoFundsReceiptService,
  DaoFundsTokenReceiptDto,
  DaoFundsTokenReceiptService,
} from '@sputnik-v2/dao-funds';
import { DynamoPaginatedResponse } from '@sputnik-v2/dynamodb';
import {
  DynamoPaginatedResponseDto,
  DynamoPaginationDto,
} from '@sputnik-v2/dynamodb/dto';
import { Response } from 'express';
import querystring, { ParsedUrlQueryInput } from 'querystring';
import { ConfigService } from '@nestjs/config';
import { Span } from 'nestjs-ddtrace';

import {
  HttpCacheInterceptor,
  WalletCallbackParams,
  FindAccountParams,
  NearDBConnectionErrorFilter,
  AccountTokenParams,
  ValidAccountGuard,
} from '@sputnik-v2/common';
import { TransactionService } from '@sputnik-v2/transaction';
import { Receipt, NearIndexerService } from '@sputnik-v2/near-indexer';

@Span()
@ApiTags('Transactions')
@Controller('/transactions')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly transactionService: TransactionService,
    private readonly nearIndexerService: NearIndexerService,
    private readonly daoFundsReceiptService: DaoFundsReceiptService,
    private readonly daoFundsTokenReceiptService: DaoFundsTokenReceiptService,
  ) {}

  @ApiOperation({
    summary: 'List of Receipts by Account V1',
  })
  @ApiOkResponse({
    type: [Receipt],
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @ApiNotFoundResponse({
    description: 'Account does not exist',
  })
  @UseGuards(ValidAccountGuard)
  @UseInterceptors(HttpCacheInterceptor)
  @UseFilters(new NearDBConnectionErrorFilter())
  @Get('/receipts/account-receipts/:accountId')
  async receiptsByAccount(
    @Param() { accountId }: FindAccountParams,
  ): Promise<Receipt[]> {
    return this.nearIndexerService.receiptsByAccount(accountId);
  }

  @ApiOperation({
    summary: 'List of Receipts by Account and Fungible Token V1',
  })
  @ApiOkResponse({
    type: [Receipt],
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @ApiNotFoundResponse({
    description: 'Account does not exist',
  })
  @UseGuards(ValidAccountGuard)
  @UseInterceptors(HttpCacheInterceptor)
  @UseFilters(new NearDBConnectionErrorFilter())
  @Get('/receipts/account-receipts/:accountId/tokens/:tokenId')
  async receiptsByAccountToken(
    @Param() { accountId, tokenId }: AccountTokenParams,
  ): Promise<Receipt[]> {
    return this.nearIndexerService.receiptsByAccountToken(accountId, tokenId);
  }

  @Version('2')
  @ApiOperation({
    summary: 'List of Receipts by Account V2',
  })
  @ApiOkResponse({
    type: DynamoPaginatedResponseDto(DaoFundsReceiptDto),
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @ApiNotFoundResponse({
    description: 'Account does not exist',
  })
  @UseGuards(ValidAccountGuard)
  @UseInterceptors(HttpCacheInterceptor)
  @Get('/receipts/account-receipts/:accountId')
  async receiptsByAccountV2(
    @Param() { accountId }: FindAccountParams,
    @Query() pagination: DynamoPaginationDto,
  ): Promise<DynamoPaginatedResponse<DaoFundsReceiptDto>> {
    return this.daoFundsReceiptService.getByDaoId(accountId, pagination);
  }

  @Version('2')
  @ApiOperation({
    summary: 'List of Receipts by Account and Fungible Token V2',
  })
  @ApiOkResponse({
    type: DynamoPaginatedResponseDto(DaoFundsTokenReceiptDto),
  })
  @ApiBadRequestResponse({
    description: 'Bad Request Response based on the query params set',
  })
  @ApiNotFoundResponse({
    description: 'Account does not exist',
  })
  @UseGuards(ValidAccountGuard)
  @UseInterceptors(HttpCacheInterceptor)
  @UseFilters(new NearDBConnectionErrorFilter())
  @Get('/receipts/account-receipts/:accountId/tokens/:tokenId')
  async receiptsByAccountTokenV2(
    @Param() { accountId, tokenId }: AccountTokenParams,
    @Query() pagination: DynamoPaginationDto,
  ): Promise<DynamoPaginatedResponse<DaoFundsTokenReceiptDto>> {
    return this.daoFundsTokenReceiptService.getByDaoIdAndTokenId(
      accountId,
      tokenId,
      pagination,
    );
  }

  @ApiOperation({
    summary: 'Wallet transaction callback',
  })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiNotFoundResponse({
    description: 'Account does not exist',
  })
  @UseGuards(ValidAccountGuard)
  @Get('/wallet/callback/:accountId')
  async success(
    @Param() { accountId },
    @Query() callbackParams: WalletCallbackParams,
    @Res() res: Response,
  ): Promise<any> {
    const { walletCallbackUrl } = this.configService.get('api');
    const { transactionHashes, errorCode, noRedirect } = callbackParams;
    const query = {
      ...callbackParams,
    } as any as ParsedUrlQueryInput;

    if (!noRedirect && errorCode) {
      res.redirect(`${walletCallbackUrl}?${querystring.stringify(query)}`);

      return;
    }

    if (transactionHashes && transactionHashes.length) {
      try {
        const results = await Promise.all(
          transactionHashes
            .split(',')
            .map((hash) =>
              this.transactionService.walletCallback(hash, accountId),
            ),
        );
        query.results = JSON.stringify(results.flat());
      } catch (e) {
        this.logger.error(e);
      }
    }

    if (!noRedirect && walletCallbackUrl) {
      res.redirect(`${walletCallbackUrl}?${querystring.stringify(query)}`);

      return;
    }

    res.status(200).send();
  }
}

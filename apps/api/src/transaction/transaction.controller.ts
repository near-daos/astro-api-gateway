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
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import querystring, { ParsedUrlQueryInput } from 'querystring';
import { ConfigService } from '@nestjs/config';
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
    return await this.nearIndexerService.receiptsByAccount(accountId);
  }

  @ApiResponse({
    status: 200,
    description: 'List of Receipts by Account and FT Token',
    type: Receipt,
  })
  @ApiParam({
    name: 'accountId',
    type: String,
  })
  @ApiParam({
    name: 'tokenId',
    type: String,
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
    return await this.nearIndexerService.receiptsByAccountToken(
      accountId,
      tokenId,
    );
  }

  @ApiParam({
    name: 'accountId',
    type: String,
  })
  @ApiResponse({
    status: 200,
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
    const queryString = querystring.stringify(
      callbackParams as any as ParsedUrlQueryInput,
    );

    if (!noRedirect && errorCode) {
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

    if (!noRedirect && walletCallbackUrl) {
      res.redirect(`${walletCallbackUrl}?${queryString}`);

      return;
    }

    res.status(200).send();
  }
}

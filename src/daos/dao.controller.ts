import { 
  BadRequestException,
  Body,
  CacheInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { Response } from 'express';
import { AccountAccessGuard, FindOneParams, PagingQuery } from 'src/common';
import { DaoService } from './dao.service';
import { DaoDto } from './dto/dao.dto';
import { Dao } from './entities/dao.entity';
import { WalletCallbackParams } from 'src/common/dto/WalletCallbackParams';
import { DaoGuard } from 'src/common/guards/dao.guard';

@ApiTags('DAO')
@Controller('/daos')
export class DaoController {
  constructor(
    private readonly daoService: DaoService
  ) { }

  @ApiResponse({
    status: 201,
    description: 'Created'
  })
  @ApiForbiddenResponse({
    description: 'Account <accountId> identity is invalid - public key / bad signature/public key size / Invalid signature / DAO already exists'
  })
  @UseGuards(AccountAccessGuard, DaoGuard)
  @Post('/')
  async create(@Body() createDaoDto: DaoDto): Promise<Dao> {
    return await this.daoService.createDraft(createDaoDto);
  }

  @ApiResponse({ 
    status: 200, 
    description: 'List of aggregated Sputnik DAOs', 
    type: Dao, 
    isArray: true 
  })
  @ApiBadRequestResponse({ 
    description: 'limit/offset must be a number conforming to the specified constraints' 
  })
  @UseInterceptors(CacheInterceptor)
  @Get('/')
  async daos(@Query() query: PagingQuery): Promise<Dao[]> {
    return await this.daoService.find(query);
  }

  @ApiParam({
    name: 'id',
    type: String
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sputnik DAO', 
    type: Dao 
  })
  @ApiBadRequestResponse({ description: 'Invalid Dao ID' })
  @UseInterceptors(CacheInterceptor)
  @Get('/:id')
  async daoById(@Param() { id }: FindOneParams): Promise<Dao> {
    const dao: Dao = await this.daoService.findOne(id);

    if (!dao) {
      throw new BadRequestException('Invalid Dao ID')
    }

    return dao;
  }

  //TODO: Need to garbage collect Daos that in Pending state for a long time
  @Get('/wallet/callback')
  async success(
    @Query() callback: WalletCallbackParams,
    @Res() res: Response
  ): Promise<any> {
    const {
      transactionHashes,
      redirectUrl,
      errorCode,
      errorMessage
    } = callback;

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
          .map(hash => this.daoService.processTransactionCallback(hash))
      );
    }

    if (redirectUrl) {
      res.redirect(redirectUrl);

      return;
    }

    res.status(200).send();
  }
}

import { Span } from 'nestjs-ddtrace';

import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AccountResponseDto, AccountsResponse } from './dto/account.dto';
import { FindOneParams } from '../common/dto/find-one.params';
import { AccountService } from './account.service';
import { SearchDto } from '../common/dto/search.dto';

@Span()
@ApiTags('Accounts')
@Controller('/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiResponse({
    status: 200,
    description: 'List of Accounts',
    type: AccountsResponse,
  })
  @Get('/')
  getAccounts(@Query() query: SearchDto): Promise<AccountsResponse> {
    return this.accountService.getAll(query);
  }

  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Account by ID',
    type: AccountResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Account <id> does not exist',
  })
  @Get('/:id')
  getAccount(@Param() { id }: FindOneParams): Promise<AccountResponseDto> {
    // return this.accountService.findOne(id, query);
    return this.accountService.findOne(id);
  }
}

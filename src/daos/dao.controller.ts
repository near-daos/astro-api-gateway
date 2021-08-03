import { 
  BadRequestException,
  CacheInterceptor,
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { FindOneParams, PagingQuery } from 'src/common';
import { DaoService } from './dao.service';
import { Dao } from './entities/dao.entity';

@ApiTags('DAO')
@Controller()
@UseInterceptors(CacheInterceptor)
export class DaoController {
  constructor(
    private readonly daoService: DaoService
  ) { }

  @ApiQuery({ 
    name: 'query', 
    type: PagingQuery 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of aggregated Sputnik DAOs', 
    type: Dao, 
    isArray: true 
  })
  @ApiBadRequestResponse({ 
    description: 'limit/offset must be a number conforming to the specified constraints' 
  })
  @Get('/daos')
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
  @Get('/daos/:id')
  async daoById(@Param() { id }: FindOneParams): Promise<Dao> {
    const dao: Dao = await this.daoService.findOne(id);

    if (!dao) {
      throw new BadRequestException('Invalid Dao ID')
    }

    return dao;
  }
}

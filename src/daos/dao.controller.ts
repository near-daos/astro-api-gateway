import { 
  BadRequestException,
  Controller,
  Get,
  Param,
  Query
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { FindOneParams, PagingQuery } from 'src/common';
import { DaoService } from './dao.service';
import { Dao } from './entities/dao.entity';

@Controller()
export class DaoController {
  constructor(
    private readonly daoService: DaoService
  ) { }

  @ApiExcludeEndpoint()
  @Get('/daos')
  async daos(@Query() { limit, offset }: PagingQuery): Promise<any[]> {
    return await this.daoService.find({ take: limit, skip: offset })
  }

  @ApiExcludeEndpoint()
  @Get('/daos/:id')
  async daoById(@Param() { id }: FindOneParams): Promise<Dao> {
    const dao: Dao = await this.daoService.findOne(id);

    if (!dao) {
      throw new BadRequestException('Invalid Dao ID')
    }

    return dao;
  }
}

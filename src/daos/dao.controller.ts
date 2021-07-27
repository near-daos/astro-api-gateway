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
  async daos(@Query() query: PagingQuery): Promise<Dao[]> {
    return await this.daoService.find(query);
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

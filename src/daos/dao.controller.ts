import { 
  BadRequestException,
  CacheInterceptor,
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors
} from '@nestjs/common';
import { FindOneParams, PagingQuery } from 'src/common';
import { DaoService } from './dao.service';
import { Dao } from './entities/dao.entity';

@Controller()
@UseInterceptors(CacheInterceptor)
export class DaoController {
  constructor(
    private readonly daoService: DaoService
  ) { }

  @Get('/daos')
  async daos(@Query() query: PagingQuery): Promise<Dao[]> {
    return await this.daoService.find(query);
  }

  @Get('/daos/:id')
  async daoById(@Param() { id }: FindOneParams): Promise<Dao> {
    const dao: Dao = await this.daoService.findOne(id);

    if (!dao) {
      throw new BadRequestException('Invalid Dao ID')
    }

    return dao;
  }
}

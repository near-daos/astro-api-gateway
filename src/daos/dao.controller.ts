import { 
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { DaoService } from './dao.service';
import { Dao } from './entities/dao.entity';

@Controller()
export class DaoController {
  constructor(
    private readonly daoService: DaoService
  ) { }

  @ApiExcludeEndpoint()
  @Get('/daos')
  async daos(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number
  ): Promise<any[]> {
    return await this.daoService.find({ take: limit, skip: offset })
  }

  @ApiExcludeEndpoint()
  @Get('/daos/:id')
  async daoById(@Param('id') id: string): Promise<Dao> {
    const dao: Dao = await this.daoService.findOne(id);

    if (!dao) {
      throw new BadRequestException('Invalid Dao ID')
    }

    return dao;
  }
}

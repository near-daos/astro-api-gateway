import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { DaoService } from './dao.service';

@Controller()
export class DaoController {
  constructor(
    private readonly daoService: DaoService
  ) { }

  @ApiExcludeEndpoint()
  @Get('/daos')
  async daos(): Promise<any[]> {
    return await this.daoService.findAll()
  }
}

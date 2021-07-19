import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { DaoService } from './daos/dao.service';

@Controller()
export class AppController {
  constructor(private readonly daoService: DaoService) {}

  @ApiExcludeEndpoint()
  @Get()
  main(): string {
    return 'Sputnik v1 API v1.0';
  }

  @ApiExcludeEndpoint()
  @Get('/daos')
  async daos(): Promise<any[]> {
    return await this.daoService.findAll()
  }
}

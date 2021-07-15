import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { NearService } from './near/near.service';

@Controller()
export class AppController {
  constructor(private readonly nearService: NearService) {}

  @ApiExcludeEndpoint()
  @Get()
  main(): string {
    return 'Sputnik v1 API v1.0';
  }

  @ApiExcludeEndpoint()
  @Get('/daos')
  async daos(): Promise<any[]> {
    return await this.nearService.getDaoList()
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { DaoService } from './daos/dao.service';
import { ProposalService } from './proposals/proposal.service';

@Controller()
export class AppController {
  constructor(
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService
  ) { }

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

  @ApiExcludeEndpoint()
  @Get('/proposals')
  async proposals(): Promise<any[]> {
    return await this.proposalService.findAll()
  }
}

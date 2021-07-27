import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { ProposalService } from './proposal.service';

@Controller()
export class ProposalController {
  constructor(
    private readonly proposalService: ProposalService
  ) { }

  @ApiExcludeEndpoint()
  @Get('/proposals')
  async proposals(): Promise<any[]> {
    return await this.proposalService.findAll()
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ProposalTemplate } from '@sputnik-v2/proposal-template/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { ProposalTemplateDto } from '@sputnik-v2/proposal-template/dto';
import { buildTemplateId } from '@sputnik-v2/utils';
import { DaoService } from '@sputnik-v2/dao';

@Injectable()
export class ProposalTemplateService extends TypeOrmCrudService<ProposalTemplate> {
  private readonly logger = new Logger(ProposalTemplateService.name);

  constructor(
    @InjectRepository(ProposalTemplate)
    private readonly proposalTemplateRepository: Repository<ProposalTemplate>,
    private readonly daoService: DaoService,
  ) {
    super(proposalTemplateRepository);
  }

  async create(
    proposalTemplate: ProposalTemplateDto,
  ): Promise<ProposalTemplate> {
    return this.proposalTemplateRepository.save({
      id: buildTemplateId(proposalTemplate.daoId),
      ...proposalTemplate,
    });
  }

  async update(
    id: string,
    proposalTemplate: ProposalTemplateDto,
  ): Promise<ProposalTemplate> {
    return this.proposalTemplateRepository.save({ id, ...proposalTemplate });
  }

  async findDaoProposalTemplates(daoId: string): Promise<ProposalTemplate[]> {
    const dao = await this.daoService.findById(daoId);

    if (!dao) {
      throw new NotFoundException(`DAO does not exist: ${daoId}`);
    }

    return this.proposalTemplateRepository.find({ daoId });
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.proposalTemplateRepository.delete({ id });
  }
}
